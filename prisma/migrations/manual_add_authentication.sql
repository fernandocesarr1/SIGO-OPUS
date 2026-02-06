-- SIGO - Migration: Add Authentication Tables
-- Execute este SQL no banco de dados para criar as tabelas de autenticação
-- Alternativa: npx prisma migrate dev --name add_authentication

-- Criar enum para perfis de usuário
CREATE TYPE "PerfilUsuario" AS ENUM ('COMANDANTE', 'CHEFE_SECAO', 'OPERADOR', 'ADMIN_SISTEMA');

-- Criar tabela de usuários
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "senhaHash" VARCHAR(255) NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'OPERADOR',
    "secao" VARCHAR(20),
    "policialId" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcesso" TIMESTAMP(3),
    "tentativasLogin" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoAte" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoPor" VARCHAR(100),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- Criar tabela de sessões
CREATE TABLE "sessoes_usuario" (
    "id" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_usuario_pkey" PRIMARY KEY ("id")
);

-- Criar índices únicos
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");
CREATE UNIQUE INDEX "usuarios_policialId_key" ON "usuarios"("policialId");

-- Criar foreign keys
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_policialId_fkey"
    FOREIGN KEY ("policialId") REFERENCES "policiais"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sessoes_usuario" ADD CONSTRAINT "sessoes_usuario_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Criar índice para performance de sessões
CREATE INDEX "sessoes_usuario_usuarioId_idx" ON "sessoes_usuario"("usuarioId");
CREATE INDEX "sessoes_usuario_expiresAt_idx" ON "sessoes_usuario"("expiresAt");
