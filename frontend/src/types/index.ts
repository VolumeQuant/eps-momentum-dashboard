export interface MarketIndex {
  name: string;
  symbol: string;
  close: number;
  change_pct: number;
}

export interface MarketStatus {
  indices: MarketIndex[];
  hy: {
    hy_spread: number;
    quadrant: string;
    quadrant_label: string;
    season_icon: string;
    q_days: number;
    action: string;
    direction: string;
  } | null;
  vix: {
    vix_current: number;
    vix_percentile: number;
    vix_slope: number;
    vix_slope_dir: string;
    regime: string;
    regime_label: string;
    direction: string;
  } | null;
  concordance: string;
  signal_dots: { hy_ok: boolean; vix_ok: boolean };
  final_action: string;
  portfolio_mode: 'normal' | 'caution' | 'reduced' | 'stop';
  cached_at: string;
}

export interface Candidate {
  ticker: string;
  short_name?: string;
  industry?: string;
  industry_en?: string;
  industry_kr?: string;
  part2_rank: number;
  composite_rank: number;
  score: number;
  adj_score: number;
  adj_gap: number;
  price: number;
  ma60: number;
  ntm_current: number;
  eps_change_90d?: number;
  fwd_pe?: number;
  rev_growth: number | null;
  rev_up30: number;
  rev_down30: number;
  num_analysts: number;
  risk_flags?: string[];
  market_cap: number | null;
  roe: number | null;
  debt_to_equity: number | null;
  operating_margin: number | null;
  free_cashflow: number | null;
  beta: number | null;
  seg1: number;
  seg2: number;
  seg3: number;
  seg4: number;
  trend: string;
  status_3d: string;
  rank_history: string;
  rank_change_tag?: string;
}

export interface PortfolioEntry {
  date: string;
  ticker: string;
  short_name?: string;
  industry_kr?: string;
  action: 'enter' | 'hold' | 'exit';
  price: number;
  weight: number;
  entry_date: string;
  entry_price: number;
  exit_price: number | null;
  return_pct: number | null;
}

export interface TickerHistory {
  date: string;
  score: number;
  adj_score: number;
  adj_gap: number;
  price: number;
  ma60: number;
  ntm_current: number;
  ntm_7d?: number;
  ntm_30d?: number;
  ntm_60d?: number;
  ntm_90d: number;
  part2_rank: number | null;
  composite_rank: number | null;
  rev_growth: number | null;
  rev_up30?: number | null;
  rev_down30?: number | null;
  num_analysts?: number | null;
  seg1?: number;
  seg2?: number;
  seg3?: number;
  seg4?: number;
}

export interface ScreeningStats {
  total_screened: number;
  total_eligible: number;
  top30_count: number;
  verified_count: number;
  new_count: number;
  industry_distribution: Record<string, number>;
}

export interface RiskFlag {
  type: string;
  label: string;
  detail: string;
}

export interface RiskStock {
  ticker: string;
  short_name: string;
  industry_kr: string;
  part2_rank: number;
  flags: RiskFlag[];
}

export interface AIReview {
  date: string;
  risk_stocks: RiskStock[];
  ai_review_text: string | null;
  portfolio_narrative: string | null;
}

export interface ExitedStock {
  ticker: string;
  short_name?: string;
  industry_kr?: string;
  prev_date?: string;
  prev_rank: number;
  current_rank?: number | null;
  rank_history?: string;
  rank_change_tag?: string;
  trend?: string;
  eps_change_90d?: number | null;
  rev_growth?: number | null;
  adj_gap?: number;
  rev_up30?: number;
  rev_down30?: number;
  exit_reason?: string;
}
