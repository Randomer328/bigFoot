"""Regenerate the main navigation in every phase5 page.

Edit COUNTRIES / ESG / SERVICES below, then run:  python phase5/build-site-nav.py
Only the contents of <nav id="navigation"> are replaced; the logo and mobile toggle stay as they are.
It also makes sure each page links site-nav.css and site-nav.js.
"""
import html, pathlib, re

HERE = pathlib.Path(__file__).resolve().parent
e = html.escape
CSS_TAG = '<link rel="stylesheet" href="site-nav.css?v=1">'
JS_TAG = '<script src="site-nav.js?v=1" defer></script>'
CHEV = '<svg class="bf-chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
ARROW = '<span class="bf-arrow" aria-hidden="true">→</span>'

COUNTRIES = [
    dict(code='SG', name='Singapore', site='index.html', img='assets/hero-port-fuso-orange-reefers-v11.png', cos=[
        ('Bigfoot Logistic', 'index.html'),
        ('Bigfoot Shipping', 'bigfoot-shipping.html'),
        ('Bigfoot Meats', '../Meats/index.html'),
        ('Bigfoot Medicare', 'bigfoot-medicare.html'),
        ('Bigfoot Engineering', 'bigfoot-engineering.html'),
        ('Bigfoot Trading', 'bigfoot-trading.html'),
        ('LNCST', 'lncst.html'),
        ('Bigfoot Worldwide', 'bigfoot-worldwide.html'),
        ('Bigfoot International', 'bigfoot-international.html')]),
    dict(code='IN', name='India', site='../india/index.html', img='../india/assets/india-facility-exterior.webp', cos=[
        ('Bigfoot Cold Storage & Warehouse Services', '../india/index.html#cold-storage'),
        ('Bigfoot Logistics India', '../india/index.html#handling-delivery')]),
    dict(code='AU', name='Australia', site='../Australia/index.html', img='../Australia/assets/farm-960.webp', cos=[
        ('Bigfoot Australia', '../Australia/index.html')]),
    dict(code='MY', name='Malaysia', site=None, img=None, cos=[('Bigfoot Malaysia', None)]),
]
ESG = [  # heading, heading link, child, child link, description
    ('Environment', 'esg.html#environment', 'Sustainability', 'sustainability.html', 'Fleet, energy and emissions.'),
    ('Social', 'esg.html#social', 'Community', 'community.html', 'People and the communities we serve.'),
    ('Governance', 'esg.html#governance', 'Safety', 'safety.html', 'Safety, compliance and conduct.'),
]
SERVICES = [('Bigfoot Meats SG', '../Meats/index.html', 'Online meat store'),
            ('Bigfoot Telco', 'index.html#bigfoot-telco', 'M1 prepaid distribution')]


def build(page):
    def cur(href):  # mark the link for the page we are on (the homepage marks nothing, as before)
        return ' aria-current="page"' if page != 'index.html' and href == page else ''

    def a(href, inner, cls=''):
        c = f' class="{cls}"' if cls else ''
        return f'<a{c} href="{href}"{cur(href)}>{inner}</a>'

    def dd(key, label, desktop, mobile, links):
        current = ' is-current' if page != 'index.html' and page in links else ''
        return (f'<div class="bf-dd" data-dd="{key}"><button class="bf-dd-btn{current}" type="button" aria-expanded="false" aria-controls="bf-{key}">{label} {CHEV}</button>'
                f'<div class="bf-panel" id="bf-{key}"><div class="bf-d">{desktop}</div><div class="bf-m">{mobile}</div></div></div>')

    # ---- Our Group (country cards) ----
    cards, mob, links = '', a('index.html#group', f'Explore our group {ARROW}'), []
    for c in COUNTRIES:
        head = f'<span class="bf-code">{c["code"]}</span><b>{c["name"]}</b><em>{"Visit site " + chr(8594) if c["site"] else "Coming soon"}</em>'
        img = f'<img src="{c["img"]}" alt="" loading="lazy">' if c['img'] else ''
        head = f'<a class="bf-card-h" href="{c["site"]}">{img}{head}</a>' if c['site'] else f'<div class="bf-card-h none">{head}</div>'
        lis = ''.join((f'<li>{a(h, e(n))}</li>' if h else f'<li><span>{e(n)}</span></li>') for n, h in c['cos'])
        cols = ' class="cols"' if len(c['cos']) > 4 else ''
        cards += f'<div class="bf-card">{head}<ul{cols}>{lis}</ul></div>'
        if c['site']:
            mob += f'<a class="country" href="{c["site"]}"><span class="bf-code">{c["code"]}</span>{c["name"]}<em>Visit site →</em></a>'
        else:
            mob += f'<div class="row country"><span class="bf-code">{c["code"]}</span>{c["name"]}<span class="bf-soon">Site soon</span></div>'
        mob += ''.join((a(h, e(n), 'sub') if h else f'<div class="row sub">{e(n)}</div>') for n, h in c['cos'])
        links += [h for _, h in c['cos'] if h]
    group = dd('group', 'Our Group',
               f'<div class="bf-in"><div class="bf-intro"><span class="k">Our group</span><h3>One Vision. Many Ventures. Lasting Impact.</h3>'
               f'<p>Four countries, one group. Choose a country to visit its website.</p><a href="index.html#group">Explore our group {ARROW}</a></div>'
               f'<div class="bf-cards">{cards}</div></div>', mob, links)

    # ---- ESG ----
    cols = ''.join(f'<div><span class="n">0{i + 1}</span>{a(h, n, "h")}<p>{d}</p>{a(ch, ch_n + " " + ARROW, "c")}</div>'
                   for i, (n, h, ch_n, ch, d) in enumerate(ESG))
    mob = ''.join(f'<div class="head">{n}</div>{a(h, n + " overview")}{a(ch, ch_n, "sub")}' for n, h, ch_n, ch, _ in ESG)
    esg = dd('esg', 'ESG',
             f'<div class="bf-in"><div class="bf-intro"><span class="k">ESG</span><h3>Moving Forward Responsibly.</h3>'
             f'<p>How we look after the environment, our people and the way we run the business.</p><a href="esg.html">ESG overview {ARROW}</a></div>'
             f'<div class="bf-esg">{cols}<div><img src="assets/solar-hq.jpg" alt="Solar panels on the Bigfoot headquarters roof" loading="lazy"></div></div></div>',
             mob, [x for r in ESG for x in (r[1], r[3])] + ['esg.html'])

    # ---- Services ----
    cards = ''.join(a(h, f'<b>{e(n)}</b><small>{e(d)}</small>') for n, h, d in SERVICES)
    services = dd('services', 'Services',
                  f'<div class="bf-in"><div class="bf-intro"><span class="k">Services</span><h3>Beyond Logistics.</h3>'
                  f'<p>Other services run by the group.</p></div><div class="bf-svc">{cards}</div></div>',
                  ''.join(a(h, e(n)) for n, h, _ in SERVICES), [h for _, h, _ in SERVICES])

    who = 'about-us.html' if page == 'about-us.html' else 'index.html#who-we-are'
    return (a(who, 'Who We Are') + a('solutions.html', 'What We Do') + group + esg + a('people.html', 'Career') + services +
            '<a class="button nav-contact quote-shine" href="contact.html?topic=Logistics">Request a Quote<span aria-hidden="true">↗</span></a>')


def main():
    done = []
    for f in sorted(HERE.glob('*.html')):
        s = f.read_text(encoding='utf8')
        m = re.search(r'(<nav id="navigation" aria-label="Main navigation">)(.*?)(</nav></header>)', s, flags=re.S)
        if not m:
            continue
        s = s[:m.start(2)] + build(f.name) + s[m.end(2):]
        if 'site-nav.css' not in s:
            s = s.replace('</head>', CSS_TAG + '</head>', 1)
        if 'site-nav.js' not in s:
            s = s.replace('</head>', JS_TAG + '</head>', 1)
        f.write_text(s, encoding='utf8', newline='')
        done.append(f.name)
    print(f'updated {len(done)} pages:', ', '.join(done))


if __name__ == '__main__':
    main()
