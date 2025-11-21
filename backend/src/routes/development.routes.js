import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { createLimiter } from '../middleware/rateLimiter.middleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create development (apenas construtora)
router.post('/', authenticate, authorize('constructor', 'admin'), createLimiter, [
  body('name').trim().isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('address').notEmpty().withMessage('Endereço é obrigatório'),
  body('city').notEmpty().withMessage('Cidade é obrigatória'),
  body('state').isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, address, city, state, zip_code, total_units } = req.body;

    const result = await pool.query(
      `INSERT INTO developments (name, address, city, state, zip_code, total_units, constructor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, address, city, state, zip_code || null, total_units || 0, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Empreendimento criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar empreendimento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar empreendimento',
      error: error.message 
    });
  }
});

// List developments
router.get('/', authenticate, async (req, res) => {
  try {
    let query = '';
    let params = [];

    if (req.user.role === 'constructor' || req.user.role === 'admin') {
      query = `
        SELECT d.*, 
               u.name as constructor_name,
               COUNT(DISTINCT un.id) as units_count,
               COUNT(DISTINCT s.id) as services_count
        FROM developments d
        LEFT JOIN users u ON u.id = d.constructor_id
        LEFT JOIN units un ON un.development_id = d.id
        LEFT JOIN services s ON s.unit_id = un.id
        WHERE d.constructor_id = $1 OR $2 = 'admin'
        GROUP BY d.id, u.name
        ORDER BY d.created_at DESC
      `;
      params = [req.user.id, req.user.role];
    } else {
      // Cliente vê apenas empreendimentos onde tem unidade
      query = `
        SELECT DISTINCT d.*, u.name as constructor_name
        FROM developments d
        JOIN units un ON un.development_id = d.id
        LEFT JOIN users u ON u.id = d.constructor_id
        WHERE un.owner_id = $1
        ORDER BY d.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar empreendimentos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar empreendimentos',
      error: error.message 
    });
  }
});

// Get development by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT d.*, u.name as constructor_name, u.email as constructor_email
       FROM developments d
       LEFT JOIN users u ON u.id = d.constructor_id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empreendimento não encontrado' 
      });
    }

    // Get units count
    const unitsResult = await pool.query(
      'SELECT COUNT(*) as total FROM units WHERE development_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        units_count: parseInt(unitsResult.rows[0].total)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar empreendimento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar empreendimento',
      error: error.message 
    });
  }
});

// Get units for a development
router.get('/:developmentId/units', authenticate, async (req, res) => {
  try {
    const { developmentId } = req.params;

    // Verificar se empreendimento existe
    const devCheck = await pool.query(
      'SELECT id, constructor_id FROM developments WHERE id = $1',
      [developmentId]
    );

    if (devCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empreendimento não encontrado' 
      });
    }

    // Verificar permissão (construtora ou admin pode ver todas, cliente só as suas)
    let query = '';
    let params = [];

    if (req.user.role === 'constructor' || req.user.role === 'admin') {
      // Construtora vê todas as unidades do empreendimento
      if (devCheck.rows[0].constructor_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso negado' 
        });
      }
      query = `
        SELECT u.*, 
               d.name as development_name,
               us.name as owner_name,
               us.email as owner_email
        FROM units u
        JOIN developments d ON d.id = u.development_id
        LEFT JOIN users us ON us.id = u.owner_id
        WHERE u.development_id = $1
        ORDER BY u.block, u.floor, u.unit_number
      `;
      params = [developmentId];
    } else {
      // Cliente vê apenas suas unidades
      query = `
        SELECT u.*, 
               d.name as development_name
        FROM units u
        JOIN developments d ON d.id = u.development_id
        WHERE u.development_id = $1 AND u.owner_id = $2
        ORDER BY u.block, u.floor, u.unit_number
      `;
      params = [developmentId, req.user.id];
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar unidades',
      error: error.message 
    });
  }
});

