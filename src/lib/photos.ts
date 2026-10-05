// Real photographs of the couple are served from the `public/images` folder —
// the exact files that were supplied, untouched and un-generated.
//
// URLs are ROOT-relative ("/images/…"), never "/public/images/…" and never
// document-relative ("images/…"). Vite copies everything in `public/` to the
// deployment root, and a root-relative URL resolves from the site root on any
// host (Netlify, a CDN, a custom domain) regardless of the URL of the page
// showing it. `import.meta.env.BASE_URL` is deliberately not used: the
// single-file build sets it to "./", which is document-relative and 404s.
const asset = (path: string) => `/${path.replace(/^\/+/, "")}`;

type Shot = { src: string; w: number; h: number };

const SHOTS: Shot[] = [
  { src: asset("images/couple/bishoy-marina-01.jpeg"), w: 1072, h: 1467 },
  { src: asset("images/couple/bishoy-marina-02.jpeg"), w: 1126, h: 1600 },
  { src: asset("images/couple/bishoy-marina-04.jpeg"), w: 974, h: 1280 },
  { src: asset("images/couple/bishoy-marina-05.jpeg"), w: 960, h: 1280 },
  { src: asset("images/couple/bishoy-marina-06.jpeg"), w: 960, h: 1280 },
  { src: asset("images/couple/bishoy-marina-07.jpeg"), w: 1254, h: 1254 },
  { src: asset("images/couple/bishoy-marina-08.jpeg"), w: 1086, h: 1448 },
];

export const photos: string[] = SHOTS.map((s) => s.src);

/** Intrinsic size — lets the browser reserve the right box before the file loads. */
export function sizeAt(i: number): { w: number; h: number } {
  const s = SHOTS[(((i % SHOTS.length) + SHOTS.length) % SHOTS.length)];
  return { w: s.w, h: s.h };
}

export function photoAt(i: number): string | null {
  if (!SHOTS.length) return null;
  return SHOTS[((i % SHOTS.length) + SHOTS.length) % SHOTS.length].src;
}

// Roles (indexes into the photo list)
export const ROLE = {
  hero: 5,
  wedding: 4,
  message: 2,
};

// object-position per photo so faces are never cropped (faces sit in the upper area)
export const FOCUS = [
  "50% 22%",
  "50% 26%",
  "50% 20%",
  "50% 24%",
  "50% 30%",
  "50% 34%",
  "50% 26%",
];

export function focusAt(i: number) {
  return FOCUS[((i % FOCUS.length) + FOCUS.length) % FOCUS.length];
}

export const MAPS = {
  church:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("St. George Church Abu El-Naga Tanta Egypt"),
  hall:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Al Nakheel Hall Tanta Egypt"),
};

export const WEDDING_DATE = new Date("2026-10-18T18:00:00+03:00");
