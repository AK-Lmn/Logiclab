import { ImageResponse } from 'next/og';
import colors from '../../tokens/colors.json';
import { LogicLabMark } from '../components/LogicLabMark';

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
          background: colors.semantic.action.primary.$value,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogicLabMark size={size.width * .75} color={colors.primitive['accent-ink'].$value} variant="reverse" />
      </div>
    ),
    {
      ...size,
    }
  );
}
