'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ServiceTrendChartProps {
  data: Array<{ date: string; criados: number; concluidos: number }>
}

export function ServiceTrendChart({ data }: ServiceTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="criados" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Criados"
        />
        <Line 
          type="monotone" 
          dataKey="concluidos" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Concluídos"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

