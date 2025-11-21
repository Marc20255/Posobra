'use client'

import { Clock, CheckCircle, AlertCircle, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TimelineItem {
  id: number
  status: string
  changed_by_name?: string
  created_at: string
}

interface ServiceTimelineProps {
  items: TimelineItem[]
  currentStatus: string
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  scheduled: {
    label: 'Agendado',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  in_progress: {
    label: 'Em Andamento',
    icon: AlertCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  cancelled: {
    label: 'Cancelado',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
}

export function ServiceTimeline({ items, currentStatus }: ServiceTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum histórico disponível</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {items.map((item, index) => {
          const config = STATUS_CONFIG[item.status] || {
            label: item.status,
            icon: Clock,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100'
          }
          const Icon = config.icon
          const isLast = index === items.length - 1
          const isCurrent = item.status === currentStatus

          return (
            <div key={item.id} className="relative flex items-start">
              {/* Ícone */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
                isCurrent ? config.bgColor : 'bg-gray-100'
              } border-2 ${
                isCurrent ? 'border-primary-500' : 'border-gray-300'
              }`}>
                <Icon className={`w-6 h-6 ${isCurrent ? config.color : 'text-gray-400'}`} />
              </div>

              {/* Conteúdo */}
              <div className="ml-4 flex-1 pb-6">
                <div className={`flex items-center gap-2 mb-1`}>
                  <span className={`font-semibold ${isCurrent ? 'text-gray-900' : 'text-gray-700'}`}>
                    {config.label}
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                      Atual
                    </span>
                  )}
                </div>
                
                {item.changed_by_name && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                    <User className="w-4 h-4" />
                    <span>{item.changed_by_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(item.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

