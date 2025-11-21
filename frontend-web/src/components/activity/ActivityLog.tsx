'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Clock, User, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ActivityLogProps {
  serviceId: string | number
}

export function ActivityLog({ serviceId }: ActivityLogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity-log', serviceId],
    queryFn: async () => {
      const response = await api.get(`/services/${serviceId}/activity-log`)
      return response.data
    },
  })

  const activities = data?.data || []

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Carregando histórico...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return null
  }

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'service_deleted':
      case 'deletion_approved':
        return <Trash2 className="w-5 h-5 text-red-600" />
      case 'deletion_requested':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'deletion_rejected':
        return <XCircle className="w-5 h-5 text-orange-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getActivityColor = (actionType: string) => {
    switch (actionType) {
      case 'service_deleted':
      case 'deletion_approved':
        return 'bg-red-50 border-red-200'
      case 'deletion_requested':
        return 'bg-yellow-50 border-yellow-200'
      case 'deletion_rejected':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center mb-6">
        <Clock className="w-5 h-5 mr-2 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Histórico de Atividades</h2>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity: any) => (
          <div
            key={activity.id}
            className={`border rounded-lg p-4 ${getActivityColor(activity.action_type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getActivityIcon(activity.action_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{activity.action_description}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {activity.user_name && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{activity.user_name}</span>
                      {activity.user_role && (
                        <span className="text-gray-500">({activity.user_role})</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(activity.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

