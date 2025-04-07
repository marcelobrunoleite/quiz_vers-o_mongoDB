import './globals.css'
import type { Metadata } from 'next'

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
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
      </head>
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <a href="/" className="flex items-center">
                    <span className="text-xl font-bold text-primary">Quiz Trânsito</span>
                  </a>
                </div>
                <div className="flex items-center">
                  <a href="/auth/login" className="text-gray-600 hover:text-primary">
                    Login
                  </a>
                </div>
              </div>
            </nav>
          </header>
          {children}
          <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500">
                © {new Date().getFullYear()} Quiz de Legislação de Trânsito. Todos os direitos reservados.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 