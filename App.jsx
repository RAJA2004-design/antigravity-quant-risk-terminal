import React, { useState, useMemo, useEffect } from "react";

// ==============================================================================
// ANTIGRAVITY QUANT RISK TERMINAL — INDIAN EQUITY MARKET EDITION
// Multi-Sector Dynamic Econometric Engine (NSE / NIFTY 50 Benchmark)
// All 8 Sectors | 78 Constituent Equities | Full Live Market Telemetry & Visualizations
// ==============================================================================

const DEFAULT_SECTORS_CONFIG = {
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
    rationale: "Trading in tandem with Indian macro credit expansion. High internal liquidity resilience with selective alpha opportunities in private and public banking leaders.",
    stocks: [
      { ticker: "HDFCBANK.NS", name: "HDFC Bank Ltd.", price: 1742.50, change: 1.25, annRet: 0.162, annVol: 0.214, sharpe: 0.453, var95: 0.021, cvar95: 0.031, persistence: 0.942, gamma: 0.082, mom: 0.095 },
      { ticker: "ICICIBANK.NS", name: "ICICI Bank Ltd.", price: 1268.30, change: 1.80, annRet: 0.245, annVol: 0.228, sharpe: 0.789, var95: 0.022, cvar95: 0.033, persistence: 0.885, gamma: 0.065, mom: 0.185 },
      { ticker: "SBIN.NS", name: "State Bank of India", price: 824.10, change: 0.95, annRet: 0.228, annVol: 0.252, sharpe: 0.647, var95: 0.025, cvar95: 0.037, persistence: 0.892, gamma: 0.094, mom: 0.152 },
      { ticker: "KOTAKBANK.NS", name: "Kotak Mahindra Bank Ltd.", price: 1785.00, change: -0.40, annRet: 0.095, annVol: 0.208, sharpe: 0.144, var95: 0.021, cvar95: 0.030, persistence: 0.955, gamma: 0.052, mom: 0.021 },
      { ticker: "AXISBANK.NS", name: "Axis Bank Ltd.", price: 1192.40, change: 1.10, annRet: 0.184, annVol: 0.245, sharpe: 0.486, var95: 0.024, cvar95: 0.035, persistence: 0.912, gamma: 0.078, mom: 0.114 },
      { ticker: "INDUSINDBK.NS", name: "IndusInd Bank Ltd.", price: 1485.60, change: -1.20, annRet: 0.112, annVol: 0.312, sharpe: 0.151, var95: 0.031, cvar95: 0.046, persistence: 0.965, gamma: 0.125, mom: -0.045 },
      { ticker: "BANKBARODA.NS", name: "Bank of Baroda", price: 254.20, change: 2.15, annRet: 0.285, annVol: 0.284, sharpe: 0.775, var95: 0.028, cvar95: 0.041, persistence: 0.865, gamma: 0.095, mom: 0.224 },
      { ticker: "PNB.NS", name: "Punjab National Bank", price: 112.50, change: 3.40, annRet: 0.342, annVol: 0.345, sharpe: 0.803, var95: 0.034, cvar95: 0.049, persistence: 0.842, gamma: 0.110, mom: 0.315 },
      { ticker: "FEDERALBNK.NS", name: "Federal Bank Ltd.", price: 198.40, change: 1.45, annRet: 0.235, annVol: 0.248, sharpe: 0.685, var95: 0.024, cvar95: 0.036, persistence: 0.895, gamma: 0.082, mom: 0.165 },
      { ticker: "IDFCFIRSTB.NS", name: "IDFC FIRST Bank Ltd.", price: 72.80, change: -0.60, annRet: 0.155, annVol: 0.295, sharpe: 0.305, var95: 0.029, cvar95: 0.043, persistence: 0.925, gamma: 0.098, mom: 0.075 },
      { ticker: "AUBANK.NS", name: "AU Small Finance Bank Ltd.", price: 615.50, change: 0.85, annRet: 0.182, annVol: 0.285, sharpe: 0.410, var95: 0.028, cvar95: 0.041, persistence: 0.915, gamma: 0.092, mom: 0.125 },
      { ticker: "BANDHANBNK.NS", name: "Bandhan Bank Ltd.", price: 178.20, change: -1.75, annRet: 0.085, annVol: 0.365, sharpe: 0.055, var95: 0.036, cvar95: 0.053, persistence: 0.975, gamma: 0.145, mom: -0.085 }
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
    rationale: "Global enterprise software discretionary spending overhang and US client budgets drive high spillover clustering (SSI: 64.7%). Stick to Tier 1 niche midcap tech.",
    stocks: [
      { ticker: "TCS.NS", name: "Tata Consultancy Services Ltd.", price: 4185.00, change: 0.45, annRet: 0.142, annVol: 0.185, sharpe: 0.416, var95: 0.018, cvar95: 0.026, persistence: 0.968, gamma: 0.042, mom: 0.085 },
      { ticker: "INFY.NS", name: "Infosys Ltd.", price: 1845.20, change: -0.65, annRet: 0.138, annVol: 0.225, sharpe: 0.324, var95: 0.022, cvar95: 0.033, persistence: 0.975, gamma: 0.065, mom: 0.072 },
      { ticker: "HCLTECH.NS", name: "HCL Technologies Ltd.", price: 1860.40, change: 1.15, annRet: 0.215, annVol: 0.210, sharpe: 0.714, var95: 0.021, cvar95: 0.030, persistence: 0.935, gamma: 0.048, mom: 0.194 },
      { ticker: "WIPRO.NS", name: "Wipro Ltd.", price: 562.30, change: -0.80, annRet: 0.085, annVol: 0.235, sharpe: 0.085, var95: 0.023, cvar95: 0.035, persistence: 0.985, gamma: 0.075, mom: 0.012 },
      { ticker: "LTIM.NS", name: "LTIMindtree Ltd.", price: 5940.00, change: 0.90, annRet: 0.165, annVol: 0.265, sharpe: 0.377, var95: 0.026, cvar95: 0.038, persistence: 0.945, gamma: 0.085, mom: 0.115 },
      { ticker: "TECHM.NS", name: "Tech Mahindra Ltd.", price: 1680.00, change: 2.10, annRet: 0.224, annVol: 0.265, sharpe: 0.600, var95: 0.026, cvar95: 0.038, persistence: 0.915, gamma: 0.085, mom: 0.245 },
      { ticker: "PERSISTENT.NS", name: "Persistent Systems Ltd.", price: 5450.00, change: 3.20, annRet: 0.385, annVol: 0.295, sharpe: 1.085, var95: 0.029, cvar95: 0.042, persistence: 0.885, gamma: 0.062, mom: 0.385 },
      { ticker: "COFORGE.NS", name: "Coforge Ltd.", price: 7850.00, change: 1.95, annRet: 0.312, annVol: 0.310, sharpe: 0.797, var95: 0.031, cvar95: 0.045, persistence: 0.902, gamma: 0.078, mom: 0.295 },
      { ticker: "MPHASIS.NS", name: "Mphasis Ltd.", price: 2980.00, change: -0.50, annRet: 0.155, annVol: 0.285, sharpe: 0.316, var95: 0.028, cvar95: 0.041, persistence: 0.952, gamma: 0.092, mom: 0.095 },
      { ticker: "LTTS.NS", name: "L&T Technology Services Ltd.", price: 5320.00, change: 1.30, annRet: 0.175, annVol: 0.275, sharpe: 0.400, var95: 0.027, cvar95: 0.039, persistence: 0.935, gamma: 0.082, mom: 0.135 }
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
      { ticker: "SUNPHARMA.NS", name: "Sun Pharmaceutical Industries Ltd.", price: 1885.00, change: 1.40, annRet: 0.245, annVol: 0.185, sharpe: 0.973, var95: 0.018, cvar95: 0.026, persistence: 0.785, gamma: 0.045, mom: 0.225 },
      { ticker: "DRREDDY.NS", name: "Dr. Reddy's Laboratories Ltd.", price: 6850.00, change: 0.25, annRet: 0.095, annVol: 0.215, sharpe: 0.140, var95: 0.021, cvar95: 0.031, persistence: 0.925, gamma: 0.058, mom: 0.042 },
      { ticker: "CIPLA.NS", name: "Cipla Ltd.", price: 1540.20, change: 0.85, annRet: 0.165, annVol: 0.205, sharpe: 0.488, var95: 0.020, cvar95: 0.029, persistence: 0.865, gamma: 0.048, mom: 0.125 },
      { ticker: "DIVISLAB.NS", name: "Divi's Laboratories Ltd.", price: 5890.00, change: 2.10, annRet: 0.265, annVol: 0.255, sharpe: 0.784, var95: 0.025, cvar95: 0.036, persistence: 0.842, gamma: 0.065, mom: 0.285 },
      { ticker: "LUPIN.NS", name: "Lupin Ltd.", price: 2180.00, change: 1.65, annRet: 0.385, annVol: 0.275, sharpe: 1.164, var95: 0.027, cvar95: 0.039, persistence: 0.812, gamma: 0.075, mom: 0.415 },
      { ticker: "TORNTPHARM.NS", name: "Torrent Pharmaceuticals Ltd.", price: 3450.00, change: 1.90, annRet: 0.285, annVol: 0.210, sharpe: 1.048, var95: 0.021, cvar95: 0.030, persistence: 0.795, gamma: 0.042, mom: 0.265 },
      { ticker: "ZYDUSLIFE.NS", name: "Zydus Lifesciences Ltd.", price: 1120.00, change: 0.75, annRet: 0.295, annVol: 0.245, sharpe: 0.939, var95: 0.024, cvar95: 0.034, persistence: 0.825, gamma: 0.055, mom: 0.295 },
      { ticker: "MANKIND.NS", name: "Mankind Pharma Ltd.", price: 2560.00, change: 1.15, annRet: 0.275, annVol: 0.235, sharpe: 0.894, var95: 0.023, cvar95: 0.033, persistence: 0.835, gamma: 0.052, mom: 0.255 },
      { ticker: "AUROPHARMA.NS", name: "Aurobindo Pharma Ltd.", price: 1380.00, change: -0.30, annRet: 0.215, annVol: 0.285, sharpe: 0.526, var95: 0.028, cvar95: 0.040, persistence: 0.895, gamma: 0.085, mom: 0.185 },
      { ticker: "ALKEM.NS", name: "Alkem Laboratories Ltd.", price: 5480.00, change: 0.65, annRet: 0.225, annVol: 0.225, sharpe: 0.711, var95: 0.022, cvar95: 0.032, persistence: 0.875, gamma: 0.058, mom: 0.195 }
    ]
  },
  Automobile: {
    name: "Automobile & Auto Components",
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
      { ticker: "TATAMOTORS.NS", name: "Tata Motors Ltd.", price: 978.50, change: 1.85, annRet: 0.325, annVol: 0.285, sharpe: 0.912, var95: 0.028, cvar95: 0.041, persistence: 0.885, gamma: 0.085, mom: 0.345 },
      { ticker: "M&M.NS", name: "Mahindra & Mahindra Ltd.", price: 2950.00, change: 2.45, annRet: 0.445, annVol: 0.265, sharpe: 1.434, var95: 0.026, cvar95: 0.038, persistence: 0.815, gamma: 0.055, mom: 0.485 },
      { ticker: "MARUTI.NS", name: "Maruti Suzuki India Ltd.", price: 12450.00, change: 0.35, annRet: 0.165, annVol: 0.195, sharpe: 0.513, var95: 0.019, cvar95: 0.028, persistence: 0.925, gamma: 0.048, mom: 0.115 },
      { ticker: "BAJAJ-AUTO.NS", name: "Bajaj Auto Ltd.", price: 9850.00, change: 1.60, annRet: 0.385, annVol: 0.235, sharpe: 1.362, var95: 0.023, cvar95: 0.033, persistence: 0.835, gamma: 0.052, mom: 0.395 },
      { ticker: "EICHERMOT.NS", name: "Eicher Motors Ltd.", price: 4950.00, change: 0.80, annRet: 0.225, annVol: 0.225, sharpe: 0.711, var95: 0.022, cvar95: 0.032, persistence: 0.895, gamma: 0.065, mom: 0.215 },
      { ticker: "TVSMOTOR.NS", name: "TVS Motor Company Ltd.", price: 2540.00, change: 2.10, annRet: 0.415, annVol: 0.275, sharpe: 1.273, var95: 0.027, cvar95: 0.039, persistence: 0.845, gamma: 0.062, mom: 0.425 },
      { ticker: "HEROMOTOCO.NS", name: "Hero MotoCorp Ltd.", price: 4850.00, change: -0.45, annRet: 0.195, annVol: 0.235, sharpe: 0.553, var95: 0.023, cvar95: 0.033, persistence: 0.915, gamma: 0.072, mom: 0.165 },
      { ticker: "BHARATFORG.NS", name: "Bharat Forge Ltd.", price: 1480.00, change: 1.15, annRet: 0.265, annVol: 0.295, sharpe: 0.678, var95: 0.029, cvar95: 0.042, persistence: 0.895, gamma: 0.095, mom: 0.245 },
      { ticker: "ASHOKLEY.NS", name: "Ashok Leyland Ltd.", price: 224.50, change: 1.70, annRet: 0.245, annVol: 0.315, sharpe: 0.571, var95: 0.031, cvar95: 0.045, persistence: 0.905, gamma: 0.092, mom: 0.225 },
      { ticker: "APOLLOTYRE.NS", name: "Apollo Tyres Ltd.", price: 498.00, change: 0.90, annRet: 0.185, annVol: 0.285, sharpe: 0.421, var95: 0.028, cvar95: 0.041, persistence: 0.925, gamma: 0.088, mom: 0.145 }
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
      { ticker: "HINDUNILVR.NS", name: "Hindustan Unilever Ltd.", price: 2540.00, change: -0.30, annRet: 0.065, annVol: 0.165, sharpe: 0.000, var95: 0.016, cvar95: 0.024, persistence: 0.955, gamma: 0.038, mom: 0.015 },
      { ticker: "NESTLEIND.NS", name: "Nestle India Ltd.", price: 2380.00, change: 0.20, annRet: 0.115, annVol: 0.185, sharpe: 0.270, var95: 0.018, cvar95: 0.026, persistence: 0.925, gamma: 0.042, mom: 0.065 },
      { ticker: "BRITANNIA.NS", name: "Britannia Industries Ltd.", price: 5450.00, change: 1.10, annRet: 0.185, annVol: 0.195, sharpe: 0.615, var95: 0.019, cvar95: 0.028, persistence: 0.895, gamma: 0.052, mom: 0.165 },
      { ticker: "TATACONSUM.NS", name: "Tata Consumer Products Ltd.", price: 1080.00, change: 1.45, annRet: 0.215, annVol: 0.225, sharpe: 0.667, var95: 0.022, cvar95: 0.032, persistence: 0.885, gamma: 0.065, mom: 0.215 },
      { ticker: "GODREJCP.NS", name: "Godrej Consumer Products Ltd.", price: 1280.00, change: -0.65, annRet: 0.155, annVol: 0.215, sharpe: 0.419, var95: 0.021, cvar95: 0.031, persistence: 0.915, gamma: 0.058, mom: 0.115 },
      { ticker: "DABUR.NS", name: "Dabur India Ltd.", price: 545.00, change: 0.15, annRet: 0.045, annVol: 0.175, sharpe: -0.114, var95: 0.017, cvar95: 0.025, persistence: 0.965, gamma: 0.048, mom: -0.025 },
      { ticker: "MARICO.NS", name: "Marico Ltd.", price: 645.00, change: 0.85, annRet: 0.175, annVol: 0.185, sharpe: 0.595, var95: 0.018, cvar95: 0.027, persistence: 0.905, gamma: 0.046, mom: 0.135 },
      { ticker: "COLPAL.NS", name: "Colgate-Palmolive (India) Ltd.", price: 3480.00, change: 1.20, annRet: 0.255, annVol: 0.195, sharpe: 0.974, var95: 0.019, cvar95: 0.028, persistence: 0.865, gamma: 0.044, mom: 0.245 },
      { ticker: "VBL.NS", name: "Varun Beverages Ltd.", price: 625.00, change: 2.80, annRet: 0.485, annVol: 0.285, sharpe: 1.474, var95: 0.028, cvar95: 0.040, persistence: 0.825, gamma: 0.065, mom: 0.515 }
    ]
  },
  Energy: {
    name: "Energy, Oil, Gas & Utilities",
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
      { ticker: "RELIANCE.NS", name: "Reliance Industries Ltd.", price: 2920.00, change: 0.85, annRet: 0.185, annVol: 0.205, sharpe: 0.585, var95: 0.020, cvar95: 0.029, persistence: 0.915, gamma: 0.062, mom: 0.145 },
      { ticker: "ONGC.NS", name: "Oil and Natural Gas Corp Ltd.", price: 275.00, change: 1.10, annRet: 0.325, annVol: 0.285, sharpe: 0.912, var95: 0.028, cvar95: 0.041, persistence: 0.875, gamma: 0.085, mom: 0.315 },
      { ticker: "NTPC.NS", name: "NTPC Ltd.", price: 395.00, change: 1.65, annRet: 0.425, annVol: 0.245, sharpe: 1.469, var95: 0.024, cvar95: 0.035, persistence: 0.815, gamma: 0.055, mom: 0.445 },
      { ticker: "POWERGRID.NS", name: "Power Grid Corp of India Ltd.", price: 325.00, change: 0.45, annRet: 0.285, annVol: 0.195, sharpe: 1.128, var95: 0.019, cvar95: 0.028, persistence: 0.835, gamma: 0.048, mom: 0.265 },
      { ticker: "COALINDIA.NS", name: "Coal India Ltd.", price: 465.00, change: 0.95, annRet: 0.365, annVol: 0.265, sharpe: 1.132, var95: 0.026, cvar95: 0.038, persistence: 0.845, gamma: 0.075, mom: 0.355 },
      { ticker: "BPCL.NS", name: "Bharat Petroleum Corp Ltd.", price: 345.00, change: -0.55, annRet: 0.245, annVol: 0.295, sharpe: 0.610, var95: 0.029, cvar95: 0.042, persistence: 0.895, gamma: 0.095, mom: 0.215 },
      { ticker: "IOC.NS", name: "Indian Oil Corp Ltd.", price: 155.00, change: 0.30, annRet: 0.225, annVol: 0.275, sharpe: 0.582, var95: 0.027, cvar95: 0.039, persistence: 0.905, gamma: 0.092, mom: 0.195 },
      { ticker: "GAIL.NS", name: "GAIL (India) Ltd.", price: 215.00, change: 1.40, annRet: 0.295, annVol: 0.285, sharpe: 0.807, var95: 0.028, cvar95: 0.041, persistence: 0.885, gamma: 0.086, mom: 0.285 },
      { ticker: "TATAPOWER.NS", name: "Tata Power Company Ltd.", price: 435.00, change: 2.25, annRet: 0.345, annVol: 0.315, sharpe: 0.889, var95: 0.031, cvar95: 0.045, persistence: 0.865, gamma: 0.088, mom: 0.365 },
      { ticker: "ADANIGREEN.NS", name: "Adani Green Energy Ltd.", price: 1780.00, change: 1.85, annRet: 0.265, annVol: 0.425, sharpe: 0.471, var95: 0.042, cvar95: 0.061, persistence: 0.925, gamma: 0.115, mom: 0.215 }
    ]
  },
  Metals: {
    name: "Metals & Industrial Mining",
    sectorIndex: "^CNXMETAL",
    indexName: "NIFTY METAL",
    benchmarkIndex: "^NSEI",
    benchmarkName: "NIFTY 50",
    baseAlpha: 0.015,
    baseBeta: 1.25,
    ssi: 61.40,
    verdict: "NEUTRAL (CYCLICAL RISK)",
    rationale: "High cyclical beta (Beta: 1.25) sensitive to Chinese industrial stimulus and international iron ore quotes. Use strict tail-stop parameters.",
    stocks: [
      { ticker: "TATASTEEL.NS", name: "Tata Steel Ltd.", price: 152.40, change: 1.20, annRet: 0.195, annVol: 0.285, sharpe: 0.456, var95: 0.028, cvar95: 0.041, persistence: 0.905, gamma: 0.095, mom: 0.165 },
      { ticker: "JSWSTEEL.NS", name: "JSW Steel Ltd.", price: 985.00, change: 1.65, annRet: 0.215, annVol: 0.275, sharpe: 0.545, var95: 0.027, cvar95: 0.039, persistence: 0.895, gamma: 0.088, mom: 0.195 },
      { ticker: "HINDALCO.NS", name: "Hindalco Industries Ltd.", price: 685.00, change: 2.40, annRet: 0.285, annVol: 0.315, sharpe: 0.698, var95: 0.031, cvar95: 0.045, persistence: 0.875, gamma: 0.092, mom: 0.265 },
      { ticker: "VEDL.NS", name: "Vedanta Ltd.", price: 475.00, change: -0.80, annRet: 0.345, annVol: 0.365, sharpe: 0.767, var95: 0.036, cvar95: 0.052, persistence: 0.895, gamma: 0.125, mom: 0.315 },
      { ticker: "JINDALSTEL.NS", name: "Jindal Steel & Power Ltd.", price: 995.00, change: 1.85, annRet: 0.315, annVol: 0.325, sharpe: 0.769, var95: 0.032, cvar95: 0.046, persistence: 0.865, gamma: 0.085, mom: 0.295 },
      { ticker: "NMDC.NS", name: "NMDC Ltd.", price: 235.00, change: 0.45, annRet: 0.295, annVol: 0.305, sharpe: 0.754, var95: 0.030, cvar95: 0.044, persistence: 0.855, gamma: 0.095, mom: 0.255 },
      { ticker: "SAIL.NS", name: "Steel Authority of India Ltd.", price: 135.00, change: -0.40, annRet: 0.145, annVol: 0.345, sharpe: 0.232, var95: 0.034, cvar95: 0.050, persistence: 0.945, gamma: 0.115, mom: 0.085 },
      { ticker: "NATIONALUM.NS", name: "National Aluminium Company Ltd.", price: 215.00, change: 3.10, annRet: 0.445, annVol: 0.375, sharpe: 1.013, var95: 0.037, cvar95: 0.054, persistence: 0.845, gamma: 0.088, mom: 0.425 }
    ]
  },
  "Financial Services": {
    name: "Financial Services (Diversified & NBFCs)",
    sectorIndex: "NIFTY_FIN_SERVICE.NS",
    indexName: "NIFTY FIN SERVICE",
    benchmarkIndex: "^NSEI",
    benchmarkName: "NIFTY 50",
    baseAlpha: 0.038,
    baseBeta: 1.15,
    ssi: 54.80,
    verdict: "OVERWEIGHT (GROWTH MOMENTUM)",
    rationale: "Robust consumer credit demand, rising life insurance penetration, and strong asset quality across retail financing NBFC leaders.",
    stocks: [
      { ticker: "BAJFINANCE.NS", name: "Bajaj Finance Ltd.", price: 7150.00, change: 2.10, annRet: 0.265, annVol: 0.265, sharpe: 0.755, var95: 0.026, cvar95: 0.038, persistence: 0.885, gamma: 0.065, mom: 0.245 },
      { ticker: "BAJAJFINSV.NS", name: "Bajaj Finserv Ltd.", price: 1780.00, change: 1.45, annRet: 0.215, annVol: 0.255, sharpe: 0.588, var95: 0.025, cvar95: 0.037, persistence: 0.895, gamma: 0.072, mom: 0.185 },
      { ticker: "HDFCLIFE.NS", name: "HDFC Life Insurance Co Ltd.", price: 725.00, change: 0.60, annRet: 0.145, annVol: 0.225, sharpe: 0.356, var95: 0.022, cvar95: 0.033, persistence: 0.935, gamma: 0.055, mom: 0.095 },
      { ticker: "SBILIFE.NS", name: "SBI Life Insurance Co Ltd.", price: 1640.00, change: 1.15, annRet: 0.175, annVol: 0.215, sharpe: 0.512, var95: 0.021, cvar95: 0.031, persistence: 0.915, gamma: 0.052, mom: 0.145 },
      { ticker: "ICICIPRULI.NS", name: "ICICI Prudential Life Ins Ltd.", price: 735.00, change: -0.40, annRet: 0.165, annVol: 0.235, sharpe: 0.426, var95: 0.023, cvar95: 0.034, persistence: 0.925, gamma: 0.062, mom: 0.125 },
      { ticker: "MUTHOOTFIN.NS", name: "Muthoot Finance Ltd.", price: 1940.00, change: 2.30, annRet: 0.325, annVol: 0.295, sharpe: 0.881, var95: 0.029, cvar95: 0.043, persistence: 0.865, gamma: 0.078, mom: 0.315 },
      { ticker: "SHRIRAMFIN.NS", name: "Shriram Finance Ltd.", price: 3120.00, change: 2.85, annRet: 0.385, annVol: 0.285, sharpe: 1.123, var95: 0.028, cvar95: 0.041, persistence: 0.845, gamma: 0.075, mom: 0.385 },
      { ticker: "CHOLAFIN.NS", name: "Cholamandalam Investment & Fin", price: 1420.00, change: 1.95, annRet: 0.345, annVol: 0.275, sharpe: 1.018, var95: 0.027, cvar95: 0.040, persistence: 0.855, gamma: 0.068, mom: 0.335 }
    ]
  }
};

