@echo off
echo ===============================================
echo    SIGO - Setup do Banco de Dados
echo    Execute este script em uma rede sem bloqueio
echo ===============================================
echo.

echo [1/4] Gerando cliente Prisma...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao gerar cliente Prisma
    pause
    exit /b 1
)
echo OK!
echo.

echo [2/4] Criando tabelas no banco de dados...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao criar tabelas. Verifique a conexao com o banco.
    pause
    exit /b 1
)
echo OK!
echo.

echo [3/4] Populando banco com dados iniciais...
call npx tsx prisma/seed.ts
if %ERRORLEVEL% NEQ 0 (
    echo AVISO: Falha no seed, mas as tabelas foram criadas.
)
echo OK!
echo.

echo [4/4] Testando conexao...
call npx prisma db pull --print
echo.

echo ===============================================
echo    Setup concluido com sucesso!
echo
echo    Para iniciar o servidor:
echo    npm run dev:server
echo ===============================================
pause
