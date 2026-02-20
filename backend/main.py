"""
EPS Momentum Dashboard — FastAPI Backend

Reads from the EPS Momentum SQLite database and serves screening,
portfolio, market, and analytics data via REST endpoints.
"""

import io
import json
import os
import sqlite3
import time
import urllib.request
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DB_PATH = os.environ.get(
    "EPS_DB_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "eps-momentum-us", "eps_momentum_data.db"),
)

TICKER_CACHE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "eps-momentum-us", "ticker_info_cache.json",
)

app = FastAPI(title="EPS Momentum Dashboard API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# INDUSTRY_MAP  (copied from eps_momentum_system.py)
# ---------------------------------------------------------------------------

INDUSTRY_MAP = {
    # Technology
    'Semiconductors': '반도체',
    'Semiconductor Equipment & Materials': '반도체장비',
    'Software - Application': '응용SW',
    'Software - Infrastructure': '인프라SW',
    'Information Technology Services': 'IT서비스',
    'Computer Hardware': 'HW',
    'Electronic Components': '전자부품',
    'Scientific & Technical Instruments': '계측기기',
    'Communication Equipment': '통신장비',
    'Consumer Electronics': '가전',
    'Electronics & Computer Distribution': '전자유통',
    'Electronic Gaming & Multimedia': '게임',
    'Solar': '태양광',
    # Internet & Media
    'Internet Content & Information': '인터넷',
    'Internet Retail': '온라인유통',
    'Entertainment': '엔터',
    'Broadcasting': '방송',
    'Publishing': '출판',
    'Advertising Agencies': '광고',
    'Telecom Services': '통신',
    # Financial
    'Banks - Regional': '지역은행',
    'Banks - Diversified': '대형은행',
    'Asset Management': '자산운용',
    'Capital Markets': '자본시장',
    'Credit Services': '신용서비스',
    'Financial Data & Stock Exchanges': '금융데이터',
    'Insurance - Property & Casualty': '손해보험',
    'Insurance - Life': '생명보험',
    'Insurance - Diversified': '종합보험',
    'Insurance - Specialty': '특수보험',
    'Insurance - Reinsurance': '재보험',
    'Insurance Brokers': '보험중개',
    'Financial Conglomerates': '금융지주',
    # Healthcare
    'Medical Devices': '의료기기',
    'Medical Instruments & Supplies': '의료용품',
    'Medical Care Facilities': '의료시설',
    'Medical Distribution': '의약유통',
    'Diagnostics & Research': '진단연구',
    'Drug Manufacturers - General': '대형제약',
    'Drug Manufacturers - Specialty & Generic': '특수제약',
    'Biotechnology': '바이오',
    'Healthcare Plans': '건강보험',
    'Health Information Services': '의료정보',
    # Industrials
    'Aerospace & Defense': '방산',
    'Specialty Industrial Machinery': '산업기계',
    'Farm & Heavy Construction Machinery': '중장비',
    'Engineering & Construction': '건설',
    'Building Products & Equipment': '건축자재',
    'Building Materials': '건자재',
    'Electrical Equipment & Parts': '전기장비',
    'Tools & Accessories': '공구',
    'Industrial Distribution': '산업유통',
    'Specialty Business Services': '비즈니스서비스',
    'Consulting Services': '컨설팅',
    'Security & Protection Services': '보안',
    'Waste Management': '폐기물',
    'Pollution & Treatment Controls': '환경',
    'Conglomerates': '복합기업',
    'Integrated Freight & Logistics': '물류',
    'Railroads': '철도',
    'Trucking': '트럭운송',
    'Airlines': '항공',
    'Marine Shipping': '해운',
    'Rental & Leasing Services': '렌탈리스',
    # Consumer Cyclical
    'Auto Parts': '자동차부품',
    'Auto Manufacturers': '자동차',
    'Auto & Truck Dealerships': '자동차딜러',
    'Restaurants': '외식',
    'Specialty Retail': '전문소매',
    'Discount Stores': '할인점',
    'Home Improvement Retail': '홈인테리어',
    'Apparel Retail': '의류소매',
    'Apparel Manufacturing': '의류제조',
    'Department Stores': '백화점',
    'Footwear & Accessories': '신발잡화',
    'Luxury Goods': '명품',
    'Residential Construction': '주택건설',
    'Furnishings, Fixtures & Appliances': '가구가전',
    'Resorts & Casinos': '리조트카지노',
    'Gambling': '도박',
    'Lodging': '숙박',
    'Travel Services': '여행',
    'Recreational Vehicles': '레저차량',
    'Leisure': '레저',
    'Personal Services': '생활서비스',
    # Consumer Defensive
    'Packaged Foods': '식품',
    'Beverages - Non-Alcoholic': '음료',
    'Beverages - Brewers': '맥주',
    'Beverages - Wineries & Distilleries': '주류',
    'Confectioners': '제과',
    'Household & Personal Products': '생활용품',
    'Tobacco': '담배',
    'Grocery Stores': '식료품점',
    'Food Distribution': '식품유통',
    'Education & Training Services': '교육',
    # Real Estate
    'REIT - Specialty': '리츠특수',
    'REIT - Residential': '리츠주거',
    'REIT - Retail': '리츠소매',
    'REIT - Industrial': '리츠산업',
    'REIT - Healthcare Facilities': '리츠의료',
    'REIT - Office': '리츠오피스',
    'REIT - Hotel & Motel': '리츠호텔',
    'REIT - Mortgage': '리츠모기지',
    'REIT - Diversified': '리츠복합',
    'Real Estate Services': '부동산서비스',
    # Energy
    'Oil & Gas E&P': '석유가스',
    'Oil & Gas Midstream': '석유미드스트림',
    'Oil & Gas Equipment & Services': '석유장비',
    'Oil & Gas Refining & Marketing': '석유정제',
    'Oil & Gas Integrated': '석유종합',
    # Utilities
    'Utilities - Regulated Electric': '전력',
    'Utilities - Regulated Gas': '가스',
    'Utilities - Regulated Water': '수도',
    'Utilities - Diversified': '유틸복합',
    'Utilities - Independent Power Producers': '독립발전',
    'Utilities - Renewable': '신재생',
    # Basic Materials
    'Specialty Chemicals': '특수화학',
    'Chemicals': '화학',
    'Agricultural Inputs': '농업',
    'Steel': '철강',
    'Aluminum': '알루미늄',
    'Copper': '구리',
    'Gold': '금',
    'Other Precious Metals & Mining': '귀금속',
    'Other Industrial Metals & Mining': '산업금속',
    'Lumber & Wood Production': '목재',
    'Metal Fabrication': '금속가공',
    'Packaging & Containers': '포장재',
    'Farm Products': '농산물',
    # Other
    'N/A': '기타',
}

# Reverse map: Korean industry name -> English industry name
INDUSTRY_KR_TO_EN = {v: k for k, v in INDUSTRY_MAP.items()}

# ---------------------------------------------------------------------------
# Load ticker_info_cache.json at startup
# ---------------------------------------------------------------------------

TICKER_CACHE: dict[str, dict] = {}

def _load_ticker_cache():
    global TICKER_CACHE
    try:
        with open(TICKER_CACHE_PATH, 'r', encoding='utf-8') as f:
            TICKER_CACHE = json.load(f)
    except Exception:
        TICKER_CACHE = {}

_load_ticker_cache()


def _get_ticker_info(ticker: str) -> dict:
    """Return {shortName, industry_kr, industry_en} for a ticker."""
    info = TICKER_CACHE.get(ticker, {})
    industry_kr = info.get("industry", "기타")
    industry_en = INDUSTRY_KR_TO_EN.get(industry_kr, "N/A")
    return {
        "short_name": info.get("shortName", ticker),
        "industry_kr": industry_kr,
        "industry_en": industry_en,
    }


# ---------------------------------------------------------------------------
# Simple in-memory cache with TTL
# ---------------------------------------------------------------------------

_cache: dict[str, dict] = {}


def cached(key: str, ttl_seconds: int, fn):
    """Return cached result or call fn() and cache it."""
    if key in _cache and time.time() - _cache[key]["ts"] < ttl_seconds:
        return _cache[key]["data"]
    data = fn()
    _cache[key] = {"data": data, "ts": time.time()}
    return data


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------


@contextmanager
def get_db():
    """Yield a sqlite3 connection with row_factory set."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def rows_to_dicts(rows):
    """Convert sqlite3.Row objects to plain dicts."""
    return [dict(r) for r in rows]


def _get_columns(conn, table: str) -> set[str]:
    """Return the set of column names for a table."""
    cur = conn.execute(f"PRAGMA table_info({table})")
    return {r["name"] for r in cur.fetchall()}


# ---------------------------------------------------------------------------
# Business-logic helpers
# ---------------------------------------------------------------------------


def calc_segments(ntm_current, ntm_7d, ntm_30d, ntm_60d, ntm_90d):
    """4 independent segment change rates, capped +/-100%."""
    def pct(new, old):
        if old is None or old == 0:
            return 0.0
        return max(-100.0, min(100.0, ((new - old) / abs(old)) * 100))

    seg1 = pct(ntm_current, ntm_7d)    # 7d -> today
    seg2 = pct(ntm_7d, ntm_30d)        # 30d -> 7d
    seg3 = pct(ntm_30d, ntm_60d)       # 60d -> 30d
    seg4 = pct(ntm_60d, ntm_90d)       # 90d -> 60d
    return seg1, seg2, seg3, seg4


def trend_icon(pct_val: float) -> str:
    if pct_val > 20:
        return "\U0001f525"     # fire
    elif pct_val >= 5:
        return "\u2600\ufe0f"   # sun
    elif pct_val >= 1:
        return "\U0001f324\ufe0f"  # sun behind cloud
    elif pct_val >= -1:
        return "\u2601\ufe0f"   # cloud
    else:
        return "\U0001f327\ufe0f"  # rain


def _get_last_n_part2_dates(conn, n: int = 3) -> list[str]:
    """Return the last *n* distinct dates that have part2_rank data, newest first."""
    cur = conn.execute(
        "SELECT DISTINCT date FROM ntm_screening "
        "WHERE part2_rank IS NOT NULL "
        "ORDER BY date DESC LIMIT ?",
        (n,),
    )
    return [r["date"] for r in cur.fetchall()]


def _compute_3day_status(ticker: str, dates: list[str], ticker_dates_map: dict) -> str:
    """
    dates: last 3 dates, newest first.
    ticker_dates_map: {ticker: set_of_dates_where_it_had_part2_rank}
    """
    present = ticker_dates_map.get(ticker, set())
    if len(dates) >= 3 and all(d in present for d in dates[:3]):
        return "\u2705"  # verified
    if len(dates) >= 2 and all(d in present for d in dates[:2]):
        return "\u23f3"  # pending
    return "\U0001f195"  # new


def _build_ticker_dates_map(conn, dates: list[str]) -> dict:
    """Build {ticker: set(dates)} for the given dates where part2_rank IS NOT NULL."""
    if not dates:
        return {}
    placeholders = ",".join("?" for _ in dates)
    cur = conn.execute(
        f"SELECT ticker, date FROM ntm_screening "
        f"WHERE part2_rank IS NOT NULL AND date IN ({placeholders})",
        dates,
    )
    result: dict[str, set] = {}
    for r in cur.fetchall():
        result.setdefault(r["ticker"], set()).add(r["date"])
    return result


def _build_rank_history(ticker: str, dates: list[str], conn) -> str:
    """Return e.g. '3->4->1' for last 3 dates (oldest->newest)."""
    if not dates:
        return ""
    # dates are newest-first; reverse to oldest-first for display
    ordered = list(reversed(dates))
    placeholders = ",".join("?" for _ in ordered)
    cur = conn.execute(
        f"SELECT date, part2_rank FROM ntm_screening "
        f"WHERE ticker = ? AND part2_rank IS NOT NULL AND date IN ({placeholders})",
        [ticker] + ordered,
    )
    rank_by_date = {r["date"]: r["part2_rank"] for r in cur.fetchall()}
    parts = []
    for d in ordered:
        r = rank_by_date.get(d)
        parts.append(str(r) if r is not None else "-")
    return "\u2192".join(parts)  # arrow


def _compute_risk_flags(row: dict) -> list[dict]:
    """Compute risk flags for a screening row."""
    flags = []
    rev_up = row.get("rev_up30") or 0
    rev_down = row.get("rev_down30") or 0
    total_rev = rev_up + rev_down
    if total_rev > 0 and rev_down / total_rev > 0.3:
        flags.append({
            "type": "revenue_downgrade",
            "label": "하향",
            "detail": f"하향 {rev_down}/{total_rev} ({rev_down/total_rev*100:.0f}%)",
        })
    num_analysts = row.get("num_analysts") or 0
    if num_analysts < 3:
        flags.append({
            "type": "low_coverage",
            "label": "저커버리지",
            "detail": f"애널리스트 {num_analysts}명",
        })
    # fwd_pe > 100 check (use computed fwd_pe)
    ntm_current = row.get("ntm_current") or 0
    price = row.get("price") or 0
    if ntm_current > 0:
        fwd_pe = price / ntm_current
        if fwd_pe > 100:
            flags.append({
                "type": "high_pe",
                "label": "고평가",
                "detail": f"Fwd P/E {fwd_pe:.1f}x",
            })
    return flags


# ---------------------------------------------------------------------------
# Market data fetching (ported from daily_runner.py)
# ---------------------------------------------------------------------------


def _fetch_hy_quadrant() -> Optional[dict]:
    """HY Spread Verdad 4-quadrant + thaw signals (FRED BAMLH0A0HYM2).

    Ported from daily_runner.py fetch_hy_quadrant().
    Level: HY vs 10-year rolling median (wide/narrow)
    Direction: current vs 63 biz days (3 months) ago (rising/falling)
    Q1 recovery(wide+falling), Q2 growth(narrow+falling),
    Q3 overheating(narrow+rising), Q4 recession(wide+rising)
    """
    import pandas as pd
    import numpy as np

    for attempt in range(3):
        try:
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=365 * 11)).strftime("%Y-%m-%d")
            url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A0HYM2&cosd={start_date}&coed={end_date}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as response:
                csv_data = response.read().decode("utf-8")

            df = pd.read_csv(io.StringIO(csv_data), parse_dates=["observation_date"])
            df.columns = ["date", "hy_spread"]
            df = df.dropna(subset=["hy_spread"])
            df["hy_spread"] = pd.to_numeric(df["hy_spread"], errors="coerce")
            df = df.dropna().set_index("date").sort_index()

            if len(df) < 1260:
                return None

            # 10-year rolling median (min 5 years)
            df["median_10y"] = df["hy_spread"].rolling(2520, min_periods=1260).median()

            hy_spread = float(df["hy_spread"].iloc[-1])
            hy_prev = float(df["hy_spread"].iloc[-2])
            median_10y = float(df["median_10y"].iloc[-1])

            if pd.isna(median_10y):
                return None

            # 3 months (63 biz days) ago
            hy_3m_ago = float(df["hy_spread"].iloc[-63]) if len(df) >= 63 else float(df["hy_spread"].iloc[0])

            # Quadrant determination
            is_wide = hy_spread >= median_10y
            is_rising = hy_spread >= hy_3m_ago

            if is_wide and not is_rising:
                quadrant, label, icon = "Q1", "봄(회복국면)", "spring"
            elif not is_wide and not is_rising:
                quadrant, label, icon = "Q2", "여름(성장국면)", "summer"
            elif not is_wide and is_rising:
                quadrant, label, icon = "Q3", "가을(과열국면)", "autumn"
            else:  # wide and rising
                quadrant, label, icon = "Q4", "겨울(침체국면)", "winter"

            # Thaw signals
            signals = []
            daily_change_bp = (hy_spread - hy_prev) * 100

            # 1) HY 4~5% with -20bp sharp contraction
            if 4 <= hy_spread <= 5 and daily_change_bp <= -20:
                signals.append(f"HY {hy_spread:.2f}%, 전일 대비 {daily_change_bp:+.0f}bp 급락 — 반등 매수 기회에요!")

            # 2) Crossing below 5%
            if hy_prev >= 5 and hy_spread < 5:
                signals.append(f"HY {hy_spread:.2f}%로 5% 밑으로 내려왔어요 — 적극 매수 구간이에요!")

            # 3) 60-day peak -300bp or more decline
            peak_60d = float(df["hy_spread"].rolling(60).max().iloc[-1])
            from_peak_bp = (hy_spread - peak_60d) * 100
            if from_peak_bp <= -300:
                signals.append(f"60일 고점 대비 {from_peak_bp:.0f}bp 하락 — 바닥 신호, 적극 매수하세요!")

            # 4) Q4->Q1 transition
            prev_wide = hy_prev >= median_10y
            hy_3m_ago_prev = float(df["hy_spread"].iloc[-64]) if len(df) >= 64 else float(df["hy_spread"].iloc[0])
            prev_rising = hy_prev >= hy_3m_ago_prev
            prev_was_q4 = prev_wide and prev_rising
            now_is_q1 = is_wide and not is_rising
            if prev_was_q4 and now_is_q1:
                signals.append("겨울 -> 봄 전환 — 가장 좋은 매수 타이밍이에요!")

            # Days in current quadrant (up to 252 biz days)
            df["hy_3m"] = df["hy_spread"].shift(63)
            valid_mask = df["median_10y"].notna() & df["hy_3m"].notna()
            df.loc[valid_mask, "q"] = np.where(
                df.loc[valid_mask, "hy_spread"] >= df.loc[valid_mask, "median_10y"],
                np.where(df.loc[valid_mask, "hy_spread"] >= df.loc[valid_mask, "hy_3m"], "Q4", "Q1"),
                np.where(df.loc[valid_mask, "hy_spread"] >= df.loc[valid_mask, "hy_3m"], "Q3", "Q2"),
            )
            q_days = 1
            for i in range(len(df) - 2, max(len(df) - 253, 0) - 1, -1):
                if i >= 0 and df["q"].iloc[i] == quadrant:
                    q_days += 1
                else:
                    break

            # HY standalone action (fallback; final decision in concordance)
            if quadrant == "Q1":
                action = "적극 매수하세요."
            elif quadrant == "Q2":
                action = "평소대로 투자하세요."
            elif quadrant == "Q3":
                action = "신규 매수 시 신중하세요."
            else:  # Q4
                action = "신규 매수를 멈추고 관망하세요."

            # Direction for concordance
            direction = "warn" if quadrant in ("Q3", "Q4") else "stable"

            return {
                "hy_spread": round(hy_spread, 2),
                "median_10y": round(median_10y, 2),
                "hy_3m_ago": round(hy_3m_ago, 2),
                "hy_prev": round(hy_prev, 2),
                "quadrant": quadrant,
                "quadrant_label": label,
                "season_icon": icon,
                "signals": signals,
                "q_days": q_days,
                "action": action,
                "direction": direction,
            }

        except Exception:
            if attempt < 2:
                time.sleep(5)
            else:
                return None


def _fetch_vix_data() -> Optional[dict]:
    """VIX regime determination (FRED VIXCLS).

    Ported from daily_runner.py fetch_vix_data().
    252-day (1-year) percentile-based regime determination.
    <10th: complacency | 10~67th: normal | 67~80th: elevated |
    80~90th: high | 90th+: crisis
    """
    import pandas as pd

    for attempt in range(3):
        try:
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=400)).strftime("%Y-%m-%d")
            url = (
                f"https://fred.stlouisfed.org/graph/fredgraph.csv"
                f"?id=VIXCLS&cosd={start_date}&coed={end_date}"
            )
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as response:
                csv_data = response.read().decode("utf-8")

            df = pd.read_csv(io.StringIO(csv_data), parse_dates=["observation_date"])
            df.columns = ["date", "vix"]
            df["vix"] = pd.to_numeric(df["vix"], errors="coerce")
            df = df.dropna().set_index("date").sort_index()

            if len(df) < 20:
                return None

            vix_current = float(df["vix"].iloc[-1])
            vix_5d_ago = float(df["vix"].iloc[-5]) if len(df) >= 5 else float(df["vix"].iloc[0])
            vix_slope = vix_current - vix_5d_ago
            vix_ma_20 = float(df["vix"].rolling(20).mean().iloc[-1])

            # 252-day (1-year) percentile (min 126 days)
            vix_pct = float(df["vix"].rolling(252, min_periods=126).rank(pct=True).iloc[-1] * 100)

            # Slope direction (+/- 0.5 threshold)
            if vix_slope > 0.5:
                slope_dir = "rising"
            elif vix_slope < -0.5:
                slope_dir = "falling"
            else:
                slope_dir = "flat"

            # Percentile-based regime + cash adjustment
            if vix_pct >= 90:
                if slope_dir in ("rising", "flat"):
                    regime, label, icon = "crisis", "위기", "crisis"
                    cash_adj = 15
                else:
                    regime, label, icon = "crisis_relief", "공포완화", "crisis_relief"
                    cash_adj = -10
            elif vix_pct >= 80:
                if slope_dir == "rising":
                    regime, label, icon = "high", "상승경보", "high"
                    cash_adj = 10
                else:
                    regime, label, icon = "high_stable", "높지만안정", "high_stable"
                    cash_adj = 0
            elif vix_pct >= 67:
                if slope_dir == "rising":
                    regime, label, icon = "elevated", "경계", "elevated"
                    cash_adj = 5
                elif slope_dir == "falling":
                    regime, label, icon = "stabilizing", "안정화", "stabilizing"
                    cash_adj = -5
                else:
                    regime, label, icon = "elevated_flat", "보통", "elevated_flat"
                    cash_adj = 0
            elif vix_pct < 10:
                regime, label, icon = "complacency", "안일", "complacency"
                cash_adj = 5
            else:
                regime, label, icon = "normal", "안정", "normal"
                cash_adj = 0

            # Direction for concordance
            direction = "warn" if regime in ("crisis", "crisis_relief", "high", "elevated", "complacency") else "stable"

            return {
                "vix_current": round(vix_current, 2),
                "vix_5d_ago": round(vix_5d_ago, 2),
                "vix_slope": round(vix_slope, 2),
                "vix_slope_dir": slope_dir,
                "vix_ma_20": round(vix_ma_20, 2),
                "vix_percentile": round(vix_pct, 1),
                "regime": regime,
                "regime_label": label,
                "regime_icon": icon,
                "cash_adjustment": cash_adj,
                "direction": direction,
            }

        except Exception:
            if attempt < 2:
                time.sleep(5)
            else:
                return None


def _fetch_market_indices() -> list[dict]:
    """Fetch major US market indices via yfinance.

    Ported from daily_runner.py get_market_context().
    """
    try:
        import yfinance as yf
    except ImportError:
        return []

    indices = []
    for symbol, name in [("^GSPC", "S&P 500"), ("^IXIC", "NASDAQ"), ("^DJI", "Dow Jones")]:
        try:
            hist = yf.Ticker(symbol).history(period="5d")
            if len(hist) >= 2:
                close = float(hist["Close"].iloc[-1])
                prev = float(hist["Close"].iloc[-2])
                chg = (close / prev - 1) * 100
                indices.append({
                    "name": name,
                    "symbol": symbol,
                    "close": round(close, 2),
                    "change_pct": round(chg, 2),
                })
        except Exception:
            continue
    return indices


def _compute_concordance_and_action(hy: Optional[dict], vix: Optional[dict]) -> dict:
    """Compute concordance + final_action from HY quadrant + VIX regime.

    Ported from daily_runner.py get_market_risk_status().
    14-case mapping based on Q x VIX x q_days (30-year EDA).
    """
    hy_dir = "warn" if hy and hy["quadrant"] in ("Q3", "Q4") else "stable"
    vix_dir = vix["direction"] if vix else "stable"

    if hy_dir == "warn" and vix_dir == "warn":
        concordance = "both_warn"
    elif hy_dir == "warn" and vix_dir == "stable":
        concordance = "hy_only"
    elif hy_dir == "stable" and vix_dir == "warn":
        concordance = "vix_only"
    else:
        concordance = "both_stable"

    # Signal dots for UI
    hy_ok = hy_dir == "stable"
    vix_ok = vix_dir == "stable"

    # Final action (14-case: season x indicator x q_days combination, 30-year EDA)
    if hy:
        q = hy["quadrant"]
        q_days = hy.get("q_days", 1)
        vix_is_ok = vix_dir == "stable"

        if q == "Q1":
            # Spring (recovery) — annualized +14.3%, positive probability 86%
            if vix_is_ok:
                final_action = "모든 지표가 매수를 가리켜요. 적극 투자하세요!"
            else:
                final_action = "회복 구간이에요. VIX가 높지만 오히려 반등 기회일 수 있어요. 적극 투자하세요!"
        elif q == "Q2":
            # Summer (growth) — annualized +9.4%, positive probability 84%
            if vix_is_ok:
                final_action = "모든 지표가 안정적이에요. 평소대로 투자하세요."
            else:
                final_action = "신용시장은 안정적이지만 VIX가 높아요. 신규 매수 시 신중하세요."
        elif q == "Q3":
            # Autumn (overheating) — 2-stage at 60 days (EDA: <60d +1.84%, >=60d +0.39%)
            if q_days < 60:
                if vix_is_ok:
                    final_action = "과열 초기 신호에요. 신규 매수 시 신중하세요."
                else:
                    final_action = "과열 초기 + 변동성 확대에요. 신규 매수를 멈추세요."
            else:
                if vix_is_ok:
                    final_action = "과열이 지속되고 있어요. 신규 매수를 줄여가세요."
                else:
                    final_action = "과열 장기화 + 변동성 확대에요. 보유 종목을 점검하고 신규 매수를 멈추세요."
        else:
            # Winter (Q4) — 3-stage at 20d/60d (EDA: <=20d weak, 21~60d turnaround, >60d bottom-approaching=Q1 level)
            if q_days <= 20:
                if vix_is_ok:
                    final_action = "신용시장이 악화되기 시작했어요. 급매도는 금물, 관망하세요."
                else:
                    final_action = "시장이 흔들리고 있지만 초기 반등 가능성이 있어요. 급매도는 금물, 지켜보세요."
            elif q_days <= 60:
                if vix_is_ok:
                    final_action = "침체가 지속 중이지만 변동성은 안정적이에요. 신규 매수를 멈추고 관망하세요."
                else:
                    final_action = "침체 + 변동성 확대에요. 보유 종목을 줄여가세요."
            else:
                if vix_is_ok:
                    final_action = "바닥권에 접근하고 있어요. 분할 매수를 고려하세요."
                else:
                    final_action = "장기 침체이지만 바닥 가능성이 있어요. 관망하며 회복 신호를 기다리세요."
    else:
        # No HY data — VIX only
        if vix and vix_dir == "warn":
            final_action = "변동성이 높아요. 신규 매수에 신중하세요."
        else:
            final_action = "평소대로 투자하세요."

    return {
        "concordance": concordance,
        "signal_dots": {"hy_ok": hy_ok, "vix_ok": vix_ok},
        "final_action": final_action,
    }


def _get_market_live_data() -> dict:
    """Aggregate live market data: indices + HY + VIX + concordance."""
    hy = _fetch_hy_quadrant()
    vix = _fetch_vix_data()
    indices = _fetch_market_indices()
    conc = _compute_concordance_and_action(hy, vix)

    return {
        "indices": indices,
        "hy": hy,
        "vix": vix,
        "concordance": conc["concordance"],
        "signal_dots": conc["signal_dots"],
        "final_action": conc["final_action"],
        "cached_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/health")
def health():
    """Health check."""
    db_exists = os.path.isfile(DB_PATH)
    ticker_cache_loaded = len(TICKER_CACHE) > 0
    return {
        "status": "ok",
        "db_exists": db_exists,
        "db_path": DB_PATH,
        "ticker_cache_count": len(TICKER_CACHE),
        "ticker_cache_loaded": ticker_cache_loaded,
    }


@app.get("/api/dates")
def list_dates():
    """List all available dates (those with part2_rank data), newest first."""
    with get_db() as conn:
        cur = conn.execute(
            "SELECT DISTINCT date FROM ntm_screening "
            "WHERE part2_rank IS NOT NULL "
            "ORDER BY date DESC"
        )
        return [r["date"] for r in cur.fetchall()]


# ---------------------------------------------------------------------------
# Market live endpoint
# ---------------------------------------------------------------------------


@app.get("/api/market/live")
def get_market_live():
    """Live market status — HY Spread, VIX, indices, concordance.

    Cached for 1 hour (3600 seconds).
    """
    return cached("market_live", 3600, _get_market_live_data)


# ---------------------------------------------------------------------------
# Screening endpoint (enhanced)
# ---------------------------------------------------------------------------


@app.get("/api/screening/{date}")
def get_screening(date: str):
    """Top 30 candidates for a specific date, enriched with segments, status,
    ticker info, risk flags, and computed metrics."""
    with get_db() as conn:
        cols = _get_columns(conn, "ntm_screening")
        # Base columns always present
        select_cols = [
            "ticker", "part2_rank", "score", "adj_score", "adj_gap",
            "price", "ma60", "ntm_current", "ntm_7d", "ntm_30d", "ntm_60d", "ntm_90d",
            "rev_up30", "rev_down30", "num_analysts", "is_turnaround",
        ]
        # Optional columns (may not exist in older DBs)
        optional = [
            "composite_rank", "rev_growth", "market_cap", "roe",
            "debt_to_equity", "operating_margin", "free_cashflow", "beta",
        ]
        for c in optional:
            if c in cols:
                select_cols.append(c)
        # Fetch rows for the requested date
        cur = conn.execute(
            f"SELECT {','.join(select_cols)} "
            "FROM ntm_screening WHERE date = ? AND part2_rank IS NOT NULL "
            "ORDER BY part2_rank ASC",
            (date,),
        )
        rows = rows_to_dicts(cur.fetchall())
        if not rows:
            return []

        # 3-day status context
        last3 = _get_last_n_part2_dates(conn, 3)
        td_map = _build_ticker_dates_map(conn, last3)

        for row in rows:
            # Segments
            ntm_current = row.get("ntm_current") or 0
            ntm_7d = row.get("ntm_7d") or 0
            ntm_30d = row.get("ntm_30d") or 0
            ntm_60d = row.get("ntm_60d") or 0
            ntm_90d = row.get("ntm_90d") or 0

            seg1, seg2, seg3, seg4 = calc_segments(
                ntm_current, ntm_7d, ntm_30d, ntm_60d, ntm_90d,
            )
            row["seg1"] = round(seg1, 2)
            row["seg2"] = round(seg2, 2)
            row["seg3"] = round(seg3, 2)
            row["seg4"] = round(seg4, 2)

            # Trend icons (seg4 -> seg1 = past -> present)
            row["trend"] = (
                trend_icon(seg4) + trend_icon(seg3) + trend_icon(seg2) + trend_icon(seg1)
            )

            # 3-day verification status
            row["status_3d"] = _compute_3day_status(row["ticker"], last3, td_map)

            # Rank history
            row["rank_history"] = _build_rank_history(row["ticker"], last3, conn)

            # --- NEW: Ticker info from cache ---
            info = _get_ticker_info(row["ticker"])
            row["short_name"] = info["short_name"]
            row["industry_en"] = info["industry_en"]
            row["industry_kr"] = info["industry_kr"]

            # --- NEW: EPS change 90d ---
            if ntm_90d != 0:
                row["eps_change_90d"] = round(((ntm_current - ntm_90d) / abs(ntm_90d)) * 100, 2)
            else:
                row["eps_change_90d"] = None

            # --- NEW: Forward P/E ---
            price = row.get("price") or 0
            if ntm_current > 0:
                row["fwd_pe"] = round(price / ntm_current, 2)
            else:
                row["fwd_pe"] = None

            # --- NEW: Risk flags ---
            row["risk_flags"] = _compute_risk_flags(row)

        return rows


# ---------------------------------------------------------------------------
# Portfolio endpoints
# ---------------------------------------------------------------------------


@app.get("/api/portfolio/{date}")
def get_portfolio(date: str):
    """Portfolio log entries for a specific date, enriched with ticker info."""
    with get_db() as conn:
        cur = conn.execute(
            "SELECT date, ticker, action, price, weight, "
            "entry_date, entry_price, exit_price, return_pct "
            "FROM portfolio_log WHERE date = ? ORDER BY ticker",
            (date,),
        )
        rows = rows_to_dicts(cur.fetchall())

    for row in rows:
        info = _get_ticker_info(row["ticker"])
        row["short_name"] = info["short_name"]
        row["industry_kr"] = info["industry_kr"]

    return rows


@app.get("/api/portfolio/history")
def get_portfolio_history():
    """Full portfolio history grouped by date."""
    with get_db() as conn:
        cur = conn.execute(
            "SELECT date, ticker, action, price, weight, "
            "entry_date, entry_price, exit_price, return_pct "
            "FROM portfolio_log ORDER BY date DESC, ticker"
        )
        rows = rows_to_dicts(cur.fetchall())

    # Group by date
    grouped: dict[str, list] = {}
    for r in rows:
        info = _get_ticker_info(r["ticker"])
        r["short_name"] = info["short_name"]
        r["industry_kr"] = info["industry_kr"]
        grouped.setdefault(r["date"], []).append(r)
    return grouped


@app.get("/api/portfolio/performance")
def get_portfolio_performance():
    """Aggregate portfolio performance metrics from completed (exit) trades."""
    with get_db() as conn:
        # All exit trades
        cur = conn.execute(
            "SELECT ticker, entry_date, entry_price, exit_price, return_pct, date as exit_date "
            "FROM portfolio_log WHERE action = 'exit' AND return_pct IS NOT NULL "
            "ORDER BY date"
        )
        exits = rows_to_dicts(cur.fetchall())

        # Total portfolio dates (for active days count)
        cur = conn.execute(
            "SELECT COUNT(DISTINCT date) as total_days FROM portfolio_log"
        )
        total_days = cur.fetchone()["total_days"]

    if not exits:
        return {
            "total_trades": 0,
            "wins": 0,
            "losses": 0,
            "win_rate": 0.0,
            "avg_return_pct": 0.0,
            "best_trade": None,
            "worst_trade": None,
            "avg_holding_days": None,
            "total_active_days": total_days,
            "trades": [],
        }

    total_trades = len(exits)
    returns = [e["return_pct"] for e in exits]
    wins = sum(1 for r in returns if r > 0)
    losses = sum(1 for r in returns if r <= 0)
    win_rate = round((wins / total_trades) * 100, 1) if total_trades > 0 else 0.0
    avg_return = round(sum(returns) / total_trades, 2) if total_trades > 0 else 0.0

    best_idx = returns.index(max(returns))
    worst_idx = returns.index(min(returns))

    best_trade = {
        "ticker": exits[best_idx]["ticker"],
        "return_pct": exits[best_idx]["return_pct"],
        "entry_date": exits[best_idx]["entry_date"],
        "exit_date": exits[best_idx]["exit_date"],
    }
    worst_trade = {
        "ticker": exits[worst_idx]["ticker"],
        "return_pct": exits[worst_idx]["return_pct"],
        "entry_date": exits[worst_idx]["entry_date"],
        "exit_date": exits[worst_idx]["exit_date"],
    }

    # Compute average holding days
    holding_days_list = []
    for e in exits:
        if e.get("entry_date") and e.get("exit_date"):
            try:
                entry_dt = datetime.strptime(e["entry_date"], "%Y-%m-%d")
                exit_dt = datetime.strptime(e["exit_date"], "%Y-%m-%d")
                holding_days_list.append((exit_dt - entry_dt).days)
            except (ValueError, TypeError):
                pass
    avg_holding_days = round(sum(holding_days_list) / len(holding_days_list), 1) if holding_days_list else None

    # Simplified trade list for charts
    trades_summary = []
    for e in exits:
        info = _get_ticker_info(e["ticker"])
        trades_summary.append({
            "ticker": e["ticker"],
            "short_name": info["short_name"],
            "return_pct": e["return_pct"],
            "entry_date": e["entry_date"],
            "exit_date": e["exit_date"],
        })

    return {
        "total_trades": total_trades,
        "wins": wins,
        "losses": losses,
        "win_rate": win_rate,
        "avg_return_pct": avg_return,
        "best_trade": best_trade,
        "worst_trade": worst_trade,
        "avg_holding_days": avg_holding_days,
        "total_active_days": total_days,
        "trades": trades_summary,
    }


# ---------------------------------------------------------------------------
# Ticker detail endpoint (enhanced)
# ---------------------------------------------------------------------------


@app.get("/api/ticker/{ticker}")
def get_ticker_history(ticker: str):
    """Historical screening data for a single ticker, enriched with ticker info."""
    ticker_upper = ticker.upper()
    info = _get_ticker_info(ticker_upper)

    with get_db() as conn:
        cols = _get_columns(conn, "ntm_screening")
        select_cols = ["date", "score", "adj_score", "adj_gap", "price", "ma60",
                       "ntm_current", "ntm_7d", "ntm_30d", "ntm_60d", "ntm_90d",
                       "part2_rank", "rev_up30", "rev_down30", "num_analysts"]
        for c in ["composite_rank", "rev_growth"]:
            if c in cols:
                select_cols.append(c)
        cur = conn.execute(
            f"SELECT {','.join(select_cols)} "
            "FROM ntm_screening WHERE ticker = ? ORDER BY date",
            (ticker_upper,),
        )
        rows = rows_to_dicts(cur.fetchall())

    # Compute segments for each row
    for row in rows:
        ntm_current = row.get("ntm_current") or 0
        ntm_7d = row.get("ntm_7d") or 0
        ntm_30d = row.get("ntm_30d") or 0
        ntm_60d = row.get("ntm_60d") or 0
        ntm_90d = row.get("ntm_90d") or 0
        s1, s2, s3, s4 = calc_segments(ntm_current, ntm_7d, ntm_30d, ntm_60d, ntm_90d)
        row["seg1"] = round(s1, 2)
        row["seg2"] = round(s2, 2)
        row["seg3"] = round(s3, 2)
        row["seg4"] = round(s4, 2)

    return {
        "ticker": ticker_upper,
        "short_name": info["short_name"],
        "industry_en": info["industry_en"],
        "industry_kr": info["industry_kr"],
        "history": rows,
    }


# ---------------------------------------------------------------------------
# Stats endpoint (enhanced)
# ---------------------------------------------------------------------------


@app.get("/api/stats/{date}")
def get_stats(date: str):
    """Screening statistics for a date, including industry distribution."""
    with get_db() as conn:
        # Total screened
        total_screened = conn.execute(
            "SELECT COUNT(*) as cnt FROM ntm_screening WHERE date = ?", (date,)
        ).fetchone()["cnt"]

        # Eligible (adj_score > 9)
        total_eligible = conn.execute(
            "SELECT COUNT(*) as cnt FROM ntm_screening WHERE date = ? AND adj_score > 9",
            (date,),
        ).fetchone()["cnt"]

        # Top 30
        top30_count = conn.execute(
            "SELECT COUNT(*) as cnt FROM ntm_screening WHERE date = ? AND part2_rank IS NOT NULL",
            (date,),
        ).fetchone()["cnt"]

        # 3-day status counts
        last3 = _get_last_n_part2_dates(conn, 3)
        td_map = _build_ticker_dates_map(conn, last3)

        # Get tickers in today's Top 30
        cur = conn.execute(
            "SELECT ticker FROM ntm_screening WHERE date = ? AND part2_rank IS NOT NULL",
            (date,),
        )
        today_tickers = [r["ticker"] for r in cur.fetchall()]

        verified_count = 0
        new_count = 0
        for t in today_tickers:
            st = _compute_3day_status(t, last3, td_map)
            if st == "\u2705":
                verified_count += 1
            elif st == "\U0001f195":
                new_count += 1

        # Industry distribution from TICKER_CACHE
        industry_distribution: dict[str, int] = {}
        for t in today_tickers:
            info = _get_ticker_info(t)
            ind_kr = info["industry_kr"]
            industry_distribution[ind_kr] = industry_distribution.get(ind_kr, 0) + 1

        # Sort by count descending
        industry_distribution = dict(
            sorted(industry_distribution.items(), key=lambda x: x[1], reverse=True)
        )

        return {
            "date": date,
            "total_screened": total_screened,
            "total_eligible": total_eligible,
            "top30_count": top30_count,
            "verified_count": verified_count,
            "new_count": new_count,
            "industry_distribution": industry_distribution,
        }


# ---------------------------------------------------------------------------
# Exited (Death List) endpoint (enhanced)
# ---------------------------------------------------------------------------


@app.get("/api/exited/{date}")
def get_exited(date: str):
    """
    Death list: stocks that were in yesterday's Top 30 but dropped out today.
    Enhanced with short_name, industry_kr, and current_rank (if still in DB).
    """
    with get_db() as conn:
        # Find the date immediately before 'date' that has part2_rank data
        cur = conn.execute(
            "SELECT DISTINCT date FROM ntm_screening "
            "WHERE part2_rank IS NOT NULL AND date < ? "
            "ORDER BY date DESC LIMIT 1",
            (date,),
        )
        prev_row = cur.fetchone()
        if prev_row is None:
            return []
        prev_date = prev_row["date"]

        # Yesterday's Top 30
        cur = conn.execute(
            "SELECT ticker, part2_rank FROM ntm_screening "
            "WHERE date = ? AND part2_rank IS NOT NULL",
            (prev_date,),
        )
        yesterday = {r["ticker"]: r["part2_rank"] for r in cur.fetchall()}

        # Today's Top 30
        cur = conn.execute(
            "SELECT ticker FROM ntm_screening "
            "WHERE date = ? AND part2_rank IS NOT NULL",
            (date,),
        )
        today_set = {r["ticker"] for r in cur.fetchall()}

        # Today's composite_rank for all tickers (to show current rank for exited stocks)
        cols = _get_columns(conn, "ntm_screening")
        has_composite = "composite_rank" in cols
        current_ranks = {}
        if has_composite:
            cur = conn.execute(
                "SELECT ticker, composite_rank FROM ntm_screening "
                "WHERE date = ? AND composite_rank IS NOT NULL",
                (date,),
            )
            current_ranks = {r["ticker"]: r["composite_rank"] for r in cur.fetchall()}

        # Rank history context
        last3 = _get_last_n_part2_dates(conn, 3)

        # Exited
        exited = []
        for ticker, rank in sorted(yesterday.items(), key=lambda x: x[1]):
            if ticker not in today_set:
                info = _get_ticker_info(ticker)
                rank_hist = _build_rank_history(ticker, last3, conn)
                exited.append({
                    "ticker": ticker,
                    "short_name": info["short_name"],
                    "industry_kr": info["industry_kr"],
                    "prev_date": prev_date,
                    "prev_rank": rank,
                    "current_rank": current_ranks.get(ticker),
                    "rank_history": rank_hist,
                })

        return exited


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
