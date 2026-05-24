import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TheraSynced - Professional Therapy & Wellness Services';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #faf9f6 0%, #e8f5e9 50%, #f5f4f1 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        TheraSynced
      </div>
      <div
        style={{
          fontSize: 28,
          color: '#666',
          textAlign: 'center',
          maxWidth: 800,
          lineHeight: 1.4,
        }}
      >
        Connect with qualified health and performance professionals. Book sessions instantly.
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 18,
          color: '#16a34a',
          fontWeight: 600,
          padding: '12px 32px',
          border: '2px solid #16a34a',
          borderRadius: 12,
        }}
      >
        therasynced.com
      </div>
    </div>,
    { ...size },
  );
}
