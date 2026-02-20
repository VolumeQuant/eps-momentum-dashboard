import { Link } from 'react-router-dom'
import type { PortfolioEntry } from '../types'
import { ArrowRight } from 'lucide-react'

interface PortfolioCardProps {
  entries: PortfolioEntry[];
  isLoading: boolean;
}

function getActionBadge(action: string) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    enter: { bg: 'bg-emerald-600/20', text: 'text-emerald-400', border: 'border-emerald-600/30' },
    hold: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-600/30' },
    exit: { bg: 'bg-red-600/20', text: 'text-red-400', border: 'border-red-600/30' },
  }
  const s = styles[action] || { bg: 'bg-slate-700', text: 'text-slate-400', border: 'border-slate-600' }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.bg} ${s.text} ${s.border}`}>
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

function PortfolioCardSkeleton() {
  return (
    <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border-default">
        <div className="h-5 w-40 bg-slate-700/50 rounded animate-pulse" />
      </div>
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    </div>
  )
}

function PortfolioCard({ entries, isLoading }: PortfolioCardProps) {
  if (isLoading) return <PortfolioCardSkeleton />

  const activeEntries = entries.filter(e => e.action !== 'exit')
  const exitEntries = entries.filter(e => e.action === 'exit')

  // Calculate total unrealized
  const totalUnrealized = activeEntries.reduce((sum, e) => {
    if (e.entry_price > 0) {
      const pct = ((e.price - e.entry_price) / e.entry_price) * 100
      return sum + pct * (e.weight || 0.2)
    }
    return sum
  }, 0)

  return (
    <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-emerald-500 rounded-full" />
          <h3 className="text-sm font-semibold text-slate-100">오늘의 포트폴리오</h3>
          <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
            5종목 균등
          </span>
        </div>
        <Link
          to="/portfolio"
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          상세보기
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stock cards */}
      {activeEntries.length > 0 ? (
        <div className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2.5">
            {activeEntries.map(entry => {
              const unrealizedPct = entry.entry_price > 0
                ? ((entry.price - entry.entry_price) / entry.entry_price) * 100
                : null
              return (
                <Link
                  key={`${entry.date}-${entry.ticker}`}
                  to={`/ticker/${entry.ticker}`}
                  className="bg-surface-deep border border-border-default rounded-xl p-3.5
                           hover:border-emerald-500/40 transition-all cursor-pointer group"
                >
                  {/* Action badge */}
                  <div className="mb-2">
                    {getActionBadge(entry.action)}
                  </div>

                  {/* Ticker */}
                  <div className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {entry.ticker}
                  </div>

                  {/* Weight */}
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {(entry.weight * 100).toFixed(0)}% | ${entry.price.toFixed(2)}
                  </div>

                  {/* Return */}
                  <div className={`text-lg font-bold font-mono tabular-nums mt-2 ${getReturnColor(unrealizedPct)}`}>
                    {unrealizedPct !== null
                      ? `${unrealizedPct > 0 ? '+' : ''}${unrealizedPct.toFixed(1)}%`
                      : '--'}
                  </div>

                  {/* Entry info */}
                  <div className="text-[10px] text-slate-600 mt-1">
                    진입: ${entry.entry_price.toFixed(2)}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Total unrealized */}
          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between px-1">
            <span className="text-xs text-slate-400">포트폴리오 수익률</span>
            <span className={`text-sm font-bold font-mono tabular-nums ${getReturnColor(totalUnrealized)}`}>
              {totalUnrealized > 0 ? '+' : ''}{totalUnrealized.toFixed(2)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-slate-500 text-sm">
          현재 보유 종목이 없습니다.
        </div>
      )}

      {/* Exited stocks */}
      {exitEntries.length > 0 && (
        <div className="border-t border-border-default">
          <div className="px-4 py-2 bg-slate-800/30">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">오늘 퇴출 ({exitEntries.length}종목)</span>
          </div>
          <div className="divide-y divide-border-subtle">
            {exitEntries.map(entry => (
              <div key={`${entry.date}-${entry.ticker}-exit`} className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActionBadge('exit')}
                  <span className="text-sm text-slate-400 line-through">{entry.ticker}</span>
                </div>
                <span className={`text-xs font-mono font-semibold tabular-nums ${getReturnColor(entry.return_pct)}`}>
                  {entry.return_pct !== null
                    ? `${entry.return_pct > 0 ? '+' : ''}${entry.return_pct.toFixed(1)}%`
                    : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioCard
