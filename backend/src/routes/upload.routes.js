import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pool from '../database/connection.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.middleware.js';
import { checkAndAwardBadges } from './badges.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar tipo baseado no nome do campo ou body
    let type = req.body.type || 'general';
    
    // Se o campo do arquivo for 'audio', usar diretório de áudios
    if (file.fieldname === 'audio') {
      type = 'audios';
    } else if (file.fieldname === 'photo') {
      type = 'photos';
    } else if (file.fieldname === 'document') {
      type = 'documents';
    }
    
    const dir = path.join(uploadDir, type);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Permitir imagens, documentos e áudios
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp3|wav|ogg|webm|aac|m4a|mpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image|application|audio/.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Upload single file
router.post('/', authenticate, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo enviado' 
      });
    }

    const fileUrl = `/uploads/${req.body.type || 'general'}/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    res.json({
      success: true,
      message: 'Arquivo enviado com sucesso',
      data: {
        url: fullUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer upload',
      error: error.message 
    });
  }
});

// Upload multiple files
router.post('/multiple', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo enviado' 
      });
    }

    const files = req.files.map(file => {
      const fileUrl = `/uploads/${req.body.type || 'general'}/${file.filename}`;
      const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;
      
      return {
        url: fullUrl,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    res.json({
      success: true,
      message: 'Arquivos enviados com sucesso',
      data: files
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer upload',
      error: error.message 
    });
  }
});

// Add photo to service
router.post('/service/:serviceId/photo', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { description, is_before } = req.body;

    // Verify service exists and user has access
    const serviceCheck = await pool.query(
      'SELECT client_id, technician_id, status, unit_id FROM services WHERE id = $1',
      [serviceId]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceCheck.rows[0];
    
    // Verificar acesso: admin, cliente do serviço, técnico atribuído, ou técnico em serviço pendente
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (service.client_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'technician') {
      // Técnico pode acessar se:
      // 1. Está atribuído ao serviço
      // 2. Serviço está pendente (sem técnico atribuído)
      if (service.technician_id === req.user.id || 
          (service.technician_id === null && service.status === 'pending')) {
        hasAccess = true;
      }
    } else if (req.user.role === 'constructor') {
      // Construtora pode acessar serviços das suas unidades
      const unitCheck = await pool.query(
        `SELECT d.constructor_id 
         FROM services s
         LEFT JOIN units u ON u.id = s.unit_id
         LEFT JOIN developments d ON d.id = u.development_id
         WHERE s.id = $1`,
        [serviceId]
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

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhuma foto enviada' 
      });
    }

    const fileUrl = `/uploads/photos/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    const result = await pool.query(
      `INSERT INTO service_photos (service_id, photo_url, description, is_before, uploaded_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [serviceId, fullUrl, description || null, is_before === 'true', req.user.id]
    );

    // Verificar badge de foto
    if (req.user.role === 'client') {
      await checkAndAwardBadges(req.user.id, req.user.role, 'photo_uploaded');
    }

    res.status(201).json({
      success: true,
      message: 'Foto adicionada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar foto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao adicionar foto',
      error: error.message 
    });
  }
});

// Upload profile photo
router.post('/profile/photo', authenticate, uploadLimiter, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhuma foto enviada' 
      });
    }

    // Validar tipo de arquivo
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(req.file.originalname).toLowerCase());
    const mimetype = /image/.test(req.file.mimetype);

    if (!mimetype || !extname) {
      return res.status(400).json({ 
        success: false, 
        message: 'Apenas arquivos de imagem são permitidos' 
      });
    }

    // Validar tamanho (máximo 5MB para foto de perfil)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: 'A imagem deve ter no máximo 5MB' 
      });
    }

    const fileUrl = `/uploads/photos/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    // Atualizar avatar_url do usuário
    const result = await pool.query(
      'UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING avatar_url',
      [fullUrl, req.user.id]
    );

    res.json({
      success: true,
      message: 'Foto de perfil atualizada com sucesso',
      data: {
        avatar_url: result.rows[0].avatar_url
      }
    });
  } catch (error) {
    console.error('Erro ao fazer upload da foto de perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer upload da foto',
      error: error.message 
    });
  }
});

