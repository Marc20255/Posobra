-- Script SQL para permitir mesmo email com roles diferentes
-- Execute este script no PostgreSQL se já tiver dados no banco

-- 1. Remover constraint UNIQUE antiga do email
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- 2. Criar constraint única composta (email + role)
-- Isso permite: mesmo email pode ter conta como cliente E técnico
CREATE UNIQUE INDEX IF NOT EXISTS users_email_role_unique 
ON users(email, role);

-- 3. Verificar se funcionou
SELECT 
  email, 
  role, 
  COUNT(*) as count
FROM users 
GROUP BY email, role
HAVING COUNT(*) > 1;

-- Se retornar vazio, está funcionando corretamente!

