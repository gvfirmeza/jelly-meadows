import { useState, useEffect } from 'react';
import styles from '../styles/MinigameFishing.module.css';

export default function MinigameFishing({ economy }) {
  const [gameState, setGameState] = useState('idle'); // idle, waiting, bite, caught, missed
  const [message, setMessage] = useState('Pronto para pescar?');

  const startFishing = () => {
    setGameState('waiting');
    setMessage('Aguardando o peixe...');
    
    // Random wait time between 2 and 5 seconds
    const waitTime = Math.floor(Math.random() * 3000) + 2000;
    setTimeout(() => {
      setGameState(prev => {
        if (prev !== 'waiting') return prev; // If pulled early, ignore
        setMessage('O PEIXE MORDEU! PUXE!');
        
        // Player has 1.5 seconds to pull
        setTimeout(() => {
          setGameState(innerPrev => {
            if (innerPrev === 'bite') {
              setMessage('O peixe escapou!');
              return 'missed';
            }
            return innerPrev;
          });
        }, 1500);

        return 'bite';
      });
    }, waitTime);
  };

  const pullRod = () => {
    if (gameState === 'bite') {
      const reward = Math.floor(Math.random() * 20) + 10; // 10 to 30 coins
      economy.addCoins(reward);
      setGameState('caught');
      setMessage(`Você pescou um peixe! Ganhou 🪙 ${reward} JellyCoins!`);
    } else if (gameState === 'waiting') {
      setGameState('missed');
      setMessage('Você puxou muito cedo e espantou o peixe!');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>🎣 Pescaria</h3>
        <span className={styles.coins}>🪙 {economy?.coins}</span>
      </div>
      
      <div className={styles.gameArea}>
        <div className={styles.water}>
          {gameState === 'idle' && <span className={styles.fishIcon}>🐟</span>}
          {gameState === 'waiting' && <span className={styles.bobber}>🪝</span>}
          {gameState === 'bite' && <span className={styles.biteAlert}>❗🐟❗</span>}
          {gameState === 'caught' && <span className={styles.fishCaught}>🐠✨</span>}
          {gameState === 'missed' && <span className={styles.splash}>💦</span>}
        </div>
      </div>

      <div className={styles.statusPanel}>
        <p className={styles.message}>{message}</p>
        
        {gameState === 'idle' || gameState === 'caught' || gameState === 'missed' ? (
          <button className={styles.actionButton} onClick={startFishing}>
            Lançar Isca
          </button>
        ) : (
          <button className={`${styles.actionButton} ${gameState === 'bite' ? styles.pullHighlight : ''}`} onClick={pullRod}>
            PUXAR!
          </button>
        )}
      </div>
    </div>
  )
}
