import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quiz de Trânsito',
  description: 'Aprenda e teste seus conhecimentos sobre legislação de trânsito',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-navy-900 text-white min-h-screen`}>
        <header className="border-b border-gray-800">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-cyan-400 text-2xl font-bold">
                  Quiz de Trânsito
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/quiz" className="nav-link">Quiz</Link>
                <Link href="/ranking" className="nav-link">Ranking</Link>
                <Link href="/placas" className="nav-link">Placas</Link>
                <Link href="/flashcards" className="nav-link">Flashcards</Link>
                <Link href="/cursos" className="nav-link">Cursos</Link>
                <Link href="/loja" className="nav-link">Loja</Link>
                <Link href="/sobre" className="nav-link">Sobre Nós</Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-cyan-400 border border-cyan-400 px-4 py-2 rounded hover:bg-cyan-400 hover:text-navy-900 transition-colors">
                  Login
                </Link>
                <Link href="/cadastro" className="bg-cyan-400 text-navy-900 px-4 py-2 rounded hover:bg-cyan-500 transition-colors">
                  Inscreva-se
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
} 