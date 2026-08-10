import { useState } from 'react'
import styles from '../styles/SkinSelector.module.css'
import Image from 'next/image'
import { AVAILABLE_HATS } from '../utils/items'

function HatButton({ hat, isSelected, onClick }) {
  return (
    <button className={`${styles.hatButton} ${isSelected ? styles.hatButtonSelected : ''}`} onClick={onClick} title={hat.name}>
      {hat.image ? <Image src={hat.image} alt={hat.name} width={40} height={40} className={styles.hatImage} /> : <span className={styles.noHat}>🚫</span>}
      <span className={styles.hatName}>{hat.name}</span>
    </button>
  )
}

export default function SkinSelector({ currentHat, onSelectHat, economy }) {
  const [isOpen, setIsOpen] = useState(false)
  const currentHatData = AVAILABLE_HATS.find(h => h.id === currentHat)
  
  // Filter only owned hats
  const ownedHatsData = AVAILABLE_HATS.filter(h => economy?.ownedHats.includes(h.id))

  return (
    <div className={styles.container}>
      <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)} title="Inventário">
        {currentHatData && currentHatData.image ? <Image src={currentHatData.image} alt={currentHatData.name} width={30} height={30} className={styles.toggleImage} /> : <span className={styles.toggleIcon}>🎒</span>}
      </button>
      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            <h3>Inventário</h3>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>X</button>
          </div>
          <div className={styles.hatGrid}>
            {ownedHatsData.map((hat) => <HatButton key={hat.id} hat={hat} isSelected={currentHat === hat.id} onClick={() => { onSelectHat(hat.id); setIsOpen(false) }} />)}
          </div>
        </div>
      )}
    </div>
  )
}

