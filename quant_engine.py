"""
Quant Engine - Empirical Quantitative Risk Terminal
===================================================
A comprehensive econometric risk engine implementing:
- Module 1: Risk-Return Profiling (Log returns, Sharpe, Sortino, Downside Semi-Deviation, VaR 95%, CVaR 95%)
- Module 2: Dynamic Volatility Forecasting (GARCH(1,1), EGARCH(1,1), GJR-GARCH(1,1,1) with leverage gamma and persistence)
- Module 3: Systemic Volatility Spillover (Diebold-Yilmaz 2012 Generalized FEVD, To-Others, From-Others, SSI)
- Module 4: Quantitative Security Scoring (QSS multi-factor conviction ranking)
- Module 5: Markowitz Optimization (MVO) & Walk-Forward Rebalancing Backtest
"""

from __future__ import annotations

import warnings
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
import scipy.optimize as sco
from scipy import stats

# Suppress convergence and optimization warnings when running automated calibrations
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

try:
    from arch import arch_model
except ImportError:
    arch_model = None

try:
    from statsmodels.tsa.api import VAR
except ImportError:
    VAR = None

try:
    import yfinance as yf
except ImportError:
    yf = None


# ==============================================================================
# 0. DATA INGESTION & SYNTHETIC DATA GENERATION
# ==============================================================================

def generate_synthetic_market_data(
    tickers: Optional[List[str]] = None,
    n_days: int = 756,  # ~3 years of trading days
    seed: int = 42
) -> pd.DataFrame:
    """
    Generate realistic multi-asset price time series using correlated
    Geometric Brownian Motion with GARCH-like stochastic volatility clustering.
    """
    np.random.seed(seed)
    if tickers is None:
        tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "JPM", "GS", "SPY"]

    n_assets = len(tickers)
    # Correlation matrix with systemic co-movement
    base_corr = 0.45
    corr_matrix = np.full((n_assets, n_assets), base_corr)
    np.fill_diagonal(corr_matrix, 1.0)
    # Add sector clustering (Tech vs Financials)
    for i in range(min(5, n_assets)):
        for j in range(min(5, n_assets)):
            if i != j:
                corr_matrix[i, j] += 0.25
    chol = np.linalg.cholesky(corr_matrix)

    # Annualized drift and baseline volatility
    annual_drifts = np.array([0.18, 0.16, 0.14, 0.15, 0.28, 0.11, 0.12, 0.10][:n_assets])
    annual_vols = np.array([0.24, 0.22, 0.23, 0.26, 0.42, 0.19, 0.22, 0.15][:n_assets])
    daily_drifts = annual_drifts / 252.0
    daily_vols = annual_vols / np.sqrt(252.0)

    daily_returns = np.zeros((n_days, n_assets))
    # Simulate with time-varying GARCH volatility clustering
    current_vol = daily_vols.copy()
    omega = 0.05 * (daily_vols ** 2)
    alpha = 0.08
    beta = 0.88

    for t in range(n_days):
        z = np.random.normal(0, 1, n_assets)
        correlated_z = chol @ z
        shock = current_vol * correlated_z
        daily_returns[t] = daily_drifts + shock
        # Update conditional volatility
        current_vol = np.sqrt(omega + alpha * (shock ** 2) + beta * (current_vol ** 2))

    # Construct price series from returns
    prices = 100.0 * np.exp(np.cumsum(daily_returns, axis=0))
    date_index = pd.date_range(end=pd.Timestamp.today().normalize(), periods=n_days, freq="B")
    return pd.DataFrame(prices, index=date_index, columns=tickers)


def fetch_market_data(
    tickers: List[str],
    start_date: str = "2021-01-01",
    end_date: Optional[str] = None
) -> pd.DataFrame:
    """
    Fetch historical adjusted close prices using yfinance with automated fallback
    to realistic correlated stochastic volatility data if network is unavailable.
    """
    if yf is not None:
        try:
            raw_data = yf.download(
                tickers,
                start=start_date,
                end=end_date,
                progress=False,
                auto_adjust=True
            )
            if isinstance(raw_data, pd.DataFrame) and not raw_data.empty:
                if "Close" in raw_data.columns:
                    close_data = raw_data["Close"]
                else:
                    close_data = raw_data
                close_data = close_data.dropna(how="all").ffill().bfill()
                if isinstance(close_data, pd.Series):
                    close_data = close_data.to_frame(tickers[0])
                if len(close_data) > 50:
                    return close_data
        except Exception:
            pass

    return generate_synthetic_market_data(tickers=tickers)


# ==============================================================================
# MODULE 1: RISK-RETURN PROFILING
# ==============================================================================

