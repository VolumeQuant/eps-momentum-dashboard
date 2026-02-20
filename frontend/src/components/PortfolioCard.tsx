import { Link } from 'react-router-dom'
import type { PortfolioEntry } from '../types'

interface PortfolioCardProps {
  entries: PortfolioEntry[];
  isLoading: boolean;
}

function getActionColor(action: string): string {
  switch (action) {
    case 'enter': return 'text-emerald-400 bg-emerald-900/40 border-emerald-700'
    case 'hold': return 'text-blue-400 bg-blue-900/40 border-blue-700'
    case 'exit': return 'text-red-400 bg-red-900/40 border-red-700'
    default: return 'text-slate-400 bg-slate-800 border-slate-700'
  }
}

function getReturnColor(pct: number | null): string {
  if (pct === null) return 'text-slate-400'
  if (pct > 0) return 'text-emerald-400'
  if (pct < 0) return 'text-red-400'
  return 'text-slate-400'
}

function PortfolioCard({ entries, isLoading }: PortfolioCardProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Current Portfolio</h3>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    )
  }

  const activeEntries = entries.filter(e => e.action !== 'exit')
  const exitEntries = entries.filter(e => e.action === 'exit')

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Current Portfolio</h3>
        <Link
          to="/portfolio"
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          View Full History
        </Link>
      </div>

      {activeEntries.length > 0 ? (
        <div className="divide-y divide-slate-700/50">
          {activeEntries.map(entry => {
            const unrealizedPct = entry.entry_price > 0
              ? ((entry.price - entry.entry_price) / entry.entry_price) * 100
              : null
            return (
              <div key={`${entry.date}-${entry.ticker}`} className="px-4 py-3 flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getActionColor(entry.action)}`}>
                  {entry.action.toUpperCase()}
                </span>
                <Link
                  to={`/ticker/${entry.ticker}`}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors min-w-[60px]"
                >
                  {entry.ticker}
                </Link>
                <div className="flex-1 flex items-center gap-4 text-xs text-slate-400">
                  <span>Wt: {(entry.weight * 100).toFixed(0)}%</span>
                  <span>Entry: ${entry.entry_price.toFixed(2)}</span>
                  <span>Now: ${entry.price.toFixed(2)}</span>
                </div>
                <span className={`text-sm font-mono font-semibold ${getReturnColor(unrealizedPct)}`}>
                  {unrealizedPct !== null
                    ? `${unrealizedPct > 0 ? '+' : ''}${unrealizedPct.toFixed(1)}%`
                    : '-'}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-slate-400 text-sm">
          No active portfolio positions.
        </div>
      )}

      {exitEntries.length > 0 && (
        <>
          <div className="px-4 py-2 bg-slate-750 border-t border-slate-700">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Exited Today</span>
          </div>
          <div className="divide-y divide-slate-700/50">
            {exitEntries.map(entry => (
              <div key={`${entry.date}-${entry.ticker}-exit`} className="px-4 py-2 flex items-center gap-3 bg-slate-800/50">
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getActionColor('exit')}`}>
                  EXIT
                </span>
                <span className="text-slate-300 font-semibold text-sm min-w-[60px]">
                  {entry.ticker}
                </span>
                <div className="flex-1 text-xs text-slate-400">
                  Entry: ${entry.entry_price.toFixed(2)} | Exit: ${(entry.exit_price ?? entry.price).toFixed(2)}
                </div>
                <span className={`text-sm font-mono font-semibold ${getReturnColor(entry.return_pct)}`}>
                  {entry.return_pct !== null
                    ? `${entry.return_pct > 0 ? '+' : ''}${entry.return_pct.toFixed(1)}%`
                    : '-'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default PortfolioCard
