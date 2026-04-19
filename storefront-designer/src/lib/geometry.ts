import { Point } from "@/types/storefront";

// Polygon bounding box
export const bbox = (pts: Point[]) => {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
};

// Point-in-polygon (ray casting)
export const pointInPolygon = (pt: Point, poly: Point[]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y;
    const xj = poly[j].x,
      yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi + 0.00001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Insert a new point at the midpoint of an edge
export const insertMidpoint = (pts: Point[], edgeIndex: number): Point[] => {
  const a = pts[edgeIndex];
  const b = pts[(edgeIndex + 1) % pts.length];
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const next = [...pts];
  next.splice(edgeIndex + 1, 0, mid);
  return next;
};

// Pixels-per-cm derived from polygon bbox width vs entered cm width
export const windowScale = (pts: Point[], widthCm: number) => {
  const { minX, maxX } = bbox(pts);
  const widthPx = maxX - minX;
  return widthPx / Math.max(widthCm, 0.0001);
};
