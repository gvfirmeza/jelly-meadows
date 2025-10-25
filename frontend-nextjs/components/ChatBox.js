import { useState } from 'react'
import styles from '../styles/ChatBox.module.css'

export default function ChatBox({ connected }) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && connected && typeof window.sendGameChatMessage === 'function') {
      window.sendGameChatMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <div className={styles.chatContainer}>
      <input
        type="text"
        className={styles.chatInput}
        placeholder="Digite uma mensagem e pressione Enter..."
        maxLength={100}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={!connected}
      />
      <button 
        className={styles.sendButton}
        onClick={handleSend}
        disabled={!connected}
      >
        Enviar
      </button>
    </div>
  )
}
