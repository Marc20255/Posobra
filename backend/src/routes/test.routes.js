import express from 'express';
import pool from '../database/connection.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Rota para criar dados de teste (apenas em desenvolvimento)
router.post('/create-test-data', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        success: false, 
        message: 'Não disponível em produção' 
      });
    }

    // 1. Criar construtora de teste
    const constructorResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Construtora Teste', 'construtora@test.com', await bcrypt.hash('senha123', 10), 'constructor']
    );

    let constructorId;
    if (constructorResult.rows.length > 0) {
      constructorId = constructorResult.rows[0].id;
    } else {
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND role = $2',
        ['construtora@test.com', 'constructor']
      );
      constructorId = existing.rows[0].id;
    }

    // 2. Criar empreendimento
    const devResult = await pool.query(
      `INSERT INTO developments (name, address, city, state, zip_code, constructor_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Residencial Teste', 'Rua Teste, 123', 'Porto Velho', 'RO', '76800000', constructorId]
    );

    let developmentId;
    if (devResult.rows.length > 0) {
      developmentId = devResult.rows[0].id;
    } else {
      const existing = await pool.query(
        'SELECT id FROM developments WHERE name = $1 LIMIT 1',
        ['Residencial Teste']
      );
      developmentId = existing.rows[0].id;
    }

    // 3. Criar unidades de teste
    const units = [
      { number: '101', block: 'A', floor: 1 },
      { number: '102', block: 'A', floor: 1 },
      { number: '201', block: 'A', floor: 2 },
    ];

    const createdUnits = [];
    for (const unit of units) {
      const unitCode = `${developmentId}-${unit.number}-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      const unitResult = await pool.query(
        `INSERT INTO units (development_id, unit_code, unit_number, block, floor, type, area, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (unit_code) DO UPDATE SET is_active = true
         RETURNING unit_code, unit_number, block, floor`,
        [developmentId, unitCode, unit.number, unit.block, unit.floor, 'Apartamento', 75.5]
      );

      if (unitResult.rows.length > 0) {
        createdUnits.push(unitResult.rows[0]);
      }
    }

    // Listar todas as unidades disponíveis
    const allUnits = await pool.query(
      'SELECT unit_code, unit_number, block, floor FROM units WHERE development_id = $1 AND is_active = true AND owner_id IS NULL',
      [developmentId]
    );

    res.json({
      success: true,
      message: 'Dados de teste criados com sucesso',
      data: {
        constructor_id: constructorId,
        development_id: developmentId,
        units: allUnits.rows,
        test_credentials: {
          constructor: {
            email: 'construtora@test.com',
            password: 'senha123',
            role: 'constructor'
          }
        }
      }
    });
  } catch (error) {
    console.error('Erro ao criar dados de teste:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar dados de teste',
      error: error.message 
    });
  }
});

// Listar unidades disponíveis para teste
router.get('/available-units', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.unit_code, u.unit_number, u.block, u.floor, d.name as development_name
       FROM units u
       JOIN developments d ON d.id = u.development_id
       WHERE u.is_active = true AND u.owner_id IS NULL
       ORDER BY u.created_at DESC
       LIMIT 20`
    );

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

export default router;

