import express from 'express';
import pool from '../database/connection.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [req.user.id];
    let paramCount = 2;

    if (unread_only === 'true') {
      query += ` AND is_read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get unread count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
      unread_count: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar notificações',
      error: error.message 
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notificação não encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Notificação marcada como lida',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao marcar notificação',
      error: error.message 
    });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    });
  } catch (error) {
    console.error('Erro ao marcar notificações:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao marcar notificações',
      error: error.message 
    });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM notifications 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notificação não encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Notificação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar notificação',
      error: error.message 
    });
  }
});

export default router;

