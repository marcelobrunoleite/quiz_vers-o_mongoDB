// Gerenciamento de estado global
export const AuthState = {
    init() {
        this.checkAuthState();
        this.setupAuthListeners();
    },

    checkAuthState() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            this.updateUIForLoggedUser(JSON.parse(user));
        } else {
            this.updateUIForLoggedOutUser();
        }
    },

    updateUIForLoggedUser(user) {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        const userName = document.querySelector('.user-name');
        const adminLink = document.querySelector('.admin-link');
        
        if (authButtons) {
            document.getElementById('btn-login')?.classList.add('escondido');
            document.getElementById('btn-signup')?.classList.add('escondido');
        }
        
        if (userInfo) {
            userInfo.classList.remove('escondido');
            userName.textContent = `Olá, ${user.name}`;
        }
        
        if (adminLink && user.role === 'admin') {
            adminLink.classList.remove('escondido');
        }
    },

    updateUIForLoggedOutUser() {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        const adminLink = document.querySelector('.admin-link');
        
        if (authButtons) {
            document.getElementById('btn-login')?.classList.remove('escondido');
            document.getElementById('btn-signup')?.classList.remove('escondido');
        }
        
        if (userInfo) {
            userInfo.classList.add('escondido');
        }
        
        if (adminLink) {
            adminLink.classList.add('escondido');
        }
    },

    setupAuthListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'token' || e.key === 'user') {
                const token = localStorage.getItem('token');
                const user = localStorage.getItem('user');
                if (token && user) {
                    this.updateUIForLoggedUser(JSON.parse(user));
                } else {
                    this.updateUIForLoggedOutUser();
                }
            }
        });
    }
};

// Inicializar o estado de autenticação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    AuthState.init();
}); 