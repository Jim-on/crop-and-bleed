import { defineToolcraft, mediaSourceModule } from "@/toolcraft/runtime";

import appDefaults from "./app-defaults.json" with { type: "json" };
import { appIdentity } from "./app-identity";
import { CROP_BLEED_LIMITS } from "./crop-bleed-geometry";

const backgroundSection = {
  controls: {
    includeBackground: {
      applicability: { mode: "always" },
      defaultValue: true,
      performanceReason: "Toggles the fill behind the image and bleed.",
      performanceRole: "responsiveness",
      target: "export.includeBackground",
      type: "switch",
    },
    color: {
      applicability: { mode: "always" },
      defaultValue: "#FFFFFF",
      performanceReason: "Repaints the fill behind the image and bleed.",
      performanceRole: "responsiveness",
      target: "appearance.background",
      type: "color",
    },
  },
  id: "background",
  title: "Background",
} as const;

const documentSection = {
  controls: {
    width: {
      applicability: { mode: "always" },
      defaultValue: 1500,
      editableRange: { hardMax: CROP_BLEED_LIMITS.docMax, hardMin: 1 },
      label: "Width",
      max: 4000,
      min: CROP_BLEED_LIMITS.docMin,
      performanceReason: "Final document width sets the output pixel size.",
      performanceRole: "workload",
      sliderValueKind: "continuous",
      step: 1,
      target: "document.width",
      type: "slider",
      unit: "px",
    },
    height: {
      applicability: { mode: "always" },
      defaultValue: 1050,
      editableRange: { hardMax: CROP_BLEED_LIMITS.docMax, hardMin: 1 },
      label: "Height",
      max: 4000,
      min: CROP_BLEED_LIMITS.docMin,
      performanceReason: "Final document height sets the output pixel size.",
      performanceRole: "workload",
      sliderValueKind: "continuous",
      step: 1,
      target: "document.height",
      type: "slider",
      unit: "px",
    },
    dpi: {
      applicability: { mode: "always" },
      defaultValue: "300",
      label: "DPI",
      options: [
        { label: "72", value: "72" },
        { label: "150", value: "150" },
        { label: "300", value: "300" },
        { label: "600", value: "600" },
      ],
      performanceReason: "DPI is written into the exported PNG metadata.",
      performanceRole: "responsiveness",
      target: "document.dpi",
      type: "select",
    },
    cornerRadius: {
      applicability: { mode: "always" },
      defaultValue: 0,
      editableRange: { hardMax: 2000, hardMin: 0 },
      label: "Corner radius",
      max: 300,
      min: 0,
      performanceReason: "Rounded corner clipping is redrawn per frame.",
      performanceRole: "responsiveness",
      sliderValueKind: "continuous",
      step: 1,
      target: "document.cornerRadius",
      type: "slider",
      unit: "px",
    },
  },
  id: "document",
  title: "Document",
} as const;

const imageSection = {
  controls: {
    source: {
      applicability: { mode: "always" },
      assetKind: "image",
      label: "Image",
      multiple: false,
      performanceReason: "Source image resolution drives decode and draw cost.",
      performanceRole: "workload",
      target: "source.image",
      type: "fileDrop",
    },
  },
  id: "image",
  title: "Image",
} as const;

const cropSection = {
  controls: {
    fit: {
      actions: [
        { label: "Fit all", value: "crop.fitAll" },
        { label: "Fill", value: "crop.fill" },
      ],
      applicability: { mode: "always" },
      label: "Reset crop",
      performanceReason: "Resets the crop through runtime values.",
      performanceRole: "responsiveness",
      target: "crop.actions",
      type: "actions",
    },
    zoom: {
      applicability: { mode: "always" },
      defaultValue: 1,
      label: "Zoom",
      max: CROP_BLEED_LIMITS.zoomMax,
      min: CROP_BLEED_LIMITS.zoomMin,
      performanceReason: "Zoom rescales the image draw.",
      performanceRole: "responsiveness",
      sliderValueKind: "continuous",
      step: 0.01,
      target: "crop.zoom",
      type: "slider",
    },
    offsetX: {
      applicability: { mode: "always" },
      defaultValue: 0,
      label: "Horizontal",
      max: CROP_BLEED_LIMITS.offsetMax,
      min: -CROP_BLEED_LIMITS.offsetMax,
      performanceReason: "Offset moves the image draw.",
      performanceRole: "responsiveness",
      sliderValueKind: "continuous",
      step: 0.5,
      target: "crop.offsetX",
      type: "slider",
      unit: "%",
    },
    offsetY: {
      applicability: { mode: "always" },
      defaultValue: 0,
      label: "Vertical",
      max: CROP_BLEED_LIMITS.offsetMax,
      min: -CROP_BLEED_LIMITS.offsetMax,
      performanceReason: "Offset moves the image draw.",
      performanceRole: "responsiveness",
      sliderValueKind: "continuous",
      step: 0.5,
      target: "crop.offsetY",
      type: "slider",
      unit: "%",
    },
  },
  id: "crop",
  title: "Crop",
} as const;

const bleedSection = {
  controls: {
    size: {
      applicability: { mode: "always" },
      defaultValue: 38,
      editableRange: { hardMax: 1000, hardMin: 0 },
      label: false,
      max: CROP_BLEED_LIMITS.bleedMax,
      min: 0,
      performanceReason: "Bleed grows the output pixel size on every edge.",
      performanceRole: "workload",
      sliderValueKind: "continuous",
      step: 1,
      target: "bleed.size",
      type: "slider",
      unit: "px",
    },
  },
  id: "bleed",
  title: "Bleed",
} as const;

const downloadSection = {
  controls: {
    download: {
      actions: [
        {
          icon: "download-simple",
          label: "Download with bleed",
          role: "download-output",
          value: "download.bleed",
        },
      ],
      applicability: { mode: "always" },
      performanceReason: "Renders the exact-pixel output once per click.",
      performanceRole: "workload",
      target: "download.actions",
      type: "panelActions",
    },
  },
  id: "download",
  title: "Download",
} as const;

export const appSchema = defineToolcraft({
  defaults: appDefaults,
  base: {
    canvas: {
      enabled: true,
      sizing: { mode: "fixed-output" },
      size: { height: 1126, unit: "px", width: 1576 },
      upload: true,
    },
    identity: appIdentity,
    panels: {
      controls: {
        sections: [
          backgroundSection,
          imageSection,
          cropSection,
          documentSection,
          bleedSection,
          downloadSection,
        ],
        title: "Controls",
      },
    },
    toolbar: {
      history: true,
      radar: true,
      theme: true,
      zoom: true,
    },
  },
  modules: [mediaSourceModule()],
});
