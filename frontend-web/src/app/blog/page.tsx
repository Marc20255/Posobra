import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - Assistência Técnica Pós-Obra | Dicas e Guias',
  description: 'Aprenda sobre manutenção, reparos e cuidados pós-obra. Dicas profissionais para manter sua obra em perfeito estado.',
  keywords: 'blog, dicas, manutenção, reparos, pós obra, guias',
}

const posts = [
  {
    id: 1,
    title: 'Como Identificar Problemas Comuns Pós-Obra',
    excerpt: 'Aprenda a identificar e resolver os problemas mais comuns que aparecem após a conclusão de uma obra.',
    author: 'Equipe Pós Obra',
    date: '2024-01-15',
    category: 'Dicas',
    slug: 'identificar-problemas-comuns-pos-obra',
  },
  {
    id: 2,
    title: 'Manutenção Preventiva: Guia Completo',
    excerpt: 'Descubra como a manutenção preventiva pode economizar tempo e dinheiro no longo prazo.',
    author: 'Equipe Pós Obra',
    date: '2024-01-10',
    category: 'Manutenção',
    slug: 'manutencao-preventiva-guia-completo',
  },
  {
    id: 3,
    title: 'Quando Chamar um Técnico Especializado',
    excerpt: 'Saiba quando é necessário chamar um profissional e quando você pode resolver sozinho.',
    author: 'Equipe Pós Obra',
    date: '2024-01-05',
    category: 'Guia',
    slug: 'quando-chamar-tecnico-especializado',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Blog Pós Obra
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dicas, guias e informações úteis sobre assistência técnica pós-obra
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {post.category}
                  </span>
                  <time className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.date).toLocaleDateString('pt-BR')}
                  </time>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary-600 hover:text-primary-700 flex items-center font-medium"
                  >
                    Ler mais
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

