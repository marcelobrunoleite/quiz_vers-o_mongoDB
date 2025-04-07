import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quiz de Legislação de Trânsito',
  description: 'Aprenda e teste seus conhecimentos sobre legislação de trânsito',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link 
                  href="/" 
                  className="flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Quiz Trânsito
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/quiz" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Quiz
                </Link>
                <Link 
                  href="/flashcards" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Flashcards
                </Link>
                <Link 
                  href="/placas" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Placas
                </Link>
                <Link 
                  href="/ranking" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Ranking
                </Link>
                <Link 
                  href="/cursos" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Cursos
                </Link>
                <Link 
                  href="/auth/login" 
                  className="ml-4 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre</h3>
                <p className="text-gray-600">
                  Aprenda e teste seus conhecimentos sobre legislação de trânsito de forma interativa.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Links Rápidos</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/quiz" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Quiz
                    </Link>
                  </li>
                  <li>
                    <Link href="/flashcards" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Flashcards
                    </Link>
                  </li>
                  <li>
                    <Link href="/placas" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Placas
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>
                <p className="text-gray-600">
                  Tem alguma dúvida ou sugestão? Entre em contato conosco.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-gray-500">
              <p>© {new Date().getFullYear()} Quiz de Legislação de Trânsito. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
} 