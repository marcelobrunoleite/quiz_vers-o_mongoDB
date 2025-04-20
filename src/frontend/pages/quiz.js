import authService from '../services/authService.js';

class QuizApp {
    constructor() {
        this.modo = null;
        this.tipoFeedback = null;
        this.init();
    }

    init() {
        // Verifica autenticação ao carregar a página
        this.checkAuth();

        // Adiciona listener para mudanças no estado de autenticação
        authService.addListener(this.handleAuthChange.bind(this));
    }

    async checkAuth() {
        const isAuthenticated = await authService.checkAuthState();
        if (!isAuthenticated) {
            // Se não estiver autenticado, desabilita as opções
            this.disableQuizOptions();
        } else {
            // Se estiver autenticado, habilita as opções
            this.enableQuizOptions();
        }
    }

    handleAuthChange({ isAuthenticated }) {
        if (isAuthenticated) {
            this.enableQuizOptions();
        } else {
            this.disableQuizOptions();
        }
    }

    disableQuizOptions() {
        const opcoes = document.querySelectorAll('.modo-opcao, .feedback-opcao');
        opcoes.forEach(opcao => {
            opcao.classList.add('disabled');
            opcao.style.pointerEvents = 'none';
        });

        const btnIniciar = document.getElementById('iniciar-simulado');
        btnIniciar.disabled = true;
        btnIniciar.textContent = 'Faça login para iniciar';
    }

    enableQuizOptions() {
        const opcoes = document.querySelectorAll('.modo-opcao, .feedback-opcao');
        opcoes.forEach(opcao => {
            opcao.classList.remove('disabled');
            opcao.style.pointerEvents = 'auto';
        });

        const btnIniciar = document.getElementById('iniciar-simulado');
        btnIniciar.disabled = true; // Mantém desabilitado até selecionar as opções
        btnIniciar.textContent = 'Iniciar Simulado';
    }

    selecionarModo(modo) {
        this.modo = modo;
        
        // Remove seleção anterior
        document.querySelectorAll('.modo-opcao').forEach(opcao => {
            opcao.classList.remove('selecionado');
        });

        // Seleciona o novo modo
        const opcaoSelecionada = document.querySelector(`.modo-opcao[onclick*="${modo}"]`);
        if (opcaoSelecionada) {
            opcaoSelecionada.classList.add('selecionado');
        }

        this.verificarSelecoes();
    }

    selecionarFeedback(tipo) {
        this.tipoFeedback = tipo;
        
        // Remove seleção anterior
        document.querySelectorAll('.feedback-opcao').forEach(opcao => {
            opcao.classList.remove('selecionado');
        });

        // Seleciona o novo tipo
        const opcaoSelecionada = document.querySelector(`.feedback-opcao[onclick*="${tipo}"]`);
        if (opcaoSelecionada) {
            opcaoSelecionada.classList.add('selecionado');
        }

        this.verificarSelecoes();
    }

    verificarSelecoes() {
        const btnIniciar = document.getElementById('iniciar-simulado');
        btnIniciar.disabled = !(this.modo && this.tipoFeedback);
    }

    async iniciarSimulado() {
        if (!authService.isAuthenticated()) {
            alert('Por favor, faça login para iniciar o simulado');
            return;
        }

        if (!this.modo || !this.tipoFeedback) {
            alert('Por favor, selecione o modo e o tipo de feedback');
            return;
        }

        // Aqui você implementará a lógica para iniciar o simulado
        console.log('Iniciando simulado:', {
            modo: this.modo,
            tipoFeedback: this.tipoFeedback
        });
    }
}

// Cria e exporta uma instância do QuizApp
const quizApp = new QuizApp();
export default quizApp;

// Expõe o quizApp globalmente para os handlers de eventos
window.quizApp = quizApp; 