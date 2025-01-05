document.addEventListener('DOMContentLoaded', () => {
    let questoes = [];
    let currentIndex = 0;
    let filteredQuestions = [];

    async function carregarQuestoes() {
        try {
            const response = await fetch('transito.json');
            if (!response.ok) throw new Error('Erro ao carregar questões');
            questoes = await response.json();
            filteredQuestions = [...questoes];
            mostrarQuestao();
            atualizarContador();
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    function mostrarQuestao() {
        if (filteredQuestions.length === 0) return;
        
        const questao = filteredQuestions[currentIndex];
        const flashcardFront = document.querySelector('.flashcard-front');
        const flashcardBack = document.querySelector('.flashcard-back');
        
        // Atualizar frente do card
        flashcardFront.querySelector('.tema-badge').textContent = questao.tema;
        flashcardFront.querySelector('.questao-texto').textContent = questao.pergunta;
        
        // Atualizar verso do card - Gabarito e explicação
        const respostaCorreta = questao.alternativas[questao.resposta_correta];
        flashcardBack.querySelector('.resposta-correta').innerHTML = `
            <div class="resposta-texto">
                <p class="gabarito">Resposta: ${questao.resposta_correta.toUpperCase()}) ${respostaCorreta}</p>
                <p class="explicacao">${questao.explicacao}</p>
            </div>
        `;
        
        atualizarContador();
        
        // Ajustar altura após atualizar conteúdo
        setTimeout(ajustarAlturaCard, 0);
    }

    function atualizarContador() {
        const counter = document.getElementById('card-counter');
        counter.textContent = `Card ${currentIndex + 1} de ${filteredQuestions.length}`;
    }

    function filtrarPorTema(tema) {
        currentIndex = 0;
        filteredQuestions = tema === 'todos' 
            ? [...questoes] 
            : questoes.filter(q => q.tema === tema);
        console.log('Questões filtradas:', filteredQuestions.length);
        mostrarQuestao();
    }

    function setupEventListeners() {
        // Evento para virar o card
        const btnsVerResposta = document.querySelectorAll('.btn-ver-resposta');
        btnsVerResposta.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita propagação do evento
                const flashcard = document.querySelector('.flashcard');
                flashcard.querySelector('.flashcard-inner').classList.toggle('is-flipped');
            });
        });
        
        // Eventos de navegação
        document.getElementById('prev-card').addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentIndex > 0) {
                currentIndex--;
                mostrarQuestao();
            }
        });
        
        document.getElementById('next-card').addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentIndex < filteredQuestions.length - 1) {
                currentIndex++;
                mostrarQuestao();
            }
        });
        
        // Evento do filtro
        document.getElementById('tema-filter').addEventListener('change', (e) => {
            filtrarPorTema(e.target.value);
        });
    }

    function ajustarAlturaCard() {
        const flashcard = document.querySelector('.flashcard');
        const conteudo = flashcard.querySelector('.questao-texto');
        const alturaMinima = 450;
        
        // Calcula altura necessária para o conteúdo
        const alturaConteudo = conteudo.scrollHeight;
        const alturaNecessaria = Math.max(alturaMinima, alturaConteudo + 100); // 100px para botões e margens
        
        // Ajusta altura do card e seus elementos internos
        flashcard.style.height = `${alturaNecessaria}px`;
        flashcard.querySelector('.flashcard-inner').style.height = '100%';
        flashcard.querySelectorAll('.flashcard-front, .flashcard-back').forEach(face => {
            face.style.height = '100%';
        });
    }

    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', ajustarAlturaCard);

    // Inicializar
    carregarQuestoes();
}); 