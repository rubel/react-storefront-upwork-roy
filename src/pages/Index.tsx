import { useRef, useState } from "react";
import { UploadScreen } from "@/components/storefront/UploadScreen";
import { TopBar } from "@/components/storefront/TopBar";
import { WindowSizeDialog } from "@/components/storefront/WindowSizeDialog";
import { StickerPanel } from "@/components/storefront/StickerPanel";
import {
  StageHandle,
  StorefrontStage,
} from "@/components/storefront/StorefrontStage";
import { Phase, PlacedSticker, WindowShape } from "@/types/storefront";
import { STICKERS } from "@/lib/stickers";
import { toast } from "sonner";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("upload");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState({ w: 0, h: 0 });
  const [windows, setWindows] = useState<WindowShape[]>([]);
  const [drawingWindow, setDrawingWindow] = useState<WindowShape | null>(null);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const stageRef = useRef<StageHandle>(null);

  const handleImage = (src: string, w: number, h: number) => {
    setImageSrc(src);
    setImgDims({ w, h });
    setPhase("windows");
  };

  const onAddWindow = () => setSizeDialogOpen(true);

  const onConfirmSize = (widthCm: number, heightCm: number) => {
    setSizeDialogOpen(false);
    setDrawingWindow({
      id: crypto.randomUUID(),
      widthCm,
      heightCm,
      points: [],
    });
    toast.info("Click & drag on the image to draw the window");
  };

  const onFinishWindow = () => {
    if (!drawingWindow || drawingWindow.points.length < 3) {
      toast.error("Draw the window first");
      return;
    }
    setWindows((ws) => [...ws, drawingWindow]);
    setDrawingWindow(null);
  };

  const onProceedToDesign = () => {
    if (windows.length === 0) return;
    setDrawingWindow(null);
    setPhase("design");
  };

  const onFinishDesign = async () => {
    const url = await stageRef.current?.exportImage();
    if (url) {
      setExportedUrl(url);
      setPhase("exported");
      toast.success("Design ready — click Download");
    }
  };

  const onDownload = () => {
    if (!exportedUrl) return;
    const a = document.createElement("a");
    a.href = exportedUrl;
    a.download = "storefront-design.png";
    a.click();
  };

  const onReset = () => {
    setPhase("upload");
    setImageSrc(null);
    setWindows([]);
    setDrawingWindow(null);
    setStickers([]);
    setExportedUrl(null);
  };

  if (phase === "upload" || !imageSrc) {
    return <UploadScreen onImage={handleImage} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <TopBar
        phase={phase}
        isDrawing={!!drawingWindow}
        hasWindows={windows.length > 0}
        hasStickers={stickers.length > 0}
        onAddWindow={onAddWindow}
        onFinishWindow={onFinishWindow}
        onProceedToDesign={onProceedToDesign}
        onFinishDesign={onFinishDesign}
        onDownload={onDownload}
        onReset={onReset}
      />
      <div className="flex flex-1 min-h-0">
        <StorefrontStage
          ref={stageRef}
          imageSrc={imageSrc}
          imgW={imgDims.w}
          imgH={imgDims.h}
          phase={phase}
          windows={windows}
          setWindows={setWindows}
          drawingWindow={drawingWindow}
          setDrawingWindow={setDrawingWindow}
          stickers={stickers}
          setStickers={setStickers}
          stickerDefs={STICKERS}
        />
        {phase === "design" && <StickerPanel onDragStart={() => {}} />}
      </div>

      <WindowSizeDialog
        open={sizeDialogOpen}
        onCancel={() => setSizeDialogOpen(false)}
        onConfirm={onConfirmSize}
      />

      {phase === "windows" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-4 py-2 text-xs text-muted-foreground shadow-[var(--shadow-panel)]">
          {drawingWindow
            ? "Drag to draw • Drag corners to adjust • Click white dots on edges to add corners • Press Done"
            : `${windows.length} window${windows.length === 1 ? "" : "s"} mapped — add more or proceed to design`}
        </div>
      )}
    </div>
  );
};

export default Index;
