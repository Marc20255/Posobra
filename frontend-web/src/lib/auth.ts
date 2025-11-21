import api from './api'

export interface User {
  id: number
  name: string
  email: string
  role: 'client' | 'technician' | 'admin' | 'constructor'
  phone?: string
  avatar_url?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

export const authService = {
  async register(data: {
    name: string
    email: string
    password: string
    phone?: string
    role?: 'client' | 'technician' | 'constructor'
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    if (response.data.success && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    return response.data
  },

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await api.post<any>('/auth/login', {
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
      return response.data
    } catch (error: any) {
      console.error('Erro no login:', error)
      throw error
    }
  },

  async loginWithRole(email: string, password: string, role: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login-with-role', {
      email,
      password,
      role,
    })
    if (response.data.success && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    return response.data
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

