export interface Candidate {
  ticker: string;
  part2_rank: number;
  composite_rank: number;
  score: number;
  adj_score: number;
  adj_gap: number;
  price: number;
  ma60: number;
  ntm_current: number;
  rev_growth: number | null;
  rev_up30: number;
  rev_down30: number;
  num_analysts: number;
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
  trend_icons: string;
  status: '\u2705' | '\u23F3' | '\uD83C\uDD95';
  rank_history: string;
  industry?: string;
}

export interface PortfolioEntry {
  date: string;
  ticker: string;
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
  part2_rank: number | null;
  composite_rank: number | null;
  rev_growth: number | null;
}

export interface ScreeningStats {
  total_screened: number;
  total_eligible: number;
  top30_count: number;
  verified_count: number;
  new_count: number;
  industry_distribution: Record<string, number>;
}

export interface ExitedStock {
  ticker: string;
  yesterday_rank: number;
}
