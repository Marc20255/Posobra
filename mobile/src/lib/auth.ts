import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'

export interface User {
  id: number
  name: string
  email: string
  role: 'client' | 'technician' | 'admin'
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
    role?: 'client' | 'technician'
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.data.token)
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    return response.data
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    })
    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.data.token)
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    return response.data
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token')
  },

  async getUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken()
    return token !== null
  },
}

