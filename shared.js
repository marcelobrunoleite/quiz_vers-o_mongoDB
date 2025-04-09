// Gerenciamento de estado global
const AuthState = {
    init() {
        this.checkAuthState();
        this.setupAuthListeners();
    },

    checkAuthState() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            this.updateUIForLoggedUser(JSON.parse(currentUser));
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
            if (e.key === 'currentUser') {
                if (e.newValue) {
                    this.updateUIForLoggedUser(JSON.parse(e.newValue));
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