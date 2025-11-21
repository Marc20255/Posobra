'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { toastService } from '@/lib/toast'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [showAccountSelection, setShowAccountSelection] = useState(false)
  const [loginData, setLoginData] = useState<LoginForm | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setError('')
    setLoading(true)
    setLoginData(data)

    try {
      const response = await authService.login(data.email, data.password)
      
      // Verificar se houve erro na resposta
      if (!response.success) {
        const errorMessage = response.message || 'Erro ao fazer login'
        setError(errorMessage)
        toastService.error(errorMessage)
        setLoading(false)
        return
      }
      
      // Se retornar múltiplas contas, mostrar seleção
      if (response.data?.accounts && response.data.accounts.length > 1) {
        setAccounts(response.data.accounts)
        setShowAccountSelection(true)
        setLoading(false)
        return
      }

      // Verificar se tem token e user antes de redirecionar
      if (response.data?.token && response.data?.user) {
        toastService.success('Login realizado com sucesso!')
        router.push('/dashboard')
      } else {
        setError('Resposta inválida do servidor')
        toastService.error('Erro ao fazer login: resposta inválida')
      }
    } catch (err: any) {
      console.error('Erro no login:', err)
      
      let errorMessage = 'Erro ao fazer login'
      
      // Erro de rede/conexão
      if (err.code === 'ECONNREFUSED' || err.message === 'Network Error' || !err.response) {
        errorMessage = 'Erro de conexão: O servidor backend não está respondendo. Verifique se o servidor está rodando na porta 3001.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      toastService.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const selectAccount = async (role: string) => {
    if (!loginData) return
    
    setLoading(true)
    try {
      await authService.loginWithRole(loginData.email, loginData.password, role)
      toastService.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login'
      setError(errorMessage)
      toastService.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entrar na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              crie uma nova conta
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>

        {showAccountSelection && accounts.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-3">
              Múltiplas contas encontradas. Escolha qual conta deseja acessar:
            </p>
            <div className="space-y-2">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => selectAccount(account.role)}
                  className="w-full text-left px-4 py-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  disabled={loading}
                >
                  <div className="font-medium text-gray-900">{account.name}</div>
                  <div className="text-sm text-gray-600">
                    {account.role === 'client' ? 'Cliente' :
                     account.role === 'technician' ? 'Técnico' :
                     account.role === 'constructor' ? 'Construtora' :
                     account.role}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowAccountSelection(false)
                setAccounts([])
                setLoginData(null)
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

