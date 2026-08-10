import { AVAILABLE_HATS } from '../utils/items'
import styles from '../styles/StoreCatalog.module.css'
import Image from 'next/image'

export default function StoreCatalog({ economy }) {
  if (!economy) return null;

  return (
    <div className={styles.storeContainer}>
      <div className={styles.storeHeader}>
        <h2>Loja de Roupas</h2>
        <div className={styles.coinBalance}>
          🪙 {economy.coins} JellyCoins
        </div>
      </div>
      <div className={styles.catalogGrid}>
        {AVAILABLE_HATS.map(hat => {
          if (hat.id === 'none') return null;
          
          const isOwned = economy.ownedHats.includes(hat.id);
          const canAfford = economy.coins >= hat.price;

          return (
            <div key={hat.id} className={styles.catalogItem}>
              <div className={styles.itemImage}>
                {hat.image ? <Image src={hat.image} alt={hat.name} width={50} height={50} /> : <span>🚫</span>}
              </div>
              <p className={styles.itemName}>{hat.name}</p>
              
              {isOwned ? (
                <button className={styles.buyButtonOwned} disabled>Adquirido</button>
              ) : (
                <button 
                  className={`${styles.buyButton} ${!canAfford ? styles.buyButtonDisabled : ''}`}
                  disabled={!canAfford}
                  onClick={() => economy.buyHat(hat.id, hat.price)}
                >
                  🪙 {hat.price}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
