import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/connection.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get messages for a service
router.get('/service/:serviceId', authenticate, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user has access to this service
    const serviceCheck = await pool.query(
      'SELECT client_id, technician_id, unit_id, status FROM services WHERE id = $1',
      [serviceId]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceCheck.rows[0];
    
    // Check authorization - similar to service detail page
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'client' && service.client_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'technician' && 
               (service.technician_id === req.user.id || 
                (service.technician_id === null && service.status === 'pending'))) {
      hasAccess = true;
    } else if (req.user.role === 'constructor') {
      // Check if service belongs to constructor's development
      if (service.unit_id) {
        const unitCheck = await pool.query(
          `SELECT d.constructor_id 
           FROM units u
           JOIN developments d ON d.id = u.development_id
           WHERE u.id = $1`,
          [service.unit_id]
        );
        if (unitCheck.rows.length > 0 && unitCheck.rows[0].constructor_id === req.user.id) {
          hasAccess = true;
        }
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    const result = await pool.query(
      `SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar, u.role as sender_role
       FROM chat_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.service_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [serviceId, limit, offset]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE chat_messages 
       SET is_read = true 
       WHERE service_id = $1 AND sender_id != $2 AND is_read = false`,
      [serviceId, req.user.id]
    );

    res.json({
      success: true,
      data: result.rows.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar mensagens',
      error: error.message 
    });
  }
});

// Send message
router.post('/service/:serviceId', authenticate, [
  body('message').trim().notEmpty().withMessage('Mensagem é obrigatória'),
  body('message_type').optional().isIn(['text', 'image', 'file'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { serviceId } = req.params;
    const { message, message_type = 'text', attachment_url } = req.body;

    // Verify user has access to this service
    const serviceCheck = await pool.query(
      'SELECT client_id, technician_id, unit_id, status FROM services WHERE id = $1',
      [serviceId]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceCheck.rows[0];
    
    // Check authorization - similar to service detail page
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'client' && service.client_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'technician' && 
               (service.technician_id === req.user.id || 
                (service.technician_id === null && service.status === 'pending'))) {
      hasAccess = true;
    } else if (req.user.role === 'constructor') {
      // Check if service belongs to constructor's development
      if (service.unit_id) {
        const unitCheck = await pool.query(
          `SELECT d.constructor_id 
           FROM units u
           JOIN developments d ON d.id = u.development_id
           WHERE u.id = $1`,
          [service.unit_id]
        );
        if (unitCheck.rows.length > 0 && unitCheck.rows[0].constructor_id === req.user.id) {
          hasAccess = true;
        }
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (service_id, sender_id, message, message_type, attachment_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [serviceId, req.user.id, message, message_type, attachment_url || null]
    );

    // Get sender info
    const senderResult = await pool.query(
      'SELECT name, avatar_url, role FROM users WHERE id = $1',
      [req.user.id]
    );

    const messageData = {
      ...result.rows[0],
      sender_name: senderResult.rows[0].name,
      sender_avatar: senderResult.rows[0].avatar_url,
      sender_role: senderResult.rows[0].role
    };

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`service-${serviceId}`).emit('new-message', messageData);
    }

    // Create notification for the other party
    let recipientIds = [];
    
    if (req.user.role === 'client') {
      // Cliente enviou - notificar técnico
      if (service.technician_id) {
        recipientIds.push(service.technician_id)
      }
    } else if (req.user.role === 'technician') {
      // Técnico enviou - notificar cliente
      recipientIds.push(service.client_id)
    } else if (req.user.role === 'constructor') {
      // Construtora enviou - notificar cliente e técnico
      recipientIds.push(service.client_id)
      if (service.technician_id) {
        recipientIds.push(service.technician_id)
      }
    }

    // Criar notificações para todos os destinatários
    for (const recipientId of recipientIds) {
      if (recipientId && recipientId !== req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, related_id)
           VALUES ($1, $2, $3, 'new_message', $4)`,
          [
            recipientId,
            'Nova mensagem',
            `Você recebeu uma nova mensagem no serviço`,
            serviceId
          ]
        )
      }
    }

    res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: messageData
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao enviar mensagem',
      error: error.message 
    });
  }
});

export default router;

