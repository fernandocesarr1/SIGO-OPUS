# Guia de Configuração do Supabase para o SIGO

## 1. Criar Conta e Projeto no Supabase

### Passo 1: Acessar o Supabase
1. Acesse **https://supabase.com**
2. Clique em **"Start your project"** ou **"Sign In"**
3. Faça login com GitHub, Google ou Email

### Passo 2: Criar Novo Projeto
1. Clique em **"New Project"**
2. Selecione sua organização (ou crie uma)
3. Preencha os dados:
   - **Name:** `sigo-db` (ou outro nome)
   - **Database Password:** Crie uma senha FORTE (guarde ela!)
   - **Region:** Escolha a mais próxima (ex: `South America (São Paulo)`)
   - **Pricing Plan:** Free (gratuito)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o projeto ser criado

### Passo 3: Obter a Connection String
1. No painel do projeto, vá em **Settings** (ícone de engrenagem)
2. Clique em **Database** no menu lateral
3. Role até **"Connection string"**
4. Selecione a aba **"URI"**
5. Copie a string que começa com `postgresql://postgres...`
6. **IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha que você criou

**Formato da Connection String:**
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

## 2. Configurar o SIGO para usar o Supabase

### Passo 1: Criar arquivo .env
Na pasta do projeto, crie o arquivo `.env` (se não existir):

```bash
# No terminal, na pasta do projeto:
copy .env.example .env
```

### Passo 2: Editar o .env
Abra o arquivo `.env` e configure:

```env
# Cole sua Connection String do Supabase aqui
DATABASE_URL="postgresql://postgres.[SEU-PROJECT-REF]:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# URL para conexões diretas (migrations)
DIRECT_URL="postgresql://postgres.[SEU-PROJECT-REF]:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# Porta do servidor (opcional)
PORT=3001

# Ambiente
NODE_ENV=development
```

**⚠️ IMPORTANTE:**
- Use a porta `6543` para conexões com pooling (aplicação)
- Use a porta `5432` para conexões diretas (migrations)
- Adicione `?pgbouncer=true` no final da URL principal

---

## 3. Executar Migrations e Seed

### Passo 1: Instalar dependências
```bash
npm install
```

### Passo 2: Gerar cliente Prisma
```bash
npm run db:generate
```

### Passo 3: Criar as tabelas no banco
```bash
npm run db:push
```

### Passo 4: Popular o banco com dados iniciais
```bash
npm run db:seed
```

---

## 4. Verificar no Supabase

1. Volte ao painel do Supabase
2. Clique em **"Table Editor"** no menu lateral
3. Você deve ver as tabelas criadas:
   - `policiais`
   - `afastamentos`
   - `restricoes`
   - `ocorrencias`
   - `viaturas`
   - `manutencoes`
   - `materiais`
   - `subunidades`
   - `tipos_ocorrencia`
   - `operacoes`
   - `escalas_servico`
   - `auditoria`
   - `configuracoes_sistema`

---

## 5. Iniciar o Servidor

```bash
# Iniciar apenas o backend
npm run dev:server

# OU iniciar frontend + backend juntos
npm run dev:all
```

O servidor estará disponível em: **http://localhost:3001**

---

## 6. Testar a API

Teste se está funcionando:

```bash
# Health check
curl http://localhost:3001/api/health

# Listar policiais
curl http://localhost:3001/api/policiais

# Dashboard de efetivo
curl http://localhost:3001/api/dashboard/efetivo
```

---

## Dicas Importantes

### Limites do Plano Gratuito do Supabase:
- **500 MB** de armazenamento
- **2 GB** de transferência/mês
- **50.000** requisições de API/mês
- Projeto pausado após **1 semana de inatividade**

### Para evitar pausas:
- Configure um job para fazer ping no banco periodicamente
- Ou faça upgrade para o plano Pro ($25/mês)

### Segurança:
- **NUNCA** commite o arquivo `.env` no Git
- O arquivo já está no `.gitignore`
- Cada ambiente (dev, prod) deve ter seu próprio banco

---

## Troubleshooting

### Erro: "Connection refused"
- Verifique se a senha está correta
- Verifique se o IP não está bloqueado (Supabase permite todos por padrão)

### Erro: "SSL required"
- Adicione `?sslmode=require` no final da URL

### Erro: "Too many connections"
- Use a porta `6543` com `?pgbouncer=true`

### Erro: "Database does not exist"
- Verifique se o projeto foi criado corretamente no Supabase

---

## Contato Supabase

- Documentação: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase
