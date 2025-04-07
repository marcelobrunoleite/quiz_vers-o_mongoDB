class FlashcardsView {
    constructor() {
        this.initializeElements();
        this.isFlipped = false;
    }

    initializeElements() {
        this.elements = {
            container: document.querySelector('.flashcard-container'),
            questao: document.querySelector('.questao-texto'),
            resposta: document.querySelector('.resposta-texto'),
            counter: document.querySelector('.card-counter'),
            themeSelect: document.getElementById('tema-filter'),
            prevBtn: document.querySelector('.btn-anterior'),
            nextBtn: document.querySelector('.btn-proximo'),
            cardInner: document.querySelector('.flashcard-inner')
        };
    }

    renderCard(card) {
        if (!card) {
            this.showNoCardsMessage();
            return;
        }

        this.elements.questao.textContent = card.pergunta;
        this.elements.resposta.innerHTML = `
            <p class="resposta">${card.resposta}</p>
            <div class="explicacao">
                <h3>Explicação:</h3>
                <p>${card.explicacao}</p>
            </div>
        `;
        this.flipToFront();
    }

    updateCounter(current, total) {
        this.elements.counter.textContent = `Card ${current} de ${total}`;
    }

    updateNavigationButtons(isFirst, isLast) {
        this.elements.prevBtn.disabled = isFirst;
        this.elements.prevBtn.classList.toggle('disabled', isFirst);
        this.elements.nextBtn.disabled = isLast;
        this.elements.nextBtn.classList.toggle('disabled', isLast);
    }

    populateThemes(themes) {
        this.elements.themeSelect.innerHTML = `
            <option value="">Todos os Temas</option>
            ${themes.map(tema => `
                <option value="${tema}">${tema}</option>
            `).join('')}
        `;
    }

    flipToBack() {
        this.elements.cardInner.style.transform = 'rotateY(180deg)';
        this.isFlipped = true;
    }

    flipToFront() {
        this.elements.cardInner.style.transform = 'rotateY(0deg)';
        this.isFlipped = false;
    }

    showNoCardsMessage() {
        this.elements.container.innerHTML = `
            <div class="no-cards-message">
                <p>Nenhum flashcard encontrado para este tema.</p>
            </div>
        `;
    }

    showError(error) {
        this.elements.container.innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar as questões. Por favor, tente novamente mais tarde.</p>
                <p>Detalhes: ${error.message}</p>
            </div>
        `;
    }
}

export default FlashcardsView; 