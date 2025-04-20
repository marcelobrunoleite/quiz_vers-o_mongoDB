import header from './components/Header.js';
import authService from './services/authService.js';

// Função para inicializar a aplicação
async function initializeApp() {
    try {
        // Verifica o estado de autenticação ao carregar
        await authService.checkAuthState();

        // Adiciona listener para mudanças na rota
        window.addEventListener('popstate', () => {
            header.render();
        });

        // Intercepta cliques em links para atualizar o header
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const url = new URL(link.href);
                window.history.pushState({}, '', url.pathname);
                header.render();
            }
        });

    } catch (error) {
        console.error('Erro ao inicializar a aplicação:', error);
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);

// Expõe o serviço de autenticação globalmente para debug
if (process.env.NODE_ENV === 'development') {
    window.authService = authService;
} 