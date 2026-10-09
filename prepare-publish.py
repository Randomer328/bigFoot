"""Copy only the website's live files to the static hosting directory."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit

root=Path(__file__).parent
public=root/'dist'
public.mkdir(exist_ok=True)
pages=['Index.html','about-us.html','services.html','clients.html','career.html','request-a-quote.html','contact-us.html','land-transit.html','freight-forwarding.html','custom-clearance.html','warehousing.html','packers-and-movers.html','other-expertise.html']
for name in pages:
    content=(root/name).read_text(encoding='utf-8').replace('Index.html','index.html')
    (public/('index.html' if name=='Index.html' else name)).write_text(content,encoding='utf-8')
for name in ['site.css','site.js']:
    (public/name).write_bytes((root/name).read_bytes())

class Links(HTMLParser):
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key in ('href','src') and value:
                parsed=urlsplit(value)
                if not parsed.scheme and parsed.path:
                    assert (public/parsed.path).is_file(),'Missing published file: '+value
for page in public.glob('*.html'):
    Links().feed(page.read_text(encoding='utf-8'))
print('Prepared and checked 13 HTML files plus shared CSS and JavaScript for hosting.')
