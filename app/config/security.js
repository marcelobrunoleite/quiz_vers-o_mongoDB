const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS
});

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200
};

const securityMiddleware = (app) => {
  // Proteção básica com helmet
  app.use(helmet());
  
  // Configuração CORS
  app.use(cors(corsOptions));
  
  // Rate limiting
  app.use('/api/', limiter);
  
  // Prevenção XSS
  app.use(helmet.xssFilter());
  
  // Configuração CSP
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }));
  
  // Força HTTPS em produção
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
      }
      return next();
    });
  }
};

module.exports = securityMiddleware; 