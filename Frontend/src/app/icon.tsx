import { ImageResponse } from 'next/og';

// App-router-generated favicon. Renders a small ES monogram on the brand
// purple — satisfies /favicon.ico requests and all the <link rel="icon">
// variants with one file. 32×32 is the default favicon size.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
          color: 'white',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '-0.04em',
        }}
      >
        ES
      </div>
    ),
    { ...size },
  );
}
