import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Candidate } from '../types'
import TrendIcon from './TrendIcon'
import StatusBadge from './StatusBadge'
import { ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, Calendar, BarChart2, TrendingDown } from 'lucide-react'

interface CandidatesTableProps {
  candidates: Candidate[];
  isLoading: boolean;
}

type SortKey = 'part2_rank' | 'composite_rank' | 'adj_score' | 'adj_gap' | 'rev_growth' | 'price' | 'fwd_pe';
type SortDir = 'asc' | 'desc';

function formatNumber(val: number | null | undefined, decimals: number = 1): string {
  if (val === null || val === undefined) return '-'
  return val.toFixed(decimals)
}

function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(1)}%`
}

function getGapColor(gap: number): string {
  if (gap <= -10) return 'text-emerald-400'
  if (gap <= -5) return 'text-emerald-300'
  if (gap <= 0) return 'text-green-400'
  if (gap <= 5) return 'text-amber-400'
  return 'text-red-400'
}

function getGapCellBg(gap: number): string {
  // FINVIZ heatmap style: stronger negative = greener background, positive = red tint
  if (gap <= -15) return 'bg-emerald-500/20'
  if (gap <= -10) return 'bg-emerald-500/12'
  if (gap <= -5)  return 'bg-emerald-500/8'
  if (gap <= 0)   return ''
  if (gap <= 5)   return ''
  if (gap <= 10)  return 'bg-amber-500/8'
  return 'bg-red-500/12'
}

function getScoreColor(score: number): string {
  if (score >= 25) return 'text-emerald-400'
  if (score >= 15) return 'text-green-400'
  if (score >= 10) return 'text-amber-400'
  return 'text-slate-400'
}

function getScoreCellBg(score: number): string {
  // High score = green tint background
  if (score >= 30) return 'bg-emerald-500/15'
  if (score >= 20) return 'bg-emerald-500/8'
  if (score >= 15) return 'bg-emerald-500/5'
  return ''
}

function getRiskIcons(candidate: Candidate): { icon: React.ReactNode; title: string }[] {
  const flags: { icon: React.ReactNode; title: string }[] = []

  if (candidate.fwd_pe && candidate.fwd_pe > 100) {
    flags.push({ icon: <AlertTriangle className="w-3 h-3 text-amber-400" />, title: `고평가 (Fwd P/E: ${candidate.fwd_pe.toFixed(1)})` })
  }
  if (candidate.num_analysts < 3) {
    flags.push({ icon: <BarChart2 className="w-3 h-3 text-amber-400" />, title: `저커버리지 (${candidate.num_analysts}명)` })
  }
  if (candidate.rev_down30 > 0) {
    const total = candidate.rev_up30 + candidate.rev_down30
    if (total > 0 && (candidate.rev_down30 / total) > 0.3) {
      flags.push({ icon: <TrendingDown className="w-3 h-3 text-amber-400" />, title: `매출 하향 >30%` })
    }
  }
  if (candidate.risk_flags && candidate.risk_flags.includes('earnings_soon')) {
    flags.push({ icon: <Calendar className="w-3 h-3 text-amber-400" />, title: '실적발표 임박' })
  }

  return flags
}

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  align = 'right',
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const isActive = currentSort === sortKey
  const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'

  return (
    <th
      className="px-3 py-3 cursor-pointer select-none hover:text-slate-200 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${alignClass}`}>
        <span>{label}</span>
        {isActive ? (
          currentDir === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-emerald-400" />
          ) : (
            <ArrowDown className="w-3 h-3 text-emerald-400" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </div>
    </th>
  )
}

