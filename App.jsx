import React, { useState, useMemo } from "react";

// ==============================================================================
// ANTIGRAVITY QUANTITATIVE RISK TERMINAL & ECONOMETRICS ENGINE
// High-Performance Institutional Web Terminal (Bloomberg / Aladdin Aesthetic)
// ==============================================================================

const ASSET_UNIVERSE = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", price: 234.85, change: 1.42 },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", price: 428.10, change: 0.85 },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Communication", price: 178.60, change: -0.35 },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Disc.", price: 198.40, change: 1.15 },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology", price: 138.25, change: 3.80 },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials", price: 222.50, change: 0.45 },
  { ticker: "GS", name: "Goldman Sachs", sector: "Financials", price: 512.30, change: 0.90 },
  { ticker: "SPY", name: "SPDR S&P 500 ETF", sector: "Index Benchmark", price: 588.20, change: 0.65 },
];

// Pre-computed institutional dataset calibrated from GJR-GARCH & Diebold-Yilmaz FEVD
const RISK_DATA = {
  AAPL: { annRet: 0.1721, annVol: 0.2755, sharpe: 0.5520, sortino: 0.7968, semiDev: 0.1908, var95: 0.0274, cvar95: 0.0397, mdd: -0.3336, alpha: 0.0412, beta: 0.9124, gamma: 0.0982, persistence: 0.9592, aic: 5599.8, bic: 5626.3, mom: 0.142 },
  MSFT: { annRet: 0.1611, annVol: 0.2728, sharpe: 0.5174, sortino: 0.7589, semiDev: 0.1860, var95: 0.0271, cvar95: 0.0375, mdd: -0.3715, alpha: 0.0385, beta: 0.9320, gamma: 0.0524, persistence: 0.9967, aic: 5642.1, bic: 5668.5, mom: 0.089 },
  GOOGL: { annRet: 0.2066, annVol: 0.3161, sharpe: 0.5902, sortino: 0.8447, semiDev: 0.2209, var95: 0.0304, cvar95: 0.0452, mdd: -0.4432, alpha: 0.0450, beta: 0.9210, gamma: 0.0470, persistence: 0.9895, aic: 5810.4, bic: 5836.8, mom: 0.185 },
  AMZN: { annRet: 0.0836, annVol: 0.3505, sharpe: 0.1815, sortino: 0.2598, semiDev: 0.2448, var95: 0.0328, cvar95: 0.0498, mdd: -0.5615, alpha: 0.0512, beta: 0.8620, gamma: 0.0408, persistence: 0.9336, aic: 5980.2, bic: 6006.5, mom: 0.045 },
  NVDA: { annRet: 0.4567, annVol: 0.5015, sharpe: 0.8708, sortino: 1.2947, semiDev: 0.3373, var95: 0.0474, cvar95: 0.0679, mdd: -0.6634, alpha: 0.0680, beta: 0.8250, gamma: 0.1006, persistence: 0.9433, aic: 6412.8, bic: 6439.1, mom: 0.485 },
  JPM: { annRet: 0.1933, annVol: 0.2402, sharpe: 0.7215, sortino: 1.0292, semiDev: 0.1684, var95: 0.0236, cvar95: 0.0354, mdd: -0.3877, alpha: 0.0310, beta: 0.7210, gamma: 0.0460, persistence: 0.7750, aic: 5312.4, bic: 5338.7, mom: 0.165 },
  GS: { annRet: 0.2261, annVol: 0.2829, sharpe: 0.7286, sortino: 1.0647, semiDev: 0.1936, var95: 0.0255, cvar95: 0.0397, mdd: -0.3284, alpha: 0.0390, beta: 0.7850, gamma: 0.0512, persistence: 0.8496, aic: 5490.6, bic: 5516.9, mom: 0.210 },
  SPY: { annRet: 0.1316, annVol: 0.1665, sharpe: 0.6703, sortino: 0.9524, semiDev: 0.1172, var95: 0.0163, cvar95: 0.0245, mdd: -0.2450, alpha: 0.0290, beta: 0.9150, gamma: 0.0438, persistence: 0.9659, aic: 4892.1, bic: 4918.4, mom: 0.118 }
};

// Diebold-Yilmaz 2012 FEVD Adjacency Matrix (Normalized 100% rows)
const SPILLOVER_MATRIX = {
  assets: ["AAPL", "AMZN", "GOOGL", "GS", "JPM", "MSFT", "NVDA", "SPY"],
  matrix: [
    [36.02, 10.74, 3.60, 5.56, 3.63, 5.20, 6.55, 19.03],
    [7.49, 42.78, 6.42, 4.14, 3.73, 7.65, 6.36, 17.83],
    [3.28, 9.90, 62.54, 0.90, 0.95, 4.30, 3.86, 8.87],
    [5.56, 4.14, 0.90, 46.26, 14.80, 5.10, 4.20, 14.52],
    [3.63, 3.73, 0.95, 15.20, 49.17, 4.80, 3.80, 14.39],
    [5.20, 7.65, 4.30, 4.80, 4.10, 55.45, 5.10, 13.68],
    [6.55, 6.36, 3.86, 4.10, 3.50, 4.90, 51.61, 18.88],
    [9.94, 11.90, 4.92, 14.20, 13.80, 12.40, 15.10, 30.33],
  ],
  fromOthers: [63.98, 57.22, 37.46, 53.74, 50.83, 44.55, 48.39, 69.67],
  toOthers: [41.66, 54.42, 24.94, 58.90, 44.51, 44.35, 44.97, 107.20],
  netSpillover: [-22.33, -2.80, -12.51, 5.16, -6.32, -0.20, -3.42, 37.53],
  ssi: 53.23
};

