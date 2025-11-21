'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { ServiceCardSkeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'
import { toastService } from '@/lib/toast'
import { Plus, Filter, Search, Download, X, Calendar } from 'lucide-react'

export default function ServicesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [showExportModal, setShowExportModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Debounce search term para evitar muitas requisições
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(authService.getUser())
  }, [router])

  const { data: servicesData, isLoading, refetch } = useQuery({
    queryKey: ['services', filterStatus, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())
      const response = await api.get(`/services?${params.toString()}`)
      return response.data
    },
    enabled: !!user,
  })

  const services = servicesData?.data || []
  const pagination = servicesData?.pagination
  // Filtrar serviços usando o termo de busca debounced
  const filteredServices = services.filter((s: any) =>
    s.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  )

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus])

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
            <p className="mt-2 text-gray-600">Gerencie seus serviços</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            {(user.role === 'client' || user.role === 'constructor' || user.role === 'admin') && (
              <Button onClick={() => router.push('/services/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="scheduled">Agendados</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredServices.length > 0 ? (
              filteredServices.map((service: any) => (
                <div
                  key={service.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/services/${service.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.category}</p>
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        service.status === 'completed' ? 'bg-green-100 text-green-800' :
                        service.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        service.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                        service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {service.status === 'completed' ? 'Concluído' :
                         service.status === 'in_progress' ? 'Em Andamento' :
                         service.status === 'scheduled' ? 'Agendado' :
                         service.status === 'pending' ? 'Pendente' :
                         service.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        service.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        service.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        service.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {service.priority === 'urgent' ? 'Urgente' :
                         service.priority === 'high' ? 'Alta' :
                         service.priority === 'medium' ? 'Média' :
                         'Baixa'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                Nenhum serviço encontrado
              </div>
            )}
          </div>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => {
              setCurrentPage(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}

        {/* Modal de Exportação */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Exportar Relatório PDF</h2>
                <button
                  onClick={() => {
                    setShowExportModal(false)
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data de Início (Opcional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data de Fim (Opcional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Filtro atual:</strong> {filterStatus === 'all' ? 'Todos os status' : 
                      filterStatus === 'pending' ? 'Pendentes' :
                      filterStatus === 'scheduled' ? 'Agendados' :
                      filterStatus === 'in_progress' ? 'Em Andamento' :
                      filterStatus === 'completed' ? 'Concluídos' : 'Cancelados'}
                  </p>
                  {startDate && endDate && (
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Período:</strong> {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowExportModal(false)
                      setStartDate('')
                      setEndDate('')
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const params: any = {
                          format: 'pdf'
                        }
                        
                        if (filterStatus !== 'all') {
                          params.status = filterStatus
                        }
                        
                        if (startDate) {
                          params.startDate = startDate
                        }
                        
                        if (endDate) {
                          params.endDate = endDate
                        }

                        const response = await api.get('/reports/services', {
                          params,
                          responseType: 'blob'
                        })
                        
                        // Verificar se a resposta é um PDF válido
                        if (response.data instanceof Blob && response.data.type === 'application/pdf') {
                          const url = window.URL.createObjectURL(response.data)
                          const link = document.createElement('a')
                          link.href = url
                          const fileName = `relatorio-servicos-${startDate || 'inicio'}-${endDate || 'fim'}-${Date.now()}.pdf`
                          link.setAttribute('download', fileName)
                          document.body.appendChild(link)
                          link.click()
                          link.remove()
                          window.URL.revokeObjectURL(url)
                          toastService.success('Relatório exportado com sucesso!')
                          setShowExportModal(false)
                          setStartDate('')
                          setEndDate('')
                        } else {
                          // Se não for PDF, pode ser um erro JSON
                          const text = await response.data.text()
                          try {
                            const errorData = JSON.parse(text)
                            toastService.error(errorData.message || 'Erro ao exportar relatório')
                          } catch {
                            toastService.error('Erro ao exportar relatório: formato inválido')
                          }
                        }
                      } catch (error: any) {
                        console.error('Erro ao exportar PDF:', error)
                        const errorMessage = error.response?.data?.message || error.message || 'Erro ao exportar relatório'
                        toastService.error(errorMessage)
                      }
                    }}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

