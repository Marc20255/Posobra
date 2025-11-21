import express from 'express';
import pool from '../database/connection.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Badge definitions
const BADGE_DEFINITIONS = {
  // Cliente badges
  'first_service': {
    name: 'Primeiro Passo',
    description: 'Criou seu primeiro serviço',
    icon: '🎯',
    role: 'client'
  },
  'service_creator_5': {
    name: 'Cliente Ativo',
    description: 'Criou 5 serviços',
    icon: '⭐',
    role: 'client'
  },
  'service_creator_10': {
    name: 'Cliente Fiel',
    description: 'Criou 10 serviços',
    icon: '🌟',
    role: 'client'
  },
  'reviewer': {
    name: 'Avaliador',
    description: 'Avaliou um serviço',
    icon: '📝',
    role: 'client'
  },
  'reviewer_5': {
    name: 'Crítico Construtivo',
    description: 'Avaliou 5 serviços',
    icon: '📊',
    role: 'client'
  },
  'photo_uploader': {
    name: 'Fotógrafo',
    description: 'Enviou fotos em um serviço',
    icon: '📸',
    role: 'client'
  },
  
  // Técnico badges
  'first_completion': {
    name: 'Primeira Conquista',
    description: 'Concluiu seu primeiro serviço',
    icon: '🏆',
    role: 'technician'
  },
  'completion_5': {
    name: 'Profissional',
    description: 'Concluiu 5 serviços',
    icon: '💼',
    role: 'technician'
  },
  'completion_10': {
    name: 'Especialista',
    description: 'Concluiu 10 serviços',
    icon: '🎖️',
    role: 'technician'
  },
  'completion_50': {
    name: 'Mestre',
    description: 'Concluiu 50 serviços',
    icon: '👑',
    role: 'technician'
  },
  'high_rating': {
    name: 'Excelência',
    description: 'Média de avaliações acima de 4.5',
    icon: '⭐',
    role: 'technician'
  },
  'fast_response': {
    name: 'Rápido',
    description: 'Tempo médio de resposta menor que 24h',
    icon: '⚡',
    role: 'technician'
  },
  'perfect_rating': {
    name: 'Perfeição',
    description: 'Recebeu avaliação 5 estrelas',
    icon: '💎',
    role: 'technician'
  }
};

// Get user badges
router.get('/my-badges', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_badges WHERE user_id = $1 ORDER BY earned_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar badges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar badges',
      error: error.message 
    });
  }
});

// Get user badges by userId
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar se pode ver badges do usuário
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    const result = await pool.query(
      'SELECT * FROM user_badges WHERE user_id = $1 ORDER BY earned_at DESC',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar badges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar badges',
      error: error.message 
    });
  }
});

// Check and award badges (internal function)
export async function checkAndAwardBadges(userId, userRole, action, data = {}) {
  try {
    const badgesToCheck = [];

    if (userRole === 'client') {
      // Badges de cliente
      if (action === 'service_created') {
        const serviceCount = await pool.query(
          'SELECT COUNT(*) as count FROM services WHERE client_id = $1',
          [userId]
        );
        const count = parseInt(serviceCount.rows[0].count);

        if (count === 1) badgesToCheck.push('first_service');
        if (count === 5) badgesToCheck.push('service_creator_5');
        if (count === 10) badgesToCheck.push('service_creator_10');
      }

      if (action === 'review_created') {
        const reviewCount = await pool.query(
          'SELECT COUNT(*) as count FROM reviews WHERE client_id = $1',
          [userId]
        );
        const count = parseInt(reviewCount.rows[0].count);

        if (count === 1) badgesToCheck.push('reviewer');
        if (count === 5) badgesToCheck.push('reviewer_5');
      }

      if (action === 'photo_uploaded') {
        badgesToCheck.push('photo_uploader');
      }
    }

    if (userRole === 'technician') {
      // Badges de técnico
      if (action === 'service_completed') {
        const completionCount = await pool.query(
          'SELECT COUNT(*) as count FROM services WHERE technician_id = $1 AND status = $2',
          [userId, 'completed']
        );
        const count = parseInt(completionCount.rows[0].count);

        if (count === 1) badgesToCheck.push('first_completion');
        if (count === 5) badgesToCheck.push('completion_5');
        if (count === 10) badgesToCheck.push('completion_10');
        if (count === 50) badgesToCheck.push('completion_50');
      }

      if (action === 'review_received') {
        const avgRating = await pool.query(
          `SELECT AVG(rating) as avg_rating 
           FROM reviews r
           JOIN services s ON s.id = r.service_id
           WHERE s.technician_id = $1`,
          [userId]
        );
        const avg = parseFloat(avgRating.rows[0].avg_rating || 0);

        if (avg >= 4.5) badgesToCheck.push('high_rating');
        if (data.rating === 5) badgesToCheck.push('perfect_rating');
      }

      if (action === 'fast_response') {
        badgesToCheck.push('fast_response');
      }
    }

    // Verificar e conceder badges
    for (const badgeType of badgesToCheck) {
      const badgeDef = BADGE_DEFINITIONS[badgeType];
      if (!badgeDef || badgeDef.role !== userRole) continue;

      // Verificar se já tem o badge
      const existing = await pool.query(
        'SELECT id FROM user_badges WHERE user_id = $1 AND badge_type = $2',
        [userId, badgeType]
      );

      if (existing.rows.length === 0) {
        // Conceder badge
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, badgeType, badgeDef.name, badgeDef.description, badgeDef.icon]
        );

        // Criar notificação
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, related_id)
           VALUES ($1, $2, $3, 'badge_earned', $4)`,
          [
            userId,
            'Nova Conquista! 🎉',
            `Você ganhou o badge "${badgeDef.name}": ${badgeDef.description}`,
            null
          ]
        );
      }
    }
  } catch (error) {
    console.error('Erro ao verificar badges:', error);
  }
}

export default router;

