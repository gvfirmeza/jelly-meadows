# 🎮 Frontend Next.js - Jogo Multiplayer

Frontend do jogo multiplayer estilo Club Penguin usando Next.js.

## 🚀 Deploy na Vercel (GRATUITO)

### Método 1: Deploy via GitHub (RECOMENDADO)

1. **Faça push deste código para um repositório GitHub**

2. **Acesse [vercel.com](https://vercel.com) e faça login**

3. **Clique em "New Project"**

4. **Importe seu repositório GitHub**

5. **Configure o projeto:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend-nextjs` (se estiver em monorepo)
   - **Build Command**: `npm run build` (já preenchido)
   - **Output Directory**: `.next` (já preenchido)

6. **IMPORTANTE: Adicione a variável de ambiente:**
   - Vá em **Environment Variables**
   - Adicione:
     - **Name**: `NEXT_PUBLIC_WS_URL`
     - **Value**: `wss://seu-backend.onrender.com` (URL do seu backend)
   
7. **Clique em "Deploy"**

### Método 2: Deploy via CLI da Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

---

## 🔧 Configuração Local

### 1. Instale as dependências:

```bash
npm install
```

### 2. Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

### 4. Abra [http://localhost:3000](http://localhost:3000)

---

## 🌐 Conectando ao Backend

Depois de fazer deploy do backend no Render, você precisa atualizar a URL do WebSocket:

### Na Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Edite `NEXT_PUBLIC_WS_URL`
3. Coloque: `wss://seu-backend.onrender.com`
4. Faça um novo deploy (ou espere o redeploy automático)

### Localmente (.env.local):

```env
# Para testar com backend local
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Para testar com backend deployado
NEXT_PUBLIC_WS_URL=wss://seu-backend.onrender.com
```

---

## 📁 Estrutura do Projeto

```
frontend-nextjs/
├── pages/
│   ├── _app.js          # App wrapper
│   ├── _document.js     # Document wrapper
│   └── index.js         # Página principal
├── components/
│   ├── GameCanvas.js    # Canvas do jogo
│   ├── ChatBox.js       # Chat
│   ├── PlayerInfo.js    # Info do jogador
│   └── Controls.js      # Controles
├── hooks/
│   ├── useWebSocket.js  # Hook de WebSocket
│   └── useGameState.js  # Hook de estado do jogo
├── styles/
│   ├── globals.css      # Estilos globais
│   └── *.module.css     # Estilos dos componentes
├── next.config.js       # Config do Next.js
├── package.json
└── vercel.json          # Config da Vercel
```

---

## ✅ Checklist de Deploy

- [ ] Backend deployado no Render
- [ ] URL do backend copiada (ex: `wss://multiplayer-game-backend.onrender.com`)
- [ ] Frontend no GitHub
- [ ] Projeto importado na Vercel
- [ ] Variável `NEXT_PUBLIC_WS_URL` configurada na Vercel
- [ ] Deploy concluído
- [ ] Testado com 2 navegadores/máquinas diferentes

---

## 🎮 Como Jogar

1. Acesse o site deployado
2. Digite seu nome
3. Use **WASD** ou **setas** para se mover
4. Digite mensagens no chat
5. Divirta-se com seus amigos! 🎉

---

## 🆘 Problemas Comuns

### "Conectando ao servidor..." fica travado

- ✅ Verifique se o backend está rodando
- ✅ Confirme que `NEXT_PUBLIC_WS_URL` está correto
- ✅ Use `wss://` (não `ws://`) para HTTPS
- ✅ Verifique o console do navegador (F12)

### Backend hiberna após 15 min

- ✅ Normal no plano gratuito do Render
- ✅ Primeira conexão após hibernar demora ~30s
- ✅ Use UptimeRobot para pingar o backend a cada 5 min

### Erro de CORS

- ✅ Certifique-se de que o backend permite conexões do seu domínio
- ✅ WebSockets geralmente não têm problema de CORS

---

## 📚 Recursos

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

## 🎉 Pronto!

Agora você tem um jogo multiplayer totalmente funcional e deployado! 🚀

Compartilhe a URL com seus amigos e divirtam-se juntos!
