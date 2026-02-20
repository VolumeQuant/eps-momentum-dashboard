interface VixBarProps {
  percentile: number;
}

function getPercentileColor(pct: number): string {
  if (pct < 10) return 'border-amber-400 bg-amber-400'
  if (pct < 67) return 'border-emerald-400 bg-emerald-400'
  if (pct < 80) return 'border-amber-400 bg-amber-400'
  if (pct < 90) return 'border-orange-400 bg-orange-400'
  return 'border-red-400 bg-red-400'
}

function getPercentileLabel(pct: number): string {
  if (pct < 10) return '안일'
  if (pct < 67) return '정상'
  if (pct < 80) return '경계'
  if (pct < 90) return '상승경보'
  return '위기'
}

function VixBar({ percentile }: VixBarProps) {
  const clampedPct = Math.max(0, Math.min(100, percentile))
  const indicatorColor = getPercentileColor(clampedPct)
  const label = getPercentileLabel(clampedPct)

  return (
    <div className="w-full">
      <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
        {/* Zone backgrounds */}
        <div className="absolute inset-y-0 left-0 w-[10%] bg-amber-500/20 rounded-l-full" />
        <div className="absolute inset-y-0 left-[10%] w-[57%] bg-emerald-500/20" />
        <div className="absolute inset-y-0 left-[67%] w-[13%] bg-amber-500/20" />
        <div className="absolute inset-y-0 left-[80%] w-[10%] bg-orange-500/20" />
        <div className="absolute inset-y-0 left-[90%] w-[10%] bg-red-500/20 rounded-r-full" />

        {/* Indicator dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 shadow-lg z-10 ${indicatorColor}`}
          style={{ left: `${clampedPct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-slate-500">0</span>
        <span className="text-[10px] text-slate-400 font-medium">
          {clampedPct.toFixed(0)}th pct - {label}
        </span>
        <span className="text-[10px] text-slate-500">100</span>
      </div>
    </div>
  )
}

export default VixBar
