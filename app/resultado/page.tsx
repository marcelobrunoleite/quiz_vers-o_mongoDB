'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResultadoPage() {
  const router = useRouter()
  const [score, setScore] = useState<number | null>(null)
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null)

  useEffect(() => {
    const savedScore = localStorage.getItem('quizScore')
    const savedTotal = localStorage.getItem('totalQuestions')

    if (!savedScore || !savedTotal) {
      router.push('/quiz')
      return
    }

    setScore(parseInt(savedScore))
    setTotalQuestions(parseInt(savedTotal))
  }, [router])

  if (score === null || totalQuestions === null) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg text-cyan-400">Carregando resultado...</div>
        </div>
      </div>
    )
  }

  const percentage = (score / totalQuestions) * 100
  const isPassed = percentage >= 70

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cyan-400 mb-4">Resultado do Quiz</h1>
            <div className="text-6xl font-bold mb-4 text-white">
              {percentage.toFixed(1)}%
            </div>
            <div className={`text-2xl font-semibold mb-8 ${
              isPassed ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPassed ? 'Aprovado!' : 'Não aprovado'}
            </div>
            <p className="text-lg text-gray-300 mb-4">
              Você acertou {score} de {totalQuestions} questões
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <Link 
              href="/quiz"
              className="btn-primary text-center"
            >
              Tentar Novamente
            </Link>
            <Link 
              href="/"
              className="btn-secondary text-center"
            >
              Voltar para o Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 