import { useState, useEffect } from 'react'
import type { Candidate, ScreeningStats, PortfolioEntry, ExitedStock } from '../types'
import { fetchDates, fetchScreening, fetchStats, fetchPortfolio, fetchExited } from '../api/client'
import MarketStatus from '../components/MarketStatus'
import CandidatesTable from '../components/CandidatesTable'
import PortfolioCard from '../components/PortfolioCard'

function Dashboard() {
  const [dates, setDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [stats, setStats] = useState<ScreeningStats | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([])
  const [exited, setExited] = useState<ExitedStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available dates on mount
  useEffect(() => {
    fetchDates()
      .then(d => {
        setDates(d)
        if (d.length > 0) {
          setSelectedDate(d[d.length - 1]) // default to latest
        }
      })
      .catch(err => {
        setError(`Failed to load dates: ${err.message}`)
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
    ])
      .then(([candidatesData, statsData, portfolioData, exitedData]) => {
        setCandidates(candidatesData)
        setStats(statsData)
        setPortfolio(portfolioData)
        setExited(exitedData)
        setIsLoading(false)
      })
      .catch(err => {
        setError(`Failed to load data: ${err.message}`)
        setIsLoading(false)
      })
  }, [selectedDate])

  return (
    <div className="space-y-6">
      {/* Header with date picker */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Screening Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            EPS Momentum Strategy - Daily Screening Results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="date-select" className="text-sm text-slate-400">
            Date:
          </label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {dates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <MarketStatus stats={stats} isLoading={isLoading} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates table - takes 2 columns */}
        <div className="lg:col-span-2">
          <CandidatesTable candidates={candidates} isLoading={isLoading} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Portfolio */}
          <PortfolioCard entries={portfolio} isLoading={isLoading} />

          {/* Death List */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-slate-200">Death List</h3>
              <p className="text-xs text-slate-400 mt-0.5">Exited from Top 30 today</p>
            </div>
            {isLoading ? (
              <div className="p-4 animate-pulse">
                <div className="h-6 bg-slate-700 rounded" />
              </div>
            ) : exited.length > 0 ? (
              <div className="divide-y divide-slate-700/50">
                {exited.map(stock => (
                  <div
                    key={stock.ticker}
                    className="px-4 py-2.5 flex items-center justify-between"
                  >
                    <span className="text-red-400 font-semibold text-sm">{stock.ticker}</span>
                    <span className="text-xs text-slate-400">
                      Was #{stock.yesterday_rank}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 text-sm">
                No exits today.
              </div>
            )}
          </div>

          {/* Industry Distribution */}
          {stats && stats.industry_distribution && Object.keys(stats.industry_distribution).length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200">Top Industries</h3>
              </div>
              <div className="divide-y divide-slate-700/50">
                {Object.entries(stats.industry_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([industry, count]) => (
                    <div
                      key={industry}
                      className="px-4 py-2 flex items-center justify-between"
                    >
                      <span className="text-sm text-slate-300 truncate mr-2">{industry}</span>
                      <span className="text-xs text-emerald-400 font-mono bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
