'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Star, MapPin, Award, TrendingUp } from 'lucide-react'
import Image from 'next/image'

interface TechnicianRecommendationsProps {
  category: string
  city?: string
  state?: string
  onSelectTechnician?: (technicianId: number) => void
}

export function TechnicianRecommendations({ 
  category, 
  city, 
  state, 
  onSelectTechnician 
}: TechnicianRecommendationsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['recommendations', 'technicians', category, city, state],
    queryFn: async () => {
      const params: any = { category }
      if (city) params.city = city
      if (state) params.state = state
      
      const response = await api.get('/recommendations/technicians', { params })
      return response.data
    },
    enabled: !!category,
  })

  const recommendations = data?.data || []

  if (!category) {
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">Buscando técnicos recomendados...</p>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Nenhum técnico encontrado para a categoria &quot;{category}&quot;. Tente outra categoria.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Técnicos Recomendados</h3>
        <span className="text-xs text-gray-500">(baseado em experiência e avaliações)</span>
      </div>
      
      <div className="space-y-3">
        {recommendations.slice(0, 3).map((tech: any, index: number) => (
          <div
            key={tech.id}
            className={`bg-white rounded-lg p-4 border-2 ${
              index === 0 ? 'border-blue-400 shadow-md' : 'border-gray-200'
            } hover:shadow-lg transition-shadow cursor-pointer`}
            onClick={() => onSelectTechnician?.(tech.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {tech.avatar_url ? (
                  <Image
                    src={tech.avatar_url}
                    alt={tech.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {tech.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        Top Recomendado
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{tech.avg_rating.toFixed(1)}</span>
                      <span className="text-gray-500">({tech.total_reviews})</span>
                    </div>
                    
                    {tech.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{tech.city}, {tech.state}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span>{tech.category_services} serviços nesta categoria</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Score de recomendação:</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      {tech.recommendation_score} pontos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {recommendations.length > 3 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          +{recommendations.length - 3} outros técnicos disponíveis
        </p>
      )}
    </div>
  )
}

