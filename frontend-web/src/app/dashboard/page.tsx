'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { DashboardStatsSkeleton, ServiceCardSkeleton } from '@/components/ui/skeleton'
import { ServiceStatusChart } from '@/components/charts/ServiceStatusChart'
import { ServiceTrendChart } from '@/components/charts/ServiceTrendChart'
import { CategoryChart } from '@/components/charts/CategoryChart'
import { PriorityChart } from '@/components/charts/PriorityChart'
import { BadgeDisplay } from '@/components/badges/BadgeDisplay'
import dynamic from 'next/dynamic'

// Importar mapa dinamicamente para evitar problemas de SSR
const ServicesMap = dynamic(
  () => import('@/components/map/ServicesMap').then((mod) => ({ default: mod.ServicesMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    )
  }
)
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  MessageSquare,
  Plus,
  BarChart3
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(authService.getUser())
  }, [router])

  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get('/services')
      return response.data
    },
    enabled: !!user,
    refetchInterval: 5000, // Refetch a cada 5 segundos para pegar coordenadas atualizadas
  })

  const { data: unitsData } = useQuery({
    queryKey: ['my-units'],
    queryFn: async () => {
      const response = await api.get('/developments/units/my-units')
      return response.data
    },
    enabled: !!user && user.role === 'client',
  })

  const { data: badgesData } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const response = await api.get('/badges/my-badges')
      return response.data
    },
    enabled: !!user,
  })

  const hasUnits = unitsData?.data && unitsData.data.length > 0

  const services = servicesData?.data || []
  const stats = {
    total: services.length,
    pending: services.filter((s: any) => s.status === 'pending').length,
    inProgress: services.filter((s: any) => s.status === 'in_progress').length,
    completed: services.filter((s: any) => s.status === 'completed').length,
  }

  // Preparar dados para gráficos
  const statusChartData = [
    { name: 'Pendentes', value: stats.pending, color: '#eab308' },
    { name: 'Em Andamento', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Concluídos', value: stats.completed, color: '#10b981' },
  ].filter(item => item.value > 0)

  // Dados de tendência (últimos 7 dias)
  const getTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    return last7Days.map(date => {
      const criados = services.filter((s: any) => 
        s.created_at?.startsWith(date)
      ).length
      const concluidos = services.filter((s: any) => 
        s.completed_date?.startsWith(date)
      ).length
      
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        criados,
        concluidos
      }
    })
  }

  // Dados por categoria
  const categoryData = Object.entries(
    services.reduce((acc: any, s: any) => {
      acc[s.category] = (acc[s.category] || 0) + 1
      return acc
    }, {})
  ).map(([category, count]) => ({
    category,
    count: count as number
  })).sort((a, b) => b.count - a.count).slice(0, 5)

  // Dados por prioridade
  const priorityData = Object.entries(
    services.reduce((acc: any, s: any) => {
      acc[s.priority] = (acc[s.priority] || 0) + 1
      return acc
    }, {})
  ).map(([priority, count]) => ({
    priority,
    count: count as number
  }))

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {user.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Bem-vindo ao seu painel de controle
            </p>
          </div>
          {user.role === 'client' && (
            <div className="flex gap-2">
              {!hasUnits && (
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/units/link')}
                >
                  Vincular Unidade
                </Button>
              )}
              <Button onClick={() => router.push('/services/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </div>
          )}
          {(user.role === 'constructor' || user.role === 'admin') && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/developments')}
              >
                Empreendimentos
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/employees')}
              >
                Funcionários
              </Button>
              <Button onClick={() => router.push('/services')}>
                Ver Serviços
              </Button>
              <Button onClick={() => router.push('/services/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </div>
          )}
        </div>

        {user.role === 'client' && !hasUnits && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Importante:</strong> Você precisa vincular uma unidade antes de criar serviços.
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/units/link')}
                className="ml-2"
              >
                Vincular Unidade Agora
              </Button>
            </p>
          </div>
        )}

        {isLoadingServices ? (
          <DashboardStatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Serviços</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Wrench className="w-8 h-8 text-primary-600" />
              </div>
            </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        )}

        {/* Seção de Badges */}
        {badgesData?.data && badgesData.data.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <BadgeDisplay badges={badgesData.data} maxDisplay={4} />
          </div>
        )}

        {/* Mapa Interativo */}
        {services.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mapa de Serviços</h2>
            <ServicesMap 
              services={services} 
              showRouteOptimization={true}
              userRole={user?.role}
            />
          </div>
        )}

        {/* Seção de Gráficos Interativos */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Distribuição por Status</h2>
              </div>
              {statusChartData.length > 0 ? (
                <ServiceStatusChart data={statusChartData} />
              ) : (
                <p className="text-gray-500 text-center py-8">Sem dados para exibir</p>
              )}
            </div>

            {/* Gráfico de Tendência */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Tendência (7 dias)</h2>
              </div>
              <ServiceTrendChart data={getTrendData()} />
            </div>

            {/* Gráfico de Categorias */}
            {categoryData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <Wrench className="w-5 h-5 mr-2 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Top Categorias</h2>
                </div>
                <CategoryChart data={categoryData} />
              </div>
            )}

            {/* Gráfico de Prioridades */}
            {priorityData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-5 h-5 mr-2 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Distribuição por Prioridade</h2>
                </div>
                <PriorityChart data={priorityData} />
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Serviços Recentes</h2>
            <Button onClick={() => router.push('/services')} variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoadingServices ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length > 0 ? (
              services.slice(0, 5).map((service: any) => (
              <div 
                key={service.id} 
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/services/${service.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-600">{service.category}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      service.status === 'completed' ? 'bg-green-100 text-green-800' :
                      service.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {service.status === 'completed' ? 'Concluído' :
                       service.status === 'in_progress' ? 'Em Andamento' :
                       service.status === 'pending' ? 'Pendente' :
                       service.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/services/${service.id}`)
                      }}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 mb-4">Nenhum serviço encontrado</p>
                {user?.role === 'client' && (
                  <Button onClick={() => router.push('/services/new')}>
                    Criar Primeiro Serviço
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

