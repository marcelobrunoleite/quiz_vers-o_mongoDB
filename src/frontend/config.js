// Configuração da API baseada no ambiente
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:4000/api'
    : '/api';

// Exporta as configurações
window.APP_CONFIG = {
    API_URL,
    AUTH_TOKEN_KEY: 'token',
    USER_DATA_KEY: 'user'
}; 