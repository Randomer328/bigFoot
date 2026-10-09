from html.parser import HTMLParser
from urllib.request import Request, urlopen
from pathlib import Path
import json
from concurrent.futures import ThreadPoolExecutor

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.depth=0
        self.widget=None
        self.current=None
        self.blocks=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag=='div':
            self.depth+=1
            if 'elementor-widget-text-editor' in attrs.get('class','').split(): self.widget=self.depth
        if self.widget is not None and tag in ('p','li','h2','h3','h4'):
            self.current=[tag,[]]
        if tag=='br' and self.current: self.current[1].append(' ')
    def handle_data(self,data):
        if self.current: self.current[1].append(data)
    def handle_endtag(self,tag):
        if self.current and tag==self.current[0]:
            value=' '.join(''.join(self.current[1]).split())
            if value: self.blocks.append({'kind':tag,'text':value})
            self.current=None
        if tag=='div':
            if self.depth==self.widget: self.widget=None
            self.depth-=1

def fetch(slug):
    url='https://bigfootgroups.com/'+slug+'/'
    raw=urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read().decode('utf-8')
    parser=Parser();parser.feed(raw)
    return slug,{'source':url,'blocks':parser.blocks,'html':raw}

root=Path(__file__).parent
with ThreadPoolExecutor(max_workers=5) as pool:
    pages=dict(pool.map(fetch,['about-us','career','request-a-quote','clients','contact-us']))
root.joinpath('company-pages-source.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
for slug,page in pages.items():
    print(slug)
    for b in page['blocks']: print(b)
