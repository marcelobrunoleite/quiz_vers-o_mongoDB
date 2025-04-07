import { Suspense } from 'react'
import QuizComponent from '../components/Quiz/QuizComponent'

export default function QuizPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Quiz de Legislação de Trânsito</h1>
      <Suspense fallback={<div>Carregando...</div>}>
        <QuizComponent />
      </Suspense>
    </div>
  )
} 