interface IndustryChartProps {
  distribution: Record<string, number>;
}

const INDUSTRY_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-indigo-500',
]

function IndustryChart({ distribution }: IndustryChartProps) {
  const sorted = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  if (sorted.length === 0) return null

  const maxCount = sorted[0][1]

  return (
    <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border-default">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-emerald-500 rounded-full" />
          <h3 className="text-sm font-semibold text-slate-100">주도 업종</h3>
          <span className="text-xs text-slate-500">Industry Distribution</span>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {sorted.map(([industry, count], idx) => {
          const widthPercent = (count / maxCount) * 100
          const colorClass = INDUSTRY_COLORS[idx % INDUSTRY_COLORS.length]

          return (
            <div key={industry} className="group cursor-default">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300 truncate max-w-[160px]" title={industry}>
                  {industry}
                </span>
                <span className="text-xs font-mono text-slate-400 font-medium ml-2">
                  {count}
                </span>
              </div>
              <div className="h-5 w-full bg-slate-800 rounded overflow-hidden">
                <div
                  className={`h-full rounded ${colorClass} opacity-70 group-hover:opacity-100 transition-all`}
                  style={{
                    width: `${widthPercent}%`,
                    transition: 'width 0.6s ease-out',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default IndustryChart
