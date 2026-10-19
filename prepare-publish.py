"""Copy only the website's live files to the static hosting directory."""
from pathlib import Path
import shutil
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
if (root/'assets').is_dir():
    shutil.copytree(root/'assets',public/'assets',dirs_exist_ok=True)

phase1=root/'phase1'
if phase1.is_dir():
    (public/'phase1').mkdir(exist_ok=True)
    for file in phase1.iterdir():
        if file.suffix in ('.html','.css','.js','.png'):
            shutil.copyfile(file,public/'phase1'/file.name)

phase5=root/'phase5'
if phase5.is_dir():
    shutil.copytree(phase5,public/'phase5',dirs_exist_ok=True)

medicare=root/'medicare'
if medicare.is_dir():
    shutil.copytree(medicare,public/'medicare',dirs_exist_ok=True)

india=root/'india'
if india.is_dir():
    shutil.copytree(india,public/'india',dirs_exist_ok=True)

class Links(HTMLParser):
    def __init__(self,parent):
        super().__init__()
        self.parent=parent
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key in ('href','src') and value:
                parsed=urlsplit(value)
                if not parsed.scheme and parsed.path:
                    assert (self.parent/parsed.path).is_file(),'Missing published file: '+value
for page in public.rglob('*.html'):
    Links(page.parent).feed(page.read_text(encoding='utf-8'))
print('Prepared and checked',len(list(public.rglob('*.html'))),'HTML files plus shared CSS, JavaScript and images for hosting.')
