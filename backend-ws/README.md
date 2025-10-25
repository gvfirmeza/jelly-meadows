# 🎮 Backend WebSocket - Jogo Multiplayer

Servidor WebSocket para o jogo multiplayer estilo Club Penguin.

## 🚀 Deploy no Render.com (GRATUITO)

### Opção 1: Deploy direto pelo GitHub

1. Faça push deste código para um repositório GitHub
2. Acesse [render.com](https://render.com) e faça login
3. Clique em **"New +"** → **"Web Service"**
4. Conecte seu repositório GitHub
5. Configure:
   - **Name**: `multiplayer-game-backend`
   - **Root Directory**: `backend-ws` (se estiver em monorepo)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Clique em **"Create Web Service"**

### Opção 2: Deploy via CLI do Render

```bash
# Instale a CLI do Render
npm install -g render-cli

# Faça login
render login

# Deploy
render deploy
```

### ⚙️ Após o deploy

Seu backend estará disponível em:
```
wss://multiplayer-game-backend.onrender.com
```

**⚠️ IMPORTANTE:** Copie essa URL e use no frontend Next.js!

## 🧪 Testar localmente

```bash
npm install
npm start
```

Servidor rodará em `ws://localhost:3001`

## 🔍 Health Check

Acesse `/health` para verificar status:
```
https://seu-backend.onrender.com/health
```

## 📝 Notas

- ✅ O plano gratuito do Render hiberna após 15 min de inatividade
- ✅ A primeira conexão após hibernar pode demorar ~30 segundos
- ✅ Para evitar hibernação: use um serviço de ping (ex: UptimeRobot)
- ✅ Render oferece 750 horas/mês grátis

## 🆘 Problemas?

- Verifique os logs no painel do Render
- Certifique-se de que a porta está usando `process.env.PORT`
- Teste a conexão WebSocket com uma ferramenta como [Postman](https://www.postman.com/)
