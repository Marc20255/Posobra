import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../database/connection.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('phone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  body('role').optional().isIn(['client', 'technician', 'constructor']).withMessage('Role inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, role = 'client', cpf, address, city, state, zip_code } = req.body;

    // Check if user already exists with same email AND role
    // Permite mesmo email com roles diferentes
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND role = $2',
      [email, role]
    );

    if (existingUser.rows.length > 0) {
      const roleNames = {
        'client': 'cliente',
        'technician': 'técnico',
        'constructor': 'construtora'
      };
      return res.status(400).json({ 
        success: false, 
        message: `Email já cadastrado como ${roleNames[role] || role}. Use outro email ou faça login com essa conta.` 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, cpf, address, city, state, zip_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, email, role, phone, created_at`,
      [name, email, hashedPassword, phone, role, cpf, address, city, state, zip_code]
    );

    const user = result.rows[0];

    // Generate token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado no .env');
      return res.status(500).json({ 
        success: false, 
        message: 'Erro de configuração do servidor. JWT_SECRET não encontrado.' 
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar usuário',
      error: error.message 
    });
  }
});

// Login - permite login com mesmo email mas precisa especificar role ou retorna primeiro encontrado
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
  body('role').optional().isIn(['client', 'technician', 'constructor', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password, role } = req.body;

    // Build query - se role especificado, busca por email+role, senão busca primeiro encontrado
    let query = 'SELECT id, name, email, password, role, phone, is_active, avatar_url FROM users WHERE email = $1';
    const params = [email];

    if (role) {
      query += ' AND role = $2';
      params.push(role);
    }

    query += ' ORDER BY created_at LIMIT 1';

    // Find user
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário inativo' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Se tem múltiplas contas com mesmo email, retorna todas para escolha
    if (!role) {
      const allAccounts = await pool.query(
        'SELECT id, name, email, role, phone, avatar_url FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (allAccounts.rows.length > 1) {
        return res.json({
          success: true,
          message: 'Múltiplas contas encontradas',
          data: {
            accounts: allAccounts.rows.map(acc => ({
              id: acc.id,
              name: acc.name,
              email: acc.email,
              role: acc.role,
              phone: acc.phone,
              avatar_url: acc.avatar_url
            })),
            requiresRoleSelection: true
          }
        });
      }
    }

    // Generate token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado no .env');
      return res.status(500).json({ 
        success: false, 
        message: 'Erro de configuração do servidor' 
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar_url: user.avatar_url
        },
        token
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
    });
  }
});

// Login with role selection (para quando tem múltiplas contas)
router.post('/login-with-role', authLimiter, [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
  body('role').notEmpty().withMessage('Role é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password, role } = req.body;

    // Find user with specific role
    const result = await pool.query(
      'SELECT id, name, email, password, role, phone, is_active, avatar_url FROM users WHERE email = $1 AND role = $2',
      [email, role]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos para este tipo de conta' 
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário inativo' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Generate token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado no .env');
      return res.status(500).json({ 
        success: false, 
        message: 'Erro de configuração do servidor' 
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar_url: user.avatar_url
        },
        token
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, phone, avatar_url, cpf, address, city, state, zip_code, 
              is_verified, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar usuário',
      error: error.message 
    });
  }
});

export default router;
