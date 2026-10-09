"""Generate the company's static pages using the imported original content."""
from pathlib import Path
from html import escape
import json
import re
import shutil

root=Path(__file__).parent
services=json.loads((root/'service-sections.json').read_text(encoding='utf-8'))
sources=json.loads((root/'company-pages-source.json').read_text(encoding='utf-8'))
slugs=['land-transit','freight-forwarding','custom-clearance','warehousing','packers-and-movers','other-expertise']
asset='assets/images/2025/12/'

def e(value): return escape(value,quote=True)
def link(href,label,current=False,cls=''):
    return f'<a href="{e(href)}"'+(' aria-current="page"' if current else '')+(f' class="{cls}"' if cls else '')+f'>{e(label)}</a>'

def header(active):
    links=''.join(link(slug+'.html',service[0],active==slug) for slug,service in zip(slugs,services))
    menu=f'<details class="nav-services'+(' current' if active in slugs+['services'] else '')+'"><summary>Services</summary><div class="service-menu">'+link('services.html','All services',active=='services')+links+'</div></details>'
    return '<header><div class="wrap"><a class="logo" href="Index.html">BIGFOOT<small>Supply Chain Enablers</small></a><button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-navigation"><span aria-hidden="true"></span></button><nav class="site-nav" id="site-navigation" aria-label="Main navigation">'+link('Index.html','Home',active=='home')+link('about-us.html','About Us',active=='about-us')+menu+link('clients.html','Clients',active=='clients')+link('career.html','Career',active=='career')+link('Index.html#contact','Contact Us')+link('request-a-quote.html','Request a Quote',active=='request-a-quote','quote-link')+'</nav></div></header>'

def footer():
    return '''<footer class="site-footer" id="contact"><div class="wrap"><div class="footer-grid"><div><a class="logo" href="Index.html">BIGFOOT<small>Supply Chain Enablers</small></a><p>Integrated logistics solutions across air, sea, and land.</p><p>30 Years of Utmost Service Excellence</p></div><div><h3>Explore</h3><div class="footer-links">'''+''.join(link(h,t) for h,t in [('about-us.html','About Us'),('services.html','Services'),('clients.html','Clients'),('career.html','Career'),('request-a-quote.html','Request a Quote'),('Index.html#contact','Contact Us'),('Index.html#why','Why choose us')])+'''</div></div><div><h3>Contact us</h3><p>8 Joo Koon Road<br>Singapore – 628972</p><p><a href="tel:+6598995999">+65 9899 5999</a></p><p><a href="mailto:enquiries@bigfoot.com.sg">enquiries@bigfoot.com.sg</a></p><p><a href="mailto:recruitment@bigfoot.com.sg">recruitment@bigfoot.com.sg</a></p></div></div><div class="footer-bottom"><span>© BIGFOOT Groups. All rights reserved.</span><span>Supply Chain Enablers</span></div></div></footer>'''

def hero(title,kicker,lead='',service=False):
    crumbs='<a href="Index.html">Home</a><span>/</span>'
    if service: crumbs+='<a href="services.html">Services</a><span>/</span>'
    return f'<section class="page-hero"><div class="wrap"><p class="breadcrumb">{crumbs}{e(title)}</p><p class="kicker">{e(kicker)}</p><h1>{e(title)}</h1>'+ (f'<p class="lead">{e(lead)}</p>' if lead else '')+'</div></section>'

def page(slug,title,kicker,body,lead='',service=False):
    description=lead or title+' at Bigfoot Groups. Supply Chain Enablers.'
    output=f'''<!DOCTYPE html>
<html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>{e(title)} – BIGFOOT</title><meta name="description" content="{e(description)}"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;800&family=Barlow+Condensed:wght@700;800&display=swap"><link rel="stylesheet" href="site.css"><script src="site.js" defer></script></head><body>
{header(slug)}<main>{hero(title,kicker,lead,service)}<section class="page-content"><div class="wrap">{body}</div></section></main>{footer()}
</body></html>'''
    (root/(slug+'.html')).write_text(output,encoding='utf-8')

def paragraphs(blocks):
    return ''.join('<p>'+e(b['text'])+'</p>' for b in blocks if b['kind']=='p')

def cta(title='Let’s move your business forward.',description='Talk to our team about your logistics requirements.'):
    return f'<div class="callout"><div><h2>{e(title)}</h2><p>{e(description)}</p></div><a class="button" href="request-a-quote.html">Request a Quote</a></div>'

