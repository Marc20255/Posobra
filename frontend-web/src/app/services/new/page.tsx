'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { toastService } from '@/lib/toast'
import { ArrowLeft, Loader2, Camera, X } from 'lucide-react'
import Image from 'next/image'
import { TechnicianRecommendations } from '@/components/recommendations/TechnicianRecommendations'

const serviceSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zip_code: z.string().min(1, 'CEP é obrigatório'),
})

type ServiceForm = z.infer<typeof serviceSchema>

export default function NewServicePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [pendingReviewServiceId, setPendingReviewServiceId] = useState<string | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const lastSearchedCep = useRef<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    const currentUser = authService.getUser()
    // Permitir client, constructor e admin criar serviços
    if (!currentUser || (currentUser.role !== 'client' && currentUser.role !== 'constructor' && currentUser.role !== 'admin')) {
      router.push('/dashboard')
      return
    }
    setUser(currentUser)
  }, [router])

  const { data: unitsData } = useQuery({
    queryKey: ['my-units'],
    queryFn: async () => {
      const response = await api.get('/developments/units/my-units')
      return response.data
    },
    enabled: !!user,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      priority: 'medium',
      state: 'RO',
    },
  })

  const zipCode = watch('zip_code')

  // Função para formatar CEP (00000-000)
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 5) {
      return numbers
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  // Função para buscar CEP
  const fetchCepData = useCallback(async (cep: string) => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '')
    
    // Verifica se o CEP tem 8 dígitos
    if (cleanCep.length !== 8) {
      return
    }

    // Evita buscar o mesmo CEP novamente
    if (lastSearchedCep.current === cleanCep) {
      return
    }

    lastSearchedCep.current = cleanCep
    setLoadingCep(true)
    setError('') // Limpa erros anteriores

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (!data.erro) {
        // Preenche os campos automaticamente
        setValue('address', data.logradouro || '', { shouldValidate: true })
        setValue('city', data.localidade || '', { shouldValidate: true })
        setValue('state', data.uf || '', { shouldValidate: true })
        setError('') // Limpa qualquer erro anterior
      } else {
        setError('CEP não encontrado. Por favor, preencha os dados manualmente.')
        // Limpa os campos se CEP não encontrado
        setValue('address', '', { shouldValidate: false })
        setValue('city', '', { shouldValidate: false })
        setValue('state', '', { shouldValidate: false })
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err)
      setError('Erro ao buscar CEP. Por favor, preencha os dados manualmente.')
    } finally {
      setLoadingCep(false)
    }
  }, [setValue])

  // Monitora mudanças no CEP
  useEffect(() => {
    if (zipCode) {
      const cleanCep = zipCode.replace(/\D/g, '')
      if (cleanCep.length === 8) {
        // Adiciona um pequeno delay para evitar buscas enquanto o usuário está digitando
        const timeoutId = setTimeout(() => {
          fetchCepData(cleanCep)
        }, 500)

        return () => clearTimeout(timeoutId)
      } else {
        // Se o CEP não tem 8 dígitos, reseta o último CEP buscado
        lastSearchedCep.current = ''
      }
    }
  }, [zipCode, fetchCepData])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toastService.error(`${file.name} não é uma imagem válida`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toastService.error(`${file.name} é muito grande (máximo 10MB)`)
        return false
      }
      return true
    })

    if (selectedPhotos.length + validFiles.length > 10) {
      toastService.error('Máximo de 10 fotos permitidas')
      return
    }

    setSelectedPhotos([...selectedPhotos, ...validFiles])
    
    // Criar previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index))
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ServiceForm) => {
    setError('')
    setLoading(true)

    try {
      // Para cliente, usar primeira unidade vinculada
      // Para construtora/admin, permitir selecionar unidade (se houver múltiplas)
      const unitId = unitsData?.data?.[0]?.id || null
      
      if (!unitId) {
        if (user?.role === 'client') {
          setError('Você precisa vincular uma unidade antes de criar um serviço. Redirecionando...')
          setTimeout(() => {
            router.push('/units/link')
          }, 2000)
        } else {
          setError('Você precisa ter pelo menos uma unidade cadastrada em seus empreendimentos para criar um serviço.')
        }
        setLoading(false)
        return
      }

      // Criar FormData para enviar fotos
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('category', data.category)
      formData.append('priority', data.priority)
      formData.append('address', data.address)
      formData.append('city', data.city)
      formData.append('state', data.state)
      formData.append('zip_code', data.zip_code)
      formData.append('unit_id', unitId.toString())

      // Adicionar fotos
      selectedPhotos.forEach((photo) => {
        formData.append('photos', photo)
      })

      await api.post('/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toastService.success('Serviço criado com sucesso!')
      router.push('/services')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar serviço'
      const serviceId = err.response?.data?.pending_review_service_id
      
      if (serviceId) {
        // Se há serviço sem avaliação, mostrar mensagem e botão para avaliar
        setError(errorMessage)
        setPendingReviewServiceId(serviceId.toString())
        toastService.error(errorMessage)
      } else {
        setError(errorMessage)
        setPendingReviewServiceId(null)
        toastService.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  const hasUnits = unitsData?.data && unitsData.data.length > 0

  if (!hasUnits) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">
              Unidade Necessária
            </h2>
            <p className="text-yellow-800 mb-4">
              {user?.role === 'client' 
                ? 'Você precisa vincular uma unidade antes de criar um serviço.'
                : 'Você precisa ter pelo menos uma unidade cadastrada em seus empreendimentos para criar um serviço.'}
            </p>
            {user?.role === 'client' ? (
              <Button onClick={() => router.push('/units/link')}>
                Vincular Unidade Agora
              </Button>
            ) : (
              <Button onClick={() => router.push('/developments')}>
                Ver Empreendimentos
              </Button>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Serviço</h1>

          {error && (
            <div className={`border px-4 py-3 rounded mb-4 ${
              pendingReviewServiceId 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium mb-1">{error}</p>
                  {pendingReviewServiceId && (
                    <p className="text-sm mt-2">
                      Você será redirecionado automaticamente em alguns segundos...
                    </p>
                  )}
                </div>
                {pendingReviewServiceId && (
                  <Button
                    type="button"
                    onClick={() => router.push(`/services/${pendingReviewServiceId}/review`)}
                    className="ml-4"
                  >
                    Avaliar Agora
                  </Button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Vazamento no banheiro"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione uma categoria</option>
                <option value="Hidráulica">Hidráulica</option>
                <option value="Elétrica">Elétrica</option>
                <option value="Pintura">Pintura</option>
                <option value="Alvenaria">Alvenaria</option>
                <option value="Acabamento">Acabamento</option>
                <option value="Marcenaria">Marcenaria</option>
                <option value="Outros">Outros</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Recomendações de Técnicos */}
            {watch('category') && (
              <TechnicianRecommendations
                category={watch('category')}
                city={watch('city')}
                state={watch('state')}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descreva o problema em detalhes..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Seção de Fotos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos do Problema (Antes) <span className="text-gray-500 text-xs">(opcional)</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Adicione fotos mostrando o problema antes do reparo. Máximo de 10 fotos.
              </p>
              
              {/* Input para galeria */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />
              
              {/* Input para câmera (mobile) */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />
              
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
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
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Escolher da Galeria
                </Button>
              </div>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded">
                        Antes
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade *
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP *
                </label>
                <div className="relative">
                  <input
                    {...register('zip_code')}
                    type="text"
                    maxLength={9}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 pr-10"
                    placeholder="00000-000"
                    onChange={(e) => {
                      const formatted = formatCep(e.target.value)
                      setValue('zip_code', formatted)
                    }}
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                    </div>
                  )}
                </div>
                {errors.zip_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.zip_code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço *
                </label>
                <input
                  {...register('address')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <input
                  {...register('city')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <input
                  {...register('state')}
                  type="text"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
                  placeholder="RO"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Criando...' : 'Criar Serviço'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