def compute_log_returns(prices: Union[pd.Series, pd.DataFrame]) -> Union[pd.Series, pd.DataFrame]:
    """
    Compute continuously compounded log returns:
        r_t = ln(P_t / P_{t-1})
    """
    log_returns = np.log(prices / prices.shift(1)).dropna()
    return log_returns


def compute_risk_return_profile(
    returns: Union[pd.Series, pd.DataFrame],
    rf: float = 0.0,
    periods_per_year: int = 252,
    alpha: float = 0.05
) -> pd.DataFrame:
    """
    Compute comprehensive econometric risk-return metrics for single or multiple assets.

    Metrics include:
    - Expected Return (Annualized Log Return Mean: mu * N)
    - Annualized Volatility (sigma * sqrt(N))
    - Sharpe Ratio: (mu_ann - rf) / sigma_ann
    - Downside Semi-Deviation: sqrt( (1/T) * sum(min(r_t - rf/N, 0)^2) ) * sqrt(N)
    - Sortino Ratio: (mu_ann - rf) / downside_semi_deviation
    - Parametric 95% 1-Day VaR: -(mu_d + z_alpha * sigma_d)
    - Historical 95% 1-Day VaR: -quantile(r, alpha)
    - 95% Conditional VaR (Expected Shortfall / CVaR): -E[r | r <= -VaR_hist]
    - Skewness and Excess Kurtosis
    - Maximum Drawdown (MDD)
    - Calmar Ratio: mu_ann / abs(MDD)

    Parameters:
    -----------
    returns : pd.Series or pd.DataFrame of log returns
    rf : Annualized risk-free rate (e.g., 0.02 for 2.0%)
    periods_per_year : Number of trading periods per year (default 252 for daily)
    alpha : Significance level for VaR and CVaR (default 0.05 for 95% confidence)

    Returns:
    --------
    pd.DataFrame containing the risk-return profile.
    """
    if isinstance(returns, pd.Series):
        df_returns = returns.to_frame()
    else:
        df_returns = returns.copy()

    records = []
    z_score = stats.norm.ppf(alpha)  # ~ -1.64485 for alpha=0.05

    for col in df_returns.columns:
        r = df_returns[col].dropna()
        n_obs = len(r)
        if n_obs < 10:
            continue

        daily_mean = r.mean()
        daily_std = r.std(ddof=1)
        ann_return = daily_mean * periods_per_year
        ann_volatility = daily_std * np.sqrt(periods_per_year)

        # Excess Return over Risk-Free Rate
        excess_ann_return = ann_return - rf

        # Sharpe Ratio
        sharpe = excess_ann_return / (ann_volatility + 1e-12)

        # Downside Semi-Deviation (MAR = daily risk-free rate)
        mar_daily = rf / periods_per_year
        downside_diff = np.minimum(r - mar_daily, 0.0)
        downside_variance = np.sum(downside_diff ** 2) / n_obs
        downside_semi_dev = np.sqrt(downside_variance) * np.sqrt(periods_per_year)

        # Sortino Ratio
        sortino = excess_ann_return / (downside_semi_dev + 1e-12)

        # Parametric 1-Day VaR (Loss > 0)
        # Loss L = -r, so VaR_alpha is positive loss at (1-alpha) confidence
        param_var_95 = -(daily_mean + z_score * daily_std)

        # Historical 1-Day VaR
        hist_cutoff = np.percentile(r, alpha * 100.0)
        hist_var_95 = -hist_cutoff

        # Conditional VaR (Expected Shortfall / CVaR)
        tail_losses = r[r <= hist_cutoff]
        if len(tail_losses) > 0:
            cvar_95 = -tail_losses.mean()
        else:
            cvar_95 = hist_var_95

        # Higher statistical moments
        skew = stats.skew(r)
        kurt = stats.kurtosis(r)  # Fisher excess kurtosis (normal = 0)

        # Maximum Drawdown calculation from cumulative log returns
        cum_ret = np.exp(np.cumsum(r))
        peak = np.maximum.accumulate(cum_ret)
        drawdowns = (cum_ret - peak) / peak
        max_drawdown = float(np.min(drawdowns))

        # Calmar Ratio
        calmar = ann_return / (abs(max_drawdown) + 1e-12)

        records.append({
            "Asset": col,
            "Observations": int(n_obs),
            "Annualized Return": float(ann_return),
            "Annualized Volatility": float(ann_volatility),
            "Sharpe Ratio": float(sharpe),
            "Downside Semi-Dev": float(downside_semi_dev),
            "Sortino Ratio": float(sortino),
            "Parametric VaR (95%)": float(param_var_95),
            "Historical VaR (95%)": float(hist_var_95),
            "Conditional VaR (95%)": float(cvar_95),
            "Skewness": float(skew),
            "Excess Kurtosis": float(kurt),
            "Max Drawdown": float(max_drawdown),
            "Calmar Ratio": float(calmar)
        })

    result_df = pd.DataFrame(records).set_index("Asset")
    return result_df


