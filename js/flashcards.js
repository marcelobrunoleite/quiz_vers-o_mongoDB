class Flashcards {
    constructor() {
        this.currentCard = 0;
        this.cards = [];
        this.allCards = [];
        this.init();
    }

    async init() {
        try {
            await this.loadCards();
            this.setupEventListeners();
            this.renderCard();
        } catch (error) {
            console.error('Erro ao inicializar flashcards:', error);
        }
    }

    async loadCards() {
        try {
            const response = await fetch('data/transito.json');
            if (!response.ok) {
                throw new Error(`Falha ao carregar as questões: ${response.status}`);
            }

            const questoes = await response.json();
            
            // Ajustando para o novo formato do JSON (array de questões)
            this.allCards = questoes.map(questao => ({
                pergunta: questao.pergunta,
                resposta: questao.alternativas[questao.resposta_correta],
                explicacao: questao.explicacao || 'Não há explicação disponível.',
                tema: questao.tema || 'Geral'
            }));

            this.cards = [...this.allCards];
            this.updateTemaFilter();
            console.log('Cards carregados:', this.cards); // Debug
        } catch (error) {
            this.handleError(error);
        }
    }

    handleError(error) {
        console.error('Erro:', error);
        const container = document.querySelector('.flashcard-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Erro ao carregar as questões. Por favor, tente novamente mais tarde.</p>
                    <p>Detalhes: ${error.message}</p>
                </div>
            `;
        }
        this.cards = [];
    }

    updateTemaFilter() {
        const temaFilter = document.getElementById('tema-filter');
        if (!temaFilter) return;

        // Obter temas únicos
        const temas = [...new Set(this.allCards.map(card => card.tema))].sort();
        
        // Criar options
        temaFilter.innerHTML = `
            <option value="">Todos os Temas</option>
            ${temas.map(tema => `
                <option value="${tema}">${tema}</option>
            `).join('')}
        `;
    }

    filterByTema(tema) {
        if (!tema) {
            // Se nenhum tema selecionado, mostrar todas as questões
            this.cards = [...this.allCards];
        } else {
            // Filtrar questões pelo tema selecionado
            this.cards = this.allCards.filter(card => card.tema === tema);
        }
        
        // Resetar para o primeiro card e atualizar a visualização
        this.currentCard = 0;
        this.renderCard();
    }

    setupEventListeners() {
        // Ajustando os seletores para usar as classes corretas
        const prevBtn = document.querySelector('.btn-anterior');
        const nextBtn = document.querySelector('.btn-proximo');
        const verRespostaBtn = document.querySelector('.btn-ver-resposta');
        const verPerguntaBtn = document.querySelector('.btn-ver-pergunta');
        const temaFilter = document.getElementById('tema-filter');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (!prevBtn.classList.contains('disabled')) {
                    this.prevCard();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (!nextBtn.classList.contains('disabled')) {
                    this.nextCard();
                }
            });
        }

        if (verRespostaBtn) {
            verRespostaBtn.addEventListener('click', () => this.flipToBack());
        }

        if (verPerguntaBtn) {
            verPerguntaBtn.addEventListener('click', () => this.flipToFront());
        }

        if (temaFilter) {
            temaFilter.addEventListener('change', (e) => this.filterByTema(e.target.value));
        }
    }

    renderCard() {
        if (this.cards.length === 0) {
            this.showNoCardsMessage();
            return;
        }

        const card = this.cards[this.currentCard];
        const questaoEl = document.querySelector('.questao-texto');
        const respostaEl = document.querySelector('.resposta-texto');
        const counterEl = document.querySelector('.card-counter');

        if (questaoEl) questaoEl.textContent = card.pergunta;
        if (respostaEl) {
            respostaEl.innerHTML = `
                <p class="resposta">${card.resposta}</p>
                <div class="explicacao">
                    <h3>Explicação:</h3>
                    <p>${card.explicacao}</p>
                </div>
            `;
        }
        if (counterEl) {
            counterEl.textContent = `Card ${this.currentCard + 1} de ${this.cards.length}`;
        }

        // Resetar a rotação do card
        this.flipToFront();
        
        // Atualizar estado dos botões de navegação
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.querySelector('.btn-anterior');
        const nextBtn = document.querySelector('.btn-proximo');
        const counter = document.querySelector('.card-counter');

        if (prevBtn) {
            const isFirst = this.currentCard === 0;
            prevBtn.disabled = isFirst;
            prevBtn.classList.toggle('disabled', isFirst);
        }

        if (nextBtn) {
            const isLast = this.currentCard === this.cards.length - 1;
            nextBtn.disabled = isLast;
            nextBtn.classList.toggle('disabled', isLast);
        }

        if (counter) {
            counter.textContent = `Card ${this.currentCard + 1} de ${this.cards.length}`;
        }
    }

    showNoCardsMessage() {
        const container = document.querySelector('.flashcard-container');
        if (container) {
            container.innerHTML = `
                <div class="no-cards-message">
                    <p>Nenhum flashcard encontrado para este tema.</p>
                </div>
            `;
        }
    }

    nextCard() {
        if (this.currentCard < this.cards.length - 1) {
            this.currentCard++;
            this.renderCard();
            // Resetar a rotação do card ao mudar
            this.resetCardFlip();
        }
    }

    prevCard() {
        if (this.currentCard > 0) {
            this.currentCard--;
            this.renderCard();
            // Resetar a rotação do card ao mudar
            this.resetCardFlip();
        }
    }

    resetCardFlip() {
        const cardInner = document.querySelector('.flashcard-inner');
        if (cardInner) {
            cardInner.style.transform = 'rotateY(0deg)';
        }
    }

    flipToBack() {
        const cardInner = document.querySelector('.flashcard-inner');
        if (cardInner) {
            cardInner.style.transform = 'rotateY(180deg)';
        }
    }

    flipToFront() {
        const cardInner = document.querySelector('.flashcard-inner');
        if (cardInner) {
            cardInner.style.transform = 'rotateY(0deg)';
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.flashcards = new Flashcards();
}); 