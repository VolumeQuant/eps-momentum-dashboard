interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 bg-emerald-500 rounded-full" />
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
    </div>
  )
}

export default SectionHeader
