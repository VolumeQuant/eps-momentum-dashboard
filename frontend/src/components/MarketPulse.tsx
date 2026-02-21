import type { MarketStatus } from '../types'
import SignalDots from './SignalDots'
import VixBar from './VixBar'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MarketPulseProps {
  market: MarketStatus | null;
  isLoading: boolean;
}

function getSeasonInfo(quadrant: string | undefined): {
  icon: string;
  name: string;
  color: string;
  gradientFrom: string;
  textColor: string;
} {
  switch (quadrant) {
    case 'Q1':
      return {
        icon: '\uD83C\uDF38',
        name: '\uBD04 (회복국면)',
        color: 'season-spring',
        gradientFrom: 'from-pink-500/8',
        textColor: 'text-pink-300',
      }
    case 'Q2':
      return {
        icon: '\u2600\uFE0F',
        name: '\uC5EC\uB984 (확장국면)',
        color: 'season-summer',
        gradientFrom: 'from-amber-500/8',
        textColor: 'text-amber-300',
      }
    case 'Q3':
      return {
        icon: '\uD83C\uDF42',
        name: '\uAC00\uC744 (둔화국면)',
        color: 'season-autumn',
        gradientFrom: 'from-orange-500/8',
        textColor: 'text-orange-300',
      }
    case 'Q4':
      return {
        icon: '\u2744\uFE0F',
        name: '\uACA8\uC6B8 (수축국면)',
        color: 'season-winter',
        gradientFrom: 'from-blue-500/8',
        textColor: 'text-blue-300',
      }
    default:
      return {
        icon: '\uD83D\uDCC8',
        name: '\uBD84\uC11D \uC911',
        color: 'slate',
        gradientFrom: 'from-slate-500/5',
        textColor: 'text-slate-300',
      }
  }
}

function getActionStyle(action: string): string {
  const lower = action.toLowerCase()
  if (lower.includes('적극') || lower.includes('매수') || lower.includes('투자'))
    return 'text-emerald-300'
  if (lower.includes('중단') || lower.includes('줄이기') || lower.includes('위험') || lower.includes('매도'))
    return 'text-red-300'
  return 'text-amber-300'
}

function MarketPulseSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-default bg-surface-default animate-pulse">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg" />
            <div>
              <div className="h-6 w-40 bg-slate-700/50 rounded mb-1" />
              <div className="h-4 w-20 bg-slate-700/50 rounded" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <div className="w-5 h-5 bg-slate-700/50 rounded-full" />
              <div className="w-5 h-5 bg-slate-700/50 rounded-full" />
            </div>
            <div className="h-3 w-16 bg-slate-700/50 rounded" />
          </div>
        </div>
        <div className="h-5 w-64 bg-slate-700/50 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-800/50 rounded-xl" />
          <div className="h-24 bg-slate-800/50 rounded-xl" />
          <div className="h-24 bg-slate-800/50 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function MarketPulse({ market, isLoading }: MarketPulseProps) {
  if (isLoading) return <MarketPulseSkeleton />
  if (!market) return null

  const season = getSeasonInfo(market.hy?.quadrant)
  const actionStyle = getActionStyle(market.final_action || '')

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-default bg-surface-default animate-fade-in">
      {/* Season gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${season.gradientFrom} via-transparent to-transparent pointer-events-none`} />

      <div className="relative p-5 sm:p-6">
        {/* Top row: Season + Signal */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none">{season.icon}</span>
            <div>
              <h2 className={`text-xl font-bold ${season.textColor}`}>{season.name}</h2>
              <span className="text-sm text-slate-400">
                {market.hy ? `${market.hy.q_days}일째` : '-'}
              </span>
            </div>
          </div>
          <SignalDots
            hyOk={market.signal_dots?.hy_ok ?? true}
            vixOk={market.signal_dots?.vix_ok ?? true}
          />
        </div>

        {/* Final action + portfolio mode */}
        <div className="flex items-center gap-3 mb-5">
          <p className={`text-base font-medium ${actionStyle}`}>
            {market.final_action || '시장 데이터를 분석 중입니다.'}
          </p>
          {market.portfolio_mode && market.portfolio_mode !== 'normal' && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              market.portfolio_mode === 'stop'
                ? 'bg-red-600/20 text-red-400 border-red-600/30'
                : market.portfolio_mode === 'reduced'
                  ? 'bg-amber-600/20 text-amber-400 border-amber-600/30'
                  : 'bg-amber-600/15 text-amber-300 border-amber-600/20'
            }`}>
              {market.portfolio_mode === 'stop' ? '매수중단' : market.portfolio_mode === 'reduced' ? 'Top 3' : '주의'}
            </span>
          )}
        </div>

        {/* Sub-cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* HY Spread card */}
          <div className="bg-surface-deep border border-border-default rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">HY Spread</span>
            </div>
            {market.hy ? (
              <>
                <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                  {market.hy.hy_spread.toFixed(2)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {market.hy.quadrant_label}
                  {market.hy.direction === 'warn' ? ' \u00B7 경고' : ' \u00B7 안정'}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">데이터 없음</div>
            )}
          </div>

          {/* VIX card */}
          <div className="bg-surface-deep border border-border-default rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">VIX</span>
            </div>
            {market.vix ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                    {market.vix.vix_current.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {market.vix.regime_label}
                  </span>
                </div>
                <div className="mt-2">
                  <VixBar percentile={market.vix.vix_percentile} />
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">데이터 없음</div>
            )}
          </div>

          {/* Market Indices card */}
          <div className="bg-surface-deep border border-border-default rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">시장 지수</span>
            </div>
            {market.indices && market.indices.length > 0 ? (
              <div className="space-y-2">
                {market.indices.map((idx) => {
                  const isPositive = idx.change_pct >= 0
                  return (
                    <div key={idx.symbol} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 w-12">{idx.name}</span>
                      <span className="text-sm font-mono text-slate-200 tabular-nums">
                        {idx.close.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold tabular-nums ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : idx.change_pct < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {isPositive ? '+' : ''}{idx.change_pct.toFixed(2)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500">데이터 없음</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketPulse
