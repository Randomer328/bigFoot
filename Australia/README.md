# Bigfoot Meats Australia

Separate company website for owned farms, sheep and goat rearing, carcass supply, import and export enquiries. Built as four static pages with no runtime dependencies.

Run `python build.py` to generate pages and `node --check dist/australia.js` to check JavaScript. Run ../meats/verify_split.py to validate both outputs.

Enquiries select lamb, mutton, goat, farming or trade, with a whole number of carcasses if known. Customers review a draft, then send it using their own email app or copy it. No request is sent automatically, no details are persisted and no payment is collected. Prices, weight ranges, specifications, availability and shipment arrangements require team confirmation.

Enquiries route through enquiries@bigfoot.com.sg. No Australian address, certifications, capacity or stock figures are invented. The Singapore store is a separate company at ../Meats/.

All pages are static and crawlable, with unique SEO/social metadata, canonical URLs, Organization/WebSite/WebPage schema, sitemap and robots directives. Navigation and the form support keyboard users and mobile screens. The hero has no autonomous motion. Main, India and Medicare remain unchanged.

See ASSET-SOURCES.md for illustrative photography attribution. Fonts are self-hosted with their licenses in dist/assets/fonts/.
