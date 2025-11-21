'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toastService } from '@/lib/toast'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

export default function ServiceChatPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const serviceId = params.id as string

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(authService.getUser())
  }, [router])

  // Initialize socket connection
  useEffect(() => {
    if (!user || !serviceId) return

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Conectado ao chat')
      newSocket.emit('join-room', `service-${serviceId}`)
    })

    newSocket.on('new-message', (data: any) => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({ queryKey: ['chat-messages', serviceId] })
    })

    newSocket.on('disconnect', () => {
      console.log('Desconectado do chat')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user, serviceId, queryClient])

  // Fetch messages
  const { data: messagesData, isLoading, isError: messagesError } = useQuery({
    queryKey: ['chat-messages', serviceId],
    queryFn: async () => {
      const response = await api.get(`/chat/service/${serviceId}`)
      return response.data
    },
    enabled: !!user && !!serviceId,
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 1,
  })

  // Fetch service info
  const { data: serviceData, isError: serviceError } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await api.get(`/services/${serviceId}`)
      return response.data
    },
    enabled: !!user && !!serviceId,
    retry: 1,
  })

  const messages = messagesData?.data || []
  const service = serviceData?.data

  // Show error if service or messages fail to load
  if (serviceError || messagesError) {
    const error = (serviceError || messagesError) as any
    const errorMessage = error?.response?.data?.message || 'Erro ao carregar chat'
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/services/${serviceId}`)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Detalhes
          </Button>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar chat</p>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <Button onClick={() => router.push(`/services/${serviceId}`)}>
                Voltar para Detalhes
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await api.post(`/chat/service/${serviceId}`, {
        message: messageText,
        message_type: 'text',
      })
      return response.data
    },
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['chat-messages', serviceId] })
    },
    onError: (error: any) => {
      toastService.error(error.response?.data?.message || 'Erro ao enviar mensagem')
    },
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sendMessageMutation.isPending) return

    sendMessageMutation.mutate(message.trim())
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Carregando...</div>
          </div>
        </main>
      </div>
    )
  }

  // Get other party name
  const getOtherPartyName = () => {
    if (!service) return 'Usuário'
    if (user.role === 'client') {
      return service.technician_name || 'Técnico'
    } else if (user.role === 'technician') {
      return service.client_name || 'Cliente'
    } else {
      return service.client_name || 'Usuário'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/services/${serviceId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Detalhes
          </Button>
          <div className="bg-white rounded-lg shadow p-4">
            <h1 className="text-xl font-bold text-gray-900">
              Chat - {service?.title || 'Serviço'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Conversando com {getOtherPartyName()}
            </p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-lg mb-2">Nenhuma mensagem ainda</p>
                <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const isOwnMessage = msg.sender_id === user.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="text-xs font-semibold mb-1 opacity-80">
                          {msg.sender_name}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      <div
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

