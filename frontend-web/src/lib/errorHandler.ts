import { toastService } from './toast'
import { logger } from './logger'

export interface ApiError {
  response?: {
    status: number
    data?: {
      message?: string
      errors?: Array<{ field: string; message: string }>
    }
  }
  request?: any
  message?: string
  code?: string
}

/**
 * Trata erros da API de forma centralizada
 * @param error - Erro da API
 * @param customMessage - Mensagem customizada opcional
 */
export const handleApiError = (error: any, customMessage?: string): void => {
  const apiError = error as ApiError

  // Log do erro para debugging
  logger.error('API Error:', {
    url: error?.config?.url,
    status: apiError.response?.status,
    message: apiError.response?.data?.message,
    error: apiError.message,
    code: apiError.code,
  })

  // Erro de rede/conexão
  if (apiError.code === 'ECONNREFUSED' || apiError.message === 'Network Error' || !apiError.response) {
    const message = customMessage || 'Erro de conexão. Verifique sua internet e tente novamente.'
    toastService.error(message)
    return
  }

  // Erro de timeout
  if (apiError.code === 'ECONNABORTED' || apiError.message?.includes('timeout')) {
    toastService.error('A requisição demorou muito para responder. Tente novamente.')
    return
  }

  // Erros HTTP específicos
  if (apiError.response) {
    const status = apiError.response.status
    const message = apiError.response.data?.message || customMessage || 'Erro desconhecido'

    switch (status) {
      case 400:
        // Erro de validação
        const validationErrors = apiError.response.data?.errors
        if (validationErrors && validationErrors.length > 0) {
          const firstError = validationErrors[0]
          toastService.error(`Dados inválidos: ${firstError.message}`)
        } else {
          toastService.error(message || 'Dados inválidos. Verifique os campos preenchidos.')
        }
        break

      case 401:
        // Não autenticado - já tratado no interceptor, mas pode mostrar mensagem
        toastService.error('Sessão expirada. Faça login novamente.')
        break

      case 403:
        toastService.error('Você não tem permissão para realizar esta ação.')
        break

      case 404:
        toastService.error('Recurso não encontrado.')
        break

      case 409:
        toastService.error(message || 'Conflito: Este recurso já existe.')
        break

      case 422:
        toastService.error(message || 'Dados inválidos. Verifique os campos preenchidos.')
        break

      case 429:
        toastService.error('Muitas requisições. Aguarde um momento e tente novamente.')
        break

      case 500:
        toastService.error('Erro interno do servidor. Tente novamente mais tarde.')
        break

      case 503:
        toastService.error('Serviço temporariamente indisponível. Tente novamente mais tarde.')
        break

      default:
        toastService.error(message || `Erro ${status}: Algo deu errado.`)
    }
  } else {
    // Erro desconhecido
    toastService.error(customMessage || 'Erro inesperado. Tente novamente.')
  }
}

/**
 * Extrai mensagem de erro de forma segura
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'Erro desconhecido'
}

