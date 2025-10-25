import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import GameCanvas from '../components/GameCanvas'
import ChatBox from '../components/ChatBox'
import PlayerInfo from '../components/PlayerInfo'
import Controls from '../components/Controls'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [playerName, setPlayerName] = useState('Carregando...')
  const [playerCount, setPlayerCount] = useState(0)
  const [playerColor, setPlayerColor] = useState('#4ECDC4')

  return (
    <>
      <Head>
        <title>Jelly Meadows</title>
        <meta name="description" content="Jelly Meadows" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.gameContainer}>
          <GameCanvas 
            onConnected={setConnected}
            onPlayerNameChange={setPlayerName}
            onPlayerCountChange={setPlayerCount}
            onPlayerColorChange={setPlayerColor}
          />
          
          <PlayerInfo 
            playerName={playerName} 
            playerCount={playerCount}
            playerColor={playerColor}
          />
          
          <Controls />
          
          <ChatBox connected={connected} />
        </div>

        {!connected && (
          <div className={styles.connecting}>
            <div className={styles.spinner}></div>
            <p>Conectando ao servidor...</p>
          </div>
        )}
      </main>
    </>
  )
}
