export type CropBleedSettings = {
  background: string;
  bleed: number;
  cornerRadius: number;
  docHeight: number;
  dpi: number;
  docWidth: number;
  includeBackground: boolean;
  offsetX: number;
  offsetY: number;
  zoom: number;
};

export type CropBleedTransform = {
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  rotationDeg?: 0 | 90 | 180 | 270;
};

export type CropBleedSource = {
  height: number;
  transform?: CropBleedTransform;
  width: number;
};

export const CROP_BLEED_LIMITS = {
  bleedMax: 300,
  docMax: 10000,
  docMin: 50,
  offsetMax: 100,
  zoomMax: 4,
  zoomMin: 0.1,
} as const;

function finite(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function readCropBleedSettings(
  values: Readonly<Record<string, unknown>>,
): CropBleedSettings {
  return {
    background: typeof values["appearance.background"] === "string"
      ? (values["appearance.background"] as string)
      : "#FFFFFF",
    bleed: Math.max(0, Math.round(finite(values["bleed.size"], 0))),
    cornerRadius: Math.max(0, finite(values["document.cornerRadius"], 0)),
    docHeight: Math.max(1, Math.round(finite(values["document.height"], 1050))),
    dpi: Math.max(1, Math.round(finite(Number(values["document.dpi"]), 300))),
    docWidth: Math.max(1, Math.round(finite(values["document.width"], 1500))),
    includeBackground: values["export.includeBackground"] !== false,
    offsetX: finite(values["crop.offsetX"], 0),
    offsetY: finite(values["crop.offsetY"], 0),
    zoom: Math.max(0.01, finite(values["crop.zoom"], 1)),
  };
}

export function getTotalSize(settings: CropBleedSettings): {
  height: number;
  width: number;
} {
  return {
    height: settings.docHeight + settings.bleed * 2,
    width: settings.docWidth + settings.bleed * 2,
  };
}

/** Source dimensions after the runtime rotate action is applied. */
export function getOrientedSize(source: CropBleedSource): {
  height: number;
  width: number;
} {
  const quarterTurn =
    source.transform?.rotationDeg === 90 || source.transform?.rotationDeg === 270;
  return quarterTurn
    ? { height: source.width, width: source.height }
    : { height: source.height, width: source.width };
}

/** Scale at which the image exactly covers the final (trim) size; bleed extends beyond it. */
export function getCoverScale(
  source: CropBleedSource,
  settings: CropBleedSettings,
): number {
  const oriented = getOrientedSize(source);
  return Math.max(
    settings.docWidth / oriented.width,
    settings.docHeight / oriented.height,
  );
}

/** Scale at which the whole image fits inside the final (trim) size. */
export function getContainScale(
  source: CropBleedSource,
  settings: CropBleedSettings,
): number {
  const oriented = getOrientedSize(source);
  return Math.min(
    settings.docWidth / oriented.width,
    settings.docHeight / oriented.height,
  );
}

/** Zoom value (relative to cover) at which the whole image sits inside the trim. */
export function getFitZoom(
  source: CropBleedSource,
  settings: CropBleedSettings,
): number {
  const zoom = getContainScale(source, settings) / getCoverScale(source, settings);
  return Math.min(CROP_BLEED_LIMITS.zoomMax, Math.max(CROP_BLEED_LIMITS.zoomMin, zoom));
}

/**
 * Draws the cropped image, background and bleed in total-size pixel space.
 * `pixelScale` maps document pixels to canvas pixels.
 */
export function drawCropBleed(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource | null,
  source: CropBleedSource | null,
  settings: CropBleedSettings,
  pixelScale = 1,
): void {
  const total = getTotalSize(settings);
  context.save();
  context.scale(pixelScale, pixelScale);
  context.clearRect(0, 0, total.width, total.height);

  if (settings.includeBackground) {
    context.fillStyle = settings.background;
    context.fillRect(0, 0, total.width, total.height);
  }

  if (image && source) {
    // The image is cropped to the trim area only; the bleed stays background.
    context.beginPath();
    context.roundRect(
      settings.bleed,
      settings.bleed,
      settings.docWidth,
      settings.docHeight,
      Math.min(settings.cornerRadius, settings.docWidth / 2, settings.docHeight / 2),
    );
    context.clip();
    const scale = getCoverScale(source, settings) * settings.zoom;
    const centerX =
      total.width / 2 + (settings.offsetX / 100) * settings.docWidth;
    const centerY =
      total.height / 2 + (settings.offsetY / 100) * settings.docHeight;
    context.translate(centerX, centerY);
    context.scale(scale, scale);
    context.rotate(((source.transform?.rotationDeg ?? 0) * Math.PI) / 180);
    context.scale(
      source.transform?.flipHorizontal ? -1 : 1,
      source.transform?.flipVertical ? -1 : 1,
    );
    // Draw in un-rotated source space, centered on the origin.
    context.drawImage(
      image,
      -source.width / 2,
      -source.height / 2,
      source.width,
      source.height,
    );
  }
  context.restore();
}
