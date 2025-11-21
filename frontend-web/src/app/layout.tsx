import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Assistência Técnica Pós-Obra - Soluções Profissionais',
  description: 'Plataforma completa para gestão de assistência técnica pós-obra. Conecte-se com técnicos qualificados e resolva problemas rapidamente.',
  keywords: 'assistência técnica, pós obra, reparos, manutenção, construção, técnicos qualificados',
  authors: [{ name: 'Pós Obra' }],
  creator: 'Pós Obra',
  publisher: 'Pós Obra',
  openGraph: {
    title: 'Assistência Técnica Pós-Obra',
    description: 'Soluções profissionais para problemas pós-obra',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Pós Obra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assistência Técnica Pós-Obra',
    description: 'Soluções profissionais para problemas pós-obra',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

