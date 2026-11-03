# Toolcraft App Agent Worklog

## Status

Mode: starter

This is a neutral template. Before first product delivery, replace this status with `Mode: product` and record concrete decisions. Keep later entries compact. Detailed requests and results belong in `docs/agent-journal/changes`; text command attempts live in `.toolcraft/journal/runs`.

## Decision Trail

Product delivery has not started. Add one entry per coherent request. Give entries a stable `Change ID` and select the current one with `Active change: <id>` outside this section. Keep every entry inside this section; display order is not execution authority.

A first delivery records request, references, applied contracts, decisions, alternatives, state/output mapping, checks and risks. A later `Entry type: focused` records `Change ID`, `Request`, `Changed owner`, `User-visible result`, `Verification` and `Risks`. `Verification` describes the actual checks and their results; command mentions never authorize execution.

For a localized, user-authorized performance iteration, record only this separate domain authority in the selected entry:

```md
- Performance intent: performance-iteration
- Performance request evidence: "<verbatim exact Request quote>"
- Performance paths: ["performance-path:%5B...%5D"]
```

Missing performance intent means ordinary work. Performance evidence must be an exact nontrivial raw Request substring; paths must be unique canonical IDs. Unresolved localization creates no path authority. Run `npm run verify:delivery` for initial functional delivery or one authorized targeted iteration; full performance certification requires a separate explicit request.

## Decisions

### Renderer

- Decision: No product renderer yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### View Interaction

- Decision: No spatial product view yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Interaction Ownership

- Decision: No product interaction ownership yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Timeline

- Decision: No product animation yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Layers

- Decision: No product layer workflow yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Controls

- Decision: No product control sections yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Export

- Decision: No product output yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

### Performance

- Decision: No product workload yet.
- Reason: The starter is intentionally neutral.
- Evidence: Replace with concrete product schema, implementation and focused evidence before first delivery.

Canonical control values and selected-entity isolation must follow runtime representations and the declared selection owner. Render-scale-enabled products record functional `renderScaleCoverage`; prose never substitutes for asserted backing-quality proof.

## Evidence

- Source reviewed: neutral starter schema and local Toolcraft docs.
- Contract applied: product decisions belong to the generated app; platform development history is not copied into this template.

## Verification

Protected receipts own initial/performance proof. Later edits record focused checks and text journal run IDs. Failed attempts and their retries remain separate; no screenshots, videos or binary traces are required by the journal.

## Risks

- Risk: Replace neutral decisions before first product delivery. Historical source revisions or message references that are unknown must remain explicitly unknown.

## Crop and Bleed (first build, unverified)

- Request: upload an image, set final size, crop with rounded corners, adjust so nothing is cropped out, set bleed in px, choose background colour, download with bleed.
- Owners: `src/app/app-schema.ts`, `crop-bleed-geometry.ts` (shared draw maths), `crop-bleed-canvas.tsx` (preview), `crop-bleed-actions.ts` (Fit all / Fill and custom PNG download).
- Decision: canvas size is synced to final size + 2 x bleed (`canvas.setSize`). Rounded corners use radius + bleed as the outer bleed outline; the dashed pink guide marks the trim. Zoom 1 covers trim + bleed; Fit all fits the whole image inside the trim.
- Decision: user explicitly chose a product-owned exact-pixel PNG export over runtime export (2K/4K/8K long edge only). This violates the product export boundary, so `npm run ai:check` fails (canvas.toBlob, createObjectURL, DOM host factory). `verify:delivery` was not run and acceptance data is still the starter placeholder.
- Checks: `tsc --noEmit` passes; manual browser check of upload, Fit all, and a 1576x1126 download for 1500x1050 + 38px bleed.
