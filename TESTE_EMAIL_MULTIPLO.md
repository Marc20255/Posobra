# 🧪 Como Testar Email Múltiplo

## ✅ Teste Rápido

### 1. Criar Conta como Cliente
1. Acesse: http://localhost:3000/register
2. Preencha:
   - Nome: `João Silva`
   - Email: `joao@test.com`
   - Tipo: **Cliente**
   - Senha: `senha123`
3. Clique em "Criar conta"
4. ✅ Deve criar com sucesso

### 2. Criar Conta como Técnico (mesmo email)
1. Faça logout
2. Acesse: http://localhost:3000/register
3. Preencha:
   - Nome: `João Silva Técnico`
   - Email: `joao@test.com` (MESMO EMAIL!)
   - Tipo: **Técnico**
   - Senha: `senha123`
4. Clique em "Criar conta"
5. ✅ Deve criar com sucesso (não deve dar erro de email já cadastrado)

### 3. Testar Login
1. Acesse: http://localhost:3000/login
2. Digite:
   - Email: `joao@test.com`
   - Senha: `senha123`
3. Clique em "Entrar"
4. ✅ Deve mostrar opção para escolher entre "Cliente" ou "Técnico"
5. Escolha uma opção
6. ✅ Deve fazer login na conta selecionada

## 🎯 Resultado Esperado

- ✅ Mesmo email pode ter múltiplas contas
- ✅ Cada conta é independente
- ✅ Login mostra opções quando há múltiplas contas
- ✅ Funciona perfeitamente!

---

**Teste e confirme que está funcionando! 🚀**

