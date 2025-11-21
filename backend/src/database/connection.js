import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pos_obra',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no banco de dados:', err);
  process.exit(-1);
});

// Initialize database tables
export async function initDatabase() {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'technician', 'admin', 'constructor')),
        avatar_url TEXT,
        cpf VARCHAR(14),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(2),
        zip_code VARCHAR(10),
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Remover constraint UNIQUE antiga do email (se existir)
    await pool.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_email_key;
    `);

    // Criar constraint única composta (email + role)
    // Permite mesmo email com roles diferentes
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_role_unique 
      ON users(email, role);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        technician_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        scheduled_date TIMESTAMP,
        completed_date TIMESTAMP,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(2) NOT NULL,
        zip_code VARCHAR(10) NOT NULL,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        estimated_cost DECIMAL(10, 2),
        final_cost DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices para coordenadas
    // Adicionar colunas lat e lng se não existirem
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='services' AND column_name='lat') THEN
          ALTER TABLE services ADD COLUMN lat DECIMAL(10, 8);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='services' AND column_name='lng') THEN
          ALTER TABLE services ADD COLUMN lng DECIMAL(11, 8);
        END IF;
      END $$;
    `);

    // Criar índices para coordenadas (usando índice parcial para evitar NULLs)
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_services_coordinates 
        ON services(lat, lng) 
        WHERE lat IS NOT NULL AND lng IS NOT NULL;
      `);
    } catch (error) {
      // Se o índice falhar, pode ser que as colunas ainda não existam
      // Isso é OK, tentaremos novamente na próxima inicialização
      console.log('Índice de coordenadas será criado após adicionar colunas');
    }

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_services_zip_code ON services(zip_code);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_photos (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        description TEXT,
        is_before BOOLEAN DEFAULT false,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_documents (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        document_url TEXT NOT NULL,
        document_type VARCHAR(50),
        file_name VARCHAR(255),
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_audios (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        audio_url TEXT NOT NULL,
        description TEXT,
        duration INTEGER,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
        attachment_url TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        technician_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS constructor_employees (
        id SERIAL PRIMARY KEY,
        constructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        employee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'technician' CHECK (role IN ('technician', 'supervisor', 'manager', 'other')),
        department VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        hired_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(constructor_id, employee_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50),
        related_id INTEGER,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sistema de Badges e Conquistas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_type VARCHAR(50) NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        badge_description TEXT,
        badge_icon VARCHAR(50),
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_type)
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
    `);

    // Histórico de Ações (Activity Log)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action_type VARCHAR(50) NOT NULL,
        action_description TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_service ON activity_logs(service_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
    `);

    // Adicionar campos de controle de remoção na tabela services
    await pool.query(`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS deletion_requested_by INTEGER REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS deletion_approved_by INTEGER REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS deletion_approved_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS deletion_status VARCHAR(20) DEFAULT 'none' CHECK (deletion_status IN ('none', 'pending_approval', 'approved', 'rejected'));
    `);

    // Empreendimentos (construções)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS developments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(2) NOT NULL,
        zip_code VARCHAR(10),
        constructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        total_units INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Unidades (apartamentos/casas)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        development_id INTEGER REFERENCES developments(id) ON DELETE CASCADE,
        unit_code VARCHAR(50) UNIQUE NOT NULL,
        unit_number VARCHAR(50) NOT NULL,
        block VARCHAR(50),
        floor INTEGER,
        type VARCHAR(50),
        area DECIMAL(10, 2),
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Vincular serviços a unidades
    await pool.query(`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL;
    `);

    // Adicionar campos específicos do edital
    await pool.query(`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS maintenance_cost DECIMAL(10, 2);
    `);

    // Histórico de status do serviço
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_status_history (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        changed_by INTEGER REFERENCES users(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Avaliação detalhada (conforme edital)
    await pool.query(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
      ADD COLUMN IF NOT EXISTS response_speed INTEGER CHECK (response_speed >= 1 AND response_speed <= 5),
      ADD COLUMN IF NOT EXISTS technician_work INTEGER CHECK (technician_work >= 1 AND technician_work <= 5),
      ADD COLUMN IF NOT EXISTS inspection_quality INTEGER CHECK (inspection_quality >= 1 AND inspection_quality <= 5),
      ADD COLUMN IF NOT EXISTS improvement_suggestions TEXT;
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_services_client ON services(client_id);
      CREATE INDEX IF NOT EXISTS idx_services_technician ON services(technician_id);
      CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
      CREATE INDEX IF NOT EXISTS idx_services_unit ON services(unit_id);
      CREATE INDEX IF NOT EXISTS idx_chat_service ON chat_messages(service_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_units_code ON units(unit_code);
      CREATE INDEX IF NOT EXISTS idx_units_development ON units(development_id);
      CREATE INDEX IF NOT EXISTS idx_developments_constructor ON developments(constructor_id);
    `);

    console.log('✅ Tabelas do banco de dados criadas/verificadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

export default pool;

