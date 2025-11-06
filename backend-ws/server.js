// Servidor WebSocket para jogo multiplayer
// Deploy: Render.com ou Railway.app

const http = require('http');
const WebSocket = require('ws');

// Porta do servidor (Render/Railway definem via variável de ambiente)
const PORT = process.env.PORT || 3001;

// === SISTEMA DE SALAS: Estrutura de salas conectadas ===
const rooms = {
  central: new Map(),    // Sala central (vila)
  leftRoom: new Map(),   // Sala da esquerda (lago)
  rightRoom: new Map()   // Sala da direita (clareira)
}

// Armazena qual sala cada jogador está
const playerRooms = new Map() // playerId => roomName

// Cria servidor HTTP básico (apenas para health check)
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    // Contabiliza jogadores em todas as salas
    const totalPlayers = Object.values(rooms).reduce((sum, room) => sum + room.size, 0);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      players: totalPlayers,
      rooms: {
        central: rooms.central.size,
        leftRoom: rooms.leftRoom.size,
        rightRoom: rooms.rightRoom.size
      },
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

// Função para enviar mensagem a todos os clientes de uma sala específica
function broadcastToRoom(roomName, message, excludeId = null) {
  const data = JSON.stringify(message);
  const roomPlayers = rooms[roomName];
  if (!roomPlayers) return;
  
  roomPlayers.forEach((player, playerId) => {
    if (excludeId && playerId === excludeId) return;
    
    // Encontra o WebSocket correspondente
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.playerId === playerId) {
        client.send(data);
      }
    });
  });
}

