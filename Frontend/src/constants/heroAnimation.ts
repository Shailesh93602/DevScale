// src/constants/heroAnimation.ts

const heroAnimation = {
  v: '5.5.7',
  fr: 30,
  ip: 0,
  op: 120,
  w: 400,
  h: 400,
  nm: 'Engineering Animation',
  ddd: 0,
  assets: [],
  layers: [
    // Outer glowing ring
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Outer Ring',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: 80 },
            { t: 60, s: 100 },
            { t: 120, s: 80 },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: 0, s: 0 },
            { t: 120, s: 360 },
          ],
        },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'el',
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [180, 180] },
          nm: 'Ellipse Path 1',
        },
        {
          ty: 'st',
          c: { a: 0, k: [0.51, 0, 0.72, 1] }, // Purple color matching primary
          o: { a: 0, k: 100 },
          w: { a: 0, k: 12 },
          lc: 2,
          lj: 2,
          ml: 4,
          nm: 'Stroke 1',
        },
        {
          ty: 'fl',
          c: { a: 0, k: [0.51, 0, 0.72, 0.05] },
          o: { a: 0, k: 5 },
          nm: 'Fill 1',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
    // Middle pulsing ring
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Middle Ring',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: 70 },
            { t: 60, s: 90 },
            { t: 120, s: 70 },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: 0, s: 180 },
            { t: 120, s: -180 },
          ],
        },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [70, 70, 100] },
            { t: 60, s: [85, 85, 100] },
            { t: 120, s: [70, 70, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'el',
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [120, 120] },
          nm: 'Ellipse Path 2',
        },
        {
          ty: 'st',
          c: { a: 0, k: [0.41, 0, 0.57, 1] }, // Darker purple
          o: { a: 0, k: 100 },
          w: { a: 0, k: 8 },
          lc: 2,
          lj: 2,
          ml: 4,
          nm: 'Stroke 2',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
    // Inner core with glow
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Inner Core',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [50, 50, 100] },
            { t: 30, s: [60, 60, 100] },
            { t: 60, s: [50, 50, 100] },
            { t: 90, s: [60, 60, 100] },
            { t: 120, s: [50, 50, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'el',
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [60, 60] },
          nm: 'Ellipse Path 3',
        },
        {
          ty: 'fl',
          c: { a: 0, k: [0.51, 0, 0.72, 1] }, // Purple fill
          o: { a: 0, k: 100 },
          nm: 'Fill 1',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
    // Particles/dots orbiting
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Orbiting Particles',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: 0 },
            { t: 120, s: 720 },
          ],
        },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        // Particle 1
        {
          ty: 'gr',
          it: [
            {
              ty: 'el',
              p: { a: 0, k: [80, 0] },
              s: { a: 0, k: [15, 15] },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.51, 0, 0.72, 1] },
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'Particle 1',
        },
        // Particle 2
        {
          ty: 'gr',
          it: [
            {
              ty: 'el',
              p: { a: 0, k: [-80, 0] },
              s: { a: 0, k: [15, 15] },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.41, 0, 0.57, 1] },
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'Particle 2',
        },
        // Particle 3
        {
          ty: 'gr',
          it: [
            {
              ty: 'el',
              p: { a: 0, k: [0, 80] },
              s: { a: 0, k: [15, 15] },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.6, 0.2, 0.8, 1] }, // Light purple
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'Particle 3',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
};

export default heroAnimation;
