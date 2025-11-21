import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pool from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { createLimiter } from '../middleware/rateLimiter.middleware.js';
import { checkAndAwardBadges } from './badges.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for photo uploads
const uploadDir = path.join(__dirname, '../../uploads/photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const photoUpload = multer({
  storage: photoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image/.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// Create service request (with optional photos)
router.post('/', authenticate, createLimiter, photoUpload.array('photos', 10), [
  body('title').trim().isLength({ min: 5 }).withMessage('Título deve ter pelo menos 5 caracteres'),
  body('description').trim().isLength({ min: 10 }).withMessage('Descrição deve ter pelo menos 10 caracteres'),
  body('category').notEmpty().withMessage('Categoria é obrigatória'),
  body('address').notEmpty().withMessage('Endereço é obrigatório'),
  body('city').notEmpty().withMessage('Cidade é obrigatória'),
  body('state').isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('zip_code').notEmpty().withMessage('CEP é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Regra de negócio: Cliente não pode criar novo serviço se tiver serviço concluído sem avaliação
    if (req.user.role === 'client') {
      const completedServicesWithoutReview = await pool.query(
        `SELECT s.id, s.title 
         FROM services s
         LEFT JOIN reviews r ON r.service_id = s.id AND r.client_id = $1
         WHERE s.client_id = $1 
           AND s.status = 'completed' 
           AND r.id IS NULL
         LIMIT 1`,
        [req.user.id]
      );

      if (completedServicesWithoutReview.rows.length > 0) {
        const service = completedServicesWithoutReview.rows[0];
        return res.status(400).json({ 
          success: false, 
          message: `Você precisa avaliar o serviço "${service.title}" antes de criar um novo chamado. Esta é uma regra obrigatória do sistema.`,
          pending_review_service_id: service.id
        });
      }
    }

    const { 
      title, 
      description, 
      category, 
      priority = 'medium',
      address, 
      city, 
      state, 
      zip_code,
      scheduled_date,
      technician_id,
      unit_id,
      maintenance_cost,
      client_id // Permitir especificar cliente (para construtora)
    } = req.body;

    // Determinar client_id baseado no papel do usuário
    let serviceClientId = req.user.id; // Padrão: usuário que cria
    
    if (req.user.role === 'constructor' || req.user.role === 'admin') {
      // Se construtora/admin especificou client_id, usar
      if (client_id) {
        serviceClientId = client_id;
      } else if (unit_id) {
        // Se não especificou, buscar owner_id da unidade
        const unitResult = await pool.query(
          'SELECT owner_id FROM units WHERE id = $1',
          [unit_id]
        );
        
        if (unitResult.rows.length > 0 && unitResult.rows[0].owner_id) {
          serviceClientId = unitResult.rows[0].owner_id;
        } else {
          // Se unidade não tem owner, usar construtora como cliente temporário
          // Mas isso não é ideal - melhor exigir que especifique cliente
          return res.status(400).json({
            success: false,
            message: 'A unidade selecionada não possui proprietário vinculado. Por favor, especifique um cliente ou vincule um proprietário à unidade.'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'É necessário especificar uma unidade ou um cliente para criar o serviço.'
        });
      }
    }

    const status = technician_id ? 'scheduled' : 'pending';

    const result = await pool.query(
      `INSERT INTO services 
       (client_id, technician_id, title, description, category, status, priority, 
        scheduled_date, address, city, state, zip_code, unit_id, maintenance_cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [serviceClientId, technician_id || null, title, description, category, status, priority, 
       scheduled_date || null, address, city, state, zip_code, unit_id || null, maintenance_cost || null]
    );

    const newService = result.rows[0];

    // Geocodificar endereço automaticamente (em background, não bloquear resposta)
    (async () => {
      try {
        const fullAddress = `${address}, ${city}, ${state}, Brasil`;
        const encodedAddress = encodeURIComponent(fullAddress);
        
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
          {
            headers: {
              'User-Agent': 'PosObraApp/1.0'
            }
          }
        );

        const geocodeData = await geocodeResponse.json();

        if (geocodeData && geocodeData.length > 0) {
          const lat = parseFloat(geocodeData[0].lat);
          const lng = parseFloat(geocodeData[0].lon);

          await pool.query(
            'UPDATE services SET lat = $1, lng = $2 WHERE id = $3',
            [lat, lng, newService.id]
          );
          console.log(`✅ Coordenadas geocodificadas para serviço ${newService.id}: ${lat}, ${lng}`);
        }
      } catch (error) {
        console.error(`Erro ao geocodificar serviço ${newService.id}:`, error);
        // Não falhar a criação do serviço se geocoding falhar
      }
    })();

    // Registrar histórico de status
    await pool.query(
      `INSERT INTO service_status_history (service_id, status, changed_by)
       VALUES ($1, $2, $3)`,
      [result.rows[0].id, status, req.user.id]
    );

    // Create notification for constructor if service is linked to a unit
    if (unit_id) {
      const constructorResult = await pool.query(
        `SELECT d.constructor_id, d.name as development_name, u.unit_number
         FROM units u
         JOIN developments d ON d.id = u.development_id
         WHERE u.id = $1 AND d.constructor_id IS NOT NULL`,
        [unit_id]
      );

      if (constructorResult.rows.length > 0 && constructorResult.rows[0].constructor_id) {
        const constructorId = constructorResult.rows[0].constructor_id;
        const developmentName = constructorResult.rows[0].development_name;
        const unitNumber = constructorResult.rows[0].unit_number;
        
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, related_id)
           VALUES ($1, $2, $3, 'new_service', $4)`,
          [
            constructorId,
            'Novo serviço criado',
            `Um novo serviço foi criado no empreendimento ${developmentName}, unidade ${unitNumber}: ${title}`,
            result.rows[0].id
          ]
        );
      }
    }

    // Create notification for technician if assigned
    if (technician_id) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         VALUES ($1, $2, $3, 'service_assigned', $4)`,
        [
          technician_id,
          'Novo serviço atribuído',
          `Você foi atribuído ao serviço: ${title}`,
          result.rows[0].id
        ]
      );
    }

    // Process uploaded photos (if any) - mark as "before" photos
    const uploadedPhotos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUrl = `/uploads/photos/${file.filename}`;
        const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;
        
        const photoResult = await pool.query(
          `INSERT INTO service_photos (service_id, photo_url, description, is_before, uploaded_by)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [result.rows[0].id, fullUrl, null, true, req.user.id]
        );
        uploadedPhotos.push(photoResult.rows[0]);
      }
      
      // Verificar badge de foto
      if (req.user.role === 'client') {
        await checkAndAwardBadges(req.user.id, req.user.role, 'photo_uploaded');
      }
    }

    // Verificar badges de criação de serviço
    if (req.user.role === 'client') {
      await checkAndAwardBadges(req.user.id, req.user.role, 'service_created');
    }

    res.status(201).json({
      success: true,
      message: 'Solicitação de serviço criada com sucesso',
      data: {
        ...result.rows[0],
        photos: uploadedPhotos
      }
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar serviço',
      error: error.message 
    });
  }
});

