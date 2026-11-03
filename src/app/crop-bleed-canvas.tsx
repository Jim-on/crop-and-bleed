import * as React from "react";

import {
  useToolcraftDispatch,
  useToolcraftMediaPresentationUrls,
  useToolcraftProductSceneFrame,
  useToolcraftSelector,
} from "@/toolcraft/runtime/react";

import {
  type CropBleedSource,
  drawCropBleed,
  getTotalSize,
  readCropBleedSettings,
} from "./crop-bleed-geometry";
import styles from "./crop-bleed-canvas.module.css";

function useSourceImage(url: string | undefined): HTMLImageElement | null {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  React.useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    let cancelled = false;
    const next = new Image();
    next.onload = () => {
      if (!cancelled) setImage(next);
    };
    next.src = url;
    return () => {
      cancelled = true;
    };
  }, [url]);
  return image;
}

export function CropBleedCanvas(): React.JSX.Element {
  const frame = useToolcraftProductSceneFrame();
  const dispatch = useToolcraftDispatch();
  const values = useToolcraftSelector((state) => state.values);
  const mediaAssets = useToolcraftSelector((state) => state.mediaAssets);
  const urls = useToolcraftMediaPresentationUrls(mediaAssets);
  const asset = mediaAssets.find(
    (item) => item.assetKind === "image" && item.sourceTarget === "source.image",
  );
  const image = useSourceImage(asset ? urls.get(asset.id) : undefined);
  const settings = readCropBleedSettings(values);
  const total = getTotalSize(settings);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // The artboard is the final document plus bleed on every edge.
  React.useEffect(() => {
    dispatch({
      size: { height: total.height, unit: "px", width: total.width },
      type: "canvas.setSize",
    });
  }, [dispatch, total.height, total.width]);

  const source: CropBleedSource | null =
    asset && asset.assetKind === "image"
      ? {
          height: asset.sourceSize.height,
          transform: asset.transform,
          width: asset.sourceSize.width,
        }
      : null;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frame.kind !== "ready") return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const scale = ratio * (frame.rect.width / total.width);
    canvas.width = Math.max(1, Math.round(total.width * scale));
    canvas.height = Math.max(1, Math.round(total.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return;
    drawCropBleed(context, image, source, settings, scale);
  });

  const radius =
    settings.cornerRadius > 0
      ? Math.min(settings.cornerRadius, settings.docWidth / 2, settings.docHeight / 2)
      : 0;

  return (
    <div data-toolcraft-product-output="">
      <canvas className={styles.canvas} ref={canvasRef} />
      <svg
        aria-hidden="true"
        className={styles.guide}
        preserveAspectRatio="none"
        viewBox={`0 0 ${total.width} ${total.height}`}
      >
        <rect
          height={settings.docHeight}
          rx={radius}
          ry={radius}
          width={settings.docWidth}
          x={settings.bleed}
          y={settings.bleed}
        />
      </svg>
    </div>
  );
}
