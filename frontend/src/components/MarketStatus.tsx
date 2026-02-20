interface MarketStatusProps {
  stats: {
    total_screened: number;
    total_eligible: number;
    top30_count: number;
    verified_count: number;
    new_count: number;
  } | null;
  isLoading: boolean;
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  )
}

function MarketStatus({ stats, isLoading }: MarketStatusProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 animate-pulse">
            <div className="h-3 bg-slate-700 rounded w-20 mb-2" />
            <div className="h-7 bg-slate-700 rounded w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        label="Total Screened"
        value={stats.total_screened.toLocaleString()}
        color="text-slate-200"
      />
      <StatCard
        label="Eligible"
        value={stats.total_eligible.toLocaleString()}
        color="text-blue-400"
      />
      <StatCard
        label="Top 30"
        value={stats.top30_count}
        color="text-purple-400"
      />
      <StatCard
        label="Verified"
        value={stats.verified_count}
        color="text-emerald-400"
      />
      <StatCard
        label="New Entries"
        value={stats.new_count}
        color="text-amber-400"
      />
    </div>
  )
}

export default MarketStatus
