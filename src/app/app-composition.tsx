import { composeToolcraftApp } from "@/toolcraft/runtime/react";

import { onCropBleedAction } from "./crop-bleed-actions";
import { CropBleedCanvas } from "./crop-bleed-canvas";
import { appSchema } from "./app-schema";

export const appComposition = composeToolcraftApp(appSchema, {
  actions: { onPanelAction: onCropBleedAction },
  scene: {
    canvasContent: <CropBleedCanvas />,
    renderDefaultCanvasMedia: false,
  },
});
