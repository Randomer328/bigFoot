# Bigfoot Meats & Bigfoot Australia

A warm editorial wholesale website with five pages: home, Australia, Singapore, product range and wholesale enquiries. Built as static HTML/CSS/JavaScript, with no runtime packages.

The files in this directory are ready to serve without a build step. Run `python -m http.server 8773` in this directory for a preview. The repository publisher copies these files to `dist/Meats/`.

## Content and assets

- Farming ownership, sheep rearing, imports/exports and shared-site structure: supplied by the user.
- Taglines and goat farming/live animal exports: `C:/Users/ashve/OneDrive/Desktop/BIGFOOT/hybrid-v3/company-taglines.json`, sourced by the previous chat from the company tagline workbook.
- Draft product categories adapted from https://hillsidemeats.com.au/what-we-do/products/ (6 November 2026). These are explicitly illustrative and require Bigfoot confirmation. Hillside's certifications, machinery and capacities are not attributed to Bigfoot.
- Bigfoot logo and group contact details: existing Bigfoot main site files. Enquiries route to the group email for triage; no invented regional contact is used.
- Farm photo: Celine Lityo / Unsplash https://unsplash.com/photos/ES1VZbXlhsw ; https://images.unsplash.com/photo-1578909178066-71885fcf9aaf
- Sheep photo: Unsplash https://images.unsplash.com/photo-1484557985045-edf25e08da73
- Singapore: Unsplash https://images.unsplash.com/photo-1525625293386-3f8f99389edd
- Cargo: Unsplash https://images.unsplash.com/photo-1494412519320-aa613dfb7738
- Lamb product photo: existing user-requested Meat Co design-preview asset from https://meat-co.com/ (see sister main site's company-preview/SOURCES.md).
- All photography is illustrative, not evidence of Bigfoot-owned property or verified product stock. Photos are resized to WebP.

## Enquiry behavior

The form validates locally, presents a review dialog, then opens a mailto draft for the visitor to send. No server receives the data and no delivery confirmation is shown. Draft copy has a selection fallback if Clipboard API access is unavailable.

## Isolation

This is a separate project. The existing main, India and Medicare sites are untouched.


## Farm-to-market release · 10 November 2026

The accepted ivory, olive and burgundy design is now used throughout the website. Bigfoot Meats (Singapore) and Bigfoot Australia remain separate companies; both offer wholesale supply, imports and exports. Australia also owns farms.

- Cinematic CSS panorama with a visible pause/resume control and offscreen suspension.
- Product explorer changes photographs, product formats and enquiry links together. Arrow keys, Home/End and browser history work; selection can be linked using `?range=mutton`.
- Scrolling farming story changes an anchored image through land, livestock, product and market chapters; each chapter has a direct link.
- Reduced-motion preferences turn off the panorama, entrance effects and transitions. Mobile navigation has Escape/focus return and a no-JavaScript fallback.
- Company contact selection uses the actual company names while retaining existing `region=Singapore` and `region=Australia` links.

New illustrative product photographs:
- Mutton: https://breadandbutterexpress.com/products/imported-mutton-per-kg — resized to WebP from the retailer’s product photograph.
- Offal: https://stemplecreek.com/collections/offal — illustrative lamb liver photograph, resized to WebP.
No supplier certifications, breed/origin claims, price or availability have been transferred to Bigfoot.

Source verification ran the Python builder and link checker plus `node --check dist/script.js`. Browser checks covered all five pages at 1440, 1024, 632, 390 and 320px, including product keyboard selection, enquiry/company prefill, email review/copy, story chapter changes and mobile menu disclosure/Escape. The website prepares email drafts; actual email-client delivery is outside the site.
