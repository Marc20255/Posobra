import pool from '../database/connection.js';
import bcrypt from 'bcryptjs';

// Script para criar dados de teste
async function createTestData() {
  try {
    console.log('🔄 Criando dados de teste...');

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
      console.log('✅ Construtora criada:', constructorId);
    } else {
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND role = $2',
        ['construtora@test.com', 'constructor']
      );
      constructorId = existing.rows[0].id;
      console.log('✅ Construtora já existe:', constructorId);
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
      console.log('✅ Empreendimento criado:', developmentId);
    } else {
      const existing = await pool.query(
        'SELECT id FROM developments WHERE name = $1 LIMIT 1',
        ['Residencial Teste']
      );
      developmentId = existing.rows[0].id;
      console.log('✅ Empreendimento já existe:', developmentId);
    }

    // 3. Criar unidades de teste
    const units = [
      { number: '101', block: 'A', floor: 1 },
      { number: '102', block: 'A', floor: 1 },
      { number: '201', block: 'A', floor: 2 },
      { number: '301', block: 'B', floor: 3 },
    ];

    for (const unit of units) {
      const unitCode = `${developmentId}-${unit.number}-TEST123`;
      
      const unitResult = await pool.query(
        `INSERT INTO units (development_id, unit_code, unit_number, block, floor, type, area, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (unit_code) DO NOTHING
         RETURNING unit_code`,
        [developmentId, unitCode, unit.number, unit.block, unit.floor, 'Apartamento', 75.5]
      );

      if (unitResult.rows.length > 0) {
        console.log(`✅ Unidade criada: ${unitResult.rows[0].unit_code}`);
      } else {
        console.log(`ℹ️  Unidade já existe: ${unitCode}`);
      }
    }

    // 4. Listar unidades criadas
    const allUnits = await pool.query(
      'SELECT unit_code, unit_number, block, floor FROM units WHERE development_id = $1',
      [developmentId]
    );

    console.log('\n📋 Unidades disponíveis para teste:');
    allUnits.rows.forEach(unit => {
      console.log(`   Código: ${unit.unit_code} | Unidade: ${unit.unit_number} | Bloco: ${unit.block} | Andar: ${unit.floor}`);
    });

    console.log('\n✅ Dados de teste criados com sucesso!');
    console.log('\n💡 Use um dos códigos acima para vincular uma unidade');

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestData()
    .then(() => {
      console.log('\n✅ Script executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

export { createTestData };

