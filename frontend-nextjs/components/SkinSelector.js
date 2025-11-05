import { useState } from 'react'
import styles from '../styles/SkinSelector.module.css'
import Image from 'next/image'

const AVAILABLE_HATS = [
  { id: 'none', name: 'Sem chapéu', image: null },
  { id: 'cap', name: 'Boné', image: '/hats/cap.png' },
  { id: 'sunhat', name: 'Chapéu de Palha', image: '/hats/hat.png' },
  { id: 'party', name: 'Sombrero', image: '/hats/mexican-hat.png' },
  { id: 'graduate', name: 'Chapéu de Praia', image: '/hats/pamela-hat.png' },
  { id: 'wizard', name: 'Mago', image: '/hats/wizard-hat.png' },
  { id: 'viking', name: 'Cowboy', image: '/hats/cowboy-hat.png' }
]

function HatButton({ hat, isSelected, onClick }) {
  return (
    <button className={`${styles.hatButton} ${isSelected ? styles.hatButtonSelected : ''}`} onClick={onClick} title={hat.name}>
      {hat.image ? <Image src={hat.image} alt={hat.name} width={40} height={40} className={styles.hatImage} /> : <span className={styles.noHat}>🚫</span>}
      <span className={styles.hatName}>{hat.name}</span>
    </button>
  )
}

export default function SkinSelector({ currentHat, onSelectHat }) {
  const [isOpen, setIsOpen] = useState(false)
  const currentHatData = AVAILABLE_HATS.find(h => h.id === currentHat)

  return (
    <div className={styles.container}>
      <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)} title="Trocar chapéu">
        {currentHatData && currentHatData.image ? <Image src={currentHatData.image} alt={currentHatData.name} width={30} height={30} className={styles.toggleImage} /> : <span className={styles.toggleIcon}>🎨</span>}
      </button>
      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            <h3>Escolha um chapéu</h3>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}></button>
          </div>
          <div className={styles.hatGrid}>
            {AVAILABLE_HATS.map((hat) => <HatButton key={hat.id} hat={hat} isSelected={currentHat === hat.id} onClick={() => { onSelectHat(hat.id); setIsOpen(false) }} />)}
          </div>
        </div>
      )}
    </div>
  )
}
