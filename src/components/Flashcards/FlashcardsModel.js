class FlashcardsModel {
    constructor() {
        this.cards = [];
        this.allCards = [];
        this.currentCard = 0;
        this.currentTheme = '';
    }

    async loadCards() {
        try {
            const response = await fetch('data/transito.json');
            if (!response.ok) {
                throw new Error(`Falha ao carregar as questões: ${response.status}`);
            }

            const questoes = await response.json();
            this.allCards = questoes.map(questao => ({
                pergunta: questao.pergunta,
                resposta: questao.alternativas[questao.resposta_correta],
                explicacao: questao.explicacao || 'Não há explicação disponível.',
                tema: questao.tema || 'Geral'
            }));

            this.cards = [...this.allCards];
            return true;
        } catch (error) {
            console.error('Erro ao carregar cards:', error);
            return false;
        }
    }

    getUniqueThemes() {
        return [...new Set(this.allCards.map(card => card.tema))].sort();
    }

    filterByTheme(theme) {
        this.currentTheme = theme;
        this.cards = theme ? 
            this.allCards.filter(card => card.tema === theme) : 
            [...this.allCards];
        this.currentCard = 0;
    }

    getCurrentCard() {
        return this.cards[this.currentCard];
    }

    nextCard() {
        if (this.currentCard < this.cards.length - 1) {
            this.currentCard++;
            return true;
        }
        return false;
    }

    prevCard() {
        if (this.currentCard > 0) {
            this.currentCard--;
            return true;
        }
        return false;
    }

    getCardCount() {
        return {
            current: this.currentCard + 1,
            total: this.cards.length
        };
    }
}

export default FlashcardsModel; 