# ==============================================================================
# MODULE 2: DYNAMIC VOLATILITY FORECASTING (GARCH, EGARCH, GJR-GARCH)
# ==============================================================================

def fit_garch_model(
    returns: pd.Series,
    model_type: str = "GJR-GARCH",
    p: int = 1,
    q: int = 1,
    o: int = 1,
    dist: str = "normal",
    rescale: bool = True
) -> Dict[str, Any]:
    """
    Fit GARCH(1,1), EGARCH(1,1), or GJR-GARCH(1,1,1) dynamic volatility models.

    Models & Persistence Formulations:
    - GARCH(1,1):
        sigma_t^2 = omega + alpha * eps_{t-1}^2 + beta * sigma_{t-1}^2
        Persistence: P = alpha + beta
    - GJR-GARCH(1,1,1):
        sigma_t^2 = omega + (alpha + gamma * I_{t-1}) * eps_{t-1}^2 + beta * sigma_{t-1}^2
        where I_{t-1} = 1 if eps_{t-1} < 0 else 0
        Persistence: P = alpha + beta + (gamma / 2)
    - EGARCH(1,1):
        ln(sigma_t^2) = omega + alpha * (|z_{t-1}| - E[|z|]) + gamma * z_{t-1} + beta * ln(sigma_{t-1}^2)
        Persistence: P = beta

    Parameters:
    -----------
    returns : pd.Series of daily log returns
    model_type : 'GJR-GARCH', 'GARCH', or 'EGARCH'
    p : Autoregressive order of lagged squared shocks / innovations
    q : Order of lagged conditional variance
    o : Order of asymmetric leverage shocks (1 for GJR-GARCH/EGARCH)
    dist : Error distribution ('normal', 't', 'skewt')
    rescale : Rescale returns by 100 for stable numerical convergence

    Returns:
    --------
    dict containing model summary, parameters, persistence, leverage gamma,
    annualized conditional volatility series, and out-of-sample volatility forecasts.
    """
    clean_r = returns.dropna()
    scale = 100.0 if rescale else 1.0
    scaled_r = clean_r * scale

    model_type_upper = model_type.upper().strip()
    if "EGARCH" in model_type_upper:
        vol_spec = "EGARCH"
        o_spec = 1
    elif "GJR" in model_type_upper:
        vol_spec = "GARCH"
        o_spec = 1
    else:  # Standard GARCH
        vol_spec = "GARCH"
        o_spec = 0

    if arch_model is None:
        raise ImportError("The 'arch' library is required for dynamic volatility forecasting.")

    am = arch_model(
        scaled_r,
        mean="Constant",
        vol=vol_spec,
        p=p,
        o=o_spec,
        q=q,
        dist=dist,
        rescale=False
    )
    res = am.fit(disp="off")

    params = res.params
    omega = float(params.get("omega", 0.0)) / (scale ** 2) if vol_spec != "EGARCH" else float(params.get("omega", 0.0))
    alpha_val = float(params.get("alpha[1]", 0.0))
    beta_val = float(params.get("beta[1]", 0.0))
    gamma_val = float(params.get("gamma[1]", 0.0))

    # Compute persistence according to exact econometric model specification
    if "EGARCH" in model_type_upper:
        persistence = beta_val
    elif o_spec > 0:  # GJR-GARCH
        persistence = alpha_val + beta_val + 0.5 * gamma_val
    else:  # Standard GARCH
        persistence = alpha_val + beta_val

    # Annualized conditional volatility
    cond_vol_scaled = res.conditional_volatility
    daily_cond_vol = cond_vol_scaled / scale
    annualized_cond_vol = daily_cond_vol * np.sqrt(252.0)
    annualized_cond_vol.name = f"{clean_r.name or 'Asset'}_GARCH_Vol"

    # Multi-step out-of-sample forward volatility forecasts
    try:
        if vol_spec == "EGARCH":
            forecast = res.forecast(horizon=21, method="simulation", simulations=250, random_state=42)
        else:
            forecast = res.forecast(horizon=21)
        f_var_scaled = forecast.variance.iloc[-1].values
        f_vol_daily = np.sqrt(np.maximum(f_var_scaled, 1e-12)) / scale
        f_vol_ann = f_vol_daily * np.sqrt(252.0)
        forecast_dict = {
            "1-Day Ahead (Ann Vol)": float(f_vol_ann[0]),
            "5-Day Ahead (Ann Vol)": float(f_vol_ann[min(4, len(f_vol_ann) - 1)]),
            "10-Day Ahead (Ann Vol)": float(f_vol_ann[min(9, len(f_vol_ann) - 1)]),
            "21-Day Ahead (Ann Vol)": float(f_vol_ann[-1]),
        }
    except Exception:
        # Fallback to unconditional or 1-step forecast
        f_vol_ann_1d = float(daily_cond_vol.iloc[-1] * np.sqrt(252.0))
        forecast_dict = {
            "1-Day Ahead (Ann Vol)": f_vol_ann_1d,
            "5-Day Ahead (Ann Vol)": f_vol_ann_1d,
            "10-Day Ahead (Ann Vol)": f_vol_ann_1d,
            "21-Day Ahead (Ann Vol)": f_vol_ann_1d,
        }

    # Stationarity and half-life of volatility shocks
    half_life = np.nan
    if 0 < persistence < 1:
        half_life = float(np.log(0.5) / np.log(persistence))

    return {
        "model_type": model_type_upper,
        "asset": clean_r.name or "Asset",
        "omega": omega,
        "alpha": alpha_val,
        "beta": beta_val,
        "gamma": gamma_val,
        "persistence": float(persistence),
        "half_life_days": half_life,
        "aic": float(res.aic),
        "bic": float(res.bic),
        "log_likelihood": float(res.loglikelihood),
        "p_values": res.pvalues.to_dict(),
        "conditional_volatility": annualized_cond_vol,
        "forecast_horizons": forecast_dict,
        "fit_result": res
    }


