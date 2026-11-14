import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LogicLab',
    short_name: 'LogicLab',
    description: 'Interactive Python execution visualizer',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#8b5cf6',
    icons: [
      {
        src: '/icon/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
