/**
 * Tipos relacionados a usuários e autenticação
 */

export type UserRole = 'client' | 'technician' | 'admin' | 'constructor'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  phone?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

export interface LoginResponse {
  success: boolean
  data?: {
    user: User
    token: string
    requiresRoleSelection?: boolean
    accounts?: Array<{
      id: number
      role: UserRole
      name: string
    }>
  }
  message?: string
}

