'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  pergunta: string
  alternativas: string[]
  resposta: number
  explicacao: string
}

export default function QuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/data/transito.json')
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar questões: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Formato de dados inválido')
        }

        // Embaralha as questões
        const shuffledQuestions = [...data].sort(() => Math.random() - 0.5).slice(0, 30)
        setQuestions(shuffledQuestions)
      } catch (error) {
        console.error('Erro ao carregar questões:', error)
        setError('Não foi possível carregar as questões. Por favor, tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered || !questions[currentQuestion]) return
    
    setSelectedAnswer(answerIndex)
    setIsAnswered(true)
    
    if (answerIndex === questions[currentQuestion].resposta) {
      setScore(score + 1)
    }
    
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setIsAnswered(false)
    } else {
      // Salva o resultado e redireciona para a página de resultado
      localStorage.setItem('quizScore', score.toString())
      localStorage.setItem('totalQuestions', questions.length.toString())
      router.push('/resultado')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg">Carregando questões...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg">Nenhuma questão disponível.</div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestionData = questions[currentQuestion]

  if (!currentQuestionData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg">Questão não encontrada.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz de Legislação de Trânsito</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6 flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">
              Questão {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-lg font-medium text-gray-700">
              Pontuação: {score}
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl text-gray-900 mb-6">{currentQuestionData.pergunta}</h2>

            <div className="space-y-4">
              {currentQuestionData.alternativas.map((alternativa, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    isAnswered
                      ? index === currentQuestionData.resposta
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : index === selectedAnswer
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                      : 'hover:bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                >
                  {alternativa}
                </button>
              ))}
            </div>
          </div>

          {showExplanation && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">{currentQuestionData.explicacao}</p>
            </div>
          )}

          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentQuestion < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 