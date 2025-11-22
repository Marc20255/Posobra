/**
 * Tipos comuns para respostas da API
 */

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Array<{ field: string; message: string }>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: Array<{ field: string; message: string }>
}

