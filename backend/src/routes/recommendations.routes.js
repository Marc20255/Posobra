import express from 'express';
import pool from '../database/connection.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get recommended technicians for a service
router.get('/technicians', authenticate, async (req, res) => {
  try {
    const { category, city, state, serviceId } = req.query;

    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Categoria é obrigatória' 
      });
    }

    // Buscar técnicos que têm a categoria necessária
    let query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        u.city,
        u.state,
        u.address,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as total_reviews,
        COUNT(DISTINCT s.id) as completed_services,
        COUNT(DISTINCT CASE WHEN s.category = $1 THEN s.id END) as category_services
      FROM users u
      LEFT JOIN technician_categories tc ON tc.technician_id = u.id
      LEFT JOIN services s ON s.technician_id = u.id AND s.status = 'completed'
      LEFT JOIN reviews r ON r.technician_id = u.id
      WHERE u.role = 'technician' 
        AND u.is_active = true
        AND (tc.category = $1 OR u.id IN (
          SELECT DISTINCT technician_id 
          FROM services 
          WHERE category = $1 AND status = 'completed' AND technician_id IS NOT NULL
        ))
    `;
    
    const params = [category];
    let paramCount = 2;

    // Filtrar por localização se fornecida
    if (city) {
      query += ` AND LOWER(u.city) = LOWER($${paramCount})`;
      params.push(city);
      paramCount++;
    }

    if (state) {
      query += ` AND UPPER(u.state) = UPPER($${paramCount})`;
      params.push(state);
      paramCount++;
    }

    query += `
      GROUP BY u.id, u.name, u.email, u.phone, u.avatar_url, u.city, u.state, u.address
      HAVING COUNT(DISTINCT CASE WHEN s.category = $1 THEN s.id END) > 0
      ORDER BY 
        category_services DESC,
        avg_rating DESC,
        completed_services DESC
      LIMIT 10
    `;

    const result = await pool.query(query, params);

    // Calcular score de recomendação
    const recommendations = result.rows.map(tech => {
      let score = 0;
      
      // Pontos por experiência na categoria
      score += parseInt(tech.category_services || 0) * 10;
      
      // Pontos por avaliação média
      score += parseFloat(tech.avg_rating || 0) * 20;
      
      // Pontos por total de serviços concluídos
      score += parseInt(tech.completed_services || 0) * 2;
      
      // Bônus por localização (mesma cidade)
      if (city && tech.city && tech.city.toLowerCase() === city.toLowerCase()) {
        score += 50;
      }
      
      // Bônus por localização (mesmo estado)
      if (state && tech.state && tech.state.toUpperCase() === state.toUpperCase()) {
        score += 20;
      }

      return {
        ...tech,
        recommendation_score: Math.round(score),
        avg_rating: parseFloat(tech.avg_rating || 0),
        total_reviews: parseInt(tech.total_reviews || 0),
        completed_services: parseInt(tech.completed_services || 0),
        category_services: parseInt(tech.category_services || 0)
      };
    }).sort((a, b) => b.recommendation_score - a.recommendation_score);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Erro ao buscar recomendações:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar recomendações',
      error: error.message 
    });
  }
});

// Get service cost estimate based on category and history
router.get('/cost-estimate', authenticate, async (req, res) => {
  try {
    const { category, city, state } = req.query;

    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Categoria é obrigatória' 
      });
    }

    // Buscar custo médio de serviços similares
    let query = `
      SELECT 
        AVG(maintenance_cost) as avg_cost,
        MIN(maintenance_cost) as min_cost,
        MAX(maintenance_cost) as max_cost,
        COUNT(*) as sample_size
      FROM services
      WHERE category = $1 
        AND status = 'completed' 
        AND maintenance_cost IS NOT NULL
        AND maintenance_cost > 0
    `;

    const params = [category];
    let paramCount = 2;

    if (city) {
      query += ` AND LOWER(city) = LOWER($${paramCount})`;
      params.push(city);
      paramCount++;
    }

    if (state) {
      query += ` AND UPPER(state) = UPPER($${paramCount})`;
      params.push(state);
      paramCount++;
    }

    const result = await pool.query(query, params);
    const estimate = result.rows[0];

    res.json({
      success: true,
      data: {
        avg_cost: parseFloat(estimate.avg_cost || 0),
        min_cost: parseFloat(estimate.min_cost || 0),
        max_cost: parseFloat(estimate.max_cost || 0),
        sample_size: parseInt(estimate.sample_size || 0),
        confidence: parseInt(estimate.sample_size || 0) > 10 ? 'high' : 
                    parseInt(estimate.sample_size || 0) > 5 ? 'medium' : 'low'
      }
    });
  } catch (error) {
    console.error('Erro ao estimar custo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao estimar custo',
      error: error.message 
    });
  }
});

export default router;

