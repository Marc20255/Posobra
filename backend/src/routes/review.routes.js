import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/connection.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { checkAndAwardBadges } from './badges.routes.js';

const router = express.Router();

// Create review
router.post('/', authenticate, [
  body('service_id').isInt().withMessage('ID do serviço é obrigatório'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      service_id, 
      rating, 
      comment,
      service_quality,
      response_speed,
      technician_work,
      inspection_quality,
      improvement_suggestions
    } = req.body;

    // Verify service exists and is completed
    const serviceCheck = await pool.query(
      'SELECT client_id, technician_id, status FROM services WHERE id = $1',
      [service_id]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceCheck.rows[0];

    // Only client can review
    if (req.user.role !== 'client' || service.client_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas o cliente pode avaliar o serviço' 
      });
    }

    if (service.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Apenas serviços concluídos podem ser avaliados' 
      });
    }

    // Verificar se já existe avaliação (avaliação obrigatória conforme edital)
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE service_id = $1 AND client_id = $2',
      [service_id, req.user.id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este serviço já foi avaliado. A avaliação é obrigatória e única.' 
      });
    }

    const result = await pool.query(
      `INSERT INTO reviews (
        service_id, client_id, technician_id, rating, comment,
        service_quality, response_speed, technician_work, inspection_quality, improvement_suggestions
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        service_id, req.user.id, service.technician_id, rating, comment || null,
        service_quality || null, response_speed || null, technician_work || null,
        inspection_quality || null, improvement_suggestions || null
      ]
    );

    // Create notification for technician
    if (service.technician_id) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         VALUES ($1, $2, $3, 'new_review', $4)`,
        [
          service.technician_id,
          'Nova avaliação recebida',
          `Você recebeu uma avaliação de ${rating} estrelas`,
          service_id
        ]
      );

      // Verificar badges do técnico
      await checkAndAwardBadges(service.technician_id, 'technician', 'review_received', { rating });
    }

    // Verificar badges do cliente
    await checkAndAwardBadges(req.user.id, req.user.role, 'review_created');

    res.status(201).json({
      success: true,
      message: 'Avaliação criada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar avaliação',
      error: error.message 
    });
  }
});

// Get reviews for technician
router.get('/technician/:technicianId', async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT r.*, 
              u.name as client_name, u.avatar_url as client_avatar,
              s.title as service_title
       FROM reviews r
       JOIN users u ON u.id = r.client_id
       JOIN services s ON s.id = r.service_id
       WHERE r.technician_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [technicianId, limit, offset]
    );

    // Get average rating
    const avgResult = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
       FROM reviews WHERE technician_id = $1`,
      [technicianId]
    );

    res.json({
      success: true,
      data: result.rows,
      summary: {
        avg_rating: parseFloat(avgResult.rows[0].avg_rating || 0),
        total_reviews: parseInt(avgResult.rows[0].total_reviews || 0)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar avaliações',
      error: error.message 
    });
  }
});

// Get review for service
router.get('/service/:serviceId', authenticate, async (req, res) => {
  try {
    const { serviceId } = req.params;

    const result = await pool.query(
      `SELECT r.*, 
              u.name as client_name, u.avatar_url as client_avatar
       FROM reviews r
       JOIN users u ON u.id = r.client_id
       WHERE r.service_id = $1`,
      [serviceId]
    );

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar avaliação',
      error: error.message 
    });
  }
});

export default router;

