import { useState, useEffect, useMemo } from 'react'
import type { Candidate, ScreeningStats, PortfolioEntry, ExitedStock, MarketStatus } from '../types'
import {
  fetchDates,
  fetchScreening,
  fetchStats,
  fetchPortfolio,
  fetchExited,
  fetchMarketLive,
} from '../api/client'
import MarketPulse from '../components/MarketPulse'
import ScreeningStatsCards from '../components/MarketStatus'
import CandidatesTable from '../components/CandidatesTable'
import PortfolioCard from '../components/PortfolioCard'
import DeathList from '../components/DeathList'
import IndustryChart from '../components/IndustryChart'
import DateSelector from '../components/DateSelector'

function getSeasonBanner(quadrant: string): { icon: string; name: string; bgClass: string; textClass: string } {
  switch (quadrant) {
    case 'Q1':
      return { icon: '\uD83C\uDF38', name: '\uBD04', bgClass: 'bg-pink-500/10 border-pink-500/20', textClass: 'text-pink-300' }
    case 'Q2':
      return { icon: '\u2600\uFE0F', name: '\uC5EC\uB984', bgClass: 'bg-amber-500/10 border-amber-500/20', textClass: 'text-amber-300' }
    case 'Q3':
      return { icon: '\uD83C\uDF42', name: '\uAC00\uC744', bgClass: 'bg-orange-500/10 border-orange-500/20', textClass: 'text-orange-300' }
    case 'Q4':
      return { icon: '\u2744\uFE0F', name: '\uACA8\uC6B8', bgClass: 'bg-blue-500/10 border-blue-500/20', textClass: 'text-blue-300' }
    default:
      return { icon: '\uD83D\uDCC8', name: '\uBD84\uC11D \uC911', bgClass: 'bg-slate-500/10 border-slate-500/20', textClass: 'text-slate-300' }
  }
}

function getSignalDotsText(hyOk: boolean, vixOk: boolean): { dots: string; label: string; colorClass: string } {
  if (hyOk && vixOk) return { dots: '\u25CF\u25CF', label: '2/2 \uC548\uC815', colorClass: 'text-emerald-400' }
  if (!hyOk && !vixOk) return { dots: '\u25CF\u25CF', label: '\uC704\uD5D8', colorClass: 'text-red-400' }
  return { dots: '\u25CF\u25CF', label: '\uC5C7\uAC08\uB9BC', colorClass: 'text-amber-400' }
}

function StickyBanner({ market, verifiedCount }: { market: MarketStatus; verifiedCount: number }) {
  const season = getSeasonBanner(market.hy?.quadrant || '')
  const signal = getSignalDotsText(market.signal_dots?.hy_ok ?? true, market.signal_dots?.vix_ok ?? true)

  return (
    <div className={`sticky top-0 z-50 border rounded-lg px-4 py-2 ${season.bgClass} backdrop-blur-sm`}>
      <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
        <span className={`font-semibold ${season.textClass}`}>
          {season.icon} {season.name} {market.hy ? `${market.hy.q_days}\uC77C\uCC38` : ''}
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className={`font-medium ${signal.colorClass}`}>
          <span className={`${market.signal_dots?.hy_ok ? 'text-emerald-400' : 'text-red-400'}`}>{'\u25CF'}</span>
          <span className={`${market.signal_dots?.vix_ok ? 'text-emerald-400' : 'text-red-400'}`}>{'\u25CF'}</span>
          {' '}{signal.label}
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-none">
          {market.final_action || '\uBD84\uC11D \uC911'}
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-emerald-400 font-medium whitespace-nowrap">
          \uAC80\uC99D \uC644\uB8CC {verifiedCount}\uC885\uBAA9
        </span>
      </div>
    </div>
  )
}

function Dashboard() {
  const [dates, setDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [stats, setStats] = useState<ScreeningStats | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([])
  const [exited, setExited] = useState<ExitedStock[]>([])
  const [market, setMarket] = useState<MarketStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const verifiedCount = useMemo(() => {
    return candidates.filter(c => c.status_3d === '\u2705').length
  }, [candidates])

  // Fetch available dates on mount
  useEffect(() => {
    fetchDates()
      .then(d => {
        setDates(d)
        if (d.length > 0) {
          setSelectedDate(d[0]) // dates come sorted DESC, first is latest
        }
      })
      .catch(err => {
        setError(`날짜 목록 로딩 실패: ${err.message}`)
        setIsLoading(false)
      })
  }, [])

  // Fetch data when date changes
  useEffect(() => {
    if (!selectedDate) return

    setIsLoading(true)
    setError(null)

    Promise.all([
      fetchScreening(selectedDate),
      fetchStats(selectedDate),
      fetchPortfolio(selectedDate),
      fetchExited(selectedDate),
      fetchMarketLive().catch(() => null),
    ])
      .then(([candidatesData, statsData, portfolioData, exitedData, marketData]) => {
        setCandidates(candidatesData)
        setStats(statsData)
        setPortfolio(portfolioData)
        setExited(exitedData)
        setMarket(marketData)
        setIsLoading(false)
      })
      .catch(err => {
        setError(`데이터 로딩 실패: ${err.message}`)
        setIsLoading(false)
      })
  }, [selectedDate])

  return (
    <div className="space-y-8">
      {/* Sticky Summary Banner */}
      {!isLoading && market && (
        <StickyBanner market={market} verifiedCount={verifiedCount} />
      )}

      {/* Top bar: Date selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">대시보드</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            EPS Momentum - 매일의 스크리닝 결과를 확인하세요
          </p>
        </div>
        <DateSelector
          dates={dates}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* ACT 1: Market Pulse (Hero) */}
      <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
        <MarketPulse market={market} isLoading={isLoading} />
      </div>

      {/* ACT 2: Screening Stats */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <ScreeningStatsCards stats={stats} isLoading={isLoading} />
      </div>

      {/* ACT 3: Main content — Candidates table + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Candidates Table — 3 columns wide */}
        <div className="xl:col-span-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CandidatesTable candidates={candidates} isLoading={isLoading} />
        </div>

        {/* Sidebar — 1 column */}
        <div className="space-y-6 animate-slide-in" style={{ animationDelay: '300ms' }}>
          {/* Portfolio */}
          <PortfolioCard entries={portfolio} isLoading={isLoading} />

          {/* Death List */}
          <DeathList exited={exited} isLoading={isLoading} />

          {/* Industry Distribution */}
          {stats && stats.industry_distribution && Object.keys(stats.industry_distribution).length > 0 && (
            <IndustryChart distribution={stats.industry_distribution} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
