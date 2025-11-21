'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="py-24 bg-primary-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Pronto para começar?
        </h2>
        <p className="text-xl mb-8 text-primary-100">
          Junte-se a milhares de clientes e técnicos que já usam nossa plataforma
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Criar Conta Grátis
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white text-white hover:bg-white/10"
            >
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

