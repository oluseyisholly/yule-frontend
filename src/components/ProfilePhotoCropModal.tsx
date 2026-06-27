"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CROP_SIZE = 220;
const OUTPUT_SIZE = 512;

type CropPosition = {
  x: number;
  y: number;
};

type ProfilePhotoCropModalProps = {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (croppedImageSrc: string) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getEmptyPosition(): CropPosition {
  return { x: 0, y: 0 };
}

async function createCroppedImageDataUrl({
  imageSrc,
  naturalWidth,
  naturalHeight,
  displayedWidth,
  displayedHeight,
  position,
}: {
  imageSrc: string;
  naturalWidth: number;
  naturalHeight: number;
  displayedWidth: number;
  displayedHeight: number;
  position: CropPosition;
}) {
  const image = new window.Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to prepare your image."));
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to prepare the crop canvas.");
  }

  const horizontalOverflow = Math.max(displayedWidth - CROP_SIZE, 0);
  const verticalOverflow = Math.max(displayedHeight - CROP_SIZE, 0);
  const sourceX =
    ((horizontalOverflow / 2 - position.x) / displayedWidth) * naturalWidth;
  const sourceY =
    ((verticalOverflow / 2 - position.y) / displayedHeight) * naturalHeight;
  const sourceWidth = (CROP_SIZE / displayedWidth) * naturalWidth;
  const sourceHeight = (CROP_SIZE / displayedHeight) * naturalHeight;

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function ProfilePhotoCropModal({
  open,
  imageSrc,
  onClose,
  onConfirm,
}: ProfilePhotoCropModalProps) {
  const cropAreaRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<CropPosition>(getEmptyPosition());
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState<{
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const baseScale = useMemo(() => {
    if (!imageSize.width || !imageSize.height) {
      return 1;
    }

    return Math.max(CROP_SIZE / imageSize.width, CROP_SIZE / imageSize.height);
  }, [imageSize.height, imageSize.width]);

  const displayedWidth = useMemo(
    () => imageSize.width * baseScale * zoom,
    [baseScale, imageSize.width, zoom],
  );
  const displayedHeight = useMemo(
    () => imageSize.height * baseScale * zoom,
    [baseScale, imageSize.height, zoom],
  );

  const clampPosition = (nextPosition: CropPosition): CropPosition => {
    const limitX = Math.max((displayedWidth - CROP_SIZE) / 2, 0);
    const limitY = Math.max((displayedHeight - CROP_SIZE) / 2, 0);

    return {
      x: clamp(nextPosition.x, -limitX, limitX),
      y: clamp(nextPosition.y, -limitY, limitY),
    };
  };

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setPosition(getEmptyPosition());
      setImageSize({ width: 0, height: 0 });
      setDragState(null);
      setIsApplying(false);
      setIsImageLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !imageSrc) {
      return;
    }

    let isActive = true;
    const image = new window.Image();

    setImageSize({ width: 0, height: 0 });
    setIsImageLoading(true);

    image.onload = () => {
      if (!isActive) {
        return;
      }

      setImageSize({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setIsImageLoading(false);
    };

    image.onerror = () => {
      if (!isActive) {
        return;
      }

      setIsImageLoading(false);
      toast.error("Unable to load that image right now.");
    };

    image.src = imageSrc;

    return () => {
      isActive = false;
    };
  }, [imageSrc, open]);

  useEffect(() => {
    setPosition((current) => clampPosition(current));
  }, [displayedHeight, displayedWidth]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageSrc) {
      return;
    }

    event.preventDefault();
    cropAreaRef.current?.setPointerCapture(event.pointerId);
    setDragState({
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: position.x,
      originY: position.y,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState) {
      return;
    }

    const deltaX = event.clientX - dragState.pointerX;
    const deltaY = event.clientY - dragState.pointerY;

    setPosition(
      clampPosition({
        x: dragState.originX + deltaX,
        y: dragState.originY + deltaY,
      }),
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    cropAreaRef.current?.releasePointerCapture(event.pointerId);
    setDragState(null);
  };

  const handleApplyCrop = async () => {
    if (!imageSrc || !imageSize.width || !imageSize.height) {
      toast.error("Please choose an image first.");
      return;
    }

    try {
      setIsApplying(true);
      const croppedImageSrc = await createCroppedImageDataUrl({
        imageSrc,
        naturalWidth: imageSize.width,
        naturalHeight: imageSize.height,
        displayedWidth,
        displayedHeight,
        position,
      });
      onConfirm(croppedImageSrc);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to crop your image right now.",
      );
    } finally {
      setIsApplying(false);
    }
  };

  const zoomPercentage = Math.round(zoom * 100);
  const isImageReady = imageSize.width > 0 && imageSize.height > 0;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton
        className="max-w-[520px] overflow-hidden rounded-[10px] border border-[#ECE8F4] bg-white p-0 shadow-[0_24px_80px_rgba(25,19,61,0.16)] [&>button]:right-6 [&>button]:top-6 [&>button]:text-[#4B4B4B] [&>button]:opacity-100"
      >
        <DialogHeader className="space-y-2 border-b border-[#F0ECF7] px-6 pb-4 pt-6 text-left">
          <DialogTitle className="text-[22px] font-semibold text-[#1E1E1E]">
            Crop Profile Photo
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#7B7886]">
            Drag the image to reposition and use zoom to fit perfectly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="flex justify-center">
            <div className="flex w-full justify-center">
              <div
                ref={cropAreaRef}
                role="presentation"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative size-[220px] shrink-0 cursor-grab touch-none overflow-hidden rounded-full border border-[#DED9EA] bg-white shadow-[0_0_0_4px_white,inset_0_0_0_1px_rgba(172,165,193,0.22)] active:cursor-grabbing"
              >
                {imageSrc && isImageReady ? (
                  <img
                    src={imageSrc}
                    alt="Profile crop preview"
                    draggable={false}
                    className="absolute left-1/2 top-1/2 max-w-none select-none will-change-transform"
                    style={{
                      width: `${displayedWidth}px`,
                      height: `${displayedHeight}px`,
                      transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0)`,
                    }}
                  />
                ) : null}
                {isImageLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center text-[14px] text-[#8B8896]">
                    Loading image...
                  </div>
                ) : null}
                <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-[#F1EDF7]" />
              </div>
            </div>
          </div>

          <div className="rounded-[8px] border border-[#ECE8F4] bg-[#FBFAFE] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-[#4E4B57]">Zoom</p>
              <span className="text-[13px] text-[#8B8896]">
                {zoomPercentage}%
              </span>
            </div>
            <div className="mt-2">
              <div className="flex items-center">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer accent-[#4B11D8]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#F0ECF7] px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            className="h-[38px] min-w-[96px] justify-center border-[#8A9A62] px-5 text-[13px] text-[#5B6E35]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleApplyCrop()}
            disabled={isApplying || !imageSrc}
            className="h-[38px] min-w-[132px] justify-center px-5 text-[13px] font-semibold"
          >
            {isApplying ? "Applying..." : "Apply Crop"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
