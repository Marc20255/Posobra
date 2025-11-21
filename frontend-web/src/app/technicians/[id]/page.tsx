'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Star, MapPin, Briefcase, Mail, Phone, Tag } from 'lucide-react'

export default function TechnicianDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const technicianId = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(authService.getUser())
  }, [router])

  const { data: technicianData, isLoading, error } = useQuery({
    queryKey: ['technician', technicianId],
    queryFn: async () => {
      if (!technicianId) throw new Error('ID do técnico não fornecido')
      const response = await api.get(`/users/technicians/${technicianId}`)
      return response.data
    },
    enabled: !!user && !!technicianId,
  })

  const technician = technicianData?.data

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

  if (error || (!isLoading && !technician)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Técnico não encontrado</h2>
            <p className="text-gray-600 mb-4">
              {error ? 'Erro ao carregar dados do técnico.' : 'O técnico que você está procurando não existe ou foi removido.'}
            </p>
            <Button onClick={() => router.push('/technicians')}>
              Voltar para Lista de Técnicos
            </Button>
          </div>
        </main>
      </div>
    )
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
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                {technician.avatar_url ? (
                  <img
                    src={technician.avatar_url}
                    alt={technician.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary-600 font-semibold text-3xl">
                    {technician.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{technician.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900">
                    {technician.avg_rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({technician.total_reviews || 0} avaliações)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {technician.city && technician.state && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{technician.city}, {technician.state}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span>{technician.total_services || 0} serviços realizados</span>
                </div>

                {technician.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{technician.email}</span>
                  </div>
                )}

                {technician.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{technician.phone}</span>
                  </div>
                )}
              </div>

              {technician.address && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Endereço</p>
                  <p className="text-gray-900">{technician.address}</p>
                </div>
              )}

              {technician.categories && technician.categories.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {technician.categories.map((category: string) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                      >
                        <Tag className="w-4 h-4" />
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {technician.reviews && technician.reviews.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Avaliações Recentes</h2>
            <div className="space-y-4">
              {technician.reviews.map((review: any) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {review.client_avatar ? (
                          <img
                            src={review.client_avatar}
                            alt={review.client_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold text-sm">
                            {review.client_name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.client_name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(!technician.reviews || technician.reviews.length === 0) && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-center py-4">
              Este técnico ainda não possui avaliações.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

