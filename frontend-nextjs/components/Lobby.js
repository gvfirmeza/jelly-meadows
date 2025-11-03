import { useState } from 'react'
import styles from '../styles/Lobby.module.css'

// Paleta de cores disponíveis para customização
const AVAILABLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#AAB7B8',
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'
]

// Skins/chapéus disponíveis
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

export default function Lobby({ onJoinGame }) {
  const [playerName, setPlayerName] = useState('')
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0])
  const [selectedHat, setSelectedHat] = useState('none')
  const [error, setError] = useState('')

  const handleJoin = () => {
    // Validação do nome
    if (!playerName.trim()) {
      setError('Por favor, digite um nome!')
      return
    }

    if (playerName.trim().length < 2) {
      setError('Nome muito curto! (mínimo 2 caracteres)')
      return
    }

    if (playerName.trim().length > 15) {
      setError('Nome muito longo! (máximo 15 caracteres)')
      return
    }

    // Envia as customizações para o componente pai
    onJoinGame({
      name: playerName.trim(),
      color: selectedColor,
      hat: selectedHat
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin()
    }
  }

  return (
    <div className={styles.lobbyContainer}>
      <div className={styles.lobbyCard}>
        <h1 className={styles.title}>🎮 Jelly Meadows</h1>
        <p className={styles.subtitle}>Customize seu personagem!</p>

        {/* Input de Nome */}
        <div className={styles.section}>
          <label className={styles.label}>Nome do Jogador</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Digite seu nome..."
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value)
              setError('')
            }}
            onKeyPress={handleKeyPress}
            maxLength={15}
            autoFocus
          />
        </div>

        {/* Seletor de Cor */}
        <div className={styles.section}>
          <label className={styles.label}>Cor do Personagem</label>
          <div className={styles.colorGrid}>
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color}
                className={`${styles.colorButton} ${
                  selectedColor === color ? styles.colorButtonSelected : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Seletor de Chapéu */}
        <div className={styles.section}>
          <label className={styles.label}>Chapéu / Skin</label>
          <div className={styles.hatGrid}>
            {AVAILABLE_HATS.map((hat) => (
              <button
                key={hat.id}
                className={`${styles.hatButton} ${
                  selectedHat === hat.id ? styles.hatButtonSelected : ''
                }`}
                onClick={() => setSelectedHat(hat.id)}
                title={hat.name}
              >
                {hat.emoji ? (
                  <span className={styles.hatEmoji}>{hat.emoji}</span>
                ) : (
                  <span className={styles.noHat}>✕</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview do Personagem */}
        <div className={styles.section}>
          <label className={styles.label}>Preview</label>
          <div className={styles.preview}>
            <div
              className={styles.previewPlayer}
              style={{ backgroundColor: selectedColor }}
            >
              {selectedHat !== 'none' && (
                <span className={styles.previewHat}>
                  {AVAILABLE_HATS.find(h => h.id === selectedHat)?.emoji}
                </span>
              )}
            </div>
            <p className={styles.previewName}>
              {playerName || 'Seu Nome'}
            </p>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Botão de Entrar */}
        <button className={styles.joinButton} onClick={handleJoin}>
          🚀 Entrar no Jogo
        </button>
      </div>
    </div>
  )
}
