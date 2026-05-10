# BUILD SIGNAL INTELLIGENCE - DEPLOYMENT GUIDE

## 🚀 Quick Deploy (15 min total)

### PASSO 1: Executar Build Local (2 min)
```bash
./deploy.sh
```
Este script faz:
- ✅ Verifica dependencies
- ✅ Build frontend (410 KB)
- ✅ Instala backend
- ✅ Gera secrets seguros

### PASSO 2: Railway Deploy (5 min)
1. Vá para: https://railway.app
2. Login com GitHub
3. New Project → Deploy from GitHub
4. Selecione: gcosta2327-cpu/buildsignalintell.com
5. Railway auto-detecta Dockerfile ✅
6. **Copie o domain do Railway** (ex: app-prod-abc123.railway.app)

### PASSO 3: Google Cloud DNS (5 min)
1. Abra: https://console.cloud.google.com
2. Cloud DNS → buildsignalintell.com
3. Execute (opcional):
   ```bash
   ./configure-dns.sh
   ```
4. Copie os records gerados para Google Cloud DNS

### PASSO 4: Railway Env Vars (2 min)
No dashboard do Railway, adicione:
```
ENVIRONMENT=production
DOMAIN=buildsignalintell.com
API_DOMAIN=api.buildsignalintell.com
SECRET_KEY=[vem do .env.production depois do deploy.sh]
DATABASE_URL=your-mongodb-uri-here
```

### PASSO 5: Merge PR (1 min)
```bash
# Ou manualmente no GitHub
gh pr merge 1 --squash
```

---

## 🎯 Checklist Final

- [ ] Rodou `./deploy.sh` localmente
- [ ] Railway deploy completado
- [ ] DNS records adicionados no Google Cloud
- [ ] Env vars configuradas no Railway
- [ ] PR #1 mergeada
- [ ] Testou https://buildsignalintell.com
- [ ] Testou https://api.buildsignalintell.com

---

## 🔗 URLs Úteis

- **Railway Dashboard:** https://railway.app
- **Google Cloud Console:** https://console.cloud.google.com
- **GitHub Repo:** https://github.com/gcosta2327-cpu/buildsignalintell.com
- **Vercel Dashboard:** https://vercel.com

---

## ❓ FAQ

**P: Quanto custa?**
A: Railway: $5/mês (ou free até 5GB). Vercel: Free para hobby. Total: ~$5-10/mês.

**P: E se der erro?**
A: Railway mostra logs em tempo real no dashboard.

**P: Como configurar banco de dados?**
A: Railway oferece PostgreSQL grátis na criação do projeto.

**P: Preciso fazer algo mais?**
A: Configurar variáveis sensíveis (SECRET_KEY, DATABASE_URL) no Railway dashboard.

---

## 📞 Suporte

Se algo der errado:
1. Verifique os logs no Railway dashboard
2. Verifique a propagação de DNS: `dig buildsignalintell.com`
3. Veja se o Dockerfile está correto

---

**Status: Pronto para deploy! 🚀**