def compare_volatility_models(returns: pd.Series) -> pd.DataFrame:
    """
    Calibrate GARCH(1,1), EGARCH(1,1), and GJR-GARCH(1,1,1) side-by-side,
    comparing goodness-of-fit (AIC/BIC), leverage parameters, and persistence.
    """
    models = ["GARCH(1,1)", "EGARCH(1,1)", "GJR-GARCH(1,1,1)"]
    records = []

    for m in models:
        try:
            res = fit_garch_model(returns, model_type=m)
            records.append({
                "Model": m,
                "Log-Likelihood": res["log_likelihood"],
                "AIC": res["aic"],
                "BIC": res["bic"],
                "Alpha (Shock)": res["alpha"],
                "Beta (GARCH)": res["beta"],
                "Gamma (Leverage)": res["gamma"],
                "Persistence": res["persistence"],
                "Half-Life (Days)": res["half_life_days"],
                "1-Day Forecast Vol": res["forecast_horizons"]["1-Day Ahead (Ann Vol)"]
            })
        except Exception as e:
            records.append({
                "Model": m,
                "Log-Likelihood": np.nan,
                "AIC": np.nan,
                "BIC": np.nan,
                "Alpha (Shock)": np.nan,
                "Beta (GARCH)": np.nan,
                "Gamma (Leverage)": np.nan,
                "Persistence": np.nan,
                "Half-Life (Days)": np.nan,
                "1-Day Forecast Vol": np.nan
            })

    return pd.DataFrame(records).set_index("Model")


# ==============================================================================
# MODULE 3: SYSTEMIC VOLATILITY SPILLOVER (DIEBOLD-YILMAZ 2012 FEVD)
# ==============================================================================

def compute_generalized_fevd(
    var_result: Any,
    forecast_horizon: int = 10
) -> np.ndarray:
    """
    Compute Generalized Forecast Error Variance Decomposition (GFEVD)
    invariant to variable ordering (Pesaran & Shin 1998; Diebold & Yilmaz 2012).

    Formula:
        theta_{ij}(H) = (sigma_{jj}^-1 * sum_{h=0}^{H-1} (e_i' A_h Sigma e_j)^2)
                        / (sum_{h=0}^{H-1} (e_i' A_h Sigma A_h' e_i))
    Normalized row-wise so sum_j theta_{ij}^norm(H) = 100.
    """
    sigma = np.asarray(var_result.sigma_u)
    p = sigma.shape[0]
    sigma_diag = np.diag(sigma)

    # MA representation coefficient matrices A_h of dimension (H, p, p) with A_0 = I
    ma_coefs = np.asarray(var_result.ma_rep(forecast_horizon))

    theta = np.zeros((p, p))
    for i in range(p):
        denom = 0.0
        for h in range(forecast_horizon):
            ah = ma_coefs[h]
            denom += (ah @ sigma @ ah.T)[i, i]

        for j in range(p):
            numer = 0.0
            for h in range(forecast_horizon):
                ah = ma_coefs[h]
                term = (ah @ sigma)[i, j]
                numer += term ** 2
            theta[i, j] = (1.0 / (sigma_diag[j] + 1e-12)) * (numer / (denom + 1e-12))

    # Row-normalize to sum to 100%
    row_sums = theta.sum(axis=1, keepdims=True)
    theta_norm = (theta / (row_sums + 1e-12)) * 100.0
    return theta_norm


