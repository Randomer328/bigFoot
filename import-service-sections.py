from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
import json
import re
import shutil

class ContentParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.widget_depth = None
        self.blocks = []
        self.current = None
        self.strong_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'div':
            self.depth += 1
            if 'elementor-widget-text-editor' in attrs.get('class', '').split():
                self.widget_depth = self.depth
        if self.widget_depth is None:
            return
        if tag in ('p', 'li', 'h3', 'h4', 'h5'):
            self.current = {'kind': tag, 'text': [], 'bold': []}
        if tag in ('strong', 'b'):
            self.strong_depth += 1
        if tag == 'br' and self.current:
            self.current['text'].append(' ')

    def handle_data(self, data):
        if self.current and self.widget_depth is not None:
            self.current['text'].append(data)
            if self.strong_depth:
                self.current['bold'].append(data)

    def handle_endtag(self, tag):
        if tag in ('strong', 'b'):
            self.strong_depth = max(0, self.strong_depth - 1)
        if self.current and tag == self.current['kind']:
            text = ' '.join(''.join(self.current['text']).split())
            bold = ' '.join(''.join(self.current['bold']).split())
            if text:
                kind = 'heading' if tag.startswith('h') or (text == bold and tag == 'p') else tag
                self.blocks.append({'kind': kind, 'text': text})
            self.current = None
        if tag == 'div':
            if self.widget_depth == self.depth:
                self.widget_depth = None
            self.depth -= 1

services = [
    ('Land Transit', 'land-transit', '2.jpg'),
    ('Freight Forwarding', 'freight-forwarding', '5.png'),
    ('Custom Clearance', 'custom-clearance', '6.jpg'),
    ('Warehousing', 'warehousing', '7.jpg'),
    ('Packers and Movers', 'packers-and-movers', '8a.jpg'),
    ('Other Expertise', 'other-expertise', '9.jpg'),
]

def extract(service):
    title, slug, image = service
    url = 'https://bigfootgroups.com/' + slug + '/'
    source = urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read().decode('utf-8')
    parser = ContentParser()
    parser.feed(source)
    sections = []
    for block in parser.blocks:
        if block['kind'] == 'heading':
            sections.append({'title': block['text'], 'blocks': []})
        else:
            if not sections:
                sections.append({'title': 'Overview', 'blocks': []})
            sections[-1]['blocks'].append(block)
    assert sections and all(s['blocks'] for s in sections), title + ': missing content'
    return [title, sections, image, url]

with ThreadPoolExecutor(max_workers=6) as pool:
    content = list(pool.map(extract, services))

root = Path(__file__).parent
root.joinpath('service-sections.json').write_text(json.dumps(content, ensure_ascii=False, indent=2), encoding='utf-8')
path = root / 'Index.html'
backup = root / 'Index.before-service-accordions.html'
if not backup.exists():
    shutil.copy2(path, backup)
html = path.read_text(encoding='utf-8')
html, count = re.subn(r'var S=\[.*?\];', lambda m: 'var S=' + json.dumps(content, ensure_ascii=False) + ';', html, count=1, flags=re.S)
assert count == 1
html = html.replace('Service copy uses short excerpts from the linked service pages.', 'Service sections preserve the paragraphs and lists from the linked service pages; Overview is an added grouping label where the source has no section heading.')
path.write_text(html, encoding='utf-8')
for title, sections, _, _ in content:
    print(title + ': ' + ', '.join(s['title'] for s in sections))
print('Imported', sum(len(s[1]) for s in content), 'sections from six service pages.')
