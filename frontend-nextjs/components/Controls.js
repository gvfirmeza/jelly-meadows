import styles from '../styles/Controls.module.css'

export default function Controls() {
  return (
    <div className={styles.controls}>
      <h3>🎮 Controles</h3>
      <p>⬆️ W / ↑ - Mover para cima</p>
      <p>⬇️ S / ↓ - Mover para baixo</p>
      <p>⬅️ A / ← - Mover para esquerda</p>
      <p>➡️ D / → - Mover para direita</p>
    </div>
  )
}
