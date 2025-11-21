'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Star, AlertCircle } from 'lucide-react'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Avaliação é obrigatória').max(5),
  comment: z.string().optional(),
  service_quality: z.number().min(1).max(5).optional(),
  response_speed: z.number().min(1).max(5).optional(),
  technician_work: z.number().min(1).max(5).optional(),
  inspection_quality: z.number().min(1).max(5).optional(),
  improvement_suggestions: z.string().optional(),
})

type ReviewForm = z.infer<typeof reviewSchema>

export default function ReviewServicePage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const serviceId = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    const currentUser = authService.getUser()
    if (currentUser?.role !== 'client') {
      router.push('/dashboard')
      return
    }
    setUser(currentUser)
  }, [router])

  const { data: serviceData, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await api.get(`/services/${serviceId}`)
      return response.data
    },
    enabled: !!user && !!serviceId,
  })

  const { data: existingReview } = useQuery({
    queryKey: ['review', serviceId],
    queryFn: async () => {
      const response = await api.get(`/reviews/service/${serviceId}`)
      return response.data
    },
    enabled: !!user && !!serviceId,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  })

  const rating = watch('rating')
  const serviceQuality = watch('service_quality')
  const responseSpeed = watch('response_speed')
  const technicianWork = watch('technician_work')
  const inspectionQuality = watch('inspection_quality')

  const service = serviceData?.data
  const review = existingReview?.data

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (isLoading) {
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

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Serviço não encontrado</h2>
            <Button onClick={() => router.push('/services')}>
              Voltar para Serviços
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (service.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold text-yellow-900 mb-2">
                  Serviço ainda não concluído
                </h2>
                <p className="text-yellow-800 mb-4">
                  Você só pode avaliar serviços que foram concluídos.
                </p>
                <Button onClick={() => router.push(`/services/${serviceId}`)}>
                  Voltar para Detalhes do Serviço
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (review) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-green-600 mt-0.5 fill-green-600" />
              <div>
                <h2 className="text-xl font-semibold text-green-900 mb-2">
                  Serviço já avaliado
                </h2>
                <p className="text-green-800 mb-4">
                  Este serviço já foi avaliado. Obrigado pelo seu feedback!
                </p>
                <Button onClick={() => router.push(`/services/${serviceId}`)}>
                  Voltar para Detalhes do Serviço
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const onSubmit = async (data: ReviewForm) => {
    setError('')
    setLoading(true)

    try {
      await api.post('/reviews', {
        service_id: parseInt(serviceId!),
        ...data,
      })
      router.push(`/services/${serviceId}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar avaliação')
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number
    onChange: (value: number) => void
    label: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`transition-colors ${
              star <= value
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star className="w-8 h-8" />
          </button>
        ))}
      </div>
    </div>
  )

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
          Voltar
        </Button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Avaliar Serviço
          </h1>
          <p className="text-gray-600 mb-6">
            {service.title}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliação Geral *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('rating', star, { shouldValidate: true })}
                    className={`transition-colors ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  >
                    <Star className="w-10 h-10" />
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                {...register('rating')}
              />
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <StarRating
                value={serviceQuality || 0}
                onChange={(value) => setValue('service_quality', value)}
                label="Qualidade do Serviço"
              />

              <StarRating
                value={responseSpeed || 0}
                onChange={(value) => setValue('response_speed', value)}
                label="Velocidade de Atendimento"
              />

              <StarRating
                value={technicianWork || 0}
                onChange={(value) => setValue('technician_work', value)}
                label="Trabalho do Técnico"
              />

              <StarRating
                value={inspectionQuality || 0}
                onChange={(value) => setValue('inspection_quality', value)}
                label="Qualidade da Vistoria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário (opcional)
              </label>
              <textarea
                {...register('comment')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Deixe seu comentário sobre o serviço..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sugestões de Melhoria (opcional)
              </label>
              <textarea
                {...register('improvement_suggestions')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tem alguma sugestão de melhoria para o imóvel ou serviço?"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> A avaliação é obrigatória e você precisará avaliar este serviço antes de criar um novo chamado.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/services/${serviceId}`)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !rating}
                className="flex-1"
              >
                {loading ? 'Enviando...' : 'Enviar Avaliação'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

