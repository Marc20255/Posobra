'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'

const developmentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zip_code: z.string().optional(),
  total_units: z.number().min(0).optional(),
})

type DevelopmentForm = z.infer<typeof developmentSchema>

export default function NewDevelopmentPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const lastSearchedCep = useRef<string>('')

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DevelopmentForm>({
    resolver: zodResolver(developmentSchema),
    defaultValues: {
      state: 'RO',
      total_units: 0,
    },
  })

  const zipCode = watch('zip_code')

  // Função para formatar CEP (00000-000)
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 5) {
      return numbers
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  // Função para buscar CEP
  const fetchCepData = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    
    if (cleanCep.length !== 8) {
      return
    }

    if (lastSearchedCep.current === cleanCep) {
      return
    }

    lastSearchedCep.current = cleanCep
    setLoadingCep(true)
    setError('')

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setValue('address', data.logradouro || '', { shouldValidate: true })
        setValue('city', data.localidade || '', { shouldValidate: true })
        setValue('state', data.uf || '', { shouldValidate: true })
        setError('')
      } else {
        setError('CEP não encontrado. Por favor, preencha os dados manualmente.')
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err)
    } finally {
      setLoadingCep(false)
    }
  }, [setValue])

  // Monitora mudanças no CEP
  useEffect(() => {
    if (zipCode) {
      const cleanCep = zipCode.replace(/\D/g, '')
      if (cleanCep.length === 8) {
        const timeoutId = setTimeout(() => {
          fetchCepData(cleanCep)
        }, 500)

        return () => clearTimeout(timeoutId)
      } else {
        lastSearchedCep.current = ''
      }
    }
  }, [zipCode, fetchCepData])

  const onSubmit = async (data: DevelopmentForm) => {
    setError('')
    setLoading(true)

    try {
      await api.post('/developments', {
        ...data,
        total_units: data.total_units || 0,
      })
      // Invalidar cache para atualizar a lista
      await queryClient.invalidateQueries({ queryKey: ['developments'] })
      router.push('/developments')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar empreendimento')
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
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Empreendimento</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Empreendimento *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Residencial Jardim das Flores"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <div className="relative">
                  <input
                    {...register('zip_code')}
                    type="text"
                    maxLength={9}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 pr-10"
                    placeholder="00000-000"
                    onChange={(e) => {
                      const formatted = formatCep(e.target.value)
                      setValue('zip_code', formatted)
                    }}
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <input
                  {...register('state')}
                  type="text"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
                  placeholder="RO"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço *
              </label>
              <input
                {...register('address')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade *
              </label>
              <input
                {...register('city')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total de Unidades (opcional)
              </label>
              <input
                {...register('total_units', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
              <p className="mt-1 text-sm text-gray-500">
                Você pode adicionar unidades depois de criar o empreendimento
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
                {loading ? 'Criando...' : 'Criar Empreendimento'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

