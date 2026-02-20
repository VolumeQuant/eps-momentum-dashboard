interface SignalDotsProps {
  hyOk: boolean;
  vixOk: boolean;
}

function getOverallLabel(hyOk: boolean, vixOk: boolean): { label: string; colorClass: string } {
  if (hyOk && vixOk) return { label: '2/2 안정', colorClass: 'text-emerald-400' }
  if (!hyOk && !vixOk) return { label: '위험 신호', colorClass: 'text-red-400' }
  return { label: '엇갈린 신호', colorClass: 'text-amber-400' }
}

function SignalPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
        ok
          ? 'bg-emerald-500/15 border-emerald-500/30'
          : 'bg-red-500/15 border-red-500/30'
      }`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          ok
            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
            : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'
        }`}
      />
      <span
        className={`text-[10px] font-bold tracking-wider ${
          ok ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        {label} {ok ? '안정' : '경고'}
      </span>
    </div>
  )
}

function SignalDots({ hyOk, vixOk }: SignalDotsProps) {
  const overall = getOverallLabel(hyOk, vixOk)

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <SignalPill ok={hyOk} label="HY" />
        <SignalPill ok={vixOk} label="VIX" />
      </div>
      <span className={`text-xs font-medium ${overall.colorClass}`}>{overall.label}</span>
    </div>
  )
}

export default SignalDots
