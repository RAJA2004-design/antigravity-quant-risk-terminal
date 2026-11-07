"""
Unit and Integration Tests for Quant Engine
============================================
Tests all 5 Econometric Modules:
- Module 1: Risk-Return Profiling (Log returns, Sharpe, Sortino, Semi-Deviation, VaR 95%, CVaR 95%)
- Module 2: Dynamic Volatility Forecasting (GARCH, EGARCH, GJR-GARCH with gamma & persistence)
- Module 3: Systemic Volatility Spillover (Generalized FEVD, To-Others, From-Others, SSI)
- Module 4: Quantitative Security Scoring (QSS multi-factor conviction ranking)
- Module 5: Markowitz MVO & Walk-Forward Rebalancing Backtest
"""

import unittest
import numpy as np
import pandas as pd

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
    run_full_pipeline
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
        profile = compute_risk_return_profile(self.returns, rf=0.02)
        
        # Verify all assets present
        self.assertEqual(list(profile.index), self.tickers)
        
        # Verify required metrics exist
        required_cols = [
            "Annualized Return", "Annualized Volatility", "Sharpe Ratio",
            "Downside Semi-Dev", "Sortino Ratio", "Parametric VaR (95%)",
            "Historical VaR (95%)", "Conditional VaR (95%)",
            "Skewness", "Excess Kurtosis", "Max Drawdown", "Calmar Ratio"
        ]
        for col in required_cols:
            self.assertIn(col, profile.columns)
            
        # Mathematical consistency checks:
        # 1. CVaR (Expected Shortfall) must be >= Historical VaR at 95%
        for asset in self.tickers:
            h_var = profile.loc[asset, "Historical VaR (95%)"]
            c_var = profile.loc[asset, "Conditional VaR (95%)"]
            self.assertGreaterEqual(c_var, h_var - 1e-6, f"CVaR must be >= VaR for {asset}")
            
        # 2. Volatility must be positive
        self.assertTrue((profile["Annualized Volatility"] > 0).all())
        
        # 3. Downside Semi-Deviation must be positive
        self.assertTrue((profile["Downside Semi-Dev"] > 0).all())

    def test_module2_garch_models(self):
        """Test Module 2: Dynamic Volatility Forecasting & Persistence"""
        r = self.returns["ASSET_A"]
        
        # GJR-GARCH
        gjr = fit_garch_model(r, model_type="GJR-GARCH")
        self.assertIn("persistence", gjr)
        self.assertIn("gamma", gjr)
        # Persistence formula for GJR-GARCH: alpha + beta + gamma / 2
        expected_p = gjr["alpha"] + gjr["beta"] + 0.5 * gjr["gamma"]
        self.assertAlmostEqual(gjr["persistence"], expected_p, places=4)
        
        # GARCH(1,1)
        garch = fit_garch_model(r, model_type="GARCH")
        expected_garch_p = garch["alpha"] + garch["beta"]
        self.assertAlmostEqual(garch["persistence"], expected_garch_p, places=4)
        
        # EGARCH(1,1)
        egarch = fit_garch_model(r, model_type="EGARCH")
        self.assertAlmostEqual(egarch["persistence"], egarch["beta"], places=4)
        
        # Model Comparison Table
        comp = compare_volatility_models(r)
        self.assertEqual(len(comp), 3)
        self.assertIn("Persistence", comp.columns)
        self.assertIn("Gamma (Leverage)", comp.columns)

    def test_module3_systemic_spillover(self):
        """Test Module 3: Diebold-Yilmaz Spillover & Generalized FEVD"""
        spill = compute_fevd_spillover(self.returns, max_lags=1, forecast_horizon=10)
        
        fevd = spill["fevd_matrix"]
        self.assertEqual(fevd.shape, (len(self.tickers), len(self.tickers)))
        
        # Row sums of FEVD must equal 100.0%
        row_sums = fevd.sum(axis=1)
        for r_sum in row_sums:
            self.assertAlmostEqual(r_sum, 100.0, places=2)
            
        # SSI must be between 0 and 100%
        ssi = spill["ssi"]
        self.assertGreaterEqual(ssi, 0.0)
        self.assertLessEqual(ssi, 100.0)
        
        # Net spillover sum must equal 0 (closed system conservation)
        net_sum = spill["net_spillover"].sum()
        self.assertAlmostEqual(net_sum, 0.0, places=2)

    def test_module4_qss(self):
        """Test Module 4: Quantitative Security Scoring"""
        qss_df = compute_qss(self.returns, rf=0.02)
        
        self.assertEqual(len(qss_df), len(self.tickers))
        self.assertIn("QSS_Composite", qss_df.columns)
        self.assertIn("QSS_Rank", qss_df.columns)
        self.assertIn("Conviction_Rating", qss_df.columns)
        
        # Verify ranks are unique permutations from 1 to N
        self.assertEqual(sorted(qss_df["QSS_Rank"].tolist()), list(range(1, len(self.tickers) + 1)))

    def test_module5_mvo_and_backtest(self):
        """Test Module 5: Markowitz Optimization & Walk-Forward Out-of-Sample Backtesting"""
        mu = self.returns.mean().values
        cov = self.returns.cov().values
        
        # Tangency Max Sharpe
        w_tan = optimize_portfolio(mu, cov, objective="max_sharpe")
        self.assertAlmostEqual(np.sum(w_tan), 1.0, places=4)
        self.assertTrue((w_tan >= -1e-6).all())
        
        # Global Minimum Variance
        w_min = optimize_portfolio(mu, cov, objective="min_variance")
        self.assertAlmostEqual(np.sum(w_min), 1.0, places=4)
        self.assertTrue((w_min >= -1e-6).all())
        
        # Walk-Forward Backtest
        res = walk_forward_backtest(self.returns, lookback=252, rebalance_freq=21, rf=0.02)
        self.assertIn("nav", res)
        self.assertIn("strategy_profile", res)
        self.assertTrue((res["nav"] > 0).all().all())
        self.assertEqual(len(res["strategy_profile"]), 3)

    def test_full_pipeline_orchestrator(self):
        """Test End-to-End Orchestrator Pipeline"""
        pipeline = run_full_pipeline(prices_or_returns=self.prices, rf=0.02)
        self.assertIn("module1_risk_profile", pipeline)
        self.assertIn("module2_garch_results", pipeline)
        self.assertIn("module3_spillover", pipeline)
        self.assertIn("module4_qss", pipeline)
        self.assertIn("module5_mvo_backtest", pipeline)


if __name__ == "__main__":
    unittest.main()
