import { useEffect, useRef, useCallback } from 'react'
import useWebSocket from '../hooks/useWebSocket'
import useGameState from '../hooks/useGameState'

const PLAYER_SIZE = 40
const MOVE_SPEED = 5
const MESSAGE_DURATION = 3000

export default function GameCanvas({ onConnected, onPlayerNameChange, onPlayerCountChange, onPlayerColorChange }) {
  const canvasRef = useRef(null)
  const keysRef = useRef({})
  const animationRef = useRef(null)
  const hasInitializedRef = useRef(false)
  
  const {
    myPlayer,
    players,
    initPlayer,
    updatePlayers,
    addPlayer,
    movePlayer,
    addChatMessage,
    removePlayer,
    setMyPlayerPosition
  } = useGameState()

  const { connected, sendMessage } = useWebSocket({
    onInit: (data) => {
      // Previne múltiplas inicializações
      if (hasInitializedRef.current) return
      hasInitializedRef.current = true
      
      const name = prompt('👤 Digite seu nome:') || 'Jogador'
      initPlayer(data.id, data.x, data.y, data.color, name)
      onPlayerNameChange(name)
      onPlayerColorChange(data.color)
      onConnected(true)
      sendMessage({ type: 'join', name })
    },
    onPlayers: (data) => {
      updatePlayers(data.players)
      onPlayerCountChange(data.players.length + 1)
    },
    onPlayerJoined: (data) => {
      addPlayer(data.player)
      onPlayerCountChange(prev => prev + 1)
    },
    onPlayerMoved: (data) => {
      movePlayer(data.id, data.x, data.y)
    },
    onChat: (data) => {
      addChatMessage(data.id, data.message, data.timestamp)
    },
    onPlayerLeft: (data) => {
      removePlayer(data.id)
      onPlayerCountChange(prev => prev - 1)
    }
  })

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

  // Movimento do jogador
  useEffect(() => {
    if (!myPlayer || !connected) return

    const handleMovement = () => {
      const keys = keysRef.current
      let moved = false
      let newX = myPlayer.x
      let newY = myPlayer.y

      if (keys['w'] || keys['W'] || keys['ArrowUp']) {
        newY = Math.max(PLAYER_SIZE / 2, newY - MOVE_SPEED)
        moved = true
      }
      if (keys['s'] || keys['S'] || keys['ArrowDown']) {
        newY = Math.min(600 - PLAYER_SIZE / 2, newY + MOVE_SPEED)
        moved = true
      }
      if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
        newX = Math.max(PLAYER_SIZE / 2, newX - MOVE_SPEED)
        moved = true
      }
      if (keys['d'] || keys['D'] || keys['ArrowRight']) {
        newX = Math.min(800 - PLAYER_SIZE / 2, newX + MOVE_SPEED)
        moved = true
      }

      if (moved && (newX !== myPlayer.x || newY !== myPlayer.y)) {
        setMyPlayerPosition(newX, newY)
        sendMessage({ type: 'move', x: newX, y: newY })
      }
    }

    const interval = setInterval(handleMovement, 1000 / 60)
    return () => clearInterval(interval)
  }, [myPlayer, connected, sendMessage, setMyPlayerPosition])

  // Renderização
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const now = Date.now()

      players.forEach(player => {
        // Desenha o quadrado do jogador
        ctx.fillStyle = player.color
        ctx.fillRect(
          player.x - PLAYER_SIZE / 2,
          player.y - PLAYER_SIZE / 2,
          PLAYER_SIZE,
          PLAYER_SIZE
        )

        // Borda para jogador local
        if (player.id === myPlayer?.id) {
          ctx.strokeStyle = '#333'
          ctx.lineWidth = 3
          ctx.strokeRect(
            player.x - PLAYER_SIZE / 2,
            player.y - PLAYER_SIZE / 2,
            PLAYER_SIZE,
            PLAYER_SIZE
          )
        }

        // Nome do jogador
        if (player.name) {
          ctx.fillStyle = '#333'
          ctx.font = 'bold 14px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(player.name, player.x, player.y + PLAYER_SIZE / 2 + 5)
        }

        // Mensagem do chat
        if (player.message && (now - player.messageTime < MESSAGE_DURATION)) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
          ctx.font = '12px Arial'
          const textWidth = ctx.measureText(player.message).width
          const padding = 8
          const bubbleWidth = textWidth + padding * 2
          const bubbleHeight = 24
          const bubbleX = player.x - bubbleWidth / 2
          const bubbleY = player.y - PLAYER_SIZE / 2 - bubbleHeight - 10

          ctx.beginPath()
          ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 12)
          ctx.fill()
          ctx.strokeStyle = '#ddd'
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.fillStyle = '#333'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(player.message, player.x, bubbleY + bubbleHeight / 2)
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

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true
      
      // Previne scroll das setas
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
    }

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        display: 'block',
        background: '#ffffff',
        cursor: 'default'
      }}
    />
  )
}