// Função para enviar mensagem a todos os clientes (todas as salas)
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
    x: 400, // === SALAS: Posição inicial no centro da sala central ===
    y: 300,
    color: getRandomColor(),
    name: '',
    hat: 'none',
    message: '',
    messageTime: 0
  };

  // === SALAS: Jogador começa na sala central ===
  const initialRoom = 'central';
  playerRooms.set(playerId, initialRoom);

  // Armazena o ID no objeto WebSocket
  ws.playerId = playerId;
  ws.isAlive = true; // === KEEPALIVE: Flag para detectar conexões inativas ===

  // === KEEPALIVE: Responde ao ping do cliente ===
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Envia para o novo jogador seu ID e cor
  ws.send(JSON.stringify({
    type: 'init',
    id: playerId,
    color: playerData.color,
    x: playerData.x,
    y: playerData.y,
    hat: playerData.hat,
    room: initialRoom // === SALAS: Informa sala inicial ===
  }));

  // Envia para o novo jogador a lista de jogadores da sala atual
  const roomPlayers = Array.from(rooms[initialRoom].values());
  ws.send(JSON.stringify({
    type: 'players',
    players: roomPlayers,
    room: initialRoom // === SALAS: Sala dos jogadores ===
  }));

  // Evento: Mensagem recebida do cliente
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      // Atualiza dados do jogador baseado no tipo de mensagem
      switch (message.type) {
        case 'join':
          // === CUSTOMIZAÇÃO: Jogador entra com nome, cor e chapéu ===
          playerData.name = message.name;
          playerData.color = message.color || playerData.color;
          playerData.hat = message.hat || 'none';
          
          // === SALAS: Adiciona jogador na sala inicial ===
          const currentRoom = playerRooms.get(playerId) || 'central';
          rooms[currentRoom].set(playerId, playerData);

          console.log(`✅ ${message.name} entrou na sala ${currentRoom} (Total na sala: ${rooms[currentRoom].size})`);

          // Notifica todos da sala sobre o novo jogador
          broadcastToRoom(currentRoom, {
            type: 'playerJoined',
            player: playerData
          });
          break;

        case 'move':
          // === SALAS: Atualiza posição do jogador na sala atual ===
          const playerRoom = playerRooms.get(playerId);
          if (playerRoom && rooms[playerRoom].has(playerId)) {
            playerData.x = message.x;
            playerData.y = message.y;
            rooms[playerRoom].set(playerId, playerData);

            // Transmite movimento apenas para jogadores da mesma sala
            broadcastToRoom(playerRoom, {
              type: 'playerMoved',
              id: playerId,
              x: message.x,
              y: message.y
            });
          }
          break;

        case 'changeRoom':
          // === SALAS: Novo evento para trocar de sala ===
          const fromRoom = playerRooms.get(playerId);
          const toRoom = message.room;
          
          if (!fromRoom || !toRoom || !rooms[toRoom]) {
            console.error(`❌ Sala inválida: ${toRoom}`);
            break;
          }
          
          // Remove da sala anterior
          rooms[fromRoom].delete(playerId);
          
          // Notifica jogadores da sala anterior
          broadcastToRoom(fromRoom, {
            type: 'playerLeft',
            id: playerId
          });
          
          // Atualiza posição inicial na nova sala
          playerData.x = message.x || 400;
          playerData.y = message.y || 300;
          
          // Adiciona na nova sala
          rooms[toRoom].set(playerId, playerData);
          playerRooms.set(playerId, toRoom);
          
          console.log(`🚪 ${playerData.name} mudou de ${fromRoom} para ${toRoom}`);
          
          // Envia confirmação e jogadores da nova sala
          const newRoomPlayers = Array.from(rooms[toRoom].values()).filter(p => p.id !== playerId);
          ws.send(JSON.stringify({
            type: 'roomChanged',
            room: toRoom,
            players: newRoomPlayers,
            x: playerData.x,
            y: playerData.y
          }));
          
          // Notifica jogadores da nova sala
          broadcastToRoom(toRoom, {
            type: 'playerJoined',
            player: playerData
          }, playerId);
          break;

        case 'chat':
          // === SALAS: Chat apenas na sala atual ===
          const chatRoom = playerRooms.get(playerId);
          if (chatRoom && rooms[chatRoom].has(playerId)) {
            console.log(`💬 [${chatRoom}] ${playerData.name}: ${message.message}`);
            broadcastToRoom(chatRoom, {
              type: 'chat',
              id: playerId,
              message: message.message,
              timestamp: Date.now()
            });
          }
          break;

        case 'ping':
          // === KEEPALIVE: Responde ao ping do cliente ===
          ws.send(JSON.stringify({ type: 'pong' }));
          ws.isAlive = true;
          break;

        case 'updateHat':
          // === CUSTOMIZAÇÃO: Atualiza chapéu do jogador ===
          const hatRoom = playerRooms.get(playerId);
          if (hatRoom && rooms[hatRoom].has(playerId)) {
            playerData.hat = message.hat;
            rooms[hatRoom].set(playerId, playerData);

            console.log(`🎩 ${playerData.name} trocou para chapéu: ${message.hat}`);

            // Notifica apenas jogadores da mesma sala
            broadcastToRoom(hatRoom, {
              type: 'playerUpdated',
              id: playerId,
              hat: message.hat
            });
          }
          break;
      }
    } catch (err) {
      console.error('❌ Erro ao processar mensagem:', err)
    }
  });

  // Evento: Cliente desconectado
  ws.on('close', () => {
    const playerName = playerData.name || 'Jogador';
    const playerRoom = playerRooms.get(playerId);
    
    if (playerRoom) {
      console.log(`👋 ${playerName} desconectou da sala ${playerRoom} (Total na sala: ${rooms[playerRoom].size - 1})`);
      
      // Remove jogador da sala
      rooms[playerRoom].delete(playerId);
      playerRooms.delete(playerId);

      // Notifica apenas jogadores da mesma sala
      broadcastToRoom(playerRoom, {
        type: 'playerLeft',
        id: playerId
      });
    }
  });

  // Evento: Erro na conexão
  ws.on('error', (err) => {
    console.error('❌ Erro WebSocket:', err);
  });
});

// === KEEPALIVE: Verifica conexões inativas a cada 60 segundos ===
const keepAliveInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      // Cliente não respondeu ao ping - força desconexão
      console.log('💀 Cliente inativo detectado - forçando desconexão');
      const playerId = ws.playerId;
      if (playerId) {
        const playerRoom = playerRooms.get(playerId);
        if (playerRoom && rooms[playerRoom].has(playerId)) {
          const playerName = rooms[playerRoom].get(playerId).name || 'Jogador';
          console.log(`👋 ${playerName} removido por inatividade da sala ${playerRoom}`);
          rooms[playerRoom].delete(playerId);
          playerRooms.delete(playerId);
          broadcastToRoom(playerRoom, {
            type: 'playerLeft',
            id: playerId
          });
        }
      }
      return ws.terminate();
    }

    // Marca como inativo e envia ping
    ws.isAlive = false;
    ws.ping();
  });
}, 60000); // 60 segundos

// Limpa interval quando servidor fecha
wss.on('close', () => {
  clearInterval(keepAliveInterval);
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
