import { setupAuthProtection } from './utils/protectedRoute';
import { AuthService } from './services/authService';

// Inicializa o serviço de autenticação
AuthService.getInstance();

// Configura a proteção das rotas
setupAuthProtection();

// Exporta o AuthService para uso global
(window as any).authService = AuthService.getInstance(); 