import { StickerDef } from "@/types/storefront";

// Build simple SVG stickers as data URLs so no external assets are needed.
const svg = (inner: string, w = 200, h = 200) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>${inner}</svg>`
  )}`;

export const STICKERS: StickerDef[] = [
  {
    id: "sale-sm",
    name: "SALE (small)",
    widthCm: 30,
    heightCm: 30,
    src: svg(
      `<circle cx='100' cy='100' r='95' fill='#e11d48'/><text x='100' y='118' font-family='Arial' font-size='52' font-weight='900' fill='white' text-anchor='middle'>SALE</text>`
    ),
  },
  {
    id: "sale-lg",
    name: "SALE (large)",
    widthCm: 60,
    heightCm: 60,
    src: svg(
      `<circle cx='100' cy='100' r='95' fill='#e11d48'/><text x='100' y='118' font-family='Arial' font-size='52' font-weight='900' fill='white' text-anchor='middle'>SALE</text>`
    ),
  },
  {
    id: "off50",
    name: "50% OFF",
    widthCm: 50,
    heightCm: 50,
    src: svg(
      `<rect width='200' height='200' rx='20' fill='#f59e0b'/><text x='100' y='90' font-family='Arial' font-size='52' font-weight='900' fill='white' text-anchor='middle'>50%</text><text x='100' y='150' font-family='Arial' font-size='38' font-weight='700' fill='white' text-anchor='middle'>OFF</text>`
    ),
  },
  {
    id: "new",
    name: "NEW",
    widthCm: 40,
    heightCm: 25,
    src: svg(
      `<rect width='200' height='125' rx='12' fill='#16a34a'/><text x='100' y='85' font-family='Arial' font-size='60' font-weight='900' fill='white' text-anchor='middle'>NEW</text>`,
      200,
      125
    ),
  },
  {
    id: "open",
    name: "OPEN banner",
    widthCm: 120,
    heightCm: 30,
    src: svg(
      `<rect width='400' height='100' rx='8' fill='#0ea5e9'/><text x='200' y='70' font-family='Arial' font-size='60' font-weight='900' fill='white' text-anchor='middle'>OPEN</text>`,
      400,
      100
    ),
  },
  {
    id: "star",
    name: "Star",
    widthCm: 35,
    heightCm: 35,
    src: svg(
      `<polygon points='100,10 124,75 195,75 138,118 160,185 100,143 40,185 62,118 5,75 76,75' fill='#facc15' stroke='#a16207' stroke-width='4'/>`
    ),
  },
];
