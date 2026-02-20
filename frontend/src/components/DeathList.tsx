import type { ExitedStock } from '../types'
import { ArrowDownRight, TrendingDown } from 'lucide-react'

interface DeathListProps {
  exited: ExitedStock[];
  isLoading: boolean;
}

function DeathListSkeleton() {
  return (
    <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border-default">
        <div className="h-5 w-32 bg-slate-700/50 rounded animate-pulse" />
      </div>
      <div className="p-4">
        <div className="h-6 bg-slate-700/50 rounded animate-pulse" />
      </div>
    </div>
  )
}

function RankTrajectory({ rankHistory }: { rankHistory: string }) {
  // rankHistory is like "8→10→12→OUT" or "3→5→OUT"
  const parts = rankHistory.split('\u2192')
  if (parts.length < 2) return null

  return (
    <div className="flex items-center gap-0.5 mt-1">
      {parts.map((part, i) => {
        const trimmed = part.trim()
        const isOut = trimmed === 'OUT' || trimmed === '-'
        const rank = parseInt(trimmed, 10)
        const isNumber = !isNaN(rank)

        // Mini bar height based on rank (lower rank = taller bar = better)
        const barHeight = isOut ? 2 : isNumber ? Math.max(4, Math.min(16, 20 - rank * 0.5)) : 4

        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className={`w-2.5 rounded-sm ${isOut ? 'bg-red-400/60' : rank <= 10 ? 'bg-emerald-400/60' : rank <= 20 ? 'bg-amber-400/60' : 'bg-slate-500/60'}`}
              style={{ height: `${barHeight}px` }}
            />
            {i < parts.length - 1 && (
              <span className="text-[7px] text-slate-600 sr-only">{'\u2192'}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function DeathList({ exited, isLoading }: DeathListProps) {
  if (isLoading) return <DeathListSkeleton />

  return (
    <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-default">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-slate-500 rounded-full" />
          <h3 className="text-sm font-semibold text-slate-100">이탈 종목</h3>
          <span className="text-xs text-slate-500">Death List</span>
          {exited.length > 0 && (
            <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
              {exited.length}종목
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mt-1 ml-4">
          어제 후보에서 오늘 빠진 종목
        </p>
      </div>

      {exited.length > 0 ? (
        <div className="divide-y divide-border-subtle">
          {exited.map(stock => (
            <div
              key={stock.ticker}
              className="px-4 py-3 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ArrowDownRight className="w-3.5 h-3.5 text-red-400/70" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-300 font-semibold">{stock.ticker}</span>
                      {stock.short_name && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{stock.short_name}</span>
                      )}
                    </div>
                    {stock.industry_kr && (
                      <span className="text-[10px] text-slate-600">{stock.industry_kr}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums">
                    <TrendingDown className="w-3 h-3 text-red-400/60" />
                    <span className="text-slate-400">#{stock.prev_rank}</span>
                    <span className="text-slate-600">{'\u2192'}</span>
                    <span className="text-red-400 font-semibold">OUT</span>
                  </span>
                  {stock.current_rank && (
                    <span className="text-[10px] text-slate-600">
                      현재 #{stock.current_rank}
                    </span>
                  )}
                </div>
              </div>
              {/* Rank trajectory visualization */}
              {stock.rank_history && (
                <div className="mt-1.5 ml-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 font-mono tabular-nums">{stock.rank_history}</span>
                    <RankTrajectory rankHistory={stock.rank_history} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-5 text-center">
          <p className="text-sm text-slate-500">
            오늘은 이탈 종목이 없어요.
          </p>
          <p className="text-xs text-slate-600 mt-1">안정적인 시장이에요</p>
        </div>
      )}
    </div>
  )
}

export default DeathList
