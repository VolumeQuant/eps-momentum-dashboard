interface TrendIconProps {
  seg1: number;
  seg2: number;
  seg3: number;
  seg4: number;
}

function getWeatherLabel(change: number): string {
  if (change > 20) return 'Hot'
  if (change > 5) return 'Warm'
  if (change > 1) return 'Mild'
  if (change > -1) return 'Flat'
  return 'Cold'
}

function getBarColor(val: number): string {
  if (val > 20) return 'bg-emerald-400'
  if (val > 5) return 'bg-emerald-300'
  if (val > 1) return 'bg-emerald-200/60'
  if (val > -1) return 'bg-slate-600'
  return 'bg-red-400'
}

function TrendIcon({ seg1, seg2, seg3, seg4 }: TrendIconProps) {
  const segments = [
    { label: 'S1 (90d)', value: seg1 },
    { label: 'S2 (60d)', value: seg2 },
    { label: 'S3 (30d)', value: seg3 },
    { label: 'S4 (now)', value: seg4 },
  ]

  const tooltipText = segments
    .map(s => `${s.label}: ${s.value > 0 ? '+' : ''}${s.value.toFixed(1)}% ${getWeatherLabel(s.value)}`)
    .join('\n')

  return (
    <div
      className="flex gap-[3px] items-end h-5 cursor-default"
      title={tooltipText}
    >
      {segments.map((s, i) => {
        const height = Math.min(Math.max(Math.abs(s.value) * 1.2 + 4, 4), 20)
        return (
          <div
            key={i}
            className={`w-[5px] rounded-sm transition-all ${getBarColor(s.value)}`}
            style={{ height: `${height}px` }}
          />
        )
      })}
    </div>
  )
}

export default TrendIcon