// Get services (filtered by user role)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = '';
    let queryParams = [];
    let paramCount = 1;

    if (req.user.role === 'client') {
      query = `
        SELECT s.*, 
               t.name as technician_name, t.phone as technician_phone, t.avatar_url as technician_avatar,
               c.name as client_name, c.phone as client_phone, c.avatar_url as client_avatar
        FROM services s
        LEFT JOIN users t ON t.id = s.technician_id
        JOIN users c ON c.id = s.client_id
        WHERE s.client_id = $${paramCount}
          AND (s.deletion_status IS NULL OR s.deletion_status = 'none' OR s.deletion_status = 'pending_approval' OR s.deletion_status = 'rejected')
      `;
      queryParams.push(req.user.id);
      paramCount++;
    } else if (req.user.role === 'technician') {
      query = `
        SELECT s.*, 
               t.name as technician_name, t.phone as technician_phone, t.avatar_url as technician_avatar,
               c.name as client_name, c.phone as client_phone, c.avatar_url as client_avatar
        FROM services s
        LEFT JOIN users t ON t.id = s.technician_id
        JOIN users c ON c.id = s.client_id
        WHERE (s.technician_id = $${paramCount} OR (s.technician_id IS NULL AND s.status = 'pending'))
          AND (s.deletion_status IS NULL OR s.deletion_status = 'none' OR s.deletion_status = 'pending_approval' OR s.deletion_status = 'rejected')
      `;
      queryParams.push(req.user.id);
      paramCount++;
    } else if (req.user.role === 'constructor') {
      // Construtora vê serviços das unidades dos seus empreendimentos
      query = `
        SELECT s.*, 
               t.name as technician_name, t.phone as technician_phone, t.avatar_url as technician_avatar,
               c.name as client_name, c.phone as client_phone, c.avatar_url as client_avatar
        FROM services s
        LEFT JOIN users t ON t.id = s.technician_id
        JOIN users c ON c.id = s.client_id
        INNER JOIN units u ON u.id = s.unit_id
        INNER JOIN developments d ON d.id = u.development_id
        WHERE d.constructor_id = $${paramCount}
          AND (s.deletion_status IS NULL OR s.deletion_status = 'none' OR s.deletion_status = 'pending_approval' OR s.deletion_status = 'rejected')
      `;
      queryParams.push(req.user.id);
      paramCount++;
    } else {
      // Admin - all services
      query = `
        SELECT s.*, 
               t.name as technician_name, t.phone as technician_phone, t.avatar_url as technician_avatar,
               c.name as client_name, c.phone as client_phone, c.avatar_url as client_avatar
        FROM services s
        LEFT JOIN users t ON t.id = s.technician_id
        JOIN users c ON c.id = s.client_id
        WHERE 1=1
      `;
    }

    if (status) {
      query += ` AND s.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND s.category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = '';
    let countParams = [];
    if (req.user.role === 'client') {
      countQuery = 'SELECT COUNT(*) FROM services WHERE client_id = $1';
      countParams = [req.user.id];
    } else if (req.user.role === 'technician') {
      countQuery = 'SELECT COUNT(*) FROM services WHERE technician_id = $1 OR (technician_id IS NULL AND status = \'pending\')';
      countParams = [req.user.id];
    } else if (req.user.role === 'constructor') {
      countQuery = `
        SELECT COUNT(*) FROM services s
        INNER JOIN units u ON u.id = s.unit_id
        INNER JOIN developments d ON d.id = u.development_id
        WHERE d.constructor_id = $1
      `;
      countParams = [req.user.id];
    } else {
      countQuery = 'SELECT COUNT(*) FROM services';
      countParams = [];
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar serviços',
      error: error.message 
    });
  }
});

// Get service by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.*, 
              t.name as technician_name, t.phone as technician_phone, t.avatar_url as technician_avatar, t.email as technician_email,
              c.name as client_name, c.phone as client_phone, c.avatar_url as client_avatar, c.email as client_email,
              u.unit_code, u.unit_number, u.block, d.name as development_name,
              d.constructor_id,
              requester.name as deletion_requester_name,
              requester.role as deletion_requester_role
       FROM services s
       LEFT JOIN users t ON t.id = s.technician_id
       JOIN users c ON c.id = s.client_id
       LEFT JOIN units u ON u.id = s.unit_id
       LEFT JOIN developments d ON d.id = u.development_id
       LEFT JOIN users requester ON requester.id = s.deletion_requested_by
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    // Check authorization
    const service = result.rows[0];
    
    // Verificar acesso: admin, cliente do serviço, técnico atribuído, ou técnico em serviço pendente
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'client' && service.client_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'technician') {
      // Técnico pode ver serviços atribuídos a ele ou serviços pendentes (sem técnico)
      if (service.technician_id === req.user.id || 
          (service.technician_id === null && service.status === 'pending')) {
        hasAccess = true;
      }
    } else if (req.user.role === 'constructor') {
      // Construtora pode ver serviços das unidades dos seus empreendimentos
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
      // Se não tiver unit_id, não permite acesso (serviço não vinculado a empreendimento)
    }
    
    if (!hasAccess) {
      console.log('Acesso negado:', {
        userId: req.user.id,
        userRole: req.user.role,
        serviceId: id,
        serviceClientId: service.client_id,
        serviceTechnicianId: service.technician_id,
        serviceStatus: service.status,
        serviceUnitId: service.unit_id
      });
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    // Get photos
    const photosResult = await pool.query(
      'SELECT * FROM service_photos WHERE service_id = $1 ORDER BY created_at',
      [id]
    );

    // Get documents
    const documentsResult = await pool.query(
      'SELECT * FROM service_documents WHERE service_id = $1 ORDER BY created_at',
      [id]
    );

    // Get audios
    const audiosResult = await pool.query(
      `SELECT a.*, u.name as uploaded_by_name
       FROM service_audios a
       LEFT JOIN users u ON u.id = a.uploaded_by
       WHERE a.service_id = $1
       ORDER BY a.created_at`,
      [id]
    );

    // Get status history
    const historyResult = await pool.query(
      `SELECT h.*, u.name as changed_by_name
       FROM service_status_history h
       LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.service_id = $1
       ORDER BY h.created_at`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...service,
        photos: photosResult.rows,
        documents: documentsResult.rows,
        audios: audiosResult.rows,
        status_history: historyResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar serviço',
      error: error.message 
    });
  }
});

// Update service
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, technician_id, scheduled_date, estimated_cost, final_cost, priority } = req.body;

    // Check if service exists and user has permission
    const serviceCheck = await pool.query(
      'SELECT * FROM services WHERE id = $1',
      [id]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceCheck.rows[0];

    // Authorization check
    // Cliente pode atualizar apenas seus próprios serviços (mas não o status)
    if (req.user.role === 'client' && service.client_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    // Técnico pode atualizar apenas serviços atribuídos a ele
    if (req.user.role === 'technician' && service.technician_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    // Apenas técnico pode atualizar o status (exceto cancelamento que cliente/construtora podem fazer)
    if (status && status !== 'cancelled') {
      if (req.user.role !== 'technician' && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Apenas o técnico responsável pode atualizar o status do serviço' 
        });
      }
      
      // Verificar se técnico está atribuído ao serviço
      if (req.user.role === 'technician' && service.technician_id !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Apenas o técnico atribuído pode atualizar o status' 
        });
      }
    }

    // Cancelamento: cliente ou construtora podem cancelar seus próprios serviços
    if (status === 'cancelled') {
      if (req.user.role === 'client' && service.client_id !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso negado' 
        });
      }
      
      if (req.user.role === 'constructor') {
        // Verificar se serviço pertence a um empreendimento da construtora
        if (service.unit_id) {
          const unitCheck = await pool.query(
            `SELECT d.constructor_id 
             FROM units u
             JOIN developments d ON d.id = u.development_id
             WHERE u.id = $1`,
            [service.unit_id]
          );
          if (unitCheck.rows.length === 0 || unitCheck.rows[0].constructor_id !== req.user.id) {
            return res.status(403).json({ 
              success: false, 
              message: 'Acesso negado' 
            });
          }
        } else {
          return res.status(403).json({ 
            success: false, 
            message: 'Acesso negado' 
          });
        }
      }
      
      // Técnico também pode cancelar se for o responsável
      if (req.user.role === 'technician' && service.technician_id !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso negado' 
        });
      }
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);

      if (status === 'completed') {
        updates.push(`completed_date = CURRENT_TIMESTAMP`);
      }

      // Registrar histórico de status
      await pool.query(
        `INSERT INTO service_status_history (service_id, status, changed_by)
         VALUES ($1, $2, $3)`,
        [id, status, req.user.id]
      );
    }

    if (technician_id !== undefined) {
      updates.push(`technician_id = $${paramCount++}`);
      values.push(technician_id);
      if (technician_id && service.status === 'pending') {
        updates.push(`status = 'scheduled'`);
      }
    }

    if (scheduled_date !== undefined) {
      updates.push(`scheduled_date = $${paramCount++}`);
      values.push(scheduled_date);
    }

    if (estimated_cost !== undefined) {
      updates.push(`estimated_cost = $${paramCount++}`);
      values.push(estimated_cost);
    }

    if (final_cost !== undefined) {
      updates.push(`final_cost = $${paramCount++}`);
      values.push(final_cost);
    }

    if (req.body.maintenance_cost !== undefined) {
      updates.push(`maintenance_cost = $${paramCount++}`);
      values.push(req.body.maintenance_cost);
    }

    if (priority) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum campo para atualizar' 
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE services SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Create notifications
    if (status === 'completed' && service.client_id) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         VALUES ($1, $2, $3, 'service_completed', $4)`,
        [
          service.client_id,
          'Serviço concluído',
          `O serviço "${service.title}" foi concluído`,
          id
        ]
      );
    }

    // Verificar badges de conclusão de serviço
    if (status === 'completed' && service.technician_id) {
      await checkAndAwardBadges(service.technician_id, 'technician', 'service_completed');
    }

    res.json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar serviço',
      error: error.message 
    });
  }
});

