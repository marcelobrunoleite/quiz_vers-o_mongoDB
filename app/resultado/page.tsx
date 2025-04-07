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
    return <div>Carregando resultado...</div>
  }

  const percentage = (score / totalQuestions) * 100
  const messages = {
    perfect: 'Parabéns! Você acertou todas as questões!',
    excellent: 'Excelente! Você está muito bem preparado!',
    good: 'Bom trabalho! Continue estudando!',
    average: 'Continue praticando para melhorar!',
    needsWork: 'Dedique mais tempo aos estudos!'
  }

  const getMessage = () => {
    if (percentage === 100) return messages.perfect
    if (percentage >= 90) return messages.excellent
    if (percentage >= 70) return messages.good
    if (percentage >= 50) return messages.average
    return messages.needsWork
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Resultado do Quiz</h1>
        
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-primary mb-4">
            {percentage.toFixed(1)}%
          </div>
          <p className="text-xl mb-2">
            Você acertou {score} de {totalQuestions} questões
          </p>
          <p className="text-lg text-gray-600">{getMessage()}</p>
        </div>

        <div className="space-y-4">
          <Link href="/quiz" className="block w-full btn-primary text-center">
            Tentar Novamente
          </Link>
          <Link href="/flashcards" className="block w-full btn-secondary text-center">
            Estudar com Flashcards
          </Link>
          <Link href="/" className="block w-full text-gray-600 hover:text-gray-800 text-center">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
} 