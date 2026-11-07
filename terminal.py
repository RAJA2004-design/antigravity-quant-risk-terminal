"""
Quant Risk Terminal - Interactive CLI Application (Indian Equity Market Edition)
================================================================================
Empirical econometric risk terminal supporting any Indian sector:
- Banking (NIFTY BANK)
- Information Technology (NIFTY IT)
- Pharmaceuticals (NIFTY PHARMA)
- Automobile (NIFTY AUTO)
- FMCG (NIFTY FMCG)
- Energy & Utilities (NIFTY ENERGY)
- Metals & Mining (NIFTY METAL)
- Financial Services (NIFTY FIN SERVICE)
"""

import argparse
import sys
from typing import List

import pandas as pd
import indian_markets as im
from quant_engine import (
    run_sector_pipeline,
    run_full_pipeline,
    compute_risk_return_profile,
    compare_volatility_models,
    fit_garch_model,
    compute_fevd_spillover,
    compute_qss,
    walk_forward_backtest
)


def print_banner():
    banner = r"""
========================================================================================
   __ _ _  _ _____ ___ ___ ___   _____   _____ ___ ___ _  _ _ ___  _   _   ___ ___ ___ 
  /  \ | \| |_   _|_ _/ __| _ \ /   \ \ / /_ _|_ _|_ _| \| | _ \/_\ | | |   \ __/ __|
 | /\ || .` | | |  | | (_ |   / | - |\ V / | | | | | || .` |  _/ _ \| |_| |) | _|\__ \
 |_||_||_|\_| |_| |___\___|_|_\ |_|_| \_/ |___|___|___|_|\_|_|/_/ \_\___|___/___|___/
           INDIAN EQUITY MARKET DYNAMIC SECTOR TERMINAL (NSE / NIFTY 50)
========================================================================================
"""
    print(banner)


