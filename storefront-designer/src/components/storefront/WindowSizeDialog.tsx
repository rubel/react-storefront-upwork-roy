import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (widthCm: number, heightCm: number) => void;
};

export const WindowSizeDialog = ({ open, onCancel, onConfirm }: Props) => {
  const [w, setW] = useState("100");
  const [h, setH] = useState("150");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New window dimensions</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="w">Width (cm)</Label>
            <Input
              id="w"
              type="number"
              min={1}
              value={w}
              onChange={(e) => setW(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="h">Height (cm)</Label>
            <Input
              id="h"
              type="number"
              min={1}
              value={h}
              onChange={(e) => setH(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const wn = parseFloat(w);
              const hn = parseFloat(h);
              if (wn > 0 && hn > 0) onConfirm(wn, hn);
            }}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
