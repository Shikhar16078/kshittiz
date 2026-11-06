import { ImageResponse } from 'next/og';
import { personalData } from '@/lib/data';

// Rendered at build time with the built-in font: no font files or network fetches, so it
// works under the same-origin CSP and offline builds.
export const alt = `${personalData.name} — Senior Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Fixed values from the dark theme (--background, --primary, --muted-foreground): an image
// can't read CSS variables.
const BG = '#09090b';
const GOLD = '#ffc61a';
const MUTED = '#a1a1aa';
const TEXT = '#fafafa';

export default function Image() {
  const role = personalData.title.split(' | ')[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: BG,
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(255,198,26,0.22), rgba(9,9,11,0) 55%)',
          color: TEXT,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{ width: 48, height: 4, borderRadius: 2, background: GOLD }}
          />
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: GOLD,
            }}
          >
            Portfolio
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 112,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            {personalData.name}
            <span style={{ color: GOLD }}>.</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 44, color: TEXT }}>
            {role}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 28,
            color: MUTED,
          }}
        >
          <div style={{ display: 'flex' }}>FactSet · PayPal · Aricent</div>
          <div
            style={{ width: 120, height: 4, borderRadius: 2, background: GOLD }}
          />
        </div>
      </div>
    ),
    size,
  );
}
