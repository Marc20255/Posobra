'use client'

import { Building2, HardHat, User, CheckCircle2, ArrowRight, Star, Smile, TrendingUp } from 'lucide-react'

export function Satisfaction() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
            ✨ Todos Satisfeitos
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Construtora, Técnico e Cliente
            <br />
            <span className="text-primary-600">Trabalhando Juntos</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma plataforma que une todos os envolvidos em um ciclo completo de satisfação e qualidade
          </p>
        </div>

        {/* Main Visual - Three Characters Satisfied */}
        <div className="relative mb-20">
          <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50 rounded-3xl p-12 border-2 border-primary-100 shadow-2xl">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Construtora */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                    <Building2 className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                    <Smile className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Construtora</h3>
                <p className="text-gray-600 mb-4">
                  Controle total sobre empreendimentos e qualidade dos serviços
                </p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">100% Satisfeita</span>
                </div>
              </div>

              {/* Connection Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-12 h-12 text-primary-400" />
              </div>

              {/* Técnico */}
              <div className="text-center group relative">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  ⭐ Mais Avaliado
                </div>
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                    <HardHat className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                    <Smile className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Técnico</h3>
                <p className="text-gray-600 mb-4">
                  Recebe serviços, constrói reputação e cresce profissionalmente
                </p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">4.8/5 Estrelas</span>
                </div>
              </div>

              {/* Connection Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-12 h-12 text-primary-400" />
              </div>

              {/* Cliente */}
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                    <Smile className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Cliente</h3>
                <p className="text-gray-600 mb-4">
                  Problemas resolvidos rapidamente com transparência total
                </p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">100% Satisfeito</span>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-full px-6 py-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-green-800">
                  Serviço Concluído com Sucesso!
                </span>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Construtora Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Para Construtoras</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Painel completo de analytics e indicadores</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Gestão de empreendimentos e unidades</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Atribuição inteligente de técnicos</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Controle total sobre qualidade</span>
              </li>
            </ul>
          </div>

          {/* Técnico Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
              Mais Procurado
            </div>
            <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6 mx-auto">
              <HardHat className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Para Técnicos</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Receba serviços automaticamente</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Gerencie sua agenda flexível</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Construa sua reputação com avaliações</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Perfil profissional destacado</span>
              </li>
            </ul>
          </div>

          {/* Cliente Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Para Clientes</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Abertura rápida de chamados</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Acompanhamento em tempo real</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Avaliação detalhada do serviço</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Transparência total no processo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 relative bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 rounded-3xl p-12 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  <div className="w-20 h-20 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="w-20 h-20 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl">
                    <HardHat className="w-10 h-10 text-white" />
                  </div>
                  <div className="w-20 h-20 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl">
                    <User className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    <Star className="w-7 h-7 fill-yellow-300 text-yellow-300" />
                    <span className="text-3xl font-bold">100% Satisfeitos</span>
                  </div>
                  <p className="text-primary-100 text-lg">Todos trabalhando juntos pelo melhor resultado</p>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/30 min-w-[200px]">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">4.8/5</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                  <p className="text-sm text-primary-100">Avaliação média dos serviços</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

