import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/MinigameLumberjack.module.css';

export default function MinigameLumberjack({ economy }) {
  const [gameState, setGameState] = useState('idle'); // idle, playing, gameover
  const [playerSide, setPlayerSide] = useState('left');
  const [tree, setTree] = useState([]);
  const [score, setScore] = useState(0);

  const generateTree = () => {
    const newTree = ['none', 'none']; // Bottom two are safe
    for (let i = 0; i < 6; i++) {
      const r = Math.random();
      if (r < 0.3) newTree.push('left');
      else if (r < 0.6) newTree.push('right');
      else newTree.push('none');
    }
    return newTree; // index 0 is bottom
  };

  const startGame = () => {
    setTree(generateTree());
    setPlayerSide('left');
    setScore(0);
    setGameState('playing');
  };

  const chop = useCallback((side) => {
    if (gameState !== 'playing') return;

    setPlayerSide(side);
    
    const newTree = [...tree];
    newTree.shift(); // remove bottom block
    
    // Add new block at top
    const r = Math.random();
    const lastBlock = newTree[newTree.length - 1];
    if (lastBlock !== 'none') {
      newTree.push('none'); // ensure no impossible sequences
    } else {
      if (r < 0.4) newTree.push('left');
      else if (r < 0.8) newTree.push('right');
      else newTree.push('none');
    }

    setTree(newTree);
    
    // Check collision with the new bottom block
    const newBottom = newTree[0];
    if (newBottom === side) {
      // GAME OVER
      setGameState('gameover');
    } else {
      // SUCCESS
      setScore(s => s + 1);
      economy.addCoins(1); // 1 coin per chop
    }
  }, [gameState, tree, economy]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') chop('left');
      if (e.key === 'ArrowRight') chop('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chop]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>🪓 Lenhador</h3>
        <span className={styles.coins}>🪙 {economy?.coins}</span>
      </div>

      <div className={styles.gameArea}>
        {gameState === 'idle' ? (
          <div className={styles.overlay}>
            <button className={styles.actionButton} onClick={startGame}>COMEÇAR</button>
            <p className={styles.helpText}>Use as setas ⬅️ ➡️ ou os botões para cortar!</p>
          </div>
        ) : gameState === 'gameover' ? (
          <div className={styles.overlay}>
            <h2 className={styles.gameOverText}>Bateu a cabeça! 😵</h2>
            <p className={styles.scoreText}>Você cortou {score} pedaços.</p>
            <button className={styles.actionButton} onClick={startGame}>JOGAR NOVAMENTE</button>
          </div>
        ) : (
          <div className={styles.playArea}>
            <div className={styles.treeContainer}>
              {tree.slice().reverse().map((branch, index) => (
                <div key={index} className={styles.treeBlock}>
                  <div className={styles.branchZoneLeft}>
                    {branch === 'left' && <span className={styles.branchLeft}>🌿</span>}
                  </div>
                  <span className={styles.trunk}>🪵</span>
                  <div className={styles.branchZoneRight}>
                    {branch === 'right' && <span className={styles.branchRight}>🌿</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.playerContainer}>
              <div className={`${styles.player} ${playerSide === 'left' ? styles.playerLeft : styles.playerRight}`}>
                🪓👨‍🌾
              </div>
            </div>
          </div>
        )}
      </div>

      {gameState === 'playing' && (
        <div className={styles.controls}>
          <button className={styles.controlButton} onClick={() => chop('left')}>⬅️ ESQ</button>
          <button className={styles.controlButton} onClick={() => chop('right')}>DIR ➡️</button>
        </div>
      )}
    </div>
  )
}
