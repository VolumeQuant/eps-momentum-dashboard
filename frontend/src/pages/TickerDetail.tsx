import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { TickerHistory } from '../types'
import { fetchTickerHistory } from '../api/client'
import ScoreChart from '../components/ScoreChart'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'

function formatNumber(val: number | null | undefined, decimals: number = 2): string {
  if (val === null || val === undefined) return '-'
  return val.toFixed(decimals)
}

function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(1)}%`
}

function getWeatherLabel(change: number): string {
  if (change > 20) return 'Hot'
  if (change > 5) return 'Warm'
  if (change > 1) return 'Mild'
  if (change > -1) return 'Flat'
  return 'Cold'
}

function getSegColor(val: number): string {
  if (val > 20) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  if (val > 5) return 'text-emerald-300 bg-emerald-500/8 border-emerald-500/15'
  if (val > 1) return 'text-green-400 bg-green-500/8 border-green-500/15'
  if (val > -1) return 'text-slate-400 bg-slate-700/30 border-slate-600/30'
  return 'text-red-400 bg-red-500/10 border-red-500/20'
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
    <div className="bg-surface-default border border-border-default rounded-xl p-4 hover:border-emerald-500/30 transition-all">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">{label}</div>
      <div className={`text-xl font-bold font-mono tabular-nums ${color}`}>{value}</div>
      {subtext && <div className="text-[11px] text-slate-500 mt-1">{subtext}</div>}
    </div>
  )
}

function TickerDetailSkeleton({ ticker: _ticker }: { ticker?: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          대시보드
        </Link>
        <span className="text-slate-600">/</span>
        <div className="h-8 w-24 bg-slate-700/50 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-surface-default border border-border-default rounded-xl p-4 animate-pulse">
            <div className="h-3 w-20 bg-slate-700/50 rounded mb-2" />
            <div className="h-6 w-16 bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-surface-default border border-border-default rounded-xl animate-pulse" />
        <div className="h-80 bg-surface-default border border-border-default rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

function TickerDetail() {
  const { ticker } = useParams<{ ticker: string }>()
  const [history, setHistory] = useState<TickerHistory[]>([])
  const [shortName, setShortName] = useState<string>('')
  const [industryKr, setIndustryKr] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeChart, setActiveChart] = useState<'price' | 'adj_score' | 'adj_gap'>('price')

  useEffect(() => {
    if (!ticker) return

    setIsLoading(true)
    setError(null)

    fetchTickerHistory(ticker)
      .then(data => {
        setShortName(data.short_name || '')
        setIndustryKr(data.industry_kr || '')
        setHistory(data.history)
        setIsLoading(false)
      })
      .catch(err => {
        setError(`${ticker} 데이터 로딩 실패: ${err.message}`)
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
    .join(' \u2192 ')

  if (isLoading) return <TickerDetailSkeleton ticker={ticker} />

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </Link>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb + Hero */}
      <div className="bg-surface-default border border-border-default rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sm text-slate-400">{ticker}</span>
        </div>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-bold text-emerald-400">{ticker}</h1>
              {shortName && <span className="text-sm text-slate-400">{shortName}</span>}
              {industryKr && <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">{industryKr}</span>}
            </div>
            {latest && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xl font-mono text-slate-200 tabular-nums">
                  ${latest.price.toFixed(2)}
                </span>
                {priceVsMa !== null && (
                  <span className={`flex items-center gap-1 text-sm font-mono font-semibold tabular-nums ${
                    priceVsMa >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {priceVsMa >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {formatPercent(priceVsMa)} vs MA60
                  </span>
                )}
              </div>
            )}
          </div>
          {latest && latest.part2_rank !== null && (
            <div className={`text-right px-4 py-2 rounded-xl border ${
              latest.part2_rank <= 5
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : latest.part2_rank <= 20
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-slate-700/30 border-slate-600/30 text-slate-400'
            }`}>
              <div className="text-xs opacity-70 mb-0.5">Part2 순위</div>
              <div className="text-2xl font-bold font-mono">#{latest.part2_rank}</div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Adj Score"
            value={formatNumber(latest.adj_score, 1)}
            color={latest.adj_score >= 15 ? 'text-emerald-400' : latest.adj_score >= 9 ? 'text-amber-400' : 'text-red-400'}
          />
          <MetricCard
            label="Adj Gap"
            value={formatPercent(latest.adj_gap)}
            color={latest.adj_gap <= 0 ? 'text-emerald-400' : 'text-red-400'}
            subtext={latest.adj_gap <= 0 ? '저평가' : '고평가'}
          />
          <MetricCard
            label="NTM EPS"
            value={`$${formatNumber(latest.ntm_current)}`}
            color="text-blue-400"
          />
          <MetricCard
            label="매출 성장"
            value={latest.rev_growth !== null ? formatPercent(latest.rev_growth) : '-'}
            color={latest.rev_growth !== null && latest.rev_growth > 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <MetricCard
            label="Price"
            value={`$${latest.price.toFixed(2)}`}
            subtext={latest.ma60 > 0 ? `MA60: $${latest.ma60.toFixed(2)}` : undefined}
          />
          <MetricCard
            label="Price vs MA60"
            value={priceVsMa !== null ? formatPercent(priceVsMa) : '-'}
            color={priceVsMa !== null && priceVsMa > 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <MetricCard
            label="Raw Score"
            value={formatNumber(latest.score, 1)}
            color="text-slate-300"
          />
          <MetricCard
            label="Part2 Rank"
            value={latest.part2_rank !== null ? `#${latest.part2_rank}` : 'N/A'}
            color={latest.part2_rank !== null && latest.part2_rank <= 20 ? 'text-emerald-400' : 'text-slate-400'}
          />
        </div>
      )}

      {/* EPS Trend 4 Segments */}
      {latest && (
        <div className="bg-surface-default border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
            <h3 className="text-sm font-semibold text-slate-200">EPS 추세 (4구간)</h3>
            <span className="text-xs text-slate-500">Segment Changes</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'S1 (90d~)', value: latest.score > 0 ? (history.length > 0 ? history[history.length - 1] : latest) : latest, seg: 'seg1' as const, period: '과거' },
              { label: 'S2 (60d~)', value: latest, seg: 'seg2' as const, period: '60일' },
              { label: 'S3 (30d~)', value: latest, seg: 'seg3' as const, period: '30일' },
              { label: 'S4 (최근)', value: latest, seg: 'seg4' as const, period: '현재' },
            ].map((item, idx) => {
              // We need to get seg values from history's latest entry
              // Since TickerHistory doesn't have seg fields, we'll compute from score
              // For now, show the overall score info
              const segVal = idx === 0 ? latest.seg1 : idx === 1 ? latest.seg2 : idx === 2 ? latest.seg3 : latest.seg4
              const val = typeof segVal === 'number' ? segVal : 0
              const colorClass = getSegColor(val)
              return (
                <div key={idx} className={`rounded-xl border p-3 text-center ${colorClass}`}>
                  <div className="text-[10px] opacity-60 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-lg font-bold font-mono tabular-nums">
                    {val > 0 ? '+' : ''}{val.toFixed(1)}%
                  </div>
                  <div className="text-[10px] mt-1 opacity-70">{getWeatherLabel(val)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rank History */}
      {rankHistory && (
        <div className="bg-surface-default border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h3 className="text-sm font-semibold text-slate-200">순위 이력</h3>
            <span className="text-xs text-slate-500">최근 10일</span>
          </div>
          <div className="text-sm font-mono text-slate-300 tabular-nums">{rankHistory}</div>
        </div>
      )}

      {/* Charts — Tabbed */}
      <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
        <div className="flex border-b border-border-default">
          {[
            { key: 'price' as const, label: '가격 차트' },
            { key: 'adj_score' as const, label: '점수 추이' },
            { key: 'adj_gap' as const, label: '괴리율 추이' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                activeChart === tab.key
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div>
          <ScoreChart data={history} metric={activeChart} embedded />
        </div>
      </div>

      {/* Historical data table */}
      <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-slate-500 rounded-full" />
            <h3 className="text-sm font-semibold text-slate-200">히스토리 데이터</h3>
            <span className="text-xs text-slate-500">최근 30일</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-3 py-3 text-left">날짜</th>
                <th className="px-3 py-3 text-right">가격</th>
                <th className="px-3 py-3 text-right">MA60</th>
                <th className="px-3 py-3 text-right">Score</th>
                <th className="px-3 py-3 text-right">Adj Score</th>
                <th className="px-3 py-3 text-right">Adj Gap</th>
                <th className="px-3 py-3 text-right">NTM EPS</th>
                <th className="px-3 py-3 text-right">매출성장</th>
                <th className="px-3 py-3 text-right">순위</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {[...history].reverse().slice(0, 30).map(row => (
                <tr key={row.date} className="hover:bg-surface-hover transition-colors">
                  <td className="px-3 py-2 text-slate-400 font-mono text-xs tabular-nums">{row.date}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-200 tabular-nums">${row.price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500 tabular-nums">${row.ma60.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400 tabular-nums">{formatNumber(row.score, 1)}</td>
                  <td className={`px-3 py-2 text-right font-mono font-semibold tabular-nums ${
                    row.adj_score >= 15 ? 'text-emerald-400' : row.adj_score >= 9 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {formatNumber(row.adj_score, 1)}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-semibold tabular-nums ${
                    row.adj_gap <= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {formatPercent(row.adj_gap)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-blue-400 tabular-nums">
                    ${formatNumber(row.ntm_current)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400 tabular-nums">
                    {row.rev_growth !== null ? formatPercent(row.rev_growth) : '-'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400 tabular-nums">
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
