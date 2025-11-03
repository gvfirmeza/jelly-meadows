import { useState } from 'react'
import styles from '../styles/SkinSelector.module.css'

// Mesma lista de chapéus do Lobby
const AVAILABLE_HATS = [
  { id: 'none', name: 'Sem chapéu', emoji: '' },
  { id: 'crown', name: '👑 Coroa', emoji: '👑' },
  { id: 'tophat', name: '🎩 Cartola', emoji: '🎩' },
  { id: 'cowboy', name: '🤠 Cowboy', emoji: '🤠' },
  { id: 'santa', name: '🎅 Papai Noel', emoji: '🎅' },
  { id: 'wizard', name: '🧙 Mago', emoji: '🧙' },
  { id: 'ninja', name: '🥷 Ninja', emoji: '🥷' },
  { id: 'pirate', name: '🏴‍☠️ Pirata', emoji: '🏴‍☠️' },
]

export default function SkinSelector({ currentHat, onSelectHat }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectHat = (hatId) => {
    onSelectHat(hatId)
    setIsOpen(false)
  }

  return (
    <div className={styles.container}>
      {/* Botão de Toggle */}
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Trocar chapéu"
      >
        {currentHat !== 'none' ? (
          <span className={styles.currentHat}>
            {AVAILABLE_HATS.find(h => h.id === currentHat)?.emoji}
          </span>
        ) : (
          '🎨'
        )}
      </button>

      {/* Menu de Seleção */}
      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            <h3>Escolha um chapéu</h3>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className={styles.hatGrid}>
            {AVAILABLE_HATS.map((hat) => (
              <button
                key={hat.id}
                className={`${styles.hatButton} ${
                  currentHat === hat.id ? styles.hatButtonSelected : ''
                }`}
                onClick={() => handleSelectHat(hat.id)}
                title={hat.name}
              >
                {hat.emoji ? (
                  <span className={styles.hatEmoji}>{hat.emoji}</span>
                ) : (
                  <span className={styles.noHat}>✕</span>
                )}
                <span className={styles.hatName}>{hat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
