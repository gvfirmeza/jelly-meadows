import { useEffect, useRef, useCallback, useState } from 'react'
import useWebSocket from '../hooks/useWebSocket'
import useGameState from '../hooks/useGameState'

const PLAYER_SIZE = 40
const MOVE_SPEED = 200 // pixels por segundo
const MESSAGE_DURATION = 3000
const INTERPOLATION_SPEED = 0.15 // Suavização do movimento (0-1, maior = mais rápido)

// === SALAS: Definição dos portais (agora com portais de retorno) ===
const PORTALS = {
  // Sala Central - Setas para as salas laterais
  central_left: { 
    x: 30, y: 300, width: 40, height: 60, 
    targetRoom: 'leftRoom', spawnX: 650, spawnY: 300, 
    visibleIn: 'central', label: 'LAGO', color: 'blue' 
  },
  central_right: { 
    x: 730, y: 300, width: 40, height: 60, 
    targetRoom: 'rightRoom', spawnX: 150, spawnY: 300, 
    visibleIn: 'central', label: 'CLAREIRA', color: 'orange' 
  },
  // Sala do Lago - Seta de volta (direita -> central)
  leftRoom_back: { 
    x: 730, y: 300, width: 40, height: 60, 
    targetRoom: 'central', spawnX: 150, spawnY: 300, 
    visibleIn: 'leftRoom', label: 'VOLTAR', color: 'green' 
  },
  // Sala da Clareira - Seta de volta (esquerda -> central)
  rightRoom_back: { 
    x: 30, y: 300, width: 40, height: 60, 
    targetRoom: 'central', spawnX: 650, spawnY: 300, 
    visibleIn: 'rightRoom', label: 'VOLTAR', color: 'green' 
  }
}

// === SALAS: Backgrounds por sala ===
const ROOM_BACKGROUNDS = {
  // Keep these as fallbacks when no image is available
  central: '#A8E6CF',    // Verde claro (prado/vila)
  leftRoom: '#87CEEB',   // Azul claro (lago)
  rightRoom: '#FFE4B5'   // Bege (clareira)
}

// Paths for room background images (files should be under public/rooms)
// Using the provided welcome image for the central room
const ROOM_BACKGROUND_IMAGES = {
  central: '/rooms/welcome_room.png',
  leftRoom: '/rooms/lake_room.png',
  rightRoom: '/rooms/clearing_room.png'
}

// Mapeamento de IDs para caminhos de imagem
const HAT_IMAGES = {
  'cap': '/hats/cap.png',
  'sunhat': '/hats/hat.png',
  'party': '/hats/mexican-hat.png',
  'graduate': '/hats/pamela-hat.png',
  'wizard': '/hats/wizard-hat.png',
  'viking': '/hats/cowboy-hat.png'
}

