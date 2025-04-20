import authService from '../services/authService.js';

class Header {
    constructor() {
        this.isAuthenticated = authService.isAuthenticated();
        this.user = authService.getUser();
        this.init();
    }

    init() {
        // Adiciona listener para mudanças no estado de autenticação
        authService.addListener(this.updateAuthState.bind(this));
        
        // Verifica o estado de autenticação ao iniciar
        authService.checkAuthState();
        
        // Renderiza o header inicial
        this.render();
    }

    updateAuthState({ isAuthenticated, user }) {
        this.isAuthenticated = isAuthenticated;
        this.user = user;
        this.render();
    }

    createAuthButtons() {
        if (this.isAuthenticated && this.user) {
            return `
                <div class="user-info">
                    <span class="welcome-message">Olá, ${this.user.name}</span>
                    <button class="btn-logout" onclick="header.handleLogout()">Sair</button>
                </div>
            `;
        }

        return `
            <div class="auth-buttons">
                <button class="auth-btn" onclick="header.showLoginModal()">Login</button>
                <button class="auth-btn" onclick="header.showSignupModal()">Inscreva-se</button>
            </div>
        `;
    }

    render() {
        const headerElement = document.querySelector('.site-header');
        if (!headerElement) return;

        headerElement.innerHTML = `
            <div class="header-content">
                <div class="logo">
                    <img src="assets/images/logo.png" alt="Logo Quiz Trânsito">
                    <h1>Quiz de Trânsito</h1>
                </div>
                <nav class="menu-principal">
                    <a href="/" class="nav-link">Home</a>
                    <a href="/quiz" class="nav-link">Quiz</a>
                    <a href="/ranking" class="nav-link">Ranking</a>
                    <a href="/placas" class="nav-link">Placas</a>
                    <a href="/flashcards" class="nav-link">Flashcards</a>
                    <a href="/cursos" class="nav-link">Cursos</a>
                    <a href="/sobre" class="nav-link">Sobre Nós</a>
                </nav>
                ${this.createAuthButtons()}
            </div>
        `;

        // Marca o link atual como ativo
        const currentPath = window.location.pathname;
        const currentLink = headerElement.querySelector(`a[href="${currentPath}"]`);
        if (currentLink) {
            currentLink.classList.add('ativo');
        }
    }

    async handleLogout() {
        authService.logout();
        window.location.href = '/';
    }

    showLoginModal() {
        // Implementar lógica do modal de login
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('escondido');
        }
    }

    showSignupModal() {
        // Implementar lógica do modal de cadastro
        const signupModal = document.getElementById('signupModal');
        if (signupModal) {
            signupModal.classList.remove('escondido');
        }
    }
}

// Exporta uma instância única do header
const header = new Header();
export default header;

// Expõe o header globalmente para os handlers de eventos
window.header = header; 