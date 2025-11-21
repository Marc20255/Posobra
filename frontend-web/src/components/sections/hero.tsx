'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Wrench, Shield, Clock, Star, Building2, User, HardHat, CheckCircle2 } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              ✨ Solução Completa para Pós-Obra
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Assistência Técnica
              <br />
              <span className="text-primary-200">Pós-Obra Profissional</span>
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-primary-100 max-w-2xl mx-auto lg:mx-0">
              Conecte-se com técnicos qualificados e resolva problemas de forma rápida e eficiente.
              Sua obra merece o melhor cuidado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                  Começar Agora
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  Entrar
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 max-w-2xl mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <Wrench className="w-10 h-10 mx-auto lg:mx-0 mb-2 text-primary-200" />
                <div className="text-2xl md:text-3xl font-bold">500+</div>
                <div className="text-primary-200 text-xs md:text-sm">Técnicos</div>
              </div>
              <div className="text-center lg:text-left">
                <Shield className="w-10 h-10 mx-auto lg:mx-0 mb-2 text-primary-200" />
                <div className="text-2xl md:text-3xl font-bold">10k+</div>
                <div className="text-primary-200 text-xs md:text-sm">Serviços</div>
              </div>
              <div className="text-center lg:text-left">
                <Clock className="w-10 h-10 mx-auto lg:mx-0 mb-2 text-primary-200" />
                <div className="text-2xl md:text-3xl font-bold">24/7</div>
                <div className="text-primary-200 text-xs md:text-sm">Disponível</div>
              </div>
              <div className="text-center lg:text-left">
                <Star className="w-10 h-10 mx-auto lg:mx-0 mb-2 text-primary-200 fill-primary-200" />
                <div className="text-2xl md:text-3xl font-bold">4.8</div>
                <div className="text-primary-200 text-xs md:text-sm">Avaliação</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Representation */}
          <div className="relative hidden lg:block">
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Illustration showing Construtora, Técnico e Cliente */}
              <div className="space-y-6">
                {/* Construtora */}
                <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="w-16 h-16 bg-primary-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-primary-800" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">Construtora</span>
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                    </div>
                    <p className="text-sm text-primary-100">Gerencia empreendimentos e acompanha serviços</p>
                  </div>
                </div>

                {/* Técnico */}
                <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 ml-8">
                  <div className="w-16 h-16 bg-primary-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <HardHat className="w-8 h-8 text-primary-800" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">Técnico</span>
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                    </div>
                    <p className="text-sm text-primary-100">Executa serviços com qualidade e agilidade</p>
                  </div>
                </div>

                {/* Cliente */}
                <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="w-16 h-16 bg-primary-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-primary-800" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">Cliente</span>
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                    </div>
                    <p className="text-sm text-primary-100">Acompanha serviços e avalia atendimento</p>
                  </div>
                </div>

                {/* Connection Lines */}
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-1 h-32 bg-gradient-to-b from-primary-300 to-primary-500 opacity-50"></div>
                
                {/* Success Badge */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-4 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