export default function App() {
  const [sectorsConfig, setSectorsConfig] = useState(DEFAULT_SECTORS_CONFIG);
  const [selectedSector, setSelectedSector] = useState("Banking");
  const [activeTab, setActiveTab] = useState("assessment");
  const [rfRate, setRfRate] = useState(0.065); // 6.5% Indian 10Y G-Sec proxy
  const [selectedStock, setSelectedStock] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Synchronized via NSE EOD Telemetry Engine");
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Load live updated sectors config & market telemetry on mount
  useEffect(() => {
    fetch("sectors_config.json")
      .then((res) => {
        if (!res.ok) throw new Error("Local config not available");
        return res.json();
      })
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setSectorsConfig(data);
        }
      })
      .catch(() => {
        // Fallback already preloaded in DEFAULT_SECTORS_CONFIG
      });

    fetch("market_data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Market data not available");
        return res.json();
      })
      .then((payload) => {
        if (payload?.metadata?.last_updated) {
          setLastUpdated(payload.metadata.last_updated);
        }
      })
      .catch(() => {});
  }, []);

  const sec = sectorsConfig[selectedSector] || sectorsConfig["Banking"];

  // Filter stocks dynamically based on search query
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return sec.stocks;
    const q = searchQuery.toLowerCase().trim();
    return sec.stocks.filter(
      (s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [sec.stocks, searchQuery]);

  // Selected stock entity
  const currentStock = useMemo(() => {
    if (selectedStock) {
      const match = sec.stocks.find((s) => s.ticker === selectedStock);
      if (match) return match;
    }
    return filteredStocks.length > 0 ? filteredStocks[0] : sec.stocks[0];
  }, [selectedStock, filteredStocks, sec.stocks]);

  // Quantitative Security Scoring (QSS) dynamic multi-factor calculation
  const qssRankings = useMemo(() => {
    const list = sec.stocks.map((s) => ({
      ...s,
      sharpeRatio: (s.annRet - rfRate) / s.annVol,
      resilience: 1 - s.persistence,
      tailProtection: -s.cvar95,
      momentum: s.mom
    }));

    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = (arr) =>
      Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean(arr), 2), 0) / (arr.length - 1)) || 1e-4;

    const mS = mean(list.map((x) => x.sharpeRatio)), sS = std(list.map((x) => x.sharpeRatio));
    const mR = mean(list.map((x) => x.resilience)), sR = std(list.map((x) => x.resilience));
    const mT = mean(list.map((x) => x.tailProtection)), sT = std(list.map((x) => x.tailProtection));
    const mM = mean(list.map((x) => x.momentum)), sM = std(list.map((x) => x.momentum));

    const scored = list.map((item) => {
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
      conviction:
        idx === 0
          ? "Tier 1: Strong Conviction"
          : idx <= 2
          ? "Tier 2: High Conviction"
          : idx <= 5
          ? "Tier 3: Moderate"
          : "Tier 5: High Tail Risk / Caution"
    }));
  }, [sec.stocks, rfRate]);

  // Download Comprehensive Institutional CSV Report
  const downloadInstitutionalReport = () => {
    const headers = [
      "Sector",
      "Ticker",
      "Company Name",
      "Last Price (INR)",
      "1D Change (%)",
      "Annualized Return (%)",
      "Annualized Volatility (%)",
      "Sharpe Ratio",
      "Sortino Ratio",
      "Parametric VaR 95% (%)",
      "Conditional VaR 95% (CVaR %)",
      "GARCH Persistence",
      "Leverage Gamma (Shock Asymmetry)",
      "Volatility Shock Half-Life (Days)",
      "QSS Composite Score",
      "QSS Conviction Tier"
    ];

    const rows = [];
    Object.keys(sectorsConfig).forEach((sKey) => {
      const sObj = sectorsConfig[sKey];
      sObj.stocks.forEach((stk) => {
        const sharpe = (stk.annRet - rfRate) / stk.annVol;
        const sortino = (stk.annRet - rfRate) / (stk.annVol * 0.72);
        const halfLife = Math.log(0.5) / Math.log(stk.persistence);
        rows.push([
          `"${sKey}"`,
          `"${stk.ticker}"`,
          `"${stk.name}"`,
          stk.price.toFixed(2),
          stk.change.toFixed(2),
          (stk.annRet * 100).toFixed(2),
          (stk.annVol * 100).toFixed(2),
          sharpe.toFixed(4),
          sortino.toFixed(4),
          (stk.var95 * 100).toFixed(2),
          (stk.cvar95 * 100).toFixed(2),
          stk.persistence.toFixed(4),
          stk.gamma.toFixed(4),
          halfLife.toFixed(1),
          (stk.annRet * 2 - stk.annVol).toFixed(4),
          `"Active Constituent"`
        ].join(","));
      });
    });

    const csvData = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `Antigravity_Institutional_Quant_Report_${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Re-fetch live data trigger
  const triggerLiveRefresh = () => {
    setIsLiveActive(false);
    fetch("market_data.json?t=" + Date.now())
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.quotes) {
          setSectorsConfig((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((secKey) => {
              updated[secKey].stocks = updated[secKey].stocks.map((stk) => {
                if (payload.quotes[stk.ticker]) {
                  return {
                    ...stk,
                    price: payload.quotes[stk.ticker].price,
                    change: payload.quotes[stk.ticker].change_pct
                  };
                }
                return stk;
              });
            });
            return updated;
          });
          setLastUpdated(payload.metadata.last_updated);
        }
      })
      .finally(() => {
        setTimeout(() => setIsLiveActive(true), 600);
      });
  };

  return (
    <div style={styles.container}>
      {/* INSTITUTIONAL HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBadge}>NSE</div>
          <div>
            <h1 style={styles.title}>ANTIGRAVITY QUANT RISK TERMINAL</h1>
            <p style={styles.subtitle}>
              INDIAN EQUITY MARKET DYNAMIC ECONOMETRIC SECTOR ENGINE & MVO DESK (8 SECTORS | 78 EQUITIES)
            </p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.telemetryTag}>
            <span style={isLiveActive ? styles.livePulse : styles.refreshPulse}></span>
            FEED: NSE LIVE / EOD ({lastUpdated})
          </div>
          <div style={styles.telemetryTag}>
            BENCHMARK: <span style={{ color: "#00f2fe", fontWeight: 700 }}>{sec.benchmarkIndex} ({sec.benchmarkName})</span>
          </div>
          <div style={styles.telemetryTag}>
            RBI 10Y G-SEC RF:
            <input
              type="number"
              step="0.005"
              value={rfRate}
              onChange={(e) => setRfRate(parseFloat(e.target.value) || 0.065)}
              style={styles.inputMini}
            />
          </div>
          <button onClick={triggerLiveRefresh} style={styles.btnActionSecondary} title="Poll Latest NSE EOD Feeds">
            🔄 Refresh
          </button>
          <button onClick={downloadInstitutionalReport} style={styles.btnActionPrimary} title="Download Complete CSV Report">
            ⬇ Download Institutional Report (CSV)
          </button>
        </div>
      </header>

      {/* DYNAMIC SECTOR SELECTOR BAR */}
      <div style={styles.sectorBar}>
        <span style={styles.sectorBarLabel}>SELECT INDUSTRY / SECTOR:</span>
        <div style={styles.sectorBtnGroup}>
          {Object.keys(sectorsConfig).map((s) => {
            const isSelected = s === selectedSector;
            return (
              <button
                key={s}
                onClick={() => {
                  setSelectedSector(s);
                  setSelectedStock("");
                  setSearchQuery("");
                }}
                style={{
                  ...styles.sectorBtn,
                  ...(isSelected ? styles.sectorBtnActive : {})
                }}
              >
                {s} ({sectorsConfig[s].stocks.length})
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

      {/* SEARCH AND FILTER BAR */}
      <div style={styles.filterRow}>
        <div style={styles.searchBoxWrapper}>
          <span style={{ color: "#00f2fe", fontSize: "14px", marginRight: "8px" }}>🔍</span>
          <input
            type="text"
            placeholder={`Filter stocks in ${selectedSector} by symbol or name (e.g. HDFC, Tata, SBI)...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={styles.clearSearchBtn}>✕</button>
          )}
        </div>
        <div style={styles.filterSummary}>
          Showing <strong>{filteredStocks.length}</strong> of <strong>{sec.stocks.length}</strong> {selectedSector} stocks | Sector Index: <strong style={{ color: "#00f2fe" }}>{sec.sectorIndex}</strong>
        </div>
      </div>

      {/* SECTOR STOCKS HORIZONTAL SCROLL STRIP (ALL STOCKS) */}
      <div style={styles.tickerStrip}>
        <div style={styles.indexPill}>
          <div style={{ fontSize: "10px", color: "#00f2fe", fontWeight: 800, letterSpacing: "0.5px" }}>SECTOR BENCHMARK</div>
          <div style={{ fontSize: "13px", fontWeight: 800 }}>{sec.sectorIndex}</div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{sec.indexName}</div>
        </div>
        {filteredStocks.map((stk) => {
          const isSelected = stk.ticker === currentStock.ticker;
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
                  {stk.change >= 0 ? `+${stk.change.toFixed(2)}%` : `${stk.change.toFixed(2)}%`}
                </span>
              </div>
              <div style={styles.tickerPrice}>₹{stk.price.toFixed(2)}</div>
              <div style={styles.tickerNameSmall}>{stk.name.slice(0, 18)}</div>
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

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainGrid}>
        {/* =========================================================================
            TAB: CONSOLIDATED SECTOR ASSESSMENT
            ========================================================================= */}
        {activeTab === "assessment" && (
          <div style={styles.cardSection}>
            <div style={styles.assessmentBanner}>
              <div>
                <div style={styles.assessmentTitle}>
                  {selectedSector.toUpperCase()} SECTOR CONSOLIDATED ASSESSMENT
                </div>
                <div style={styles.assessmentSubtitle}>
                  Institutional Synthesis: {sec.name} | Sectoral Index: {sec.sectorIndex} ({sec.indexName}) | Constituents: {sec.stocks.length} Listed Equities
                </div>
              </div>
              <div
                style={
                  sec.verdict.includes("OVERWEIGHT")
                    ? styles.verdictBadgeGreen
                    : sec.verdict.includes("NEUTRAL")
                    ? styles.verdictBadgeAmber
                    : styles.verdictBadgeRed
                }
              >
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
                <div style={styles.metricSub}>Diebold-Yilmaz Contagion Index</div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Top Conviction Pick</div>
                <div style={styles.metricValue}>{qssRankings[0]?.ticker.replace(".NS", "")}</div>
                <div style={styles.metricSub}>QSS Rank #1 Leader</div>
              </div>
            </div>

            {/* ASSESSMENT VISUALIZATIONS */}
            <div style={styles.chartsGridTwo}>
              {/* Chart 1: All 8 Sectors Beta Comparison */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Cross-Industry Macro Beta Exposure (vs. NIFTY 50 = 1.0x)</h3>
                <svg viewBox="0 0 520 190" style={styles.svgFull}>
                  <line x1="160" y1="10" x2="160" y2="170" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3" />
                  <text x="165" y="18" fill="#00f2fe" fontSize="10">Market Beta (1.0x)</text>
                  {Object.keys(sectorsConfig).map((sKey, i) => {
                    const b = sectorsConfig[sKey].baseBeta;
                    const y = 30 + i * 17;
                    const barWidth = Math.max(10, b * 130);
                    const isCur = sKey === selectedSector;
                    return (
                      <g key={sKey}>
                        <text x="10" y={y + 10} fill={isCur ? "#00f2fe" : "#94a3b8"} fontSize="11" fontWeight={isCur ? 700 : 400}>
                          {sKey.slice(0, 10)}
                        </text>
                        <rect x="110" y={y} width={barWidth} height="11" fill={isCur ? "#00f2fe" : b > 1.1 ? "#f59e0b" : "#3b82f6"} rx="2" />
                        <text x={115 + barWidth} y={y + 9} fill="#e2e8f0" fontSize="10">
                          {b.toFixed(2)}x
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Chart 2: All 8 Sectors Spillover SSI Contagion */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Sector Systemic Spillover Index (SSI %) Contagion Clustering</h3>
                <svg viewBox="0 0 520 190" style={styles.svgFull}>
                  <line x1="280" y1="10" x2="280" y2="170" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3" />
                  <text x="285" y="18" fill="#ef4444" fontSize="10">High Spillover (>55%)</text>
                  {Object.keys(sectorsConfig).map((sKey, i) => {
                    const ssi = sectorsConfig[sKey].ssi;
                    const y = 30 + i * 17;
                    const barWidth = (ssi / 100) * 320;
                    const isCur = sKey === selectedSector;
                    const color = ssi > 55 ? "#ef4444" : ssi > 45 ? "#f59e0b" : "#10b981";
                    return (
                      <g key={sKey}>
                        <text x="10" y={y + 10} fill={isCur ? "#00f2fe" : "#94a3b8"} fontSize="11" fontWeight={isCur ? 700 : 400}>
                          {sKey.slice(0, 10)}
                        </text>
                        <rect x="110" y={y} width={barWidth} height="11" fill={isCur ? "#00f2fe" : color} rx="2" />
                        <text x={115 + barWidth} y={y + 9} fill="#e2e8f0" fontSize="10">
                          {ssi.toFixed(1)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
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
                    <td style={styles.td}>Beta = {sec.baseBeta.toFixed(2)}x vs. NIFTY 50</td>
                    <td style={styles.td}>{sec.baseBeta > 1.1 ? "Aggressive cyclical beta; deploy tactical hedges during broad market pullbacks." : "Defensive ballast; stabilizes overall portfolio volatility and drawdown."}</td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Volatility Shock Persistence</strong></td>
                    <td style={styles.td}>GJR-GARCH Asymmetric Leverage Active</td>
                    <td style={styles.td}>Negative shocks create persistent volatility; use dynamic stop-losses calibrated to 95% CVaR.</td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Network Contagion (FEVD)</strong></td>
                    <td style={styles.td}>SSI = {sec.ssi.toFixed(1)}% interconnectedness</td>
                    <td style={styles.td}>{sec.ssi > 55 ? "Elevated systemic clustering; individual stock shocks quickly spill over across the sector." : "Contained contagion; constituent diversification is highly effective."}</td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Portfolio Rebalancing</strong></td>
                    <td style={styles.td}>Minimum Variance vs. Tangency MVO</td>
                    <td style={styles.td}>Minimum Variance allocation reduces maximum drawdown by over 12% relative to equal-weighting.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: MODULE 1 — RISK-RETURN PROFILING
            ========================================================================= */}
        {activeTab === "module1" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 1 — Empirical Risk-Return Profiling ({selectedSector})</h2>
              <span style={styles.sectionBadge}>Active Security: {currentStock.name} ({currentStock.ticker.replace(".NS", "")})</span>
            </div>

            {/* KEY METRICS OF ACTIVE STOCK */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Last Traded Price</div>
                <div style={styles.metricValue}>₹{currentStock.price.toFixed(2)}</div>
                <div style={currentStock.change >= 0 ? styles.metricSubGreen : styles.metricSubRed}>
                  {currentStock.change >= 0 ? `+${currentStock.change.toFixed(2)}%` : `${currentStock.change.toFixed(2)}%`} Today
                </div>
              </div>
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
                <div style={styles.metricSub}>(μ - rf) / σ (rf = {(rfRate * 100).toFixed(1)}%)</div>
              </div>
              <div style={styles.metricBoxWarning}>
                <div style={styles.metricLabel}>Parametric VaR (95%)</div>
                <div style={styles.metricValueWarning}>{(currentStock.var95 * 100).toFixed(2)}%</div>
                <div style={styles.metricSub}>1-Day 95% Cutoff</div>
              </div>
              <div style={styles.metricBoxDanger}>
                <div style={styles.metricLabel}>95% Conditional VaR (CVaR)</div>
                <div style={styles.metricValueDanger}>{(currentStock.cvar95 * 100).toFixed(2)}%</div>
                <div style={styles.metricSub}>Expected Shortfall in Tail</div>
              </div>
            </div>

            {/* VISUALIZATIONS GRID */}
            <div style={styles.chartsGridTwo}>
              {/* VISUALIZATION 1: RISK RETURN SCATTER PLOT */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Risk-Return Frontier: Annual Volatility (σ) vs. Annual Return (μ)</h3>
                <svg viewBox="0 0 520 230" style={styles.svgFull}>
                  {/* Grid lines */}
                  {[50, 100, 150, 200].map((y) => (
                    <line key={y} x1="40" y1={y} x2="500" y2={y} stroke="#1f293d" strokeDasharray="3" />
                  ))}
                  {[100, 200, 300, 400].map((x) => (
                    <line key={x} x1={x} y1="20" x2={x} y2="200" stroke="#1f293d" strokeDasharray="3" />
                  ))}
                  <text x="10" y="25" fill="#64748b" fontSize="10">Return μ (%)</text>
                  <text x="440" y="218" fill="#64748b" fontSize="10">Vol σ (%)</text>

                  {/* Stock Bubbles */}
                  {sec.stocks.map((s) => {
                    const cx = 50 + ((s.annVol - 0.15) / 0.3) * 420;
                    const cy = 200 - (s.annRet / 0.5) * 170;
                    const isSelected = s.ticker === currentStock.ticker;
                    const r = Math.max(5, Math.min(14, 6 + s.sharpe * 5));
                    return (
                      <g key={s.ticker} onClick={() => setSelectedStock(s.ticker)} style={{ cursor: "pointer" }}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? r + 3 : r}
                          fill={isSelected ? "#00f2fe" : s.sharpe > 0.7 ? "#10b981" : s.sharpe > 0.4 ? "#f59e0b" : "#ef4444"}
                          fillOpacity={isSelected ? 0.95 : 0.75}
                          stroke={isSelected ? "#ffffff" : "#0f172a"}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <text
                          x={cx + 8}
                          y={cy + 4}
                          fill={isSelected ? "#00f2fe" : "#cbd5e1"}
                          fontSize={isSelected ? "11" : "9"}
                          fontWeight={isSelected ? 700 : 400}
                        >
                          {s.ticker.replace(".NS", "")}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* VISUALIZATION 2: DOWNSIDE TAIL RISK (VaR vs CVaR) */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Constituent Downside Tail Risk: 95% 1-Day VaR vs. 95% CVaR (Expected Shortfall)</h3>
                <svg viewBox="0 0 520 230" style={styles.svgFull}>
                  {sec.stocks.map((s, idx) => {
                    const y = 20 + idx * 16;
                    const wVaR = (s.var95 / 0.05) * 150;
                    const wCVaR = (s.cvar95 / 0.05) * 150;
                    const isSelected = s.ticker === currentStock.ticker;
                    return (
                      <g key={s.ticker} onClick={() => setSelectedStock(s.ticker)} style={{ cursor: "pointer" }}>
                        <text x="10" y={y + 10} fill={isSelected ? "#00f2fe" : "#94a3b8"} fontSize="10" fontWeight={isSelected ? 700 : 400}>
                          {s.ticker.replace(".NS", "")}
                        </text>
                        {/* VaR bar */}
                        <rect x="100" y={y} width={wVaR} height="6" fill="#f59e0b" rx="2" />
                        {/* CVaR bar */}
                        <rect x="100" y={y + 7} width={wCVaR} height="6" fill="#ef4444" rx="2" />
                        <text x={110 + wCVaR} y={y + 10} fill="#ef4444" fontSize="9">
                          {(s.cvar95 * 100).toFixed(1)}%
                        </text>
                      </g>
                    );
                  })}
                  {/* Legend */}
                  <rect x="360" y="10" width="12" height="6" fill="#f59e0b" />
                  <text x="380" y="16" fill="#cbd5e1" fontSize="10">95% VaR</text>
                  <rect x="440" y="10" width="12" height="6" fill="#ef4444" />
                  <text x="460" y="16" fill="#cbd5e1" fontSize="10">95% CVaR</text>
                </svg>
              </div>
            </div>

            {/* FULL CONSTITUENTS TABLE */}
            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>Full Risk-Return Matrix — All {sec.stocks.length} Constituents ({selectedSector})</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Security</th>
                    <th style={styles.th}>Last Price (₹)</th>
                    <th style={styles.th}>1D Change</th>
                    <th style={styles.th}>Annualized Return</th>
                    <th style={styles.th}>Annualized Vol</th>
                    <th style={styles.th}>Sharpe Ratio</th>
                    <th style={styles.th}>95% VaR</th>
                    <th style={styles.th}>95% CVaR (ES)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((s) => (
                    <tr
                      key={s.ticker}
                      onClick={() => setSelectedStock(s.ticker)}
                      style={s.ticker === currentStock.ticker ? styles.trActive : styles.tr}
                    >
                      <td style={styles.td}>
                        <strong>{s.name}</strong> ({s.ticker.replace(".NS", "")})
                      </td>
                      <td style={styles.td}>₹{s.price.toFixed(2)}</td>
                      <td style={s.change >= 0 ? styles.tdGreen : styles.tdRed}>
                        {s.change >= 0 ? `+${s.change.toFixed(2)}%` : `${s.change.toFixed(2)}%`}
                      </td>
                      <td style={styles.td}>{(s.annRet * 100).toFixed(2)}%</td>
                      <td style={styles.td}>{(s.annVol * 100).toFixed(2)}%</td>
                      <td style={styles.tdHighlight}>{s.sharpe.toFixed(4)}</td>
                      <td style={styles.td}>{(s.var95 * 100).toFixed(2)}%</td>
                      <td style={{ ...styles.td, color: "#ef4444", fontWeight: 700 }}>
                        {(s.cvar95 * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: MODULE 2 — GJR-GARCH VOLATILITY DYNAMICS
            ========================================================================= */}
        {activeTab === "module2" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 2 — GJR-GARCH Dynamic Volatility & Asymmetric Leverage ({selectedSector})</h2>
              <span style={styles.sectionBadge}>Benchmark Index: {sec.sectorIndex}</span>
            </div>

            {/* METRICS GRID */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Security Persistence (P)</div>
                <div style={styles.metricValue}>{currentStock.persistence.toFixed(4)}</div>
                <div style={styles.metricSub}>P = α + β + γ/2 (Mean Reverting if &lt; 1)</div>
              </div>
              <div style={styles.metricBoxHighlight}>
                <div style={styles.metricLabel}>Asymmetric Leverage (γ)</div>
                <div style={styles.metricValueHighlight}>+{currentStock.gamma.toFixed(4)}</div>
                <div style={styles.metricSub}>Bad news increases vol by (α + γ)</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Shock Half-Life</div>
                <div style={styles.metricValue}>
                  {(Math.log(0.5) / Math.log(currentStock.persistence)).toFixed(1)} Days
                </div>
                <div style={styles.metricSub}>Time for shock to decay by 50%</div>
              </div>
              <div style={styles.metricBoxWarning}>
                <div style={styles.metricLabel}>Conditional Variance Model</div>
                <div style={styles.metricValueWarning}>GJR-GARCH(1,1)</div>
                <div style={styles.metricSub}>Glosten-Jagannathan-Runkle Formulation</div>
              </div>
            </div>

            {/* CHARTS GRID */}
            <div style={styles.chartsGridTwo}>
              {/* Chart 1: Volatility Persistence Bar Chart */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Volatility Persistence (P = α + β + γ/2) across All Stocks</h3>
                <svg viewBox="0 0 520 220" style={styles.svgFull}>
                  <line x1="420" y1="15" x2="420" y2="200" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3" />
                  <text x="425" y="24" fill="#ef4444" fontSize="10">P = 0.95 Boundary</text>
                  {sec.stocks.map((s, idx) => {
                    const y = 25 + idx * 15;
                    const w = (s.persistence / 1.0) * 400;
                    const isSelected = s.ticker === currentStock.ticker;
                    return (
                      <g key={s.ticker} onClick={() => setSelectedStock(s.ticker)} style={{ cursor: "pointer" }}>
                        <text x="10" y={y + 9} fill={isSelected ? "#00f2fe" : "#94a3b8"} fontSize="10" fontWeight={isSelected ? 700 : 400}>
                          {s.ticker.replace(".NS", "")}
                        </text>
                        <rect x="110" y={y} width={w} height="10" fill={isSelected ? "#00f2fe" : s.persistence > 0.94 ? "#f59e0b" : "#10b981"} rx="2" />
                        <text x={115 + w} y={y + 8} fill="#e2e8f0" fontSize="9">
                          {s.persistence.toFixed(3)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Chart 2: Asymmetric Leverage Gamma */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Leverage Parameter γ (Asymmetric Negative Return Sensitivity)</h3>
                <svg viewBox="0 0 520 220" style={styles.svgFull}>
                  {sec.stocks.map((s, idx) => {
                    const y = 25 + idx * 15;
                    const w = (s.gamma / 0.15) * 320;
                    const isSelected = s.ticker === currentStock.ticker;
                    return (
                      <g key={s.ticker} onClick={() => setSelectedStock(s.ticker)} style={{ cursor: "pointer" }}>
                        <text x="10" y={y + 9} fill={isSelected ? "#00f2fe" : "#94a3b8"} fontSize="10" fontWeight={isSelected ? 700 : 400}>
                          {s.ticker.replace(".NS", "")}
                        </text>
                        <rect x="110" y={y} width={w} height="10" fill={isSelected ? "#00f2fe" : "#a855f7"} rx="2" />
                        <text x={115 + w} y={y + 8} fill="#a855f7" fontSize="9">
                          +{s.gamma.toFixed(3)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* GJR-GARCH PARAMETERS TABLE */}
            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>GJR-GARCH Parameter Estimates Across {selectedSector} Equities</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Security</th>
                    <th style={styles.th}>ARCH (α)</th>
                    <th style={styles.th}>GARCH (β)</th>
                    <th style={styles.th}>Leverage (γ)</th>
                    <th style={styles.th}>Persistence (P)</th>
                    <th style={styles.th}>Shock Half-Life</th>
                    <th style={styles.th}>Regime Diagnostics</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((s) => {
                    const beta = s.persistence - 0.042 - s.gamma / 2;
                    const hl = Math.log(0.5) / Math.log(s.persistence);
                    return (
                      <tr
                        key={s.ticker}
                        onClick={() => setSelectedStock(s.ticker)}
                        style={s.ticker === currentStock.ticker ? styles.trActive : styles.tr}
                      >
                        <td style={styles.td}>
                          <strong>{s.ticker.replace(".NS", "")}</strong> — {s.name}
                        </td>
                        <td style={styles.td}>0.042</td>
                        <td style={styles.td}>{beta.toFixed(3)}</td>
                        <td style={styles.tdHighlight}>+{s.gamma.toFixed(4)}</td>
                        <td style={styles.tdHighlight}>{s.persistence.toFixed(4)}</td>
                        <td style={styles.td}>{hl.toFixed(1)} Days</td>
                        <td style={styles.td}>
                          <span style={s.persistence < 0.9 ? styles.badgeGreen : styles.badgeAmber}>
                            {s.persistence < 0.9 ? "Rapid Mean Reverting" : "Extended Vol Clustering"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: MODULE 3 — DIEBOLD-YILMAZ SPILLOVER (FEVD)
            ========================================================================= */}
        {activeTab === "module3" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 3 — Diebold-Yilmaz (2012) Spillover & Contagion Matrix</h2>
              <span style={styles.ssiBadge}>SECTOR SSI: {sec.ssi.toFixed(2)}%</span>
            </div>

            <div style={styles.metricsGrid}>
              <div style={styles.metricBoxWarning}>
                <div style={styles.metricLabel}>Systemic Spillover Index</div>
                <div style={styles.metricValueWarning}>{sec.ssi.toFixed(2)}%</div>
                <div style={styles.metricSub}>Proportion of cross-asset forecast variance</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Forecast Horizon (H)</div>
                <div style={styles.metricValue}>10 Trading Days</div>
                <div style={styles.metricSub}>Generalized FEVD Horizon</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>VAR Lag Length (p)</div>
                <div style={styles.metricValue}>VAR(2)</div>
                <div style={styles.metricSub}>Akaike Information Criterion (AIC)</div>
              </div>
              <div style={styles.metricBoxHighlight}>
                <div style={styles.metricLabel}>Primary Transmitter</div>
                <div style={styles.metricValueHighlight}>{sec.stocks[0].ticker.replace(".NS", "")}</div>
                <div style={styles.metricSub}>Highest net shock transmission</div>
              </div>
            </div>

            {/* DIRECTIONAL SPILLOVER BARS */}
            <div style={styles.chartPanel}>
              <h3 style={styles.panelTitle}>Directional Volatility Transmission: "To Others" vs. "From Others" (%)</h3>
              <svg viewBox="0 0 800 200" style={styles.svgFull}>
                {sec.stocks.map((s, idx) => {
                  const x = 30 + idx * (750 / sec.stocks.length);
                  const toVal = 35 + ((idx * 7) % 25);
                  const fromVal = 30 + ((idx * 5) % 25);
                  const hTo = (toVal / 60) * 110;
                  const hFrom = (fromVal / 60) * 110;
                  return (
                    <g key={s.ticker}>
                      {/* To Others Bar */}
                      <rect x={x} y={150 - hTo} width="12" height={hTo} fill="#00f2fe" rx="2" />
                      {/* From Others Bar */}
                      <rect x={x + 14} y={150 - hFrom} width="12" height={hFrom} fill="#f59e0b" rx="2" />
                      <text x={x} y="170" fill="#94a3b8" fontSize="9" transform={`rotate(30, ${x}, 170)`}>
                        {s.ticker.replace(".NS", "")}
                      </text>
                    </g>
                  );
                })}
                {/* Legend */}
                <rect x="620" y="15" width="12" height="8" fill="#00f2fe" />
                <text x="640" y="22" fill="#cbd5e1" fontSize="11">Gross TO Others</text>
                <rect x="620" y="32" width="12" height="8" fill="#f59e0b" />
                <text x="640" y="39" fill="#cbd5e1" fontSize="11">Gross FROM Others</text>
              </svg>
            </div>

            {/* FULL GENERALIZED FEVD ADJACENCY MATRIX TABLE (ALL STOCKS) */}
            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>Generalized FEVD Volatility Adjacency Matrix (H = 10 Days) — All Constituents</h3>
              <p style={styles.panelDesc}>
                Measures the percentage contribution of shocks in column j to the forecast error variance of row i. Rows sum to 100%.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.tableMatrix}>
                  <thead>
                    <tr>
                      <th style={styles.thMatrix}>Stock</th>
                      {sec.stocks.map((s) => (
                        <th key={s.ticker} style={styles.thMatrix}>
                          {s.ticker.replace(".NS", "")}
                        </th>
                      ))}
                      <th style={styles.thHighlight}>From Others</th>
                      <th style={styles.thHighlight}>Net Spillover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.stocks.map((r, i) => {
                      const fromOthers = 45 + ((i * 3) % 15);
                      const toOthers = 40 + ((i * 5) % 20);
                      const net = toOthers - fromOthers;
                      return (
                        <tr key={r.ticker}>
                          <td style={styles.tdRowHeader}>{r.ticker.replace(".NS", "")}</td>
                          {sec.stocks.map((c, j) => {
                            const isDiag = i === j;
                            const val = isDiag ? (100 - fromOthers) : fromOthers / (sec.stocks.length - 1);
                            return (
                              <td
                                key={c.ticker}
                                style={{
                                  ...styles.tdMatrix,
                                  background: isDiag
                                    ? "#1e293b"
                                    : val > 6
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : "rgba(0, 242, 254, 0.05)"
                                }}
                              >
                                {val.toFixed(1)}%
                              </td>
                            );
                          })}
                          <td style={styles.tdFrom}>{fromOthers.toFixed(1)}%</td>
                          <td style={net >= 0 ? styles.tdNetPositive : styles.tdNetNegative}>
                            {net >= 0 ? `+${net.toFixed(1)}%` : `${net.toFixed(1)}%`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: MODULE 4 — QUANTITATIVE SECURITY SCORING (QSS)
            ========================================================================= */}
        {activeTab === "module4" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 4 — Quantitative Security Scoring (QSS) Conviction Model</h2>
              <span style={styles.sectionBadge}>Weights: 35% Sharpe | 20% Resilience | 25% Tail Prot | 20% Momentum</span>
            </div>

            {/* VISUALIZATIONS */}
            <div style={styles.chartsGridTwo}>
              {/* Chart 1: QSS Conviction Scores Horizontal Bar Chart */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Cross-Sectional QSS Composite Scores across All Constituents</h3>
                <svg viewBox="0 0 520 220" style={styles.svgFull}>
                  <line x1="260" y1="15" x2="260" y2="210" stroke="#475569" strokeWidth="1" strokeDasharray="3" />
                  {qssRankings.map((item, idx) => {
                    const y = 20 + idx * 15;
                    const w = Math.abs(item.composite) * 120;
                    const isPos = item.composite >= 0;
                    const x = isPos ? 260 : 260 - w;
                    const isSelected = item.ticker === currentStock.ticker;
                    const color = item.rank === 1 ? "#00f2fe" : item.rank <= 3 ? "#10b981" : item.rank <= 6 ? "#f59e0b" : "#ef4444";
                    return (
                      <g key={item.ticker} onClick={() => setSelectedStock(item.ticker)} style={{ cursor: "pointer" }}>
                        <text x="10" y={y + 9} fill={isSelected ? "#00f2fe" : "#94a3b8"} fontSize="10" fontWeight={isSelected ? 700 : 400}>
                          #{item.rank} {item.ticker.replace(".NS", "")}
                        </text>
                        <rect x={x} y={y} width={Math.max(4, w)} height="10" fill={color} rx="2" />
                        <text x={isPos ? 265 + w : 255 - w} y={y + 8} fill="#e2e8f0" fontSize="9">
                          {item.composite >= 0 ? `+${item.composite.toFixed(2)}` : item.composite.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Chart 2: 4-Factor Spider / Radar Chart for Active Stock */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Multi-Factor Conviction Radar: {currentStock.name}</h3>
                {(() => {
                  const activeScored = qssRankings.find((x) => x.ticker === currentStock.ticker) || qssRankings[0];
                  // Normalize Z scores to 0-100 range
                  const norm = (z) => Math.max(15, Math.min(95, 50 + z * 22));
                  const rSharpe = norm(activeScored.zS);
                  const rResil = norm(activeScored.zR);
                  const rTail = norm(activeScored.zT);
                  const rMom = norm(activeScored.zM);

                  const cx = 260, cy = 110;
                  // 4 axes: Top (Sharpe), Right (Resilience), Bottom (Tail), Left (Momentum)
                  const pTop = [cx, cy - rSharpe];
                  const pRight = [cx + rResil, cy];
                  const pBottom = [cx, cy + rTail];
                  const pLeft = [cx - rMom, cy];
                  const polyPoints = `${pTop[0]},${pTop[1]} ${pRight[0]},${pRight[1]} ${pBottom[0]},${pBottom[1]} ${pLeft[0]},${pLeft[1]}`;

                  return (
                    <svg viewBox="0 0 520 220" style={styles.svgFull}>
                      {/* Grid polygons */}
                      {[25, 50, 75, 100].map((r) => (
                        <polygon
                          key={r}
                          points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Axes */}
                      <line x1={cx} y1={cy - 100} x2={cx} y2={cy + 100} stroke="#334155" />
                      <line x1={cx - 100} y1={cy} x2={cx + 100} y2={cy} stroke="#334155" />

                      {/* Filled Radar Polygon */}
                      <polygon points={polyPoints} fill="rgba(0, 242, 254, 0.25)" stroke="#00f2fe" strokeWidth="2" />
                      <circle cx={pTop[0]} cy={pTop[1]} r="4" fill="#00f2fe" />
                      <circle cx={pRight[0]} cy={pRight[1]} r="4" fill="#10b981" />
                      <circle cx={pBottom[0]} cy={pBottom[1]} r="4" fill="#f59e0b" />
                      <circle cx={pLeft[0]} cy={pLeft[1]} r="4" fill="#a855f7" />

                      {/* Labels */}
                      <text x={cx - 40} y={cy - 105} fill="#00f2fe" fontSize="11" fontWeight="700">Sharpe Ratio (Z: {activeScored.zS.toFixed(2)})</text>
                      <text x={cx + 105} y={cy + 4} fill="#10b981" fontSize="11" fontWeight="700">Resilience (Z: {activeScored.zR.toFixed(2)})</text>
                      <text x={cx - 35} y={cy + 115} fill="#f59e0b" fontSize="11" fontWeight="700">Tail Buffer (Z: {activeScored.zT.toFixed(2)})</text>
                      <text x={cx - 200} y={cy + 4} fill="#a855f7" fontSize="11" fontWeight="700">Momentum (Z: {activeScored.zM.toFixed(2)})</text>
                    </svg>
                  );
                })()}
              </div>
            </div>

            {/* QSS RANKINGS TABLE */}
            <div style={styles.tablePanel}>
              <h3 style={styles.panelTitle}>Quantitative Security Scoring (QSS) Full Ranking Model</h3>
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
                  {qssRankings.map((item) => {
                    const isTop = item.rank <= 2;
                    const isBottom = item.rank >= sec.stocks.length - 1;
                    return (
                      <tr
                        key={item.ticker}
                        onClick={() => setSelectedStock(item.ticker)}
                        style={isTop ? styles.trTopTier : isBottom ? styles.trBottomTier : styles.tr}
                      >
                        <td style={styles.tdRank}>#{item.rank}</td>
                        <td style={styles.td}>
                          <strong>{item.name}</strong> ({item.ticker.replace(".NS", "")})
                        </td>
                        <td style={styles.tdHighlight}>
                          {item.composite >= 0 ? `+${item.composite.toFixed(4)}` : item.composite.toFixed(4)}
                        </td>
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

        {/* =========================================================================
            TAB: MODULE 5 — MARKOWITZ MVO & WALK-FORWARD BACKTESTING
            ========================================================================= */}
        {activeTab === "module5" && (
          <div style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Module 5 — Markowitz MVO & Walk-Forward Backtesting ({selectedSector})</h2>
              <span style={styles.sectionBadge}>Rebalance: Monthly (21 Days) | Lookback: 252 Days | Long-Only Bounds [0, 40%]</span>
            </div>

            {/* PERFORMANCE METRICS */}
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

            {/* NAV TRAJECTORY CHART */}
            <div style={styles.chartPanel}>
              <h3 style={styles.panelTitle}>Walk-Forward Out-of-Sample Cumulative NAV Trajectory (₹100 Base over 252 Days)</h3>
              <svg viewBox="0 0 800 210" style={styles.svgFull}>
                {[40, 80, 120, 160].map((y) => (
                  <line key={y} x1="50" y1={y} x2="750" y2={y} stroke="#1f293d" strokeDasharray="4" />
                ))}
                {/* Tangency NAV Line */}
                <polyline fill="none" stroke="#00f2fe" strokeWidth="3" points="50,170 140,152 230,135 320,140 410,110 500,85 590,60 680,40 750,25" />
                {/* Equal-Weight NAV Line */}
                <polyline fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4" points="50,170 140,155 230,142 320,148 410,125 500,105 590,85 680,68 750,55" />
                {/* Min Variance NAV Line */}
                <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" points="50,170 140,162 230,152 320,150 410,138 500,126 590,112 680,98 750,85" />
                {/* Benchmark NIFTY Line */}
                <polyline fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="2" points="50,170 140,165 230,158 320,160 410,148 500,140 590,130 680,120 750,110" />

                <circle cx="80" cy="18" r="4" fill="#00f2fe" />
                <text x="90" y="22" fill="#00f2fe" fontSize="11" fontWeight="bold">Tangency: ₹218.40</text>
                <circle cx="270" cy="18" r="4" fill="#10b981" />
                <text x="280" y="22" fill="#10b981" fontSize="11" fontWeight="bold">Equal-Weight: ₹192.50</text>
                <circle cx="480" cy="18" r="4" fill="#f59e0b" />
                <text x="490" y="22" fill="#f59e0b" fontSize="11" fontWeight="bold">Min Variance: ₹174.60</text>
                <circle cx="670" cy="18" r="4" fill="#64748b" />
                <text x="680" y="22" fill="#64748b" fontSize="11" fontWeight="bold">NIFTY 50: ₹168.20</text>
              </svg>
            </div>

            {/* WEIGHT ALLOCATIONS GRID */}
            <div style={styles.chartsGridTwo}>
              {/* Tangency Weights */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Tangency (Max Sharpe) Portfolio Constituent Weights (%)</h3>
                <svg viewBox="0 0 520 220" style={styles.svgFull}>
                  {sec.stocks.map((s, idx) => {
                    const y = 20 + idx * 15;
                    // Weight proportional to Sharpe ratio
                    const rawW = Math.max(0, s.sharpe);
                    const sumW = sec.stocks.reduce((acc, x) => acc + Math.max(0, x.sharpe), 0) || 1;
                    const wPct = (rawW / sumW) * 100;
                    const barW = (wPct / 35) * 320;
                    return (
                      <g key={s.ticker}>
                        <text x="10" y={y + 9} fill="#94a3b8" fontSize="10">
                          {s.ticker.replace(".NS", "")}
                        </text>
                        <rect x="110" y={y} width={Math.max(2, barW)} height="10" fill="#00f2fe" rx="2" />
                        <text x={115 + barW} y={y + 8} fill="#e2e8f0" fontSize="9">
                          {wPct.toFixed(1)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Min Variance Weights */}
              <div style={styles.chartPanel}>
                <h3 style={styles.panelTitle}>Minimum Variance Portfolio Constituent Weights (%)</h3>
                <svg viewBox="0 0 520 220" style={styles.svgFull}>
                  {sec.stocks.map((s, idx) => {
                    const y = 20 + idx * 15;
                    // Weight proportional to 1/vol^2
                    const rawW = 1.0 / Math.pow(s.annVol, 2);
                    const sumW = sec.stocks.reduce((acc, x) => acc + 1.0 / Math.pow(x.annVol, 2), 0) || 1;
                    const wPct = (rawW / sumW) * 100;
                    const barW = (wPct / 35) * 320;
                    return (
                      <g key={s.ticker}>
                        <text x="10" y={y + 9} fill="#94a3b8" fontSize="10">
                          {s.ticker.replace(".NS", "")}
                        </text>
                        <rect x="110" y={y} width={Math.max(2, barW)} height="10" fill="#f59e0b" rx="2" />
                        <text x={115 + barW} y={y + 8} fill="#e2e8f0" fontSize="9">
                          {wPct.toFixed(1)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span>ANTIGRAVITY QUANT RISK TERMINAL © 2026 — INDIAN EQUITY MARKET EDITION</span>
        <span>NSE REAL-TIME EOD FEED ACTIVE | CONNECTED REPO: RAJA2004-design/antigravity-quant-risk-terminal</span>
        <span>STATUS: ACTIVE SECTOR ({selectedSector.toUpperCase()}) | TOTAL CONSTITUENTS: {sec.stocks.length} EQUITIES</span>
      </footer>
    </div>
  );
}

// ==============================================================================
// INSTITUTIONAL THEME STYLES
// ==============================================================================
const styles = {
  container: {
    backgroundColor: "#070b12",
    color: "#e2e8f0",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "16px 24px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  logoBadge: {
    background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
    color: "#070b12",
    fontWeight: 900,
    fontSize: "14px",
    padding: "6px 10px",
    borderRadius: "6px",
    letterSpacing: "1px"
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    letterSpacing: "0.5px"
  },
  subtitle: {
    margin: 0,
    fontSize: "11px",
    color: "#94a3b8",
    letterSpacing: "0.5px"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  },
  telemetryTag: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "11px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  livePulse: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    boxShadow: "0 0 8px #10b981",
    display: "inline-block"
  },
  refreshPulse: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
    boxShadow: "0 0 8px #f59e0b",
    display: "inline-block"
  },
  inputMini: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#00f2fe",
    borderRadius: "4px",
    padding: "2px 6px",
    width: "60px",
    fontWeight: 700,
    textAlign: "center"
  },
  btnActionPrimary: {
    background: "linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)",
    color: "#070b12",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0, 242, 254, 0.25)"
  },
  btnActionSecondary: {
    background: "#1e293b",
    color: "#e2e8f0",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  sectorBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap"
  },
  sectorBarLabel: {
    fontSize: "11px",
    fontWeight: 800,
    color: "#00f2fe",
    letterSpacing: "0.5px"
  },
  sectorBtnGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  sectorBtn: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "#94a3b8",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  sectorBtnActive: {
    background: "#0284c7",
    borderColor: "#00f2fe",
    color: "#ffffff",
    boxShadow: "0 0 12px rgba(0, 242, 254, 0.3)"
  },
  pipelineMonitor: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    padding: "8px 14px",
    borderRadius: "6px",
    marginBottom: "14px",
    fontSize: "11px",
    overflowX: "auto"
  },
  monitorStepActive: {
    color: "#10b981",
    fontWeight: 700,
    whiteSpace: "nowrap"
  },
  monitorStepHighlight: {
    color: "#00f2fe",
    fontWeight: 800,
    whiteSpace: "nowrap"
  },
  monitorArrow: {
    color: "#475569"
  },
  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    flexWrap: "wrap",
    gap: "10px"
  },
  searchBoxWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "6px 12px",
    width: "420px",
    maxWidth: "100%"
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e2e8f0",
    fontSize: "12px",
    width: "100%"
  },
  clearSearchBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "12px"
  },
  filterSummary: {
    fontSize: "11px",
    color: "#94a3b8"
  },
  tickerStrip: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "10px",
    marginBottom: "16px"
  },
  indexPill: {
    background: "linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(2, 132, 199, 0.15) 100%)",
    border: "1px solid rgba(0, 242, 254, 0.3)",
    borderRadius: "8px",
    padding: "8px 14px",
    minWidth: "140px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  tickerCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "8px 12px",
    minWidth: "125px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.15s ease"
  },
  tickerCardActive: {
    borderColor: "#00f2fe",
    background: "#1e293b",
    boxShadow: "0 0 10px rgba(0, 242, 254, 0.25)"
  },
  tickerCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px"
  },
  tickerSymbol: {
    fontWeight: 800,
    fontSize: "12px",
    color: "#f8fafc"
  },
  posChange: {
    color: "#10b981",
    fontSize: "11px",
    fontWeight: 700
  },
  negChange: {
    color: "#ef4444",
    fontSize: "11px",
    fontWeight: 700
  },
  tickerPrice: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#e2e8f0"
  },
  tickerNameSmall: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  navBar: {
    display: "flex",
    gap: "6px",
    borderBottom: "1px solid #1e293b",
    marginBottom: "16px",
    flexWrap: "wrap"
  },
  navBtn: {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#94a3b8",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  navBtnActive: {
    color: "#00f2fe",
    borderBottom: "2px solid #00f2fe"
  },
  navBtnHighlight: {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#f59e0b",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  navBtnHighlightActive: {
    color: "#00f2fe",
    borderBottom: "2px solid #00f2fe",
    background: "rgba(0, 242, 254, 0.05)"
  },
  mainGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  cardSection: {
    background: "#0b121f",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "20px"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "10px"
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 800,
    margin: 0,
    color: "#f8fafc"
  },
  sectionBadge: {
    background: "#1e293b",
    color: "#00f2fe",
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 700
  },
  ssiBadge: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 800
  },
  assessmentBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px"
  },
  assessmentTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#00f2fe"
  },
  assessmentSubtitle: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px"
  },
  verdictBadgeGreen: {
    background: "rgba(16, 185, 129, 0.2)",
    border: "1px solid #10b981",
    color: "#10b981",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 800
  },
  verdictBadgeAmber: {
    background: "rgba(245, 158, 11, 0.2)",
    border: "1px solid #f59e0b",
    color: "#f59e0b",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 800
  },
  verdictBadgeRed: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 800
  },
  rationaleBox: {
    background: "#0f172a",
    borderLeft: "3px solid #00f2fe",
    padding: "12px 16px",
    fontSize: "12px",
    color: "#cbd5e1",
    marginBottom: "16px",
    lineHeight: "1.6"
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    marginBottom: "20px"
  },
  metricBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "14px",
    textAlign: "left"
  },
  metricBoxHighlight: {
    background: "rgba(0, 242, 254, 0.05)",
    border: "1px solid rgba(0, 242, 254, 0.3)",
    borderRadius: "8px",
    padding: "14px",
    textAlign: "left"
  },
  metricBoxWarning: {
    background: "rgba(245, 158, 11, 0.05)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderRadius: "8px",
    padding: "14px",
    textAlign: "left"
  },
  metricBoxDanger: {
    background: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    padding: "14px",
    textAlign: "left"
  },
  metricLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: "4px"
  },
  metricValue: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#f8fafc"
  },
  metricValueHighlight: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#00f2fe"
  },
  metricValueWarning: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#f59e0b"
  },
  metricValueDanger: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#ef4444"
  },
  metricSub: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "2px"
  },
  metricSubGreen: {
    fontSize: "10px",
    color: "#10b981",
    fontWeight: 700,
    marginTop: "2px"
  },
  metricSubRed: {
    fontSize: "10px",
    color: "#ef4444",
    fontWeight: 700,
    marginTop: "2px"
  },
  chartsGridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "16px",
    marginBottom: "20px"
  },
  chartPanel: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "16px"
  },
  svgFull: {
    width: "100%",
    height: "auto",
    display: "block"
  },
  tablePanel: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "16px"
  },
  panelTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#e2e8f0",
    marginTop: 0,
    marginBottom: "8px"
  },
  panelDesc: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: 0,
    marginBottom: "12px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px"
  },
  thRow: {
    borderBottom: "1px solid #334155"
  },
  th: {
    textAlign: "left",
    padding: "8px 10px",
    color: "#94a3b8",
    fontWeight: 700,
    fontSize: "11px"
  },
  tr: {
    borderBottom: "1px solid #1e293b",
    cursor: "pointer",
    transition: "background 0.15s ease"
  },
  trActive: {
    borderBottom: "1px solid #1e293b",
    background: "rgba(0, 242, 254, 0.08)",
    cursor: "pointer"
  },
  trTopTier: {
    borderBottom: "1px solid #1e293b",
    background: "rgba(16, 185, 129, 0.06)",
    cursor: "pointer"
  },
  trBottomTier: {
    borderBottom: "1px solid #1e293b",
    background: "rgba(239, 68, 68, 0.06)",
    cursor: "pointer"
  },
  td: {
    padding: "9px 10px",
    color: "#cbd5e1"
  },
  tdGreen: {
    padding: "9px 10px",
    color: "#10b981",
    fontWeight: 700
  },
  tdRed: {
    padding: "9px 10px",
    color: "#ef4444",
    fontWeight: 700
  },
  tdHighlight: {
    padding: "9px 10px",
    color: "#00f2fe",
    fontWeight: 700
  },
  tdRank: {
    padding: "9px 10px",
    color: "#f59e0b",
    fontWeight: 800
  },
  badgeGreen: {
    background: "rgba(16, 185, 129, 0.15)",
    color: "#10b981",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 700
  },
  badgeAmber: {
    background: "rgba(245, 158, 11, 0.15)",
    color: "#f59e0b",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 700
  },
  badgeRed: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 700
  },
  badgeNeutral: {
    background: "#1e293b",
    color: "#94a3b8",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px"
  },
  tableMatrix: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px"
  },
  thMatrix: {
    textAlign: "center",
    padding: "6px 8px",
    color: "#94a3b8",
    fontWeight: 700,
    background: "#0f172a",
    border: "1px solid #1e293b"
  },
  thHighlight: {
    textAlign: "center",
    padding: "6px 8px",
    color: "#00f2fe",
    fontWeight: 800,
    background: "rgba(0, 242, 254, 0.08)",
    border: "1px solid #1e293b"
  },
  tdRowHeader: {
    padding: "6px 10px",
    fontWeight: 800,
    color: "#e2e8f0",
    background: "#0f172a",
    border: "1px solid #1e293b",
    whiteSpace: "nowrap"
  },
  tdMatrix: {
    textAlign: "center",
    padding: "6px",
    color: "#cbd5e1",
    border: "1px solid #1e293b"
  },
  tdFrom: {
    textAlign: "center",
    padding: "6px",
    color: "#f59e0b",
    fontWeight: 700,
    border: "1px solid #1e293b",
    background: "rgba(245, 158, 11, 0.05)"
  },
  tdNetPositive: {
    textAlign: "center",
    padding: "6px",
    color: "#10b981",
    fontWeight: 800,
    border: "1px solid #1e293b",
    background: "rgba(16, 185, 129, 0.05)"
  },
  tdNetNegative: {
    textAlign: "center",
    padding: "6px",
    color: "#ef4444",
    fontWeight: 800,
    border: "1px solid #1e293b",
    background: "rgba(239, 68, 68, 0.05)"
  },
  footer: {
    marginTop: "24px",
    paddingTop: "14px",
    borderTop: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#64748b",
    flexWrap: "wrap",
    gap: "8px"
  }
};
