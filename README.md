# Antigravity Quant Terminal & Econometrics Engine

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Econometrics](https://img.shields.io/badge/Econometrics-GARCH%20%7C%20VAR%20%7C%20FEVD%20%7C%20MVO-purple.svg)]()

An institutional-grade, empirical quantitative risk terminal and econometric analytics engine. Built for hedge funds, asset management desks, and risk professionals, this repository combines:
1. **Core Econometric Python Engine (`quant_engine.py`)**: Vectorized numerical implementations of risk-return profiling, dynamic conditional heteroskedasticity forecasting, systemic network spillovers, multi-factor scoring, and Markowitz optimization.
2. **Interactive CLI Terminal (`terminal.py`)**: Professional command-line interface with formatted tables, status diagnostics, and multi-asset calibrations.
3. **Institutional Web UI (`App.jsx`)**: Bloomberg/Aladdin-styled reactive dashboard featuring interactive tail risk densities, GFEVD heatmaps, volatility persistence meters, and walk-forward NAV charts.

---

## Complete Econometric & Mathematical Formulations

### Module 1: Empirical Risk-Return Profiling & Tail Risk Metrics

#### 1. Continuously Compounded Log Returns
For an asset price series $P_t$, daily log returns are estimated as:
$$r_t = \ln\left(\frac{P_t}{P_{t-1}}\right) = \ln(P_t) - \ln(P_{t-1})$$

#### 2. Annualized Return & Total Volatility
Given $N$ trading periods per year (typically $N = 252$ for daily equities):
$$\mu_{\text{ann}} = \mu_{\text{daily}} \times N = \left(\frac{1}{T}\sum_{t=1}^T r_t\right) \times N$$
$$\sigma_{\text{ann}} = \sigma_{\text{daily}} \times \sqrt{N} = \sqrt{\frac{1}{T-1}\sum_{t=1}^T (r_t - \mu_{\text{daily}})^2} \times \sqrt{N}$$

#### 3. Sharpe Ratio
Evaluates excess portfolio return relative to total volatility:
$$\text{Sharpe} = \frac{\mu_{\text{ann}} - r_f}{\sigma_{\text{ann}}}$$
where $r_f$ is the annualized risk-free benchmark rate.

#### 4. Downside Semi-Deviation & Sortino Ratio
Unlike standard deviation which penalizes upside upside volatility, the Downside Semi-Deviation isolates returns falling below a Minimum Acceptable Return (MAR, typically the daily risk-free rate $\tau = \frac{r_f}{N}$):
$$\sigma_{\text{down}} = \sqrt{\frac{1}{T} \sum_{t=1}^T \min(r_t - \tau, 0)^2} \times \sqrt{N}$$
The Sortino Ratio scales excess return strictly by downside risk:
$$\text{Sortino} = \frac{\mu_{\text{ann}} - r_f}{\sigma_{\text{down}}}$$

#### 5. Parametric 95% 1-Day Value at Risk (VaR)
Under the Gaussian assumption where daily returns follow $\mathcal{N}(\mu_d, \sigma_d^2)$:
$$\text{VaR}_{0.95}^{\text{param}} = -(\mu_d + z_{0.05} \sigma_d)$$
where $z_{0.05} = \Phi^{-1}(0.05) \approx -1.644853$. Formulated as a positive loss percentage:
$$\text{VaR}_{0.95}^{\text{param}} = 1.644853 \sigma_d - \mu_d$$

#### 6. Historical 95% 1-Day Value at Risk (VaR)
Non-parametric empirical quantile cutoff:
$$\text{VaR}_{0.95}^{\text{hist}} = - q_{0.05}(r)$$

#### 7. 95% Conditional Value at Risk (CVaR / Expected Shortfall)
Measures the expected loss conditional on the loss exceeding the 95% VaR threshold:
$$\text{CVaR}_{0.95} = -\mathbb{E}\left[r_t \mid r_t \le - \text{VaR}_{0.95}^{\text{hist}}\right] = -\frac{1}{\sum_{t=1}^T \mathbf{1}_{\{r_t \le q_{0.05}\}}} \sum_{r_t \le q_{0.05}} r_t$$
Mathematically, $\text{CVaR}_{0.95} \ge \text{VaR}_{0.95}^{\text{hist}}$, providing a coherent tail-risk measure accounting for fat-tailed non-Gaussian innovations.

---

### Module 2: Dynamic Volatility Forecasting & Asymmetric Leverage

Financial asset innovations exhibit volatility clustering and asymmetric responses to negative versus positive shocks (the leverage effect).

#### 1. Standard GARCH(1,1) (Bollerslev, 1986)
$$r_t = \mu + \epsilon_t, \quad \epsilon_t = \sigma_t z_t, \quad z_t \overset{\text{i.i.d.}}{\sim} \mathcal{N}(0, 1)$$
$$\sigma_t^2 = \omega + \alpha \epsilon_{t-1}^2 + \beta \sigma_{t-1}^2$$
- **Parameter Constraints**: $\omega > 0, \; \alpha \ge 0, \; \beta \ge 0$
- **Volatility Persistence**: $P = \alpha + \beta$
- **Stationarity Condition**: $\alpha + \beta < 1$
- **Unconditional Long-Run Variance**: $\bar{\sigma}^2 = \frac{\omega}{1 - (\alpha + \beta)}$
- **Shock Half-Life**: $T_{1/2} = \frac{\ln(0.5)}{\ln(\alpha + \beta)}$

#### 2. GJR-GARCH(1,1,1) (Glosten, Jagannathan, and Runkle, 1993)
Captures asymmetric leverage where market downturns ($\epsilon_{t-1} < 0$) amplify future conditional volatility:
$$\sigma_t^2 = \omega + (\alpha + \gamma I_{t-1}) \epsilon_{t-1}^2 + \beta \sigma_{t-1}^2$$
where $I_{t-1}$ is the indicator function:
$$I_{t-1} = \begin{cases} 1, & \text{if } \epsilon_{t-1} < 0 \\ 0, & \text{if } \epsilon_{t-1} \ge 0 \end{cases}$$
- $\gamma$ is the **asymmetric leverage shock parameter**.
- For symmetric innovation distributions ($\mathbb{E}[I_{t-1}] = 0.5$), the **Volatility Persistence** is:
  $$\text{Persistence} = \alpha + \beta + \frac{\gamma}{2}$$
- **Stationarity Condition**: $\alpha + \beta + \frac{\gamma}{2} < 1$

#### 3. EGARCH(1,1) (Nelson, 1991)
Models the log conditional variance, guaranteeing $\sigma_t^2 > 0$ without non-negativity parameter constraints:
$$\ln(\sigma_t^2) = \omega + \alpha \left( \left|\frac{\epsilon_{t-1}}{\sigma_{t-1}}\right| - \mathbb{E}\left[\left|\frac{\epsilon_{t-1}}{\sigma_{t-1}}\right|\right] \right) + \gamma \frac{\epsilon_{t-1}}{\sigma_{t-1}} + \beta \ln(\sigma_{t-1}^2)$$
where $\mathbb{E}[|z_t|] = \sqrt{\frac{2}{\pi}} \approx 0.79788$ for standard normal errors.
- $\gamma < 0$ captures asymmetric leverage.
- **Volatility Persistence**: $\text{Persistence} = \beta$

---

### Module 3: Systemic Volatility Spillover (Diebold-Yilmaz 2012)

Quantifies cross-asset network interconnectedness and systemic shock transmission using Generalized Forecast Error Variance Decomposition (GFEVD).

#### 1. Vector Autoregression (VAR)
Consider an $N$-variable system of volatility series $Y_t = [y_{1,t}, \dots, y_{N,t}]'$ modeled as a $\text{VAR}(p)$:
$$Y_t = \sum_{k=1}^p \Phi_k Y_{t-k} + \varepsilon_t, \quad \varepsilon_t \sim \mathcal{N}(0, \Sigma)$$
The infinite Vector Moving Average ($\text{VMA}(\infty)$) representation is:
$$Y_t = \sum_{h=0}^\infty A_h \varepsilon_{t-h}$$
where $A_0 = I_N$ and recursively for $h \ge 1$:
$$A_h = \sum_{k=1}^{\min(h, p)} \Phi_k A_{h-k}$$

#### 2. Generalized Forecast Error Variance Decomposition (GFEVD)
Using the order-invariant framework of Pesaran and Shin (1998) and Diebold and Yilmaz (2012), the $H$-step ahead forecast error variance of asset $i$ explained by shocks to asset $j$ is:
$$\theta_{ij}(H) = \frac{\sigma_{jj}^{-1} \sum_{h=0}^{H-1} \left( e_i' A_h \Sigma e_j \right)^2}{\sum_{h=0}^{H-1} \left( e_i' A_h \Sigma A_h' e_i \right)}$$
where:
- $\Sigma = \mathbb{E}[\varepsilon_t \varepsilon_t']$ is the residual covariance matrix.
- $\sigma_{jj} = \Sigma_{jj}$ is the error variance of the $j$-th equation.
- $e_i$ is a selection vector with 1 at index $i$ and 0 elsewhere.

Because shocks are not orthogonal, row sums $\sum_{j=1}^N \theta_{ij}(H) \neq 1$. Each entry is normalized row-wise:
$$\tilde{\theta}_{ij}(H) = \frac{\theta_{ij}(H)}{\sum_{k=1}^N \theta_{ik}(H)} \times 100$$
so that $\sum_{j=1}^N \tilde{\theta}_{ij}(H) = 100$.

#### 3. Directional Spillover & Net Transmission
- **Directional Spillover Received FROM Others**:
  $$\mathcal{S}_{i \leftarrow \bullet}(H) = \sum_{\substack{j=1 \\ j \neq i}}^N \tilde{\theta}_{ij}(H) = 100 - \tilde{\theta}_{ii}(H)$$
- **Directional Spillover Transmitted TO Others**:
  $$\mathcal{S}_{\bullet \leftarrow i}(H) = \sum_{\substack{j=1 \\ j \neq i}}^N \tilde{\theta}_{ji}(H)$$
- **Net Volatility Spillover**:
  $$\mathcal{S}_i^{\text{net}}(H) = \mathcal{S}_{\bullet \leftarrow i}(H) - \mathcal{S}_{i \leftarrow \bullet}(H)$$
  - $\mathcal{S}_i^{\text{net}} > 0$: **Net Transmitter** of systemic fragility (systemic risk driver).
  - $\mathcal{S}_i^{\text{net}} < 0$: **Net Receiver** of systemic fragility (vulnerable asset).

#### 4. Total Systemic Spillover Index (SSI)
The aggregate degree of cross-market volatility connectedness across the financial network is:
$$\text{SSI}(H) = \frac{\sum_{\substack{i,j=1 \\ i \neq j}}^N \tilde{\theta}_{ij}(H)}{N} = \frac{\sum_{i=1}^N \mathcal{S}_{i \leftarrow \bullet}(H)}{N}$$

---

### Module 4: Quantitative Security Scoring (QSS)

QSS generates cross-sectional multi-factor conviction rankings across four dimensions:
1. **Risk-Adjusted Return Factor**: Sharpe Ratio ($\text{Sharpe}_i$)
2. **Volatility Resilience Factor**: Low Persistence ($1 - P_i$, rapid dissipation of shock clustering)
3. **Downside Tail Protection Factor**: Negative Expected Shortfall ($-\text{CVaR}_{0.95, i}$)
4. **Momentum Factor**: Medium-term trailing return ($\text{Mom}_i = \prod_{t=T-K}^T (1 + r_{i,t}) - 1$)

Each factor $F_{k}$ is standardized cross-sectionally via Z-scores:
$$Z_k(i) = \frac{F_k(i) - \bar{F}_k}{\sigma_{F_k}}$$
The composite conviction score is:
$$\text{QSS}_i = w_1 Z_{\text{Sharpe}}(i) + w_2 Z_{\text{Resilience}}(i) + w_3 Z_{\text{TailProt}}(i) + w_4 Z_{\text{Momentum}}(i)$$
Assets are sorted and assigned into 5 quantitative conviction tiers:
- **Tier 1 (Top 20%)**: Strong Conviction
- **Tier 2 (20% - 40%)**: High Conviction
- **Tier 3 (40% - 60%)**: Moderate Conviction
- **Tier 4 (60% - 80%)**: Low Conviction / Underperform
- **Tier 5 (Bottom 20%)**: High Tail Risk / Avoid

---

### Module 5: Markowitz MVO & Walk-Forward Backtesting

#### 1. Tangency (Max Sharpe) Optimization
Finds the portfolio on the efficient frontier with maximum Sharpe ratio subject to long-only constraints:
$$\max_{w} \quad \frac{w' \mu_{\text{ann}} - r_f}{\sqrt{w' \Sigma_{\text{ann}} w}} \quad \text{s.t.} \quad \sum_{i=1}^N w_i = 1, \quad w_i \ge 0 \quad \forall i$$

#### 2. Global Minimum Variance (GMV) Portfolio
Minimizes portfolio variance without regard to expected return:
$$\min_{w} \quad w' \Sigma_{\text{ann}} w \quad \text{s.t.} \quad \sum_{i=1}^N w_i = 1, \quad w_i \ge 0 \quad \forall i$$

#### 3. Walk-Forward Rolling Out-of-Sample Protocol
- **In-sample window**: $L = 252$ trading days.
- **Rebalancing frequency**: $\Delta t = 21$ trading days (monthly).
- At day $t$, parameters $\hat{\mu}_t$ and $\hat{\Sigma}_t$ are estimated strictly using historical data $[t-L, t)$.
- Optimal weights $w_t^*$ are computed and held constant over the out-of-sample forward window $[t, t+\Delta t)$.
- Daily out-of-sample portfolio return:
  $$R_{p, \tau} = \sum_{i=1}^N w_{i, t}^* r_{i, \tau}, \quad \tau \in [t, t+\Delta t)$$
- Cumulative NAV path starting at $\$100.00$:
  $$\text{NAV}_t = 100 \times \prod_{\tau=1}^t (1 + R_{p, \tau})$$

---

## Project Structure

```
antigravity-quant-risk-terminal/
├── quant_engine.py          # Core Econometric Engine (Modules 1-5)
├── terminal.py              # Interactive CLI Risk Terminal
├── App.jsx                  # Institutional Web UI Dashboard
├── main.jsx                 # React root entrypoint
├── index.html               # Web terminal shell
├── package.json             # Frontend dependencies & scripts
├── test_quant_engine.py     # Comprehensive Unit & Econometric Test Suite
├── requirements.txt         # Python dependencies
└── README.md                # Mathematical documentation & user guide
```

---

## Local Execution & Installation

### 1. Python Econometric Engine & Terminal
Install Python requirements (Python 3.10+):
```bash
pip install -r requirements.txt
```

Run comprehensive unit and integration tests:
```bash
python -m unittest test_quant_engine.py -v
```

Execute the full CLI quantitative risk terminal:
```bash
python terminal.py --module all
```

Or run targeted modules:
```bash
# Module 1: Risk-Return Profiling
python terminal.py --module 1

# Module 2: GARCH Volatility & Leverage Comparison
python terminal.py --module 2

# Module 3: Systemic Volatility Spillover Matrix
python terminal.py --module 3 --horizon 10

# Module 4: Quantitative Security Scoring (QSS)
python terminal.py --module 4

# Module 5: Markowitz MVO & Walk-Forward NAV Comparison
python terminal.py --module 5
```

### 2. Interactive Web Terminal UI (`App.jsx`)
Run the Bloomberg-style web UI with Node / Vite:
```bash
npm install
npm run dev
```

---

## Python API Usage

```python
from quant_engine import run_full_pipeline, compute_risk_return_profile, fit_garch_model, compute_fevd_spillover

# Execute full institutional quantitative pipeline
results = run_full_pipeline(tickers=["AAPL", "MSFT", "GOOGL", "NVDA", "SPY"], rf=0.02)

# Module 1: Inspect risk-return profile
print(results["module1_risk_profile"][["Sharpe Ratio", "Sortino Ratio", "Parametric VaR (95%)", "Conditional VaR (95%)"]])

# Module 2: Examine GJR-GARCH leverage shock gamma & persistence
gjr = results["module2_garch_results"]["NVDA"]
print(f"NVDA Gamma: {gjr['gamma']:.4f}, Persistence: {gjr['persistence']:.4f}")

# Module 3: Systemic Spillover Index
print(f"Diebold-Yilmaz SSI: {results['module3_spillover']['ssi']:.2f}%")

# Module 4: Conviction Rankings
print(results["module4_qss"][["QSS_Rank", "Conviction_Rating", "QSS_Composite"]])

# Module 5: Out-of-sample NAV performance
print(results["module5_mvo_backtest"]["strategy_profile"])
```

---

## License
MIT License. Created for institutional quantitative risk analysis.
