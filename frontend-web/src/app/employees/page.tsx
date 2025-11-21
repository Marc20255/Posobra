'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth'
import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toastService } from '@/lib/toast'
import { Plus, User, Mail, Phone, MapPin, Briefcase, Edit, Trash2, X, Loader2, Calendar } from 'lucide-react'

export default function EmployeesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'technician',
    department: '',
    hired_date: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    cpf: ''
  })

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    const currentUser = authService.getUser()
    if (currentUser?.role !== 'constructor' && currentUser?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    setUser(currentUser)
  }, [router])

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await api.get('/employees')
      return response.data
    },
    enabled: !!user,
  })

  const employees = employeesData?.data || []

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/employees', data)
      return response.data
    },
    onSuccess: () => {
      toastService.success('Funcionário cadastrado com sucesso!')
      setShowModal(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: any) => {
      toastService.error(error?.response?.data?.message || 'Erro ao cadastrar funcionário')
    },
  })

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await api.put(`/employees/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      toastService.success('Funcionário atualizado com sucesso!')
      setShowModal(false)
      setEditingEmployee(null)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: any) => {
      toastService.error(error?.response?.data?.message || 'Erro ao atualizar funcionário')
    },
  })

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/employees/${id}`)
      return response.data
    },
    onSuccess: () => {
      toastService.success('Funcionário removido com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: any) => {
      toastService.error(error?.response?.data?.message || 'Erro ao remover funcionário')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'technician',
      department: '',
      hired_date: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      cpf: ''
    })
    setEditingEmployee(null)
  }

  const handleOpenModal = (employee?: any) => {
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        password: '',
        phone: employee.phone || '',
        role: employee.role || 'technician',
        department: employee.department || '',
        hired_date: employee.hired_date || '',
        address: employee.address || '',
        city: employee.city || '',
        state: employee.state || '',
        zip_code: employee.zip_code || '',
        cpf: employee.cpf || ''
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEmployee(null)
    resetForm()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingEmployee) {
      const updateData: any = {
        role: formData.role,
        department: formData.department,
        hired_date: formData.hired_date || null
      }
      updateEmployeeMutation.mutate({ id: editingEmployee.id, data: updateData })
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        toastService.error('Preencha todos os campos obrigatórios')
        return
      }
      createEmployeeMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja remover ${name} da lista de funcionários?`)) {
      deleteEmployeeMutation.mutate(id)
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      technician: 'Técnico',
      supervisor: 'Supervisor',
      manager: 'Gerente',
      other: 'Outro'
    }
    return labels[role] || role
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
            <p className="mt-2 text-gray-600">Gerencie seus funcionários e técnicos</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Funcionário
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12 text-gray-500">Carregando...</div>
          </div>
        ) : employees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee: any) => (
              <div key={employee.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      {employee.avatar_url ? (
                        <img
                          src={employee.avatar_url}
                          alt={employee.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-600 font-semibold text-lg">
                          {employee.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <span className="inline-block px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full mt-1">
                        {getRoleLabel(employee.role)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(employee)}
                      className="p-1 text-gray-400 hover:text-primary-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id, employee.name)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {employee.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {employee.phone}
                    </div>
                  )}
                  {employee.department && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      {employee.department}
                    </div>
                  )}
                  {employee.city && employee.state && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {employee.city}, {employee.state}
                    </div>
                  )}
                  {employee.hired_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Admitido em {new Date(employee.hired_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  <div className="pt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      employee.is_active && employee.user_is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.is_active && employee.user_is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum funcionário cadastrado</h3>
            <p className="text-gray-600 mb-6">Comece cadastrando seu primeiro funcionário</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Funcionário
            </Button>
          </div>
        )}
      </main>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {editingEmployee ? 'Editar Funcionário' : 'Cadastrar Funcionário'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={!editingEmployee}
                    disabled={!!editingEmployee}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required={!editingEmployee}
                    disabled={!!editingEmployee}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {!editingEmployee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!!editingEmployee}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Função *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="technician">Técnico</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Gerente</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Ex: Hidráulica, Elétrica..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Admissão
                  </label>
                  <input
                    type="date"
                    value={formData.hired_date}
                    onChange={(e) => setFormData({ ...formData, hired_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {!editingEmployee && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF
                      </label>
                      <input
                        type="text"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) })}
                        maxLength={2}
                        placeholder="SP"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1 w-full sm:w-auto"
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                  className="flex-1 w-full sm:w-auto"
                  size="sm"
                >
                  {(createEmployeeMutation.isPending || updateEmployeeMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      {editingEmployee ? 'Atualizar' : 'Cadastrar'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

