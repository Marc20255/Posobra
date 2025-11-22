import api from './api'
import type { User, AuthResponse, LoginResponse } from '@/types/user'
import { ApiResponse } from '@/types/api'
import { logger } from './logger'

export const authService = {
  async register(data: {
    name: string
    email: string
    password: string
    phone?: string
    role?: 'client' | 'technician' | 'constructor'
  }): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse['data']>>('/auth/register', data)
    if (response.data.success && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    return response.data as AuthResponse
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiResponse<LoginResponse['data']>>('/auth/login', {
        email,
        password,
      })
      // Se retornar múltiplas contas, não salvar ainda
      if (response.data.success && !response.data.data?.requiresRoleSelection && typeof window !== 'undefined') {
        if (response.data.data?.token && response.data.data?.user) {
          localStorage.setItem('token', response.data.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.data.user))
        }
      }
      return response.data as LoginResponse
    } catch (error) {
      logger.error('Erro no login:', error)
      throw error
    }
  },

  async loginWithRole(email: string, password: string, role: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse['data']>>('/auth/login-with-role', {
      email,
      password,
      role,
    })
    if (response.data.success && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    return response.data as AuthResponse
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null
  },

  updateUser(userData: Partial<User>): void {
    if (typeof window === 'undefined') return
    const currentUser = this.getUser()
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  },
}

