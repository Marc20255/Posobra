import pg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';
import net from 'net';
import https from 'https';
import { exec } from 'child_process';
import { promisify as promisifyUtil } from 'util';

dotenv.config();

const { Pool } = pg;
const lookup = promisify(dns.lookup);
const resolve4 = promisify(dns.resolve4);
const execAsync = promisifyUtil(exec);

// Cache de resoluções IPv4
const ipv4Cache = new Map();

// Monkey patch agressivo para forçar IPv4 no net.createConnection
const originalCreateConnection = net.createConnection;
net.createConnection = function(options, ...args) {
  if (options && typeof options === 'object') {
    // Se tem host e não é IPv4, tentar resolver
    if (options.host && !options.host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      // Verificar cache primeiro
      if (ipv4Cache.has(options.host)) {
        options.host = ipv4Cache.get(options.host);
        console.log(`🔍 [net.createConnection] Usando IPv4 do cache: ${options.host}`);
      } else {
        // Tentar resolver síncrono (limitado, mas melhor que nada)
        try {
          // Usar dns.lookup síncrono como fallback
          const result = dns.lookupSync(options.host, { family: 4 });
          if (result && result.address) {
            ipv4Cache.set(options.host, result.address);
            options.host = result.address;
            console.log(`🔍 [net.createConnection] Resolvido para IPv4: ${result.address}`);
          }
        } catch (error) {
          console.warn(`⚠️ [net.createConnection] Não conseguiu resolver ${options.host} para IPv4: ${error.message}`);
        }
      }
    }
    
    // SEMPRE forçar family: 4
    options.family = 4;
  }
  
  return originalCreateConnection.call(this, options, ...args);
};

// Log para debug (remover em produção se necessário)
console.log('🔍 Configuração do Banco de Dados:');
console.log('DB_HOST:', process.env.DB_HOST || 'NÃO DEFINIDO');
console.log('DB_PORT:', process.env.DB_PORT || 'NÃO DEFINIDO');
console.log('DB_NAME:', process.env.DB_NAME || 'NÃO DEFINIDO');
console.log('DB_USER:', process.env.DB_USER || 'NÃO DEFINIDO');
console.log('DB_PASS:', process.env.DB_PASS ? '***DEFINIDO***' : 'NÃO DEFINIDO');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NÃO DEFINIDO');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***DEFINIDO***' : 'NÃO DEFINIDO');

// Configurar DNS para usar apenas IPv4 globalmente
dns.setDefaultResultOrder('ipv4first');

// Função para resolver hostname para IPv4 usando múltiplas estratégias
async function resolveToIPv4(hostname) {
  if (!hostname || hostname === 'localhost') {
    return hostname; // localhost não precisa resolver
  }
  
  // Se já é um IP IPv4, retornar direto
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    console.log(`✅ Hostname já é IPv4: ${hostname}`);
    return hostname;
  }
  
  // Estratégia 1: Usar dns.resolve4 (mais direto para IPv4)
  try {
    console.log(`🔍 [Estratégia 1] Tentando dns.resolve4(${hostname})...`);
    const addresses = await resolve4(hostname);
    if (addresses && addresses.length > 0) {
      const ipv4 = addresses[0];
      console.log(`✅ [Estratégia 1] Resolvido ${hostname} para IPv4: ${ipv4}`);
      return ipv4;
    }
  } catch (error) {
    console.warn(`⚠️ [Estratégia 1] Falhou: ${error.message}`);
  }
  
  // Estratégia 2: Usar dns.lookup com family: 4
  try {
    console.log(`🔍 [Estratégia 2] Tentando dns.lookup(${hostname}, {family: 4})...`);
    const result = await lookup(hostname, { family: 4 });
    console.log(`✅ [Estratégia 2] Resolvido ${hostname} para IPv4: ${result.address}`);
    return result.address;
  } catch (error) {
    console.warn(`⚠️ [Estratégia 2] Falhou: ${error.message}`);
  }
  
  // Estratégia 3: Usar dns.lookup sem família e filtrar IPv4
  try {
    console.log(`🔍 [Estratégia 3] Tentando dns.lookup(${hostname}) sem família...`);
    const result = await lookup(hostname);
    if (result.family === 4) {
      console.log(`✅ [Estratégia 3] Resolvido ${hostname} para IPv4: ${result.address}`);
      return result.address;
    } else {
      console.error(`❌ [Estratégia 3] Retornou IPv6: ${result.address}`);
    }
  } catch (error) {
    console.warn(`⚠️ [Estratégia 3] Falhou: ${error.message}`);
  }
  
  // Estratégia 4: Tentar usar nslookup ou dig via child_process (último recurso)
  try {
    console.log(`🔍 [Estratégia 4] Tentando resolver via nslookup...`);
    const ipv4 = await resolveViaCommand(hostname);
    if (ipv4) {
      console.log(`✅ [Estratégia 4] Resolvido ${hostname} para IPv4: ${ipv4}`);
      ipv4Cache.set(hostname, ipv4); // Cachear resultado
      return ipv4;
    }
  } catch (error) {
    console.warn(`⚠️ [Estratégia 4] Falhou: ${error.message}`);
  }
  
  // Se todas as estratégias falharam, retornar null para usar fallback
  console.warn(`⚠️ Não foi possível resolver ${hostname} para IPv4 após tentar todas as estratégias`);
  console.warn(`⚠️ O código tentará usar o hostname diretamente com family: 4`);
  return null; // Retornar null em vez de lançar erro
}

// Função auxiliar para resolver via comando do sistema
async function resolveViaCommand(hostname) {
  try {
    // Tentar usar nslookup (disponível na maioria dos sistemas)
    console.log(`🔍 Executando: nslookup -type=A ${hostname} 8.8.8.8`);
    const { stdout, stderr } = await execAsync(`nslookup -type=A ${hostname} 8.8.8.8`, { 
      timeout: 10000,
      maxBuffer: 1024 * 1024 // 1MB
    });
    console.log(`📝 nslookup stdout: ${stdout.substring(0, 200)}`);
    if (stderr) console.log(`⚠️ nslookup stderr: ${stderr}`);
    
    // Tentar múltiplos padrões de regex
    const patterns = [
      /Address:\s*(\d+\.\d+\.\d+\.\d+)/,
      /Address:\s+(\d+\.\d+\.\d+\.\d+)/,
      /(\d+\.\d+\.\d+\.\d+)/,
    ];
    
    for (const pattern of patterns) {
      const match = stdout.match(pattern);
      if (match && match[1] && match[1].match(/^\d+\.\d+\.\d+\.\d+$/)) {
        console.log(`✅ Encontrado IPv4 via nslookup: ${match[1]}`);
        return match[1];
      }
    }
  } catch (error) {
    console.warn(`⚠️ nslookup falhou: ${error.message}`);
    // Ignorar erro e tentar dig se disponível
    try {
      console.log(`🔍 Executando: dig +short ${hostname} A @8.8.8.8`);
      const { stdout } = await execAsync(`dig +short ${hostname} A @8.8.8.8`, { 
        timeout: 10000,
        maxBuffer: 1024 * 1024
      });
      console.log(`📝 dig stdout: ${stdout}`);
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      for (const line of lines) {
        const ipv4 = line.trim();
        if (ipv4 && ipv4.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          console.log(`✅ Encontrado IPv4 via dig: ${ipv4}`);
          return ipv4;
        }
      }
    } catch (error2) {
      console.warn(`⚠️ dig também falhou: ${error2.message}`);
      // Ambos falharam
      throw new Error(`nslookup e dig falharam: ${error.message}`);
    }
  }
  return null;
}

// Função para extrair hostname de DATABASE_URL e substituir por IPv4
async function processDatabaseUrl(url) {
  if (!url) return null;
  
  try {
    // Parse da URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const port = urlObj.port;
    
    console.log(`🔍 Processando DATABASE_URL:`);
    console.log(`   Hostname: ${hostname}`);
    console.log(`   Porta: ${port || 'padrão (5432)'}`);
    
    // Verificar se está usando porta de pooling
    if (port === '6543' || url.includes('pgbouncer=true')) {
      console.log('✅ Usando connection pooling (porta 6543)');
    } else if (port === '5432') {
      console.warn('⚠️ Usando porta 5432 (direta). Recomendado: porta 6543 com pgbouncer=true');
    }
    
    // Resolver hostname para IPv4
    let ipv4;
    try {
      ipv4 = await resolveToIPv4(hostname);
    } catch (error) {
      console.error(`❌ ERRO CRÍTICO: Não foi possível resolver ${hostname} para IPv4`);
      console.error(`   Erro: ${error.message}`);
      console.error(`   Isso significa que o Railway não consegue resolver DNS para IPv4.`);
      console.error(`   SOLUÇÃO: Use variáveis individuais (DB_HOST, DB_PORT, etc) ao invés de DATABASE_URL`);
      throw new Error(`Falha ao resolver ${hostname} para IPv4: ${error.message}. Use variáveis individuais ao invés de DATABASE_URL.`);
    }
    
    // Se resolveu para IP diferente, substituir na URL
    if (ipv4 !== hostname && ipv4.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      urlObj.hostname = ipv4;
      const newUrl = urlObj.toString();
      console.log(`✅ DATABASE_URL atualizada para usar IPv4: ${ipv4}:${port || '5432'}`);
      return newUrl;
    }
    
    // Se não conseguiu resolver, não podemos continuar
    throw new Error(`Resolução não retornou IPv4 válido para ${hostname}`);
  } catch (error) {
    console.error('❌ Erro ao processar DATABASE_URL:', error.message);
    throw error; // Não retornar URL original, lançar erro para forçar uso de variáveis individuais
  }
}

