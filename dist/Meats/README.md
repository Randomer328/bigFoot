# Bigfoot Meats & Bigfoot Australia

A shared wholesale website with five pages: home, Australia, Singapore, product range and wholesale enquiries. Built as static HTML/CSS/JavaScript, with no runtime packages.

The files in this directory are ready to serve, with no build step. Run `python -m http.server 8773` from this directory for a local preview. The repository publishing script copies this directory to `dist/Meats/` for GitHub Pages.

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
