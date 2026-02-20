import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

function formatDateKR(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[d.getDay()]
  return `${month}/${day} (${weekday})`
}

function DateSelector({ dates, selectedDate, onDateChange }: DateSelectorProps) {
  // dates are sorted DESC: [0] = latest, [length-1] = oldest
  const currentIndex = dates.indexOf(selectedDate)
  const isLatest = currentIndex === 0
  const isOldest = currentIndex >= dates.length - 1 || currentIndex < 0

  const goOlder = () => {
    if (!isOldest) {
      onDateChange(dates[currentIndex + 1])
    }
  }

  const goNewer = () => {
    if (!isLatest) {
      onDateChange(dates[currentIndex - 1])
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Calendar className="w-3.5 h-3.5 text-slate-500" />

      {/* Older (left arrow) */}
      <button
        onClick={goOlder}
        disabled={isOldest}
        className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="이전 날짜"
      >
        <ChevronLeft className="w-4 h-4 text-slate-400" />
      </button>

      {/* Date dropdown */}
      <div className="relative">
        <select
          value={selectedDate}
          onChange={e => onDateChange(e.target.value)}
          className="appearance-none bg-slate-800/80 border border-slate-700 text-slate-200 text-sm font-mono rounded-lg
                     px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50
                     cursor-pointer hover:bg-slate-700 transition-colors tabular-nums"
        >
          {dates.map((d, idx) => (
            <option key={d} value={d}>
              {d} {formatDateKR(d)}{idx === 0 ? ' (최신)' : ''}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronRight className="w-3 h-3 text-slate-500 rotate-90" />
        </div>
      </div>

      {/* Newer (right arrow) */}
      <button
        onClick={goNewer}
        disabled={isLatest}
        className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="다음 날짜"
      >
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Latest badge */}
      {isLatest && (
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
          최신
        </span>
      )}
    </div>
  )
}

export default DateSelector
