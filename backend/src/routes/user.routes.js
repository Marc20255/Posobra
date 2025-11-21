import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, phone, avatar_url, cpf, address, city, state, zip_code, 
              is_verified, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar perfil',
      error: error.message 
    });
  }
});

// Update user profile
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone('pt-BR'),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, phone, address, city, state, zip_code, avatar_url } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (city) {
      updates.push(`city = $${paramCount++}`);
      values.push(city);
    }
    if (state) {
      updates.push(`state = $${paramCount++}`);
      values.push(state);
    }
    if (zip_code) {
      updates.push(`zip_code = $${paramCount++}`);
      values.push(zip_code);
    }
    if (avatar_url) {
      updates.push(`avatar_url = $${paramCount++}`);
      values.push(avatar_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum campo para atualizar' 
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar perfil',
      error: error.message 
    });
  }
});

// Get technicians list (for clients to choose)
router.get('/technicians', authenticate, async (req, res) => {
  try {
    const { city, state, rating, category } = req.query;
    
    let query = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar_url, u.city, u.state,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as total_reviews,
        COUNT(DISTINCT s.id) as total_services
      FROM users u
      LEFT JOIN reviews r ON r.technician_id = u.id
      LEFT JOIN services s ON s.technician_id = u.id AND s.status = 'completed'
      WHERE u.role = 'technician' AND u.is_active = true
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (city) {
      query += ` AND u.city ILIKE $${paramCount}`;
      queryParams.push(`%${city}%`);
      paramCount++;
    }

    if (state) {
      query += ` AND u.state = $${paramCount}`;
      queryParams.push(state);
      paramCount++;
    }

    // Filtrar por categoria se fornecida
    if (category) {
      query += ` AND u.id IN (
        SELECT technician_id FROM technician_categories 
        WHERE category ILIKE $${paramCount}
      )`;
      queryParams.push(`%${category}%`);
      paramCount++;
    }

    query += ` GROUP BY u.id`;

    if (rating) {
      query += ` HAVING AVG(r.rating) >= $${paramCount}`;
      queryParams.push(parseFloat(rating));
    }

    query += ` ORDER BY avg_rating DESC, total_services DESC`;

    const result = await pool.query(query, queryParams);

    // Buscar categorias para cada técnico
    const techniciansWithCategories = await Promise.all(
      result.rows.map(async (row) => {
        const categoriesResult = await pool.query(
          'SELECT category FROM technician_categories WHERE technician_id = $1 ORDER BY category',
          [row.id]
        );
        
        return {
          ...row,
          avg_rating: parseFloat(row.avg_rating),
          total_reviews: parseInt(row.total_reviews),
          total_services: parseInt(row.total_services),
          categories: categoriesResult.rows.map(c => c.category)
        };
      })
    );

    res.json({
      success: true,
      data: techniciansWithCategories
    });
  } catch (error) {
    console.error('Erro ao buscar técnicos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar técnicos',
      error: error.message 
    });
  }
});

// Get technician details
router.get('/technicians/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.avatar_url, u.city, u.state, u.address,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as total_reviews,
        COUNT(DISTINCT s.id) as total_services
      FROM users u
      LEFT JOIN reviews r ON r.technician_id = u.id
      LEFT JOIN services s ON s.technician_id = u.id AND s.status = 'completed'
      WHERE u.id = $1 AND u.role = 'technician' AND u.is_active = true
      GROUP BY u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Técnico não encontrado' 
      });
    }

    // Get categories
    const categoriesResult = await pool.query(
      'SELECT category FROM technician_categories WHERE technician_id = $1 ORDER BY category',
      [id]
    );

    // Get recent reviews
    const reviewsResult = await pool.query(
      `SELECT r.*, u.name as client_name, u.avatar_url as client_avatar
       FROM reviews r
       JOIN users u ON u.id = r.client_id
       WHERE r.technician_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        avg_rating: parseFloat(result.rows[0].avg_rating),
        total_reviews: parseInt(result.rows[0].total_reviews),
        total_services: parseInt(result.rows[0].total_services),
        categories: categoriesResult.rows.map(c => c.category),
        reviews: reviewsResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar técnico:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar técnico',
      error: error.message 
    });
  }
});

// Get technician categories (for logged in technician)
router.get('/profile/categories', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'technician') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas técnicos podem acessar suas categorias' 
      });
    }

    const result = await pool.query(
      'SELECT category FROM technician_categories WHERE technician_id = $1 ORDER BY category',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows.map(r => r.category)
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar categorias',
      error: error.message 
    });
  }
});

// Add category to technician profile
router.post('/profile/categories', authenticate, [
  body('category').trim().isLength({ min: 2, max: 100 }).withMessage('Categoria deve ter entre 2 e 100 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    if (req.user.role !== 'technician') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas técnicos podem adicionar categorias' 
      });
    }

    const { category } = req.body;

    // Verificar se já existe
    const existing = await pool.query(
      'SELECT id FROM technician_categories WHERE technician_id = $1 AND category = $2',
      [req.user.id, category]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Esta categoria já está cadastrada' 
      });
    }

    const result = await pool.query(
      'INSERT INTO technician_categories (technician_id, category) VALUES ($1, $2) RETURNING *',
      [req.user.id, category]
    );

    res.status(201).json({
      success: true,
      message: 'Categoria adicionada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao adicionar categoria',
      error: error.message 
    });
  }
});

// Remove category from technician profile
router.delete('/profile/categories/:category', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'technician') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas técnicos podem remover categorias' 
      });
    }

    const { category } = req.params;

    const result = await pool.query(
      'DELETE FROM technician_categories WHERE technician_id = $1 AND category = $2 RETURNING *',
      [req.user.id, category]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Categoria não encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Categoria removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao remover categoria',
      error: error.message 
    });
  }
});

export default router;

