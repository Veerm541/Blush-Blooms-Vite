# Blush Blooms UI Completion Notes

This prototype pass focuses on completing the visible customer and administrative interfaces described by the current SRS/SDD. Backend/database behavior is still prototype/localStorage based unless already present.

## v8 Shop button and responsive UI pass
- Reworked Shop card actions into a clearer primary `Add to bag` button and secondary `View details` button with icons.
- Kept product-card actions aligned by making Shop cards equal-height and pushing actions to the card bottom.
- Improved Shop grid behavior across desktop, tablet, and phone widths.
- Made filters horizontally scrollable on narrow phones and the sort control full-width when needed.
- Made product modal actions responsive and easier to tap.
- Added consistent focus, hover, active, and minimum touch-target behavior to common buttons without changing their existing functions.

## Customer UI covered
- Home / storefront landing page
- Product catalog with filters, sorting, and product-detail modal
- Shopping bag/cart
- 2D bouquet customizer UI with Flowers / Wrappers / Ribbons tabs
- Size presets, snap-to-grid, rotate/scale/flip/duplicate/remove controls
- Real-time custom bouquet summary and pricing
- Checkout with Store Pick-Up or Delivery
- Cash on Pick-Up / Cash on Delivery / GCash proof upload UI
- Order status lookup with separate pickup/delivery status flows
- GCash verification status display
- Contact page

## Admin UI covered
- Secure-looking admin login prototype
- Dashboard operational summary
- Pending GCash verification count
- Active preparation and scheduled-today cards
- Recent orders and catalog inventory overview
- Order search and filtering
- Pickup/delivery order detail panels
- GCash proof review UI with Approve/Reject prototype controls
- Bouquet snapshot and itemized component display
- Fulfillment status controls and internal-note/cancellation UI
- Product catalog management UI
- Flower/wrapper/ribbon asset management UI
- Sales and reporting dashboard
- Payment, fulfillment, and status breakdowns
- Transaction history and print/export UI placeholders

## Important implementation note
Several controls are intentionally prototype/UI-only. The final implementation should connect the React frontend to the planned Node.js/Express API and PostgreSQL/Supabase data source, then replace the current localStorage/sessionStorage behavior.

## Customizer-focused revision
The 2D bouquet customizer was rebuilt as the primary client-facing feature. It now uses transparent vector-style flower stems, fillers, greenery, wrappers, and ribbons instead of square flower photos; provides a removable starter wrapper; uses large text action controls; preserves object size/rotation/flip when duplicating; uses clearer Small/Medium/Large visual bouquet boundaries; and moves the large, easy-English Visual Guide directly beside the customizer workflow.

The interaction remains implemented with React DOM positioning in this UI prototype so it can run without adding a new canvas dependency. The vector object model and controls are intentionally structured so the canvas can later be migrated to Fabric.js while keeping the same client-facing UX and data categories.

## Customizer v5 revision
- **Wrappers redrawn from the shop photos.** Each wrapper is a flared fan of layered, scalloped paper sheets (pink, royal blue, black & grey, kraft & cream) in two layers: the back sheets sit behind the flowers and the front fold sits in front of the stems, so stems go *into* the wrap like the real bouquets.
- **Wrappers come first.** The Wrappers tab is first and selected by default; flowers are added into the wrap. Only one wrapper per bouquet: tapping another wrapper swaps the look and keeps the layout. No wrapper is added automatically any more.
- **Canva-style handling.** Boxes now hug the artwork (no invisible padding), only the painted parts of a drawing react to the pointer, dragging is free (no grid snapping), corner dots resize, the top dot turns (snaps to 15 degrees), centre guide lines appear while dragging, arrow keys nudge (Shift = 10 px), Delete removes. Double-click-to-remove was removed to avoid accidental deletes.
- **Seasonal notice** at the top of the customizer, from SPMP risks BR04 (seasonal stem unavailability) and BR06 (real stems/shades may differ from the preview).
- **Florist snapshot** is now drawn directly from the same artwork in the same stacking order and cropped to the bouquet (html2canvas is no longer used by the customizer).
- `scripts/measure-assets.mjs` re-measures the crop boxes whenever a drawing changes (needs `npm i -D sharp`).
- Still React/DOM, not Fabric.js yet.

## Customizer v6 revision
- Added familiar design-tool shortcuts: **Ctrl/Cmd+C** copies the current selection, **Ctrl/Cmd+V** pastes it, **Ctrl/Cmd+Z** undoes the last edit, **Ctrl/Cmd+Shift+Z / Ctrl+Y** redoes, and **Ctrl/Cmd+A** selects all bouquet objects.
- Added clear on-screen **Undo, Redo, Copy, Paste, and Clear** buttons so customers do not need to memorize keyboard shortcuts.
- Added **box (marquee) selection**: drag across an empty part of the bouquet canvas to select several objects. Shift-click adds/removes individual objects from the selection, and dragging any selected object moves the selected group together.
- Multi-selected objects can be rotated, resized, flipped, duplicated, or removed together. Wrapper duplication is still prevented because the bouquet supports one wrapper at a time.
- New tapped flowers/fillers/greenery now use a **smart open-space spawn** routine. The customizer scores several positions within the wrapper/bouquet guide and chooses a less crowded location instead of stacking every new object in the center. New ribbons similarly look for an open position around the wrapper neck.
- Undo history is recorded for add, remove, clear, move, resize, rotate, duplicate, paste, toolbar transforms, and keyboard nudging.

## Customizer v7 drag accessibility update
- Selecting a bouquet object now shows a prominent pink **Drag to move** handle directly on the selection.
- Multi-selection shows a **Drag selected** handle that moves the selected objects together.
- Fillers and greenery use a friendlier clickable bounding area so thin stems are easier to select.
- Step 3 now includes a plain-language movement hint for users who may not be familiar with design tools.

## v8 Shop button and responsive UI pass
- Reworked Shop card actions into a clearer primary `Add to bag` button and secondary `View details` button with icons.
- Kept product-card actions aligned by making Shop cards equal-height and pushing actions to the card bottom.
- Improved Shop grid behavior across desktop, tablet, and phone widths.
- Made filters horizontally scrollable on narrow phones and the sort control full-width when needed.
- Made product modal actions responsive and easier to tap.
- Added consistent focus, hover, active, and minimum touch-target behavior to common buttons without changing their existing functions.
