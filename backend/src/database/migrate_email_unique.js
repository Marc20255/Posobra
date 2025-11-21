import pool from './connection.js';

// Migração para permitir mesmo email com roles diferentes
export async function migrateEmailUnique() {
  try {
    console.log('🔄 Iniciando migração de email único...');

    // Remover constraint UNIQUE do email
    await pool.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_email_key;
    `);

    // Criar constraint única composta (email + role)
    // Isso permite o mesmo email com roles diferentes
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_role_unique 
      ON users(email, role);
    `);

    console.log('✅ Migração concluída: Email pode ser usado com roles diferentes');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateEmailUnique()
    .then(() => {
      console.log('✅ Migração executada com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar migração:', error);
      process.exit(1);
    });
}

