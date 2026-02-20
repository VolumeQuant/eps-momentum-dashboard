import { Link } from 'react-router-dom'
import type { Candidate } from '../types'
import TrendIcon from './TrendIcon'
import StatusBadge from './StatusBadge'

interface CandidatesTableProps {
  candidates: Candidate[];
  isLoading: boolean;
}

function formatNumber(val: number | null, decimals: number = 1): string {
  if (val === null || val === undefined) return '-'
  return val.toFixed(decimals)
}

function formatPercent(val: number | null): string {
  if (val === null || val === undefined) return '-'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(1)}%`
}

function formatMarketCap(val: number | null): string {
  if (val === null || val === undefined) return '-'
  if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`
  return `$${val.toLocaleString()}`
}

function getGapColor(gap: number): string {
  if (gap <= -10) return 'text-emerald-400'
  if (gap <= -5) return 'text-emerald-300'
  if (gap <= 0) return 'text-green-400'
  if (gap <= 5) return 'text-amber-400'
  return 'text-red-400'
}

function getScoreColor(score: number): string {
  if (score >= 25) return 'text-emerald-400'
  if (score >= 15) return 'text-green-400'
  if (score >= 10) return 'text-amber-400'
  return 'text-slate-400'
}

function CandidatesTable({ candidates, isLoading }: CandidatesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200">Buy Candidates - Top 30</h2>
        </div>
        <div className="p-8 text-center text-slate-400 animate-pulse">
          Loading screening data...
        </div>
      </div>
    )
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200">Buy Candidates - Top 30</h2>
        </div>
        <div className="p-8 text-center text-slate-400">
          No candidates available for this date.
        </div>
      </div>
    )
  }

  const sorted = [...candidates].sort((a, b) => a.part2_rank - b.part2_rank)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">
          Buy Candidates - Top {sorted.length}
        </h2>
        <span className="text-xs text-slate-400">
          Sorted by Part 2 Rank (composite: adj_gap 70% + rev_growth 30%)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-3 py-3 text-left">Rank</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Ticker</th>
              <th className="px-3 py-3 text-left">Industry</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-right">Adj Score</th>
              <th className="px-3 py-3 text-right">Adj Gap</th>
              <th className="px-3 py-3 text-right">Rev Growth</th>
              <th className="px-3 py-3 text-right">Mkt Cap</th>
              <th className="px-3 py-3 text-center">Trend</th>
              <th className="px-3 py-3 text-left">Rank Hist</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {sorted.map((c, idx) => (
              <tr
                key={c.ticker}
                className={`hover:bg-slate-700/50 transition-colors ${
                  idx < 20 ? 'bg-slate-800' : 'bg-slate-800/60'
                }`}
              >
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    c.part2_rank <= 5
                      ? 'bg-emerald-600 text-white'
                      : c.part2_rank <= 20
                        ? 'bg-slate-600 text-slate-200'
                        : 'bg-slate-700 text-slate-400'
                  }`}>
                    {c.part2_rank}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    to={`/ticker/${c.ticker}`}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    {c.ticker}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-slate-400 text-xs max-w-[140px] truncate">
                  {c.industry || '-'}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-slate-200">
                  ${c.price.toFixed(2)}
                </td>
                <td className={`px-3 py-2.5 text-right font-mono font-semibold ${getScoreColor(c.adj_score)}`}>
                  {formatNumber(c.adj_score)}
                </td>
                <td className={`px-3 py-2.5 text-right font-mono font-semibold ${getGapColor(c.adj_gap)}`}>
                  {formatPercent(c.adj_gap)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                  {c.rev_growth !== null ? formatPercent(c.rev_growth) : '-'}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-slate-400 text-xs">
                  {formatMarketCap(c.market_cap)}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <TrendIcon seg1={c.seg1} seg2={c.seg2} seg3={c.seg3} seg4={c.seg4} />
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-400 font-mono">
                  {c.rank_history || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CandidatesTable
