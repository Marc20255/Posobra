import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { handleApiError } from '@/lib/errorHandler'
import { toastService } from '@/lib/toast'
import type { Service, ServiceForm, ServiceFilters } from '@/types/service'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

/**
 * Hook para buscar serviços com filtros
 */
export function useServices(filters?: ServiceFilters) {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Service[]>>('/services', {
        params: filters,
      })
      return response.data
    },
    staleTime: 10000, // 10 segundos
    refetchInterval: 30000, // 30 segundos
  })
}

/**
 * Hook para buscar um serviço específico
 */
export function useService(id: string | number) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Service>>(`/services/${id}`)
      return response.data
    },
    enabled: !!id,
    staleTime: 5000,
  })
}

/**
 * Hook para criar um novo serviço
 */
export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ServiceForm) => {
      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'photos' && value instanceof Array) {
          value.forEach((photo) => {
            if (photo instanceof File) {
              formData.append('photos', photo)
            }
          })
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      const response = await api.post<ApiResponse<Service>>('/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toastService.success('Serviço criado com sucesso!')
    },
    onError: (error) => {
      handleApiError(error, 'Erro ao criar serviço')
    },
  })
}

/**
 * Hook para atualizar um serviço
 */
export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ServiceForm> }) => {
      const response = await api.put<ApiResponse<Service>>(`/services/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['service', variables.id] })
      toastService.success('Serviço atualizado com sucesso!')
    },
    onError: (error) => {
      handleApiError(error, 'Erro ao atualizar serviço')
    },
  })
}

/**
 * Hook para deletar um serviço
 */
export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiResponse<void>>(`/services/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toastService.success('Serviço deletado com sucesso!')
    },
    onError: (error) => {
      handleApiError(error, 'Erro ao deletar serviço')
    },
  })
}

