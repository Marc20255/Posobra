import toast from 'react-hot-toast'

export const toastService = {
  success: (message: string) => {
    toast.success(message, {
      icon: '✅',
    })
  },
  
  error: (message: string) => {
    toast.error(message, {
      icon: '❌',
    })
  },
  
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
    })
  },
  
  loading: (message: string) => {
    return toast.loading(message)
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, messages)
  },
}

