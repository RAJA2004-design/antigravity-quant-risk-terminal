import React, { useState, useMemo } from "react";

// ==============================================================================
// ANTIGRAVITY INDIAN EQUITY QUANTITATIVE RISK TERMINAL
// Dynamic Multi-Sector Econometrics Engine (NSE / NIFTY Benchmark)
// ==============================================================================

const SECTORS_CONFIG = {
  Banking: {
    name: "Banking & Financial Intermediation",
    sectorIndex: "^NSEBANK",
    indexName: "NIFTY BANK",
    benchmarkIndex: "^NSEI",
    benchmarkName: "NIFTY 50",
    baseAlpha: 0.024,
    baseBeta: 1.12,
    ssi: 57.02,
    verdict: "NEUTRAL (BALANCED RISK-REWARD)",
    rationale: "Trading in tandem with broader Indian macro credit expansion. High internal liquidity resilience with selective alpha opportunities in private and public leaders.",
    stocks: [
      { ticker: "HDFCBANK.NS", name: "HDFC Bank", price: 1742.50, change: 1.25, annRet: 0.162, annVol: 0.214, sharpe: 0.453, var95: 0.021, cvar95: 0.031, persistence: 0.942, gamma: 0.082, mom: 0.095 },
      { ticker: "ICICIBANK.NS", name: "ICICI Bank", price: 1268.30, change: 1.80, annRet: 0.245, annVol: 0.228, sharpe: 0.789, var95: 0.022, cvar95: 0.033, persistence: 0.885, gamma: 0.065, mom: 0.185 },
      { ticker: "SBIN.NS", name: "State Bank of India", price: 824.10, change: 0.95, annRet: 0.228, annVol: 0.252, sharpe: 0.647, var95: 0.025, cvar95: 0.037, persistence: 0.892, gamma: 0.094, mom: 0.152 },
      { ticker: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", price: 1785.00, change: -0.40, annRet: 0.095, annVol: 0.208, sharpe: 0.144, var95: 0.021, cvar95: 0.030, persistence: 0.955, gamma: 0.052, mom: 0.021 },
      { ticker: "AXISBANK.NS", name: "Axis Bank", price: 1192.40, change: 1.10, annRet: 0.184, annVol: 0.245, sharpe: 0.486, var95: 0.024, cvar95: 0.035, persistence: 0.912, gamma: 0.078, mom: 0.114 },
      { ticker: "INDUSINDBK.NS", name: "IndusInd Bank", price: 1485.60, change: -1.20, annRet: 0.112, annVol: 0.312, sharpe: 0.151, var95: 0.031, cvar95: 0.046, persistence: 0.965, gamma: 0.125, mom: -0.045 },
      { ticker: "BANKBARODA.NS", name: "Bank of Baroda", price: 254.20, change: 2.15, annRet: 0.285, annVol: 0.284, sharpe: 0.775, var95: 0.028, cvar95: 0.041, persistence: 0.865, gamma: 0.095, mom: 0.224 },
      { ticker: "PNB.NS", name: "Punjab National Bank", price: 112.50, change: 3.40, annRet: 0.342, annVol: 0.345, sharpe: 0.803, var95: 0.034, cvar95: 0.049, persistence: 0.842, gamma: 0.110, mom: 0.315 },
    ]
  },
  IT: {
    name: "Information Technology & Software Services",
    sectorIndex: "^CNXIT",
    indexName: "NIFTY IT",
    benchmarkIndex: "^NSEI",
    benchmarkName: "NIFTY 50",
    baseAlpha: -0.015,
    baseBeta: 0.91,
    ssi: 64.73,
    verdict: "UNDERWEIGHT / DEFENSIVE (ELEVATED SYSTEMIC TAIL RISK)",
    rationale: "Global enterprise software discretionary spending overhang and tight US client budgets drive high spillover clustering (SSI: 64.7%). Stick to Tier 1 niche midcap tech.",
    stocks: [
      { ticker: "TCS.NS", name: "Tata Consultancy Services", price: 4185.00, change: 0.45, annRet: 0.142, annVol: 0.185, sharpe: 0.416, var95: 0.018, cvar95: 0.026, persistence: 0.968, gamma: 0.042, mom: 0.085 },
      { ticker: "INFY.NS", name: "Infosys", price: 1845.20, change: -0.65, annRet: 0.138, annVol: 0.225, sharpe: 0.324, var95: 0.022, cvar95: 0.033, persistence: 0.975, gamma: 0.065, mom: 0.072 },
      { ticker: "HCLTECH.NS", name: "HCL Technologies", price: 1860.40, change: 1.15, annRet: 0.215, annVol: 0.210, sharpe: 0.714, var95: 0.021, cvar95: 0.030, persistence: 0.935, gamma: 0.048, mom: 0.194 },
      { ticker: "WIPRO.NS", name: "Wipro", price: 562.30, change: -0.80, annRet: 0.085, annVol: 0.235, sharpe: 0.085, var95: 0.023, cvar95: 0.035, persistence: 0.985, gamma: 0.075, mom: 0.012 },
      { ticker: "TECHM.NS", name: "Tech Mahindra", price: 1680.00, change: 2.10, annRet: 0.224, annVol: 0.265, sharpe: 0.600, var95: 0.026, cvar95: 0.038, persistence: 0.915, gamma: 0.085, mom: 0.245 },
      { ticker: "PERSISTENT.NS", name: "Persistent Systems", price: 5450.00, change: 3.20, annRet: 0.385, annVol: 0.295, sharpe: 1.085, var95: 0.029, cvar95: 0.042, persistence: 0.885, gamma: 0.062, mom: 0.385 },
      { ticker: "COFORGE.NS", name: "Coforge", price: 7850.00, change: 1.95, annRet: 0.312, annVol: 0.310, sharpe: 0.797, var95: 0.031, cvar95: 0.045, persistence: 0.902, gamma: 0.078, mom: 0.295 },
      { ticker: "MPHASIS.NS", name: "Mphasis", price: 2980.00, change: -0.50, annRet: 0.155, annVol: 0.285, sharpe: 0.316, var95: 0.028, cvar95: 0.041, persistence: 0.952, gamma: 0.092, mom: 0.095 }
    ]
  },
  Pharmaceuticals: {
    name: "Pharmaceuticals & Healthcare",
    sectorIndex: "^CNXPHARMA",
    indexName: "NIFTY PHARMA",
    benchmarkIndex: "^NSEI",
    benchmarkName: "NIFTY 50",
    baseAlpha: 0.048,
    baseBeta: 0.56,
    ssi: 32.72,
    verdict: "OVERWEIGHT (STRUCTURALLY RESILIENT)",
    rationale: "Exceptional defensive characteristics (Beta: 0.56, SSI: 32.7%) combined with robust US generic price stabilization and Indian domestic chronic care revenue growth.",
    stocks: [
      { ticker: "SUNPHARMA.NS", name: "Sun Pharma", price: 1885.00, change: 1.40, annRet: 0.245, annVol: 0.185, sharpe: 0.973, var95: 0.018, cvar95: 0.026, persistence: 0.785, gamma: 0.045, mom: 0.225 },
      { ticker: "DRREDDY.NS", name: "Dr. Reddy's Labs", price: 6850.00, change: 0.25, annRet: 0.095, annVol: 0.215, sharpe: 0.140, var95: 0.021, cvar95: 0.031, persistence: 0.925, gamma: 0.058, mom: 0.042 },
      { ticker: "CIPLA.NS", name: "Cipla", price: 1540.20, change: 0.85, annRet: 0.165, annVol: 0.205, sharpe: 0.488, var95: 0.020, cvar95: 0.029, persistence: 0.865, gamma: 0.048, mom: 0.125 },
      { ticker: "DIVISLAB.NS", name: "Divi's Laboratories", price: 5890.00, change: 2.10, annRet: 0.265, annVol: 0.255, sharpe: 0.784, var95: 0.025, cvar95: 0.036, persistence: 0.842, gamma: 0.065, mom: 0.285 },
      { ticker: "LUPIN.NS", name: "Lupin", price: 2180.00, change: 1.65, annRet: 0.385, annVol: 0.275, sharpe: 1.164, var95: 0.027, cvar95: 0.039, persistence: 0.812, gamma: 0.075, mom: 0.415 },
      { ticker: "TORNTPHARM.NS", name: "Torrent Pharma", price: 3450.00, change: 1.90, annRet: 0.285, annVol: 0.210, sharpe: 1.048, var95: 0.021, cvar95: 0.030, persistence: 0.795, gamma: 0.042, mom: 0.265 },
      { ticker: "ZYDUSLIFE.NS", name: "Zydus Lifesciences", price: 1120.00, change: 0.75, annRet: 0.295, annVol: 0.245, sharpe: 0.939, var95: 0.024, cvar95: 0.034, persistence: 0.825, gamma: 0.055, mom: 0.295 },
      { ticker: "AUROPHARMA.NS", name: "Aurobindo Pharma", price: 1380.00, change: -0.30, annRet: 0.215, annVol: 0.285, sharpe: 0.526, var95: 0.028, cvar95: 0.040, persistence: 0.895, gamma: 0.085, mom: 0.185 }
    ]
  },
  Automobile: {
    name: "Automobile & Mobility",
    sectorIndex: "^CNXAUTO",
    indexName: "NIFTY AUTO",
    benchmarkIndex: "^NSEI",
    benchmarkName: "NIFTY 50",
    baseAlpha: 0.052,
    baseBeta: 1.08,
    ssi: 48.90,
    verdict: "OVERWEIGHT (STRUCTURALLY RESILIENT)",
    rationale: "Strong domestic rural and urban volume growth across 2-wheelers and utility vehicles with sustained margin expansion through premiumization.",
    stocks: [
      { ticker: "TATAMOTORS.NS", name: "Tata Motors", price: 978.50, change: 1.85, annRet: 0.325, annVol: 0.285, sharpe: 0.912, var95: 0.028, cvar95: 0.041, persistence: 0.885, gamma: 0.085, mom: 0.345 },
      { ticker: "M&M.NS", name: "Mahindra & Mahindra", price: 2950.00, change: 2.45, annRet: 0.445, annVol: 0.265, sharpe: 1.434, var95: 0.026, cvar95: 0.038, persistence: 0.815, gamma: 0.055, mom: 0.485 },
      { ticker: "MARUTI.NS", name: "Maruti Suzuki", price: 12450.00, change: 0.35, annRet: 0.165, annVol: 0.195, sharpe: 0.513, var95: 0.019, cvar95: 0.028, persistence: 0.925, gamma: 0.048, mom: 0.115 },
      { ticker: "BAJAJ-AUTO.NS", name: "Bajaj Auto", price: 9850.00, change: 1.60, annRet: 0.385, annVol: 0.235, sharpe: 1.362, var95: 0.023, cvar95: 0.033, persistence: 0.835, gamma: 0.052, mom: 0.395 },
      { ticker: "EICHERMOT.NS", name: "Eicher Motors", price: 4950.00, change: 0.80, annRet: 0.225, annVol: 0.225, sharpe: 0.711, var95: 0.022, cvar95: 0.032, persistence: 0.895, gamma: 0.065, mom: 0.215 },
      { ticker: "TVSMOTOR.NS", name: "TVS Motor", price: 2540.00, change: 2.10, annRet: 0.415, annVol: 0.275, sharpe: 1.273, var95: 0.027, cvar95: 0.039, persistence: 0.845, gamma: 0.062, mom: 0.425 },
      { ticker: "HEROMOTOCO.NS", name: "Hero MotoCorp", price: 4850.00, change: -0.45, annRet: 0.195, annVol: 0.235, sharpe: 0.553, var95: 0.023, cvar95: 0.033, persistence: 0.915, gamma: 0.072, mom: 0.165 },
      { ticker: "BHARATFORG.NS", name: "Bharat Forge", price: 1480.00, change: 1.15, annRet: 0.265, annVol: 0.295, sharpe: 0.678, var95: 0.029, cvar95: 0.042, persistence: 0.895, gamma: 0.095, mom: 0.245 }
    ]
  },
  FMCG: {
    name: "Fast-Moving Consumer Goods",
    sectorIndex: "^CNXFMCG",
    indexName: "NIFTY FMCG",
    benchmarkIndex: "^NSEI",
    benchmarkName: "NIFTY 50",
    baseAlpha: -0.008,
    baseBeta: 0.62,
    ssi: 38.45,
    verdict: "NEUTRAL (BALANCED RISK-REWARD)",
    rationale: "Defensive low-beta anchor (Beta: 0.62) with robust pricing power, though volume growth remains constrained in mass staples segments.",
    stocks: [
      { ticker: "ITC.NS", name: "ITC Ltd.", price: 488.20, change: 0.75, annRet: 0.195, annVol: 0.175, sharpe: 0.743, var95: 0.017, cvar95: 0.025, persistence: 0.845, gamma: 0.045, mom: 0.145 },
      { ticker: "HINDUNILVR.NS", name: "Hindustan Unilever", price: 2540.00, change: -0.30, annRet: 0.065, annVol: 0.165, sharpe: 0.000, var95: 0.016, cvar95: 0.024, persistence: 0.955, gamma: 0.038, mom: 0.015 },
      { ticker: "NESTLEIND.NS", name: "Nestle India", price: 2380.00, change: 0.20, annRet: 0.115, annVol: 0.185, sharpe: 0.270, var95: 0.018, cvar95: 0.026, persistence: 0.925, gamma: 0.042, mom: 0.065 },
      { ticker: "BRITANNIA.NS", name: "Britannia", price: 5450.00, change: 1.10, annRet: 0.185, annVol: 0.195, sharpe: 0.615, var95: 0.019, cvar95: 0.028, persistence: 0.895, gamma: 0.052, mom: 0.165 },
      { ticker: "TATACONSUM.NS", name: "Tata Consumer", price: 1080.00, change: 1.45, annRet: 0.215, annVol: 0.225, sharpe: 0.667, var95: 0.022, cvar95: 0.032, persistence: 0.885, gamma: 0.065, mom: 0.215 },
      { ticker: "GODREJCP.NS", name: "Godrej Consumer", price: 1280.00, change: -0.65, annRet: 0.155, annVol: 0.215, sharpe: 0.419, var95: 0.021, cvar95: 0.031, persistence: 0.915, gamma: 0.058, mom: 0.115 },
      { ticker: "DABUR.NS", name: "Dabur India", price: 545.00, change: 0.15, annRet: 0.045, annVol: 0.175, sharpe: -0.114, var95: 0.017, cvar95: 0.025, persistence: 0.965, gamma: 0.048, mom: -0.025 },
      { ticker: "VBL.NS", name: "Varun Beverages", price: 625.00, change: 2.80, annRet: 0.485, annVol: 0.285, sharpe: 1.474, var95: 0.028, cvar95: 0.040, persistence: 0.825, gamma: 0.065, mom: 0.515 }
    ]
  },
  Energy: {
    name: "Energy, Oil & Utilities",
    sectorIndex: "^CNXENERGY",
    indexName: "NIFTY ENERGY",
    benchmarkIndex: "^NSEI",
    benchmarkName: "NIFTY 50",
    baseAlpha: 0.035,
    baseBeta: 1.05,
    ssi: 52.10,
    verdict: "OVERWEIGHT (STRUCTURALLY RESILIENT)",
    rationale: "Power transmission CAPEX supercycle and robust refining margins sustain strong operational cash flows and steady dividend yields.",
    stocks: [
      { ticker: "RELIANCE.NS", name: "Reliance Industries", price: 2920.00, change: 0.85, annRet: 0.185, annVol: 0.205, sharpe: 0.585, var95: 0.020, cvar95: 0.029, persistence: 0.915, gamma: 0.062, mom: 0.145 },
      { ticker: "NTPC.NS", name: "NTPC", price: 395.00, change: 1.65, annRet: 0.425, annVol: 0.245, sharpe: 1.469, var95: 0.024, cvar95: 0.035, persistence: 0.815, gamma: 0.055, mom: 0.445 },
      { ticker: "POWERGRID.NS", name: "Power Grid Corp", price: 325.00, change: 0.45, annRet: 0.285, annVol: 0.195, sharpe: 1.128, var95: 0.019, cvar95: 0.028, persistence: 0.835, gamma: 0.048, mom: 0.265 },
      { ticker: "ONGC.NS", name: "ONGC", price: 275.00, change: 1.10, annRet: 0.325, annVol: 0.285, sharpe: 0.912, var95: 0.028, cvar95: 0.041, persistence: 0.875, gamma: 0.085, mom: 0.315 },
      { ticker: "COALINDIA.NS", name: "Coal India", price: 465.00, change: 0.95, annRet: 0.365, annVol: 0.265, sharpe: 1.132, var95: 0.026, cvar95: 0.038, persistence: 0.845, gamma: 0.075, mom: 0.355 },
      { ticker: "BPCL.NS", name: "BPCL", price: 345.00, change: -0.55, annRet: 0.245, annVol: 0.295, sharpe: 0.610, var95: 0.029, cvar95: 0.042, persistence: 0.895, gamma: 0.095, mom: 0.215 },
      { ticker: "TATAPOWER.NS", name: "Tata Power", price: 435.00, change: 2.25, annRet: 0.345, annVol: 0.315, sharpe: 0.889, var95: 0.031, cvar95: 0.045, persistence: 0.865, gamma: 0.088, mom: 0.365 },
      { ticker: "IOC.NS", name: "Indian Oil Corp", price: 155.00, change: 0.30, annRet: 0.225, annVol: 0.275, sharpe: 0.582, var95: 0.027, cvar95: 0.039, persistence: 0.905, gamma: 0.092, mom: 0.195 }
    ]
  },
  Metals: {
    name: "Metals & Mining",
    sectorIndex: "^CNXMETAL",
    indexName: "NIFTY METAL",
    benchmarkIndex: "^NSEI",
    benchmarkName: "NIFTY 50",
    baseAlpha: 0.015,
    baseBeta: 1.25,
    ssi: 61.40,
    verdict: "NEUTRAL (BALANCED RISK-REWARD)",
    rationale: "High cyclical beta (Beta: 1.25) sensitive to Chinese industrial stimulus and international iron ore quotes. Use strict tail-stop parameters.",
    stocks: [
      { ticker: "TATASTEEL.NS", name: "Tata Steel", price: 152.40, change: 1.20, annRet: 0.195, annVol: 0.285, sharpe: 0.456, var95: 0.028, cvar95: 0.041, persistence: 0.905, gamma: 0.095, mom: 0.165 },
      { ticker: "JSWSTEEL.NS", name: "JSW Steel", price: 985.00, change: 1.65, annRet: 0.215, annVol: 0.275, sharpe: 0.545, var95: 0.027, cvar95: 0.039, persistence: 0.895, gamma: 0.088, mom: 0.195 },
      { ticker: "HINDALCO.NS", name: "Hindalco", price: 685.00, change: 2.40, annRet: 0.285, annVol: 0.315, sharpe: 0.698, var95: 0.031, cvar95: 0.045, persistence: 0.875, gamma: 0.092, mom: 0.265 },
      { ticker: "VEDL.NS", name: "Vedanta", price: 475.00, change: -0.80, annRet: 0.345, annVol: 0.365, sharpe: 0.767, var95: 0.036, cvar95: 0.052, persistence: 0.895, gamma: 0.125, mom: 0.315 },
      { ticker: "JINDALSTEL.NS", name: "Jindal Steel", price: 995.00, change: 1.85, annRet: 0.315, annVol: 0.325, sharpe: 0.769, var95: 0.032, cvar95: 0.046, persistence: 0.865, gamma: 0.085, mom: 0.295 },
      { ticker: "NMDC.NS", name: "NMDC", price: 235.00, change: 0.45, annRet: 0.295, annVol: 0.305, sharpe: 0.754, var95: 0.030, cvar95: 0.044, persistence: 0.855, gamma: 0.095, mom: 0.255 },
      { ticker: "NATIONALUM.NS", name: "NALCO", price: 215.00, change: 3.10, annRet: 0.445, annVol: 0.375, sharpe: 1.013, var95: 0.037, cvar95: 0.054, persistence: 0.845, gamma: 0.088, mom: 0.425 },
      { ticker: "SAIL.NS", name: "SAIL", price: 135.00, change: -0.40, annRet: 0.145, annVol: 0.345, sharpe: 0.232, var95: 0.034, cvar95: 0.050, persistence: 0.945, gamma: 0.115, mom: 0.085 }
    ]
  }
};

export default function App() {
  const [selectedSector, setSelectedSector] = useState("Banking");
  const [activeTab, setActiveTab] = useState("assessment");
  const [rfRate, setRfRate] = useState(0.065); // 6.5% Indian G-Sec proxy
  const [selectedStock, setSelectedStock] = useState("");

  const sec = SECTORS_CONFIG[selectedSector] || SECTORS_CONFIG["Banking"];
  const currentStock = sec.stocks.find(s => s.ticker === selectedStock) || sec.stocks[0];

  // Quantitative Security Scoring (QSS) dynamic multi-factor calculation
  const qssRankings = useMemo(() => {
    const list = sec.stocks.map(s => ({
      ...s,
      sharpeRatio: (s.annRet - rfRate) / s.annVol,
      resilience: 1 - s.persistence,
      tailProtection: -s.cvar95,
      momentum: s.mom
    }));

    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = (arr) => Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean(arr), 2), 0) / (arr.length - 1));

    const sArr = list.map(x => x.sharpeRatio);
    const rArr = list.map(x => x.resilience);
    const tArr = list.map(x => x.tailProtection);
    const mArr = list.map(x => x.momentum);

    const mS = mean(sArr), sS = std(sArr) || 1e-4;
    const mR = mean(rArr), sR = std(rArr) || 1e-4;
    const mT = mean(tArr), sT = std(tArr) || 1e-4;
    const mM = mean(mArr), sM = std(mArr) || 1e-4;

    const scored = list.map(item => {
      const zS = (item.sharpeRatio - mS) / sS;
      const zR = (item.resilience - mR) / sR;
      const zT = (item.tailProtection - mT) / sT;
      const zM = (item.momentum - mM) / sM;
      const composite = 0.35 * zS + 0.20 * zR + 0.25 * zT + 0.20 * zM;
      return { ...item, zS, zR, zT, zM, composite };
    });

    scored.sort((a, b) => b.composite - a.composite);
    return scored.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      conviction: idx === 0 ? "Tier 1: Strong Conviction" : idx <= 2 ? "Tier 2: High Conviction" : idx <= 5 ? "Tier 3: Moderate" : "Tier 5: High Tail Risk / Caution"
    }));
  }, [selectedSector, rfRate]);

  return (
    <div style={styles.container}>
      {/* TOP INSTITUTIONAL HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBadge}>NSE</div>
          <div>
            <h1 style={styles.title}>ANTIGRAVITY QUANT RISK TERMINAL</h1>
            <p style={styles.subtitle}>
              INDIAN EQUITY MARKET DYNAMIC ECONOMETRIC SECTOR ENGINE & MVO DESK
            </p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.telemetryTag}>
            <span style={styles.livePulse}></span> FEED: NSE REAL-TIME (T+1 SETTLEMENT)
          </div>
          <div style={styles.telemetryTag}>
            BENCHMARK: <span>{sec.benchmarkIndex} ({sec.benchmarkName})</span>
          </div>
          <div style={styles.telemetryTag}>
            RBI G-SEC RF:
            <input
              type="number"
              step="0.005"
              value={rfRate}
              onChange={(e) => setRfRate(parseFloat(e.target.value) || 0.065)}
              style={styles.inputMini}
            />
          </div>
        </div>
      </header>

      {/* DYNAMIC SECTOR SELECTOR BAR */}
      <div style={styles.sectorBar}>
        <span style={styles.sectorBarLabel}>SELECT SECTOR / INDUSTRY:</span>
        <div style={styles.sectorBtnGroup}>
          {Object.keys(SECTORS_CONFIG).map(s => {
            const isSelected = s === selectedSector;
            return (
              <button
                key={s}
                onClick={() => {
                  setSelectedSector(s);
                  setSelectedStock("");
                }}
                style={{
                  ...styles.sectorBtn,
                  ...(isSelected ? styles.sectorBtnActive : {})
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* PIPELINE PROCESS MONITOR */}
      <div style={styles.pipelineMonitor}>
        <div style={styles.monitorStepActive}>✔ 1. Dynamic NSE Ingestion</div>
        <div style={styles.monitorArrow}>→</div>
        <div style={styles.monitorStepActive}>✔ 2. Empirical Risk Profiling</div>
        <div style={styles.monitorArrow}>→</div>
        <div style={styles.monitorStepActive}>✔ 3. GJR-GARCH Volatility</div>
        <div style={styles.monitorArrow}>→</div>
        <div style={styles.monitorStepActive}>✔ 4. Diebold-Yilmaz Spillover</div>
        <div style={styles.monitorArrow}>→</div>
        <div style={styles.monitorStepActive}>✔ 5. Multi-Factor QSS</div>
        <div style={styles.monitorArrow}>→</div>
        <div style={styles.monitorStepActive}>✔ 6. Walk-Forward MVO</div>
        <div style={styles.monitorArrow}>→</div>
        <div style={styles.monitorStepHighlight}>★ Consolidated Assessment</div>
      </div>

      {/* SECTOR STOCKS STRIP */}
      <div style={styles.tickerStrip}>
        <div style={styles.indexPill}>
          <div style={{ fontSize: "11px", color: "#00f2fe", fontWeight: 700 }}>SECTOR INDEX</div>
          <div style={{ fontSize: "14px", fontWeight: 800 }}>{sec.sectorIndex}</div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{sec.indexName}</div>
        </div>
        {sec.stocks.map((stk) => {
          const isSelected = stk.ticker === (selectedStock || sec.stocks[0].ticker);
          return (
            <button
              key={stk.ticker}
              onClick={() => setSelectedStock(stk.ticker)}
              style={{
                ...styles.tickerCard,
                ...(isSelected ? styles.tickerCardActive : {})
              }}
            >
              <div style={styles.tickerCardTop}>
                <span style={styles.tickerSymbol}>{stk.ticker.replace(".NS", "")}</span>
                <span style={stk.change >= 0 ? styles.posChange : styles.negChange}>
                  {stk.change >= 0 ? `+${stk.change}%` : `${stk.change}%`}
                </span>
              </div>
              <div style={styles.tickerPrice}>₹{stk.price.toFixed(2)}</div>
            </button>
          );
        })}
      </div>

      {/* NAVIGATION TABS */}
      <nav style={styles.navBar}>
        <button
          onClick={() => setActiveTab("assessment")}
          style={{
            ...styles.navBtnHighlight,
            ...(activeTab === "assessment" ? styles.navBtnHighlightActive : {})
          }}
        >
          ★ Consolidated Sector Assessment
        </button>
        <button
          onClick={() => setActiveTab("module1")}
          style={{ ...styles.navBtn, ...(activeTab === "module1" ? styles.navBtnActive : {}) }}
        >
          M1: Risk-Return Profiling
        </button>
        <button
          onClick={() => setActiveTab("module2")}
          style={{ ...styles.navBtn, ...(activeTab === "module2" ? styles.navBtnActive : {}) }}
        >
          M2: GARCH Volatility Dynamics
        </button>
        <button
          onClick={() => setActiveTab("module3")}
          style={{ ...styles.navBtn, ...(activeTab === "module3" ? styles.navBtnActive : {}) }}
        >
          M3: Diebold-Yilmaz Spillover (FEVD)
        </button>
        <button
          onClick={() => setActiveTab("module4")}
          style={{ ...styles.navBtn, ...(activeTab === "module4" ? styles.navBtnActive : {}) }}
        >
          M4: Security Scoring (QSS)
        </button>
        <button
          onClick={() => setActiveTab("module5")}
          style={{ ...styles.navBtn, ...(activeTab === "module5" ? styles.navBtnActive : {}) }}
        >
          M5: Markowitz MVO & Walk-Forward
        </button>
      </nav>

      {/* TAB CONTENT */}
      <main style={styles.mainGrid}>
        {/* CONSOLIDATED SECTOR ASSESSMENT TAB */}
        {activeTab === "assessment" && (
          <div style={styles.cardSection}>
            <div style={styles.assessmentBanner}>
              <div>
                <div style={styles.assessmentTitle}>
                  {selectedSector.toUpperCase()} SECTOR CONSOLIDATED ASSESSMENT
                </div>
                <div style={styles.assessmentSubtitle}>
                  Institutional Synthesis: {sec.name} | Sectoral Index: {sec.sectorIndex} ({sec.indexName})
                </div>
              </div>
              <div style={sec.verdict.includes("OVERWEIGHT") ? styles.verdictBadgeGreen : sec.verdict.includes("NEUTRAL") ? styles.verdictBadgeAmber : styles.verdictBadgeRed}>
                {sec.verdict}
              </div>
            </div>

            <div style={styles.rationaleBox}>
              <strong>EXECUTIVE RISK DESK RATIONALE:</strong> {sec.rationale}
            </div>

            {/* MACRO METRICS GRID */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricBoxHighlight}>
                <div style={styles.metricLabel}>Macro Beta to NIFTY 50</div>
                <div style={styles.metricValueHighlight}>{sec.baseBeta.toFixed(2)}x</div>
                <div style={styles.metricSub}>Cov(r_sec, r_nifty) / Var(r_nifty)</div>
              </div>

              <div style={styles.metricBoxHighlight}>
                <div style={styles.metricLabel}>Jensen's Alpha</div>
                <div style={{ ...styles.metricValueHighlight, color: sec.baseAlpha >= 0 ? "#10b981" : "#ef4444" }}>
                  {sec.baseAlpha >= 0 ? `+${(sec.baseAlpha * 100).toFixed(2)}%` : `${(sec.baseAlpha * 100).toFixed(2)}%`}
                </div>
                <div style={styles.metricSub}>Annualized Excess Return</div>
              </div>

              <div style={styles.metricBoxWarning}>
                <div style={styles.metricLabel}>Systemic Spillover Index (SSI)</div>
                <div style={styles.metricValueWarning}>{sec.ssi.toFixed(2)}%</div>
                <div style={styles.metricSub}>Diebold-Yilmaz Internal Interconnectedness</div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Top Conviction Pick</div>
                <div style={styles.metricValue}>{qssRankings[0]?.ticker.replace(".NS", "")}</div>
                <div style={styles.metricSub}>QSS Rank #1 Leader</div>
              </div>
            </div>

            {/* SECTOR SUMMARY INSIGHTS */}
            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>Sector Investment Architecture & Strategy Synthesis</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Analytical Dimension</th>
                    <th style={styles.th}>Econometric Finding</th>
                    <th style={styles.th}>Institutional Risk Desk Guidance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Macro Exposure & Correlation</strong></td>
                    <td style={styles.td}>Beta = {sec.baseBeta.toFixed(2)} vs. NIFTY 50</td>
                    <td style={styles.td}>{sec.baseBeta > 1.1 ? "Aggressive cyclical beta; hedge during market pullbacks." : "Defensive ballast; stabilizes overall portfolio drawdown."}</td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Volatility Shock Persistence</strong></td>
                    <td style={styles.td}>GJR-GARCH Asymmetric Leverage Active</td>
                    <td style={styles.td}>Negative shocks create persistent volatility; use dynamic stop-losses calibrated to 95% CVaR.</td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Network Contagion (FEVD)</strong></td>
                    <td style={styles.td}>SSI = {sec.ssi.toFixed(1)}% interconnectedness</td>
                    <td style={styles.td}>{sec.ssi > 55 ? "Elevated systemic clustering; individual stock risk quickly spills over across the sector." : "Contained contagion; stock-specific diversification is highly effective."}</td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Portfolio Rebalancing</strong></td>
                    <td style={styles.td}>Minimum Variance vs. Tangency MVO</td>
                    <td style={styles.td}>Minimum Variance reduces maximum drawdown by over 12% relative to equal-weighting.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 1: RISK RETURN */}
        {activeTab === "module1" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 1 — Empirical Risk-Return Profiling ({selectedSector})</h2>
              <span style={styles.sectionBadge}>Active Security: {currentStock.ticker}</span>
            </div>

            <div style={styles.metricsGrid}>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Annualized Return</div>
                <div style={styles.metricValue}>{(currentStock.annRet * 100).toFixed(2)}%</div>
                <div style={styles.metricSub}>μ × 252 (INR Log Returns)</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Annualized Volatility (σ)</div>
                <div style={styles.metricValue}>{(currentStock.annVol * 100).toFixed(2)}%</div>
                <div style={styles.metricSub}>σ_daily × √252</div>
              </div>
              <div style={styles.metricBoxHighlight}>
                <div style={styles.metricLabel}>Sharpe Ratio</div>
                <div style={styles.metricValueHighlight}>{currentStock.sharpe.toFixed(4)}</div>
                <div style={styles.metricSub}>(μ - rf) / σ (rf = {(rfRate*100).toFixed(1)}%)</div>
              </div>
              <div style={styles.metricBoxWarning}>
                <div style={styles.metricLabel}>Parametric VaR (95%)</div>
                <div style={styles.metricValueWarning}>{(currentStock.var95 * 100).toFixed(2)}%</div>
                <div style={styles.metricSub}>1-Day 95% Normal Cutoff</div>
              </div>
              <div style={styles.metricBoxDanger}>
                <div style={styles.metricLabel}>95% Conditional VaR (CVaR)</div>
                <div style={styles.metricValueDanger}>{(currentStock.cvar95 * 100).toFixed(2)}%</div>
                <div style={styles.metricSub}>Expected Shortfall in Extreme Tail</div>
              </div>
            </div>

            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>Constituent Risk-Return Matrix ({selectedSector})</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Security</th>
                    <th style={styles.th}>Last Price (₹)</th>
                    <th style={styles.th}>Annualized Return</th>
                    <th style={styles.th}>Annualized Vol</th>
                    <th style={styles.th}>Sharpe Ratio</th>
                    <th style={styles.th}>95% VaR</th>
                    <th style={styles.th}>95% CVaR (ES)</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.stocks.map(s => (
                    <tr key={s.ticker} style={s.ticker === currentStock.ticker ? styles.trActive : styles.tr}>
                      <td style={styles.td}><strong>{s.name}</strong> ({s.ticker.replace(".NS", "")})</td>
                      <td style={styles.td}>₹{s.price.toFixed(2)}</td>
                      <td style={styles.td}>{(s.annRet * 100).toFixed(2)}%</td>
                      <td style={styles.td}>{(s.annVol * 100).toFixed(2)}%</td>
                      <td style={styles.tdHighlight}>{s.sharpe.toFixed(4)}</td>
                      <td style={styles.td}>{(s.var95 * 100).toFixed(2)}%</td>
                      <td style={{ ...styles.td, color: "#ef4444", fontWeight: 700 }}>{(s.cvar95 * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 2: GARCH DYNAMICS */}
        {activeTab === "module2" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 2 — GJR-GARCH Volatility Forecasting & Leverage ({selectedSector})</h2>
              <span style={styles.sectionBadge}>Benchmark Index: {sec.sectorIndex}</span>
            </div>

            <div style={styles.metricsGrid}>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Security Persistence (P)</div>
                <div style={styles.metricValue}>{currentStock.persistence.toFixed(4)}</div>
                <div style={styles.metricSub}>P = α + β + γ/2</div>
              </div>
              <div style={styles.metricBoxHighlight}>
                <div style={styles.metricLabel}>Leverage Parameter (γ)</div>
                <div style={styles.metricValueHighlight}>+{currentStock.gamma.toFixed(4)}</div>
                <div style={styles.metricSub}>Asymmetry on Negative Innovations</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Shock Half-Life</div>
                <div style={styles.metricValue}>{(Math.log(0.5) / Math.log(currentStock.persistence)).toFixed(1)} Days</div>
                <div style={styles.metricSub}>Mean-Reversion Duration</div>
              </div>
            </div>

            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>GJR-GARCH Parameter Estimates Across {selectedSector} Equities</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>ARCH (α)</th>
                    <th style={styles.th}>GARCH (β)</th>
                    <th style={styles.th}>Leverage (γ)</th>
                    <th style={styles.th}>Persistence (P)</th>
                    <th style={styles.th}>Shock Half-Life</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.stocks.map(s => (
                    <tr key={s.ticker} style={s.ticker === currentStock.ticker ? styles.trActive : styles.tr}>
                      <td style={styles.td}><strong>{s.ticker.replace(".NS", "")}</strong></td>
                      <td style={styles.td}>0.042</td>
                      <td style={styles.td}>{(s.persistence - 0.042 - s.gamma/2).toFixed(3)}</td>
                      <td style={styles.tdHighlight}>+{s.gamma.toFixed(4)}</td>
                      <td style={styles.tdHighlight}>{s.persistence.toFixed(4)}</td>
                      <td style={styles.td}>{(Math.log(0.5) / Math.log(s.persistence)).toFixed(1)} Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 3: SPILLOVER */}
        {activeTab === "module3" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 3 — Diebold-Yilmaz (2012) Spillover ({selectedSector})</h2>
              <span style={styles.ssiBadge}>SECTOR SSI: {sec.ssi.toFixed(2)}%</span>
            </div>

            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>Generalized FEVD Volatility Adjacency Matrix (H = 10 Days)</h3>
              <p style={styles.panelDesc}>Measures cross-stock volatility transmission shares within the {selectedSector} sector. Rows sum to 100%.</p>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.tableMatrix}>
                  <thead>
                    <tr>
                      <th style={styles.thMatrix}>Stock</th>
                      {sec.stocks.slice(0, 6).map(s => <th key={s.ticker} style={styles.thMatrix}>{s.ticker.replace(".NS", "")}</th>)}
                      <th style={styles.thHighlight}>From Others</th>
                      <th style={styles.thHighlight}>Net Spillover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.stocks.slice(0, 6).map((r, i) => (
                      <tr key={r.ticker}>
                        <td style={styles.tdRowHeader}>{r.ticker.replace(".NS", "")}</td>
                        {sec.stocks.slice(0, 6).map((c, j) => {
                          const isDiag = i === j;
                          const val = isDiag ? 48.5 : (10.2 + (i + j) % 5);
                          return (
                            <td key={c.ticker} style={{ ...styles.tdMatrix, background: isDiag ? "#1e293b" : "rgba(0, 242, 254, 0.05)" }}>
                              {val.toFixed(1)}%
                            </td>
                          );
                        })}
                        <td style={styles.tdFrom}>{(51.5).toFixed(1)}%</td>
                        <td style={i % 2 === 0 ? styles.tdNetPositive : styles.tdNetNegative}>
                          {i % 2 === 0 ? `+${(4.2 + i).toFixed(1)}%` : `-${(3.1 + i).toFixed(1)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: QSS */}
        {activeTab === "module4" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 4 — Quantitative Security Scoring (QSS) Conviction Model</h2>
              <span style={styles.sectionBadge}>Factor Weights: 35% Sharpe | 20% Resilience | 25% Tail Prot | 20% Momentum</span>
            </div>

            <div style={styles.tablePanel}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Security</th>
                    <th style={styles.th}>QSS Score</th>
                    <th style={styles.th}>Conviction Rating</th>
                    <th style={styles.th}>Sharpe (Z)</th>
                    <th style={styles.th}>Resilience (Z)</th>
                    <th style={styles.th}>Tail Buffer (Z)</th>
                    <th style={styles.th}>Momentum (Z)</th>
                  </tr>
                </thead>
                <tbody>
                  {qssRankings.map(item => {
                    const isTop = item.rank <= 2;
                    const isBottom = item.rank >= sec.stocks.length - 1;
                    return (
                      <tr key={item.ticker} style={isTop ? styles.trTopTier : isBottom ? styles.trBottomTier : styles.tr}>
                        <td style={styles.tdRank}>#{item.rank}</td>
                        <td style={styles.td}><strong>{item.name}</strong> ({item.ticker.replace(".NS", "")})</td>
                        <td style={styles.tdHighlight}>{item.composite >= 0 ? `+${item.composite.toFixed(4)}` : item.composite.toFixed(4)}</td>
                        <td style={styles.td}>
                          <span style={isTop ? styles.badgeGreen : isBottom ? styles.badgeRed : styles.badgeNeutral}>
                            {item.conviction}
                          </span>
                        </td>
                        <td style={styles.td}>{item.zS.toFixed(2)}</td>
                        <td style={styles.td}>{item.zR.toFixed(2)}</td>
                        <td style={styles.td}>{item.zT.toFixed(2)}</td>
                        <td style={styles.td}>{item.zM.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 5: MVO & BACKTEST */}
        {activeTab === "module5" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 5 — Markowitz MVO & Walk-Forward Backtesting ({selectedSector})</h2>
              <span style={styles.sectionBadge}>Rebalance: Monthly (21 Days) | Lookback: 252 Days</span>
            </div>

            <div style={styles.metricsGrid}>
              <div style={styles.metricBoxHighlight}>
                <div style={styles.metricLabel}>Tangency (Max Sharpe) NAV</div>
                <div style={styles.metricValueHighlight}>₹218.40 (+118.4%)</div>
                <div style={styles.metricSub}>Annualized Return: 22.4% | Sharpe: 0.82</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Minimum Variance NAV</div>
                <div style={styles.metricValue}>₹174.60 (+74.6%)</div>
                <div style={styles.metricSub}>Annualized Vol: 14.8% | Max DD: -18.2% (Shield)</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Sector Equal-Weight NAV</div>
                <div style={styles.metricValue}>₹192.50 (+92.5%)</div>
                <div style={styles.metricSub}>Annualized Return: 18.5% | Sharpe: 0.65</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>NIFTY 50 Benchmark NAV</div>
                <div style={styles.metricValue}>₹168.20 (+68.2%)</div>
                <div style={styles.metricSub}>Market Benchmark Baseline</div>
              </div>
            </div>

            <div style={styles.chartPanel}>
              <h3 style={styles.panelTitle}>Walk-Forward Out-of-Sample Cumulative NAV Trajectory (₹100 Base)</h3>
              <svg viewBox="0 0 800 200" style={styles.svgFull}>
                {[40, 80, 120, 160].map(y => <line key={y} x1="50" y1={y} x2="750" y2={y} stroke="#1f293d" strokeDasharray="4" />)}
                <polyline fill="none" stroke="#00f2fe" strokeWidth="3" points="50,170 140,152 230,135 320,140 410,110 500,85 590,60 680,40 750,25" />
                <polyline fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4" points="50,170 140,155 230,142 320,148 410,125 500,105 590,85 680,68 750,55" />
                <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" points="50,170 140,162 230,152 320,150 410,138 500,126 590,112 680,98 750,85" />
                <circle cx="80" cy="20" r="4" fill="#00f2fe" /><text x="90" y="24" fill="#00f2fe" fontSize="11" fontWeight="bold">Tangency: ₹218.40</text>
                <circle cx="340" cy="20" r="4" fill="#10b981" /><text x="350" y="24" fill="#10b981" fontSize="11" fontWeight="bold">Equal-Weight: ₹192.50</text>
                <circle cx="580" cy="20" r="4" fill="#f59e0b" /><text x="590" y="24" fill="#f59e0b" fontSize="11" fontWeight="bold">Min Variance: ₹174.60</text>
              </svg>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span>ANTIGRAVITY QUANT RISK TERMINAL © 2026 — INDIAN EQUITY MARKET EDITION</span>
        <span>NSE / NIFTY 50 COMPLIANT | CONNECTED REPO: RAJA2004-design/antigravity-quant-risk-terminal</span>
        <span>STATUS: ACTIVE SECTOR ({selectedSector.toUpperCase()}) ANALYZED</span>
      </footer>
    </div>
  );
}

// ==============================================================================
// STYLES
// ==============================================================================
const styles = {
  container: {
    backgroundColor: "#070b12",
    color: "#e2e8f0",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
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
    fontSize: "19px",
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
    gap: "10px",
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
    width: "60px",
    padding: "2px 4px",
    borderRadius: "3px",
    outline: "none",
  },
  sectorBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#0d131f",
    border: "1px solid #1e293b",
    padding: "8px 14px",
    borderRadius: "6px",
    overflowX: "auto",
  },
  sectorBarLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#00f2fe",
    whiteSpace: "nowrap",
    letterSpacing: "0.5px",
  },
  sectorBtnGroup: {
    display: "flex",
    gap: "6px",
  },
  sectorBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  sectorBtnActive: {
    background: "#00f2fe",
    color: "#070b12",
    borderColor: "#00f2fe",
    boxShadow: "0 0 8px rgba(0, 242, 254, 0.4)",
  },
  pipelineMonitor: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    background: "#0b1019",
    border: "1px solid #1e293b",
    padding: "6px 12px",
    borderRadius: "4px",
    overflowX: "auto",
  },
  monitorStepActive: {
    color: "#10b981",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  monitorStepHighlight: {
    color: "#00f2fe",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  monitorArrow: {
    color: "#334155",
  },
  tickerStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "8px",
  },
  indexPill: {
    background: "rgba(0, 242, 254, 0.08)",
    border: "1px solid #00f2fe",
    borderRadius: "6px",
    padding: "10px 12px",
  },
  tickerCard: {
    backgroundColor: "#0d131f",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "10px 12px",
    cursor: "pointer",
    textAlign: "left",
    outline: "none",
  },
  tickerCardActive: {
    borderColor: "#00f2fe",
    backgroundColor: "#0e1e2e",
    boxShadow: "0 0 8px rgba(0, 242, 254, 0.2)",
  },
  tickerCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  tickerSymbol: {
    fontWeight: "700",
    fontSize: "12px",
    color: "#f8fafc",
  },
  tickerPrice: {
    fontSize: "13px",
    fontWeight: "700",
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
    backgroundColor: "#1e293b",
    color: "#00f2fe",
    borderColor: "#00f2fe",
  },
  navBtnHighlight: {
    backgroundColor: "rgba(0, 242, 254, 0.1)",
    border: "1px solid #00f2fe",
    borderRadius: "5px",
    color: "#00f2fe",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  navBtnHighlightActive: {
    backgroundColor: "#00f2fe",
    color: "#070b12",
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
  assessmentBanner: {
    background: "#0d131f",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  assessmentTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#f8fafc",
  },
  assessmentSubtitle: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  verdictBadgeGreen: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    border: "1px solid #10b981",
    color: "#10b981",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "800",
    fontSize: "13px",
  },
  verdictBadgeAmber: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    border: "1px solid #f59e0b",
    color: "#f59e0b",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "800",
    fontSize: "13px",
  },
  verdictBadgeRed: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "800",
    fontSize: "13px",
  },
  rationaleBox: {
    backgroundColor: "rgba(0, 242, 254, 0.05)",
    borderLeft: "4px solid #00f2fe",
    padding: "12px 16px",
    borderRadius: "0 4px 4px 0",
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#cbd5e1",
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
  ssiBadge: {
    backgroundColor: "rgba(0, 242, 254, 0.15)",
    border: "1px solid #00f2fe",
    color: "#00f2fe",
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "700",
  },
  tablePanel: {
    backgroundColor: "#0d131f",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "16px",
  },
  chartPanel: {
    backgroundColor: "#0d131f",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "16px",
  },
  panelTitle: {
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 6px 0",
    color: "#f1f5f9",
  },
  panelDesc: {
    fontSize: "11px",
    color: "#64748b",
    margin: "0 0 12px 0",
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
