from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen
import json

root=Path(__file__).parent
slugs=['about-us','services','clients','career','request-a-quote','land-transit','freight-forwarding','custom-clearance','warehousing','packers-and-movers','other-expertise']
files=['Index.html']+[slug+'.html' for slug in slugs]
class Audit(HTMLParser):
    def __init__(self):super().__init__();self.refs=[];self.ids=[];self.text=[];self.main=0;self.h1=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='main':self.main+=1
        if tag=='h1':self.h1+=1
        if 'id' in a:self.ids.append(a['id'])
        for key in ('href','src'):
            if key in a:self.refs.append(a[key])
    def handle_data(self,data):self.text.append(data)
audits={}
for name in files:
    source=(root/name).read_text(encoding='utf-8');a=Audit();a.feed(source);audits[name]=a
    assert '\ufffd' not in source,name+': invalid text encoding'
    assert len(a.ids)==len(set(a.ids)),name+': duplicate IDs'
    assert a.main==1 and a.h1==1,name+': missing main or unique h1'
    for ref in a.refs:
        u=urlsplit(ref)
        if not u.scheme and u.path:assert (root/unquote(u.path)).is_file(),name+': broken local reference '+ref
    response=urlopen('http://127.0.0.1:8766/'+name,timeout=10)
    assert response.status==200,name+': not served'
for name,a in audits.items():
    for ref in a.refs:
        u=urlsplit(ref)
        if not u.scheme and u.fragment:
            target=unquote(u.path) or name
            if target in audits:assert u.fragment in audits[target].ids,name+': missing anchor '+ref
services=json.loads((root/'service-sections.json').read_text(encoding='utf-8'))
for service in services:
    name=service[3].strip('/').split('/')[-1]+'.html'
    text=' '.join(audits[name].text)
    for section in service[1]:
        assert section['title'] in text,name+': missing section'
        for block in section['blocks']:assert block['text'] in text,name+': missing service content'
assert '0;url=Index.html#contact' in (root/'contact-us.html').read_text(encoding='utf-8')
for name,a in audits.items():
    assert 'contact-us.html' not in a.refs,name+': obsolete Contact Us link'
assert 'about-us.html' in audits['Index.html'].refs
print('PASS: 12 content pages served; local links, anchors, unique IDs, headings, service content, and legacy contact redirect verified.')
