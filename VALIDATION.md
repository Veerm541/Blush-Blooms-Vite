# v9 validation

`npm run build` passed with Vite 5.4.21. Dependencies and the lockfile were preserved.

36 automated model and jsdom interaction checks passed, covering:

- All three flower limits, mixed paste batches, duplicate/add rejection and safe downsizing.
- Part grouping, prices, rotated bounds, group movement and wrapper/front layering.
- Toolbar placement and removal of greenery/filler tabs.
- Undo/redo, clear confirmation and restoring a cleared design.
- Optional filler inclusion, capacity and removal of its charge.
- Simulated touch movement, corner resize, rotation, pinch zoom and pan.
- Preserving logical coordinates when the simulated viewport changes to phone dimensions.
- Saving bouquet metadata to cart, GCash proof requirement/upload, checkout and order status.
- Admin login, invoice customer/quantity/reference/total, print invocation and closing the modal.
- No runtime errors in the exercised interactions.

The repeatable pure model tests are included in `tests/model.test.mjs` and run with Node's built-in test runner.

## Browser/device validation still needed

A Chromium installation was unavailable and its download failed in this environment. jsdom does not render layout or validate native browser touch behavior. Canvas image decoding/PNG encoding were mocked for the cart metadata check. Actual bouquet snapshot appearance and printed PDF pagination need a real-browser check.

Before deploying, check the editor at 320, 390, 768, 1024 and 1440 px widths, including portrait and landscape. On iOS Safari and Android Chrome, add parts, drag/resize/rotate them, pinch/pan, use Fit, add/remove filler, reach each size limit, clear/undo and save to the bag. Confirm there is no page overflow and that the saved snapshot matches the arrangement. Complete checkout and open the resulting invoice; preview Save as PDF. Also inspect Home, Shop, checkout, order status, inventory, dashboard and orders on a phone.
