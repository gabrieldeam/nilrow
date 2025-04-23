import type { NextConfig } from 'next';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const parsedURL = new URL(baseURL);

const protocolWithoutColon = parsedURL.protocol.replace(':', '') as 'http' | 'https';

if (protocolWithoutColon !== 'http' && protocolWithoutColon !== 'https') {
  throw new Error(`Protocolo não suportado: ${parsedURL.protocol}`);
}

const cleanPathname = parsedURL.pathname.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: protocolWithoutColon,
        hostname: parsedURL.hostname,
        port: parsedURL.port || '',
        pathname: `${cleanPathname}/**`,
      },      {
        protocol: 'https',
        hostname: 'www.showmetech.com.br',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'conteudo.imguol.com.br',
        pathname: '/c/noticias/**', // ou ajuste conforme necessário
      },
    ],
  },
};

export default nextConfig;
