/**
 * Tipos relacionados a serviços
 */

export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type ServicePriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Service {
  id: number
  title: string
  description: string
  category: string
  priority: ServicePriority
  status: ServiceStatus
  address: string
  city: string
  state: string
  zip_code: string
  latitude?: number
  longitude?: number
  client_id: number
  technician_id?: number | null
  unit_id?: number | null
  created_at: string
  updated_at: string
  completed_date?: string | null
  scheduled_date?: string | null
  maintenance_cost?: number | null
  client_name?: string
  technician_name?: string
  photos?: string[]
}

export interface ServiceForm {
  title: string
  description: string
  category: string
  priority: ServicePriority
  address: string
  city: string
  state: string
  zip_code: string
  scheduled_date?: string
  technician_id?: number
  unit_id?: number
  maintenance_cost?: number
  photos?: File[]
}

export interface ServiceFilters {
  status?: ServiceStatus
  priority?: ServicePriority
  category?: string
  technician_id?: number
  client_id?: number
  page?: number
  limit?: number
}

