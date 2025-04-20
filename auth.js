class Auth {
    constructor() {
        console.log('Iniciando Auth...');
        this.setupPhoneMasks();
        this.bindEvents();
        
        this.isAuthenticated = false;
        this.token = null;
        this.user = null;
        this.tokenCheckInterval = null;
        
        // Usar a configuração global da API
        this.API_URL = window.APP_CONFIG?.API_URL || 'http://127.0.0.1:4000/api';
        console.log('API_URL configurada:', this.API_URL);
        
        this.checkAuthState();
        this.startTokenCheck();
    }

    startTokenCheck() {
        if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
        }
        
        // Verificar o token a cada 5 minutos
        this.tokenCheckInterval = setInterval(() => {
            if (this.isAuthenticated) {
                this.checkAuthState();
            }
        }, 5 * 60 * 1000);
    }

    async checkAuthState() {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            
            if (!token || !user) {
                this.handleLogout(false);
                return;
            }

            try {
                const parsedUser = JSON.parse(user);
                
                // Validar token com o backend
                const response = await fetch(`${this.API_URL}/auth/validate`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                // Se a resposta não for JSON, tratar como erro
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Resposta inválida do servidor');
                }

                const data = await response.json();

                if (!response.ok || !data.valid) {
                    throw new Error('Token inválido ou expirado');
                }

                this.isAuthenticated = true;
                this.token = token;
                this.user = parsedUser;
                this.updateUIForLoggedUser(parsedUser);
                
            } catch (parseError) {
                console.error('Erro ao processar dados do usuário:', parseError);
                this.handleLogout(false);
            }
        } catch (error) {
            console.error('Erro na validação de autenticação:', error);
            
            // Se for erro de token inválido ou resposta inválida, fazer logout
            if (error.message.includes('Token') || error.message.includes('Resposta inválida')) {
                this.handleLogout(true);
            }
        }
    }

    updateUIForLoggedUser(user) {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');
        const adminLink = document.querySelector('.admin-link');

        // Esconder botões de login/signup
        if (authButtons) {
            authButtons.style.display = 'none';
        }

        // Mostrar informações do usuário
        if (userInfo) {
            userInfo.style.display = 'flex';
            const userName = userInfo.querySelector('.user-name');
            if (userName) {
                userName.textContent = `Olá, ${user.name}`;
            }
            
            // Garantir que o botão de logout existe e está configurado
            let btnLogout = userInfo.querySelector('#btn-logout');
            if (!btnLogout) {
                btnLogout = document.createElement('button');
                btnLogout.id = 'btn-logout';
                btnLogout.className = 'btn-logout';
                btnLogout.textContent = 'Sair';
                userInfo.appendChild(btnLogout);
            }
            
            // Adicionar evento de logout
            btnLogout.addEventListener('click', () => this.handleLogout());
        }
        
        // Configurar link de admin
        if (adminLink) {
            adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
        }

        // Remover classe escondido
        if (userInfo) {
            userInfo.classList.remove('escondido');
        }
    }

    updateUIForLoggedOutUser() {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');
        const adminLink = document.querySelector('.admin-link');

        if (btnLogin) btnLogin.style.display = 'block';
        if (btnSignup) btnSignup.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }

    setupPhoneMasks() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                    e.target.value = value;
                }
            });
        });
    }

    async handleSignup(formData) {
        try {
            console.log('Iniciando requisição para a API...');
            const response = await fetch(`${this.API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                return {
                    success: true,
                    data
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Erro ao criar conta'
                };
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            return {
                success: false,
                error: 'Erro ao conectar com o servidor. Verifique se o servidor está rodando.'
            };
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        
        // Validações básicas
        if (!email || !password) {
            this.showErrorMessage('login-form', 'Por favor, preencha todos os campos');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showErrorMessage('login-form', 'Por favor, insira um email válido');
            return;
        }

        try {
            const loginUrl = `${this.API_URL}/auth/login`;
            
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta inválida do servidor');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao fazer login');
            }

            if (!data.token || !data.user) {
                throw new Error('Resposta inválida do servidor');
            }

            this.isAuthenticated = true;
            this.token = data.token;
            this.user = data.user;

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Iniciar verificação periódica do token
            this.startTokenCheck();

            this.updateUIForLoggedUser(this.user);
            this.closeModal(document.getElementById('login-modal'));
            this.showNotification(`Bem-vindo, ${this.user.name}!`, 'success');

        } catch (error) {
            console.error('Erro no login:', error);
            this.showErrorMessage('login-form', error.message || 'Erro ao conectar com o servidor');
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showNotification(message, type = 'info') {
        // Remove notificação anterior se existir
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) {
            oldNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 15px;
            right: 200px;
            background: rgba(10, 10, 31, 0.95);
            border: 1px solid ${type === 'success' ? '#00FF7F' : '#FF4444'};
            border-radius: 8px;
            padding: 10px 15px;
            color: ${type === 'success' ? '#fff' : '#FF4444'};
            box-shadow: 0 2px 10px ${type === 'success' ? 'rgba(0, 255, 127, 0.2)' : 'rgba(255, 68, 68, 0.2)'};
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
            font-size: 0.9rem;
            max-width: 250px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Fade in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
        });

        // Fade out e remover
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3200);
    }

    bindEvents() {
        console.log('Vinculando eventos...');
        
        // Vincular eventos de formulário
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            console.log('Form de login encontrado, vinculando evento submit');
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        } else {
            console.error('Form de login não encontrado');
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
                this.handleLogout();
            }
            
            if (target.classList.contains('close-modal')) {
                const modal = target.closest('.modal');
                this.closeModal(modal);
            }
        });

        // Fechar modal ao clicar fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        this.updateUIForLoggedOutUser();
    }

    showModal(modalId) {
        console.log('Tentando abrir modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('escondido');
            modal.classList.add('ativo');
            console.log('Modal aberto');
        } else {
            console.error('Modal não encontrado:', modalId);
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('ativo');
            modal.classList.add('escondido');
            // Limpar formulário
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

    handleLogout(showNotification = true) {
        // Limpar o intervalo de verificação
        if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
            this.tokenCheckInterval = null;
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.isAuthenticated = false;
        this.token = null;
        this.user = null;
        this.updateUIForLoggedOutUser();

        if (showNotification) {
            this.showNotification('Sua sessão foi encerrada', 'info');
        }
        
        // Redirecionar para a página inicial se estiver em uma área protegida
        if (window.location.pathname.startsWith('/admin') || 
            window.location.pathname.startsWith('/perfil')) {
            window.location.href = '/';
        }
    }

    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');
        const userName = document.querySelector('.user-name');
        const adminLink = document.querySelector('.admin-link');

        if (this.isAuthenticated) {
            btnLogin.classList.add('escondido');
            btnSignup.classList.add('escondido');
            userInfo.classList.remove('escondido');
            userName.textContent = `Olá, ${this.user.name}`;
            
            // Mostrar link de admin apenas para usuários administradores
            if (this.user.role === 'admin') {
                adminLink?.classList.remove('escondido');
            } else {
                adminLink?.classList.add('escondido');
            }
        } else {
            btnLogin.classList.remove('escondido');
            btnSignup.classList.remove('escondido');
            userInfo.classList.add('escondido');
            adminLink?.classList.add('escondido');
        }
    }

    showErrorMessage(formId, message) {
        const form = document.getElementById(formId);
        const errorDiv = form.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    updateUI() {
        const userInfo = document.querySelector('.user-info');
        const authButtons = document.querySelector('.auth-buttons');
        const adminLink = document.querySelector('.admin-link');

        if (this.isAuthenticated) {
            userInfo.querySelector('.user-name').textContent = this.user.email;
            userInfo.classList.remove('escondido');
            authButtons.classList.add('escondido');
            
            // Mostrar link de admin apenas para usuários administradores
            if (this.user.role === 'admin') {
                adminLink?.classList.remove('escondido');
            } else {
                adminLink?.classList.add('escondido');
            }
        } else {
            userInfo.classList.add('escondido');
            authButtons.classList.remove('escondido');
            adminLink?.classList.add('escondido');
        }
    }

    hasRole(role) {
        return this.user?.role === role;
    }

    hasPermission(permission) {
        return this.user?.permissions?.includes(permission);
    }

    checkAccess(requiredPermissions = []) {
        // Admin tem acesso total
        if (this.hasRole('admin')) return true;
        
        // Verifica se usuário tem todas as permissões necessárias
        return requiredPermissions.every(perm => this.hasPermission(perm));
    }

    async updateUserPermissions(userId, newPermissions) {
        if (!this.hasRole('admin')) {
            throw new Error('Acesso negado');
        }

        const userToUpdate = this.users.find(u => u.id === userId);
        if (!userToUpdate) {
            throw new Error('Usuário não encontrado');
        }

        userToUpdate.permissions = newPermissions;
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    async createAdminUser(email, password) {
        const hashedPassword = await this.hashPassword(password);
        const adminUser = {
            id: Date.now().toString(),
            name: 'Administrador',
            email,
            phone: '',
            whatsapp: '',
            password: hashedPassword,
            role: 'admin',
            permissions: [...ROLES.ADMIN.permissions],
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        this.users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        return adminUser;
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Inicialização e disponibilização global
window.auth = new Auth();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const signupModal = document.getElementById('signup-modal');
    const signupForm = document.getElementById('signup-form');
    const btnSignup = document.getElementById('btn-signup');
    const closeButtons = document.querySelectorAll('.close-modal');

    if (btnSignup) {
        btnSignup.addEventListener('click', () => {
            console.log('Clique no botão signup');
            signupModal.classList.remove('escondido');
        });
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.add('escondido');
            }
        });
    });

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Formulário de cadastro enviado');
            
            const formData = {
                name: document.getElementById('signup-name').value,
                email: document.getElementById('signup-email').value,
                phone: document.getElementById('signup-phone').value,
                whatsapp: document.getElementById('signup-whatsapp').value,
                password: document.getElementById('signup-password').value,
                confirmPassword: document.getElementById('signup-confirm-password').value
            };

            const errorMessage = signupForm.querySelector('.error-message');

            // Validar senha
            if (formData.password !== formData.confirmPassword) {
                errorMessage.textContent = 'As senhas não coincidem';
                return;
            }

            try {
                const result = await window.auth.handleSignup(formData);
                
                if (result.success) {
                    errorMessage.style.color = 'green';
                    errorMessage.textContent = 'Conta criada com sucesso!';
                    
                    // Salvar token e dados do usuário
                    localStorage.setItem('token', result.data.token);
                    localStorage.setItem('user', JSON.stringify(result.data.user));
                    
                    // Atualizar UI
                    window.auth.isAuthenticated = true;
                    window.auth.token = result.data.token;
                    window.auth.user = result.data.user;
                    window.auth.updateAuthUI();
                    
                    // Limpar formulário e fechar modal
                    signupForm.reset();
                    setTimeout(() => {
                        signupModal.classList.add('escondido');
                    }, 2000);
} else {
                    errorMessage.style.color = 'red';
                    errorMessage.textContent = result.error;
                }
            } catch (error) {
                console.error('Erro no cadastro:', error);
                errorMessage.style.color = 'red';
                errorMessage.textContent = 'Erro ao conectar com o servidor. Verifique se o servidor está rodando.';
            }
        });
    }
}); 