// Add document to service
router.post('/service/:serviceId/document', authenticate, upload.single('document'), async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { document_type } = req.body;

    // Verify service exists and user has access
    const serviceCheck = await pool.query(
      'SELECT client_id, technician_id, status, unit_id FROM services WHERE id = $1',
      [serviceId]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceCheck.rows[0];
    
    // Verificar acesso: admin, cliente do serviço, técnico atribuído, ou técnico em serviço pendente
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (service.client_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'technician') {
      // Técnico pode acessar se:
      // 1. Está atribuído ao serviço
      // 2. Serviço está pendente (sem técnico atribuído)
      if (service.technician_id === req.user.id || 
          (service.technician_id === null && service.status === 'pending')) {
        hasAccess = true;
      }
    } else if (req.user.role === 'constructor') {
      // Construtora pode acessar serviços das suas unidades
      const unitCheck = await pool.query(
        `SELECT d.constructor_id 
         FROM services s
         LEFT JOIN units u ON u.id = s.unit_id
         LEFT JOIN developments d ON d.id = u.development_id
         WHERE s.id = $1`,
        [serviceId]
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

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum documento enviado' 
      });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    const result = await pool.query(
      `INSERT INTO service_documents (service_id, document_url, document_type, file_name, uploaded_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [serviceId, fullUrl, document_type || 'other', req.file.originalname, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Documento adicionado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao adicionar documento',
      error: error.message 
    });
  }
});

// Add audio to service
router.post('/service/:serviceId/audio', authenticate, upload.single('audio'), async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { description, duration } = req.body;

    // Verify service exists and user has access
    const serviceCheck = await pool.query(
      'SELECT client_id, technician_id, status, unit_id FROM services WHERE id = $1',
      [serviceId]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Serviço não encontrado' 
      });
    }

    const service = serviceCheck.rows[0];
    
    // Verificar acesso: admin, cliente do serviço, técnico atribuído, ou técnico em serviço pendente
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (service.client_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'technician') {
      // Técnico pode acessar se:
      // 1. Está atribuído ao serviço
      // 2. Serviço está pendente (sem técnico atribuído)
      if (service.technician_id === req.user.id || 
          (service.technician_id === null && service.status === 'pending')) {
        hasAccess = true;
      }
    } else if (req.user.role === 'constructor') {
      // Construtora pode acessar serviços das suas unidades
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

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum áudio enviado' 
      });
    }

    // Verificar se é arquivo de áudio
    // MediaRecorder pode gerar diferentes tipos MIME dependendo do navegador
    const allowedTypes = /audio\/(mpeg|mp3|wav|ogg|webm|aac|m4a|x-m4a|opus|x-wav)/;
    const isAudioFile = allowedTypes.test(req.file.mimetype) || 
                        req.file.mimetype.startsWith('audio/') ||
                        /\.(webm|mp3|wav|ogg|aac|m4a)$/i.test(req.file.originalname);
    
    if (!isAudioFile) {
      console.log('Tipo MIME rejeitado:', req.file.mimetype, 'Arquivo:', req.file.originalname);
      return res.status(400).json({ 
        success: false, 
        message: `Tipo de arquivo não permitido. Tipo recebido: ${req.file.mimetype}. Use apenas arquivos de áudio.` 
      });
    }

    const fileUrl = `/uploads/audios/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    const result = await pool.query(
      `INSERT INTO service_audios (service_id, audio_url, description, duration, uploaded_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [serviceId, fullUrl, description || null, duration ? parseInt(duration) : null, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Áudio adicionado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar áudio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao adicionar áudio',
      error: error.message 
    });
  }
});

export default router;

