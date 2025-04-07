class FlashcardsController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init();
    }

    async init() {
        try {
            const success = await this.model.loadCards();
            if (success) {
                this.setupEventListeners();
                this.updateView();
                this.view.populateThemes(this.model.getUniqueThemes());
            }
        } catch (error) {
            this.view.showError(error);
        }
    }

    setupEventListeners() {
        const { prevBtn, nextBtn, themeSelect } = this.view.elements;

        prevBtn.addEventListener('click', () => {
            if (!prevBtn.classList.contains('disabled')) {
                this.prevCard();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (!nextBtn.classList.contains('disabled')) {
                this.nextCard();
            }
        });

        document.querySelector('.btn-ver-resposta')
            ?.addEventListener('click', () => this.view.flipToBack());

        document.querySelector('.btn-ver-pergunta')
            ?.addEventListener('click', () => this.view.flipToFront());

        themeSelect?.addEventListener('change', (e) => this.filterByTheme(e.target.value));
    }

    updateView() {
        const card = this.model.getCurrentCard();
        const { current, total } = this.model.getCardCount();
        
        this.view.renderCard(card);
        this.view.updateCounter(current, total);
        this.view.updateNavigationButtons(
            this.model.currentCard === 0,
            this.model.currentCard === this.model.cards.length - 1
        );
    }

    nextCard() {
        if (this.model.nextCard()) {
            this.updateView();
        }
    }

    prevCard() {
        if (this.model.prevCard()) {
            this.updateView();
        }
    }

    filterByTheme(theme) {
        this.model.filterByTheme(theme);
        this.updateView();
    }
}

export default FlashcardsController; 