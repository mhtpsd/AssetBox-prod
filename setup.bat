@echo off
echo Setting up AssetBox...
echo.

REM Fix npm authentication issues
echo Configuring npm...
call npm config set registry https://registry.npmjs.org/
call npm config delete _auth 2>nul
call npm config delete _authToken 2>nul
call npm config delete //registry.npmjs.org/:_authToken 2>nul

REM Clear npm cache
echo Clearing npm cache...
call npm cache clean --force

REM Install dependencies
echo Installing dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

REM Start Docker services
echo Starting Docker services...
call docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Docker services failed to start. Make sure Docker Desktop is running.
    echo Continue anyway? Press Ctrl+C to cancel or any key to continue...
    pause
)

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Generate Prisma client
echo Generating Prisma client...
cd packages\database
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to generate Prisma client
    cd ..\..
    pause
    exit /b 1
)

REM Run migrations
echo Running database migrations...
call npx prisma migrate dev --name init
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Database migrations failed. Make sure PostgreSQL is running.
)

cd ..\..

echo.
echo Setup complete!
echo.
echo To start development:
echo   npm run dev
echo.
echo Services running at:
echo   - Frontend: http://localhost:3000
echo   - Backend:   http://localhost:3001
echo   - MinIO:    http://localhost:9001 (admin: minioadmin/minioadmin)
echo   - Meilisearch: http://localhost:7700
echo.
pause