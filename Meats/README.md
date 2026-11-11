# Bigfoot Meats Singapore

A static five-page meat-selection store. The homepage contains **one physical rack**, showing one meat type at a time: beef, chicken, lamb, mutton, goat or pork. There are 18 illustrative cuts, three per type.

## Shopping interaction

- One horizontal drag/swipe changes the meat type, with cyclic previous/next controls and accessible category dots.
- Horizontal trackpad input changes type once per gesture. Vertical scrolling remains native. ArrowLeft/ArrowRight, Home and End work from the rack region.
- Click or tap a cut to bring it forward and open its information. Other hangers recede. The information panel includes meat/cut details, cooking caption, pending pricing and quantity action.
- Closing clears attention; changing meat type closes inspection. Product selection opens the existing quantity dialog, and the cart retains requested quantities across meat types.
- A separate normal catalogue provides all cut descriptions in rendered HTML.

## Requests

Customers review their cart and contact/delivery preferences, then review a draft they can open in their own email app or copy. Nothing is sent automatically. No payment is collected and no stock or price is invented. The team confirms availability, actual cut, weight, preparation, price and delivery. Only product IDs and requested weights are saved locally; form details are not persisted. Enquiries route through enquiries@bigfoot.com.sg.

## Assets and motion

The fixed metal loop remains on the rail. Each lower hook/cut/tag assembly has independent damped pitch, swing and twist, with inertia and visual mass tuning. These are image-based assemblies with perspective, not scanned 3D assets. Reduced motion disables swinging; offscreen and hidden-tab animation is suspended. No ambient banner animation.

Two transparent WebP atlases total about 781KB. Original PNGs and exact image-generation prompts are retained in assets-source. See ASSET-SOURCES.md for provenance. No new imagery was generated for the one-rack revision.

## Build and verification

Run `python build.py`, `python verify_split.py`, `python test_racks.py`, `node test_single_rack.cjs` and `node test_physics.cjs`. JavaScript syntax checks use `node --check`. Preview with `python -m http.server 8734 --directory dist`.

The static HTML has unique metadata, canonicals, social tags, logical headings, structured data, sitemap and robots directives. Checkout is noindex. Main reading copy is 18px. Self-hosted fonts include their licenses.

## Separate Australia company

Bigfoot Australia remains its own farm and whole-carcass website at ../Australia/. Legacy australia.html redirects there. This update does not change Australia, main, India or Medicare.
