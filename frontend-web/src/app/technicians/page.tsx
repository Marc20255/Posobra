'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { TechnicianCardSkeleton } from '@/components/ui/skeleton'
import { Star, MapPin, Briefcase, Tag, X } from 'lucide-react'

export default function TechniciansPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  )

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(authService.getUser())
  }, [router])

  // Sincronizar categoria com URL
  useEffect(() => {
    const category = searchParams.get('category')
    setSelectedCategory(category)
  }, [searchParams])

  const { data: techniciansData, isLoading } = useQuery({
    queryKey: ['technicians', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory ? { category: selectedCategory } : {}
      const response = await api.get('/users/technicians', { params })
      return response.data
    },
    enabled: !!user,
  })

  const technicians = techniciansData?.data || []

  // Extrair todas as categorias únicas dos técnicos
  const allCategories: string[] = Array.from(
    new Set(
      technicians.flatMap((t: any) => (t.categories || []) as string[])
    )
  ).sort() as string[]

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category)
    if (category) {
      router.push(`/technicians?category=${encodeURIComponent(category)}`)
    } else {
      router.push('/technicians')
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section com imagem de fundo */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Técnicos Disponíveis
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-2xl mx-auto">
              Encontre técnicos qualificados para seus serviços
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros de Categoria */}
        {allCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Filtrar por especialidade:</span>
              <Button
                variant={selectedCategory === null ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleCategoryFilter(null)}
                className="text-sm"
              >
                Todas
              </Button>
              {allCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryFilter(category)}
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
            {selectedCategory && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Filtrado por: <strong>{selectedCategory}</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCategoryFilter(null)}
                  className="h-6 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TechnicianCardSkeleton key={i} />
              ))}
            </>
          ) : technicians.length > 0 ? (
            technicians.map((technician: any) => (
              <div
                key={technician.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/technicians/${technician.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {technician.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{technician.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {parseFloat(technician.avg_rating || 0).toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({technician.total_reviews} avaliações)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {technician.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {technician.city}, {technician.state}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    {technician.total_services} serviços realizados
                  </div>
                  {technician.categories && technician.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {technician.categories.slice(0, 3).map((category: string) => (
                        <span
                          key={category}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          {category}
                        </span>
                      ))}
                      {technician.categories.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{technician.categories.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/technicians/${technician.id}`)
                  }}
                >
                  Ver Perfil
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              Nenhum técnico encontrado
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