def compute_fevd_spillover(
    data: pd.DataFrame,
    max_lags: int = 2,
    forecast_horizon: int = 10
) -> Dict[str, Any]:
    """
    Calculate the full Diebold-Yilmaz (2012) Systemic Volatility Spillover framework:
    - NxN FEVD Adjacency Matrix
    - Directional Spillovers From-Others (received risk)
    - Directional Spillovers To-Others (transmitted risk)
    - Net Spillover (Transmitted - Received)
    - Systemic Spillover Index (SSI)

    Parameters:
    -----------
    data : pd.DataFrame containing asset volatility series (or log return series)
    max_lags : Maximum lag order for VAR estimation (default 2)
    forecast_horizon : Forecast horizon H in periods (default 10 days)

    Returns:
    --------
    dict containing fevd_matrix, to_others, from_others, net_spillover, ssi, and formatted table.
    """
    if VAR is None:
        raise ImportError("statsmodels is required for VAR and FEVD estimation.")

    df_clean = data.dropna()
    assets = list(df_clean.columns)
    n_assets = len(assets)

    if n_assets < 2:
        raise ValueError("Systemic spillover analysis requires at least 2 assets.")

    var_model = VAR(df_clean)
    # Fit VAR with lag selection or specified fixed lags
    try:
        var_res = var_model.fit(maxlags=max_lags, ic="aic")
        if var_res.k_ar == 0:
            var_res = var_model.fit(1)
    except Exception:
        var_res = var_model.fit(1)

    fevd_norm = compute_generalized_fevd(var_res, forecast_horizon=forecast_horizon)

    diag_elements = np.diag(fevd_norm)
    from_others = fevd_norm.sum(axis=1) - diag_elements
    to_others = fevd_norm.sum(axis=0) - diag_elements
    net_spillover = to_others - from_others
    ssi = float(from_others.sum() / n_assets)

    # Build clean representation DataFrame
    df_fevd = pd.DataFrame(fevd_norm, index=assets, columns=assets)
    df_summary = df_fevd.copy()
    df_summary["From_Others"] = from_others
    df_summary["Net_Spillover"] = net_spillover

    to_row = pd.Series(to_others, index=assets, name="To_Others")
    to_row["From_Others"] = from_others.sum()
    to_row["Net_Spillover"] = net_spillover.sum()
    df_summary = pd.concat([df_summary, to_row.to_frame().T])

    series_to = pd.Series(to_others, index=assets, name="To_Others")
    series_from = pd.Series(from_others, index=assets, name="From_Others")
    series_net = pd.Series(net_spillover, index=assets, name="Net_Spillover")

    return {
        "fevd_matrix": df_fevd,
        "spillover_table": df_summary,
        "to_others": series_to,
        "from_others": series_from,
        "net_spillover": series_net,
        "ssi": ssi,
        "var_result": var_res,
        "forecast_horizon": forecast_horizon
    }


def compute_rolling_spillover(
    data: pd.DataFrame,
    window: int = 100,
    step: int = 5,
    max_lags: int = 1,
    forecast_horizon: int = 10
) -> pd.DataFrame:
    """
    Compute dynamic rolling-window Systemic Spillover Index (SSI) over time.
    """
    df_clean = data.dropna()
    n_obs = len(df_clean)
    if n_obs < window:
        raise ValueError(f"Need at least {window} observations for rolling spillover.")

    dates = []
    ssi_values = []
    net_records = []

    for start in range(0, n_obs - window + 1, step):
        sub_data = df_clean.iloc[start : start + window]
        dt = sub_data.index[-1]
        try:
            spill = compute_fevd_spillover(sub_data, max_lags=max_lags, forecast_horizon=forecast_horizon)
            dates.append(dt)
            ssi_values.append(spill["ssi"])
            net_records.append(spill["net_spillover"].to_dict())
        except Exception:
            continue

    df_roll = pd.DataFrame(net_records, index=dates)
    df_roll["SSI"] = ssi_values
    return df_roll


# ==============================================================================
# MODULE 4: QUANTITATIVE SECURITY SCORING (QSS)
# ==============================================================================

