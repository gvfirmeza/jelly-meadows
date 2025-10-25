/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Desabilitado para evitar conexões duplicadas de WebSocket
  // Configuração para WebSocket externo
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ]
  },
  env: {
    // URL do backend WebSocket - ALTERE DEPOIS DO DEPLOY!
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },
}

module.exports = nextConfig
