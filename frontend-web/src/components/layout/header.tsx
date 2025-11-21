'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Bell, User, LogOut, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const currentUser = authService.getUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    authService.logout()
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Pós Obra
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/services">
                  <Button variant="ghost">Serviços</Button>
                </Link>
                {(user.role === 'constructor' || user.role === 'admin') && (
                  <>
                    <Link href="/developments">
                      <Button variant="ghost">Empreendimentos</Button>
                    </Link>
                    <Link href="/employees">
                      <Button variant="ghost">Funcionários</Button>
                    </Link>
                  </>
                )}
                {user.role === 'client' && (
                  <Link href="/technicians">
                    <Button variant="ghost">Técnicos</Button>
                  </Link>
                )}
                <Link href="/notifications">
                  <Button variant="ghost" className="relative">
                    <Bell className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost">
                    <User className="w-5 h-5 mr-2" />
                    {user.name}
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button>Criar Conta</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {user ? (
              <>
                <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100 rounded">
                  Dashboard
                </Link>
                <Link href="/services" className="block px-4 py-2 hover:bg-gray-100 rounded">
                  Serviços
                </Link>
                {(user.role === 'constructor' || user.role === 'admin') && (
                  <>
                    <Link href="/developments" className="block px-4 py-2 hover:bg-gray-100 rounded">
                      Empreendimentos
                    </Link>
                    <Link href="/employees" className="block px-4 py-2 hover:bg-gray-100 rounded">
                      Funcionários
                    </Link>
                  </>
                )}
                {user.role === 'client' && (
                  <Link href="/technicians" className="block px-4 py-2 hover:bg-gray-100 rounded">
                    Técnicos
                  </Link>
                )}
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 rounded">
                  Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 hover:bg-gray-100 rounded">
                  Entrar
                </Link>
                <Link href="/register" className="block px-4 py-2 hover:bg-gray-100 rounded">
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

