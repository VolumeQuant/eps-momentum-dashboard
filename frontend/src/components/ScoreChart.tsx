import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import type { TickerHistory } from '../types'

interface ScoreChartProps {
  data: TickerHistory[];
  metric: 'adj_score' | 'adj_gap' | 'price';
  embedded?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const tooltipStyle = {
  backgroundColor: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#F1F5F9',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
}

const axisTickStyle = { fill: '#64748B', fontSize: 11 }
const gridStroke = '#1E293B'

function ScoreChart({ data, metric, embedded = false }: ScoreChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={embedded ? 'p-6 text-center text-slate-500 text-sm' : 'bg-surface-default border border-border-default rounded-xl p-6 text-center text-slate-500 text-sm'}>
        히스토리 데이터가 없습니다.
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    dateLabel: formatDate(d.date),
  }))

  const titles: Record<string, string> = {
    adj_score: '점수 추이',
    adj_gap: '괴리율 추이',
    price: '가격 차트',
  }

  const subtitles: Record<string, string> = {
    adj_score: 'Adj Score History',
    adj_gap: 'Adj Gap History',
    price: 'Price vs MA60',
  }

  const wrapperClass = embedded
    ? 'p-4'
    : 'bg-surface-default border border-border-default rounded-xl p-4'

  const headerEl = !embedded ? (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-1 h-4 rounded-full ${metric === 'adj_gap' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
      <h3 className="text-sm font-semibold text-slate-200">{titles[metric]}</h3>
      <span className="text-xs text-slate-500">{subtitles[metric]}</span>
    </div>
  ) : null

  if (metric === 'price') {
    return (
      <div className={wrapperClass}>
        {headerEl}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis
              dataKey="dateLabel"
              tick={axisTickStyle}
              tickLine={{ stroke: '#334155' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisTickStyle}
              tickLine={{ stroke: '#334155' }}
              domain={['auto', 'auto']}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#34D399"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              name="Price"
            />
            <Line
              type="monotone"
              dataKey="ma60"
              stroke="#FBBF24"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="MA60"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (metric === 'adj_gap') {
    return (
      <div className={wrapperClass}>
        {headerEl}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis
              dataKey="dateLabel"
              tick={axisTickStyle}
              tickLine={{ stroke: '#334155' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisTickStyle}
              tickLine={{ stroke: '#334155' }}
              domain={['auto', 'auto']}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1} />
            <Bar dataKey="adj_gap" name="Adj Gap (%)" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.adj_gap <= 0 ? '#34D399' : '#F87171'}
                  fillOpacity={0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // adj_score - Area chart
  return (
    <div className={wrapperClass}>
      {headerEl}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34D399" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="dateLabel"
            tick={axisTickStyle}
            tickLine={{ stroke: '#334155' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={axisTickStyle}
            tickLine={{ stroke: '#334155' }}
            domain={['auto', 'auto']}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
          <ReferenceLine y={9} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Min=9', fill: '#EF4444', fontSize: 10 }} />
          <Area
            type="monotone"
            dataKey="adj_score"
            stroke="#34D399"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={false}
            name="Adj Score"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ScoreChart
