# Antigravity Quant Terminal & Econometrics Engine (Indian Equity Market Edition)

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-blue.svg)](https://www.python.org/)
[![Exchange](https://img.shields.io/badge/Exchange-NSE%20India%20%7C%20NIFTY%2050-orange.svg)](https://www.nseindia.com/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Econometrics](https://img.shields.io/badge/Econometrics-GARCH%20%7C%20VAR%20%7C%20FEVD%20%7C%20MVO-purple.svg)]()

An institutional-grade, empirical quantitative risk terminal and econometric analytics engine dynamically covering the **entire Indian equity market (NSE)** across all major industry sectors.

The platform provides a dynamic, industry-independent framework where selecting any industry (e.g. Banking, IT, Pharmaceuticals, Automobile, FMCG, Energy, Metals) automatically resolves its constituent equities, its sectoral benchmark index (e.g. NIFTY BANK, NIFTY IT, NIFTY PHARMA), and the overarching market benchmark (**NIFTY 50 — `^NSEI`**).

---

## Supported Indian Equity Sectors

| Sector / Industry | Sectoral Index | Key NSE Constituent Equities |
| :--- | :--- | :--- |
| **Banking** | `^NSEBANK` (NIFTY BANK) | HDFCBANK, ICICIBANK, SBIN, KOTAKBANK, AXISBANK, INDUSINDBK, BANKBARODA, PNB, FEDERALBNK, IDFCFIRSTB |
| **Information Technology** | `^CNXIT` (NIFTY IT) | TCS, INFY, HCLTECH, WIPRO, LTIM, TECHM, PERSISTENT, COFORGE, MPHASIS, LTTS |
| **Pharmaceuticals** | `^CNXPHARMA` (NIFTY PHARMA) | SUNPHARMA, DRREDDY, CIPLA, DIVISLAB, LUPIN, TORNTPHARM, ZYDUSLIFE, MANKIND, AUROPHARMA, ALKEM |
| **Automobile** | `^CNXAUTO` (NIFTY AUTO) | TATAMOTORS, M&M, MARUTI, BAJAJ-AUTO, EICHERMOT, TVSMOTOR, HEROMOTOCO, BHARATFORG, ASHOKLEY, APOLLOTYRE |
| **FMCG** | `^CNXFMCG` (NIFTY FMCG) | ITC, HINDUNILVR, NESTLEIND, BRITANNIA, TATACONSUM, GODREJCP, DABUR, MARICO, COLPAL, VBL |
| **Energy & Utilities** | `^CNXENERGY` (NIFTY ENERGY) | RELIANCE, ONGC, NTPC, POWERGRID, COALINDIA, BPCL, IOC, GAIL, TATAPOWER, ADANIGREEN |
| **Metals & Mining** | `^CNXMETAL` (NIFTY METAL) | TATASTEEL, JSWSTEEL, HINDALCO, VEDL, JINDALSTEL, NMDC, SAIL, NATIONALUM |
| **Financial Services** | `NIFTY_FIN_SERVICE.NS` | BAJFINANCE, BAJAJFINSV, HDFCLIFE, SBILIFE, ICICIPRULI, MUTHOOTFIN, SHRIRAMFIN, CHOLAFIN |
| **Market Benchmark** | **`^NSEI` (NIFTY 50)** | Overarching Indian equity market benchmark for macro beta & alpha estimation |

---

## 5-Module Econometric Core Pipeline

The framework executes five institutional econometric layers dynamically on any selected industry:

1. **Module 1 — Empirical Risk-Return Profiling**:
   - Continuously compounded log returns: $r_t = \ln(P_t / P_{t-1})$
   - Annualized Mean Return ($\mu_{\text{ann}} = \mu_{\text{daily}} \times 252$) and Total Volatility ($\sigma_{\text{ann}} = \sigma_{\text{daily}} \times \sqrt{252}$)
   - Sharpe Ratio $\frac{\mu_{\text{ann}} - r_f}{\sigma_{\text{ann}}}$ and Sortino Ratio $\frac{\mu_{\text{ann}} - r_f}{\sigma_{\text{down}}}$ (with Indian G-Sec $r_f = 6.5\%$)
   - Parametric 95% 1-Day VaR: $1.64485 \sigma_d - \mu_d$
   - Historical 95% 1-Day VaR: $-q_{0.05}(r)$
   - 95% Conditional VaR (Expected Shortfall): $-\mathbb{E}[r_t \mid r_t \le - \text{VaR}_{0.95}^{\text{hist}}]$

2. **Module 2 — Dynamic Volatility Forecasting & Asymmetric Leverage**:
   - GARCH(1,1), EGARCH(1,1), and GJR-GARCH(1,1,1)
   - Calibrates asymmetric leverage shock parameter $\gamma$ (market decline volatility response)
   - Volatility Persistence: $P = \alpha + \beta + \frac{\gamma}{2}$
   - Shock Half-life: $T_{1/2} = \frac{\ln(0.5)}{\ln(P)}$
   - Term structure forecasting (1-day, 5-day, 10-day, 21-day annualized forward volatility)

3. **Module 3 — Systemic Volatility Spillover (Diebold-Yilmaz 2012)**:
   - Order-invariant Generalized Forecast Error Variance Decomposition (GFEVD) via $\text{VAR}(2)$
   - $N \times N$ volatility adjacency matrix $\tilde{\theta}_{ij}(H)$
   - Directional spillovers **From-Others** ($\mathcal{S}_{i \leftarrow \bullet}$), **To-Others** ($\mathcal{S}_{\bullet \leftarrow i}$), and **Net Spillover** ($\mathcal{S}_i^{\text{net}}$)
   - Sector Systemic Spillover Index (SSI) quantifying internal network fragility

4. **Module 4 — Quantitative Security Scoring (QSS)**:
   - Dynamic multi-factor cross-sectional conviction ranking:
     $$\text{QSS}_i = 0.35 Z_{\text{Sharpe}} + 0.20 Z_{\text{LowPersistence}} + 0.25 Z_{\text{TailProtection}} + 0.20 Z_{\text{Momentum}}$$
   - Assigns equities into 5 conviction tiers (*Tier 1: Strong Conviction* to *Tier 5: High Tail Risk / Caution*)

5. **Module 5 — Markowitz Portfolio Optimization (MVO) & Walk-Forward Backtesting**:
   - Tangency Max Sharpe vs. Global Minimum Variance (GMV) vs. Sector Equal-Weight vs. NIFTY 50
   - Rolling in-sample window ($L = 252$ trading days) with monthly out-of-sample rebalancing ($\Delta t = 21$ trading days)
   - Evaluates cumulative out-of-sample NAV paths (Base = ₹100.00), Sharpe ratios, and drawdowns.

6. **Consolidated Industry Assessment Generator**:
   - Automated synthesis of sector health, macro beta relative to NIFTY 50, Jensen's Alpha, internal spillover fragility (SSI), volatility persistence, top QSS conviction leaders, and strategic allocation verdict (*Overweight*, *Neutral*, *Underweight*).

---

## Project Structure

```
antigravity-quant-risk-terminal/
├── indian_markets.py        # Indian Equity Sector Taxonomy & Universe Resolver
├── quant_engine.py          # Core Econometric Engine (Modules 1-5 + Sector Pipeline)
├── terminal.py              # Interactive Indian Equity CLI Terminal
├── App.jsx                  # Institutional Web UI Dashboard with Sector Selector
├── dashboard.html           # Standalone Zero-Dependency HTML5 Terminal Dashboard
├── index.html               # Web Terminal Shell
├── main.jsx                 # React root mount
├── package.json             # Frontend dependencies & scripts
├── test_quant_engine.py     # Comprehensive Unit & Econometric Test Suite (7/7 passing)
├── requirements.txt         # Python Package Requirements
├── REPORT.md                # Institutional Quantitative Empirical Research Report
├── ARCHITECTURE.md          # Technical Architecture & Mermaid Sequence Flows
└── README.md                # System Documentation & Mathematical Specifications
```

---

## Quickstart & Local Execution

### 1. Requirements Installation
```bash
pip install -r requirements.txt
```

### 2. List Supported Indian Sectors
```bash
python terminal.py --list-sectors
```

### 3. Run Sector Analysis via CLI
Execute analysis on any sector with one command:
```bash
# Banking Sector (NIFTY BANK)
python terminal.py --sector Banking

# IT Sector (NIFTY IT)
python terminal.py --sector IT

# Pharmaceuticals Sector (NIFTY PHARMA)
python terminal.py --sector Pharma

# Automobile Sector (NIFTY AUTO)
python terminal.py --sector Auto

# FMCG Sector (NIFTY FMCG)
python terminal.py --sector FMCG

# Energy Sector (NIFTY ENERGY)
python terminal.py --sector Energy

# Metals Sector (NIFTY METAL)
python terminal.py --sector Metals
```

### 4. Live Market Telemetry & Automated Daily Refresh
To refresh all 78 constituent equities and 8 sectoral benchmarks with end-of-day (EOD) market quotes from the National Stock Exchange of India (NSE):
```bash
python update_market_data.py
```
This updates `market_data.json` and `sectors_config.json`. The automated daily update is scheduled to run at **23:55 IST** via Windows Task Scheduler (`AntigravQuantMarketUpdate`).

### 5. Run Automated Unit Tests
```bash
python -m unittest test_quant_engine.py -v
```

### 6. Launch the Interactive Web Dashboard
- **Zero-Dependency Mode**: Double-click [`dashboard.html`](file:///d:/Project/antigravity-quant-risk-terminal/dashboard.html) in any web browser.
- **Vite React Dev Server**:
  ```bash
  npm install
  npm run dev
  ```
- **Features in Dashboard**:
  - Live EOD Telemetry with automatic update timestamp
  - Real-time stock search and filtering across all 78 constituents
  - Rich interactive SVG charts in every module:
    - **Assessment**: Cross-sector macro beta comparison & SSI contagion ranking
    - **Module 1**: Interactive Risk-Return frontier scatter & 95% VaR vs. CVaR downside exposure
    - **Module 2**: Volatility persistence bars (with $P=0.95$ threshold) & asymmetric leverage $\gamma$
    - **Module 3**: Directional "To/From-Others" spillovers & full generalized FEVD heatmap matrix
    - **Module 4**: Cross-sectional QSS conviction rankings & 4-factor radar chart
    - **Module 5**: Walk-forward out-of-sample cumulative NAV paths & MVO portfolio weights
  - One-click **Download Institutional Report (CSV)** for all sectors and stocks.

---

## Python API Usage

```python
from quant_engine import run_sector_pipeline

# Dynamically analyze any Indian sector
results = run_sector_pipeline(sector_name="Banking", rf=0.065)

# 1. Consolidated Industry Assessment
assessment = results["consolidated_assessment"]
print("Verdict:", assessment["verdict"])
print("Beta to NIFTY 50:", assessment["macro_metrics"]["beta_to_nifty"])
print("Sector SSI:", assessment["network_connectedness"]["systemic_spillover_index"])
print("Top QSS Picks:", assessment["conviction_stock_picks"]["tier1_top_conviction"])

# 2. Risk-Return Profile (Stocks + NIFTY BANK + NIFTY 50)
print(results["module1_risk_profile"][["Annualized Return", "Sharpe Ratio", "Conditional VaR (95%)"]])

# 3. Markowitz Walk-Forward Strategy Comparison
print(results["module5_mvo_backtest"]["strategy_profile"])
```

---

## License
MIT License. Tailored for quantitative investment management in Indian Equity Markets.