# About: preserve the business philosophy and all group company names.
blocks=sources['about-us']['blocks']
ps=[b['text'] for b in blocks if b['kind']=='p']
principles=''.join(f'<div class="principle"><h3>{title}</h3><p>{e(text)}</p></div>' for title,text in zip(['People','Process','Professionalism'],ps[1:4]))
groups={'Singapore':[]};country='Singapore'
for b in blocks:
    if b['kind']!='li':continue
    if b['text'] in ['MALAYSIA','AUSTRALIA','INDIA']:
        country=b['text'].title();groups[country]=[]
    else:groups[country].append(b['text'])
companies=''.join('<div class="company-group"><h3>'+e(country)+'</h3><ul class="clean-list">'+''.join('<li>'+e(name)+'</li>' for name in names)+'</ul></div>' for country,names in groups.items())
about=f'<div class="split"><div class="prose"><p class="kicker">Our approach</p><h2>Business Philosophy</h2><p>{e(ps[0])}</p><div class="principles">{principles}</div><p>{e(ps[4])}</p></div><img class="editorial-image" src="https://bigfootgroups.com/wp-content/uploads/2025/12/18.jpg" alt="Bigfoot company operations"></div><div class="section-block"><div class="section-heading"><p class="kicker">Our network</p><h2>Group of Companies</h2></div><div class="company-grid">{companies}</div></div>'+cta()
page('about-us','About Us','People. Process. Professionalism.',about,'Continually striving for service excellence through our people, processes, and professionalism.')

# Services overview and individual detail pages use the complete imported text.
rows=''
for index,(slug,service) in enumerate(zip(slugs,services),1):
    title,sections,image,url=service
    intro=next(b['text'] for section in sections for b in section['blocks'] if b['kind']=='p')
    # A short overview links to the complete service copy on the detail page.
    excerpt=re.split(r'(?<=[.!?])\s+',intro)[0]
    rows+=f'<article class="service-row"><span class="service-number">{index:02d}</span><div><h2>{e(title)}</h2><p>{e(excerpt)}</p><a class="text-link" href="{slug}.html">Explore {e(title)} ↗</a></div><img src="{asset+image}" alt="{e(title)}" loading="lazy"></article>'
    accordion=''
    for i,section in enumerate(sections):
        content='';list_open=False
        for block in section['blocks']:
            if block['kind']=='li':
                if not list_open:content+='<ul>';list_open=True
                content+='<li>'+e(block['text'])+'</li>'
            else:
                if list_open:content+='</ul>';list_open=False
                content+='<p>'+e(block['text'])+'</p>'
        if list_open:content+='</ul>'
        accordion+=f'<details name="service-sections"'+(' open' if i==0 else '')+f'><summary>{e(section["title"])}</summary><div class="prose">{content}</div></details>'
    sidebar='<aside class="service-sidebar"><h2>Our services</h2><div>'+''.join(link(other+'.html',s[0],other==slug) for other,s in zip(slugs,services))+'</div><a class="button" href="request-a-quote.html">Request a Quote</a></aside>'
    detail=f'<div class="service-layout">{sidebar}<div class="service-main"><img class="editorial-image" src="{asset+image}" alt="{e(title)}"><div class="page-accordion">{accordion}</div>{cta()}</div></div>'
    page(slug,title,'Integrated logistics',detail,service=True)
page('services','Our Services','Air. Sea. Land.',rows+cta(),'Explore our integrated transportation, customs, warehousing, and specialist logistics services.')

# Clients: the original logo list, plus membership/certification assets already on the homepage.
client_files=['1.png','2-1.png','3-1.png','4.png','5-1.png','6.png','7.png','8.png','9.png','10.png','11-1.png','12.png','13.png']
def logos(files,base,label):
    return ''.join(f'<figure><img src="{base+name}" alt="{label} {i+1}" loading="lazy"></figure>' for i,name in enumerate(files))
clients='<div class="section-heading"><h2>Our Valuable Clients</h2></div><div class="logo-grid">'+logos(client_files,asset,'Client logo')+'</div><div class="section-block"><div class="section-heading"><p class="kicker">Industry affiliations</p><h2>Membership &amp; Certification</h2></div><div class="logo-grid certifications">'+logos([f'{i}.jpg' for i in range(1,9)],'assets/images/2026/03/','Membership or certification')+'</div></div>'+cta()
page('clients','Our Clients','Trusted partnerships',clients)

# Career: retain all original benefits and the recruitment contact.
career_blocks=sources['career']['blocks']
intro=' '.join(b['text'] for b in career_blocks[:3])
benefits=''
for b in career_blocks:
    if b['kind']=='li':
        title,text=b['text'].split(':',1)
        benefits+=f'<div class="principle"><h3>{e(title)}</h3><p>{e(text.strip())}</p></div>'