// Get my service history (for clients - simplified route)
router.get('/my-history', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Esta rota é apenas para clientes.' 
      });
    }

    // Usar a mesma lógica da rota /client/:clientId mas com req.user.id
    const clientId = req.user.id.toString();
    const { page = 1, limit = 20, status, category } = req.query;
    const offset = (page - 1) * limit;

    // Verificar se o cliente existe
    const clientCheck = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [clientId]
    );

    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }

    const client = clientCheck.rows[0];

    // Verificar autorização
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'client' && req.user.id === parseInt(clientId)) {
      // Cliente pode ver seu próprio histórico
      hasAccess = true;
    } else if (req.user.role === 'constructor') {
      // Construtora pode ver histórico de clientes que têm unidades nos seus empreendimentos
      const clientUnitsCheck = await pool.query(
        `SELECT COUNT(*) as count
         FROM units u
         JOIN developments d ON d.id = u.development_id
         WHERE u.owner_id = $1 AND d.constructor_id = $2`,
        [clientId, req.user.id]
      );
      if (parseInt(clientUnitsCheck.rows[0].count) > 0) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    // Construir query base
    let query = `
      SELECT s.*, 
             t.name as technician_name, t.phone as technician_phone, t.avatar_url as technician_avatar,
             c.name as client_name, c.phone as client_phone, c.avatar_url as client_avatar,
             u.unit_code, u.unit_number, u.block, d.name as development_name,
             r.rating as review_rating, r.comment as review_comment, r.created_at as review_date
      FROM services s
      LEFT JOIN users t ON t.id = s.technician_id
      JOIN users c ON c.id = s.client_id
      LEFT JOIN units u ON u.id = s.unit_id
      LEFT JOIN developments d ON d.id = u.development_id
      LEFT JOIN reviews r ON r.service_id = s.id AND r.client_id = s.client_id
      WHERE s.client_id = $1
    `;
    let queryParams = [clientId];
    let paramCount = 2;

    // Filtros opcionais
    if (status) {
      query += ` AND s.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND s.category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    // Se for construtora, filtrar apenas serviços das unidades dos seus empreendimentos
    if (req.user.role === 'constructor') {
      query += ` AND d.constructor_id = $${paramCount}`;
      queryParams.push(req.user.id);
      paramCount++;
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Buscar histórico de status para cada serviço
    const servicesWithHistory = await Promise.all(
      result.rows.map(async (service) => {
        const historyResult = await pool.query(
          `SELECT h.*, u.name as changed_by_name
           FROM service_status_history h
           LEFT JOIN users u ON u.id = h.changed_by
           WHERE h.service_id = $1
           ORDER BY h.created_at`,
          [service.id]
        );
        return {
          ...service,
          status_history: historyResult.rows
        };
      })
    );

    // Estatísticas do cliente
    let statsQuery = `
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_services,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_services,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_services,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_services,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_services,
        AVG(CASE WHEN status = 'completed' AND maintenance_cost IS NOT NULL THEN maintenance_cost END) as avg_cost,
        SUM(CASE WHEN status = 'completed' AND maintenance_cost IS NOT NULL THEN maintenance_cost ELSE 0 END) as total_cost,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as total_reviews
      FROM services s
      LEFT JOIN reviews r ON r.service_id = s.id AND r.client_id = s.client_id
      WHERE s.client_id = $1
    `;
    let statsParams = [clientId];

    // Se for construtora, filtrar apenas serviços das unidades dos seus empreendimentos
    if (req.user.role === 'constructor') {
      statsQuery = `
        SELECT 
          COUNT(*) as total_services,
          COUNT(CASE WHEN s.status = 'pending' THEN 1 END) as pending_services,
          COUNT(CASE WHEN s.status = 'scheduled' THEN 1 END) as scheduled_services,
          COUNT(CASE WHEN s.status = 'in_progress' THEN 1 END) as in_progress_services,
          COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_services,
          COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancelled_services,
          AVG(CASE WHEN s.status = 'completed' AND s.maintenance_cost IS NOT NULL THEN s.maintenance_cost END) as avg_cost,
          SUM(CASE WHEN s.status = 'completed' AND s.maintenance_cost IS NOT NULL THEN s.maintenance_cost ELSE 0 END) as total_cost,
          AVG(r.rating) as avg_rating,
          COUNT(r.id) as total_reviews
        FROM services s
        LEFT JOIN units u ON u.id = s.unit_id
        LEFT JOIN developments d ON d.id = u.development_id
        LEFT JOIN reviews r ON r.service_id = s.id AND r.client_id = s.client_id
        WHERE s.client_id = $1 AND d.constructor_id = $2
      `;
      statsParams = [clientId, req.user.id];
    }

    const statsResult = await pool.query(statsQuery, statsParams);
    const stats = statsResult.rows[0];

    // Contagem total para paginação
    let countQuery = 'SELECT COUNT(*) FROM services WHERE client_id = $1';
    let countParams = [clientId];
    
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }
    
    if (category) {
      countQuery += status ? ' AND category = $3' : ' AND category = $2';
      countParams.push(category);
    }

    // Se for construtora, filtrar apenas serviços das unidades dos seus empreendimentos
    if (req.user.role === 'constructor') {
      countQuery = `
        SELECT COUNT(*) 
        FROM services s
        LEFT JOIN units u ON u.id = s.unit_id
        LEFT JOIN developments d ON d.id = u.development_id
        WHERE s.client_id = $1 AND d.constructor_id = $2
      `;
      countParams = [clientId, req.user.id];
      
      if (status) {
        countQuery += ' AND s.status = $3';
        countParams.push(status);
      }
      
      if (category) {
        countQuery += status ? ' AND s.category = $4' : ' AND s.category = $3';
        countParams.push(category);
      }
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: client.name,
          email: client.email
        },
        services: servicesWithHistory,
        statistics: {
          total_services: parseInt(stats.total_services || 0),
          pending_services: parseInt(stats.pending_services || 0),
          scheduled_services: parseInt(stats.scheduled_services || 0),
          in_progress_services: parseInt(stats.in_progress_services || 0),
          completed_services: parseInt(stats.completed_services || 0),
          cancelled_services: parseInt(stats.cancelled_services || 0),
          avg_cost: parseFloat(stats.avg_cost || 0),
          total_cost: parseFloat(stats.total_cost || 0),
          avg_rating: parseFloat(stats.avg_rating || 0),
          total_reviews: parseInt(stats.total_reviews || 0)
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar histórico',
      error: error.message 
    });
  }
});

// Get client service history by clientId (for constructors and admins)
router.get('/client/:clientId', authenticate, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 20, status, category } = req.query;
    const offset = (page - 1) * limit;

    // Verificar se o cliente existe
    const clientCheck = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [clientId]
    );

    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }

    const client = clientCheck.rows[0];

    // Verificar autorização
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'client' && req.user.id === parseInt(clientId)) {
      // Cliente pode ver seu próprio histórico
      hasAccess = true;
    } else if (req.user.role === 'constructor') {
      // Construtora pode ver histórico de clientes que têm unidades nos seus empreendimentos
      const clientUnitsCheck = await pool.query(
        `SELECT COUNT(*) as count
         FROM units u
         JOIN developments d ON d.id = u.development_id
         WHERE u.owner_id = $1 AND d.constructor_id = $2`,
        [clientId, req.user.id]
      );
      if (parseInt(clientUnitsCheck.rows[0].count) > 0) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    // Construir query base
    let query = `
      SELECT s.*, 
             t.name as technician_name, t.phone as technician_phone, t.avatar_url as technician_avatar,
             c.name as client_name, c.phone as client_phone, c.avatar_url as client_avatar,
             u.unit_code, u.unit_number, u.block, d.name as development_name,
             r.rating as review_rating, r.comment as review_comment, r.created_at as review_date
      FROM services s
      LEFT JOIN users t ON t.id = s.technician_id
      JOIN users c ON c.id = s.client_id
      LEFT JOIN units u ON u.id = s.unit_id
      LEFT JOIN developments d ON d.id = u.development_id
      LEFT JOIN reviews r ON r.service_id = s.id AND r.client_id = s.client_id
      WHERE s.client_id = $1
    `;
    let queryParams = [clientId];
    let paramCount = 2;

    // Filtros opcionais
    if (status) {
      query += ` AND s.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND s.category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    // Se for construtora, filtrar apenas serviços das unidades dos seus empreendimentos
    if (req.user.role === 'constructor') {
      query += ` AND d.constructor_id = $${paramCount}`;
      queryParams.push(req.user.id);
      paramCount++;
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Buscar histórico de status para cada serviço
    const servicesWithHistory = await Promise.all(
      result.rows.map(async (service) => {
        const historyResult = await pool.query(
          `SELECT h.*, u.name as changed_by_name
           FROM service_status_history h
           LEFT JOIN users u ON u.id = h.changed_by
           WHERE h.service_id = $1
           ORDER BY h.created_at`,
          [service.id]
        );
        return {
          ...service,
          status_history: historyResult.rows
        };
      })
    );

    // Estatísticas do cliente
    let statsQuery = `
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_services,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_services,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_services,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_services,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_services,
        AVG(CASE WHEN status = 'completed' AND maintenance_cost IS NOT NULL THEN maintenance_cost END) as avg_cost,
        SUM(CASE WHEN status = 'completed' AND maintenance_cost IS NOT NULL THEN maintenance_cost ELSE 0 END) as total_cost,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as total_reviews
      FROM services s
      LEFT JOIN reviews r ON r.service_id = s.id AND r.client_id = s.client_id
      WHERE s.client_id = $1
    `;
    let statsParams = [clientId];

    // Se for construtora, filtrar apenas serviços das unidades dos seus empreendimentos
    if (req.user.role === 'constructor') {
      statsQuery = `
        SELECT 
          COUNT(*) as total_services,
          COUNT(CASE WHEN s.status = 'pending' THEN 1 END) as pending_services,
          COUNT(CASE WHEN s.status = 'scheduled' THEN 1 END) as scheduled_services,
          COUNT(CASE WHEN s.status = 'in_progress' THEN 1 END) as in_progress_services,
          COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_services,
          COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancelled_services,
          AVG(CASE WHEN s.status = 'completed' AND s.maintenance_cost IS NOT NULL THEN s.maintenance_cost END) as avg_cost,
          SUM(CASE WHEN s.status = 'completed' AND s.maintenance_cost IS NOT NULL THEN s.maintenance_cost ELSE 0 END) as total_cost,
          AVG(r.rating) as avg_rating,
          COUNT(r.id) as total_reviews
        FROM services s
        LEFT JOIN units u ON u.id = s.unit_id
        LEFT JOIN developments d ON d.id = u.development_id
        LEFT JOIN reviews r ON r.service_id = s.id AND r.client_id = s.client_id
        WHERE s.client_id = $1 AND d.constructor_id = $2
      `;
      statsParams = [clientId, req.user.id];
    }

    const statsResult = await pool.query(statsQuery, statsParams);
    const stats = statsResult.rows[0];

    // Contagem total para paginação
    let countQuery = 'SELECT COUNT(*) FROM services WHERE client_id = $1';
    let countParams = [clientId];
    
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }
    
    if (category) {
      countQuery += status ? ' AND category = $3' : ' AND category = $2';
      countParams.push(category);
    }

    // Se for construtora, filtrar apenas serviços das unidades dos seus empreendimentos
    if (req.user.role === 'constructor') {
      countQuery = `
        SELECT COUNT(*) 
        FROM services s
        LEFT JOIN units u ON u.id = s.unit_id
        LEFT JOIN developments d ON d.id = u.development_id
        WHERE s.client_id = $1 AND d.constructor_id = $2
      `;
      countParams = [clientId, req.user.id];
      
      if (status) {
        countQuery += ' AND s.status = $3';
        countParams.push(status);
      }
      
      if (category) {
        countQuery += status ? ' AND s.category = $4' : ' AND s.category = $3';
        countParams.push(category);
      }
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: client.name,
          email: client.email
        },
        services: servicesWithHistory,
        statistics: {
          total_services: parseInt(stats.total_services || 0),
          pending_services: parseInt(stats.pending_services || 0),
          scheduled_services: parseInt(stats.scheduled_services || 0),
          in_progress_services: parseInt(stats.in_progress_services || 0),
          completed_services: parseInt(stats.completed_services || 0),
          cancelled_services: parseInt(stats.cancelled_services || 0),
          avg_cost: parseFloat(stats.avg_cost || 0),
          total_cost: parseFloat(stats.total_cost || 0),
          avg_rating: parseFloat(stats.avg_rating || 0),
          total_reviews: parseInt(stats.total_reviews || 0)
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico do cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar histórico do cliente',
      error: error.message 
    });
  }
});