def compute_qss(
    returns: pd.DataFrame,
    persistence_dict: Optional[Dict[str, float]] = None,
    rf: float = 0.0,
    momentum_lookback: int = 63,
    weights: Optional[Dict[str, float]] = None
) -> pd.DataFrame:
    """
    Multi-Factor Quantitative Security Scoring (QSS):
    Ranks assets across four econometric and risk dimensions:
    1. Sharpe Ratio (Risk-adjusted return)
    2. Low Volatility Persistence (1 - Persistence; rapid shock dissipation)
    3. Downside Tail Protection (-CVaR 95%; lower expected shortfall)
    4. Momentum (Trailing cumulative return over momentum_lookback periods)

    Each factor is Z-scored cross-sectionally:
        Z_k = (F_k - mean(F_k)) / std(F_k)
        QSS = sum_k w_k * Z_k

    Conviction Tiers:
    - Strong Conviction (Top 20%)
    - High Conviction
    - Moderate Conviction
    - Low Conviction / Underperform
    - High Tail Risk / Avoid (Bottom 20%)
    """
    if weights is None:
        weights = {
            "sharpe": 0.35,
            "low_persistence": 0.20,
            "tail_protection": 0.25,
            "momentum": 0.20
        }

    # Module 1 Risk Profile
    risk_profile = compute_risk_return_profile(returns, rf=rf)
    assets = list(returns.columns)

    sharpe_scores = risk_profile["Sharpe Ratio"]
    cvar_scores = risk_profile["Conditional VaR (95%)"]

    # Compute Volatility Persistence via GJR-GARCH if not pre-computed
    persistence_scores = {}
    if persistence_dict is not None:
        persistence_scores = persistence_dict
    else:
        for a in assets:
            try:
                gjr = fit_garch_model(returns[a], model_type="GJR-GARCH")
                persistence_scores[a] = gjr["persistence"]
            except Exception:
                persistence_scores[a] = 0.95

    # Momentum factor (e.g. 63-day trailing return)
    momentum_scores = {}
    for a in assets:
        series = returns[a].dropna()
        if len(series) >= momentum_lookback:
            mom = float(np.exp(series.iloc[-momentum_lookback:].sum()) - 1.0)
        else:
            mom = float(np.exp(series.sum()) - 1.0)
        momentum_scores[a] = mom

    df_factors = pd.DataFrame({
        "Sharpe": sharpe_scores,
        "Persistence": pd.Series(persistence_scores),
        "CVaR_95": cvar_scores,
        "Momentum": pd.Series(momentum_scores)
    })

    # Factor transformations:
    # We prefer:
    # + High Sharpe
    # + Low Persistence (1 - Persistence)
    # + Low Tail Loss (-CVaR_95)
    # + High Momentum
    f_sharpe = df_factors["Sharpe"]
    f_resilience = 1.0 - df_factors["Persistence"]
    f_tail_prot = -df_factors["CVaR_95"]
    f_mom = df_factors["Momentum"]

    def zscore(s: pd.Series) -> pd.Series:
        std = s.std(ddof=1)
        if std == 0 or np.isnan(std):
            return pd.Series(0.0, index=s.index)
        return (s - s.mean()) / std

    z_sharpe = zscore(f_sharpe)
    z_resilience = zscore(f_resilience)
    z_tail_prot = zscore(f_tail_prot)
    z_mom = zscore(f_mom)

    qss_composite = (
        weights["sharpe"] * z_sharpe +
        weights["low_persistence"] * z_resilience +
        weights["tail_protection"] * z_tail_prot +
        weights["momentum"] * z_mom
    )

    df_factors["Z_Sharpe"] = z_sharpe
    df_factors["Z_Resilience"] = z_resilience
    df_factors["Z_TailProt"] = z_tail_prot
    df_factors["Z_Momentum"] = z_mom
    df_factors["QSS_Composite"] = qss_composite
    df_factors["QSS_Rank"] = df_factors["QSS_Composite"].rank(ascending=False).astype(int)

    # Assign Conviction Rating
    def get_conviction(rank: int, total: int) -> str:
        pct = rank / total
        if pct <= 0.20:
            return "Strong Conviction (Tier 1)"
        elif pct <= 0.40:
            return "High Conviction (Tier 2)"
        elif pct <= 0.60:
            return "Moderate Conviction (Tier 3)"
        elif pct <= 0.80:
            return "Low Conviction (Tier 4)"
        else:
            return "High Tail Risk / Avoid (Tier 5)"

    n_tot = len(df_factors)
    df_factors["Conviction_Rating"] = [
        get_conviction(r, n_tot) for r in df_factors["QSS_Rank"]
    ]

    return df_factors.sort_values("QSS_Rank")


# ==============================================================================
# MODULE 5: MARKOWITZ MVO & WALK-FORWARD BACKTESTING
# ==============================================================================

