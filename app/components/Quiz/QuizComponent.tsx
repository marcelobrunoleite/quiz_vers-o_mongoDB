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

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/data/transito.json')
        const data = await response.json()
        // Embaralha as questões
        const shuffledQuestions = [...data].sort(() => Math.random() - 0.5).slice(0, 30)
        setQuestions(shuffledQuestions)
      } catch (error) {
        console.error('Erro ao carregar questões:', error)
      }
    }

    loadQuestions()
  }, [])

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return
    
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

  if (questions.length === 0) {
    return <div>Carregando questões...</div>
  }

  const currentQuestionData = questions[currentQuestion]

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

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-lg mb-6">{currentQuestionData.pergunta}</p>

        <div className="space-y-4">
          {currentQuestionData.alternativas.map((alternativa, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                isAnswered
                  ? index === currentQuestionData.resposta
                    ? 'bg-green-100 border-green-500'
                    : index === selectedAnswer
                    ? 'bg-red-100 border-red-500'
                    : 'bg-gray-50 border-gray-200'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              {alternativa}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">{currentQuestionData.explicacao}</p>
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