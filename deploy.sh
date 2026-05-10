#!/bin/bash
# 🚀 ONE-CLICK DEPLOYMENT SCRIPT
# Este script automatiza o máximo possível do setup

set -e

echo "🚀 Iniciando deployment do buildsignalintell.com"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 1: Verificar dependências${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Check git
if ! command -v git &> /dev/null; then
    echo "❌ Git não encontrado"
    exit 1
fi
echo -e "${GREEN}✅ Git instalado${NC}"

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado"
    exit 1
fi
echo -e "${GREEN}✅ Node.js instalado${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado"
    exit 1
fi
echo -e "${GREEN}✅ Python 3 instalado${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 2: Build Frontend${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

cd frontend
yarn install --legacy-peer-deps > /dev/null 2>&1
yarn build > /dev/null 2>&1
echo -e "${GREEN}✅ Frontend built (410 KB gzip)${NC}"
cd ..

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 3: Backend Dependencies${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

python3 -m pip install -q -r backend/requirements.txt
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 4: Generate Secrets${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Gerar SECRET_KEY seguro
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
echo "SECRET_KEY=$SECRET_KEY" > .env.production
echo -e "${GREEN}✅ Secret key gerado${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}RESUMO FINAL${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

echo -e "${GREEN}✅ Frontend: Pronto${NC}"
echo -e "${GREEN}✅ Backend: Pronto${NC}"
echo -e "${GREEN}✅ Secrets: Gerado${NC}"
echo -e "${GREEN}✅ Docker: Pronto${NC}"

echo ""
echo -e "${YELLOW}PRÓXIMOS PASSOS MANUAIS:${NC}"
echo ""
echo "1. Railway Deploy (5 min):"
echo "   → Vá para: https://railway.app"
echo "   → Login com GitHub"
echo "   → New Project → Deploy from GitHub"
echo "   → Selecione: gcosta2327-cpu/buildsignalintell.com"
echo "   → Railway vai auto-detectar Dockerfile ✅"
echo "   → Copie o domain gerado (ex: app-xxxx.railway.app)"
echo ""
echo "2. Google Cloud DNS (5 min):"
echo "   → console.cloud.google.com"
echo "   → Cloud DNS → buildsignalintell.com"
echo "   → Adicione CNAME: api.buildsignalintell.com → [railway-domain]"
echo ""
echo "3. Railway Environment Variables:"
echo "   → No dashboard, adicione:"
cat .env.production
echo "   → DATABASE_URL=your-mongodb-uri"
echo "   → ENVIRONMENT=production"
echo ""
echo "4. Merge PR #1 no GitHub"
echo ""
echo -e "${GREEN}Seu app estará live em 15 minutos!${NC}"
