#!/bin/bash
# Railway + Google Cloud DNS Auto-Config
# Execute este script após fazer deploy no Railway

echo "🌐 Configurador Automático de DNS"
echo ""
echo "Pré-requisitos:"
echo "1. Ter feito deploy no Railway"
echo "2. Ter acesso ao Google Cloud Console"
echo ""

read -p "Digite o domínio do Railway (ex: app-prod-xxxx.railway.app): " RAILWAY_DOMAIN

if [ -z "$RAILWAY_DOMAIN" ]; then
    echo "❌ Domínio não pode ser vazio"
    exit 1
fi

cat > /tmp/dns_records.txt << EOF
📋 COPIE ESSES RECORDS NO GOOGLE CLOUD DNS:

Tipo: A Record
Nome: buildsignalintell.com
TTL: 3600
Dados: 76.76.19.165

Tipo: CNAME Record
Nome: www.buildsignalintell.com
TTL: 3600
Dados: cname.vercel-dns.com

Tipo: CNAME Record
Nome: api.buildsignalintell.com
TTL: 3600
Dados: $RAILWAY_DOMAIN

═══════════════════════════════════════

✅ Salvo em: /tmp/dns_records.txt
EOF

cat /tmp/dns_records.txt

echo ""
echo "✅ Records gerados!"
echo ""
echo "Próximos passos:"
echo "1. Abra: console.cloud.google.com"
echo "2. Cloud DNS → buildsignalintell.com"
echo "3. Copie os records acima"
echo ""
echo "Verificar propagação:"
echo "  dig buildsignalintell.com"
echo "  nslookup api.buildsignalintell.com"