// Criar pool de forma assíncrona para garantir resolução IPv4
let pool = null;
let poolPromise = null;

async function createPool() {
  if (pool) return pool;
  
  console.log('🚀 Iniciando criação do Pool...');
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔍 DATABASE_URL definida?', !!process.env.DATABASE_URL);
  console.log('⚠️ IMPORTANTE: Ignorando DATABASE_URL e usando apenas variáveis individuais para garantir IPv4');
  
  let dbConfig;
  
  // SEMPRE usar variáveis individuais para ter controle total sobre IPv4
  // DATABASE_URL pode causar problemas de resolução DNS no Railway
  if (process.env.DB_HOST) {
    console.log('📝 Usando variáveis individuais...');
    // Usar variáveis individuais
    let dbHost = process.env.DB_HOST || 'localhost';
    const originalHost = dbHost;
    
    console.log(`🔍 Host original: ${dbHost}`);
    
    // CRÍTICO: Tentar resolver hostname para IPv4. Se falhar, LANÇAR ERRO
    // Não podemos continuar sem IPv4 porque o Railway não suporta IPv6
    if (dbHost !== 'localhost' && !dbHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      console.log(`🔍 Hostname detectado (não é IP), tentando resolver para IPv4...`);
      console.log(`🔍 Este é um passo CRÍTICO - sem IPv4, a conexão falhará!`);
      
      const resolvedIp = await resolveToIPv4(dbHost);
      
      if (resolvedIp && resolvedIp.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        dbHost = resolvedIp;
        ipv4Cache.set(originalHost, resolvedIp); // Cachear para o monkey patch
        console.log(`✅✅✅ SUCESSO! Hostname ${originalHost} resolvido para IPv4: ${dbHost}`);
        console.log(`✅ Validação IPv4 passou: ${dbHost}`);
      } else {
        console.error(`❌❌❌ ERRO CRÍTICO: Não foi possível resolver ${originalHost} para IPv4`);
        console.error(`❌ Todas as estratégias de resolução DNS falharam!`);
        console.error(`❌ SOLUÇÃO ALTERNATIVA:`);
        console.error(`   1. Descubra o IP IPv4 do Supabase manualmente:`);
        console.error(`      nslookup db.iqcsixuzgktknuyuabfc.supabase.co 8.8.8.8`);
        console.error(`   2. Configure DB_HOST diretamente com o IP IPv4 no Railway`);
        console.error(`   3. Exemplo: DB_HOST=54.xxx.xxx.xxx (substitua pelo IP real)`);
        throw new Error(`FALHA CRÍTICA: Não foi possível resolver ${originalHost} para IPv4. Configure DB_HOST com IP IPv4 diretamente no Railway.`);
      }
    } else if (dbHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      console.log(`✅ Host já é IPv4: ${dbHost}`);
      ipv4Cache.set(originalHost, dbHost); // Cachear mesmo sendo IP
    } else {
      console.log(`⚠️ Host é localhost, não precisa resolver`);
    }
    
    // IMPORTANTE: Usar porta 5432 para conexão direta (suporta IPv4)
    const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    console.log(`🔍 Porta configurada: ${dbPort}`);
    if (dbPort === 6543) {
      console.warn('⚠️⚠️⚠️ ATENÇÃO: Porta 6543 detectada!');
      console.warn('⚠️ Porta 6543 pode ter problemas com IPv4.');
      console.warn('⚠️ Recomendado mudar para porta 5432 no Railway.');
    }
    
    dbConfig = {
      host: dbHost,
      port: dbPort,
      database: process.env.DB_NAME || 'pos_obra',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
      // Forçar IPv4 no nível do pg
      family: 4
    };
    
    console.log(`🔍 Configuração final do Pool:`);
    console.log(`   Host: ${dbConfig.host} ${dbConfig.host.match(/^\d+\.\d+\.\d+\.\d+$/) ? '(IPv4 ✅)' : '(hostname - será resolvido com family: 4)'}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Family: ${dbConfig.family} (forçando IPv4)`);
  } else {
    throw new Error('DB_HOST não está definido. Configure DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS no Railway.');
  }
  
  // Criar Pool com configuração
  console.log('🔍 Criando Pool do PostgreSQL com configuração acima...');
  try {
    pool = new Pool(dbConfig);
    console.log('✅ Pool criado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar Pool:', error);
    throw error;
  }
  
  // Test connection
  pool.on('connect', () => {
    console.log('✅ Conectado ao banco de dados PostgreSQL');
  });
  
  pool.on('error', (err) => {
    console.error('❌ Erro inesperado no banco de dados:', err);
    process.exit(-1);
  });
  
  return pool;
}

