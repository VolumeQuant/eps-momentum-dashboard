import { Search, Target, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react'

interface ScreeningStatsProps {
  stats: {
    total_screened: number;
    total_eligible: number;
    top30_count: number;
    verified_count: number;
    new_count: number;
  } | null;
  isLoading: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  accentColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, accentColor, borderColor, icon }: StatCardProps) {
  return (
    <div className={`bg-surface-default border border-border-default rounded-xl p-4 ${borderColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`${accentColor} opacity-70`}>
          {icon}
        </div>
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <span className={`text-2xl font-bold font-mono tabular-nums ${accentColor}`}>{value}</span>
      <span className="text-xs text-slate-500 ml-1">종목</span>
    </div>
  )
}

function FunnelSummary({ stats }: { stats: { total_screened: number; total_eligible: number; top30_count: number; verified_count: number } }) {
  const steps = [
    { value: stats.total_screened, label: '전체', color: 'text-blue-400' },
    { value: stats.total_eligible, label: '적격', color: 'text-cyan-400' },
    { value: stats.top30_count, label: 'Top 30', color: 'text-cyan-400' },
    { value: stats.verified_count, label: '검증', color: 'text-emerald-400' },
  ]

  return (
    <div className="col-span-2 sm:col-span-4 bg-surface-default border border-border-default rounded-xl px-4 py-3">
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mr-1 hidden sm:inline">Pipeline</span>
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1">
              <span className={`text-sm sm:text-base font-bold font-mono tabular-nums ${step.color}`}>
                {step.value.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreeningStats({ stats, isLoading }: ScreeningStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-default border border-border-default rounded-xl p-4 animate-pulse">
            <div className="h-3 bg-slate-700/50 rounded w-20 mb-3" />
            <div className="h-7 bg-slate-700/50 rounded w-14" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Funnel Summary — spans full width */}
      <FunnelSummary stats={stats} />

      <StatCard
        label="전체 스크리닝"
        value={stats.total_screened.toLocaleString()}
        accentColor="text-blue-400"
        borderColor="border-t-2 border-t-blue-500/50"
        icon={<Search className="w-3.5 h-3.5" />}
      />
      <StatCard
        label="Top 30"
        value={stats.top30_count}
        accentColor="text-cyan-400"
        borderColor="border-t-2 border-t-cyan-500/50"
        icon={<Target className="w-3.5 h-3.5" />}
      />
      <StatCard
        label="검증 완료"
        value={stats.verified_count}
        accentColor="text-emerald-400"
        borderColor="border-t-2 border-t-emerald-500/50"
        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
      />
      <StatCard
        label="신규 진입"
        value={stats.new_count}
        accentColor="text-amber-400"
        borderColor="border-t-2 border-t-amber-500/50"
        icon={<Sparkles className="w-3.5 h-3.5" />}
      />
    </div>
  )
}

export default ScreeningStats
