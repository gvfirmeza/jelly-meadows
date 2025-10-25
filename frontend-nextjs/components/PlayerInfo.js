import styles from '../styles/PlayerInfo.module.css'

export default function PlayerInfo({ playerName, playerCount, playerColor }) {
  return (
    <div className={styles.info}>
      <span style={{ color: playerColor }}>●</span> Jogador: <strong>{playerName}</strong> | 
      🎨 Jogadores online: <strong>{playerCount}</strong>
    </div>
  )
}
