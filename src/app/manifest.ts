import type { MetadataRoute } from 'next';
import colors from '../../tokens/colors.json';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LogicLab',
    short_name: 'LogicLab',
    description: 'Interactive Python execution visualizer',
    start_url: '/',
    display: 'standalone',
    background_color: colors.primitive.bg.$value,
    theme_color: colors.primitive.bg.$value,
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
