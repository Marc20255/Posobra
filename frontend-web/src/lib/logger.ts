/**
 * Logger utilitário que só loga em desenvolvimento
 * Em produção, pode ser integrado com serviços de monitoramento (Sentry, etc)
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args)
    }
  },
  
  error: (...args: any[]) => {
    // Sempre logar erros, mas em produção enviar para serviço de monitoramento
    if (isDevelopment) {
      console.error('[ERROR]', ...args)
    } else {
      // Em produção, aqui você pode enviar para Sentry, LogRocket, etc
      // Exemplo: Sentry.captureException(args[0])
      console.error('[ERROR]', ...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args)
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args)
    }
  },
}

