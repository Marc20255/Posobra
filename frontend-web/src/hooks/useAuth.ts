import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import type { User } from '@/types/user'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => void
  refreshUser: () => void
}

/**
 * Hook customizado para gerenciar autenticação
 * Fornece estado do usuário, loading e métodos de autenticação
 */
export function useAuth(requireAuth: boolean = false): UseAuthReturn {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getUser()
    setUser(currentUser)
    setLoading(false)

    if (requireAuth && !currentUser) {
      router.push('/login')
    }
  }, [router, requireAuth])

  const logout = () => {
    authService.logout()
    setUser(null)
    router.push('/')
  }

  const refreshUser = () => {
    const currentUser = authService.getUser()
    setUser(currentUser)
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
  }
}

