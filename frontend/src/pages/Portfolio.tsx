import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { PortfolioEntry } from '../types'
import { fetchPortfolioHistory, fetchDates, fetchPortfolio } from '../api/client'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { ArrowLeft, Trophy, Target, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react'

function getActionBadge(action: string) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    enter: { bg: 'bg-emerald-600/20', text: 'text-emerald-400', border: 'border-emerald-600/30' },
    hold: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-600/30' },
    exit: { bg: 'bg-red-600/20', text: 'text-red-400', border: 'border-red-600/30' },
  }
  const s = styles[action] || { bg: 'bg-slate-700', text: 'text-slate-400', border: 'border-slate-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${s.bg} ${s.text} ${s.border}`}>
      {action.toUpperCase()}
    </span>
  )
}

function getReturnColor(pct: number | null): string {
  if (pct === null) return 'text-slate-500'
  if (pct > 0) return 'text-emerald-400'
  if (pct < 0) return 'text-red-400'
  return 'text-slate-400'
}

const tooltipStyle = {
  backgroundColor: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#F1F5F9',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-8 w-48 bg-slate-700/50 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-surface-default border border-border-default rounded-xl p-4 animate-pulse">
            <div className="h-3 w-16 bg-slate-700/50 rounded mb-2" />
            <div className="h-6 w-12 bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
      <div className="h-72 bg-surface-default border border-border-default rounded-xl animate-pulse" />
      <div className="h-96 bg-surface-default border border-border-default rounded-xl animate-pulse" />
    </div>
  )
}

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface-default border border-border-default rounded-xl p-4 hover:border-emerald-500/20 transition-all">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={`${color} opacity-70`}>{icon}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xl font-bold font-mono tabular-nums ${color}`}>{value}</div>
    </div>
  )
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
        setError(`포트폴리오 로딩 실패: ${err.message}`)
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

  if (isLoading) return <PortfolioSkeleton />

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">포트폴리오 트래커</h1>
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">포트폴리오 트래커</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Forward Test - 5종목, 20% 균등 배분
            </p>
          </div>
        </div>
        {latestDate && (
          <span className="text-xs text-slate-500 font-mono tabular-nums bg-surface-default border border-border-default px-3 py-1.5 rounded-lg">
            최신: {latestDate}
          </span>
        )}
      </div>

      {/* Current Holdings */}
      <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h2 className="text-sm font-semibold text-slate-100">현재 보유 종목</h2>
            {latestDate && <span className="text-xs text-slate-500">{latestDate}</span>}
          </div>
        </div>
        {currentPortfolio.filter(e => e.action !== 'exit').length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">종목</th>
                  <th className="px-4 py-3 text-left">액션</th>
                  <th className="px-4 py-3 text-right">비중</th>
                  <th className="px-4 py-3 text-right">진입일</th>
                  <th className="px-4 py-3 text-right">진입가</th>
                  <th className="px-4 py-3 text-right">현재가</th>
                  <th className="px-4 py-3 text-right">미실현 수익</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {currentPortfolio
                  .filter(e => e.action !== 'exit')
                  .map(entry => {
                    const unrealized = entry.entry_price > 0
                      ? ((entry.price - entry.entry_price) / entry.entry_price) * 100
                      : null
                    return (
                      <tr key={entry.ticker} className="hover:bg-surface-hover transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            to={`/ticker/${entry.ticker}`}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                          >
                            {entry.ticker}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{getActionBadge(entry.action)}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
                          {(entry.weight * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-500 text-xs tabular-nums">
                          {entry.entry_date}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-400 tabular-nums">
                          ${entry.entry_price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums">
                          ${entry.price.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-semibold tabular-nums ${getReturnColor(unrealized)}`}>
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
          <div className="p-6 text-center text-slate-500 text-sm">보유 종목이 없습니다.</div>
        )}
      </div>

      {/* Trade Statistics */}
      {tradeStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard
            label="총 거래"
            value={tradeStats.totalTrades}
            color="text-slate-200"
            icon={<BarChart3 className="w-3.5 h-3.5" />}
          />
          <StatCard
            label="수익"
            value={tradeStats.wins}
            color="text-emerald-400"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
          />
          <StatCard
            label="손실"
            value={tradeStats.losses}
            color="text-red-400"
            icon={<TrendingDown className="w-3.5 h-3.5" />}
          />
          <StatCard
            label="승률"
            value={`${tradeStats.winRate.toFixed(0)}%`}
            color={tradeStats.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}
            icon={<Trophy className="w-3.5 h-3.5" />}
          />
          <StatCard
            label="평균 수익률"
            value={`${tradeStats.avgReturn > 0 ? '+' : ''}${tradeStats.avgReturn.toFixed(1)}%`}
            color={getReturnColor(tradeStats.avgReturn)}
            icon={<Target className="w-3.5 h-3.5" />}
          />
          <StatCard
            label="평균 수익"
            value={`+${tradeStats.avgWin.toFixed(1)}%`}
            color="text-emerald-400"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
          />
          <StatCard
            label="평균 손실"
            value={`${tradeStats.avgLoss.toFixed(1)}%`}
            color="text-red-400"
            icon={<TrendingDown className="w-3.5 h-3.5" />}
          />
        </div>
      )}

      {/* Cumulative Returns Chart */}
      {cumulativeData.length > 0 && (
        <div className="bg-surface-default border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
            <h3 className="text-sm font-semibold text-slate-200">누적 수익률</h3>
            <span className="text-xs text-slate-500">Cumulative Portfolio Return</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cumulativeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`${value.toFixed(2)}%`, '누적 수익률']}
              />
              <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#34D399"
                strokeWidth={2}
                fill="url(#cumulativeGradient)"
                dot={{ fill: '#34D399', r: 2, strokeWidth: 0 }}
                name="Cumulative Return"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trade History Table */}
      <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-default flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h2 className="text-sm font-semibold text-slate-100">거래 내역</h2>
            <span className="text-xs text-slate-500">Trade History</span>
          </div>
          <div className="flex items-center gap-1.5">
            {['all', 'enter', 'hold', 'exit'].map(action => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterAction === action
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {action === 'all' ? '전체' : action === 'enter' ? '진입' : action === 'hold' ? '유지' : '퇴출'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">날짜</th>
                <th className="px-4 py-3 text-left">종목</th>
                <th className="px-4 py-3 text-left">액션</th>
                <th className="px-4 py-3 text-right">가격</th>
                <th className="px-4 py-3 text-right">비중</th>
                <th className="px-4 py-3 text-right">진입일</th>
                <th className="px-4 py-3 text-right">진입가</th>
                <th className="px-4 py-3 text-right">퇴출가</th>
                <th className="px-4 py-3 text-right">수익률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredHistory.slice(0, 100).map((entry, idx) => (
                <tr key={`${entry.date}-${entry.ticker}-${idx}`} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-slate-500 tabular-nums">{entry.date}</td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/ticker/${entry.ticker}`}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition-colors"
                    >
                      {entry.ticker}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{getActionBadge(entry.action)}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-300 tabular-nums">${entry.price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-500 tabular-nums">
                    {(entry.weight * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-slate-600 tabular-nums">{entry.entry_date}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-500 tabular-nums">${entry.entry_price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-500 tabular-nums">
                    {entry.exit_price !== null ? `$${entry.exit_price.toFixed(2)}` : '-'}
                  </td>
                  <td className={`px-4 py-2 text-right font-mono font-semibold tabular-nums ${getReturnColor(entry.return_pct)}`}>
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
          <div className="p-3 text-center text-xs text-slate-500 border-t border-border-default">
            100개 / 전체 {filteredHistory.length}개 표시 중
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio
