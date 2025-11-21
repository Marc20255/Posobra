'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toastService } from '@/lib/toast'
import { User, Mail, Phone, MapPin, Camera, X, Plus, Award } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(authService.getUser())
  }, [router])

  const { data: profileData, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile')
      return response.data
    },
    enabled: !!user,
  })

  // Buscar categorias do técnico
  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ['technician-categories'],
    queryFn: async () => {
      const response = await api.get('/users/profile/categories')
      return response.data
    },
    enabled: !!user && user.role === 'technician',
  })

  const profile = profileData?.data || user
  const categories = categoriesData?.data || []

  // Upload de foto de perfil
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('photo', file)
      const response = await api.post('/upload/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      toastService.success('Foto de perfil atualizada com sucesso!')
      authService.updateUser({ avatar_url: data.data.avatar_url })
      refetch()
    },
    onError: (error: any) => {
      toastService.error(error?.response?.data?.message || 'Erro ao fazer upload da foto')
    },
  })

  // Adicionar categoria
  const addCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      const response = await api.post('/users/profile/categories', { category })
      return response.data
    },
    onSuccess: () => {
      toastService.success('Qualificação adicionada com sucesso!')
      setNewCategory('')
      refetchCategories()
    },
    onError: (error: any) => {
      toastService.error(error?.response?.data?.message || 'Erro ao adicionar qualificação')
    },
  })

  // Remover categoria
  const removeCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      const response = await api.delete(`/users/profile/categories/${encodeURIComponent(category)}`)
      return response.data
    },
    onSuccess: () => {
      toastService.success('Qualificação removida com sucesso!')
      refetchCategories()
    },
    onError: (error: any) => {
      toastService.error(error?.response?.data?.message || 'Erro ao remover qualificação')
    },
  })

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastService.error('Por favor, selecione apenas arquivos de imagem')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toastService.error('A imagem deve ter no máximo 5MB')
        return
      }
      uploadPhotoMutation.mutate(file)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: profile,
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setSuccess('')
    try {
      await api.put('/users/profile', data)
      setSuccess('Perfil atualizado com sucesso!')
      toastService.success('Perfil atualizado com sucesso!')
      refetch()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar perfil'
      toastService.error(errorMessage)
      console.error('Erro ao atualizar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Perfil</h1>

        <div className="bg-white rounded-lg shadow p-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Foto de Perfil */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {profile?.avatar_url ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary-200">
                    <Image
                      src={profile.avatar_url}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center border-4 border-primary-200">
                    <User className="w-12 h-12 text-primary-600" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 shadow-lg hover:bg-primary-700 transition-colors"
                  disabled={uploadPhotoMutation.isPending}
                >
                  {uploadPhotoMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{profile?.name}</h2>
                <p className="text-gray-600">{profile?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {profile?.role === 'client' ? 'Cliente' :
                   profile?.role === 'technician' ? 'Técnico' :
                   profile?.role === 'constructor' ? 'Construtora' :
                   'Usuário'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('email')}
                  type="email"
                  disabled
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Email não pode ser alterado</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="(69) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('address')}
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  {...register('city')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <input
                  {...register('state')}
                  type="text"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  {...register('zip_code')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Qualificações (apenas para técnicos) */}
            {user?.role === 'technician' && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Qualificações</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione suas áreas de especialização para que clientes possam encontrá-lo mais facilmente.
                </p>
                
                {/* Lista de categorias */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((category: string) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategoryMutation.mutate(category)}
                          className="hover:text-primary-900"
                          disabled={removeCategoryMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Adicionar nova categoria */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Ex: Hidráulica, Elétrica, Pintura..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newCategory.trim()) {
                          addCategoryMutation.mutate(newCategory.trim())
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newCategory.trim()) {
                        addCategoryMutation.mutate(newCategory.trim())
                      }
                    }}
                    disabled={!newCategory.trim() || addCategoryMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {/* Categorias sugeridas */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Categorias sugeridas:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Hidráulica', 'Elétrica', 'Pintura', 'Alvenaria', 'Acabamento', 'Marcenaria', 'Gesso', 'Azulejista'].map((cat) => (
                      !categories.includes(cat) && (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => addCategoryMutation.mutate(cat)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          disabled={addCategoryMutation.isPending}
                        >
                          + {cat}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

