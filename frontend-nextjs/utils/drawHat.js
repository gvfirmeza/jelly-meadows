// Função para desenhar chapéus customizados no canvas
export function drawHat(ctx, type, x, y, scale = 1) {
  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  switch(type) {
    case 'crown': // Coroa dourada
      ctx.fillStyle = '#FFD700'
      ctx.strokeStyle = '#DAA520'
      ctx.lineWidth = 1.5 * scale
      ctx.beginPath()
      ctx.moveTo(x - 14 * scale, y)
      ctx.lineTo(x - 11 * scale, y - 12 * scale)
      ctx.lineTo(x - 7 * scale, y - 6 * scale)
      ctx.lineTo(x - 3 * scale, y - 14 * scale)
      ctx.lineTo(x, y - 8 * scale)
      ctx.lineTo(x + 3 * scale, y - 14 * scale)
      ctx.lineTo(x + 7 * scale, y - 6 * scale)
      ctx.lineTo(x + 11 * scale, y - 12 * scale)
      ctx.lineTo(x + 14 * scale, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      // Joias
      ctx.fillStyle = '#FF4444'
      ctx.beginPath()
      ctx.arc(x - 3 * scale, y - 12 * scale, 2 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + 3 * scale, y - 12 * scale, 2 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y - 6 * scale, 2 * scale, 0, Math.PI * 2)
      ctx.fill()
      break
      
    case 'tophat': // Cartola preta
      ctx.fillStyle = '#1a1a1a'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1.5 * scale
      // Topo
      ctx.fillRect(x - 9 * scale, y - 22 * scale, 18 * scale, 13 * scale)
      ctx.strokeRect(x - 9 * scale, y - 22 * scale, 18 * scale, 13 * scale)
      // Aba
      ctx.beginPath()
      ctx.ellipse(x, y - 9 * scale, 14 * scale, 3 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      // Faixa
      ctx.fillStyle = '#8B0000'
      ctx.fillRect(x - 9 * scale, y - 11 * scale, 18 * scale, 2.5 * scale)
      break
      
    case 'graduate': // Capelo de formatura
      ctx.fillStyle = '#1a1a5e'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1.2 * scale
      // Base arredondada
      ctx.beginPath()
      ctx.arc(x, y - 9 * scale, 12 * scale, 0, Math.PI, true)
      ctx.fill()
      ctx.stroke()
      // Topo quadrado
      ctx.save()
      ctx.translate(x, y - 17 * scale)
      ctx.rotate(0.1)
      ctx.fillRect(-11 * scale, -1.5 * scale, 22 * scale, 1.5 * scale)
      ctx.strokeRect(-11 * scale, -1.5 * scale, 22 * scale, 1.5 * scale)
      ctx.restore()
      // Fio
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 1.5 * scale
      ctx.beginPath()
      ctx.moveTo(x + 7 * scale, y - 17 * scale)
      ctx.lineTo(x + 7 * scale, y - 14 * scale)
      ctx.stroke()
      // Pompom
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(x + 7 * scale, y - 14 * scale, 2.5 * scale, 0, Math.PI * 2)
      ctx.fill()
      break
      
    case 'cap': // Boné
      ctx.fillStyle = '#E63946'
      ctx.strokeStyle = '#A4161A'
      ctx.lineWidth = 1.5 * scale
      // Parte de trás
      ctx.beginPath()
      ctx.ellipse(x, y - 10 * scale, 11 * scale, 10 * scale, 0, Math.PI, 0)
      ctx.fill()
      ctx.stroke()
      // Aba
      ctx.beginPath()
      ctx.ellipse(x + 7 * scale, y - 6 * scale, 11 * scale, 3 * scale, -0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      // Logo
      ctx.fillStyle = '#FFF'
      ctx.font = `bold ${7 * scale}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('J', x - 1 * scale, y - 9 * scale)
      break
      
    case 'sunhat': // Chapéu de palha
      ctx.fillStyle = '#F5DEB3'
      ctx.strokeStyle = '#D2B48C'
      ctx.lineWidth = 1.5 * scale
      // Aba larga
      ctx.beginPath()
      ctx.ellipse(x, y - 6 * scale, 18 * scale, 5 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      // Topo
      ctx.beginPath()
      ctx.ellipse(x, y - 12 * scale, 9 * scale, 8 * scale, 0, 0, Math.PI, true)
      ctx.fill()
      ctx.stroke()
      // Textura
      ctx.strokeStyle = '#DEB887'
      ctx.lineWidth = 0.8 * scale
      for(let i = -7; i < 7; i += 3) {
        ctx.beginPath()
        ctx.moveTo(x + i * scale, y - 14 * scale)
        ctx.lineTo(x + i * scale, y - 10 * scale)
        ctx.stroke()
      }
      break
      
    case 'wizard': // Chapéu de mago
      ctx.fillStyle = '#4B0082'
      ctx.strokeStyle = '#2F004F'
      ctx.lineWidth = 1.5 * scale
      // Cone curvo
      ctx.beginPath()
      ctx.moveTo(x - 13 * scale, y)
      ctx.quadraticCurveTo(x - 7 * scale, y - 22 * scale, x + 3 * scale, y - 25 * scale)
      ctx.lineTo(x + 5 * scale, y - 25 * scale)
      ctx.lineTo(x + 13 * scale, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      // Estrelas
      ctx.fillStyle = '#FFD700'
      ctx.font = `bold ${9 * scale}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('★', x - 3 * scale, y - 16 * scale)
      ctx.fillText('★', x + 2 * scale, y - 10 * scale)
      // Aba
      ctx.fillStyle = '#4B0082'
      ctx.beginPath()
      ctx.ellipse(x, y, 14 * scale, 3 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      break
      
    case 'santa': // Gorro de Papai Noel
      ctx.fillStyle = '#DC143C'
      ctx.strokeStyle = '#8B0000'
      ctx.lineWidth = 1.5 * scale
      // Gorro
      ctx.beginPath()
      ctx.moveTo(x - 13 * scale, y)
      ctx.quadraticCurveTo(x - 9 * scale, y - 18 * scale, x + 2 * scale, y - 21 * scale)
      ctx.lineTo(x + 13 * scale, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      // Borda branca
      ctx.fillStyle = '#FFF'
      ctx.beginPath()
      ctx.ellipse(x, y, 14 * scale, 2.5 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      // Pompom
      ctx.beginPath()
      ctx.arc(x + 5 * scale, y - 21 * scale, 3.5 * scale, 0, Math.PI * 2)
      ctx.fill()
      break
      
    case 'viking': // Capacete viking
      ctx.fillStyle = '#C0C0C0'
      ctx.strokeStyle = '#808080'
      ctx.lineWidth = 1.5 * scale
      // Capacete
      ctx.beginPath()
      ctx.ellipse(x, y - 9 * scale, 12 * scale, 10 * scale, 0, Math.PI, 0)
      ctx.fill()
      ctx.stroke()
      // Chifres
      ctx.strokeStyle = '#8B7355'
      ctx.lineWidth = 2.5 * scale
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x - 11 * scale, y - 10 * scale)
      ctx.quadraticCurveTo(x - 16 * scale, y - 13 * scale, x - 18 * scale, y - 19 * scale)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + 11 * scale, y - 10 * scale)
      ctx.quadraticCurveTo(x + 16 * scale, y - 13 * scale, x + 18 * scale, y - 19 * scale)
      ctx.stroke()
      // Nasal
      ctx.strokeStyle = '#808080'
      ctx.lineWidth = 2 * scale
      ctx.beginPath()
      ctx.moveTo(x, y - 9 * scale)
      ctx.lineTo(x, y - 2 * scale)
      ctx.stroke()
      // Detalhe do capacete
      ctx.strokeStyle = '#999'
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.arc(x, y - 9 * scale, 8 * scale, Math.PI * 0.8, Math.PI * 0.2)
      ctx.stroke()
      break
      
    case 'pirate': // Chapéu de pirata
      ctx.fillStyle = '#1a1a1a'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1.5 * scale
      // Base do chapéu
      ctx.beginPath()
      ctx.moveTo(x - 15 * scale, y - 4 * scale)
      ctx.lineTo(x - 7 * scale, y - 16 * scale)
      ctx.lineTo(x + 7 * scale, y - 16 * scale)
      ctx.lineTo(x + 15 * scale, y - 4 * scale)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      // Caveira
      ctx.fillStyle = '#FFF'
      ctx.beginPath()
      ctx.arc(x, y - 11 * scale, 3.5 * scale, 0, Math.PI * 2)
      ctx.fill()
      // Olhos da caveira
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(x - 1.5 * scale, y - 12 * scale, 1 * scale, 0, Math.PI * 2)
      ctx.arc(x + 1.5 * scale, y - 12 * scale, 1 * scale, 0, Math.PI * 2)
      ctx.fill()
      // Ossos cruzados
      ctx.strokeStyle = '#FFF'
      ctx.lineWidth = 2 * scale
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x - 5 * scale, y - 9 * scale)
      ctx.lineTo(x + 5 * scale, y - 9 * scale)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x - 5 * scale, y - 7 * scale)
      ctx.lineTo(x + 5 * scale, y - 7 * scale)
      ctx.stroke()
      break
      
    case 'party': // Chapéu de festa
      ctx.fillStyle = '#FF1493'
      ctx.strokeStyle = '#C71585'
      ctx.lineWidth = 1.5 * scale
      // Cone
      ctx.beginPath()
      ctx.moveTo(x - 9 * scale, y)
      ctx.lineTo(x, y - 22 * scale)
      ctx.lineTo(x + 9 * scale, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      // Listras coloridas
      const colors = ['#FFD700', '#00CED1', '#32CD32', '#FF6347']
      ctx.lineWidth = 2 * scale
      ctx.lineCap = 'round'
      for(let i = 0; i < 4; i++) {
        ctx.strokeStyle = colors[i]
        const yPos = y - 4 * scale - i * 4.5 * scale
        ctx.beginPath()
        ctx.moveTo(x - 7 * scale + i * 2 * scale, yPos)
        ctx.lineTo(x + 7 * scale - i * 2 * scale, yPos)
        ctx.stroke()
      }
      // Pompom no topo
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(x, y - 23 * scale, 2.5 * scale, 0, Math.PI * 2)
      ctx.fill()
      break
  }
  
  ctx.restore()
}
