interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  let bgColor: string
  let textColor: string
  let label: string

  switch (status) {
    case '\u2705': // checkmark
      bgColor = 'bg-emerald-900/50 border-emerald-600'
      textColor = 'text-emerald-400'
      label = 'Verified'
      break
    case '\u23F3': // hourglass
      bgColor = 'bg-amber-900/50 border-amber-600'
      textColor = 'text-amber-400'
      label = 'Pending'
      break
    case '\uD83C\uDD95': // NEW
      bgColor = 'bg-blue-900/50 border-blue-600'
      textColor = 'text-blue-400'
      label = 'New'
      break
    default:
      bgColor = 'bg-slate-700 border-slate-600'
      textColor = 'text-slate-400'
      label = status
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${bgColor} ${textColor}`}
      title={label}
    >
      <span className="text-sm leading-none">{status}</span>
      <span>{label}</span>
    </span>
  )
}

export default StatusBadge
