import { useEffect, useRef, useState } from 'react'

export default function useWebSocket({ onInit, onPlayers, onPlayerJoined, onPlayerMoved, onChat, onPlayerLeft }) {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const hasConnectedRef = useRef(false)

  useEffect(() => {
    // Previne múltiplas conexões (React Strict Mode)
    if (hasConnectedRef.current) return

    const connect = () => {
      // Pega URL do WebSocket da variável de ambiente
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
      
      console.log('🔌 Conectando ao WebSocket:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ Conectado ao servidor')
        setConnected(true)
        hasConnectedRef.current = true
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'init':
              onInit(data)
              break
            case 'players':
              onPlayers(data)
              break
            case 'playerJoined':
              onPlayerJoined(data)
              break
            case 'playerMoved':
              onPlayerMoved(data)
              break
            case 'chat':
              onChat(data)
              break
            case 'playerLeft':
              onPlayerLeft(data)
              break
          }
        } catch (err) {
          console.error('❌ Erro ao processar mensagem:', err)
        }
      }

      ws.onclose = () => {
        console.log('❌ Desconectado do servidor')
        setConnected(false)
        hasConnectedRef.current = false
        
        // Tenta reconectar após 3 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Tentando reconectar...')
          connect()
        }, 3000)
      }

      ws.onerror = (err) => {
        console.error('❌ Erro WebSocket:', err)
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      hasConnectedRef.current = false
    }
  }, [])

  const sendMessage = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }

  return { connected, sendMessage }
}
