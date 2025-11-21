'use client'

import { Camera, MessageSquare, Calendar, FileText, BarChart, Bell } from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: 'Documentação Visual',
    description: 'Registre problemas com fotos e vídeos para diagnóstico preciso',
  },
  {
    icon: MessageSquare,
    title: 'Chat em Tempo Real',
    description: 'Comunicação direta com técnicos através de chat instantâneo',
  },
  {
    icon: Calendar,
    title: 'Agendamento Inteligente',
    description: 'Agende serviços de forma rápida e receba lembretes automáticos',
  },
  {
    icon: FileText,
    title: 'Relatórios Detalhados',
    description: 'Acompanhe todo o histórico de serviços e garantias',
  },
  {
    icon: BarChart,
    title: 'Dashboard Analítico',
    description: 'Visualize estatísticas e acompanhe o progresso dos serviços',
  },
  {
    icon: Bell,
    title: 'Notificações Inteligentes',
    description: 'Receba atualizações em tempo real sobre seus serviços',
  },
]

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Funcionalidades Inovadoras
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar assistência técnica de forma profissional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

