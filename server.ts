const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.VERCEL_URL] 
  : ['http://localhost:3000', 'http://127.0.0.1:5500']; 