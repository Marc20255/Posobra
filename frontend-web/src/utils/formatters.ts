/**
 * Utilitários de formatação
 */

/**
 * Formata valor monetário em Real (BRL)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata data para formato brasileiro
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }

  return new Intl.DateTimeFormat('pt-BR', {
    ...defaultOptions,
    ...options,
  }).format(dateObj)
}

/**
 * Formata data e hora para formato brasileiro
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formata data relativa (ex: "há 2 horas", "há 3 dias")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'agora'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `há ${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'}`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `há ${diffInYears} ${diffInYears === 1 ? 'ano' : 'anos'}`
}

/**
 * Formata CEP (00000-000)
 */
export function formatCEP(cep: string | null | undefined): string {
  if (!cep) return ''

  const numbers = cep.replace(/\D/g, '')
  if (numbers.length <= 5) {
    return numbers
  }

  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
}

/**
 * Formata telefone (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''

  const numbers = phone.replace(/\D/g, '')
  
  if (numbers.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    // Celular: (00) 00000-0000
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
}

/**
 * Trunca texto com ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