// Inicializar pool imediatamente
poolPromise = createPool();

// Initialize database tables
export async function initDatabase() {
  // Garantir que o pool foi criado
  const dbPool = await poolPromise;
  
  try {
    // Create tables
    await dbPool.query(`
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
    await dbPool.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_email_key;
    `);

    // Criar constraint única composta (email + role)
    // Permite mesmo email com roles diferentes
    await dbPool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_role_unique 
      ON users(email, role);
    `);

    await dbPool.query(`
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
    await dbPool.query(`
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
      await dbPool.query(`
        CREATE INDEX IF NOT EXISTS idx_services_coordinates 
        ON services(lat, lng) 
        WHERE lat IS NOT NULL AND lng IS NOT NULL;
      `);
    } catch (error) {
      // Se o índice falhar, pode ser que as colunas ainda não existam
      // Isso é OK, tentaremos novamente na próxima inicialização
      console.log('Índice de coordenadas será criado após adicionar colunas');
    }

    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_services_zip_code ON services(zip_code);
    `);

    await dbPool.query(`
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

    await dbPool.query(`
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

    await dbPool.query(`
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

    await dbPool.query(`
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

    await dbPool.query(`
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

    await dbPool.query(`
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

    await dbPool.query(`
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
    await dbPool.query(`
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

    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
    `);

    // Histórico de Ações (Activity Log)
    await dbPool.query(`
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

    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_service ON activity_logs(service_id);
    `);

    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
    `);

    // Adicionar campos de controle de remoção na tabela services
    await dbPool.query(`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS deletion_requested_by INTEGER REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS deletion_approved_by INTEGER REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS deletion_approved_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS deletion_status VARCHAR(20) DEFAULT 'none' CHECK (deletion_status IN ('none', 'pending_approval', 'approved', 'rejected'));
    `);

    // Empreendimentos (construções)
    await dbPool.query(`
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
    await dbPool.query(`
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
    await dbPool.query(`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL;
    `);

    // Adicionar campos específicos do edital
    await dbPool.query(`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS maintenance_cost DECIMAL(10, 2);
    `);

    // Histórico de status do serviço
    await dbPool.query(`
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
    await dbPool.query(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
      ADD COLUMN IF NOT EXISTS response_speed INTEGER CHECK (response_speed >= 1 AND response_speed <= 5),
      ADD COLUMN IF NOT EXISTS technician_work INTEGER CHECK (technician_work >= 1 AND technician_work <= 5),
      ADD COLUMN IF NOT EXISTS inspection_quality INTEGER CHECK (inspection_quality >= 1 AND inspection_quality <= 5),
      ADD COLUMN IF NOT EXISTS improvement_suggestions TEXT;
    `);

    // Create indexes for better performance
    await dbPool.query(`
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

// Função helper para obter o pool (resolve a promise)
export async function getPool() {
  return await poolPromise;
}

// Criar um wrapper que resolve a promise automaticamente
// Mantém compatibilidade com imports diretos como: await pool.query(...)
const poolWrapper = {
  query: async (...args) => {
    const resolvedPool = await poolPromise;
    return resolvedPool.query(...args);
  },
  connect: async (...args) => {
    const resolvedPool = await poolPromise;
    return resolvedPool.connect(...args);
  },
  end: async (...args) => {
    const resolvedPool = await poolPromise;
    return resolvedPool.end(...args);
  },
  on: (...args) => {
    // Event handlers podem ser registrados antes do pool estar pronto
    poolPromise.then(resolvedPool => {
      resolvedPool.on(...args);
    });
  },
  // Proxy para outras propriedades/métodos
  get [Symbol.toPrimitive]() {
    return () => poolPromise;
  }
};

// Adicionar todas as propriedades do Pool usando Proxy
const poolProxy = new Proxy(poolWrapper, {
  get(target, prop) {
    // Se for uma propriedade que já existe no wrapper, retornar
    if (prop in target) {
      const value = target[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    }
    // Para outras propriedades, resolver a promise e retornar
    return async function(...args) {
      const resolvedPool = await poolPromise;
      const method = resolvedPool[prop];
      if (typeof method === 'function') {
        return method.apply(resolvedPool, args);
      }
      return method;
    };
  }
});

export default poolProxy;
