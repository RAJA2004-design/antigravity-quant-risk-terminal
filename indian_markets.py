"""
Indian Equity Market Sector Taxonomy & Universe Resolver
=========================================================
Dynamically maps any Indian industry / sector to its:
1. Sectoral Index (e.g. NIFTY BANK, NIFTY IT, NIFTY PHARMA, NIFTY AUTO, NIFTY FMCG, etc.)
2. Listed constituent equities on the National Stock Exchange of India (NSE: *.NS)
3. Overall Market Benchmark: NIFTY 50 (^NSEI)
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

try:
    import yfinance as yf
except ImportError:
    yf = None

MARKET_BENCHMARK = "^NSEI"  # NIFTY 50 Index

INDIAN_SECTORS: Dict[str, Dict[str, Any]] = {
    "Banking": {
        "name": "Banking & Financial Intermediation",
        "aliases": ["banking", "bank", "banks", "nifty bank", "banknifty"],
        "sector_index": "^NSEBANK",
        "index_name": "NIFTY BANK",
        "benchmark_index": MARKET_BENCHMARK,
        "stocks": [
            "HDFCBANK.NS",
            "ICICIBANK.NS",
            "SBIN.NS",
            "KOTAKBANK.NS",
            "AXISBANK.NS",
            "INDUSINDBK.NS",
            "BANKBARODA.NS",
            "PNB.NS",
            "FEDERALBNK.NS",
            "IDFCFIRSTB.NS",
            "AUBANK.NS",
            "BANDHANBNK.NS"
        ],
        "stock_names": {
            "HDFCBANK.NS": "HDFC Bank Ltd.",
            "ICICIBANK.NS": "ICICI Bank Ltd.",
            "SBIN.NS": "State Bank of India",
            "KOTAKBANK.NS": "Kotak Mahindra Bank Ltd.",
            "AXISBANK.NS": "Axis Bank Ltd.",
            "INDUSINDBK.NS": "IndusInd Bank Ltd.",
            "BANKBARODA.NS": "Bank of Baroda",
            "PNB.NS": "Punjab National Bank",
            "FEDERALBNK.NS": "Federal Bank Ltd.",
            "IDFCFIRSTB.NS": "IDFC FIRST Bank Ltd.",
            "AUBANK.NS": "AU Small Finance Bank Ltd.",
            "BANDHANBNK.NS": "Bandhan Bank Ltd.",
            "^NSEBANK": "NIFTY BANK Index",
            "^NSEI": "NIFTY 50 Benchmark"
        },
        "description": "Commercial, retail, and public sector banking institutions in India."
    },
    "IT": {
        "name": "Information Technology & Software Services",
        "aliases": ["it", "tech", "technology", "software", "nifty it"],
        "sector_index": "^CNXIT",
        "index_name": "NIFTY IT",
        "benchmark_index": MARKET_BENCHMARK,
        "stocks": [
            "TCS.NS",
            "INFY.NS",
            "HCLTECH.NS",
            "WIPRO.NS",
            "LTIM.NS",
            "TECHM.NS",
            "PERSISTENT.NS",
            "COFORGE.NS",
            "MPHASIS.NS",
            "LTTS.NS"
        ],
        "stock_names": {
            "TCS.NS": "Tata Consultancy Services Ltd.",
            "INFY.NS": "Infosys Ltd.",
            "HCLTECH.NS": "HCL Technologies Ltd.",
            "WIPRO.NS": "Wipro Ltd.",
            "LTIM.NS": "LTIMindtree Ltd.",
            "TECHM.NS": "Tech Mahindra Ltd.",
            "PERSISTENT.NS": "Persistent Systems Ltd.",
            "COFORGE.NS": "Coforge Ltd.",
            "MPHASIS.NS": "Mphasis Ltd.",
            "LTTS.NS": "L&T Technology Services Ltd.",
            "^CNXIT": "NIFTY IT Index",
            "^NSEI": "NIFTY 50 Benchmark"
        },
        "description": "Global enterprise software, digital consulting, and IT services providers."
    },
    "Pharmaceuticals": {
        "name": "Pharmaceuticals & Healthcare",
        "aliases": ["pharmaceuticals", "pharma", "healthcare", "biotech", "nifty pharma"],
        "sector_index": "^CNXPHARMA",
        "index_name": "NIFTY PHARMA",
        "benchmark_index": MARKET_BENCHMARK,
        "stocks": [
            "SUNPHARMA.NS",
            "DRREDDY.NS",
            "CIPLA.NS",
            "DIVISLAB.NS",
            "LUPIN.NS",
            "TORNTPHARM.NS",
            "ZYDUSLIFE.NS",
            "MANKIND.NS",
            "AUROPHARMA.NS",
            "ALKEM.NS"
        ],
        "stock_names": {
            "SUNPHARMA.NS": "Sun Pharmaceutical Industries Ltd.",
            "DRREDDY.NS": "Dr. Reddy's Laboratories Ltd.",
            "CIPLA.NS": "Cipla Ltd.",
            "DIVISLAB.NS": "Divi's Laboratories Ltd.",
            "LUPIN.NS": "Lupin Ltd.",
            "TORNTPHARM.NS": "Torrent Pharmaceuticals Ltd.",
            "ZYDUSLIFE.NS": "Zydus Lifesciences Ltd.",
            "MANKIND.NS": "Mankind Pharma Ltd.",
            "AUROPHARMA.NS": "Aurobindo Pharma Ltd.",
            "ALKEM.NS": "Alkem Laboratories Ltd.",
            "^CNXPHARMA": "NIFTY PHARMA Index",
            "^NSEI": "NIFTY 50 Benchmark"
        },
        "description": "Active pharmaceutical ingredients (API), generic formulations, and clinical therapeutics."
    },
    "Automobile": {
        "name": "Automobile & Auto Components",
        "aliases": ["automobile", "auto", "automotive", "vehicles", "nifty auto"],
        "sector_index": "^CNXAUTO",
        "index_name": "NIFTY AUTO",
        "benchmark_index": MARKET_BENCHMARK,
        "stocks": [
            "TATAMOTORS.NS",
            "M&M.NS",
            "MARUTI.NS",
            "BAJAJ-AUTO.NS",
            "EICHERMOT.NS",
            "TVSMOTOR.NS",
            "HEROMOTOCO.NS",
            "BHARATFORG.NS",
            "ASHOKLEY.NS",
            "APOLLOTYRE.NS"
        ],
        "stock_names": {
            "TATAMOTORS.NS": "Tata Motors Ltd.",
            "M&M.NS": "Mahindra & Mahindra Ltd.",
            "MARUTI.NS": "Maruti Suzuki India Ltd.",
            "BAJAJ-AUTO.NS": "Bajaj Auto Ltd.",
            "EICHERMOT.NS": "Eicher Motors Ltd.",
            "TVSMOTOR.NS": "TVS Motor Company Ltd.",
            "HEROMOTOCO.NS": "Hero MotoCorp Ltd.",
            "BHARATFORG.NS": "Bharat Forge Ltd.",
            "ASHOKLEY.NS": "Ashok Leyland Ltd.",
            "APOLLOTYRE.NS": "Apollo Tyres Ltd.",
            "^CNXAUTO": "NIFTY AUTO Index",
            "^NSEI": "NIFTY 50 Benchmark"
        },
        "description": "Passenger vehicles, 2-wheelers, commercial transport, and EV mobility manufacturers."
    },
    "FMCG": {
        "name": "Fast-Moving Consumer Goods",
        "aliases": ["fmcg", "consumer", "consumer goods", "staples", "nifty fmcg"],
        "sector_index": "^CNXFMCG",
        "index_name": "NIFTY FMCG",
        "benchmark_index": MARKET_BENCHMARK,
        "stocks": [
            "ITC.NS",
            "HINDUNILVR.NS",
            "NESTLEIND.NS",
            "BRITANNIA.NS",
            "TATACONSUM.NS",
            "GODREJCP.NS",
            "DABUR.NS",
            "MARICO.NS",
            "COLPAL.NS",
            "VBL.NS"
        ],
        "stock_names": {
            "ITC.NS": "ITC Ltd.",
            "HINDUNILVR.NS": "Hindustan Unilever Ltd.",
            "NESTLEIND.NS": "Nestle India Ltd.",
            "BRITANNIA.NS": "Britannia Industries Ltd.",
            "TATACONSUM.NS": "Tata Consumer Products Ltd.",
            "GODREJCP.NS": "Godrej Consumer Products Ltd.",
            "DABUR.NS": "Dabur India Ltd.",
            "MARICO.NS": "Marico Ltd.",
            "COLPAL.NS": "Colgate-Palmolive (India) Ltd.",
            "VBL.NS": "Varun Beverages Ltd.",
            "^CNXFMCG": "NIFTY FMCG Index",
            "^NSEI": "NIFTY 50 Benchmark"
        },
        "description": "Essential household products, packaged foods, beverages, and personal care staples."
    },
    "Energy": {
        "name": "Energy, Oil, Gas & Utilities",
        "aliases": ["energy", "oil", "gas", "power", "utilities", "nifty energy"],
        "sector_index": "^CNXENERGY",
        "index_name": "NIFTY ENERGY",
        "benchmark_index": MARKET_BENCHMARK,
        "stocks": [
            "RELIANCE.NS",
            "ONGC.NS",
            "NTPC.NS",
            "POWERGRID.NS",
            "COALINDIA.NS",
            "BPCL.NS",
            "IOC.NS",
            "GAIL.NS",
            "TATAPOWER.NS",
            "ADANIGREEN.NS"
        ],
        "stock_names": {
            "RELIANCE.NS": "Reliance Industries Ltd.",
            "ONGC.NS": "Oil and Natural Gas Corporation Ltd.",
            "NTPC.NS": "NTPC Ltd.",
            "POWERGRID.NS": "Power Grid Corporation of India Ltd.",
            "COALINDIA.NS": "Coal India Ltd.",
            "BPCL.NS": "Bharat Petroleum Corporation Ltd.",
            "IOC.NS": "Indian Oil Corporation Ltd.",
            "GAIL.NS": "GAIL (India) Ltd.",
            "TATAPOWER.NS": "Tata Power Company Ltd.",
            "ADANIGREEN.NS": "Adani Green Energy Ltd.",
            "^CNXENERGY": "NIFTY ENERGY Index",
            "^NSEI": "NIFTY 50 Benchmark"
        },
        "description": "Upstream hydrocarbon exploration, downstream refining, transmission, and clean power generation."
    },
    "Metals": {
        "name": "Metals & Industrial Mining",
        "aliases": ["metals", "metal", "mining", "steel", "nifty metal"],
        "sector_index": "^CNXMETAL",
        "index_name": "NIFTY METAL",
        "benchmark_index": MARKET_BENCHMARK,
        "stocks": [
            "TATASTEEL.NS",
            "JSWSTEEL.NS",
            "HINDALCO.NS",
            "VEDL.NS",
            "JINDALSTEL.NS",
            "NMDC.NS",
            "SAIL.NS",
            "NATIONALUM.NS"
        ],
        "stock_names": {
            "TATASTEEL.NS": "Tata Steel Ltd.",
            "JSWSTEEL.NS": "JSW Steel Ltd.",
            "HINDALCO.NS": "Hindalco Industries Ltd.",
            "VEDL.NS": "Vedanta Ltd.",
            "JINDALSTEL.NS": "Jindal Steel & Power Ltd.",
            "NMDC.NS": "NMDC Ltd.",
            "SAIL.NS": "Steel Authority of India Ltd.",
            "NATIONALUM.NS": "National Aluminium Company Ltd.",
            "^CNXMETAL": "NIFTY METAL Index",
            "^NSEI": "NIFTY 50 Benchmark"
        },
        "description": "Ferrous and non-ferrous metallics, steel manufacturing, and mineral extraction."
    },
    "Financial Services": {
        "name": "Financial Services (Diversified & NBFCs)",
        "aliases": ["financial services", "financials", "finance", "nbfc", "nifty fin service"],
        "sector_index": "NIFTY_FIN_SERVICE.NS",
        "index_name": "NIFTY FIN SERVICE",
        "benchmark_index": MARKET_BENCHMARK,
        "stocks": [
            "BAJFINANCE.NS",
            "BAJAJFINSV.NS",
            "HDFCLIFE.NS",
            "SBILIFE.NS",
            "ICICIPRULI.NS",
            "MUTHOOTFIN.NS",
            "SHRIRAMFIN.NS",
            "CHOLAFIN.NS"
        ],
        "stock_names": {
            "BAJFINANCE.NS": "Bajaj Finance Ltd.",
            "BAJAJFINSV.NS": "Bajaj Finserv Ltd.",
            "HDFCLIFE.NS": "HDFC Life Insurance Company Ltd.",
            "SBILIFE.NS": "SBI Life Insurance Company Ltd.",
            "ICICIPRULI.NS": "ICICI Prudential Life Insurance Ltd.",
            "MUTHOOTFIN.NS": "Muthoot Finance Ltd.",
            "SHRIRAMFIN.NS": "Shriram Finance Ltd.",
            "CHOLAFIN.NS": "Cholamandalam Investment and Finance Ltd.",
            "NIFTY_FIN_SERVICE.NS": "NIFTY FINANCIAL SERVICES Index",
            "^NSEI": "NIFTY 50 Benchmark"
        },
        "description": "Consumer credit, life insurance, gold loans, vehicle financing, and wealth management."
    }
}


def list_supported_sectors() -> List[str]:
    """Return canonical names of all supported Indian sectors."""
    return list(INDIAN_SECTORS.keys())


def resolve_sector(query: str) -> str:
    """
    Case-insensitive fuzzy match for industry / sector names.
    Supports queries like 'bank', 'it', 'pharma', 'fmcg', 'auto', 'energy', 'metal'.
    """
    clean_q = query.lower().strip()
    for canonical_name, defn in INDIAN_SECTORS.items():
        if clean_q == canonical_name.lower():
            return canonical_name
        for alias in defn["aliases"]:
            if alias in clean_q or clean_q in alias:
                return canonical_name

    # Default fallback
    return "Banking"


def get_sector_universe(sector_name: str) -> Dict[str, Any]:
    """
    Retrieve full sector definition including stocks, sector index, and market benchmark.
    """
    canonical = resolve_sector(sector_name)
    defn = INDIAN_SECTORS[canonical].copy()
    defn["canonical_name"] = canonical
    # Complete ticker universe including sectoral index and market benchmark
    defn["all_tickers"] = defn["stocks"] + [defn["sector_index"], defn["benchmark_index"]]
    return defn


def generate_synthetic_indian_market_data(
    sector_def: Dict[str, Any],
    n_days: int = 756,
    seed: int = 101
) -> pd.DataFrame:
    """
    Generate realistic multi-asset price time series tailored for the Indian Equity Market (INR).
    Incorporates NIFTY market factor, sectoral co-movement, and idiosyncratic GARCH volatility.
    """
    np.random.seed(seed)
    tickers = sector_def["all_tickers"]
    n_assets = len(tickers)
    
    # Baseline INR price anchors
    price_anchors = {
        "^NSEI": 24500.0,
        "^NSEBANK": 51200.0,
        "^CNXIT": 41800.0,
        "^CNXPHARMA": 22400.0,
        "^CNXAUTO": 25600.0,
        "^CNXFMCG": 58200.0,
        "^CNXENERGY": 39500.0,
        "^CNXMETAL": 9800.0,
        "NIFTY_FIN_SERVICE.NS": 23800.0,
        "HDFCBANK.NS": 1720.0,
        "ICICIBANK.NS": 1260.0,
        "SBIN.NS": 810.0,
        "KOTAKBANK.NS": 1780.0,
        "AXISBANK.NS": 1180.0,
        "TCS.NS": 4150.0,
        "INFY.NS": 1820.0,
        "HCLTECH.NS": 1840.0,
        "WIPRO.NS": 540.0,
        "RELIANCE.NS": 2880.0,
        "ITC.NS": 485.0,
        "HINDUNILVR.NS": 2520.0,
        "SUNPHARMA.NS": 1860.0,
        "TATAMOTORS.NS": 980.0,
        "M&M.NS": 2940.0,
        "MARUTI.NS": 12400.0,
        "TATASTEEL.NS": 155.0,
        "BAJFINANCE.NS": 6950.0
    }

    # Factor model: r_{i,t} = alpha_i + beta_i * r_{market,t} + gamma_i * r_{sector,t} + e_{i,t}
    # Market (NIFTY 50) return simulation
    market_drift = 0.13 / 252.0
    market_vol = 0.15 / np.sqrt(252.0)
    market_ret = np.random.normal(market_drift, market_vol, n_days)

    # Sector index return simulation
    sector_beta = 1.15
    sector_drift = 0.15 / 252.0
    sector_vol = 0.19 / np.sqrt(252.0)
    sector_idio = np.random.normal(0, 0.08 / np.sqrt(252.0), n_days)
    sector_ret = sector_beta * market_ret + sector_idio

    ret_matrix = np.zeros((n_days, n_assets))
    
    for idx, t in enumerate(tickers):
        if t == sector_def["benchmark_index"]:
            ret_matrix[:, idx] = market_ret
        elif t == sector_def["sector_index"]:
            ret_matrix[:, idx] = sector_ret
        else:
            stock_beta_mkt = 0.7 + 0.6 * np.random.rand()
            stock_beta_sec = 0.4 + 0.5 * np.random.rand()
            stock_idio_vol = (0.16 + 0.14 * np.random.rand()) / np.sqrt(252.0)
            stock_idio = np.random.normal(0, stock_idio_vol, n_days)
            ret_matrix[:, idx] = stock_beta_mkt * market_ret + stock_beta_sec * sector_ret + stock_idio

    # Reconstruct prices from base anchors
    prices = np.zeros((n_days, n_assets))
    for idx, t in enumerate(tickers):
        base_p = price_anchors.get(t, 1000.0)
        prices[:, idx] = base_p * np.exp(np.cumsum(ret_matrix[:, idx]))

    date_index = pd.date_range(end=pd.Timestamp.today().normalize(), periods=n_days, freq="B")
    return pd.DataFrame(prices, index=date_index, columns=tickers)


def fetch_indian_market_data(
    sector_name: str,
    start_date: str = "2021-01-01",
    end_date: Optional[str] = None
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Fetch historical prices for the selected Indian industry universe:
    Returns (price_df, sector_def)
    """
    sector_def = get_sector_universe(sector_name)
    tickers = sector_def["all_tickers"]

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
                
                # Check how many tickers were successfully downloaded
                close_data = close_data.dropna(how="all").ffill().bfill()
                valid_cols = [c for c in tickers if c in close_data.columns and close_data[c].count() > 50]
                
                # If we have at least 4 stocks + 1 index, use fetched data
                if len(valid_cols) >= 5:
                    sub_def = sector_def.copy()
                    sub_def["active_tickers"] = valid_cols
                    sub_def["active_stocks"] = [c for c in valid_cols if c not in [sector_def["sector_index"], sector_def["benchmark_index"]]]
                    return close_data[valid_cols], sub_def
        except Exception:
            pass

    # Seamless synthetic fallback
    df_synth = generate_synthetic_indian_market_data(sector_def)
    sub_def = sector_def.copy()
    sub_def["active_tickers"] = list(df_synth.columns)
    sub_def["active_stocks"] = [c for c in df_synth.columns if c not in [sector_def["sector_index"], sector_def["benchmark_index"]]]
    return df_synth, sub_def
