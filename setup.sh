#!/bin/bash

echo "🚀 Setting up AssetBox..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd packages/database
npx prisma generate

# Run migrations
echo "📊 Running database migrations..."
npx prisma migrate dev --name init

cd ../.. 

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "Services running at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:   http://localhost:3001"
echo "  - MinIO:    http://localhost:9001 (admin:  minioadmin/minioadmin)"
echo "  - Meilisearch: http://localhost:7700"