career=f'<div class="split"><div class="prose"><p class="kicker">Grow with us</p><h2>Join the Big-Foot Family</h2><p>{e(intro)}</p><h3>We’re Hiring</h3><p>Interested in joining our team? Please send your CV to <a href="mailto:recruitment@bigfoot.com.sg">recruitment@bigfoot.com.sg</a>.</p><div class="action-row"><a class="button" href="mailto:recruitment@bigfoot.com.sg?subject=Career%20enquiry">Email our recruitment team</a></div></div><img class="editorial-image" src="https://bigfootgroups.com/wp-content/uploads/2025/12/22.png" alt="Careers at Bigfoot"></div><div class="section-block prose"><p class="kicker">Your future at Bigfoot</p><h2>Why Work With Us?</h2>{benefits}</div>'
page('career','Career','Our people. Our greatest asset.',career)

# Quote page follows the company's existing email-based enquiry flow.
quote=f'''<div class="quote-panel prose"><p class="kicker">Tell us what you need</p><h2>Request a Quote</h2><p>{e(sources['request-a-quote']['blocks'][0]['text'])}.</p><a class="quote-email" href="mailto:enquiries@bigfoot.com.sg?subject=Quotation%20request">enquiries@bigfoot.com.sg</a><div class="action-row"><a class="button" href="mailto:enquiries@bigfoot.com.sg?subject=Quotation%20request">Email your requirements</a><a class="text-link" href="tel:+6598995999">Call +65 9899 5999</a></div><div class="quote-guide"><div><h3>Your service requirements</h3><p>Include the service you need, collection and delivery locations, and your preferred schedule.</p></div><div><h3>Your shipment details</h3><p>Share the cargo type, quantity, dimensions, and any handling requirements so our team can review your enquiry.</p></div></div></div>'''
email_form='''<section class="quote-compose" aria-labelledby="email-us-heading"><p class="kicker">Start a conversation</p><h2 id="email-us-heading">Email us now</h2><p>Tell us about your shipment or the service you need.</p><form id="quote-email-form"><div class="email-fields"><div><label for="quote-name">Your name</label><input id="quote-name" name="name" type="text" autocomplete="name" maxlength="100" required></div><div><label for="quote-email">Email address</label><input id="quote-email" name="email" type="email" autocomplete="email" maxlength="254" required></div></div><label for="quote-message">Your message</label><textarea id="quote-message" name="message" rows="7" maxlength="3000" placeholder="Describe your cargo, collection and delivery locations, preferred dates, and any special requirements…" required></textarea><div class="action-row"><button class="button" type="submit">Email us now</button><span class="email-note" id="email-draft-note">Opens a draft in your email app. Review it there before sending.</span></div></form></section>'''
quote=quote.replace('<div class="quote-guide">',email_form+'<div class="quote-guide">')
page('request-a-quote','Request a Quote','Let’s plan your next shipment',quote)

# Keep old contact URLs working while removing the standalone contact page.
(root/'contact-us.html').write_text('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=Index.html#contact"><title>Contact BIGFOOT</title></head><body><p><a href="Index.html#contact">View our contact details</a></p><script>location.replace("Index.html#contact");</script></body></html>',encoding='utf-8')

# Apply the shared theme and navigation to the existing homepage, preserving interactions.
home=root/'Index.html'
backup=root/'Index.before-white-multipage.html'
if not backup.exists():shutil.copy2(home,backup)
html=home.read_text(encoding='utf-8')
html=re.sub(r'<html\b[^>]*>','<html lang="en" data-theme="light">',html,count=1)
if 'href="site.css"' not in html:
    html=html.replace('</head>','<link rel="stylesheet" href="site.css">\n<script src="site.js" defer></script>\n</head>',1)
html=re.sub(r'<header>.*?</header>',lambda m:header('home'),html,count=1,flags=re.S)
html=re.sub(r'<footer\b[^>]*>.*?</footer>',lambda m:footer(),html,count=1,flags=re.S)
if 'class="button hero-about"' not in html:
    html=html.replace('  <button class="video-toggle"','  <a class="button hero-about" href="about-us.html">About Us</a>\n  <button class="video-toggle"',1)
html=html.replace('<section id="about"','<main>\n<section id="about"',1) if '<main>' not in html else html
if '</main>' not in html:html=html.replace('<footer class="site-footer"','</main>\n<footer class="site-footer"',1)
# Link directly to the selected service's full detail page inside the existing planet.
html=html.replace('copy.appendChild(title);copy.appendChild(accordion);big.replaceChildren(image,copy);',
'''var more=document.createElement('a');more.className='planet-more';more.textContent='View full service ↗';more.href=S[i][3].split('/').filter(Boolean).pop()+'.html';
    copy.appendChild(title);copy.appendChild(accordion);copy.appendChild(more);big.replaceChildren(image,copy);''')
home.write_text(html,encoding='utf-8')
print('Built 11 content pages, a contact redirect, and updated the homepage.')
