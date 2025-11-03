import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import GameCanvas from '../components/GameCanvas'
import ChatBox from '../components/ChatBox'
import PlayerInfo from '../components/PlayerInfo'
import Controls from '../components/Controls'
import Lobby from '../components/Lobby' // === CUSTOMIZAÇÃO: Novo componente ===
import SkinSelector from '../components/SkinSelector' // === CUSTOMIZAÇÃO: Seletor de skins ===
import styles from '../styles/Home.module.css'

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [playerName, setPlayerName] = useState('Carregando...')
  const [playerCount, setPlayerCount] = useState(0)
  const [playerColor, setPlayerColor] = useState('#4ECDC4')
  const [playerHat, setPlayerHat] = useState('none') // === CUSTOMIZAÇÃO: Estado do chapéu ===
  const [inLobby, setInLobby] = useState(true) // === CUSTOMIZAÇÃO: Estado do lobby ===
  const [playerCustomization, setPlayerCustomization] = useState(null) // === CUSTOMIZAÇÃO: Dados do lobby ===

  // === CUSTOMIZAÇÃO: Handler para quando jogador entra no jogo ===
  const handleJoinGame = (customization) => {
    setPlayerCustomization(customization)
    setPlayerName(customization.name)
    setPlayerColor(customization.color)
    setPlayerHat(customization.hat)
    setInLobby(false)
  }

  // === CUSTOMIZAÇÃO: Handler para trocar chapéu in-game ===
  const handleHatChange = (newHat) => {
    setPlayerHat(newHat)
    // Chama a função global exposta pelo GameCanvas
    if (typeof window !== 'undefined' && window.__handleHatChange) {
      window.__handleHatChange(newHat)
    }
  }

  return (
    <>
      <Head>
        <title>Jelly Meadows</title>
        <meta name="description" content="Jelly Meadows" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* === CUSTOMIZAÇÃO: Mostra lobby antes de entrar no jogo === */}
      {inLobby ? (
        <Lobby onJoinGame={handleJoinGame} />
      ) : (
        <main className={styles.main}>
          <div className={styles.topBar}>
            <PlayerInfo 
              playerName={playerName} 
              playerCount={playerCount}
              playerColor={playerColor}
            />
            <Controls />
          </div>
          
          <div className={styles.gameContainer}>
            <GameCanvas 
              onConnected={setConnected}
              onPlayerNameChange={setPlayerName}
              onPlayerCountChange={setPlayerCount}
              onPlayerColorChange={setPlayerColor}
              playerCustomization={playerCustomization} // === CUSTOMIZAÇÃO: Passa dados ===
              onHatChange={setPlayerHat} // === CUSTOMIZAÇÃO: Callback de chapéu ===
            />
            
            {/* === CUSTOMIZAÇÃO: Seletor de skins in-game === */}
            <div className={styles.skinSelectorContainer}>
              <SkinSelector 
                currentHat={playerHat}
                onSelectHat={handleHatChange}
              />
            </div>
            
            <ChatBox connected={connected} />
          </div>

          {!connected && (
            <div className={styles.connecting}>
              <div className={styles.spinner}></div>
              <p>Conectando ao servidor...</p>
            </div>
          )}
        </main>
      )}
    </>
  )
}