// Create unit
router.post('/:developmentId/units', authenticate, authorize('constructor', 'admin'), [
  body('unit_number').notEmpty().withMessage('Número da unidade é obrigatório'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { developmentId } = req.params;
    const { unit_number, block, floor, type, area } = req.body;

    // Verificar se empreendimento existe e pertence à construtora
    const devCheck = await pool.query(
      'SELECT id, constructor_id FROM developments WHERE id = $1',
      [developmentId]
    );

    if (devCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empreendimento não encontrado' 
      });
    }

    if (devCheck.rows[0].constructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    // Gerar código único
    const unitCode = `${developmentId}-${unit_number}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const result = await pool.query(
      `INSERT INTO units (development_id, unit_code, unit_number, block, floor, type, area)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [developmentId, unitCode, unit_number, block || null, floor || null, type || null, area || null]
    );

    res.status(201).json({
      success: true,
      message: 'Unidade criada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar unidade:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar unidade',
      error: error.message 
    });
  }
});

// Link user to unit (via código)
router.post('/units/link', authenticate, [
  body('unit_code').notEmpty().withMessage('Código da unidade é obrigatório'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { unit_code } = req.body;

    // Buscar unidade pelo código
    const unitResult = await pool.query(
      'SELECT * FROM units WHERE unit_code = $1 AND is_active = true',
      [unit_code]
    );

    if (unitResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Código de unidade inválido ou inativo' 
      });
    }

    const unit = unitResult.rows[0];

    // Verificar se já está vinculado a outro usuário
    if (unit.owner_id && unit.owner_id !== req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Esta unidade já está vinculada a outro usuário' 
      });
    }

    // Vincular usuário à unidade
    await pool.query(
      'UPDATE units SET owner_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [req.user.id, unit.id]
    );

    // Buscar dados completos
    const finalResult = await pool.query(
      `SELECT u.*, d.name as development_name, d.address as development_address
       FROM units u
       JOIN developments d ON d.id = u.development_id
       WHERE u.id = $1`,
      [unit.id]
    );

    res.json({
      success: true,
      message: 'Unidade vinculada com sucesso',
      data: finalResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao vincular unidade:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao vincular unidade',
      error: error.message 
    });
  }
});

// Get user units
router.get('/units/my-units', authenticate, async (req, res) => {
  try {
    let query = '';
    let params = [];

    if (req.user.role === 'constructor' || req.user.role === 'admin') {
      // Construtora vê todas as unidades dos seus empreendimentos
      query = `
        SELECT u.*, d.name as development_name, d.address as development_address,
               d.city, d.state, us.name as owner_name, us.email as owner_email
        FROM units u
        JOIN developments d ON d.id = u.development_id
        LEFT JOIN users us ON us.id = u.owner_id
        WHERE d.constructor_id = $1
        ORDER BY d.name, u.block, u.floor, u.unit_number
      `;
      params = [req.user.id];
    } else {
      // Cliente vê apenas suas unidades
      query = `
        SELECT u.*, d.name as development_name, d.address as development_address,
               d.city, d.state
        FROM units u
        JOIN developments d ON d.id = u.development_id
        WHERE u.owner_id = $1
        ORDER BY u.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar unidades',
      error: error.message 
    });
  }
});

// Delete development
router.delete('/:id', authenticate, authorize('constructor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se empreendimento existe e pertence à construtora
    const devCheck = await pool.query(
      'SELECT id, constructor_id FROM developments WHERE id = $1',
      [id]
    );

    if (devCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empreendimento não encontrado' 
      });
    }

    if (devCheck.rows[0].constructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    // Verificar se há unidades vinculadas
    const unitsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM units WHERE development_id = $1',
      [id]
    );

    const unitsCount = parseInt(unitsCheck.rows[0].count);

    if (unitsCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Não é possível excluir empreendimento com ${unitsCount} unidade(s) cadastrada(s). Remova as unidades primeiro.` 
      });
    }

    // Excluir empreendimento
    await pool.query('DELETE FROM developments WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Empreendimento excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir empreendimento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir empreendimento',
      error: error.message 
    });
  }
});

export default router;