def optimize_portfolio(
    expected_returns: np.ndarray,
    cov_matrix: np.ndarray,
    objective: str = "max_sharpe",
    rf: float = 0.0,
    allow_short: bool = False
) -> np.ndarray:
    """
    Markowitz Modern Portfolio Theory (MVO) convex optimization:
    - 'max_sharpe': Tangency portfolio maximizing (w'mu - rf) / sqrt(w'Sigma w)
    - 'min_variance': Global Minimum Variance portfolio minimizing w'Sigma w
    - 'equal_weight': 1/N benchmark
    """
    n = len(expected_returns)
    if n == 1:
        return np.array([1.0])

    if objective == "equal_weight":
        return np.ones(n) / n

    # Annualize returns and covariance for well-conditioned optimization gradients
    ann_mu = expected_returns * 252.0
    ann_cov = cov_matrix * 252.0

    # Regularize covariance matrix to ensure positive definiteness
    cov = ann_cov.copy()
    min_eig = np.min(np.real(np.linalg.eigvals(cov)))
    if min_eig < 1e-6:
        cov += (1e-6 - min_eig) * np.eye(n)

    bounds = tuple((-1.0, 1.0) if allow_short else (0.0, 1.0) for _ in range(n))
    constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1.0})
    init_w = np.ones(n) / n

    if objective == "min_variance":
        def min_var_obj(w: np.ndarray) -> float:
            return float(w.T @ cov @ w)

        res = sco.minimize(min_var_obj, init_w, method="SLSQP", bounds=bounds, constraints=constraints)
        if res.success:
            w = res.x
            w = np.clip(w, 0.0, 1.0) if not allow_short else w
            return w / np.sum(w)
        return init_w

    elif objective == "max_sharpe":
        def neg_sharpe_obj(w: np.ndarray) -> float:
            p_ret = float(np.sum(w * ann_mu))
            p_vol = float(np.sqrt(np.maximum(w.T @ cov @ w, 1e-12)))
            return -(p_ret - rf) / (p_vol + 1e-12)

        res = sco.minimize(neg_sharpe_obj, init_w, method="SLSQP", bounds=bounds, constraints=constraints)
        if res.success:
            w = res.x
            w = np.clip(w, 0.0, 1.0) if not allow_short else w
            return w / np.sum(w)
        return init_w

    return init_w


def walk_forward_backtest(
    returns: pd.DataFrame,
    lookback: int = 252,
    rebalance_freq: int = 21,  # Monthly rebalancing (21 trading days)
    rf: float = 0.0
) -> Dict[str, Any]:
    """
    Walk-Forward Out-of-Sample Rebalancing Backtest:
    Compares:
    1. Tangency Portfolio (Max Sharpe Ratio MVO)
    2. Global Minimum Variance (GMV) Portfolio
    3. Equal Weight (1/N) Benchmark Portfolio

    At each rebalancing date:
    - Covariance and mean returns are estimated exclusively on historical in-sample data.
    - Optimal weights are locked and applied out-of-sample over the next rebalance_freq days.
    - Computes daily out-of-sample portfolio returns, cumulative NAVs, and risk performance statistics.
    """
    clean_r = returns.dropna()
    n_obs, n_assets = clean_r.shape
    asset_names = list(clean_r.columns)

    if n_obs <= lookback + rebalance_freq:
        raise ValueError(
            f"Insufficient data for walk-forward backtest (need > {lookback + rebalance_freq} days, got {n_obs})."
        )

    out_dates = clean_r.index[lookback:]
    ret_tangency = []
    ret_minvar = []
    ret_eqweight = []

    weights_tangency = []
    weights_minvar = []

    current_w_tangency = np.ones(n_assets) / n_assets
    current_w_minvar = np.ones(n_assets) / n_assets
    w_eq = np.ones(n_assets) / n_assets

    for t in range(lookback, n_obs):
        # Check if today is a rebalancing date
        if (t - lookback) % rebalance_freq == 0:
            in_sample = clean_r.iloc[t - lookback : t]
            mu = in_sample.mean().values
            cov = in_sample.cov().values

            current_w_tangency = optimize_portfolio(mu, cov, objective="max_sharpe", rf=rf)
            current_w_minvar = optimize_portfolio(mu, cov, objective="min_variance", rf=rf)

            weights_tangency.append((clean_r.index[t], current_w_tangency))
            weights_minvar.append((clean_r.index[t], current_w_minvar))

        # Out-of-sample daily return
        day_ret = clean_r.iloc[t].values
        r_tan = float(np.sum(current_w_tangency * day_ret))
        r_min = float(np.sum(current_w_minvar * day_ret))
        r_eq = float(np.sum(w_eq * day_ret))

        ret_tangency.append(r_tan)
        ret_minvar.append(r_min)
        ret_eqweight.append(r_eq)

    df_oos_returns = pd.DataFrame({
        "Tangency (Max Sharpe)": ret_tangency,
        "Minimum Variance": ret_minvar,
        "Equal Weight (1/N)": ret_eqweight
    }, index=out_dates)

    # Compute NAV curves starting at 100.0
    df_nav = 100.0 * np.exp(np.cumsum(df_oos_returns, axis=0))

    # Compute Risk-Return Profiles for all strategies
    strategy_profile = compute_risk_return_profile(df_oos_returns, rf=rf)

    # Add Cumulative Return column to strategy profile
    cum_returns = (df_nav.iloc[-1] / 100.0) - 1.0
    strategy_profile["Cumulative Return"] = cum_returns

    df_w_tangency = pd.DataFrame(
        [w for _, w in weights_tangency],
        index=[dt for dt, _ in weights_tangency],
        columns=asset_names
    )
    df_w_minvar = pd.DataFrame(
        [w for _, w in weights_minvar],
        index=[dt for dt, _ in weights_minvar],
        columns=asset_names
    )

    return {
        "nav": df_nav,
        "returns": df_oos_returns,
        "strategy_profile": strategy_profile,
        "weights_tangency": df_w_tangency,
        "weights_minvar": df_w_minvar
    }


