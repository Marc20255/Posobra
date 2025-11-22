'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log do erro
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
    
    // Callback opcional para tratamento externo (ex: enviar para Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Se houver um fallback customizado, usar ele
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback padrão
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Algo deu errado
            </h2>
            
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm text-red-800 font-mono break-all">
                  {this.state.error.message || 'Erro desconhecido'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} variant="primary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Recarregar Página
              </Button>
              
              <Link href="/">
                <Button variant="ghost">
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Início
                </Button>
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

