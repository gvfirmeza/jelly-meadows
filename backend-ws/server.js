// Servidor WebSocket para jogo multiplayer
// Deploy: Render.com ou Railway.app

const http = require('http');
const WebSocket = require('ws');

// Porta do servidor (Render/Railway definem via variável de ambiente)
const PORT = process.env.PORT || 3001;

// Armazena todos os jogadores conectados
const players = new Map();

// Cria servidor HTTP básico (apenas para health check)
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      players: players.size,
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('🎮 Servidor WebSocket do Jogo Multiplayer está rodando!\n');
  }
});

// Cria servidor WebSocket
const wss = new WebSocket.Server({ server });

// Função para gerar cor aleatória
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#AAB7B8'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Função para gerar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Função para enviar mensagem a todos os clientes
function broadcast(message) {
  const data = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Evento: Nova conexão WebSocket
wss.on('connection', (ws) => {
  console.log('🎮 Novo jogador conectado');

  // Cria dados do novo jogador
  const playerId = generateId();
  const playerData = {
    id: playerId,
    x: Math.floor(Math.random() * 700) + 50, // Posição inicial aleatória
    y: Math.floor(Math.random() * 500) + 50,
    color: getRandomColor(),
    name: '',
    message: '',
    messageTime: 0
  };

  // Armazena o ID no objeto WebSocket
  ws.playerId = playerId;

  // Envia para o novo jogador seu ID e cor
  ws.send(JSON.stringify({
    type: 'init',
    id: playerId,
    color: playerData.color,
    x: playerData.x,
    y: playerData.y
  }));

  // Envia para o novo jogador a lista de jogadores existentes
  const existingPlayers = Array.from(players.values());
  ws.send(JSON.stringify({
    type: 'players',
    players: existingPlayers
  }));

  // Evento: Mensagem recebida do cliente
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      // Atualiza dados do jogador baseado no tipo de mensagem
      switch (message.type) {
        case 'join':
          // Jogador entra com nome
          playerData.name = message.name;
          players.set(playerId, playerData);

          console.log(`✅ ${message.name} entrou no jogo (Total: ${players.size})`);

          // Notifica todos sobre o novo jogador
          broadcast({
            type: 'playerJoined',
            player: playerData
          });
          break;

        case 'move':
          // Atualiza posição do jogador
          if (players.has(playerId)) {
            playerData.x = message.x;
            playerData.y = message.y;
            players.set(playerId, playerData);

            // Transmite movimento para todos
            broadcast({
              type: 'playerMoved',
              id: playerId,
              x: message.x,
              y: message.y
            });
          }
          break;

        case 'chat':
          // Transmite mensagem do chat
          if (players.has(playerId)) {
            console.log(`💬 ${playerData.name}: ${message.message}`);
            broadcast({
              type: 'chat',
              id: playerId,
              message: message.message,
              timestamp: Date.now()
            });
          }
          break;
      }
    } catch (err) {
      console.error('❌ Erro ao processar mensagem:', err);
    }
  });

  // Evento: Cliente desconectado
  ws.on('close', () => {
    const playerName = playerData.name || 'Jogador';
    console.log(`👋 ${playerName} desconectou (Total: ${players.size - 1})`);
    
    // Remove jogador da lista
    players.delete(playerId);

    // Notifica todos sobre a desconexão
    broadcast({
      type: 'playerLeft',
      id: playerId
    });
  });

  // Evento: Erro na conexão
  ws.on('error', (err) => {
    console.error('❌ Erro WebSocket:', err);
  });
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`\n🚀 ========================================`);
  console.log(`🎮 Servidor WebSocket rodando!`);
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`🚀 ========================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recebido, fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});
