'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ServiceCardSkeleton } from '@/components/ui/skeleton'
import { toastService } from '@/lib/toast'
import { ArrowLeft, Calendar, MapPin, User, MessageSquare, AlertCircle, Camera, X, Loader2, Mic, Square, Image as ImageIcon, Clock, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { ServiceTimeline } from '@/components/timeline/ServiceTimeline'
import { BeforeAfterSlider } from '@/components/comparison/BeforeAfterSlider'
import { ActivityLog } from '@/components/activity/ActivityLog'
import { StatusUpdateDropdown } from '@/components/services/StatusUpdateDropdown'

export default function ServiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<any>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoDescription, setPhotoDescription] = useState('')
  const [isBefore, setIsBefore] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para gravação de áudio
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDescription, setAudioDescription] = useState('')
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
  
  const serviceId = params.id as string

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(authService.getUser())
  }, [router])

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop()
      }
    }
  }, [recordingInterval, audioUrl, mediaRecorder, isRecording])

  const { data: serviceData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await api.get(`/services/${serviceId}`)
      return response.data
    },
    enabled: !!user && !!serviceId,
    retry: 1,
  })

  const service = serviceData?.data

  // Verificar se usuário pode adicionar fotos (cliente ou técnico, serviço não cancelado)
  const canAddPhotos = service && service.status !== 'cancelled' && 
    (user?.role === 'client' || user?.role === 'technician' || user?.role === 'admin')

  // Verificar se usuário pode adicionar áudios
  const canAddAudios = service && service.status !== 'cancelled' && 
    (user?.role === 'client' || user?.role === 'technician' || user?.role === 'admin')

  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post(`/upload/service/${serviceId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      toastService.success('Foto adicionada com sucesso!')
      setShowPhotoModal(false)
      setSelectedFile(null)
      setPhotoDescription('')
      setIsBefore(false)
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] })
    },
    onError: (error: any) => {
      toastService.error(error?.response?.data?.message || 'Erro ao adicionar foto')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastService.error('Por favor, selecione apenas arquivos de imagem')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toastService.error('A imagem deve ter no máximo 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUploadPhoto = () => {
    if (!selectedFile) {
      toastService.error('Por favor, selecione uma foto')
      return
    }

    const formData = new FormData()
    formData.append('photo', selectedFile)
    formData.append('description', photoDescription)
    formData.append('is_before', isBefore.toString())

    uploadPhotoMutation.mutate(formData)
  }

  // Funções para gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingTime(0)
      
      // Timer para mostrar duração da gravação
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      setRecordingInterval(interval)
      
      toastService.success('Gravação iniciada')
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      toastService.error('Erro ao acessar o microfone. Verifique as permissões.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      if (recordingInterval) {
        clearInterval(recordingInterval)
        setRecordingInterval(null)
      }
      toastService.success('Gravação finalizada')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const uploadAudioMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post(`/upload/service/${serviceId}/audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      toastService.success('Áudio adicionado com sucesso!')
      setShowAudioModal(false)
      setAudioBlob(null)
      setAudioUrl(null)
      setAudioDescription('')
      setRecordingTime(0)
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] })
    },
    onError: (error: any) => {
      toastService.error(error?.response?.data?.message || 'Erro ao adicionar áudio')
    },
  })

  const handleUploadAudio = () => {
    if (!audioBlob) {
      toastService.error('Por favor, grave um áudio primeiro')
      return
    }

    const formData = new FormData()
    // Converter Blob para File
    const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
    formData.append('audio', audioFile)
    formData.append('description', audioDescription)
    formData.append('duration', recordingTime.toString())

    uploadAudioMutation.mutate(formData)
  }

  const handleCloseAudioModal = () => {
    if (isRecording) {
      stopRecording()
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setShowAudioModal(false)
    setAudioBlob(null)
    setAudioUrl(null)
    setAudioDescription('')
    setRecordingTime(0)
  }

  // Loading state - usuário ainda não carregou
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

  // Loading state - serviço carregando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="bg-white rounded-lg shadow p-6">
            <ServiceCardSkeleton />
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message || 'Erro ao carregar serviço'
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar serviço</h2>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <div className="flex gap-4">
                <Button onClick={() => refetch()}>
                  Tentar Novamente
                </Button>
                <Button variant="outline" onClick={() => router.push('/services')}>
                  Voltar para Serviços
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Service not found
  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Serviço não encontrado</h2>
              <p className="text-gray-600 mb-6">O serviço que você está procurando não existe ou você não tem permissão para visualizá-lo.</p>
              <Button onClick={() => router.push('/services')}>
                Voltar para Serviços
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Concluído',
      in_progress: 'Em Andamento',
      scheduled: 'Agendado',
      pending: 'Pendente',
      cancelled: 'Cancelado',
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                {getStatusLabel(service.status)}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {user.role === 'client' && service.status === 'completed' && (
                <Button onClick={() => router.push(`/services/${serviceId}/review`)}>
                  Avaliar Serviço
                </Button>
              )}

              {/* Atualização de status - apenas técnico pode atualizar */}
              {user.role === 'technician' && service.technician_id === user.id && (
                <StatusUpdateDropdown 
                  currentStatus={service.status}
                  serviceId={serviceId}
                  onStatusUpdate={() => {
                    refetch();
                    queryClient.invalidateQueries({ queryKey: ['services'] });
                  }}
                />
              )}

              {/* Cancelamento - cliente, construtora ou técnico podem cancelar */}
              {(user.role === 'client' || user.role === 'constructor' || 
                (user.role === 'technician' && service.technician_id === user.id)) &&
               service.status !== 'completed' && 
               service.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!confirm('Tem certeza que deseja cancelar este serviço?')) return;
                    
                    try {
                      await api.put(`/services/${serviceId}`, { status: 'cancelled' });
                      toastService.success('Serviço cancelado com sucesso');
                      refetch();
                      queryClient.invalidateQueries({ queryKey: ['services'] });
                    } catch (error: any) {
                      toastService.error(error.response?.data?.message || 'Erro ao cancelar serviço');
                    }
                  }}
                  className="text-orange-600 hover:text-orange-700 border-orange-300"
                >
                  Cancelar Serviço
                </Button>
              )}
              
              {/* Botão de deletar para construtora ou cliente */}
              {(user.role === 'constructor' || user.role === 'client') && 
               service.deletion_status !== 'pending_approval' && 
               service.deletion_status !== 'approved' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
                    
                    try {
                      const response = await api.delete(`/services/${serviceId}`);
                      if (response.data.requires_approval) {
                        toastService.info('Solicitação enviada. Aguardando aprovação do técnico.');
                      } else {
                        toastService.success('Serviço excluído com sucesso.');
                        router.push('/services');
                      }
                    } catch (error: any) {
                      toastService.error(error.response?.data?.message || 'Erro ao excluir serviço');
                    }
                  }}
                  className="text-red-600 hover:text-red-700 border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Serviço
                </Button>
              )}

              {/* Aprovação de exclusão para técnico */}
              {user.role === 'technician' && 
               service.deletion_status === 'pending_approval' && 
               service.technician_id === user.id && (
                <div className="flex gap-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <p className="text-sm text-yellow-800 mb-2">
                      <strong>Solicitação de Exclusão Pendente</strong>
                    </p>
                    <p className="text-xs text-yellow-700 mb-3">
                      Este serviço foi solicitado para exclusão. Como você já iniciou o reparo, 
                      precisa aprovar ou rejeitar a exclusão.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (!confirm('Tem certeza que deseja aprovar a exclusão? O serviço será removido permanentemente.')) return;
                          
                          try {
                            await api.post(`/services/${serviceId}/deletion/approve`, { approved: true });
                            toastService.success('Exclusão aprovada. Serviço removido.');
                            router.push('/services');
                          } catch (error: any) {
                            toastService.error(error.response?.data?.message || 'Erro ao aprovar exclusão');
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar Exclusão
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await api.post(`/services/${serviceId}/deletion/approve`, { approved: false });
                            toastService.success('Exclusão rejeitada. O serviço continuará ativo.');
                            refetch();
                          } catch (error: any) {
                            toastService.error(error.response?.data?.message || 'Erro ao rejeitar exclusão');
                          }
                        }}
                        className="border-red-300 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seção de atualização de status para técnico - mais visível */}
          {user.role === 'technician' && service.technician_id === user.id && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Atualizar Status do Serviço
                  </h3>
                  <p className="text-sm text-blue-700">Como técnico responsável, você pode atualizar o status deste serviço</p>
                </div>
                <StatusUpdateDropdown 
                  currentStatus={service.status}
                  serviceId={serviceId}
                  onStatusUpdate={() => {
                    refetch();
                    queryClient.invalidateQueries({ queryKey: ['services'] });
                  }}
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Categoria</h3>
              <p className="text-gray-900">{service.category}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Descrição</h3>
              <p className="text-gray-900">{service.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
                  <p className="text-gray-900">
                    {service.address}, {service.city} - {service.state}
                    <br />
                    CEP: {service.zip_code}
                  </p>
                </div>
              </div>

              {service.scheduled_date && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Data Agendada</h3>
                    <p className="text-gray-900">
                      {new Date(service.scheduled_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {service.technician_name && (
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Técnico</h3>
                    <p className="text-gray-900">{service.technician_name}</p>
                    {service.technician_phone && (
                      <p className="text-sm text-gray-600">{service.technician_phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Fotos</h3>
                {canAddPhotos && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPhotoModal(true)}
                    className="text-xs"
                  >
                    <Camera className="w-3 h-3 mr-1" />
                    Adicionar Foto
                  </Button>
                )}
              </div>
              {service.photos && service.photos.length > 0 ? (
                service.status === 'completed' && 
                service.photos.filter((p: any) => p.is_before).length > 0 &&
                service.photos.filter((p: any) => !p.is_before).length > 0 ? (
                  // Slider interativo antes/depois quando concluído
                  <div className="mt-4">
                    <BeforeAfterSlider
                      beforePhotos={service.photos.filter((p: any) => p.is_before)}
                      afterPhotos={service.photos.filter((p: any) => !p.is_before)}
                    />
                  </div>
                ) : service.status === 'completed' ? (
                  // Fallback: grid normal se não tiver ambas as fotos
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {service.photos.filter((p: any) => p.is_before).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded mr-2">ANTES</span>
                            Fotos do Problema
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {service.photos
                              .filter((p: any) => p.is_before)
                              .map((photo: any) => (
                                <div key={photo.id} className="relative group">
                                  <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-yellow-500">
                                    <Image
                                      src={photo.photo_url}
                                      alt={photo.description || 'Foto antes'}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  {photo.description && (
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{photo.description}</p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      {service.photos.filter((p: any) => !p.is_before).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded mr-2">DEPOIS</span>
                            Fotos da Solução
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {service.photos
                              .filter((p: any) => !p.is_before)
                              .map((photo: any) => (
                                <div key={photo.id} className="relative group">
                                  <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-green-500">
                                    <Image
                                      src={photo.photo_url}
                                      alt={photo.description || 'Foto depois'}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  {photo.description && (
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{photo.description}</p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Visualização normal quando não concluído
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {service.photos.map((photo: any) => (
                      <div key={photo.id} className="relative group">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={photo.photo_url}
                            alt={photo.description || 'Foto do serviço'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {photo.is_before && (
                          <span className="absolute top-1 left-1 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded">
                            Antes
                          </span>
                        )}
                        {!photo.is_before && (
                          <span className="absolute top-1 left-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded">
                            Depois
                          </span>
                        )}
                        {photo.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{photo.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-sm text-gray-500 mt-2">Nenhuma foto adicionada ainda</p>
              )}
            </div>

            {/* Seção de Áudios */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Áudios</h3>
                {canAddAudios && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAudioModal(true)}
                    className="text-xs"
                  >
                    <Mic className="w-3 h-3 mr-1" />
                    Gravar Áudio
                  </Button>
                )}
              </div>
              {service.audios && service.audios.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {service.audios.map((audio: any) => (
                    <div key={audio.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {audio.description && (
                            <p className="text-sm font-medium text-gray-900 mb-2 break-words">{audio.description}</p>
                          )}
                          <div className="flex items-center gap-2 w-full">
                            <audio controls className="flex-1 w-full max-w-full">
                              <source src={audio.audio_url} type="audio/webm" />
                              <source src={audio.audio_url} type="audio/mpeg" />
                              Seu navegador não suporta o elemento de áudio.
                            </audio>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                            {audio.duration && (
                              <span className="whitespace-nowrap">Duração: {formatTime(audio.duration)}</span>
                            )}
                            {audio.uploaded_by_name && (
                              <span className="whitespace-nowrap">Por: {audio.uploaded_by_name}</span>
                            )}
                            <span className="whitespace-nowrap">{new Date(audio.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Nenhum áudio gravado ainda</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Visual do Histórico */}
        {service?.status_history && service.status_history.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center mb-6">
              <Clock className="w-5 h-5 mr-2 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Histórico do Serviço</h2>
            </div>
            <ServiceTimeline 
              items={service.status_history} 
              currentStatus={service.status}
            />
          </div>
        )}

        {/* Histórico de Atividades */}
        {service && (
          <ActivityLog serviceId={serviceId} />
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Chat</h2>
            <Button
              variant="outline"
              onClick={() => router.push(`/services/${serviceId}/chat`)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Abrir Chat
            </Button>
          </div>
          <p className="text-gray-600">Use o chat para se comunicar sobre este serviço</p>
        </div>
      </main>

      {/* Modal de Upload de Foto */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Adicionar Foto</h2>
              <button
                onClick={() => {
                  setShowPhotoModal(false)
                  setSelectedFile(null)
                  setPhotoDescription('')
                  setIsBefore(false)
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione a foto
                </label>
                
                {/* Input para galeria */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {/* Input para câmera (mobile) */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Tirar Foto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => photoInputRef.current?.click()}
                    className="flex-1"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Escolher da Galeria
                  </Button>
                </div>
                
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  placeholder="Descreva a foto..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBefore"
                  checked={isBefore}
                  onChange={(e) => setIsBefore(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isBefore" className="ml-2 text-sm text-gray-700">
                  Foto antes do reparo
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPhotoModal(false)
                    setSelectedFile(null)
                    setPhotoDescription('')
                    setIsBefore(false)
                  }}
                  className="flex-1 w-full sm:w-auto"
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUploadPhoto}
                  disabled={!selectedFile || uploadPhotoMutation.isPending}
                  className="flex-1 w-full sm:w-auto"
                  size="sm"
                >
                  {uploadPhotoMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Enviar Foto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gravação de Áudio */}
      {showAudioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Gravar Áudio</h2>
              <button
                onClick={handleCloseAudioModal}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Controles de gravação */}
              <div className="flex flex-col items-center justify-center py-4 sm:py-6 bg-gray-50 rounded-lg px-2">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <Square className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>
                    <div className="text-center w-full">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatTime(recordingTime)}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Gravando...</p>
                    </div>
                    <Button
                      onClick={stopRecording}
                      variant="outline"
                      className="mt-2 w-full sm:w-auto"
                      size="sm"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Parar Gravação
                    </Button>
                  </div>
                ) : audioUrl ? (
                  <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                    <audio controls className="w-full max-w-full">
                      <source src={audioUrl} type="audio/webm" />
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600">Duração: {formatTime(recordingTime)}</p>
                    </div>
                    <Button
                      onClick={startRecording}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Gravar Novamente
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 sm:gap-4 w-full px-2">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 text-center px-2">
                      Clique no botão abaixo para começar a gravar
                    </p>
                    <Button 
                      onClick={startRecording}
                      className="w-full sm:w-auto"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Iniciar Gravação
                    </Button>
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={audioDescription}
                  onChange={(e) => setAudioDescription(e.target.value)}
                  placeholder="Descreva o conteúdo do áudio..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseAudioModal}
                  className="flex-1 w-full sm:w-auto"
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUploadAudio}
                  disabled={!audioBlob || uploadAudioMutation.isPending}
                  className="flex-1 w-full sm:w-auto"
                  size="sm"
                >
                  {uploadAudioMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Salvar Áudio
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