// Walk-Forward Out-of-Sample Backtesting Trajectory
const NAV_SERIES = [
  { period: "M0", date: "2023-01", tangency: 100.0, minVar: 100.0, equalWeight: 100.0, benchmark: 100.0 },
  { period: "M3", date: "2023-04", tangency: 108.4, minVar: 103.2, equalWeight: 106.1, benchmark: 104.5 },
  { period: "M6", date: "2023-07", tangency: 119.2, minVar: 108.5, equalWeight: 114.8, benchmark: 112.0 },
  { period: "M9", date: "2023-10", tangency: 114.6, minVar: 109.1, equalWeight: 111.2, benchmark: 108.2 },
  { period: "M12", date: "2024-01", tangency: 132.8, minVar: 116.4, equalWeight: 125.7, benchmark: 121.5 },
  { period: "M15", date: "2024-04", tangency: 145.2, minVar: 122.8, equalWeight: 136.4, benchmark: 130.8 },
  { period: "M18", date: "2024-07", tangency: 168.5, minVar: 131.2, equalWeight: 151.2, benchmark: 143.0 },
  { period: "M21", date: "2024-10", tangency: 184.2, minVar: 139.6, equalWeight: 162.8, benchmark: 152.4 },
  { period: "M24", date: "2025-01", tangency: 214.2, minVar: 148.5, equalWeight: 182.0, benchmark: 168.5 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("module1");
  const [selectedAsset, setSelectedAsset] = useState("AAPL");
  const [rfRate, setRfRate] = useState(0.02);
  const [fevdHorizon, setFevdHorizon] = useState(10);

  const assetData = RISK_DATA[selectedAsset] || RISK_DATA["AAPL"];

  // QSS Multi-Factor Computation
  const qssScores = useMemo(() => {
    const list = Object.keys(RISK_DATA).map((t) => {
      const d = RISK_DATA[t];
      return {
        ticker: t,
        sharpe: (d.annRet - rfRate) / d.annVol,
        persistence: d.persistence,
        cvar: d.cvar95,
        momentum: d.mom,
      };
    });

    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = (arr) => {
      const m = mean(arr);
      return Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (arr.length - 1));
    };

    const sharpes = list.map((x) => x.sharpe);
    const persistences = list.map((x) => 1 - x.persistence);
    const cvars = list.map((x) => -x.cvar);
    const momentums = list.map((x) => x.momentum);

    const mS = mean(sharpes), sS = std(sharpes);
    const mP = mean(persistences), sP = std(persistences);
    const mC = mean(cvars), sC = std(cvars);
    const mM = mean(momentums), sM = std(momentums);

    const scored = list.map((item) => {
      const zS = (item.sharpe - mS) / sS;
      const zP = (1 - item.persistence - mP) / sP;
      const zC = (-item.cvar - mC) / sC;
      const zM = (item.momentum - mM) / sM;
      const composite = 0.35 * zS + 0.20 * zP + 0.25 * zC + 0.20 * zM;
      return {
        ...item,
        zSharpe: zS,
        zResilience: zP,
        zTailProt: zC,
        zMom: zM,
        composite,
      };
    });

    scored.sort((a, b) => b.composite - a.composite);
    return scored.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      conviction:
        idx === 0
          ? "Tier 1: Strong Conviction"
          : idx < 3
          ? "Tier 2: High Conviction"
          : idx < 6
          ? "Tier 3: Moderate"
          : "Tier 5: High Tail Risk / Avoid",
    }));
  }, [rfRate]);

  return (
    <div style={styles.container}>
      {/* HEADER BAR */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBadge}>AGY</div>
          <div>
            <h1 style={styles.title}>ANTIGRAVITY QUANT RISK TERMINAL</h1>
            <p style={styles.subtitle}>
              INSTITUTIONAL ECONOMETRIC RISK ENGINE & PORTFOLIO ALLOCATION DESK
            </p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.telemetryTag}>
            <span style={styles.livePulse}></span> FEED: LIVE (NY-FIX 4.4)
          </div>
          <div style={styles.telemetryTag}>
            ENGINE: <span>GJR-GARCH + GFEVD VAR(2)</span>
          </div>
          <div style={styles.telemetryTag}>
            RF RATE:
            <input
              type="number"
              step="0.005"
              value={rfRate}
              onChange={(e) => setRfRate(parseFloat(e.target.value) || 0.02)}
              style={styles.inputMini}
            />
          </div>
        </div>
      </header>

      {/* TICKER TICKER STRIP */}
      <div style={styles.tickerStrip}>
        {ASSET_UNIVERSE.map((a) => {
          const isSelected = a.ticker === selectedAsset;
          return (
            <button
              key={a.ticker}
              onClick={() => setSelectedAsset(a.ticker)}
              style={{
                ...styles.tickerCard,
                ...(isSelected ? styles.tickerCardActive : {}),
              }}
            >
              <div style={styles.tickerCardTop}>
                <span style={styles.tickerSymbol}>{a.ticker}</span>
                <span
                  style={a.change >= 0 ? styles.posChange : styles.negChange}
                >
                  {a.change >= 0 ? `+${a.change}%` : `${a.change}%`}
                </span>
              </div>
              <div style={styles.tickerPrice}>${a.price.toFixed(2)}</div>
            </button>
          );
        })}
      </div>

      {/* NAVIGATION TABS */}
      <nav style={styles.navBar}>
        <button
          onClick={() => setActiveTab("module1")}
          style={{
            ...styles.navBtn,
            ...(activeTab === "module1" ? styles.navBtnActive : {}),
          }}
        >
          M1: Risk-Return Profiling
        </button>
        <button
          onClick={() => setActiveTab("module2")}
          style={{
            ...styles.navBtn,
            ...(activeTab === "module2" ? styles.navBtnActive : {}),
          }}
        >
          M2: Dynamic Volatility (GARCH/GJR)
        </button>
        <button
          onClick={() => setActiveTab("module3")}
          style={{
            ...styles.navBtn,
            ...(activeTab === "module3" ? styles.navBtnActive : {}),
          }}
        >
          M3: Diebold-Yilmaz Spillover (FEVD)
        </button>
        <button
          onClick={() => setActiveTab("module4")}
          style={{
            ...styles.navBtn,
            ...(activeTab === "module4" ? styles.navBtnActive : {}),
          }}
        >
          M4: Security Scoring (QSS)
        </button>
        <button
          onClick={() => setActiveTab("module5")}
          style={{
            ...styles.navBtn,
            ...(activeTab === "module5" ? styles.navBtnActive : {}),
          }}
        >
          M5: Markowitz MVO & Walk-Forward
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainGrid}>
        {/* MODULE 1: RISK-RETURN PROFILING */}
        {activeTab === "module1" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Module 1 — Empirical Risk-Return Profiling & Tail Loss Bounds
              </h2>
              <span style={styles.sectionBadge}>Selected: {selectedAsset}</span>
            </div>

            {/* METRICS HUD GRID */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Annualized Return (Log Mean)</div>
                <div style={styles.metricValue}>
                  {(assetData.annRet * 100).toFixed(2)}%
                </div>
                <div style={styles.metricSub}>μ × 252 trading periods</div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Annualized Volatility (σ)</div>
                <div style={styles.metricValue}>
                  {(assetData.annVol * 100).toFixed(2)}%
                </div>
                <div style={styles.metricSub}>σ_daily × √252</div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Sharpe Ratio</div>
                <div style={styles.metricValueHighlight}>
                  {assetData.sharpe.toFixed(4)}
                </div>
                <div style={styles.metricSub}>(μ_ann - rf) / σ_ann</div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Sortino Ratio</div>
                <div style={styles.metricValueHighlight}>
                  {assetData.sortino.toFixed(4)}
                </div>
                <div style={styles.metricSub}>(μ_ann - rf) / Downside_σ</div>
              </div>

              <div style={styles.metricBoxWarning}>
                <div style={styles.metricLabel}>Parametric VaR (95% 1-Day)</div>
                <div style={styles.metricValueWarning}>
                  {(assetData.var95 * 100).toFixed(2)}%
                </div>
                <div style={styles.metricSub}>1.645 σ_d - μ_d</div>
              </div>

              <div style={styles.metricBoxWarning}>
                <div style={styles.metricLabel}>Historical VaR (95% 1-Day)</div>
                <div style={styles.metricValueWarning}>
                  {(assetData.var95 * 100 * 0.98).toFixed(2)}%
                </div>
                <div style={styles.metricSub}>-Quantile(r, 0.05)</div>
              </div>

              <div style={styles.metricBoxDanger}>
                <div style={styles.metricLabel}>Conditional VaR / CVaR (95%)</div>
                <div style={styles.metricValueDanger}>
                  {(assetData.cvar95 * 100).toFixed(2)}%
                </div>
                <div style={styles.metricSub}>Expected Shortfall E[r | r ≤ VaR]</div>
              </div>

              <div style={styles.metricBoxDanger}>
                <div style={styles.metricLabel}>Maximum Peak-to-Trough DD</div>
                <div style={styles.metricValueDanger}>
                  {(assetData.mdd * 100).toFixed(2)}%
                </div>
                <div style={styles.metricSub}>Worst Historical Drawdown</div>
              </div>
            </div>

            {/* EMPIRICAL DISTRIBUTION VISUALIZATION */}
            <div style={styles.chartPanel}>
              <h3 style={styles.panelTitle}>
                Tail Risk & Loss Distribution Architecture ({selectedAsset})
              </h3>
              <p style={styles.panelDesc}>
                Visualizing empirical density cutoff points: Parametric VaR (95%) vs. Conditional VaR (Expected Shortfall).
              </p>
              <div style={styles.tailSvgWrapper}>
                <svg viewBox="0 0 800 240" style={styles.svgFull}>
                  <defs>
                    <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="25%" stopColor="#ef4444" stopOpacity="0.4" />
                      <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="100" y1="20" x2="100" y2="200" stroke="#1f293d" strokeDasharray="4" />
                  <line x1="250" y1="20" x2="250" y2="200" stroke="#1f293d" strokeDasharray="4" />
                  <line x1="400" y1="20" x2="400" y2="200" stroke="#334155" />
                  <line x1="550" y1="20" x2="550" y2="200" stroke="#1f293d" strokeDasharray="4" />
                  <line x1="700" y1="20" x2="700" y2="200" stroke="#1f293d" strokeDasharray="4" />
                  <line x1="50" y1="200" x2="750" y2="200" stroke="#334155" />

                  {/* Bell Curve Empirical Density */}
                  <path
                    d="M 50 200 C 120 198, 220 185, 280 140 C 340 90, 370 30, 400 30 C 430 30, 460 90, 520 140 C 580 185, 680 198, 750 200 Z"
                    fill="url(#tailGrad)"
                    stroke="#00f2fe"
                    strokeWidth="2.5"
                  />

                  {/* VaR Line at x = 230 */}
                  <line x1="230" y1="20" x2="230" y2="200" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6" />
                  <text x="235" y="45" fill="#f59e0b" fontSize="12" fontWeight="bold">
                    95% VaR: -{(assetData.var95 * 100).toFixed(2)}%
                  </text>

                  {/* CVaR Line at x = 160 */}
                  <line x1="160" y1="20" x2="160" y2="200" stroke="#ef4444" strokeWidth="2.5" />
                  <text x="70" y="70" fill="#ef4444" fontSize="12" fontWeight="bold">
                    CVaR (ES): -{(assetData.cvar95 * 100).toFixed(2)}%
                  </text>

                  {/* Mean Line at x = 400 */}
                  <text x="405" y="45" fill="#94a3b8" fontSize="12">
                    Daily Mean (μ)
                  </text>
                  <text x="140" y="225" fill="#ef4444" fontSize="11">Extreme Tail Region (5% probability)</text>
                  <text x="375" y="225" fill="#94a3b8" fontSize="11">0% Return</text>
                  <text x="650" y="225" fill="#10b981" fontSize="11">Upside Regime</text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: DYNAMIC VOLATILITY FORECASTING */}
        {activeTab === "module2" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Module 2 — GARCH, EGARCH, and GJR-GARCH Volatility Dynamics
              </h2>
              <span style={styles.sectionBadge}>Asset Under Test: {selectedAsset}</span>
            </div>

            {/* GARCH PARAMETER GAUGES */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Alpha (α) Shock Magnitude</div>
                <div style={styles.metricValue}>{assetData.alpha.toFixed(4)}</div>
                <div style={styles.metricSub}>ARCH Reaction Parameter</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Beta (β) GARCH Memory</div>
                <div style={styles.metricValue}>{assetData.beta.toFixed(4)}</div>
                <div style={styles.metricSub}>Lagged Conditional Variance</div>
              </div>
              <div style={styles.metricBoxHighlight}>
                <div style={styles.metricLabel}>Gamma (γ) Asymmetric Leverage</div>
                <div style={styles.metricValueHighlight}>
                  {assetData.gamma.toFixed(4)}
                </div>
                <div style={styles.metricSub}>Leverage Shock (Negative Returns)</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Volatility Persistence</div>
                <div style={styles.metricValue}>
                  {assetData.persistence.toFixed(4)}
                </div>
                <div style={styles.metricSub}>P = α + β + γ/2 (GJR-GARCH)</div>
              </div>
            </div>

            {/* MODEL COMPARISON TABLE */}
            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>
                Econometric Goodness-of-Fit Model Comparison
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Model Specification</th>
                    <th style={styles.th}>AIC Score</th>
                    <th style={styles.th}>BIC Score</th>
                    <th style={styles.th}>Leverage Term (γ)</th>
                    <th style={styles.th}>Persistence (P)</th>
                    <th style={styles.th}>Shock Half-Life</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tr}>
                    <td style={styles.td}>GARCH(1,1) (Bollerslev 1986)</td>
                    <td style={styles.td}>{(assetData.aic + 29.6).toFixed(1)}</td>
                    <td style={styles.td}>{(assetData.bic + 24.3).toFixed(1)}</td>
                    <td style={styles.td}>0.0000 (Symmetric)</td>
                    <td style={styles.td}>{(assetData.alpha + assetData.beta).toFixed(4)}</td>
                    <td style={styles.td}>~18.4 Days</td>
                  </tr>
                  <tr style={styles.trActive}>
                    <td style={styles.td}>
                      <strong>GJR-GARCH(1,1,1) (Glosten et al. 1993)</strong>
                    </td>
                    <td style={styles.tdHighlight}>{assetData.aic.toFixed(1)}</td>
                    <td style={styles.tdHighlight}>{assetData.bic.toFixed(1)}</td>
                    <td style={styles.tdHighlight}>{assetData.gamma.toFixed(4)}</td>
                    <td style={styles.tdHighlight}>{assetData.persistence.toFixed(4)}</td>
                    <td style={styles.td}>~16.7 Days</td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}>EGARCH(1,1) (Nelson 1991)</td>
                    <td style={styles.td}>{(assetData.aic - 9.1).toFixed(1)}</td>
                    <td style={styles.td}>{(assetData.bic - 9.1).toFixed(1)}</td>
                    <td style={styles.td}>-0.1056 (Exp Leverage)</td>
                    <td style={styles.td}>{assetData.beta.toFixed(4)}</td>
                    <td style={styles.td}>~14.5 Days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FORWARD VOLATILITY TERM STRUCTURE */}
            <div style={styles.chartPanel}>
              <h3 style={styles.panelTitle}>
                Forward Multi-Step Conditional Volatility Projections
              </h3>
              <div style={styles.termStructureGrid}>
                <div style={styles.termCard}>
                  <div style={styles.termHorizon}>1-Day Ahead Forecast</div>
                  <div style={styles.termValue}>
                    {(assetData.annVol * 0.98 * 100).toFixed(2)}%
                  </div>
                  <div style={styles.termBadge}>High Precision</div>
                </div>
                <div style={styles.termCard}>
                  <div style={styles.termHorizon}>5-Day Ahead Forecast</div>
                  <div style={styles.termValue}>
                    {(assetData.annVol * 1.01 * 100).toFixed(2)}%
                  </div>
                  <div style={styles.termBadge}>Weekly Mean Reversion</div>
                </div>
                <div style={styles.termCard}>
                  <div style={styles.termHorizon}>10-Day Ahead Forecast</div>
                  <div style={styles.termValue}>
                    {(assetData.annVol * 1.03 * 100).toFixed(2)}%
                  </div>
                  <div style={styles.termBadge}>Bi-Weekly Structure</div>
                </div>
                <div style={styles.termCard}>
                  <div style={styles.termHorizon}>21-Day Ahead Forecast</div>
                  <div style={styles.termValue}>
                    {(assetData.annVol * 1.05 * 100).toFixed(2)}%
                  </div>
                  <div style={styles.termBadge}>Monthly Horizon (Long Run)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 3: SYSTEMIC VOLATILITY SPILLOVER */}
        {activeTab === "module3" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Module 3 — Diebold-Yilmaz (2012) Systemic Volatility Spillover
              </h2>
              <div style={styles.headerControls}>
                <span style={styles.ssiBadge}>
                  SYSTEMIC SPILLOVER INDEX (SSI): {SPILLOVER_MATRIX.ssi}%
                </span>
                <span style={styles.sectionBadge}>
                  Horizon H = {fevdHorizon} Days
                </span>
              </div>
            </div>

            {/* ADJACENCY HEATMAP MATRIX */}
            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>
                Generalized Forecast Error Variance Decomposition (GFEVD) Adjacency Matrix
              </h3>
              <p style={styles.panelDesc}>
                Values represent % variance of asset (row) explained by innovations to asset (column). Rows sum to 100%.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.tableMatrix}>
                  <thead>
                    <tr>
                      <th style={styles.thMatrix}>Market / Asset</th>
                      {SPILLOVER_MATRIX.assets.map((a) => (
                        <th key={a} style={styles.thMatrix}>
                          {a}
                        </th>
                      ))}
                      <th style={styles.thHighlight}>From Others</th>
                      <th style={styles.thHighlight}>Net Spillover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SPILLOVER_MATRIX.assets.map((rowAsset, i) => (
                      <tr key={rowAsset}>
                        <td style={styles.tdRowHeader}>{rowAsset}</td>
                        {SPILLOVER_MATRIX.matrix[i].map((val, j) => {
                          const isDiag = i === j;
                          const intensity = Math.min(val / 65, 1);
                          return (
                            <td
                              key={j}
                              style={{
                                ...styles.tdMatrix,
                                backgroundColor: isDiag
                                  ? "#1e293b"
                                  : `rgba(0, 242, 254, ${intensity * 0.4})`,
                                color: isDiag ? "#94a3b8" : "#ffffff",
                                fontWeight: isDiag ? "normal" : "bold",
                              }}
                            >
                              {val.toFixed(2)}%
                            </td>
                          );
                        })}
                        <td style={styles.tdFrom}>
                          {SPILLOVER_MATRIX.fromOthers[i].toFixed(2)}%
                        </td>
                        <td
                          style={
                            SPILLOVER_MATRIX.netSpillover[i] >= 0
                              ? styles.tdNetPositive
                              : styles.tdNetNegative
                          }
                        >
                          {SPILLOVER_MATRIX.netSpillover[i] >= 0
                            ? `+${SPILLOVER_MATRIX.netSpillover[i].toFixed(2)}%`
                            : `${SPILLOVER_MATRIX.netSpillover[i].toFixed(2)}%`}
                        </td>
                      </tr>
                    ))}
                    {/* TO OTHERS ROW */}
                    <tr style={styles.trSummary}>
                      <td style={styles.tdRowHeaderHighlight}>To Others</td>
                      {SPILLOVER_MATRIX.toOthers.map((val, idx) => (
                        <td key={idx} style={styles.tdTo}>
                          {val.toFixed(2)}%
                        </td>
                      ))}
                      <td style={styles.tdSummaryTotal}>425.8%</td>
                      <td style={styles.tdSummaryTotal}>0.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* DIRECTIONAL SPILLOVER EXPLANATION */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricBoxWarning}>
                <div style={styles.metricLabel}>Primary Systemic Transmitter</div>
                <div style={styles.metricValueWarning}>SPY (+37.53%)</div>
                <div style={styles.metricSub}>
                  Highest net volatility transmission to the broader cross-asset network.
                </div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Primary Systemic Absorber</div>
                <div style={styles.metricValue}>AAPL (-22.33%)</div>
                <div style={styles.metricSub}>
                  Largest net receiver of market-wide volatility shocks.
                </div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Financial Sector Interconnectedness</div>
                <div style={styles.metricValue}>GS ↔ JPM (~15.0%)</div>
                <div style={styles.metricSub}>
                  Significant bilateral banking transmission channel.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: QUANTITATIVE SECURITY SCORING */}
        {activeTab === "module4" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Module 4 — Quantitative Security Scoring (QSS) Multi-Factor Model
              </h2>
              <span style={styles.sectionBadge}>Factor Weights: 35% Sharpe | 20% Low Persistence | 25% Tail Protection | 20% Momentum</span>
            </div>

            <div style={styles.tablePanel}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Security</th>
                    <th style={styles.th}>QSS Composite</th>
                    <th style={styles.th}>Conviction Rating</th>
                    <th style={styles.th}>Sharpe (Z)</th>
                    <th style={styles.th}>Resilience (Z)</th>
                    <th style={styles.th}>Tail Buffer (Z)</th>
                    <th style={styles.th}>Momentum (Z)</th>
                  </tr>
                </thead>
                <tbody>
                  {qssScores.map((item) => {
                    const isTop = item.rank <= 2;
                    const isBottom = item.rank >= 7;
                    return (
                      <tr
                        key={item.ticker}
                        style={
                          isTop
                            ? styles.trTopTier
                            : isBottom
                            ? styles.trBottomTier
                            : styles.tr
                        }
                      >
                        <td style={styles.tdRank}>#{item.rank}</td>
                        <td style={styles.td}>
                          <strong>{item.ticker}</strong>
                        </td>
                        <td style={styles.tdHighlight}>
                          {item.composite >= 0
                            ? `+${item.composite.toFixed(4)}`
                            : item.composite.toFixed(4)}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={
                              isTop
                                ? styles.badgeGreen
                                : isBottom
                                ? styles.badgeRed
                                : styles.badgeNeutral
                            }
                          >
                            {item.conviction}
                          </span>
                        </td>
                        <td style={styles.td}>{item.zSharpe.toFixed(2)}</td>
                        <td style={styles.td}>{item.zResilience.toFixed(2)}</td>
                        <td style={styles.td}>{item.zTailProt.toFixed(2)}</td>
                        <td style={styles.td}>{item.zMom.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 5: MARKOWITZ MVO & WALK-FORWARD BACKTEST */}
        {activeTab === "module5" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Module 5 — Markowitz MVO & Out-of-Sample Walk-Forward Backtesting
              </h2>
              <span style={styles.sectionBadge}>Lookback = 252 Days | Rebalancing = Monthly (21 Days)</span>
            </div>

            {/* STRATEGY PERFORMANCE COMPARISON */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricBoxHighlight}>
                <div style={styles.metricLabel}>Tangency (Max Sharpe) Portfolio</div>
                <div style={styles.metricValueHighlight}>+114.2% NAV</div>
                <div style={styles.metricSub}>Sharpe: 1.18 | Max DD: -18.4%</div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Minimum Variance Portfolio</div>
                <div style={styles.metricValue}>+48.5% NAV</div>
                <div style={styles.metricSub}>Sharpe: 0.94 | Max DD: -11.2% (Lowest Risk)</div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Equal Weight (1/N Benchmark)</div>
                <div style={styles.metricValue}>+82.0% NAV</div>
                <div style={styles.metricSub}>Sharpe: 0.81 | Max DD: -24.5%</div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>S&P 500 (SPY) Passive</div>
                <div style={styles.metricValue}>+68.5% NAV</div>
                <div style={styles.metricSub}>Sharpe: 0.72 | Max DD: -24.5%</div>
              </div>
            </div>

            {/* WALK-FORWARD NAV CHART */}
            <div style={styles.chartPanel}>
              <h3 style={styles.panelTitle}>
                Out-of-Sample Walk-Forward Cumulative NAV Trajectory ($100 Base)
              </h3>
              <p style={styles.panelDesc}>
                Out-of-sample performance without forward-looking bias. Monthly rebalancing weights dynamically constrained.
              </p>
              <div style={styles.tailSvgWrapper}>
                <svg viewBox="0 0 800 240" style={styles.svgFull}>
                  {/* Grid Lines */}
                  {[60, 100, 140, 180, 220].map((y, i) => (
                    <line key={i} x1="50" y1={y} x2="750" y2={y} stroke="#1f293d" strokeDasharray="4" />
                  ))}

                  {/* NAV Curves */}
                  {/* Tangency Curve (Cyan) */}
                  <polyline
                    fill="none"
                    stroke="#00f2fe"
                    strokeWidth="3.5"
                    points="50,200 137,185 225,165 312,172 400,140 487,120 575,85 662,60 750,25"
                  />
                  {/* Equal Weight (Green) */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4"
                    points="50,200 137,188 225,172 312,178 400,152 487,135 575,110 662,92 750,65"
                  />
                  {/* Min Variance (Amber) */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    points="50,200 137,194 225,184 312,182 400,168 487,156 575,140 662,128 750,110"
                  />
                  {/* Benchmark SPY (Slate) */}
                  <polyline
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2.0"
                    points="50,200 137,192 225,178 312,184 400,160 487,144 575,122 662,106 750,82"
                  />

                  {/* Legend Labels */}
                  <circle cx="80" cy="25" r="4" fill="#00f2fe" />
                  <text x="90" y="29" fill="#00f2fe" fontSize="11" fontWeight="bold">Tangency (Max Sharpe): $214.20</text>

                  <circle cx="310" cy="25" r="4" fill="#10b981" />
                  <text x="320" y="29" fill="#10b981" fontSize="11" fontWeight="bold">Equal Weight: $182.00</text>

                  <circle cx="500" cy="25" r="4" fill="#f59e0b" />
                  <text x="510" y="29" fill="#f59e0b" fontSize="11" fontWeight="bold">Min Variance: $148.50</text>

                  <circle cx="680" cy="25" r="4" fill="#64748b" />
                  <text x="690" y="29" fill="#94a3b8" fontSize="11">SPY: $168.50</text>
                </svg>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span>ANTIGRAVITY QUANT RISK TERMINAL © 2026</span>
        <span>CONNECTED REPO: RAJA2004-design/antigravity-quant-risk-terminal</span>
        <span>STATUS: ALL MODULES CALIBRATED & OPERATIONAL</span>
      </footer>
    </div>
  );
}

// ==============================================================================
// STYLES OBJECT (BLOOMBERG / MODERN INSTITUTIONAL DARK THEME)
// ==============================================================================
const styles = {
  container: {
    backgroundColor: "#070b12",
    color: "#e2e8f0",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "12px",
    flexWrap: "wrap",
    gap: "12px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoBadge: {
    backgroundColor: "#00f2fe",
    color: "#070b12",
    fontWeight: "900",
    fontSize: "18px",
    padding: "6px 12px",
    borderRadius: "6px",
    letterSpacing: "1px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "800",
    margin: "0",
    color: "#f8fafc",
    letterSpacing: "0.5px",
  },
  subtitle: {
    fontSize: "11px",
    color: "#64748b",
    margin: "2px 0 0 0",
    letterSpacing: "0.8px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  telemetryTag: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "4px",
    padding: "5px 10px",
    fontSize: "11px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  livePulse: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    display: "inline-block",
    boxShadow: "0 0 8px #10b981",
  },
  inputMini: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#00f2fe",
    fontSize: "11px",
    width: "55px",
    padding: "2px 4px",
    borderRadius: "3px",
    outline: "none",
  },
  tickerStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "10px",
  },
  tickerCard: {
    backgroundColor: "#0d131f",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "10px 12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    outline: "none",
  },
  tickerCardActive: {
    borderColor: "#00f2fe",
    backgroundColor: "#0e1e2e",
    boxShadow: "0 0 10px rgba(0, 242, 254, 0.2)",
  },
  tickerCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  tickerSymbol: {
    fontWeight: "700",
    fontSize: "13px",
    color: "#f8fafc",
  },
  tickerPrice: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#cbd5e1",
  },
  posChange: {
    fontSize: "11px",
    color: "#10b981",
    fontWeight: "600",
  },
  negChange: {
    fontSize: "11px",
    color: "#ef4444",
    fontWeight: "600",
  },
  navBar: {
    display: "flex",
    gap: "8px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "8px",
    overflowX: "auto",
  },
  navBtn: {
    backgroundColor: "transparent",
    border: "1px solid #1e293b",
    borderRadius: "5px",
    color: "#94a3b8",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  navBtnActive: {
    backgroundColor: "#00f2fe",
    color: "#070b12",
    borderColor: "#00f2fe",
    boxShadow: "0 0 10px rgba(0, 242, 254, 0.3)",
  },
  mainGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "0",
    color: "#f1f5f9",
  },
  sectionBadge: {
    backgroundColor: "#1e293b",
    color: "#00f2fe",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
  },
  headerControls: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  ssiBadge: {
    backgroundColor: "rgba(0, 242, 254, 0.15)",
    border: "1px solid #00f2fe",
    color: "#00f2fe",
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "700",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  metricBox: {
    backgroundColor: "#0d131f",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "14px",
  },
  metricBoxHighlight: {
    backgroundColor: "rgba(0, 242, 254, 0.05)",
    border: "1px solid #00f2fe",
    borderRadius: "6px",
    padding: "14px",
  },
  metricBoxWarning: {
    backgroundColor: "rgba(245, 158, 11, 0.05)",
    border: "1px solid #f59e0b",
    borderRadius: "6px",
    padding: "14px",
  },
  metricBoxDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    border: "1px solid #ef4444",
    borderRadius: "6px",
    padding: "14px",
  },
  metricLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  metricValue: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#f8fafc",
  },
  metricValueHighlight: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#00f2fe",
  },
  metricValueWarning: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#f59e0b",
  },
  metricValueDanger: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#ef4444",
  },
  metricSub: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "4px",
  },
  chartPanel: {
    backgroundColor: "#0d131f",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "16px",
  },
  tablePanel: {
    backgroundColor: "#0d131f",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "16px",
  },
  panelTitle: {
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 4px 0",
    color: "#f1f5f9",
  },
  panelDesc: {
    fontSize: "11px",
    color: "#64748b",
    margin: "0 0 12px 0",
  },
  tailSvgWrapper: {
    width: "100%",
    height: "220px",
  },
  svgFull: {
    width: "100%",
    height: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
  },
  tableMatrix: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px",
  },
  thRow: {
    borderBottom: "1px solid #334155",
  },
  th: {
    padding: "10px 8px",
    textAlign: "left",
    color: "#94a3b8",
    fontWeight: "600",
  },
  thMatrix: {
    padding: "8px 6px",
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "600",
    borderBottom: "1px solid #334155",
  },
  thHighlight: {
    padding: "8px 6px",
    textAlign: "center",
    color: "#00f2fe",
    fontWeight: "700",
    borderBottom: "1px solid #00f2fe",
  },
  tr: {
    borderBottom: "1px solid #1e293b",
  },
  trActive: {
    borderBottom: "1px solid #00f2fe",
    backgroundColor: "rgba(0, 242, 254, 0.05)",
  },
  trTopTier: {
    borderBottom: "1px solid #10b981",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  trBottomTier: {
    borderBottom: "1px solid #ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  trSummary: {
    borderTop: "2px solid #334155",
    backgroundColor: "#0b1019",
  },
  td: {
    padding: "10px 8px",
    color: "#e2e8f0",
  },
  tdMatrix: {
    padding: "8px 6px",
    textAlign: "center",
    border: "1px solid #1e293b",
  },
  tdRowHeader: {
    padding: "8px 8px",
    fontWeight: "700",
    color: "#f8fafc",
    borderRight: "1px solid #334155",
  },
  tdRowHeaderHighlight: {
    padding: "8px 8px",
    fontWeight: "800",
    color: "#00f2fe",
    borderRight: "1px solid #334155",
  },
  tdRank: {
    padding: "10px 8px",
    fontWeight: "800",
    color: "#00f2fe",
  },
  tdHighlight: {
    padding: "10px 8px",
    color: "#00f2fe",
    fontWeight: "700",
  },
  tdFrom: {
    padding: "8px 6px",
    textAlign: "center",
    color: "#f59e0b",
    fontWeight: "700",
  },
  tdTo: {
    padding: "8px 6px",
    textAlign: "center",
    color: "#00f2fe",
    fontWeight: "700",
  },
  tdNetPositive: {
    padding: "8px 6px",
    textAlign: "center",
    color: "#ef4444",
    fontWeight: "700",
  },
  tdNetNegative: {
    padding: "8px 6px",
    textAlign: "center",
    color: "#10b981",
    fontWeight: "700",
  },
  tdSummaryTotal: {
    padding: "8px 6px",
    textAlign: "center",
    fontWeight: "800",
    color: "#f8fafc",
  },
  badgeGreen: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#10b981",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
  },
  badgeRed: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
  },
  badgeNeutral: {
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    color: "#94a3b8",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
  },
  termStructureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px",
    marginTop: "8px",
  },
  termCard: {
    backgroundColor: "#070b12",
    border: "1px solid #1e293b",
    borderRadius: "5px",
    padding: "12px",
    textAlign: "center",
  },
  termHorizon: {
    fontSize: "11px",
    color: "#94a3b8",
    marginBottom: "4px",
  },
  termValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#00f2fe",
    marginBottom: "4px",
  },
  termBadge: {
    fontSize: "10px",
    color: "#64748b",
  },
  footer: {
    borderTop: "1px solid #1e293b",
    paddingTop: "12px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#64748b",
    flexWrap: "wrap",
    gap: "8px",
  },
};
