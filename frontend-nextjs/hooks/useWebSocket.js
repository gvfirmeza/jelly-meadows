import { useEffect, useRef, useState } from 'react'

export default function useWebSocket({ onInit, onPlayers, onPlayerJoined, onPlayerMoved, onChat, onPlayerLeft, onPlayerUpdated, onRoomChanged }) {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const hasConnectedRef = useRef(false)
  const pingIntervalRef = useRef(null) // === KEEPALIVE: Interval para ping ===

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
        
        // === KEEPALIVE: Envia ping a cada 30 segundos ===
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
            console.log('🏓 Ping enviado')
          }
        }, 30000) // 30 segundos
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
            case 'playerUpdated':
              // === CUSTOMIZAÇÃO: Evento de atualização de player (chapéu, etc) ===
              if (onPlayerUpdated) {
                onPlayerUpdated(data)
              }
              break
            case 'roomChanged':
              // === SALAS: Novo evento para mudança de sala ===
              if (onRoomChanged) {
                onRoomChanged(data)
              }
              break
            case 'pong':
              // === KEEPALIVE: Resposta do servidor ao ping ===
              console.log('🏓 Pong recebido')
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
        
        // === KEEPALIVE: Limpa interval do ping ===
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
        }
        
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
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
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
