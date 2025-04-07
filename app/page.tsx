'use client'

import Link from 'next/link'
import { Home, Book, Award, Trophy, Bookmark, Info } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quiz de Legislação de Trânsito
          </h1>
          <p className="text-lg text-gray-600">
            Teste seus conhecimentos e aprenda mais sobre as leis de trânsito
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/quiz" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Iniciar Quiz</h2>
                <p className="text-gray-600 text-center">
                  Teste seus conhecimentos sobre legislação de trânsito
                </p>
              </div>
            </div>
          </Link>

          <Link href="/flashcards" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <div className="flex flex-col items-center">
                <div className="bg-pink-100 p-3 rounded-full mb-4">
                  <Book className="w-8 h-8 text-pink-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Flashcards</h2>
                <p className="text-gray-600 text-center">
                  Estude com cartões de memorização
                </p>
              </div>
            </div>
          </Link>

          <Link href="/placas" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <div className="flex flex-col items-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Placas</h2>
                <p className="text-gray-600 text-center">
                  Aprenda o significado das placas de trânsito
                </p>
              </div>
            </div>
          </Link>

          <Link href="/ranking" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <div className="flex flex-col items-center">
                <div className="bg-yellow-100 p-3 rounded-full mb-4">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Ranking</h2>
                <p className="text-gray-600 text-center">
                  Veja sua posição no ranking
                </p>
              </div>
            </div>
          </Link>

          <Link href="/cursos" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <div className="flex flex-col items-center">
                <div className="bg-purple-100 p-3 rounded-full mb-4">
                  <Bookmark className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Cursos</h2>
                <p className="text-gray-600 text-center">
                  Acesse nossos cursos especializados
                </p>
              </div>
            </div>
          </Link>

          <Link href="/sobre" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <div className="flex flex-col items-center">
                <div className="bg-indigo-100 p-3 rounded-full mb-4">
                  <Info className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Sobre</h2>
                <p className="text-gray-600 text-center">
                  Saiba mais sobre o projeto
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 