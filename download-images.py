"""Vendor the image assets already used by the website."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
import json
import sys

root=Path(__file__).parent
assets=root/'assets'/'images'
services=json.loads((root/'service-sections.json').read_text(encoding='utf-8'))
clients=['1.png','2-1.png','3-1.png','4.png','5-1.png','6.png','7.png','8.png','9.png','10.png','11-1.png','12.png','13.png']
files=list(dict.fromkeys([s[2] for s in services]+['18.jpg','22.png']+clients))
items=[('https://bigfootgroups.com/wp-content/uploads/2025/12/'+name,'2025/12/'+name) for name in files]
items += [('https://bigfootgroups.com/wp-content/uploads/2026/03/'+str(i)+'.jpg','2026/03/'+str(i)+'.jpg') for i in range(1,9)]
items += [('https://i.ytimg.com/vi/K-agmplo6Oo/maxresdefault.jpg','company-video.jpg')]

def download(item):
    url,relative=item
    target=assets/relative
    if target.is_file():return {'source':url,'file':'assets/images/'+relative,'bytes':target.stat().st_size}
    try:
        with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=15) as response:
            data=response.read()
            assert response.headers.get_content_type().startswith('image/'),url+': expected image'
    except Exception as error:
        return {'source':url,'file':None,'error':type(error).__name__}
    assert data.startswith((b'\xff\xd8\xff',b'\x89PNG',b'GIF8',b'RIFF')),url+': unrecognized image'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes(data)
    return {'source':url,'file':'assets/images/'+relative,'bytes':len(data)}

if '--inventory-only' in sys.argv:
    results=[]
    for url,relative in items:
        target=assets/relative
        results.append({'source':url,'file':'assets/images/'+relative if target.is_file() else None,'bytes':target.stat().st_size if target.is_file() else 0,'error':None if target.is_file() else 'Unavailable'})
else:
    with ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(download,items))
(root/'assets'/'image-sources.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
available=[r for r in results if r['file']]
print('Available:',len(available),'of',len(results),'images;',sum(r['bytes'] for r in available),'bytes total.')
for r in results:
    if not r['file']:print('Unavailable:',r['source'],r['error'])
if len(available)!=len(results):raise SystemExit(1)
