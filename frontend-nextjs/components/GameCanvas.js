import { useEffect, useRef, useCallback } from 'react'
import useWebSocket from '../hooks/useWebSocket'
import useGameState from '../hooks/useGameState'

const PLAYER_SIZE = 40
const MOVE_SPEED = 200 // pixels por segundo
const MESSAGE_DURATION = 3000
const INTERPOLATION_SPEED = 0.15 // Suavização do movimento (0-1, maior = mais rápido)

export default function GameCanvas({ 
  onConnected, 
  onPlayerNameChange, 
  onPlayerCountChange, 
  onPlayerColorChange,
  playerCustomization, // === CUSTOMIZAÇÃO: Recebe dados do lobby ===
  onHatChange // === CUSTOMIZAÇÃO: Callback para mudança de chapéu ===
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const hasInitializedRef = useRef(false)
  const targetPositionRef = useRef(null) // Posição alvo do click
  const lastFrameTimeRef = useRef(Date.now())
  
  const {
    myPlayer,
    players,
    initPlayer,
    updatePlayers,
    addPlayer,
    movePlayer,
    addChatMessage,
    removePlayer,
    setMyPlayerPosition,
    updatePlayerHat // === CUSTOMIZAÇÃO: Função para atualizar chapéu ===
  } = useGameState()

  const { connected, sendMessage } = useWebSocket({
    onInit: (data) => {
      // Previne múltiplas inicializações
      if (hasInitializedRef.current) return
      hasInitializedRef.current = true
      
      // === CUSTOMIZAÇÃO: Usa dados do lobby ao invés de prompt ===
      const { name, color, hat } = playerCustomization
      initPlayer(data.id, data.x, data.y, color, name, hat)
      onPlayerNameChange(name)
      onPlayerColorChange(color)
      onConnected(true)
      
      // Envia customizações completas para o servidor
      sendMessage({ 
        type: 'join', 
        name,
        color, // === CUSTOMIZAÇÃO: Envia cor escolhida ===
        hat    // === CUSTOMIZAÇÃO: Envia chapéu escolhido ===
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
      addChatMessage(data.id, data.message, data.timestamp)
    },
    onPlayerLeft: (data) => {
      removePlayer(data.id)
    },
    // === CUSTOMIZAÇÃO: Handler para atualizações de player ===
    onPlayerUpdated: (data) => {
      if (data.hat !== undefined) {
        updatePlayerHat(data.id, data.hat)
        // Atualiza callback se for o próprio jogador
        if (myPlayer && data.id === myPlayer.id && onHatChange) {
          onHatChange(data.hat)
        }
      }
    }
  })

  // === FIX: Atualiza contador automaticamente baseado no Map de players ===
  useEffect(() => {
    onPlayerCountChange(players.size)
  }, [players, onPlayerCountChange])

  // === CUSTOMIZAÇÃO: Função para trocar chapéu ===
  const handleHatChange = useCallback((newHat) => {
    if (!myPlayer || !connected) return
    
    // Atualiza localmente
    updatePlayerHat(myPlayer.id, newHat)
    
    // Envia para o servidor
    sendMessage({
      type: 'updateHat',
      hat: newHat
    })
    
    // Callback para o componente pai
    if (onHatChange) {
      onHatChange(newHat)
    }
  }, [myPlayer, connected, sendMessage, updatePlayerHat, onHatChange])

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
    
    // Define a posição alvo
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
      
      // Movimento mais rápido e direto (sem interpolação pesada)
      const speed = Math.min(distance * 0.2, 8) // Velocidade adaptativa, max 8px/frame
      const angle = Math.atan2(dy, dx)
      const newX = currentX + Math.cos(angle) * speed
      const newY = currentY + Math.sin(angle) * speed
      
      // Garante que não sai do canvas
      const clampedX = Math.max(PLAYER_SIZE / 2, Math.min(800 - PLAYER_SIZE / 2, newX))
      const clampedY = Math.max(PLAYER_SIZE / 2, Math.min(600 - PLAYER_SIZE / 2, newY))
      
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
  }, [myPlayer, connected, sendMessage, setMyPlayerPosition])

  // Renderização com interpolação suave para outros jogadores
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const displayPositions = new Map() // Posições renderizadas (interpoladas)

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
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
        
        // Desenha o quadrado do jogador
        ctx.fillStyle = player.color
        ctx.fillRect(
          displayX - PLAYER_SIZE / 2,
          displayY - PLAYER_SIZE / 2,
          PLAYER_SIZE,
          PLAYER_SIZE
        )

        // Borda para jogador local
        if (player.id === myPlayer?.id) {
          ctx.strokeStyle = '#333'
          ctx.lineWidth = 3
          ctx.strokeRect(
            displayX - PLAYER_SIZE / 2,
            displayY - PLAYER_SIZE / 2,
            PLAYER_SIZE,
            PLAYER_SIZE
          )
        }

        // === CUSTOMIZAÇÃO: Desenha chapéu/skin acima do jogador ===
        if (player.hat && player.hat !== 'none') {
          // Mapa de emojis dos chapéus
          const hatEmojis = {
            crown: '👑',
            tophat: '🎩',
            cowboy: '🤠',
            santa: '🎅',
            wizard: '🧙',
            ninja: '🥷',
            pirate: '🏴‍☠️'
          }
          
          const hatEmoji = hatEmojis[player.hat]
          if (hatEmoji) {
            ctx.font = '32px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            // Desenha o emoji acima do quadrado
            ctx.fillText(hatEmoji, displayX, displayY - PLAYER_SIZE / 2 - 5)
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

        // Mensagem do chat
        if (player.message && (now - player.messageTime < MESSAGE_DURATION)) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
          ctx.font = '12px Arial'
          const textWidth = ctx.measureText(player.message).width
          const padding = 8
          const bubbleWidth = textWidth + padding * 2
          const bubbleHeight = 24
          const bubbleX = displayX - bubbleWidth / 2
          const bubbleY = displayY - PLAYER_SIZE / 2 - bubbleHeight - 10

          ctx.beginPath()
          ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 12)
          ctx.fill()
          ctx.strokeStyle = '#ddd'
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.fillStyle = '#333'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(player.message, displayX, bubbleY + bubbleHeight / 2)
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
  }, [players, myPlayer])

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
