interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  let bgColor: string
  let textColor: string
  let label: string
  let emoji: string

  switch (status) {
    case '\u2705': // checkmark
      bgColor = 'bg-emerald-500/15 border-emerald-500/30'
      textColor = 'text-emerald-400'
      label = '검증'
      emoji = '\u2705'
      break
    case '\u23F3': // hourglass
      bgColor = 'bg-amber-500/15 border-amber-500/30'
      textColor = 'text-amber-400'
      label = '대기'
      emoji = '\u23F3'
      break
    case '\uD83C\uDD95': // NEW
      bgColor = 'bg-blue-500/15 border-blue-500/30'
      textColor = 'text-blue-400'
      label = '신규'
      emoji = '\uD83C\uDD95'
      break
    default:
      bgColor = 'bg-slate-700/50 border-slate-600/50'
      textColor = 'text-slate-400'
      label = status
      emoji = ''
  }

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[11px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5'

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${bgColor} ${textColor} ${sizeClasses}`}
    >
      {emoji && <span className="text-xs leading-none">{emoji}</span>}
      <span>{label}</span>
    </span>
  )
}

export default StatusBadge
