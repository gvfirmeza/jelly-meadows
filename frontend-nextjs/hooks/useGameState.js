import { useState, useCallback, useRef, useEffect } from 'react'

export default function useGameState() {
  const [myPlayer, setMyPlayer] = useState(null)
  const [players, setPlayers] = useState(new Map())
  
  // === FIX: useRef para sempre ter o valor atualizado (evita stale closure) ===
  const myPlayerRef = useRef(null)
  
  // Mantém o ref sincronizado com o state
  useEffect(() => {
    myPlayerRef.current = myPlayer
  }, [myPlayer])

  const initPlayer = useCallback((id, x, y, color, name) => {
    const player = {
      id,
      x,
      y,
      color,
      name,
      message: '',
      messageTime: 0
    }
    setMyPlayer(player)
    setPlayers(prev => new Map(prev).set(id, player))
  }, [])

  const updatePlayers = useCallback((playerList) => {
    setPlayers(prev => {
      const newPlayers = new Map(prev)
      playerList.forEach(player => {
        if (!newPlayers.has(player.id)) {
          newPlayers.set(player.id, {
            ...player,
            message: '',
            messageTime: 0
          })
        }
      })
      return newPlayers
    })
  }, [])

  const addPlayer = useCallback((player) => {
    setPlayers(prev => {
      const newPlayers = new Map(prev)
      newPlayers.set(player.id, {
        ...player,
        message: '',
        messageTime: 0
      })
      return newPlayers
    })
  }, [])

  const movePlayer = useCallback((id, x, y) => {
    // === FIX: Usa ref ao invés do state (evita stale closure) ===
    const currentMyPlayer = myPlayerRef.current
    
    // Não atualiza a posição do próprio jogador (client-side prediction)
    // Isso previne glitches/rollbacks causados por latência de rede
    if (currentMyPlayer && id === currentMyPlayer.id) {
      return
    }
    
    setPlayers(prev => {
      const player = prev.get(id)
      if (player) {
        const newPlayers = new Map(prev)
        newPlayers.set(id, { ...player, x, y })
        return newPlayers
      }
      return prev
    })
  }, []) // <= Removido myPlayer das dependências!

  const addChatMessage = useCallback((id, message, timestamp) => {
    setPlayers(prev => {
      const player = prev.get(id)
      if (player) {
        const newPlayers = new Map(prev)
        newPlayers.set(id, { ...player, message, messageTime: timestamp })
        return newPlayers
      }
      return prev
    })
  }, [])

  const removePlayer = useCallback((id) => {
    setPlayers(prev => {
      const newPlayers = new Map(prev)
      newPlayers.delete(id)
      return newPlayers
    })
  }, [])

  const setMyPlayerPosition = useCallback((x, y) => {
    const currentMyPlayer = myPlayerRef.current
    
    setMyPlayer(prev => prev ? { ...prev, x, y } : null)
    setPlayers(prev => {
      if (!currentMyPlayer) return prev
      const newPlayers = new Map(prev)
      const player = newPlayers.get(currentMyPlayer.id)
      if (player) {
        newPlayers.set(currentMyPlayer.id, { ...player, x, y })
      }
      return newPlayers
    })
  }, [])

  return {
    myPlayer,
    players,
    initPlayer,
    updatePlayers,
    addPlayer,
    movePlayer,
    addChatMessage,
    removePlayer,
    setMyPlayerPosition
  }
}
