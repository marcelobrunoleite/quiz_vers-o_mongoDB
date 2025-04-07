'use client'

import Link from 'next/link'
import { Home, Book, Award, Trophy, Bookmark, Info } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">
          Destaques
        </h1>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="feature-card">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/images/quiz.png"
              alt="Quiz"
              width={64}
              height={64}
              className="mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Simulados</h2>
            <p className="text-gray-300 mb-6">
              Teste seus conhecimentos com nossos simulados
            </p>
            <Link href="/quiz" className="btn-primary">
              Fazer Simulado
            </Link>
          </div>
        </div>

        <div className="feature-card">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/images/flashcard.png"
              alt="Flashcard"
              width={64}
              height={64}
              className="mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Flashcards</h2>
            <p className="text-gray-300 mb-6">
              Estude com cartões de memorização
            </p>
            <Link href="/flashcards" className="btn-primary">
              Estudar
            </Link>
          </div>
        </div>

        <div className="feature-card">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/images/cursos.png"
              alt="Cursos"
              width={64}
              height={64}
              className="mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Cursos</h2>
            <p className="text-gray-300 mb-6">
              Aprenda com nossos cursos completos
            </p>
            <Link href="/cursos" className="btn-primary">
              Acessar Cursos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 