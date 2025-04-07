import React, { useState } from 'react';

interface Question {
  id: number;
  pergunta: string;
  opcoes: string[];
  resposta: number;
  explicacao: string;
}

const CTBQuestions: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      pergunta: "O que é o CTB (Código de Trânsito Brasileiro)?",
      opcoes: [
        "É o conjunto de normas que regulamenta o trânsito nas vias terrestres do Brasil",
        "É apenas um manual de direção",
        "É um documento opcional para motoristas",
        "É um código que só se aplica a veículos grandes"
      ],
      resposta: 0,
      explicacao: "O CTB é a lei que estabelece as normas de trânsito válidas em todo território nacional, definindo direitos e deveres de todos os usuários das vias."
    },
    {
      id: 2,
      pergunta: "Quando o atual CTB entrou em vigor?",
      opcoes: [
        "Em 1988",
        "Em 1998",
        "Em 2008",
        "Em 2018"
      ],
      resposta: 1,
      explicacao: "O atual Código de Trânsito Brasileiro entrou em vigor em 23 de janeiro de 1998, através da Lei nº 9.503/97."
    },
    // Adicione mais questões conforme necessário
  ];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6 p-6 bg-gray-900/50 rounded-lg border border-cyan-500/20">
      <h3 className="text-xl font-semibold text-cyan-400">
        Questão {currentQuestion + 1} de {questions.length}
      </h3>
      
      <div className="space-y-4">
        <p className="text-white text-lg">{question.pergunta}</p>
        
        <div className="space-y-3">
          {question.opcoes.map((opcao, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg transition-all ${
                selectedAnswer === index
                  ? selectedAnswer === question.resposta
                    ? 'bg-green-500/20 border-green-500'
                    : 'bg-red-500/20 border-red-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-cyan-400'
              } border`}
              disabled={selectedAnswer !== null}
            >
              {opcao}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className={`p-4 rounded-lg mt-4 ${
            selectedAnswer === question.resposta
              ? 'bg-green-500/10 border-green-500'
              : 'bg-red-500/10 border-red-500'
          } border`}>
            <p className="text-white">{question.explicacao}</p>
          </div>
        )}

        {selectedAnswer !== null && (
          <button
            onClick={nextQuestion}
            className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            disabled={currentQuestion === questions.length - 1}
          >
            Próxima Questão
          </button>
        )}
      </div>
    </div>
  );
};

export default CTBQuestions; 