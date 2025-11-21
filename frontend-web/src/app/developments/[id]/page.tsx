'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Plus, Building2, MapPin, Home, Copy, Check } from 'lucide-react'

export default function DevelopmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const developmentId = Array.isArray(params.id) ? params.id[0] : params.id

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

  const { data: developmentData, isLoading } = useQuery({
    queryKey: ['development', developmentId],
    queryFn: async () => {
      const response = await api.get(`/developments/${developmentId}`)
      return response.data
    },
    enabled: !!user && !!developmentId,
  })

  const { data: unitsData, refetch: refetchUnits } = useQuery({
    queryKey: ['development-units', developmentId],
    queryFn: async () => {
      const response = await api.get(`/developments/${developmentId}/units`)
      return response.data
    },
    enabled: !!user && !!developmentId,
  })

  const development = developmentData?.data
  const units = unitsData?.data || []

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Carregando...</div>
          </div>
        </main>
      </div>
    )
  }

  if (!development) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Empreendimento não encontrado</h2>
            <Button onClick={() => router.push('/developments')}>
              Voltar para Empreendimentos
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-8 h-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-gray-900">{development.name}</h1>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <MapPin className="w-5 h-5" />
                <span>{development.address}, {development.city} - {development.state}</span>
                {development.zip_code && (
                  <span className="ml-2">CEP: {development.zip_code}</span>
                )}
              </div>
            </div>
            <Button onClick={() => router.push(`/developments/${developmentId}/units/new`)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Unidade
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total de Unidades</div>
              <div className="text-2xl font-bold text-gray-900">{units.length}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Unidades Vinculadas</div>
              <div className="text-2xl font-bold text-gray-900">
                {units.filter((u: any) => u.owner_id).length}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Unidades Disponíveis</div>
              <div className="text-2xl font-bold text-gray-900">
                {units.filter((u: any) => !u.owner_id).length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Unidades</h2>
            <Button 
              onClick={() => router.push(`/developments/${developmentId}/units/new`)}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Unidade
            </Button>
          </div>

          {units.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {units.map((unit: any) => (
                <div key={unit.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Home className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {unit.block ? `${unit.block} - ` : ''}{unit.unit_number}
                            {unit.floor && ` (${unit.floor}º andar)`}
                          </h3>
                          {unit.owner_id ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Vinculada
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              Disponível
                            </span>
                          )}
                        </div>
                        {unit.type && (
                          <p className="text-sm text-gray-600 mt-1">Tipo: {unit.type}</p>
                        )}
                        {unit.area && (
                          <p className="text-sm text-gray-600">Área: {unit.area}m²</p>
                        )}
                        {unit.owner_name && (
                          <p className="text-sm text-gray-600 mt-1">
                            Proprietário: {unit.owner_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <code className="text-sm font-mono text-gray-700">{unit.unit_code}</code>
                        <button
                          onClick={() => copyToClipboard(unit.unit_code)}
                          className="text-gray-500 hover:text-gray-700"
                          title="Copiar código"
                        >
                          {copiedCode === unit.unit_code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma unidade cadastrada
              </h3>
              <p className="text-gray-600 mb-6">
                Comece adicionando unidades a este empreendimento
              </p>
              <Button onClick={() => router.push(`/developments/${developmentId}/units/new`)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Unidade
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

