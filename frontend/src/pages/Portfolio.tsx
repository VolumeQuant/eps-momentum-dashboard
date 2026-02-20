import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { PortfolioEntry } from '../types'
import { fetchPortfolioHistory, fetchDates, fetchPortfolio } from '../api/client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

function getActionBadge(action: string) {
  const colors: Record<string, string> = {
    enter: 'bg-emerald-900/50 text-emerald-400 border-emerald-700',
    hold: 'bg-blue-900/50 text-blue-400 border-blue-700',
    exit: 'bg-red-900/50 text-red-400 border-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${colors[action] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
      {action.toUpperCase()}
    </span>
  )
}

function getReturnColor(pct: number | null): string {
  if (pct === null) return 'text-slate-400'
  if (pct > 0) return 'text-emerald-400'
  if (pct < 0) return 'text-red-400'
  return 'text-slate-400'
}

function Portfolio() {
  const [history, setHistory] = useState<PortfolioEntry[]>([])
  const [currentPortfolio, setCurrentPortfolio] = useState<PortfolioEntry[]>([])
  const [latestDate, setLatestDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterAction, setFilterAction] = useState<string>('all')

  useEffect(() => {
    setIsLoading(true)
    Promise.all([fetchPortfolioHistory(), fetchDates()])
      .then(([histData, dates]) => {
        setHistory(histData)
        const latest = dates.length > 0 ? dates[dates.length - 1] : ''
        setLatestDate(latest)
        if (latest) {
          return fetchPortfolio(latest)
        }
        return []
      })
      .then(portfolio => {
        setCurrentPortfolio(portfolio)
        setIsLoading(false)
      })
      .catch(err => {
        setError(`Failed to load portfolio: ${err.message}`)
        setIsLoading(false)
      })
  }, [])

  // Calculate cumulative returns from exit trades
  const cumulativeData = useMemo(() => {
    const exits = history
      .filter(e => e.action === 'exit' && e.return_pct !== null)
      .sort((a, b) => a.date.localeCompare(b.date))

    let cumReturn = 0
    return exits.map(e => {
      // Each position is 20% weight, so contribution = return * weight
      const contribution = (e.return_pct ?? 0) * (e.weight || 0.2)
      cumReturn += contribution
      return {
        date: e.date,
        ticker: e.ticker,
        return_pct: e.return_pct,
        contribution,
        cumulative: parseFloat(cumReturn.toFixed(2)),
      }
    })
  }, [history])

  // Trade stats
  const tradeStats = useMemo(() => {
    const exits = history.filter(e => e.action === 'exit' && e.return_pct !== null)
    if (exits.length === 0) return null

    const wins = exits.filter(e => (e.return_pct ?? 0) > 0)
    const losses = exits.filter(e => (e.return_pct ?? 0) <= 0)
    const avgReturn = exits.reduce((sum, e) => sum + (e.return_pct ?? 0), 0) / exits.length
    const avgWin = wins.length > 0 ? wins.reduce((sum, e) => sum + (e.return_pct ?? 0), 0) / wins.length : 0
    const avgLoss = losses.length > 0 ? losses.reduce((sum, e) => sum + (e.return_pct ?? 0), 0) / losses.length : 0

    return {
      totalTrades: exits.length,
      wins: wins.length,
      losses: losses.length,
      winRate: (wins.length / exits.length) * 100,
      avgReturn,
      avgWin,
      avgLoss,
    }
  }, [history])

  // Filtered history for table
  const filteredHistory = useMemo(() => {
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date) || a.ticker.localeCompare(b.ticker))
    if (filterAction === 'all') return sorted
    return sorted.filter(e => e.action === filterAction)
  }, [history, filterAction])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Portfolio Tracker</h1>
        <div className="text-center text-slate-400 py-12 animate-pulse">
          Loading portfolio data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Portfolio Tracker</h1>
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Portfolio Tracker</h1>
        <p className="text-sm text-slate-400 mt-1">
          Forward Test - 5 positions, 20% equal weight
        </p>
      </div>

      {/* Current Holdings */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200">
            Current Holdings
            {latestDate && <span className="text-sm text-slate-400 ml-2">({latestDate})</span>}
          </h2>
        </div>
        {currentPortfolio.filter(e => e.action !== 'exit').length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Ticker</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-right">Weight</th>
                  <th className="px-4 py-3 text-right">Entry Date</th>
                  <th className="px-4 py-3 text-right">Entry Price</th>
                  <th className="px-4 py-3 text-right">Current</th>
                  <th className="px-4 py-3 text-right">Unrealized</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {currentPortfolio
                  .filter(e => e.action !== 'exit')
                  .map(entry => {
                    const unrealized = entry.entry_price > 0
                      ? ((entry.price - entry.entry_price) / entry.entry_price) * 100
                      : null
                    return (
                      <tr key={entry.ticker} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            to={`/ticker/${entry.ticker}`}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                          >
                            {entry.ticker}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{getActionBadge(entry.action)}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300">
                          {(entry.weight * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-400 text-xs">
                          {entry.entry_date}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300">
                          ${entry.entry_price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-200">
                          ${entry.price.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-semibold ${getReturnColor(unrealized)}`}>
                          {unrealized !== null
                            ? `${unrealized > 0 ? '+' : ''}${unrealized.toFixed(1)}%`
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400">No active positions.</div>
        )}
      </div>

      {/* Trade Statistics */}
      {tradeStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Trades</div>
            <div className="text-xl font-bold text-slate-200">{tradeStats.totalTrades}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Wins</div>
            <div className="text-xl font-bold text-emerald-400">{tradeStats.wins}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Losses</div>
            <div className="text-xl font-bold text-red-400">{tradeStats.losses}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Win Rate</div>
            <div className={`text-xl font-bold ${tradeStats.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
              {tradeStats.winRate.toFixed(0)}%
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Avg Return</div>
            <div className={`text-xl font-bold ${getReturnColor(tradeStats.avgReturn)}`}>
              {tradeStats.avgReturn > 0 ? '+' : ''}{tradeStats.avgReturn.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Avg Win</div>
            <div className="text-xl font-bold text-emerald-400">+{tradeStats.avgWin.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Avg Loss</div>
            <div className="text-xl font-bold text-red-400">{tradeStats.avgLoss.toFixed(1)}%</div>
          </div>
        </div>
      )}

      {/* Cumulative Returns Chart */}
      {cumulativeData.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Cumulative Portfolio Return (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#475569' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#475569' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Cumulative']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ fill: '#34d399', r: 3 }}
                name="Cumulative Return"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trade History Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-slate-200">Trade History</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            {['all', 'enter', 'hold', 'exit'].map(action => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterAction === action
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Ticker</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Weight</th>
                <th className="px-4 py-3 text-right">Entry Date</th>
                <th className="px-4 py-3 text-right">Entry Price</th>
                <th className="px-4 py-3 text-right">Exit Price</th>
                <th className="px-4 py-3 text-right">Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredHistory.slice(0, 100).map((entry, idx) => (
                <tr key={`${entry.date}-${entry.ticker}-${idx}`} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-slate-400">{entry.date}</td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/ticker/${entry.ticker}`}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition-colors"
                    >
                      {entry.ticker}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{getActionBadge(entry.action)}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-300">${entry.price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-400">
                    {(entry.weight * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-slate-500">{entry.entry_date}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-400">${entry.entry_price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-400">
                    {entry.exit_price !== null ? `$${entry.exit_price.toFixed(2)}` : '-'}
                  </td>
                  <td className={`px-4 py-2 text-right font-mono font-semibold ${getReturnColor(entry.return_pct)}`}>
                    {entry.return_pct !== null
                      ? `${entry.return_pct > 0 ? '+' : ''}${entry.return_pct.toFixed(1)}%`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredHistory.length > 100 && (
          <div className="p-3 text-center text-xs text-slate-400 border-t border-slate-700">
            Showing 100 of {filteredHistory.length} entries
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio
