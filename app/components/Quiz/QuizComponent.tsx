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

export default function QuizComponent() {
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Carregando questões...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Nenhuma questão disponível.</div>
      </div>
    )
  }

  const currentQuestionData = questions[currentQuestion]

  if (!currentQuestionData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Questão não encontrada.</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <span className="text-lg font-medium">
          Questão {currentQuestion + 1} de {questions.length}
        </span>
        <span className="text-lg font-medium">
          Pontuação: {score}
        </span>
      </div>

      <div className="card">
        <p className="text-lg mb-6">{currentQuestionData.pergunta}</p>

        <div className="space-y-4">
          {currentQuestionData.alternativas.map((alternativa, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`quiz-option ${
                isAnswered
                  ? index === currentQuestionData.resposta
                    ? 'quiz-option-correct'
                    : index === selectedAnswer
                    ? 'quiz-option-incorrect'
                    : ''
                  : ''
              }`}
            >
              {alternativa}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="quiz-explanation">
            <p>{currentQuestionData.explicacao}</p>
          </div>
        )}

        {isAnswered && (
          <button
            onClick={handleNextQuestion}
            className="mt-6 w-full btn-primary"
          >
            {currentQuestion < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
          </button>
        )}
      </div>
    </div>
  )
} 