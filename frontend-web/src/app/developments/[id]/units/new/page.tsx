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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

const unitSchema = z.object({
  unit_number: z.string().min(1, 'Número da unidade é obrigatório'),
  block: z.string().optional(),
  floor: z.number().optional(),
  type: z.string().optional(),
  area: z.number().optional(),
})

type UnitForm = z.infer<typeof unitSchema>

export default function NewUnitPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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

  const { data: developmentData } = useQuery({
    queryKey: ['development', developmentId],
    queryFn: async () => {
      const response = await api.get(`/developments/${developmentId}`)
      return response.data
    },
    enabled: !!user && !!developmentId,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitForm>({
    resolver: zodResolver(unitSchema),
  })

  const development = developmentData?.data

  const onSubmit = async (data: UnitForm) => {
    setError('')
    setLoading(true)

    try {
      await api.post(`/developments/${developmentId}/units`, {
        ...data,
        floor: data.floor || null,
        area: data.area || null,
      })
      // Invalidar cache para atualizar a lista
      await queryClient.invalidateQueries({ queryKey: ['development-units', developmentId] })
      await queryClient.invalidateQueries({ queryKey: ['development', developmentId] })
      await queryClient.invalidateQueries({ queryKey: ['developments'] })
      router.push(`/developments/${developmentId}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar unidade')
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/developments/${developmentId}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nova Unidade</h1>
          {development && (
            <p className="text-gray-600 mb-6">
              Empreendimento: <strong>{development.name}</strong>
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número da Unidade *
                </label>
                <input
                  {...register('unit_number')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: 101, 202, A-301"
                />
                {errors.unit_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bloco (opcional)
                </label>
                <input
                  {...register('block')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: A, B, C"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Andar (opcional)
                </label>
                <input
                  {...register('floor', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: 1, 2, 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo (opcional)
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione...</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Loja">Loja</option>
                  <option value="Sala Comercial">Sala Comercial</option>
                  <option value="Cobertura">Cobertura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área (m²) (opcional)
                </label>
                <input
                  {...register('area', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: 75.5"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Um código único será gerado automaticamente para esta unidade. 
                Este código será usado pelos clientes para vincular suas unidades.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/developments/${developmentId}`)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Criando...' : 'Criar Unidade'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

