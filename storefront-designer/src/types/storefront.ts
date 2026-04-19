export type Point = { x: number; y: number };

export type WindowShape = {
  id: string;
  widthCm: number;
  heightCm: number;
  points: Point[]; // in image-pixel coordinates
};

export type StickerDef = {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  src: string;
};

export type PlacedSticker = {
  id: string;
  defId: string;
  windowId: string;
  // top-left in image-pixel coordinates
  x: number;
  y: number;
  // pixel size derived from window scale at placement time
  widthPx: number;
  heightPx: number;
  src: string;
};

export type Phase = "upload" | "windows" | "design" | "exported";
