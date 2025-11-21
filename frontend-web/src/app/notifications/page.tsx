'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { toastService } from '@/lib/toast'
import { Bell, Check, Trash2 } from 'lucide-react'

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(authService.getUser())
  }, [router])

  const { data: notificationsData, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications')
      return response.data
    },
    enabled: !!user,
  })

  const notifications = notificationsData?.data || []
  const unreadCount = notificationsData?.unread_count || 0

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`)
      refetch()
      toastService.success('Notificação marcada como lida')
    } catch (error) {
      toastService.error('Erro ao marcar notificação como lida')
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      refetch()
      toastService.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      toastService.error('Erro ao marcar notificações como lidas')
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`)
      refetch()
      toastService.success('Notificação excluída')
    } catch (error) {
      toastService.error('Erro ao excluir notificação')
      console.error('Erro ao deletar notificação:', error)
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
            <p className="mt-2 text-gray-600">
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Marcar Todas como Lidas
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Bell className={`w-5 h-5 ${
                          notification.is_read ? 'text-gray-400' : 'text-primary-600'
                        }`} />
                        <h3 className={`font-medium ${
                          notification.is_read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma notificação</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

