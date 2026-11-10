# Bigfoot Meats Singapore

The separate Singapore cut-selection store. Static HTML/CSS/JavaScript with six clothes-shop-style hanging racks, catalogue, product dialogs and a local request cart.

Run `python build.py` to generate the five pages. Run `python verify_split.py` to check both Singapore and Australia static outputs. JavaScript syntax: `node --check dist/store.js`. Preview: `python -m http.server 8731 --directory dist`.

## Requests

Customers select requested weights in 0.5 kg increments, review their cart, enter contact/delivery preferences, then review a draft. They choose whether to open their email app or copy the draft. Nothing is sent automatically. There is no payment, confirmed stock or invented price. The team confirms actual cuts, weight, pricing, preparation and delivery. Only product IDs and requested weights are saved locally; personal details are never saved by the page. If browser storage is unavailable, the review link carries the selection in its URL fragment.

The 18 illustrative cuts across beef, chicken, lamb, mutton, goat and pork need catalogue approval before being represented as confirmed stock. Enquiries route through the existing Bigfoot Group email, enquiries@bigfoot.com.sg.

## Separate Australia site

Bigfoot Australia is a separate company, published at ../Australia/ with farms, livestock and whole carcass enquiries. Legacy australia.html redirects there. Main, India and Medicare are unchanged.

## SEO and access

Public pages render their content directly in HTML with unique metadata, canonical URLs, semantic headings, Organization/WebSite/WebPage schema, social metadata and sitemaps. Checkout is noindex. Navigation, native dialogs, form validation, focus states, reduced motion and image loading are included. Body copy is 18px or larger. Self-hosted fonts and two transparent WebP atlases totalling about 781KB keep the freezer lightweight.

Asset provenance and the generation prompt are in ASSET-SOURCES.md. The generated rack originals and exact prompts are retained in assets-source/meat-rack-1.png, meat-rack-2.png and rack-prompts.json.

## Rack interaction

One rack per meat type. Touch or horizontal wheel scrolling updates the selected cut after scrolling settles. Previous/next controls, ArrowLeft/ArrowRight, Home and End select and centre a hanger; the selected hanger comes forward and its details update alongside. Choose quantity opens the existing request dialog. No rail moves automatically. Reduced-motion settings remove transitions and smooth scrolling. The normal catalogue remains available.

New checks: `python test_racks.py` validates all six racks, 18 cuts, controls, assets and dialogs.

## Anchored hanging motion

The rack now uses a time-stepped damped pendulum with independent pitch, swing and twist per product. A fixed metal loop sits on the rail; a connected lower assembly carries the retained photo hook stem, cut and tag together. Motion uses real state/velocity integration rather than CSS hover transitions. Pointer entry/movement, keyboard focus and touch pulses provide bounded impulses; assemblies settle after release. Visual mass is animation tuning, not a product weight or specification. Reduced motion suppresses swinging, hidden tabs cancel animation and offscreen racks settle without running a continuous animation loop.

The existing photographs are reused as single assets. These are image-based assemblies with perspective, not scanned or fully modelled 3D meat. No WordPress, colour editor or artwork tools were added; the user explicitly excluded those extra requirements from their Reddit reference. Hook attachment landmarks are stored in catalogue.json and are measured from the original alpha channel without changing the images.

Run `node test_physics.cjs` for inertia, settling, mass response and bounds. The browser hook-joint check measured less than 0.001px error across seven widths.
