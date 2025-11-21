'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Proprietária',
    content: 'Excelente plataforma! Encontrei um técnico qualificado rapidamente e o problema foi resolvido no mesmo dia.',
    rating: 5,
  },
  {
    name: 'João Santos',
    role: 'Construtor',
    content: 'Uso para gerenciar todos os serviços pós-obra dos meus projetos. Muito prático e organizado.',
    rating: 5,
  },
  {
    name: 'Ana Costa',
    role: 'Arquiteta',
    content: 'A interface é intuitiva e o sistema de chat facilita muito a comunicação com os técnicos.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Depoimentos reais de quem já usa nossa plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.content}&rdquo;</p>
              <div>
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