// Helper function para registrar ações no histórico
async function logActivity(serviceId, userId, actionType, description, metadata = null) {
  try {
    await pool.query(
      `INSERT INTO activity_logs (service_id, user_id, action_type, action_description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [serviceId, userId, actionType, description, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
  }
}

// Delete service (com regras de aprovação)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar serviço
    const serviceResult = await pool.query(
      `SELECT s.*, 
              d.constructor_id,
              u.development_id
       FROM services s
       LEFT JOIN units u ON u.id = s.unit_id
       LEFT JOIN developments d ON d.id = u.development_id
       WHERE s.id = $1`,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceResult.rows[0];

    // Verificar autorização: apenas construtora ou cliente podem deletar
    let canDelete = false;
    let requesterRole = '';

    if (req.user.role === 'admin') {
      canDelete = true;
      requesterRole = 'admin';
    } else if (req.user.role === 'constructor' && service.constructor_id === req.user.id) {
      canDelete = true;
      requesterRole = 'constructor';
    } else if (req.user.role === 'client' && service.client_id === req.user.id) {
      canDelete = true;
      requesterRole = 'client';
    }

    if (!canDelete) {
      return res.status(403).json({ 
        success: false, 
        message: 'Você não tem permissão para excluir este serviço' 
      });
    }

    // Verificar se o técnico já iniciou o reparo
    const hasStarted = service.status === 'in_progress' || service.status === 'scheduled';

    if (!hasStarted) {
      // Serviço não iniciado: deletar diretamente
      await pool.query('DELETE FROM services WHERE id = $1', [id]);

      // Registrar no histórico
      await logActivity(
        id,
        req.user.id,
        'service_deleted',
        `Serviço "${service.title}" foi excluído por ${requesterRole === 'constructor' ? 'construtora' : 'cliente'} antes do início do reparo`,
        { deleted_by: req.user.id, deleted_by_role: requesterRole, reason: 'not_started' }
      );

      res.json({
        success: true,
        message: 'Serviço excluído com sucesso'
      });
    } else {
      // Serviço já iniciado: solicitar aprovação do técnico
      await pool.query(
        `UPDATE services 
         SET deletion_requested_by = $1,
             deletion_requested_at = CURRENT_TIMESTAMP,
             deletion_status = 'pending_approval'
         WHERE id = $2`,
        [req.user.id, id]
      );

      // Registrar no histórico
      await logActivity(
        id,
        req.user.id,
        'deletion_requested',
        `Solicitação de exclusão do serviço "${service.title}" por ${requesterRole === 'constructor' ? 'construtora' : 'cliente'}. Aguardando aprovação do técnico.`,
        { 
          requested_by: req.user.id, 
          requested_by_role: requesterRole,
          service_status: service.status,
          technician_id: service.technician_id
        }
      );

      // Notificar técnico
      if (service.technician_id) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, related_id)
           VALUES ($1, $2, $3, 'deletion_request', $4)`,
          [
            service.technician_id,
            'Solicitação de Exclusão de Serviço',
            `A ${requesterRole === 'constructor' ? 'construtora' : 'cliente'} solicitou a exclusão do serviço "${service.title}". Como o serviço já foi iniciado, sua aprovação é necessária.`,
            id
          ]
        );
      }

      res.json({
        success: true,
        message: 'Solicitação de exclusão enviada. Aguardando aprovação do técnico.',
        requires_approval: true,
        technician_id: service.technician_id
      });
    }
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir serviço',
      error: error.message 
    });
  }
});

