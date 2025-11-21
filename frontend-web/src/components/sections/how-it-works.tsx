'use client'

import { UserPlus, Search, MessageCircle, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: '1. Crie sua conta',
    description: 'Cadastre-se gratuitamente como cliente ou técnico',
  },
  {
    icon: Search,
    title: '2. Encontre ou seja encontrado',
    description: 'Clientes encontram técnicos qualificados. Técnicos recebem solicitações',
  },
  {
    icon: MessageCircle,
    title: '3. Comunique-se',
    description: 'Use o chat para alinhar detalhes e agendar o serviço',
  },
  {
    icon: CheckCircle,
    title: '4. Conclua e avalie',
    description: 'Após o serviço, avalie e deixe seu feedback',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Processo simples e eficiente em apenas 4 passos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white mb-4">
                  <Icon className="w-8 h-8" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

