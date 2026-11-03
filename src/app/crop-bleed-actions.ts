import type { ToolcraftPanelActionHandler } from "@/toolcraft/runtime/react";

import {
  type CropBleedSource,
  drawCropBleed,
  getFitZoom,
  getTotalSize,
  readCropBleedSettings,
} from "./crop-bleed-geometry";

const SOURCE_TARGET = "source.image";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Inserts a pHYs chunk after IHDR so viewers and print tools read the DPI. */
async function withPngDpi(png: Blob, dpi: number): Promise<Blob> {
  const bytes = new Uint8Array(await png.arrayBuffer());
  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  const perMeter = Math.round(dpi / 0.0254);
  view.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4);
  view.setUint32(8, perMeter);
  view.setUint32(12, perMeter);
  chunk[16] = 1;
  view.setUint32(17, crc32(chunk.subarray(4, 17)));
  const ihdrEnd = 8 + 12 + 13;
  const out = new Uint8Array(bytes.length + chunk.length);
  out.set(bytes.subarray(0, ihdrEnd));
  out.set(chunk, ihdrEnd);
  out.set(bytes.subarray(ihdrEnd), ihdrEnd + chunk.length);
  return new Blob([out], { type: "image/png" });
}

export const onCropBleedAction: ToolcraftPanelActionHandler = async ({
  action,
  dispatch,
  reportFeedback,
  reportProgress,
  resolveMediaResource,
  state,
}) => {
  const settings = readCropBleedSettings(state.values);
  const asset = state.mediaAssets.find(
    (item) => item.assetKind === "image" && item.sourceTarget === SOURCE_TARGET,
  );
  const setValue = (target: string, value: number) =>
    dispatch({ target, type: "controls.setValue", value });

  if (action.value === "crop.fitAll" || action.value === "crop.fill") {
    if (!asset || asset.assetKind !== "image") return;
    const source: CropBleedSource = {
      height: asset.sourceSize.height,
      transform: asset.transform,
      width: asset.sourceSize.width,
    };
    setValue("crop.zoom", action.value === "crop.fill" ? 1 : getFitZoom(source, settings));
    setValue("crop.offsetX", 0);
    setValue("crop.offsetY", 0);
    return;
  }

  if (action.value !== "download.bleed") return;
  if (!asset || asset.assetKind !== "image") {
    reportFeedback({ message: "Upload an image first.", tone: "error" } as never);
    return;
  }

  const controller = new AbortController();
  const bytes = await resolveMediaResource(asset.resourceRef, {
    signal: controller.signal,
  });
  if (!bytes) throw new Error("The uploaded image is no longer available.");
  reportProgress(0.3);

  const bitmap = await createImageBitmap(
    new Blob([bytes as BlobPart], { type: asset.mimeType }),
  );
  const total = getTotalSize(settings);
  const canvas = document.createElement("canvas");
  canvas.width = total.width;
  canvas.height = total.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable.");
  drawCropBleed(
    context,
    bitmap,
    {
      height: asset.sourceSize.height,
      transform: asset.transform,
      width: asset.sourceSize.width,
    },
    settings,
  );
  bitmap.close();
  reportProgress(0.7);

  const encoded = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!encoded) throw new Error("PNG encoding failed.");
  const blob = await withPngDpi(encoded, settings.dpi);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const baseName = asset.fileName.replace(/\.[^.]+$/u, "");
  link.href = url;
  link.download = `${baseName}-${total.width}x${total.height}-${settings.dpi}dpi-bleed${settings.bleed}.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  reportProgress(1);
};