function CandidatesTableSkeleton() {
  return (
    <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border-default">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-emerald-500 rounded-full" />
          <div className="h-5 w-40 bg-slate-700/50 rounded animate-pulse" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="w-8 h-8 bg-slate-700/50 rounded-full" />
            <div className="h-4 w-16 bg-slate-700/50 rounded" />
            <div className="h-4 w-12 bg-slate-700/50 rounded" />
            <div className="flex-1 h-4 bg-slate-700/50 rounded" />
            <div className="h-4 w-16 bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function CandidatesTable({ candidates, isLoading }: CandidatesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('part2_rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'part2_rank' ? 'asc' : 'desc')
    }
  }

  const sorted = useMemo(() => {
    if (!candidates) return []
    const arr = [...candidates]
    arr.sort((a, b) => {
      let aVal: number
      let bVal: number

      switch (sortKey) {
        case 'part2_rank':
          aVal = a.part2_rank
          bVal = b.part2_rank
          break
        case 'composite_rank':
          aVal = a.composite_rank ?? 9999
          bVal = b.composite_rank ?? 9999
          break
        case 'adj_score':
          aVal = a.adj_score
          bVal = b.adj_score
          break
        case 'adj_gap':
          aVal = a.adj_gap
          bVal = b.adj_gap
          break
        case 'rev_growth':
          aVal = a.rev_growth ?? -9999
          bVal = b.rev_growth ?? -9999
          break
        case 'price':
          aVal = a.price
          bVal = b.price
          break
        case 'fwd_pe':
          aVal = a.fwd_pe ?? 9999
          bVal = b.fwd_pe ?? 9999
          break
        default:
          aVal = a.part2_rank
          bVal = b.part2_rank
      }

      const diff = aVal - bVal
      return sortDir === 'asc' ? diff : -diff
    })
    return arr
  }, [candidates, sortKey, sortDir])

  // Group by status
  const groups = useMemo(() => {
    const verified = sorted.filter(c => c.status_3d === '\u2705')
    const pending = sorted.filter(c => c.status_3d === '\u23F3')
    const newEntries = sorted.filter(c => c.status_3d === '\uD83C\uDD95')
    return [
      { label: '검증 완료', sublabel: '3일 연속 확인', items: verified, statusEmoji: '\u2705' },
      { label: '검증 대기', sublabel: '확인 중', items: pending, statusEmoji: '\u23F3' },
      { label: '신규 진입', sublabel: '오늘 처음', items: newEntries, statusEmoji: '\uD83C\uDD95' },
    ].filter(g => g.items.length > 0)
  }, [sorted])

  if (isLoading) return <CandidatesTableSkeleton />

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h2 className="text-lg font-semibold text-slate-100">매수 후보</h2>
          </div>
        </div>
        <div className="p-8 text-center text-slate-500 text-sm">
          이 날짜에 매수 후보가 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden animate-fade-in">
      {/* Section header */}
      <div className="p-4 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-emerald-500 rounded-full" />
          <h2 className="text-lg font-semibold text-slate-100">매수 후보</h2>
          <span className="text-xs text-slate-500">Buy Candidates</span>
        </div>
        <span className="text-xs text-slate-500">
          Top {sorted.length} | composite: adj_gap 70% + rev 30%
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default text-slate-400 text-xs uppercase tracking-wider">
              <SortHeader label="#" sortKey="part2_rank" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="center" />
              <th className="px-3 py-3 text-left">상태</th>
              <th className="px-3 py-3 text-left">종목명</th>
              <th className="px-3 py-3 text-left">업종</th>
              <SortHeader label="현재가" sortKey="price" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Adj Score" sortKey="adj_score" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Adj Gap" sortKey="adj_gap" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="매출성장" sortKey="rev_growth" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Composite" sortKey="composite_rank" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <th className="px-3 py-3 text-center">추세</th>
              <th className="px-3 py-3 text-left">순위이력</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <GroupedRows key={group.statusEmoji} group={group} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="lg:hidden">
        {groups.map(group => (
          <div key={group.statusEmoji}>
            <div className="px-4 py-2.5 bg-slate-800/50 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={group.statusEmoji} />
                <span className="text-xs text-slate-400">{group.items.length}종목</span>
              </div>
            </div>
            <div className="divide-y divide-border-subtle">
              {group.items.map(c => (
                <MobileCandidateCard key={c.ticker} candidate={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupedRows({ group }: { group: { label: string; sublabel: string; items: Candidate[]; statusEmoji: string } }) {
  return (
    <>
      {/* Group header row */}
      <tr className="bg-slate-800/30">
        <td colSpan={11} className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            <StatusBadge status={group.statusEmoji} size="md" />
            <span className="text-xs text-slate-400">{group.sublabel}</span>
            <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
              {group.items.length}종목
            </span>
          </div>
        </td>
      </tr>
      {/* Data rows */}
      {group.items.map((c) => (
        <CandidateRow key={c.ticker} candidate={c} />
      ))}
    </>
  )
}

function CandidateRow({ candidate: c }: { candidate: Candidate }) {
  const isTopFive = c.part2_rank <= 5
  const isBuffer = c.part2_rank > 20
  const riskIcons = getRiskIcons(c)
  const industry = c.industry_kr || c.industry || '-'

  return (
    <tr
      className={`
        group transition-all duration-150 cursor-pointer
        hover:bg-surface-hover hover:shadow-lg hover:shadow-emerald-500/5
        ${isTopFive ? 'bg-gradient-to-r from-emerald-500/5 to-transparent border-l-2 border-l-emerald-500' : ''}
        ${isBuffer ? 'opacity-60' : ''}
      `}
    >
      {/* Rank */}
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-mono ${
          isTopFive
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : c.part2_rank <= 20
              ? 'text-slate-300'
              : 'text-slate-500'
        }`}>
          {c.part2_rank}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-2.5">
        <StatusBadge status={c.status_3d} />
      </td>

      {/* Ticker + Name */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div>
            <Link
              to={`/ticker/${c.ticker}`}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors text-sm"
            >
              {c.ticker}
            </Link>
            {c.short_name && (
              <div className="text-[11px] text-slate-500 truncate max-w-[100px]">
                {c.short_name}
              </div>
            )}
          </div>
          {riskIcons.length > 0 && (
            <div className="flex items-center gap-0.5">
              {riskIcons.map((r, i) => (
                <span key={i} title={r.title}>{r.icon}</span>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* Industry */}
      <td className="px-3 py-2.5">
        <span className="text-xs text-slate-400 truncate block max-w-[120px]" title={industry}>
          {industry}
        </span>
      </td>

      {/* Price */}
      <td className="px-3 py-2.5 text-right font-mono text-slate-200 tabular-nums text-sm">
        ${c.price.toFixed(2)}
      </td>

      {/* Adj Score */}
      <td className={`px-3 py-2.5 text-right font-mono font-semibold tabular-nums ${getScoreColor(c.adj_score)} ${getScoreCellBg(c.adj_score)}`}>
        {formatNumber(c.adj_score)}
      </td>

      {/* Adj Gap */}
      <td className={`px-3 py-2.5 text-right font-mono font-semibold tabular-nums ${getGapColor(c.adj_gap)} ${getGapCellBg(c.adj_gap)}`}>
        {formatPercent(c.adj_gap)}
      </td>

      {/* Rev Growth */}
      <td className={`px-3 py-2.5 text-right font-mono tabular-nums text-sm ${
        c.rev_growth !== null && c.rev_growth > 0 ? 'text-emerald-400' : c.rev_growth !== null && c.rev_growth < 0 ? 'text-red-400' : 'text-slate-500'
      }`}>
        {c.rev_growth !== null ? formatPercent(c.rev_growth) : '-'}
      </td>

      {/* Composite Rank */}
      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm text-slate-400"
          title={`Composite 순위: adj_gap(70%) + 매출성장(30%) 기준`}>
        {c.composite_rank != null ? `#${c.composite_rank}` : '-'}
      </td>

      {/* Trend */}
      <td className="px-3 py-2.5 text-center">
        <div className="flex justify-center">
          <TrendIcon seg1={c.seg1} seg2={c.seg2} seg3={c.seg3} seg4={c.seg4} />
        </div>
      </td>

      {/* Rank History + Tag */}
      <td className="px-3 py-2.5 text-xs text-slate-400 font-mono tabular-nums">
        <span>{c.rank_history || '-'}</span>
        {c.rank_change_tag && (
          <span className="ml-1.5 text-[10px]" title="순위 변동 원인">
            ({c.rank_change_tag})
          </span>
        )}
      </td>
    </tr>
  )
}

function MobileCandidateCard({ candidate: c }: { candidate: Candidate }) {
  const isTopFive = c.part2_rank <= 5
  const industry = c.industry_kr || c.industry || '-'

  return (
    <Link
      to={`/ticker/${c.ticker}`}
      className={`block px-4 py-3 hover:bg-surface-hover transition-colors ${
        isTopFive ? 'border-l-2 border-l-emerald-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold font-mono ${
            isTopFive ? 'text-emerald-400' : 'text-slate-300'
          }`}>
            #{c.part2_rank}
          </span>
          <span className="text-sm font-semibold text-emerald-400">{c.ticker}</span>
          {c.short_name && (
            <span className="text-[11px] text-slate-500">{c.short_name}</span>
          )}
        </div>
        <span className="text-sm font-mono text-slate-200 tabular-nums">${c.price.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">{industry}</span>
          <span className={`font-mono font-semibold tabular-nums ${getScoreColor(c.adj_score)}`}>
            S:{formatNumber(c.adj_score)}
          </span>
          <span className={`font-mono font-semibold tabular-nums ${getGapColor(c.adj_gap)}`}>
            G:{formatPercent(c.adj_gap)}
          </span>
          {c.composite_rank != null && (
            <span className="font-mono tabular-nums text-slate-500">
              C:#{c.composite_rank}
            </span>
          )}
        </div>
        <TrendIcon seg1={c.seg1} seg2={c.seg2} seg3={c.seg3} seg4={c.seg4} />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] text-slate-500 font-mono">{c.rank_history || '-'}</span>
        {c.rank_change_tag && (
          <span className="text-[10px]">({c.rank_change_tag})</span>
        )}
      </div>
    </Link>
  )
}

export default CandidatesTable
