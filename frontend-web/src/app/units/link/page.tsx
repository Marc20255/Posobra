'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'

const linkSchema = z.object({
  unit_code: z.string().min(1, 'Código da unidade é obrigatório'),
})

type LinkForm = z.infer<typeof linkSchema>

export default function LinkUnitPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Buscar unidades disponíveis para teste
  const { data: availableUnits, refetch: refetchUnits } = useQuery({
    queryKey: ['available-units'],
    queryFn: async () => {
      const response = await api.get('/test/available-units')
      return response.data
    },
    enabled: !!user,
  })

  // Criar dados de teste
  const createTestData = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post('/test/create-test-data')
      await refetchUnits()
      setSuccess('Dados de teste criados! Escolha uma unidade abaixo ou digite o código.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar dados de teste')
    } finally {
      setLoading(false)
    }
  }

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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
  })

  const onSubmit = async (data: LinkForm) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await api.post('/developments/units/link', data)
      setSuccess('Unidade vinculada com sucesso!')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao vincular unidade')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Vincular Unidade</h1>
              <p className="text-gray-600">
                Digite o código único da sua unidade fornecido pela construtora
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={createTestData}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Criar Dados de Teste
            </Button>
          </div>

          {availableUnits?.data && availableUnits.data.length > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-3">
                Unidades disponíveis para teste (clique para usar):
              </p>
              <div className="space-y-2">
                {availableUnits.data.slice(0, 5).map((unit: any) => (
                  <button
                    key={unit.unit_code}
                    onClick={() => {
                      setValue('unit_code', unit.unit_code)
                      handleSubmit(onSubmit)()
                    }}
                    className="w-full text-left px-4 py-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    <div className="font-mono font-semibold">{unit.unit_code}</div>
                    <div className="text-gray-600">
                      {unit.development_name} - {unit.unit_number} {unit.block && `Bloco ${unit.block}`} {unit.floor && `Andar ${unit.floor}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código da Unidade *
              </label>
              <input
                {...register('unit_code')}
                type="text"
                placeholder="Ex: 1-101-ABC12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-mono"
              />
              {errors.unit_code && (
                <p className="mt-1 text-sm text-red-600">{errors.unit_code.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                O código único foi fornecido pela construtora quando você adquiriu a unidade
              </p>
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
                {loading ? 'Vinculando...' : 'Vincular Unidade'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