# ==============================================================================
# PIPELINE ORCHESTRATOR
# ==============================================================================

def run_full_pipeline(
    tickers: Optional[List[str]] = None,
    prices_or_returns: Optional[pd.DataFrame] = None,
    rf: float = 0.02
) -> Dict[str, Any]:
    """
    Execute the entire 5-module quantitative risk pipeline end-to-end:
    - Module 1: Risk-Return Profiling
    - Module 2: Dynamic Volatility Forecasting & Model Comparison
    - Module 3: Systemic Volatility Spillover & Diebold-Yilmaz Index
    - Module 4: Quantitative Security Scoring & Multi-Factor Conviction
    - Module 5: Markowitz MVO & Walk-Forward Portfolio Rebalancing
    """
    if prices_or_returns is None:
        if tickers is None:
            tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "JPM", "GS", "SPY"]
        prices = fetch_market_data(tickers)
        returns = compute_log_returns(prices)
    else:
        # Check if prices or returns
        if (prices_or_returns > 0).all().all() and (prices_or_returns > 1.5).any().any():
            prices = prices_or_returns
            returns = compute_log_returns(prices)
        else:
            returns = prices_or_returns
            prices = 100.0 * np.exp(returns.cumsum())

    # Module 1: Risk Profile
    risk_profile = compute_risk_return_profile(returns, rf=rf)

    # Module 2: Dynamic Volatility Estimation (GJR-GARCH on each asset)
    garch_results = {}
    cond_vols = {}
    persistence_map = {}
    for col in returns.columns:
        try:
            fit = fit_garch_model(returns[col], model_type="GJR-GARCH")
            garch_results[col] = fit
            cond_vols[col] = fit["conditional_volatility"]
            persistence_map[col] = fit["persistence"]
        except Exception:
            pass

    df_cond_vol = pd.DataFrame(cond_vols).dropna()

    # Model comparison on primary asset
    primary_asset = returns.columns[0]
    vol_model_comparison = compare_volatility_models(returns[primary_asset])

    # Module 3: Systemic Volatility Spillover
    spillover_data = df_cond_vol if not df_cond_vol.empty else returns.abs()
    spillover_result = compute_fevd_spillover(spillover_data, max_lags=2, forecast_horizon=10)

    # Module 4: Quantitative Security Scoring
    qss_rankings = compute_qss(returns, persistence_dict=persistence_map, rf=rf)

    # Module 5: Markowitz Optimization & Walk-Forward Backtesting
    mvo_backtest = walk_forward_backtest(returns, lookback=252, rebalance_freq=21, rf=rf)

    return {
        "prices": prices,
        "returns": returns,
        "module1_risk_profile": risk_profile,
        "module2_garch_results": garch_results,
        "module2_vol_comparison": vol_model_comparison,
        "module3_spillover": spillover_result,
        "module4_qss": qss_rankings,
        "module5_mvo_backtest": mvo_backtest
    }


if __name__ == "__main__":
    print("Running Quant Engine Demonstration...")
    results = run_full_pipeline()
    print("\n--- Module 1: Risk-Return Profile ---")
    print(results["module1_risk_profile"][["Annualized Return", "Annualized Volatility", "Sharpe Ratio", "Sortino Ratio", "Parametric VaR (95%)", "Conditional VaR (95%)"]].round(4))

    print("\n--- Module 2: Volatility Model Comparison (Primary Asset) ---")
    print(results["module2_vol_comparison"][["AIC", "BIC", "Alpha (Shock)", "Beta (GARCH)", "Gamma (Leverage)", "Persistence"]].round(4))

    print("\n--- Module 3: Diebold-Yilmaz Spillover Table ---")
    print(results["module3_spillover"]["spillover_table"].round(2))
    print(f"\nSystemic Spillover Index (SSI): {results['module3_spillover']['ssi']:.2f}%")

    print("\n--- Module 4: Quantitative Security Scoring (QSS) ---")
    print(results["module4_qss"][["QSS_Composite", "QSS_Rank", "Conviction_Rating", "Sharpe", "Persistence", "CVaR_95"]].round(4))

    print("\n--- Module 5: Walk-Forward Backtest Performance ---")
    print(results["module5_mvo_backtest"]["strategy_profile"][["Cumulative Return", "Annualized Return", "Annualized Volatility", "Sharpe Ratio", "Max Drawdown"]].round(4))