// Aprovar ou rejeitar remoção de serviço (apenas técnico)
router.post('/:id/deletion/approve', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true para aprovar, false para rejeitar

    if (typeof approved !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'Campo "approved" deve ser true ou false' 
      });
    }

    // Buscar serviço
    const serviceResult = await pool.query(
      `SELECT s.*, 
              d.constructor_id,
              u.development_id,
              requester.name as requester_name,
              requester.role as requester_role
       FROM services s
       LEFT JOIN units u ON u.id = s.unit_id
       LEFT JOIN developments d ON d.id = u.development_id
       LEFT JOIN users requester ON requester.id = s.deletion_requested_by
       WHERE s.id = $1`,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceResult.rows[0];

    // Verificar se há solicitação pendente
    if (service.deletion_status !== 'pending_approval') {
      return res.status(400).json({ 
        success: false, 
        message: 'Não há solicitação de exclusão pendente para este serviço' 
      });
    }

    // Verificar se o usuário é o técnico atribuído
    if (req.user.role !== 'technician' || service.technician_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas o técnico atribuído pode aprovar a exclusão' 
      });
    }

    if (approved) {
      // Aprovar exclusão: deletar serviço
      await pool.query('DELETE FROM services WHERE id = $1', [id]);

      // Registrar no histórico
      await logActivity(
        id,
        req.user.id,
        'deletion_approved',
        `Técnico aprovou a exclusão do serviço "${service.title}" solicitada por ${service.requester_role === 'constructor' ? 'construtora' : 'cliente'}. Serviço concluído e removido.`,
        { 
          approved_by: req.user.id,
          requested_by: service.deletion_requested_by,
          requested_by_role: service.requester_role,
          service_status: service.status
        }
      );

      // Notificar quem solicitou
      if (service.deletion_requested_by) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, related_id)
           VALUES ($1, $2, $3, 'deletion_approved', $4)`,
          [
            service.deletion_requested_by,
            'Exclusão Aprovada',
            `O técnico aprovou a exclusão do serviço "${service.title}". O serviço foi removido do sistema.`,
            null
          ]
        );
      }

      res.json({
        success: true,
        message: 'Exclusão aprovada. Serviço removido com sucesso.'
      });
    } else {
      // Rejeitar exclusão
      await pool.query(
        `UPDATE services 
         SET deletion_requested_by = NULL,
             deletion_requested_at = NULL,
             deletion_status = 'rejected'
         WHERE id = $1`,
        [id]
      );

      // Registrar no histórico
      await logActivity(
        id,
        req.user.id,
        'deletion_rejected',
        `Técnico rejeitou a exclusão do serviço "${service.title}" solicitada por ${service.requester_role === 'constructor' ? 'construtora' : 'cliente'}. Serviço continuará ativo.`,
        { 
          rejected_by: req.user.id,
          requested_by: service.deletion_requested_by,
          requested_by_role: service.requester_role
        }
      );

      // Notificar quem solicitou
      if (service.deletion_requested_by) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, related_id)
           VALUES ($1, $2, $3, 'deletion_rejected', $4)`,
          [
            service.deletion_requested_by,
            'Exclusão Rejeitada',
            `O técnico rejeitou a exclusão do serviço "${service.title}". O serviço continuará ativo.`,
            id
          ]
        );
      }

      res.json({
        success: true,
        message: 'Exclusão rejeitada. O serviço continuará ativo.'
      });
    }
  } catch (error) {
    console.error('Erro ao processar aprovação de exclusão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar aprovação',
      error: error.message 
    });
  }
});

// Get activity log for a service
router.get('/:id/activity-log', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acesso ao serviço
    const serviceResult = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceResult.rows[0];
    
    // Verificar autorização
    let hasAccess = false;
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'client' && service.client_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'technician' && service.technician_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'constructor') {
      // Verificar se é construtora do empreendimento
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

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    // Buscar histórico de atividades
    const result = await pool.query(
      `SELECT al.*, u.name as user_name, u.role as user_role
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.service_id = $1
       ORDER BY al.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de atividades:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar histórico',
      error: error.message 
    });
  }
});

export default router;

