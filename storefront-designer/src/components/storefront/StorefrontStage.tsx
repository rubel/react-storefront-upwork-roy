import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Phase,
  PlacedSticker,
  Point,
  StickerDef,
  WindowShape,
} from "@/types/storefront";
import {
  bbox,
  insertMidpoint,
  pointInPolygon,
  windowScale,
} from "@/lib/geometry";

export type StageHandle = {
  exportImage: () => Promise<string | null>;
};

type Props = {
  imageSrc: string;
  imgW: number;
  imgH: number;
  phase: Phase;
  windows: WindowShape[];
  setWindows: React.Dispatch<React.SetStateAction<WindowShape[]>>;
  drawingWindow: WindowShape | null;
  setDrawingWindow: (w: WindowShape | null) => void;
  stickers: PlacedSticker[];
  setStickers: React.Dispatch<React.SetStateAction<PlacedSticker[]>>;
  stickerDefs: StickerDef[];
};

type DragState =
  | { kind: "draw"; start: Point }
  | { kind: "corner"; windowId: string; index: number }
  | { kind: "sticker"; stickerId: string; offset: Point }
  | null;

export const StorefrontStage = forwardRef<StageHandle, Props>(
  (
    {
      imageSrc,
      imgW,
      imgH,
      phase,
      windows,
      setWindows,
      drawingWindow,
      setDrawingWindow,
      stickers,
      setStickers,
      stickerDefs,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1); // display px per image px
    const [drag, setDrag] = useState<DragState>(null);

    // Fit image into container
    useLayoutEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const compute = () => {
        const rect = el.getBoundingClientRect();
        const s = Math.min(rect.width / imgW, rect.height / imgH);
        setScale(Math.max(s, 0.05));
      };
      compute();
      const ro = new ResizeObserver(compute);
      ro.observe(el);
      return () => ro.disconnect();
    }, [imgW, imgH]);

    const dispW = imgW * scale;
    const dispH = imgH * scale;

    const stageRef = useRef<HTMLDivElement>(null);

    const toImageCoords = (clientX: number, clientY: number): Point => {
      const r = stageRef.current!.getBoundingClientRect();
      return {
        x: (clientX - r.left) / scale,
        y: (clientY - r.top) / scale,
      };
    };

    // Mouse handlers
    const onPointerDown = (e: React.PointerEvent) => {
      if (phase !== "windows") return;
      if (!drawingWindow) return;
      const target = e.target as HTMLElement;
      // ignore corner / edge interactions handled separately
      if (target.dataset.role) return;
      // only allow initial draw if window has no points yet
      if (drawingWindow.points.length === 0) {
        const p = toImageCoords(e.clientX, e.clientY);
        setDrawingWindow({ ...drawingWindow, points: [p, p, p, p] });
        setDrag({ kind: "draw", start: p });
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }
    };

    const onPointerMove = (e: React.PointerEvent) => {
      if (!drag) return;
      const p = toImageCoords(e.clientX, e.clientY);
      if (drag.kind === "draw" && drawingWindow) {
        const s = drag.start;
        const pts: Point[] = [
          { x: s.x, y: s.y },
          { x: p.x, y: s.y },
          { x: p.x, y: p.y },
          { x: s.x, y: p.y },
        ];
        setDrawingWindow({ ...drawingWindow, points: pts });
      } else if (drag.kind === "corner") {
        if (drawingWindow && drawingWindow.id === drag.windowId) {
          const pts = [...drawingWindow.points];
          pts[drag.index] = p;
          setDrawingWindow({ ...drawingWindow, points: pts });
        } else {
          setWindows((ws) =>
            ws.map((w) => {
              if (w.id !== drag.windowId) return w;
              const pts = [...w.points];
              pts[drag.index] = p;
              return { ...w, points: pts };
            })
          );
        }
      } else if (drag.kind === "sticker") {
        setStickers((ss) =>
          ss.map((s) => {
            if (s.id !== drag.stickerId) return s;
            return {
              ...s,
              x: p.x - drag.offset.x,
              y: p.y - drag.offset.y,
            };
          })
        );
      }
    };

    const onPointerUp = () => setDrag(null);

    // Drop sticker from panel
    const onDrop = (e: React.DragEvent) => {
      if (phase !== "design") return;
      const id = e.dataTransfer.getData("text/sticker-id");
      const def = stickerDefs.find((d) => d.id === id);
      if (!def) return;
      const p = toImageCoords(e.clientX, e.clientY);
      // Find which window contains this point
      const target = windows.find((w) => pointInPolygon(p, w.points));
      if (!target) return;
      const pxPerCm = windowScale(target.points, target.widthCm);
      const widthPx = def.widthCm * pxPerCm;
      const heightPx = def.heightCm * pxPerCm;
      const newSticker: PlacedSticker = {
        id: crypto.randomUUID(),
        defId: def.id,
        windowId: target.id,
        x: p.x - widthPx / 2,
        y: p.y - heightPx / 2,
        widthPx,
        heightPx,
        src: def.src,
      };
      setStickers((ss) => [...ss, newSticker]);
    };

    const onDragOver = (e: React.DragEvent) => {
      if (phase === "design") e.preventDefault();
    };

    // Export composite via canvas
    useImperativeHandle(ref, () => ({
      exportImage: async () => {
        const canvas = document.createElement("canvas");
        canvas.width = imgW;
        canvas.height = imgH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        const baseImg = new Image();
        baseImg.crossOrigin = "anonymous";
        await new Promise<void>((res, rej) => {
          baseImg.onload = () => res();
          baseImg.onerror = rej;
          baseImg.src = imageSrc;
        });
        ctx.drawImage(baseImg, 0, 0, imgW, imgH);

        // Blue overlays
        ctx.save();
        ctx.fillStyle = "rgba(37, 99, 235, 0.3)";
        windows.forEach((w) => {
          ctx.beginPath();
          w.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();

        // Stickers
        for (const s of stickers) {
          const img = new Image();
          await new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = rej;
            img.src = s.src;
          });
          ctx.drawImage(img, s.x, s.y, s.widthPx, s.heightPx);
        }
        return canvas.toDataURL("image/png");
      },
    }));

    const finishedWindows = windows;
    const overlayActive = phase === "design" || phase === "exported";

    return (
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-[hsl(var(--canvas-bg))] flex items-center justify-center"
      >
        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={{ width: dispW, height: dispH }}
          className="relative shadow-[var(--shadow-elegant)] select-none touch-none"
        >
          <img
            src={imageSrc}
            alt="storefront"
            draggable={false}
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          />
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${imgW} ${imgH}`}
            preserveAspectRatio="none"
          >
            {finishedWindows.map((w) => (
              <PolygonView
                key={w.id}
                shape={w}
                editable={false}
                showOverlay={overlayActive}
              />
            ))}
            {drawingWindow && drawingWindow.points.length > 0 && (
              <PolygonView
                shape={drawingWindow}
                editable
                showOverlay={false}
                onCornerDown={(i, e) => {
                  setDrag({
                    kind: "corner",
                    windowId: drawingWindow.id,
                    index: i,
                  });
                  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                }}
                onEdgeAdd={(i) => {
                  setDrawingWindow({
                    ...drawingWindow,
                    points: insertMidpoint(drawingWindow.points, i),
                  });
                }}
              />
            )}
          </svg>

          {/* Stickers as HTML overlays for crisp rendering & easy drag */}
          {stickers.map((s) => (
            <div
              key={s.id}
              data-role="sticker"
              onPointerDown={(e) => {
                if (phase !== "design") return;
                e.stopPropagation();
                const p = toImageCoords(e.clientX, e.clientY);
                setDrag({
                  kind: "sticker",
                  stickerId: s.id,
                  offset: { x: p.x - s.x, y: p.y - s.y },
                });
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              onDoubleClick={() =>
                setStickers((ss) => ss.filter((x) => x.id !== s.id))
              }
              style={{
                position: "absolute",
                left: s.x * scale,
                top: s.y * scale,
                width: s.widthPx * scale,
                height: s.heightPx * scale,
                cursor: phase === "design" ? "grab" : "default",
              }}
              className="pointer-events-auto"
              title="Double-click to remove"
            >
              <img
                src={s.src}
                alt=""
                draggable={false}
                className="w-full h-full pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

StorefrontStage.displayName = "StorefrontStage";

const PolygonView = ({
  shape,
  editable,
  showOverlay,
  onCornerDown,
  onEdgeAdd,
}: {
  shape: WindowShape;
  editable: boolean;
  showOverlay: boolean;
  onCornerDown?: (i: number, e: React.PointerEvent) => void;
  onEdgeAdd?: (edgeIndex: number) => void;
}) => {
  const ptsStr = shape.points.map((p) => `${p.x},${p.y}`).join(" ");
  const fill = showOverlay
    ? "hsla(217, 91%, 55%, 0.3)"
    : editable
    ? "hsla(217, 91%, 55%, 0.15)"
    : "hsla(217, 91%, 55%, 0.08)";
  const stroke = "hsl(217, 91%, 55%)";
  return (
    <g>
      <polygon
        points={ptsStr}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
      {editable &&
        shape.points.map((p, i) => {
          const next = shape.points[(i + 1) % shape.points.length];
          const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
          return (
            <g key={i}>
              {/* Edge midpoint -> click to add corner */}
              <circle
                data-role="edge"
                cx={mid.x}
                cy={mid.y}
                r={6}
                fill="white"
                stroke={stroke}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                style={{ cursor: "copy" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onEdgeAdd?.(i);
                }}
              />
              {/* Corner handle */}
              <circle
                data-role="corner"
                cx={p.x}
                cy={p.y}
                r={8}
                fill={stroke}
                stroke="white"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                style={{ cursor: "grab" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onCornerDown?.(i, e);
                }}
              />
            </g>
          );
        })}
    </g>
  );
};
