'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toastService } from '@/lib/toast'
import { Plus, Building2, MapPin, Home, Wrench, Trash2 } from 'lucide-react'

export default function DevelopmentsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    const currentUser = authService.getUser()
    if (currentUser?.role !== 'constructor' && currentUser?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    setUser(currentUser)
  }, [router])

  const { data: developmentsData, isLoading, refetch } = useQuery({
    queryKey: ['developments'],
    queryFn: async () => {
      const response = await api.get('/developments')
      return response.data
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
  })

  const developments = developmentsData?.data || []

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o empreendimento "${name}"?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    setDeletingId(id)
    try {
      await api.delete(`/developments/${id}`)
      // Invalidar cache para atualizar a lista
      await queryClient.invalidateQueries({ queryKey: ['developments'] })
      toastService.success('Empreendimento excluído com sucesso')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao excluir empreendimento'
      toastService.error(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empreendimentos</h1>
            <p className="mt-2 text-gray-600">Gerencie seus empreendimentos e unidades</p>
          </div>
          <Button onClick={() => router.push('/developments/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Empreendimento
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Carregando...</div>
          </div>
        ) : developments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developments.map((development: any) => (
              <div
                key={development.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => router.push(`/developments/${development.id}`)}
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{development.name}</h3>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{development.city}, {development.state}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(development.id, development.name)
                    }}
                    disabled={deletingId === development.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    title="Excluir empreendimento"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div 
                  className="space-y-2 mt-4 cursor-pointer"
                  onClick={() => router.push(`/developments/${development.id}`)}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Home className="w-4 h-4" />
                      <span>Unidades</span>
                    </div>
                    <span className="font-semibold text-gray-900">{development.units_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Wrench className="w-4 h-4" />
                      <span>Serviços</span>
                    </div>
                    <span className="font-semibold text-gray-900">{development.services_count || 0}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/developments/${development.id}`)
                  }}
                >
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum empreendimento cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando seu primeiro empreendimento
            </p>
            <Button onClick={() => router.push('/developments/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Empreendimento
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

