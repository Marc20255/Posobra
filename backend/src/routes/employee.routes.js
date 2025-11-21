import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { createLimiter } from '../middleware/rateLimiter.middleware.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// List employees (apenas construtora)
router.get('/', authenticate, authorize('constructor', 'admin'), async (req, res) => {
  try {
    const query = `
      SELECT 
        ce.*,
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        u.city,
        u.state,
        u.address,
        u.zip_code,
        u.cpf,
        u.is_active as user_is_active,
        u.created_at as user_created_at
      FROM constructor_employees ce
      JOIN users u ON u.id = ce.employee_id
      WHERE ce.constructor_id = $1
      ORDER BY ce.created_at DESC
    `;

    const result = await pool.query(query, [req.user.id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar funcionários',
      error: error.message 
    });
  }
});

// Create employee (construtora cria funcionário)
router.post('/', authenticate, authorize('constructor', 'admin'), createLimiter, [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('phone').optional().isMobilePhone('pt-BR'),
  body('role').optional().isIn(['technician', 'supervisor', 'manager', 'other']),
  body('department').optional().trim(),
  body('hired_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, role = 'technician', department, hired_date, address, city, state, zip_code, cpf } = req.body;

    // Verificar se email já existe como técnico
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND role = $2',
      [email, 'technician']
    );

    if (existingUser.rows.length > 0) {
      const userId = existingUser.rows[0].id;
      
      // Verificar se já está vinculado a outra construtora
      const existingEmployee = await pool.query(
        'SELECT constructor_id FROM constructor_employees WHERE employee_id = $1',
        [userId]
      );

      if (existingEmployee.rows.length > 0 && existingEmployee.rows[0].constructor_id !== req.user.id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Este técnico já está vinculado a outra construtora' 
        });
      }

      // Se já existe e está vinculado a esta construtora, retornar sucesso
      if (existingEmployee.rows.length > 0 && existingEmployee.rows[0].constructor_id === req.user.id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Este funcionário já está cadastrado' 
        });
      }

      // Vincular técnico existente à construtora
      const employeeResult = await pool.query(
        `INSERT INTO constructor_employees (constructor_id, employee_id, role, department, hired_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.user.id, userId, role, department || null, hired_date || null]
      );

      // Buscar dados completos do usuário
      const userData = await pool.query(
        'SELECT id, name, email, phone, avatar_url, city, state, address, zip_code, cpf, is_active, created_at FROM users WHERE id = $1',
        [userId]
      );

      return res.status(201).json({
        success: true,
        message: 'Funcionário vinculado com sucesso',
        data: {
          ...employeeResult.rows[0],
          ...userData.rows[0],
          user_id: userData.rows[0].id,
          user_is_active: userData.rows[0].is_active
        }
      });
    }

    // Criar novo usuário técnico
    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, cpf, address, city, state, zip_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, email, role, phone, created_at`,
      [name, email, hashedPassword, phone || null, 'technician', cpf || null, address || null, city || null, state || null, zip_code || null]
    );

    const newUser = userResult.rows[0];

    // Vincular à construtora
    const employeeResult = await pool.query(
      `INSERT INTO constructor_employees (constructor_id, employee_id, role, department, hired_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, newUser.id, role, department || null, hired_date || null]
    );

    res.status(201).json({
      success: true,
      message: 'Funcionário cadastrado com sucesso',
      data: {
        ...employeeResult.rows[0],
        ...newUser,
        user_id: newUser.id,
        user_is_active: true
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao cadastrar funcionário',
      error: error.message 
    });
  }
});

// Update employee
router.put('/:id', authenticate, authorize('constructor', 'admin'), [
  body('role').optional().isIn(['technician', 'supervisor', 'manager', 'other']),
  body('department').optional().trim(),
  body('is_active').optional().isBoolean(),
  body('hired_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { role, department, is_active, hired_date } = req.body;

    // Verificar se funcionário pertence à construtora
    const employeeCheck = await pool.query(
      'SELECT * FROM constructor_employees WHERE id = $1 AND constructor_id = $2',
      [id, req.user.id]
    );

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Funcionário não encontrado' 
      });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (department !== undefined) {
      updates.push(`department = $${paramCount++}`);
      values.push(department);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (hired_date !== undefined) {
      updates.push(`hired_date = $${paramCount++}`);
      values.push(hired_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum campo para atualizar' 
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, req.user.id);

    const result = await pool.query(
      `UPDATE constructor_employees 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount} AND constructor_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'Funcionário atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar funcionário',
      error: error.message 
    });
  }
});

// Delete employee (remove vínculo, não deleta usuário)
router.delete('/:id', authenticate, authorize('constructor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const employeeCheck = await pool.query(
      'SELECT * FROM constructor_employees WHERE id = $1 AND constructor_id = $2',
      [id, req.user.id]
    );

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Funcionário não encontrado' 
      });
    }

    await pool.query(
      'DELETE FROM constructor_employees WHERE id = $1 AND constructor_id = $2',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Funcionário removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover funcionário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao remover funcionário',
      error: error.message 
    });
  }
});

// Get employee details
router.get('/:id', authenticate, authorize('constructor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        ce.*,
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        u.city,
        u.state,
        u.address,
        u.zip_code,
        u.cpf,
        u.is_active as user_is_active,
        u.created_at as user_created_at
      FROM constructor_employees ce
      JOIN users u ON u.id = ce.employee_id
      WHERE ce.id = $1 AND ce.constructor_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Funcionário não encontrado' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar funcionário',
      error: error.message 
    });
  }
});

export default router;

