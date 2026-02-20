import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { TickerHistory } from '../types'
import { fetchTickerHistory } from '../api/client'
import ScoreChart from '../components/ScoreChart'

function formatNumber(val: number | null | undefined, decimals: number = 2): string {
  if (val === null || val === undefined) return '-'
  return val.toFixed(decimals)
}

function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(1)}%`
}

function MetricCard({
  label,
  value,
  color = 'text-slate-200',
  subtext,
}: {
  label: string;
  value: string;
  color?: string;
  subtext?: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
      {subtext && <div className="text-xs text-slate-500 mt-0.5">{subtext}</div>}
    </div>
  )
}

function TickerDetail() {
  const { ticker } = useParams<{ ticker: string }>()
  const [history, setHistory] = useState<TickerHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) return

    setIsLoading(true)
    setError(null)

    fetchTickerHistory(ticker)
      .then(data => {
        setHistory(data)
        setIsLoading(false)
      })
      .catch(err => {
        setError(`Failed to load data for ${ticker}: ${err.message}`)
        setIsLoading(false)
      })
  }, [ticker])

  const latest = history.length > 0 ? history[history.length - 1] : null

  const priceVsMa = latest && latest.ma60 > 0
    ? ((latest.price - latest.ma60) / latest.ma60) * 100
    : null

  const rankHistory = history
    .filter(h => h.part2_rank !== null)
    .slice(-10)
    .map(h => h.part2_rank)
    .join(' -> ')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-slate-200 transition-colors text-sm">
            &larr; Dashboard
          </Link>
        </div>
        <div className="text-center text-slate-400 py-12 animate-pulse">
          Loading {ticker} data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-slate-200 transition-colors text-sm">
            &larr; Dashboard
          </Link>
        </div>
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-slate-400 hover:text-slate-200 transition-colors text-sm">
          &larr; Dashboard
        </Link>
        <span className="text-slate-600">/</span>
        <h1 className="text-2xl font-bold text-emerald-400">{ticker}</h1>
        {latest && (
          <span className="text-lg text-slate-300 font-mono">
            ${latest.price.toFixed(2)}
          </span>
        )}
      </div>

      {/* Metrics grid */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Adj Score"
            value={formatNumber(latest.adj_score, 1)}
            color={latest.adj_score >= 15 ? 'text-emerald-400' : latest.adj_score >= 9 ? 'text-amber-400' : 'text-red-400'}
          />
          <MetricCard
            label="Adj Gap"
            value={formatPercent(latest.adj_gap)}
            color={latest.adj_gap <= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <MetricCard
            label="Price"
            value={`$${latest.price.toFixed(2)}`}
            color="text-slate-200"
            subtext={latest.ma60 > 0 ? `MA60: $${latest.ma60.toFixed(2)}` : undefined}
          />
          <MetricCard
            label="Price vs MA60"
            value={priceVsMa !== null ? formatPercent(priceVsMa) : '-'}
            color={priceVsMa !== null && priceVsMa > 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <MetricCard
            label="NTM EPS"
            value={`$${formatNumber(latest.ntm_current)}`}
            color="text-blue-400"
          />
          <MetricCard
            label="Part2 Rank"
            value={latest.part2_rank !== null ? `#${latest.part2_rank}` : 'N/A'}
            color={latest.part2_rank !== null && latest.part2_rank <= 20 ? 'text-emerald-400' : 'text-slate-400'}
          />
        </div>
      )}

      {/* Rank History */}
      {rankHistory && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Rank History (last 10 days)
          </div>
          <div className="text-sm font-mono text-slate-300">{rankHistory}</div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreChart data={history} metric="adj_score" />
        <ScoreChart data={history} metric="adj_gap" />
      </div>

      <ScoreChart data={history} metric="price" />

      {/* Historical data table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-200">Historical Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-3 py-3 text-left">Date</th>
                <th className="px-3 py-3 text-right">Price</th>
                <th className="px-3 py-3 text-right">MA60</th>
                <th className="px-3 py-3 text-right">Score</th>
                <th className="px-3 py-3 text-right">Adj Score</th>
                <th className="px-3 py-3 text-right">Adj Gap</th>
                <th className="px-3 py-3 text-right">NTM EPS</th>
                <th className="px-3 py-3 text-right">Rev Growth</th>
                <th className="px-3 py-3 text-right">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {[...history].reverse().slice(0, 30).map(row => (
                <tr key={row.date} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-3 py-2 text-slate-300 font-mono text-xs">{row.date}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-200">${row.price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400">${row.ma60.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-300">{formatNumber(row.score, 1)}</td>
                  <td className={`px-3 py-2 text-right font-mono font-semibold ${
                    row.adj_score >= 15 ? 'text-emerald-400' : row.adj_score >= 9 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {formatNumber(row.adj_score, 1)}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-semibold ${
                    row.adj_gap <= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {formatPercent(row.adj_gap)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-blue-400">
                    ${formatNumber(row.ntm_current)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400">
                    {row.rev_growth !== null ? formatPercent(row.rev_growth) : '-'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400">
                    {row.part2_rank !== null ? `#${row.part2_rank}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TickerDetail
