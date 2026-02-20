interface TrendIconProps {
  seg1: number;
  seg2: number;
  seg3: number;
  seg4: number;
}

function getWeatherIcon(change: number): string {
  if (change > 20) return '\uD83D\uDD25'   // fire
  if (change > 5) return '\u2600\uFE0F'     // sun
  if (change > 1) return '\uD83C\uDF24\uFE0F' // sun behind small cloud
  if (change > -1) return '\u2601\uFE0F'    // cloud
  return '\uD83C\uDF27\uFE0F'               // rain
}

function getWeatherLabel(change: number): string {
  if (change > 20) return 'Hot'
  if (change > 5) return 'Warm'
  if (change > 1) return 'Mild'
  if (change > -1) return 'Flat'
  return 'Cold'
}

function TrendIcon({ seg1, seg2, seg3, seg4 }: TrendIconProps) {
  const segments = [
    { label: 'S1', value: seg1 },
    { label: 'S2', value: seg2 },
    { label: 'S3', value: seg3 },
    { label: 'S4', value: seg4 },
  ]

  return (
    <div className="flex items-center gap-0.5" title={
      segments.map(s => `${s.label}: ${s.value > 0 ? '+' : ''}${s.value.toFixed(1)}% (${getWeatherLabel(s.value)})`).join('\n')
    }>
      {segments.map((s, i) => (
        <span key={i} className="text-base leading-none">
          {getWeatherIcon(s.value)}
        </span>
      ))}
    </div>
  )
}

export default TrendIcon
