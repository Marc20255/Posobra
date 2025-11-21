import rateLimit from 'express-rate-limit';

// Rate limiter geral para todas as rotas
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP a cada 15 minutos
  message: {
    success: false,
    message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.'
  },
  standardHeaders: true, // Retorna informações de rate limit nos headers
  legacyHeaders: false,
});

// Rate limiter mais restritivo para autenticação
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP a cada 15 minutos
  message: {
    success: false,
    message: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para criação de recursos (serviços, empreendimentos, etc)
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo 20 criações por IP por hora
  message: {
    success: false,
    message: 'Muitas criações de recursos. Por favor, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // máximo 50 uploads por IP por hora
  message: {
    success: false,
    message: 'Muitos uploads. Por favor, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para buscas e queries
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 buscas por IP por minuto
  message: {
    success: false,
    message: 'Muitas buscas. Por favor, aguarde um momento antes de tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

