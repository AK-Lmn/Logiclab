import { ImageResponse } from 'next/og';
import colors from '../../tokens/colors.json';
import { LogicLabMark } from '../components/LogicLabMark';

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

export default async function Icon({ id }: { id: Promise<string> }) {
  const is512 = (await id) === '512';
  const dimension = is512 ? 512 : 192;
  
  return new ImageResponse(
    (
      <div
        style={{
          background: colors.semantic.action.primary.$value,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogicLabMark size={dimension * .75} color={colors.primitive['accent-ink'].$value} variant="reverse" />
      </div>
    ),
    {
      width: dimension,
      height: dimension,
    }
  );
}