def run_cli():
    print_banner()
    parser = argparse.ArgumentParser(description="Antigravity Indian Equity Quantitative Risk Terminal")
    parser.add_argument("--sector", type=str, default="Banking",
                        help="Indian sector (Banking, IT, Pharma, Auto, FMCG, Energy, Metals, etc.)")
    parser.add_argument("--list-sectors", action="store_true",
                        help="List all supported Indian equity market sectors")
    parser.add_argument("--rf", type=float, default=0.065,
                        help="Annualized Indian risk-free rate (e.g. 0.065 for 6.5%% G-Sec yield)")
    parser.add_argument("--horizon", type=int, default=10,
                        help="Forecast horizon for Diebold-Yilmaz FEVD spillover")
    parser.add_argument("--module", type=str, choices=["1", "2", "3", "4", "5", "all"], default="all",
                        help="Module to execute (1-5 or all)")
    args = parser.parse_args()

    if args.list_sectors:
        print("\nSupported Indian Equity Sectors on NSE:")
        for sec in im.list_supported_sectors():
            defn = im.get_sector_universe(sec)
            print(f"  • {sec:20s} -> Sector Index: {defn['sector_index']:15s} ({len(defn['stocks'])} stocks)")
        print(f"  • Benchmark Index      -> {im.MARKET_BENCHMARK} (NIFTY 50)")
        return

    canonical_sector = im.resolve_sector(args.sector)
    sector_def = im.get_sector_universe(canonical_sector)
    print(f"[*] Target Industry: {canonical_sector} ({sector_def['name']})")
    print(f"[*] Sector Index: {sector_def['sector_index']} ({sector_def['index_name']})")
    print(f"[*] Market Benchmark: {sector_def['benchmark_index']} (NIFTY 50)")
    print(f"[*] Constituents: {len(sector_def['stocks'])} listed NSE equities")
    print(f"[*] Benchmark Risk-Free Rate: {args.rf*100:.2f}% (RBI G-Sec proxy)\n")

    print("[1/5] Ingesting market data & executing empirical risk pipeline...")
    results = run_sector_pipeline(sector_name=canonical_sector, rf=args.rf)

    returns = results["returns"]
    risk_profile = results["module1_risk_profile"]
    garch_results = results["module2_garch_results"]
    vol_comp = results["module2_vol_comparison"]
    spillover = results["module3_spillover"]
    qss = results["module4_qss"]
    mvo = results["module5_mvo_backtest"]
    assessment = results["consolidated_assessment"]

    if args.module in ["1", "all"]:
        print("\n" + "=" * 90)
        print(f" MODULE 1: EMPIRICAL RISK-RETURN PROFILING ({canonical_sector} + INDICES)")
        print("=" * 90)
        cols = [
            "Annualized Return", "Annualized Volatility", "Sharpe Ratio",
            "Sortino Ratio", "Parametric VaR (95%)", "Historical VaR (95%)",
            "Conditional VaR (95%)", "Max Drawdown"
        ]
        print(risk_profile[cols].to_string())

    if args.module in ["2", "all"]:
        print("\n" + "=" * 90)
        print(f" MODULE 2: DYNAMIC VOLATILITY FORECASTING ({sector_def['sector_index']})")
        print("=" * 90)
        print(vol_comp.to_string())

        print(f"\n[*] Calibrating GJR-GARCH(1,1,1) for all {canonical_sector} equities...")
        gjr_records = []
        for a in sector_def["stocks"]:
            if a in garch_results:
                fit = garch_results[a]
                gjr_records.append({
                    "Stock": a,
                    "Alpha": fit["alpha"],
                    "Beta": fit["beta"],
                    "Gamma (Leverage)": fit["gamma"],
                    "Persistence (a+b+g/2)": fit["persistence"],
                    "Half-Life (Days)": fit["half_life_days"],
                    "1-Day Ahead Vol": fit["forecast_horizons"]["1-Day Ahead (Ann Vol)"],
                    "21-Day Ahead Vol": fit["forecast_horizons"]["21-Day Ahead (Ann Vol)"]
                })
        print(pd.DataFrame(gjr_records).set_index("Stock").to_string())

    if args.module in ["3", "all"]:
        print("\n" + "=" * 90)
        print(f" MODULE 3: SYSTEMIC VOLATILITY SPILLOVER MATRIX (DIEBOLD-YILMAZ H={args.horizon})")
        print("=" * 90)
        print(spillover["spillover_table"].round(2).to_string())
        print(f"\n[>>>] {canonical_sector.upper()} SYSTEMIC SPILLOVER INDEX (SSI): {spillover['ssi']:.2f}%")

    if args.module in ["4", "all"]:
        print("\n" + "=" * 90)
        print(f" MODULE 4: QUANTITATIVE SECURITY SCORING (QSS) CONVICTION TIERS")
        print("=" * 90)
        cols = ["QSS_Rank", "Conviction_Rating", "QSS_Composite", "Sharpe", "Persistence", "CVaR_95", "Momentum"]
        print(qss[cols].to_string())

    if args.module in ["5", "all"]:
        print("\n" + "=" * 90)
        print(f" MODULE 5: MARKOWITZ MVO & WALK-FORWARD OUT-OF-SAMPLE BACKTEST")
        print("=" * 90)
        cols = ["Cumulative Return", "Annualized Return", "Annualized Volatility", "Sharpe Ratio", "Sortino Ratio", "Max Drawdown"]
        print(mvo["strategy_profile"][cols].to_string())
        print(f"\n[+] Out-of-Sample Portfolio NAVs (Base = ₹100.00):")
        for strat in mvo["nav"].columns:
            print(f"    - {strat:25s}: ₹{mvo['nav'][strat].iloc[-1]:.2f}")

    # CONSOLIDATED INDUSTRY ASSESSMENT
    print("\n" + "=" * 90)
    print(f" CONSOLIDATED INDUSTRY ASSESSMENT: {canonical_sector.upper()} SECTOR")
    print("=" * 90)
    print(f"[*] STRATEGIC VERDICT: {assessment['verdict']}")
    print(f"[*] RATIONALE: {assessment['rationale']}\n")

    print("[*] Macro Factors:")
    print(f"    • Beta to NIFTY 50      : {assessment['macro_metrics']['beta_to_nifty']:.4f}")
    print(f"    • Correlation to NIFTY  : {assessment['macro_metrics']['correlation_to_nifty']:.4f}")
    print(f"    • Sector Jensen's Alpha : {assessment['macro_metrics']['jensen_alpha']*100:+.2f}%")
    print(f"    • Sector Annualized Ret : {assessment['macro_metrics']['annualized_return']*100:.2f}% (Vol: {assessment['macro_metrics']['annualized_volatility']*100:.2f}%)")

    print("\n[*] Internal Interconnectedness & Fragility:")
    print(f"    • Sector Spillover (SSI): {assessment['network_connectedness']['systemic_spillover_index']:.2f}%")
    print(f"    • Average GJR Persistence: {assessment['volatility_dynamics']['average_persistence']:.4f} (Leverage Gamma: {assessment['volatility_dynamics']['average_leverage_gamma']:.4f})")

    print("\n[*] Recommended Conviction Stock Picks:")
    print(f"    • Top Tier 1 Conviction : {', '.join(assessment['conviction_stock_picks']['tier1_top_conviction'])}")
    print(f"    • High Tail Risk Caution: {', '.join(assessment['conviction_stock_picks']['laggards_high_tail_risk'])}")

    print("\n" + "=" * 90)
    print(" [SUCCESS] Indian Equity Sector Analysis Completed.")
    print("=" * 90 + "\n")


if __name__ == "__main__":
    run_cli()
