import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function LoadingSpinner({
  message,
  size = 'md',
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-primary-600', sizeClasses[size])} />
      {message && (
        <p className="mt-4 text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    )
  }

  return content
}

