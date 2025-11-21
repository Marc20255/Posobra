'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ServiceStatusChartProps {
  data: Array<{ name: string; value: number; color: string }>
}

const COLORS = {
  pending: '#eab308',
  scheduled: '#3b82f6',
  in_progress: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#ef4444'
}

export function ServiceStatusChart({ data }: ServiceStatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: { name: string; percent?: number }) => {
            const pct = percent ?? 0
            return `${name}: ${(pct * 100).toFixed(0)}%`
          }}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

