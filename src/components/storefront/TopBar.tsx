import { Button } from "@/components/ui/button";
import { Phase } from "@/types/storefront";
import { Check, Download, Plus, RefreshCw } from "lucide-react";

type Props = {
  phase: Phase;
  isDrawing: boolean;
  hasWindows: boolean;
  hasStickers: boolean;
  onAddWindow: () => void;
  onFinishWindow: () => void;
  onProceedToDesign: () => void;
  onFinishDesign: () => void;
  onDownload: () => void;
  onReset: () => void;
};

export const TopBar = ({
  phase,
  isDrawing,
  hasWindows,
  onAddWindow,
  onFinishWindow,
  onProceedToDesign,
  onFinishDesign,
  onDownload,
  onReset,
}: Props) => {
  return (
    <header className="h-14 shrink-0 border-b border-border bg-card flex items-center justify-between px-4 shadow-[var(--shadow-panel)]">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          S
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-tight">
            Storefront Designer
          </h1>
          <p className="text-[11px] text-muted-foreground leading-tight">
            {phase === "windows" && "Step 1 — map windows"}
            {phase === "design" && "Step 2 — place stickers"}
            {phase === "exported" && "Done — download your design"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {phase === "windows" && !isDrawing && (
          <Button onClick={onAddWindow} variant="default">
            <Plus className="w-4 h-4 mr-1" />
            Add window
          </Button>
        )}
        {phase === "windows" && isDrawing && (
          <Button onClick={onFinishWindow} variant="default">
            <Check className="w-4 h-4 mr-1" />
            Done
          </Button>
        )}
        {phase === "windows" && hasWindows && !isDrawing && (
          <Button onClick={onProceedToDesign} variant="secondary">
            Proceed to design →
          </Button>
        )}
        {phase === "design" && (
          <Button onClick={onFinishDesign} variant="default">
            <Check className="w-4 h-4 mr-1" />
            Done
          </Button>
        )}
        {phase === "exported" && (
          <Button onClick={onDownload} variant="default">
            <Download className="w-4 h-4 mr-1" />
            Download image
          </Button>
        )}
        <Button onClick={onReset} variant="ghost" size="icon" title="Start over">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
