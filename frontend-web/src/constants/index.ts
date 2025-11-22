/**
 * Constantes centralizadas da aplicação
 */

export const SERVICE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const SERVICE_STATUS_LABELS: Record<typeof SERVICE_STATUS[keyof typeof SERVICE_STATUS], string> = {
  [SERVICE_STATUS.PENDING]: 'Pendente',
  [SERVICE_STATUS.IN_PROGRESS]: 'Em Andamento',
  [SERVICE_STATUS.COMPLETED]: 'Concluído',
  [SERVICE_STATUS.CANCELLED]: 'Cancelado',
}

export const SERVICE_STATUS_COLORS: Record<typeof SERVICE_STATUS[keyof typeof SERVICE_STATUS], string> = {
  [SERVICE_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [SERVICE_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [SERVICE_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [SERVICE_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
}

export const SERVICE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export const SERVICE_PRIORITY_LABELS: Record<typeof SERVICE_PRIORITY[keyof typeof SERVICE_PRIORITY], string> = {
  [SERVICE_PRIORITY.LOW]: 'Baixa',
  [SERVICE_PRIORITY.MEDIUM]: 'Média',
  [SERVICE_PRIORITY.HIGH]: 'Alta',
  [SERVICE_PRIORITY.URGENT]: 'Urgente',
}

export const SERVICE_PRIORITY_COLORS: Record<typeof SERVICE_PRIORITY[keyof typeof SERVICE_PRIORITY], string> = {
  [SERVICE_PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
  [SERVICE_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
  [SERVICE_PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
  [SERVICE_PRIORITY.URGENT]: 'bg-red-100 text-red-800',
}

export const USER_ROLES = {
  CLIENT: 'client',
  TECHNICIAN: 'technician',
  ADMIN: 'admin',
  CONSTRUCTOR: 'constructor',
} as const

export const USER_ROLE_LABELS: Record<typeof USER_ROLES[keyof typeof USER_ROLES], string> = {
  [USER_ROLES.CLIENT]: 'Cliente',
  [USER_ROLES.TECHNICIAN]: 'Técnico',
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.CONSTRUCTOR]: 'Construtora',
}

// Categorias de serviços comuns
export const SERVICE_CATEGORIES = [
  'Elétrica',
  'Hidráulica',
  'Pintura',
  'Alvenaria',
  'Acabamento',
  'Portas e Janelas',
  'Pisos',
  'Telhado',
  'Gesso',
  'Outros',
] as const

// Timeouts e intervalos
export const API_TIMEOUT = 10000 // 10 segundos
export const QUERY_STALE_TIME = 10000 // 10 segundos
export const QUERY_REFETCH_INTERVAL = 30000 // 30 segundos

// Paginação padrão
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

