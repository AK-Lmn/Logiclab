import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
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
          padding: '24px',
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
      ...size,
    }
  );
}
