class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        this.listeners = [];
    }

    isAuthenticated() {
        return !!this.token;
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao fazer login');
            }

            this.token = data.token;
            this.user = data.user;

            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            this.notifyListeners();
            return data;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.notifyListeners();
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener({
            isAuthenticated: this.isAuthenticated(),
            user: this.user
        }));
    }

    async validateToken() {
        if (!this.token) return false;

        try {
            const response = await fetch('/api/auth/validate', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (!data.valid) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erro na validação do token:', error);
            this.logout();
            return false;
        }
    }

    async checkAuthState() {
        const isValid = await this.validateToken();
        if (!isValid) {
            this.logout();
        }
        return isValid;
    }
}

// Exporta uma única instância do serviço
const authService = new AuthService();
export default authService; 