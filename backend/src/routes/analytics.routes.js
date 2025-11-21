import express from 'express';
import pool from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get development analytics
router.get('/development/:developmentId', authenticate, authorize('constructor', 'admin'), async (req, res) => {
  try {
    const { developmentId } = req.params;

    // Verificar acesso
    const devCheck = await pool.query(
      'SELECT constructor_id FROM developments WHERE id = $1',
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

    // Top defeitos mais frequentes
    const topDefects = await pool.query(
      `SELECT category, COUNT(*) as count
       FROM services s
       JOIN units u ON u.id = s.unit_id
       WHERE u.development_id = $1 AND s.status = 'completed'
       GROUP BY category
       ORDER BY count DESC
       LIMIT 5`,
      [developmentId]
    );

    // Satisfação média e NPS
    const satisfaction = await pool.query(
      `SELECT 
        AVG(r.rating) as avg_rating,
        AVG(r.service_quality) as avg_service_quality,
        AVG(r.response_speed) as avg_response_speed,
        AVG(r.technician_work) as avg_technician_work,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN r.rating >= 9 THEN 1 ELSE 0 END) as promoters,
        SUM(CASE WHEN r.rating <= 6 THEN 1 ELSE 0 END) as detractors
       FROM reviews r
       JOIN services s ON s.id = r.service_id
       JOIN units u ON u.id = s.unit_id
       WHERE u.development_id = $1`,
      [developmentId]
    );

    const satisfactionData = satisfaction.rows[0];
    const totalReviews = parseInt(satisfactionData.total_reviews || 0);
    const promoters = parseInt(satisfactionData.promoters || 0);
    const detractors = parseInt(satisfactionData.detractors || 0);
    const nps = totalReviews > 0 
      ? Math.round(((promoters - detractors) / totalReviews) * 100) 
      : 0;

    // Custo médio de manutenção
    const cost = await pool.query(
      `SELECT 
        AVG(s.maintenance_cost) as avg_cost,
        SUM(s.maintenance_cost) as total_cost,
        COUNT(*) as total_services
       FROM services s
       JOIN units u ON u.id = s.unit_id
       WHERE u.development_id = $1 AND s.status = 'completed' AND s.maintenance_cost IS NOT NULL`,
      [developmentId]
    );

    // Tempo médio de resposta e resolução
    const timeMetrics = await pool.query(
      `SELECT 
        AVG(EXTRACT(EPOCH FROM (scheduled_date - created_at))/3600) as avg_response_hours,
        AVG(EXTRACT(EPOCH FROM (completed_date - created_at))/3600) as avg_resolution_hours
       FROM services s
       JOIN units u ON u.id = s.unit_id
       WHERE u.development_id = $1 AND s.status = 'completed' 
         AND s.scheduled_date IS NOT NULL AND s.completed_date IS NOT NULL`,
      [developmentId]
    );

    // Status distribution
    const statusDist = await pool.query(
      `SELECT s.status, COUNT(*) as count
       FROM services s
       JOIN units u ON u.id = s.unit_id
       WHERE u.development_id = $1
       GROUP BY s.status`,
      [developmentId]
    );

    // Priority distribution
    const priorityDist = await pool.query(
      `SELECT s.priority, COUNT(*) as count
       FROM services s
       JOIN units u ON u.id = s.unit_id
       WHERE u.development_id = $1
       GROUP BY s.priority`,
      [developmentId]
    );

    res.json({
      success: true,
      data: {
        top_defects: topDefects.rows,
        satisfaction: {
          avg_rating: parseFloat(satisfactionData.avg_rating || 0),
          avg_service_quality: parseFloat(satisfactionData.avg_service_quality || 0),
          avg_response_speed: parseFloat(satisfactionData.avg_response_speed || 0),
          avg_technician_work: parseFloat(satisfactionData.avg_technician_work || 0),
          total_reviews,
          nps
        },
        costs: {
          avg_cost: parseFloat(cost.rows[0].avg_cost || 0),
          total_cost: parseFloat(cost.rows[0].total_cost || 0),
          total_services: parseInt(cost.rows[0].total_services || 0)
        },
        time_metrics: {
          avg_response_hours: parseFloat(timeMetrics.rows[0].avg_response_hours || 0),
          avg_resolution_hours: parseFloat(timeMetrics.rows[0].avg_resolution_hours || 0)
        },
        status_distribution: statusDist.rows,
        priority_distribution: priorityDist.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar analytics',
      error: error.message 
    });
  }
});

export default router;

