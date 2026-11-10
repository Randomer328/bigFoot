# Bigfoot Meats Singapore

The separate Singapore cut-selection store. Static HTML/CSS/JavaScript with a walk-in freezer, hanging cut illustrations, catalogue, product dialogs and a local request cart.

Run `python build.py` to generate the five pages. Run `python verify_split.py` to check both Singapore and Australia static outputs. JavaScript syntax: `node --check dist/store.js`. Preview: `python -m http.server 8731 --directory dist`.

## Requests

Customers select requested weights in 0.5 kg increments, review their cart, enter contact/delivery preferences, then review a draft. They choose whether to open their email app or copy the draft. Nothing is sent automatically. There is no payment, confirmed stock or invented price. The team confirms actual cuts, weight, pricing, preparation and delivery. Only product IDs and requested weights are saved locally; personal details are never saved by the page. If browser storage is unavailable, the review link carries the selection in its URL fragment.

The six illustrative cuts need catalogue approval before being represented as confirmed stock. Enquiries route through the existing Bigfoot Group email, enquiries@bigfoot.com.sg.

## Separate Australia site

Bigfoot Australia is a separate company, published at ../Australia/ with farms, livestock and whole carcass enquiries. Legacy australia.html redirects there. Main, India and Medicare are unchanged.

## SEO and access

Public pages render their content directly in HTML with unique metadata, canonical URLs, semantic headings, Organization/WebSite/WebPage schema, social metadata and sitemaps. Checkout is noindex. Navigation, native dialogs, form validation, focus states, reduced motion and image loading are included. Body copy is 18px or larger. Self-hosted fonts and a single 368KB transparent WebP sprite keep the freezer lightweight.

Asset provenance and the generation prompt are in ASSET-SOURCES.md. The generated original is retained in assets-source/freezer-cuts.png.
