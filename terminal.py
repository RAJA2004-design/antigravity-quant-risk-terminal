"""
Quant Risk Terminal - Interactive CLI Application
==================================================
Command-line risk terminal interface for running:
- Risk-Return Profiling (Module 1)
- GARCH / GJR-GARCH / EGARCH Volatility Forecasting (Module 2)
- Systemic Volatility Spillover Matrix (Module 3)
- Quantitative Security Scoring (Module 4)
- Markowitz MVO & Walk-Forward Portfolio Backtest (Module 5)
"""

import argparse
import sys
from typing import List

import pandas as pd
from quant_engine import (
    fetch_market_data,
    compute_log_returns,
    compute_risk_return_profile,
    fit_garch_model,
    compare_volatility_models,
    compute_fevd_spillover,
    compute_qss,
    walk_forward_backtest,
    run_full_pipeline
)

DEFAULT_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "JPM", "GS", "SPY"]


def print_banner():
    banner = r"""
========================================================================================
   __ _ _  _ _____ ___ ___ ___   _____   _____ ___ ___ _  _ _ ___  _   _   ___ ___ ___ 
  /  \ | \| |_   _|_ _/ __| _ \ /   \ \ / /_ _|_ _|_ _| \| | _ \/_\ | | |   \ __/ __|
 | /\ || .` | | |  | | (_ |   / | - |\ V / | | | | | || .` |  _/ _ \| |_| |) | _|\__ \
 |_||_||_|\_| |_| |___\___|_|_\ |_|_| \_/ |___|___|___|_|\_|_|/_/ \_\___|___/___|___/
                     EMPIRICAL QUANTITATIVE RISK TERMINAL
========================================================================================
"""
    print(banner)


def run_cli():
    print_banner()
    parser = argparse.ArgumentParser(description="Antigravity Quantitative Risk Terminal")
    parser.add_argument("--tickers", nargs="+", default=DEFAULT_TICKERS, help="List of asset tickers")
    parser.add_argument("--rf", type=float, default=0.02, help="Annualized risk-free rate (default 0.02)")
    parser.add_argument("--horizon", type=int, default=10, help="Forecast horizon for FEVD spillover")
    parser.add_argument("--module", type=str, choices=["1", "2", "3", "4", "5", "all"], default="all",
                        help="Module to execute (1-5 or all)")
    args = parser.parse_args()

    print(f"[*] Ingesting market data for: {', '.join(args.tickers)}")
    prices = fetch_market_data(args.tickers)
    returns = compute_log_returns(prices)
    print(f"[+] Loaded {len(returns)} trading observations across {len(args.tickers)} securities.")

    if args.module in ["1", "all"]:
        print("\n" + "=" * 90)
        print(" MODULE 1: EMPIRICAL RISK-RETURN PROFILING & TAIL LOSS ANALYSIS")
        print("=" * 90)
        profile = compute_risk_return_profile(returns, rf=args.rf)
        cols = [
            "Annualized Return", "Annualized Volatility", "Sharpe Ratio",
            "Sortino Ratio", "Parametric VaR (95%)", "Historical VaR (95%)",
            "Conditional VaR (95%)", "Max Drawdown"
        ]
        print(profile[cols].to_string())

    if args.module in ["2", "all"]:
        print("\n" + "=" * 90)
        print(f" MODULE 2: DYNAMIC VOLATILITY FORECASTING & LEVERAGE ASYMMETRY ({args.tickers[0]})")
        print("=" * 90)
        comp = compare_volatility_models(returns[args.tickers[0]])
        print(comp.to_string())

        print(f"\n[*] Calibrating GJR-GARCH(1,1,1) for all assets...")
        gjr_records = []
        for a in args.tickers:
            fit = fit_garch_model(returns[a], model_type="GJR-GARCH")
            gjr_records.append({
                "Asset": a,
                "Alpha": fit["alpha"],
                "Beta": fit["beta"],
                "Gamma (Leverage)": fit["gamma"],
                "Persistence (a+b+g/2)": fit["persistence"],
                "Half-Life (Days)": fit["half_life_days"],
                "1-Day Ahead Vol": fit["forecast_horizons"]["1-Day Ahead (Ann Vol)"],
                "21-Day Ahead Vol": fit["forecast_horizons"]["21-Day Ahead (Ann Vol)"]
            })
        print(pd.DataFrame(gjr_records).set_index("Asset").to_string())

    if args.module in ["3", "all"]:
        print("\n" + "=" * 90)
        print(f" MODULE 3: SYSTEMIC VOLATILITY SPILLOVER MATRIX (DIEBOLD-YILMAZ H={args.horizon})")
        print("=" * 90)
        # Compute GJR conditional volatilities
        cond_vols = {}
        for a in args.tickers:
            fit = fit_garch_model(returns[a], model_type="GJR-GARCH")
            cond_vols[a] = fit["conditional_volatility"]
        df_vol = pd.DataFrame(cond_vols).dropna()
        spill = compute_fevd_spillover(df_vol, max_lags=2, forecast_horizon=args.horizon)
        print(spill["spillover_table"].round(2).to_string())
        print(f"\n[>>>] SYSTEMIC SPILLOVER INDEX (SSI): {spill['ssi']:.2f}%")

    if args.module in ["4", "all"]:
        print("\n" + "=" * 90)
        print(" MODULE 4: QUANTITATIVE SECURITY SCORING (QSS) CONVICTION TIERS")
        print("=" * 90)
        qss = compute_qss(returns, rf=args.rf)
        cols = ["QSS_Rank", "Conviction_Rating", "QSS_Composite", "Sharpe", "Persistence", "CVaR_95", "Momentum"]
        print(qss[cols].to_string())

    if args.module in ["5", "all"]:
        print("\n" + "=" * 90)
        print(" MODULE 5: MARKOWITZ MVO & WALK-FORWARD OUT-OF-SAMPLE BACKTEST")
        print("=" * 90)
        bt = walk_forward_backtest(returns, lookback=252, rebalance_freq=21, rf=args.rf)
        cols = ["Cumulative Return", "Annualized Return", "Annualized Volatility", "Sharpe Ratio", "Sortino Ratio", "Max Drawdown"]
        print(bt["strategy_profile"][cols].to_string())
        print("\n[+] Final Portfolio NAVs (Base = $100.00):")
        for strat in bt["nav"].columns:
            print(f"    - {strat:25s}: ${bt['nav'][strat].iloc[-1]:.2f}")

    print("\n" + "=" * 90)
    print(" [SUCCESS] Quantitative Risk Pipeline Execution Completed.")
    print("=" * 90 + "\n")


if __name__ == "__main__":
    run_cli()
