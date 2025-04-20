export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRATION: '24h',
  SALT_ROUNDS: 10,
  TOKEN_PREFIX: 'Bearer',
  COOKIE_NAME: 'auth_token',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict' as const
  }
}; 