import { useState, useEffect, useRef } from 'react'
import styles from '../styles/Lobby.module.css'
import Image from 'next/image'

// Paleta de cores disponíveis para customização
const AVAILABLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#AAB7B8',
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'
]

// Skins/chapéus disponíveis com imagens
const AVAILABLE_HATS = [
  { id: 'none', name: 'Sem chapéu', image: null },
  { id: 'cap', name: 'Boné', image: '/hats/cap.png' },
  { id: 'sunhat', name: 'Chapéu de Palha', image: '/hats/hat.png' },
  { id: 'party', name: 'Sombrero', image: '/hats/mexican-hat.png' },
  { id: 'graduate', name: 'Chapéu de Praia', image: '/hats/pamela-hat.png' },
  { id: 'wizard', name: 'Mago', image: '/hats/wizard-hat.png' },
  { id: 'viking', name: 'Cowboy', image: '/hats/cowboy-hat.png' }
]

// Componente para cada botão de chapéu com imagem
function HatButtonLobby({ hat, isSelected, onClick }) {
  return (
    <button
      className={`${styles.hatButton} ${isSelected ? styles.hatButtonSelected : ''}`}
      onClick={onClick}
      title={hat.name}
    >
      {hat.image ? (
        <div className={styles.hatImageWrapper}>
          <Image 
            src={hat.image} 
            alt={hat.name}
            width={50}
            height={50}
            className={styles.hatImage}
          />
        </div>
      ) : (
        <span className={styles.noHat}>🚫</span>
      )}
    </button>
  )
}

export default function Lobby({ onJoinGame }) {
  const [playerName, setPlayerName] = useState('')
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0])
  const [selectedHat, setSelectedHat] = useState('none')
  const [error, setError] = useState('')
  const previewCanvasRef = useRef(null)

  // Desenha o preview do personagem com chapéu
  useEffect(() => {
    const canvas = previewCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const size = 60
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2 + 10

    // Limpa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenha a gelatina (mesmo estilo do jogo)
    const radius = size / 2
    
    // Sombra embaixo da gelatina
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.beginPath()
    ctx.ellipse(centerX, centerY + radius - 2, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Corpo principal da gelatina
    ctx.save()
    ctx.globalAlpha = 0.85
    ctx.fillStyle = selectedColor
    ctx.beginPath()
    
    const top = centerY - radius * 0.9
    const bottom = centerY + radius * 0.9
    const left = centerX - radius * 0.9
    const right = centerX + radius * 0.9
    
    ctx.moveTo(centerX, top)
    ctx.bezierCurveTo(right, top, right, centerY, right, bottom - 5)
    ctx.bezierCurveTo(right, bottom, centerX + 5, bottom, centerX, bottom)
    ctx.bezierCurveTo(centerX - 5, bottom, left, bottom, left, bottom - 5)
    ctx.bezierCurveTo(left, centerY, left, top, centerX, top)
    ctx.fill()
    
    // Brilho/reflexo
    ctx.globalAlpha = 0.4
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.ellipse(centerX - radius * 0.3, centerY - radius * 0.4, radius * 0.35, radius * 0.5, -0.3, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.arc(centerX - radius * 0.15, centerY - radius * 0.2, radius * 0.15, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
    
    // Borda
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(centerX, top)
    ctx.bezierCurveTo(right, top, right, centerY, right, bottom - 5)
    ctx.bezierCurveTo(right, bottom, centerX + 5, bottom, centerX, bottom)
    ctx.bezierCurveTo(centerX - 5, bottom, left, bottom, left, bottom - 5)
    ctx.bezierCurveTo(left, centerY, left, top, centerX, top)
    ctx.stroke()

    // Desenha o chapéu se selecionado (como imagem)
    if (selectedHat && selectedHat !== 'none') {
      const hatData = AVAILABLE_HATS.find(h => h.id === selectedHat)
      if (hatData && hatData.image) {
        const img = new window.Image()
        img.src = hatData.image
        img.onload = () => {
          const hatSize = 45
          // Offset específico: wizard mais próximo, resto padrão
          const hatOffset = (selectedHat === 'wizard') ? 14 : 18
          ctx.drawImage(
            img, 
            centerX - hatSize / 2, 
            top - hatSize + hatOffset, 
            hatSize, 
            hatSize
          )
        }
      }
    }
  }, [selectedColor, selectedHat])

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
      {/* Título grande fora do card */}
      <h1 className={styles.bigTitle}>JELLY MEADOWS</h1>
      
      <div className={styles.lobbyCard}>
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
              <HatButtonLobby
                key={hat.id}
                hat={hat}
                isSelected={selectedHat === hat.id}
                onClick={() => setSelectedHat(hat.id)}
              />
            ))}
          </div>
        </div>

        {/* Preview do Personagem */}
        <div className={styles.section}>
          <label className={styles.label}>Preview</label>
          <div className={styles.preview}>
            <canvas 
              ref={previewCanvasRef}
              width={120}
              height={120}
              className={styles.previewCanvas}
            />
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
