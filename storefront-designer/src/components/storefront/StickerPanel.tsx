import { StickerDef } from "@/types/storefront";
import { STICKERS } from "@/lib/stickers";

type Props = {
  onDragStart: (sticker: StickerDef) => void;
};

export const StickerPanel = ({ onDragStart }: Props) => {
  return (
    <aside className="w-72 shrink-0 border-l border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Stickers</h2>
        <p className="text-xs text-muted-foreground">
          Drag onto a window. Sizes scale to each window's cm.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3">
        {STICKERS.map((s) => (
          <div
            key={s.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/sticker-id", s.id);
              e.dataTransfer.effectAllowed = "copy";
              onDragStart(s);
            }}
            className="group cursor-grab active:cursor-grabbing rounded-lg border border-border bg-background hover:border-primary hover:shadow-[var(--shadow-elegant)] transition-all p-2 flex flex-col items-center gap-2"
          >
            <div className="w-full aspect-square flex items-center justify-center bg-muted rounded">
              <img
                src={s.src}
                alt={s.name}
                className="max-w-full max-h-full pointer-events-none"
              />
            </div>
            <div className="text-center w-full">
              <div className="text-xs font-medium truncate">{s.name}</div>
              <div className="text-[10px] text-muted-foreground">
                {s.widthCm}×{s.heightCm} cm
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
