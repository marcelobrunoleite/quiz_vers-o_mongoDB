class Auth {
    constructor() {
        // Garantir que existe um admin padrão
        this.initializeAdminUser();
        
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.setupEventListeners();
    }

    initializeAdminUser() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const adminExists = users.some(user => user.role === 'admin');

        if (!adminExists) {
            const adminUser = {
                id: 1,
                name: 'Administrador',
                email: 'admin@admin.com',
                password: 'admin123',
                role: 'admin'
            };

            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Botões de login/signup/logout
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');
        const btnLogout = document.getElementById('btn-logout');

        if (btnLogin) {
            btnLogin.addEventListener('click', () => {
                console.log('Clique no botão login');
                this.showLoginModal();
            });
        }

        if (btnSignup) {
            btnSignup.addEventListener('click', () => {
                console.log('Clique no botão signup');
                this.showSignupModal();
            });
        }

        if (btnLogout) {
            console.log('Botão de logout encontrado, vinculando evento');
            btnLogout.addEventListener('click', () => {
                console.log('Clique no botão logout');
                this.logout();
            });
        } else {
            console.log('Botão de logout não encontrado');
        }

        // Forms de login/signup
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        if (signupForm) signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('escondido');
            modal.classList.add('ativo');
        }
    }

    showSignupModal() {
        const modal = document.getElementById('signup-modal');
        if (modal) {
            modal.classList.remove('escondido');
            modal.classList.add('ativo');
        }
    }

    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        const adminLink = document.querySelector('.admin-link');

        if (this.currentUser) {
            if (authButtons) authButtons.classList.add('escondido');
            if (userInfo) {
                userInfo.classList.remove('escondido');
                userInfo.querySelector('.user-name').textContent = this.currentUser.name;
            }
            if (adminLink && this.currentUser.role === 'admin') {
                adminLink.classList.remove('escondido');
            }
        } else {
            if (authButtons) authButtons.classList.remove('escondido');
            if (userInfo) userInfo.classList.add('escondido');
            if (adminLink) adminLink.classList.add('escondido');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('escondido');
            modal.classList.add('ativo');
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.add('escondido');
            modal.classList.remove('ativo');
            
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                const errorMessage = form.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.textContent = '';
                }
            }
        }
    }

    bindEvents() {
        console.log('Vinculando eventos...');
        
        // Vincular eventos de formulário
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            console.log('Form de login encontrado, vinculando evento submit');
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Vincular eventos de clique
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.id === 'btn-login') {
                console.log('Clique no botão login');
                this.showModal('login-modal');
            }
            
            if (target.id === 'btn-signup') {
                console.log('Clique no botão signup');
                this.showModal('signup-modal');
            }
            
            if (target.id === 'btn-logout') {
                console.log('Clique no botão logout');
                this.logout();
            }
            
            if (target.classList.contains('close-modal')) {
                const modal = target.closest('.modal');
                this.closeModal(modal);
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMessage = document.querySelector('#login-modal .error-message');

        try {
            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.updateAuthUI();
                this.closeModal(document.getElementById('login-modal'));

                // Redirecionar para área admin se for admin
                if (user.role === 'admin') {
                    window.location.href = 'admin-marketplace.html';
                }
            } else {
                errorMessage.textContent = 'Email ou senha incorretos';
            }
        } catch (error) {
            console.error('Erro no login:', error);
            errorMessage.textContent = 'Erro ao fazer login. Tente novamente.';
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const phone = document.getElementById('signup-phone').value;
        const whatsapp = document.getElementById('signup-whatsapp').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const errorMessage = document.querySelector('#signup-modal .error-message');

        try {
            if (password !== confirmPassword) {
                errorMessage.textContent = 'As senhas não coincidem';
                return;
            }

            if (this.users.some(u => u.email === email)) {
                errorMessage.textContent = 'Este email já está cadastrado';
                return;
            }

            const newUser = {
                id: this.users.length + 1,
                name,
                email,
                phone,
                whatsapp,
                password,
                role: 'user'
            };

            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));
            
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            this.updateAuthUI();
            this.closeModal(document.getElementById('signup-modal'));
        } catch (error) {
            console.error('Erro no cadastro:', error);
            errorMessage.textContent = 'Erro ao criar conta. Tente novamente.';
        }
    }

    logout() {
        console.log('Realizando logout...');
        // Limpar dados do localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('users');
        
        // Limpar estado da classe
        this.currentUser = null;
        
        // Atualizar UI
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');
        const adminLink = document.querySelector('.admin-link');

        if (authButtons) authButtons.classList.remove('escondido');
        if (userInfo) userInfo.classList.add('escondido');
        if (btnLogin) btnLogin.style.display = 'block';
        if (btnSignup) btnSignup.style.display = 'block';
        if (adminLink) adminLink.classList.add('escondido');

        console.log('Redirecionando para a página inicial...');
        window.location.href = 'index.html';
    }

    checkAdminAccess() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
}); 