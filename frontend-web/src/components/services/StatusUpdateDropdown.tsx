'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, CheckCircle, Clock, Play, XCircle } from 'lucide-react'
import api from '@/lib/api'
import { toastService } from '@/lib/toast'

interface StatusUpdateDropdownProps {
  currentStatus: string
  serviceId: string
  onStatusUpdate: () => void
}

const statusOptions = [
  { value: 'pending', label: 'Pendente', icon: Clock, color: 'text-yellow-600' },
  { value: 'scheduled', label: 'Agendado', icon: Clock, color: 'text-blue-600' },
  { value: 'in_progress', label: 'Em Andamento', icon: Play, color: 'text-orange-600' },
  { value: 'completed', label: 'Concluído', icon: CheckCircle, color: 'text-green-600' },
]

export function StatusUpdateDropdown({ currentStatus, serviceId, onStatusUpdate }: StatusUpdateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    try {
      await api.put(`/services/${serviceId}`, { status: newStatus })
      toastService.success('Status atualizado com sucesso!')
      setIsOpen(false)
      onStatusUpdate()
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Erro ao atualizar status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getCurrentStatusLabel = () => {
    const status = statusOptions.find(s => s.value === currentStatus)
    return status?.label || currentStatus
  }

  const getCurrentStatusIcon = () => {
    const status = statusOptions.find(s => s.value === currentStatus)
    return status?.icon || Clock
  }

  const CurrentIcon = getCurrentStatusIcon()

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-2"
      >
        <CurrentIcon className="w-4 h-4" />
        {getCurrentStatusLabel()}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
                Atualizar Status
              </div>
              {statusOptions.map((option) => {
                const Icon = option.icon
                const isCurrent = option.value === currentStatus
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={isCurrent || isUpdating}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                      isCurrent ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'text-gray-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${option.color}`} />
                    {option.label}
                    {isCurrent && (
                      <span className="ml-auto text-xs text-gray-400">(atual)</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

