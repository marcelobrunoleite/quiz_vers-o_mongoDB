import Link from 'next/link'
import { Home, Book, Award, Trophy, Bookmark, Info } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-primary">
          Quiz de Legislação de Trânsito
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/quiz" className="card hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center">
              <Home className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Iniciar Quiz</h2>
              <p className="text-gray-600 text-center">Teste seus conhecimentos sobre legislação de trânsito</p>
            </div>
          </Link>

          <Link href="/flashcards" className="card hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center">
              <Book className="w-12 h-12 text-secondary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Flashcards</h2>
              <p className="text-gray-600 text-center">Estude com cartões de memorização</p>
            </div>
          </Link>

          <Link href="/placas" className="card hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center">
              <Award className="w-12 h-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Placas</h2>
              <p className="text-gray-600 text-center">Aprenda o significado das placas de trânsito</p>
            </div>
          </Link>

          <Link href="/ranking" className="card hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center">
              <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Ranking</h2>
              <p className="text-gray-600 text-center">Veja sua posição no ranking</p>
            </div>
          </Link>

          <Link href="/cursos" className="card hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center">
              <Bookmark className="w-12 h-12 text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Cursos</h2>
              <p className="text-gray-600 text-center">Acesse nossos cursos especializados</p>
            </div>
          </Link>

          <Link href="/sobre" className="card hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center">
              <Info className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sobre</h2>
              <p className="text-gray-600 text-center">Saiba mais sobre o projeto</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
} 