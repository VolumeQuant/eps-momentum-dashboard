import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { TickerHistory } from '../types'

interface ScoreChartProps {
  data: TickerHistory[];
  metric: 'adj_score' | 'adj_gap' | 'price';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function ScoreChart({ data, metric }: ScoreChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center text-slate-400">
        No historical data available.
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    dateLabel: formatDate(d.date),
  }))

  const titles: Record<string, string> = {
    adj_score: 'Adjusted Score History',
    adj_gap: 'Adjusted Gap (%) History',
    price: 'Price vs MA60',
  }

  if (metric === 'price') {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">{titles[metric]}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#475569' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#475569' }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              name="Price"
            />
            <Line
              type="monotone"
              dataKey="ma60"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="MA60"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const lineColor = metric === 'adj_score' ? '#34d399' : '#60a5fa'
  const refValue = metric === 'adj_gap' ? 0 : undefined

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">{titles[metric]}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={{ stroke: '#475569' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={{ stroke: '#475569' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
          {refValue !== undefined && (
            <ReferenceLine y={refValue} stroke="#ef4444" strokeDasharray="3 3" />
          )}
          <Line
            type="monotone"
            dataKey={metric}
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            name={metric === 'adj_score' ? 'Adj Score' : 'Adj Gap (%)'}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ScoreChart
