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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg">Carregando resultado...</div>
          </div>
        </div>
      </div>
    )
  }

  const percentage = (score / totalQuestions) * 100
  const isPassed = percentage >= 70

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Resultado do Quiz</h1>
            <div className="text-6xl font-bold mb-4">
              {percentage.toFixed(1)}%
            </div>
            <div className={`text-2xl font-semibold mb-8 ${
              isPassed ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPassed ? 'Aprovado!' : 'Não aprovado'}
            </div>
            <p className="text-lg text-gray-700 mb-4">
              Você acertou {score} de {totalQuestions} questões
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <Link 
              href="/quiz"
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Tentar Novamente
            </Link>
            <Link 
              href="/"
              className="w-full py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Voltar para o Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 