export default function GameCanvas({ 
  onConnected, 
  onPlayerNameChange, 
  onPlayerCountChange, 
  onPlayerColorChange,
  playerCustomization, // === CUSTOMIZAÇÃO: Recebe dados do lobby ===
  onHatChange, // === CUSTOMIZAÇÃO: Callback para mudança de chapéu ===
  onRoomChange // callback to notify parent about room changes
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const chatMessagesRef = useRef(new Map()) // mensagens locais para evitar tocar no estado global
  const hasInitializedRef = useRef(false)
  const targetPositionRef = useRef(null) // Posição alvo do click
  const lastFrameTimeRef = useRef(Date.now())
  const [hatImages, setHatImages] = useState({})
  const [roomImages, setRoomImages] = useState({ central: null, leftRoom: null, rightRoom: null })

  // Adiciona mensagem localmente e programa remoção após MESSAGE_DURATION
  const addLocalChatMessage = useCallback((id, message, timestamp) => {
    if (!id) return
    chatMessagesRef.current.set(id, { message, timestamp })

    // Remove depois de MESSAGE_DURATION
    setTimeout(() => {
      const entry = chatMessagesRef.current.get(id)
      if (entry && entry.timestamp === timestamp) {
        chatMessagesRef.current.delete(id)
      }
    }, MESSAGE_DURATION + 100)
  }, [])
  
  // Carrega as imagens dos chapéus
  useEffect(() => {
    const loadedImages = {}
    Object.entries(HAT_IMAGES).forEach(([id, src]) => {
      const img = new Image()
      img.src = src
      loadedImages[id] = img
    })
    setHatImages(loadedImages)
  }, [])

  // Carrega imagens de background das salas (se existirem em /public/rooms)
  useEffect(() => {
    const imgs = {}
    Object.entries(ROOM_BACKGROUND_IMAGES).forEach(([room, path]) => {
      if (!path) return
      const img = new Image()
      img.src = path
      img.onload = () => {
        setRoomImages(prev => ({ ...prev, [room]: img }))
      }
      img.onerror = () => {
        // Falha ao carregar - mantém fallback de cor
        console.warn('Não foi possível carregar background da sala:', path)
      }
    })
  }, [])
  
  const {
    myPlayer,
    players,
    currentRoom,
    setCurrentRoom,
    initPlayer,
    updatePlayers,
    clearPlayers,
    addPlayer,
    movePlayer,
    addChatMessage,
    removePlayer,
    setMyPlayerPosition,
    updatePlayerHat
  } = useGameState()

  const { connected, sendMessage } = useWebSocket({
    onInit: (data) => {
      // Previne múltiplas inicializações
      if (hasInitializedRef.current) return
      hasInitializedRef.current = true
      
      // === CUSTOMIZAÇÃO: Usa dados do lobby ao invés de prompt ===
      const { name, color, hat } = playerCustomization
      initPlayer(data.id, data.x, data.y, color, name, hat, data.room || 'central')
      onPlayerNameChange(name)
      onPlayerColorChange(color)
      onConnected(true)
      if (onRoomChange) onRoomChange(data.room || 'central')
      
      // Envia customizações completas para o servidor
      sendMessage({ 
        type: 'join', 
        name,
        color,
        hat
      })
    },
    onPlayers: (data) => {
      updatePlayers(data.players)
    },
    onPlayerJoined: (data) => {
      addPlayer(data.player)
    },
    onPlayerMoved: (data) => {
      movePlayer(data.id, data.x, data.y)
    },
    onChat: (data) => {
      console.log('📨 Chat recebido:', data)
      // Mantemos mensagens de chat localmente no GameCanvas para evitar atualizar o Map de players
      // Isso reduz re-renders e evita efeitos colaterais na UI
      addLocalChatMessage(data.id, data.message, data.timestamp)
    },
    onPlayerLeft: (data) => {
      removePlayer(data.id)
      // Limpa mensagem local do jogador que saiu
      if (chatMessagesRef.current.has(data.id)) {
        chatMessagesRef.current.delete(data.id)
      }
    },
    onPlayerUpdated: (data) => {
      if (data.hat !== undefined) {
        updatePlayerHat(data.id, data.hat)
        if (myPlayer && data.id === myPlayer.id && onHatChange) {
          onHatChange(data.hat)
        }
      }
    },
    // === SALAS: Novo handler para mudança de sala ===
    onRoomChanged: (data) => {
      console.log(`🚪 Mudou para sala: ${data.room}`)
      setCurrentRoom(data.room)
      if (onRoomChange) onRoomChange(data.room)
      clearPlayers() // Remove jogadores da sala antiga
      updatePlayers(data.players) // Adiciona jogadores da nova sala
      setMyPlayerPosition(data.x, data.y) // Atualiza posição do spawn
      targetPositionRef.current = null // Cancela movimento em andamento
        // Limpa mensagens locais ao trocar de sala
        chatMessagesRef.current.clear()
    }
  })

    

  // === FIX: Atualiza contador automaticamente baseado no Map de players ===
  useEffect(() => {
    onPlayerCountChange(players.size)
  }, [players, onPlayerCountChange])

  // === CUSTOMIZAÇÃO: Função para trocar chapéu ===
  const handleHatChange = useCallback((newHat) => {
    if (!myPlayer || !connected) return
    
    updatePlayerHat(myPlayer.id, newHat)
    
    sendMessage({
      type: 'updateHat',
      hat: newHat
    })
    
    if (onHatChange) {
      onHatChange(newHat)
    }
  }, [myPlayer, connected, sendMessage, updatePlayerHat, onHatChange])

  // === SALAS: Função para trocar de sala ===
  const changeRoom = useCallback((targetRoom, spawnX, spawnY) => {
    if (!myPlayer || !connected) return
    
    console.log(`🚪 Trocando para sala: ${targetRoom}`)
    
    // Cancela movimento imediatamente
    targetPositionRef.current = null
    
    sendMessage({
      type: 'changeRoom',
      room: targetRoom,
      x: spawnX,
      y: spawnY
    })
  }, [myPlayer, connected, sendMessage])

  // Expõe função de trocar chapéu globalmente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.changePlayerHat = handleHatChange
    }
  }, [handleHatChange])

  // Enviar mensagem de chat
  const sendChatMessage = useCallback((message) => {
    if (message && connected) {
      sendMessage({ type: 'chat', message })
    }
  }, [connected, sendMessage])

  // Expõe sendChatMessage globalmente para o ChatBox
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sendGameChatMessage = sendChatMessage
    }
  }, [sendChatMessage])

  // Click-to-move: Define posição alvo quando clica no canvas
  const handleCanvasClick = useCallback((e) => {
    if (!myPlayer || !connected) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Define a posição alvo (sem verificar portais aqui)
    targetPositionRef.current = { x, y }
  }, [myPlayer, connected])

  // Movimento do jogador - INSTANTÂNEO e suave
  useEffect(() => {
    if (!myPlayer || !connected) return

    let lastSentTime = 0
    const SEND_INTERVAL = 50 // Envia atualização a cada 50ms (20 FPS de rede)

    const handleMovement = () => {
      const target = targetPositionRef.current
      if (!target) return

      const currentX = myPlayer.x
      const currentY = myPlayer.y
      
      // Calcula distância até o alvo
      const dx = target.x - currentX
      const dy = target.y - currentY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Se chegou perto o suficiente, para o movimento
      if (distance < 3) {
        targetPositionRef.current = null
        return
      }
      
      // Velocidade mais suave e natural (antes era max 8)
      const speed = Math.min(distance * 0.1, 4) // Velocidade adaptativa, max 4px/frame
      const angle = Math.atan2(dy, dx)
      const newX = currentX + Math.cos(angle) * speed
      const newY = currentY + Math.sin(angle) * speed
      
      // Garante que não sai do canvas
      const clampedX = Math.max(PLAYER_SIZE / 2, Math.min(800 - PLAYER_SIZE / 2, newX))
      let clampedY = Math.max(PLAYER_SIZE / 2, Math.min(600 - PLAYER_SIZE / 2, newY))
      
      // === COLISÃO: Parede invisível no horizonte ===
      // Impede que o jogador ande pelo céu/copa das árvores
      let HORIZON_Y = 260; // Padrão
      if (currentRoom === 'leftRoom') {
        HORIZON_Y = 200; // Sobe a colisão um pouco mais pro fundo do mapa do lago
      }
      
      if (clampedY < HORIZON_Y) {
        clampedY = HORIZON_Y;
      }
      
      // === SALAS: Verifica colisão com portais da sala atual ===
      for (const [portalName, portal] of Object.entries(PORTALS)) {
        // Só verifica portais da sala atual
        if (portal.visibleIn !== currentRoom) continue
        
        // Verifica se o CENTRO do jogador está colidindo com o portal (área menor)
        const playerCenterX = clampedX
        const playerCenterY = clampedY
        
        if (playerCenterX >= portal.x && 
            playerCenterX <= portal.x + portal.width &&
            playerCenterY >= portal.y && 
            playerCenterY <= portal.y + portal.height) {
          console.log(`🚪 Colidiu com portal: ${portalName} -> ${portal.targetRoom}`)
          changeRoom(portal.targetRoom, portal.spawnX, portal.spawnY)
          return // Para tudo e sai do loop
        }
      }
      
      // Atualiza posição local INSTANTANEAMENTE
      setMyPlayerPosition(clampedX, clampedY)
      
      // Throttle para enviar pro servidor (reduz tráfego de rede)
      const now = Date.now()
      if (now - lastSentTime > SEND_INTERVAL) {
        sendMessage({ type: 'move', x: clampedX, y: clampedY })
        lastSentTime = now
      }
    }

    const interval = setInterval(handleMovement, 1000 / 60) // 60 FPS visual local
    return () => clearInterval(interval)
  }, [myPlayer, connected, sendMessage, setMyPlayerPosition, currentRoom, changeRoom])

  // Renderização com interpolação suave para outros jogadores
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const displayPositions = new Map() // Posições renderizadas (interpoladas)

    const render = () => {
      // === SALAS: Desenha background estilizado da sala atual ===
      // Se há uma imagem configurada para esta sala, a usamos quando ela estiver
      // carregada. Se a imagem ainda não carregou, desenhamos um fundo neutro
      // simples (sem os decorativos vetoriais) para evitar o fallback anterior.
      const expectedRoomImage = ROOM_BACKGROUND_IMAGES[currentRoom]
      if (expectedRoomImage) {
        if (roomImages[currentRoom]) {
          ctx.drawImage(roomImages[currentRoom], 0, 0, canvas.width, canvas.height)
        } else {
          // imagem esperada, mas ainda não carregada: fundo neutro simples
          ctx.fillStyle = '#111'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      } else {
        // Sem imagem configurada: usa os fallbacks decorativos por sala
        if (currentRoom === 'central') {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
          gradient.addColorStop(0, '#87CEEB') // Céu azul
          gradient.addColorStop(0.4, '#A8E6CF') // Verde claro
          gradient.addColorStop(1, '#78C878') // Verde escuro
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Desenha caminho de pedras
          ctx.fillStyle = 'rgba(160, 160, 160, 0.4)'
          for (let i = 0; i < 15; i++) {
            const x = 200 + i * 30
            const y = 350 + Math.sin(i * 0.5) * 20
            ctx.beginPath()
            ctx.ellipse(x, y, 25, 15, 0, 0, Math.PI * 2)
            ctx.fill()
          }

          // Árvores decorativas
          for (let i = 0; i < 5; i++) {
            const x = 100 + i * 150
            const y = 150
            ctx.fillStyle = 'rgba(101, 67, 33, 0.5)' // Tronco
            ctx.fillRect(x - 5, y, 10, 30)
            ctx.fillStyle = 'rgba(34, 139, 34, 0.5)' // Copa
            ctx.beginPath()
            ctx.arc(x, y - 10, 20, 0, Math.PI * 2)
            ctx.fill()
          }
        } else if (currentRoom === 'leftRoom') {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
          gradient.addColorStop(0, '#87CEEB')
          gradient.addColorStop(0.3, '#B0E0E6')
          gradient.addColorStop(1, '#4682B4')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Ondas no lago
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.lineWidth = 2
          for (let i = 0; i < 5; i++) {
            ctx.beginPath()
            ctx.moveTo(0, 400 + i * 30)
            for (let x = 0; x < canvas.width; x += 20) {
              ctx.lineTo(x, 400 + i * 30 + Math.sin(x * 0.1 + i) * 5)
            }
            ctx.stroke()
          }

          for (let i = 0; i < 6; i++) {
            const x = 50 + i * 130
            const y = 100
            ctx.fillStyle = 'rgba(34, 139, 34, 0.4)'
            ctx.beginPath()
            ctx.arc(x, y, 30, 0, Math.PI * 2)
            ctx.fill()
          }
        } else if (currentRoom === 'rightRoom') {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
          gradient.addColorStop(0, '#87CEEB')
          gradient.addColorStop(0.4, '#FFE4B5')
          gradient.addColorStop(1, '#DEB887')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          ctx.fillStyle = 'rgba(101, 67, 33, 0.5)'
          ctx.fillRect(300, 120, 15, 80)
          ctx.fillRect(485, 120, 15, 80)
          ctx.fillRect(300, 130, 200, 10)
          ctx.fillRect(300, 180, 200, 10)

          for (let i = 0; i < 4; i++) {
            const x = 100 + i * 180
            const y = 500
            ctx.fillStyle = 'rgba(107, 142, 35, 0.5)'
            ctx.beginPath()
            ctx.ellipse(x, y, 40, 25, 0, 0, Math.PI * 2)
            ctx.fill()
          }
        }
  }
      
      // === SALAS: Desenha portais (setas) da sala atual ===
      Object.entries(PORTALS).forEach(([name, portal]) => {
        // Só desenha portais da sala atual
        if (portal.visibleIn !== currentRoom) return

        // Portais neutros (sem cor nem texto)
        ctx.fillStyle = 'rgba(200,200,200,0.5)'
        ctx.strokeStyle = 'rgba(120,120,120,0.8)'
        ctx.lineWidth = 3
        ctx.beginPath()

        // Desenha seta para esquerda ou direita
        if (portal.x < 100) { // Seta esquerda
          ctx.moveTo(portal.x + portal.width, portal.y)
          ctx.lineTo(portal.x, portal.y + portal.height / 2)
          ctx.lineTo(portal.x + portal.width, portal.y + portal.height)
        } else { // Seta direita
          ctx.moveTo(portal.x, portal.y)
          ctx.lineTo(portal.x + portal.width, portal.y + portal.height / 2)
          ctx.lineTo(portal.x, portal.y + portal.height)
        }

        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      })
      
      // (removed room title display as requested)
      
      // Desenha indicador de alvo se houver
      if (targetPositionRef.current && myPlayer) {
        const target = targetPositionRef.current
        ctx.strokeStyle = myPlayer.color
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(target.x, target.y, 10, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }
      
      const now = Date.now()

      players.forEach(player => {
        let displayX = player.x
        let displayY = player.y
        
        // APENAS outros jogadores têm interpolação
        // O próprio jogador usa a posição exata (sem lag)
        if (myPlayer && player.id !== myPlayer.id) {
          const lastPos = displayPositions.get(player.id)
          if (lastPos) {
            // Interpolação suave para outros jogadores
            displayX = lastPos.x + (player.x - lastPos.x) * 0.3
            displayY = lastPos.y + (player.y - lastPos.y) * 0.3
          }
          displayPositions.set(player.id, { x: displayX, y: displayY })
        }
        
        // Desenha a gelatina
        const radius = PLAYER_SIZE / 2
        
        // Sombra embaixo da gelatina
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.beginPath()
        ctx.ellipse(displayX, displayY + radius - 2, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2)
        ctx.fill()
        
        // Corpo principal da gelatina (formato de gota/blob)
        ctx.save()
        ctx.globalAlpha = 0.85 // Translucidez
        ctx.fillStyle = player.color
        ctx.beginPath()
        
        // Desenha forma de gelatina usando curvas bezier
        const top = displayY - radius * 0.9
        const bottom = displayY + radius * 0.9
        const left = displayX - radius * 0.9
        const right = displayX + radius * 0.9
        
        // Forma arredondada tipo gelatina
        ctx.moveTo(displayX, top)
        ctx.bezierCurveTo(right, top, right, displayY, right, bottom - 5)
        ctx.bezierCurveTo(right, bottom, displayX + 5, bottom, displayX, bottom)
        ctx.bezierCurveTo(displayX - 5, bottom, left, bottom, left, bottom - 5)
        ctx.bezierCurveTo(left, displayY, left, top, displayX, top)
        
        ctx.fill()
        
        // Brilho/reflexo da gelatina (parte clara)
        ctx.globalAlpha = 0.4
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.ellipse(displayX - radius * 0.3, displayY - radius * 0.4, radius * 0.35, radius * 0.5, -0.3, 0, Math.PI * 2)
        ctx.fill()
        
        // Brilho pequeno adicional
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(displayX - radius * 0.15, displayY - radius * 0.2, radius * 0.15, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
        
        // Contorno para jogador local (mais grosso e visível)
        if (player.id === myPlayer?.id) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(displayX, top)
          ctx.bezierCurveTo(right, top, right, displayY, right, bottom - 5)
          ctx.bezierCurveTo(right, bottom, displayX + 5, bottom, displayX, bottom)
          ctx.bezierCurveTo(displayX - 5, bottom, left, bottom, left, bottom - 5)
          ctx.bezierCurveTo(left, displayY, left, top, displayX, top)
          ctx.stroke()
        }

        // === CUSTOMIZAÇÃO: Desenha chapéu/skin acima do jogador ===
        if (player.hat && player.hat !== 'none' && hatImages[player.hat]) {
          const hatImg = hatImages[player.hat]
          // Só desenha se a imagem foi carregada com sucesso
          if (hatImg.complete && hatImg.naturalWidth > 0) {
            const hatSize = 35
            // Offset específico: wizard mais próximo, resto padrão
            const hatOffset = (player.hat === 'wizard') ? 14 : 18
            ctx.drawImage(
              hatImg,
              displayX - hatSize / 2,
              displayY - PLAYER_SIZE / 2 - hatSize + hatOffset,
              hatSize,
              hatSize
            )
          }
        }

        // Nome do jogador
        if (player.name) {
          ctx.fillStyle = '#333'
          ctx.font = 'bold 14px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(player.name, displayX, displayY + PLAYER_SIZE / 2 + 5)
        }

        // Mensagem do chat (usando mensagens locais para evitar tocar no estado global)
        const chatEntry = chatMessagesRef.current.get(player.id)
        if (chatEntry && (now - chatEntry.timestamp < MESSAGE_DURATION)) {
          const msg = chatEntry.message
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
          ctx.font = '12px Arial'
          const textWidth = ctx.measureText(msg).width
          const padding = 8
          const bubbleWidth = textWidth + padding * 2
          const bubbleHeight = 24
          const bubbleX = displayX - bubbleWidth / 2
          const bubbleY = displayY - PLAYER_SIZE / 2 - bubbleHeight - 10

          ctx.beginPath()
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 12)
          } else {
            // Fallback simples para navegadores sem roundRect
            ctx.rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight)
          }
          ctx.fill()
          ctx.strokeStyle = '#ddd'
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.fillStyle = '#333'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(msg, displayX, bubbleY + bubbleHeight / 2)
        }
      })

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [players, myPlayer, currentRoom]) // === SALAS: Adiciona currentRoom às dependências ===

  return (
    <>
      <canvas 
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        style={{
          display: 'block',
          background: '#ffffff',
          cursor: 'crosshair',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none'
        }}
      />
      {/* Expõe handleHatChange para uso externo */}
      {typeof window !== 'undefined' && (window.__handleHatChange = handleHatChange, null)}
    </>
  )
}
