'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface PriorityChartProps {
  data: Array<{ priority: string; count: number }>
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444'
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente'
}

export function PriorityChart({ data }: PriorityChartProps) {
  const chartData = data.map(item => ({
    ...item,
    priorityLabel: PRIORITY_LABELS[item.priority] || item.priority
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="priorityLabel" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="Quantidade">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#8884d8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

