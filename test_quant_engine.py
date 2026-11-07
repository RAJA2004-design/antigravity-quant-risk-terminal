"""
Unit and Integration Tests for Quant Engine (Indian Equity Market Edition)
==========================================================================
Tests all 5 Econometric Modules + Indian Equity Sector Framework:
- Module 1: Risk-Return Profiling (Log returns, Sharpe, Sortino, Semi-Deviation, VaR 95%, CVaR 95%)
- Module 2: Dynamic Volatility Forecasting (GARCH, EGARCH, GJR-GARCH with gamma & persistence)
- Module 3: Systemic Volatility Spillover (Generalized FEVD, To-Others, From-Others, SSI)
- Module 4: Quantitative Security Scoring (QSS multi-factor conviction ranking)
- Module 5: Markowitz MVO & Walk-Forward Rebalancing Backtest
- Indian Sector Framework: Sector resolution, dynamic universe fetching, and consolidated assessment
"""

import unittest
import numpy as np
import pandas as pd

import indian_markets as im
from quant_engine import (
    generate_synthetic_market_data,
    compute_log_returns,
    compute_risk_return_profile,
    fit_garch_model,
    compare_volatility_models,
    compute_fevd_spillover,
    compute_rolling_spillover,
    compute_qss,
    optimize_portfolio,
    walk_forward_backtest,
    run_full_pipeline,
    run_sector_pipeline,
    generate_consolidated_industry_assessment
)


class TestQuantEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Generate reproducible 2-year market dataset with 4 assets
        cls.tickers = ["ASSET_A", "ASSET_B", "ASSET_C", "ASSET_D"]
        cls.prices = generate_synthetic_market_data(tickers=cls.tickers, n_days=504, seed=123)
        cls.returns = compute_log_returns(cls.prices)

    def test_module1_risk_return_profile(self):
        """Test Module 1: Risk-Return Profiling & Tail Risk Metrics"""
        profile = compute_risk_return_profile(self.returns, rf=0.065)
        self.assertEqual(list(profile.index), self.tickers)
        for asset in self.tickers:
            h_var = profile.loc[asset, "Historical VaR (95%)"]
            c_var = profile.loc[asset, "Conditional VaR (95%)"]
            self.assertGreaterEqual(c_var, h_var - 1e-6, f"CVaR must be >= VaR for {asset}")
        self.assertTrue((profile["Annualized Volatility"] > 0).all())

    def test_module2_garch_models(self):
        """Test Module 2: Dynamic Volatility Forecasting & Persistence"""
        r = self.returns["ASSET_A"]
        gjr = fit_garch_model(r, model_type="GJR-GARCH")
        expected_p = gjr["alpha"] + gjr["beta"] + 0.5 * gjr["gamma"]
        self.assertAlmostEqual(gjr["persistence"], expected_p, places=4)
        comp = compare_volatility_models(r)
        self.assertEqual(len(comp), 3)

    def test_module3_systemic_spillover(self):
        """Test Module 3: Diebold-Yilmaz Spillover & Generalized FEVD"""
        spill = compute_fevd_spillover(self.returns, max_lags=1, forecast_horizon=10)
        fevd = spill["fevd_matrix"]
        row_sums = fevd.sum(axis=1)
        for r_sum in row_sums:
            self.assertAlmostEqual(r_sum, 100.0, places=2)
        ssi = spill["ssi"]
        self.assertGreaterEqual(ssi, 0.0)
        self.assertLessEqual(ssi, 100.0)

    def test_module4_qss(self):
        """Test Module 4: Quantitative Security Scoring"""
        qss_df = compute_qss(self.returns, rf=0.065)
        self.assertEqual(len(qss_df), len(self.tickers))
        self.assertEqual(sorted(qss_df["QSS_Rank"].tolist()), list(range(1, len(self.tickers) + 1)))

    def test_module5_mvo_and_backtest(self):
        """Test Module 5: Markowitz Optimization & Walk-Forward Out-of-Sample Backtesting"""
        mu = self.returns.mean().values
        cov = self.returns.cov().values
        w_tan = optimize_portfolio(mu, cov, objective="max_sharpe", rf=0.065)
        self.assertAlmostEqual(np.sum(w_tan), 1.0, places=4)
        w_min = optimize_portfolio(mu, cov, objective="min_variance")
        self.assertAlmostEqual(np.sum(w_min), 1.0, places=4)
        res = walk_forward_backtest(self.returns, lookback=252, rebalance_freq=21, rf=0.065)
        self.assertIn("nav", res)
        self.assertEqual(len(res["strategy_profile"]), 3)

    def test_indian_sectors_taxonomy(self):
        """Test Indian Markets Sector Taxonomy & Universe Resolution"""
        sectors = im.list_supported_sectors()
        self.assertIn("Banking", sectors)
        self.assertIn("IT", sectors)
        self.assertIn("Pharmaceuticals", sectors)
        self.assertIn("Automobile", sectors)
        self.assertIn("FMCG", sectors)
        self.assertIn("Energy", sectors)
        self.assertIn("Metals", sectors)

        bank_def = im.get_sector_universe("bank")
        self.assertEqual(bank_def["sector_index"], "^NSEBANK")
        self.assertEqual(bank_def["benchmark_index"], "^NSEI")
        self.assertIn("HDFCBANK.NS", bank_def["stocks"])

        it_def = im.get_sector_universe("tech")
        self.assertEqual(it_def["sector_index"], "^CNXIT")
        self.assertIn("TCS.NS", it_def["stocks"])

    def test_sector_pipeline_and_assessment(self):
        """Test Dynamic Sector Pipeline & Consolidated Assessment on Indian Equities"""
        # Test on synthetic/fast subset of Banking
        res = run_sector_pipeline(sector_name="Banking", rf=0.065)
        self.assertIn("sector_name", res)
        self.assertIn("consolidated_assessment", res)
        assessment = res["consolidated_assessment"]
        self.assertIn("verdict", assessment)
        self.assertIn("macro_metrics", assessment)
        self.assertIn("beta_to_nifty", assessment["macro_metrics"])
        self.assertIn("systemic_spillover_index", assessment["network_connectedness"])
        self.assertIn("tier1_top_conviction", assessment["conviction_stock_picks"])


if __name__ == "__main__":
    unittest.main()
