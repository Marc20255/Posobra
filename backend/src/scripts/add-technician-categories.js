import pool from '../database/connection.js';

// Script para adicionar tabela de categorias de técnicos
export async function addTechnicianCategoriesTable() {
  try {
    // Criar tabela de especializações de técnicos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS technician_categories (
        id SERIAL PRIMARY KEY,
        technician_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(technician_id, category)
      );
    `);

    // Criar índice para melhor performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_technician_categories_technician 
      ON technician_categories(technician_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_technician_categories_category 
      ON technician_categories(category);
    `);

    console.log('✅ Tabela technician_categories criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabela technician_categories:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addTechnicianCategoriesTable()
    .then(() => {
      console.log('✅ Migração concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na migração:', error);
      process.exit(1);
    });
}

