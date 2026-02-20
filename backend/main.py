"""
EPS Momentum Dashboard — FastAPI Backend

Reads from the EPS Momentum SQLite database and serves screening,
portfolio, and analytics data via REST endpoints.
"""

import os
import sqlite3
from contextlib import contextmanager
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

app = FastAPI(title="EPS Momentum Dashboard API", version="0.1.0")

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

# Reverse lookup: ticker -> industry would require yfinance at runtime.
# The DB does NOT store industry, so industry_distribution in /api/stats
# will be unavailable unless we add that column.  For now we return an
# empty dict and note the limitation.

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
        return "\U0001f525"     # 🔥
    elif pct_val >= 5:
        return "\u2600\ufe0f"   # ☀️
    elif pct_val >= 1:
        return "\U0001f324\ufe0f"  # 🌤️
    elif pct_val >= -1:
        return "\u2601\ufe0f"   # ☁️
    else:
        return "\U0001f327\ufe0f"  # 🌧️


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
        return "\u2705"  # ✅
    if len(dates) >= 2 and all(d in present for d in dates[:2]):
        return "\u23f3"  # ⏳
    return "\U0001f195"  # 🆕


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
    return "\u2192".join(parts)  # arrow →


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/health")
def health():
    """Health check."""
    db_exists = os.path.isfile(DB_PATH)
    return {"status": "ok", "db_exists": db_exists, "db_path": DB_PATH}


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


@app.get("/api/screening/{date}")
def get_screening(date: str):
    """Top 30 candidates for a specific date, enriched with segments and status."""
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
            seg1, seg2, seg3, seg4 = calc_segments(
                row.get("ntm_current") or 0,
                row.get("ntm_7d") or 0,
                row.get("ntm_30d") or 0,
                row.get("ntm_60d") or 0,
                row.get("ntm_90d") or 0,
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

        return rows


@app.get("/api/portfolio/{date}")
def get_portfolio(date: str):
    """Portfolio log entries for a specific date."""
    with get_db() as conn:
        cur = conn.execute(
            "SELECT date, ticker, action, price, weight, "
            "entry_date, entry_price, exit_price, return_pct "
            "FROM portfolio_log WHERE date = ? ORDER BY ticker",
            (date,),
        )
        return rows_to_dicts(cur.fetchall())


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
        grouped.setdefault(r["date"], []).append(r)
    return grouped


@app.get("/api/ticker/{ticker}")
def get_ticker_history(ticker: str):
    """Historical screening data for a single ticker."""
    with get_db() as conn:
        cols = _get_columns(conn, "ntm_screening")
        select_cols = ["date", "score", "adj_score", "adj_gap", "price", "ma60",
                       "ntm_current", "part2_rank"]
        for c in ["composite_rank", "rev_growth"]:
            if c in cols:
                select_cols.append(c)
        cur = conn.execute(
            f"SELECT {','.join(select_cols)} "
            "FROM ntm_screening WHERE ticker = ? ORDER BY date",
            (ticker.upper(),),
        )
        return rows_to_dicts(cur.fetchall())


@app.get("/api/stats/{date}")
def get_stats(date: str):
    """Screening statistics for a date."""
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

        # Industry distribution — DB does not store industry column,
        # so this will be empty.  If you add an 'industry' column to
        # ntm_screening in the future, this section can be populated.
        industry_distribution: dict[str, int] = {}

        return {
            "date": date,
            "total_screened": total_screened,
            "total_eligible": total_eligible,
            "top30_count": top30_count,
            "verified_count": verified_count,
            "new_count": new_count,
            "industry_distribution": industry_distribution,
        }


@app.get("/api/exited/{date}")
def get_exited(date: str):
    """
    Death list: stocks that were in yesterday's Top 30 but dropped out today.
    Returns each exited ticker with yesterday's rank.
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

        # Exited
        exited = []
        for ticker, rank in sorted(yesterday.items(), key=lambda x: x[1]):
            if ticker not in today_set:
                exited.append({
                    "ticker": ticker,
                    "prev_date": prev_date,
                    "prev_rank": rank,
                })

        return exited


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
