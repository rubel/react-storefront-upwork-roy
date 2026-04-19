import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onImage: (src: string, naturalW: number, naturalH: number) => void;
};

export const UploadScreen = ({ onImage }: Props) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();
        img.onload = () => onImage(src, img.naturalWidth, img.naturalHeight);
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    [onImage]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`max-w-2xl w-full rounded-2xl border-2 border-dashed p-12 text-center transition-all bg-card shadow-[var(--shadow-panel)] ${
          dragOver ? "border-primary bg-accent" : "border-border"
        }`}
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-6">
          <Upload className="w-8 h-8 text-accent-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Storefront Designer
        </h1>
        <p className="text-muted-foreground mb-8">
          Upload your storefront image to start mapping windows and placing
          designs.
        </p>
        <label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <Button asChild size="lg" className="cursor-pointer">
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Upload storefront image
            </span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-4">
          or drag &amp; drop a JPG / PNG here
        </p>
      </div>
    </div>
  );
};
