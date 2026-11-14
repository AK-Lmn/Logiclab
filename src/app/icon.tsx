import { ImageResponse } from 'next/og';

export const contentType = 'image/png';

export function generateImageMetadata() {
  return [
    {
      id: '192',
      size: { width: 192, height: 192 },
    },
    {
      id: '512',
      size: { width: 512, height: 512 },
    },
  ];
}

export default function Icon({ id }: { id: string }) {
  const is512 = id === '512';
  const dimension = is512 ? 512 : 192;
  const padding = is512 ? '64px' : '24px';
  
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: padding,
        }}
      >
        <svg width="80%" height="80%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 5 19 H 12 V 12 H 19 V 5"
            stroke="#a78bfa"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="5" cy="19" r="3.5" fill="#8b5cf6" />
          <circle cx="12" cy="12" r="3.5" fill="#8b5cf6" />
          <circle cx="19" cy="5" r="3.5" fill="#f59e0b" />
        </svg>
      </div>
    ),
    {
      width: dimension,
      height: dimension,
    }
  );
}
