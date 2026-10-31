#!/usr/bin/env python3
"""Extract public content from retained REA sources; download only images/fonts/CSS.

Never evaluates the captured JavaScript or submits a request body. Downloaded CSS
is evidence only, not application code. Existing assets are reused by URL.
"""
import concurrent.futures
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unicodedata
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', 'Referer': 'https://portal.sat.gob.gt/portal/', 'Accept': '*/*'}
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Node:
    def __init__(self,tag='',attrs=None,parent=None):
        self.tag=tag;self.attrs=dict(attrs or []);self.parent=parent;self.children=[]
    def cls(self,name): return name in self.attrs.get('class','').split()
    def all(self,predicate):
        result=[]
        for c in self.children:
            if isinstance(c,Node):
                if predicate(c):result.append(c)
                result+=c.all(predicate)
        return result
    def first(self,predicate): return next(iter(self.all(predicate)),None)
    def text(self):return ' '.join(''.join(x.text() if isinstance(x,Node) else x for x in self.children).split())
    def ancestor(self,predicate):
        p=self.parent
        while p:
            if predicate(p):return p
            p=p.parent
        return None

class Tree(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.root=Node();self.current=self.root
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs,self.current);self.current.children.append(n)
        if tag not in VOID:self.current=n
    def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
    def handle_endtag(self,tag):
        p=self.current
        while p.parent:
            if p.tag==tag:self.current=p.parent;return
            p=p.parent
    def handle_data(self,s):self.current.children.append(s)

def img(n):
    if n is None:return None
    i=n if n.tag=='img' else n.first(lambda x:x.tag=='img')
    if not i:return None
    return i.attrs.get('data-src') or i.attrs.get('data-lazy-src') or i.attrs.get('src')

def cleanurl(u):
    if not u:return None
    return u.replace('\\/','/')

def main():
    capture=json.loads((ROOT/'evidencias/rea-captura-publica.json').read_text())
    cap=capture['normalized_result'];sources=cap['scripts']['items']
    script=sources[24]['source']['artifact']['text'];start=script.index('+ ')+2
    markup,_=json.JSONDecoder().raw_decode(script[start:]);tree=Tree();tree.feed(markup);root=tree.root
    data={'provenance':{'captureEvidenceId':capture['evidence_id'],'printScriptIndex':24,'printScriptSHA256':sources[24]['source']['artifact']['sha256'],'note':'Content decoded from a string literal; not executed.'},'services':{},'customs':{},'training':[],'contacts':[],'news':[],'institutional':[],'slides':[],'assets':{}}
    for target,widget in zip(('services','customs'),root.all(lambda n:n.attrs.get('data-widget_type')=='the7_elements.default')):
        cats=[]
        for a in widget.all(lambda n:n.tag=='a' and n.cls('filter-item')):
            cats.append({'name':a.text(),'id':a.attrs.get('data-filter','').lstrip('.'),'url':a.attrs.get('href'),'default':a.cls('act')})
        cards=[]
        for art in widget.all(lambda n:n.tag=='article'):
            heading=art.first(lambda n:n.tag in ('h2','h3','h4'))
            a=heading.first(lambda n:n.tag=='a') if heading else art.first(lambda n:n.tag=='a')
            desc=art.first(lambda n:n.cls('entry-excerpt'))
            wrapper=art.ancestor(lambda n:n.cls('wf-cell'))
            categories=[x for x in (wrapper.attrs.get('class','').split() if wrapper else []) if x.startswith('category-')]
            cards.append({'id':art.attrs.get('data-name',a.text() if a else ''),'title':heading.text() if heading else art.attrs.get('data-name',''),'description':desc.text() if desc else '', 'url':a.attrs.get('href') if a else '', 'sourceImage':img(art),'categories':categories,'initiallyVisible':art.cls('visible')})
        data[target]={'categories':cats,'cards':cards}
    for w in root.all(lambda n:n.attrs.get('data-widget_type')=='flip-box.default'):
        h=w.first(lambda n:n.cls('elementor-flip-box__layer__title'));back=w.first(lambda n:n.cls('elementor-flip-box__back'));desc=back.first(lambda n:n.cls('elementor-flip-box__layer__description')) if back else None
        backlinks=([back] if back and back.tag=='a' else [])+(back.all(lambda n:n.tag=='a') if back else [])
        links=[{'title':a.text().lstrip('> ').strip(),'url':a.attrs.get('href')} for a in backlinks]
        front=w.first(lambda n:n.cls('elementor-flip-box__front'))
        frontdesc=front.first(lambda n:n.cls('elementor-flip-box__layer__description')) if front else None
        entry={'title':h.text() if h else (frontdesc.text() if frontdesc else ''), 'widgetId':w.attrs.get('data-id'),'description':desc.text() if desc else '', 'links':links}
        if entry['widgetId']=='fa8c3b5':
            entry['title']='CLIC · El poder anticorrupción'
            entry['labelSource']='Provided visual reference; title is graphical in the artwork.'
            for link in entry['links']:link['title']=entry['title']
        data['training' if len(data['training'])<6 else 'contacts'].append(entry)
    for art in root.all(lambda n:n.tag=='article' and not n.cls('dt_portfolio')):
        h=art.first(lambda n:n.tag in ('h2','h3','h4'));a=h.first(lambda n:n.tag=='a') if h else None
        desc=art.first(lambda n:n.cls('entry-excerpt'));tm=art.first(lambda n:n.tag=='time')
        data['news'].append({'title':h.text() if h else '', 'description':desc.text() if desc else '', 'url':a.attrs.get('href') if a else '', 'sourceImage':img(art),'date':tm.attrs.get('datetime') if tm else None})
    for w in root.all(lambda n:n.attrs.get('data-widget_type')=='icon-box.default'):
        h=w.first(lambda n:n.cls('elementor-icon-box-title'));desc=w.first(lambda n:n.cls('elementor-icon-box-description'));a=w.first(lambda n:n.tag=='a')
        data['institutional'].append({'title':h.text() if h else '', 'description':desc.text() if desc else '', 'url':a.attrs.get('href') if a else '', 'sourceImage':img(w),'widgetId':w.attrs.get('data-id')})
    # Slider configuration is also a JSON literal; parse it without executing.
    ss=sources[30]['source']['artifact']['text'];p=ss.index('=')+1
    slider,_=json.JSONDecoder().raw_decode(ss[p:].lstrip())
    data['sliderConfig']=slider
    # Download resources referenced by the source, including deferred images.
    urls=set()
    for r in cap['resources']:
        if r['type'] in ('Image','Font','Stylesheet') and not r['url'].endswith('.gif'):urls.add(r['url'])
    for n in root.all(lambda n:n.tag=='img'):
        u=img(n)
        if u and u.startswith('https://portal.sat.gob.gt/'):urls.add(u)
    supplementary=ROOT/'evidencias/medidas-publicas.json'
    if supplementary.exists():
        for image in json.loads(supplementary.read_text()).get('images',[]):
            u=image.get('src')
            if u and u.startswith('https://') and not u.endswith('.gif'):urls.add(u)
    for u in re.findall(r'https?[^\s"\'<>]+',json.dumps(slider,ensure_ascii=False).replace('\\/','/')):
        if re.search(r'\.(?:jpe?g|png|webp|svg)(?:\?|$)',u,re.I):urls.add(u)
    assetroot=ROOT/'public/assets';assetroot.mkdir(parents=True,exist_ok=True)
    cssroot=ROOT/'evidencias/estilos-originales';cssroot.mkdir(parents=True,exist_ok=True)
    oldpath=ROOT/'evidencias/recursos.json'
    old=json.loads(oldpath.read_text()) if oldpath.exists() else {'resources':[]}
    previous={x['url']:x for x in old['resources']}
    records={}
    def download(u):
        if u in previous and previous[u].get('status')=='downloaded' and (ROOT/previous[u]['path']).is_file():return previous[u]
        basename=urllib.parse.unquote(urllib.parse.urlparse(u).path.rsplit('/',1)[-1])
        basename=unicodedata.normalize('NFKD',basename).encode('ascii','ignore').decode()
        basename=re.sub(r'[^\w.-]+','-',basename)
        dest=(cssroot if basename.endswith('.css') else assetroot)/(hashlib.sha256(u.encode()).hexdigest()[:8]+'-'+basename)
        try:
            request=urllib.request.Request(urllib.parse.quote(u,safe=':/?=&%'),headers=HEADERS)
            with urllib.request.urlopen(request,timeout=35) as r:body=r.read();mime=r.headers.get('Content-Type','')
            if 'text/html' in mime:raise ValueError('HTML challenge instead of asset')
            dest.write_bytes(body)
            return {'url':u,'path':str(dest.relative_to(ROOT)),'local':'/assets/'+dest.name if dest.parent==assetroot else None,'sha256':hashlib.sha256(body).hexdigest(),'bytes':len(body),'mime':mime,'status':'downloaded','origin':'REA retained source/resource URL; public GET with browser headers'}
        except Exception as e:return {'url':u,'status':'unavailable','error':type(e).__name__+': '+str(e)}
    def run(batch):
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            for r in pool.map(download,sorted(batch)):records[r['url']]=r
    run(urls)
    # Background artwork and locally hosted font declarations live in Elementor CSS.
    extra=set()
    for record in list(records.values()):
        if record.get('path','').endswith('.css'):
            css=(ROOT/record['path']).read_text(errors='replace')
            for raw in re.findall(r'url\(\s*[\'\"]?([^\)\'\"]+)',css):
                u=urllib.parse.urljoin(record['url'],raw.strip())
                if u.startswith('https://portal.sat.gob.gt/') and re.search(r'\.(png|jpe?g|svg|webp|woff2?|ttf)(\?|$)',u,re.I):extra.add(u)
    run(extra-set(records))
    data['assets']={u:r['local'] for u,r in records.items() if r.get('local')}
    for section in ('services','customs'):
        for card in data[section]['cards']:card['image']=data['assets'].get(card['sourceImage'])
    for section in ('news','institutional'):
        for card in data[section]:card['image']=data['assets'].get(card.get('sourceImage'))
    # Associate artwork declared on exact Elementor widget selectors.
    pagecss=next((ROOT/'evidencias/estilos-originales').glob('*post-52883.css')).read_text()
    for section in ('training','contacts'):
        for entry in data[section]:
            pattern=r'\.elementor-element-'+re.escape(entry['widgetId'])+r'\s+\.elementor-flip-box__front\{([^}]+)\}'
            rule=re.search(pattern,pagecss)
            if rule:
                url=re.search(r'background-image:url\([\"\']?([^\)\"\']+)',rule.group(1))
                if url:entry['sourceImage']=url.group(1);entry['image']=data['assets'].get(url.group(1))
                size=re.search(r'background-size:([^;]+)',rule.group(1))
                if size:entry['backgroundSize']=size.group(1)
    for entry in data['institutional']:
        position=markup.index('data-id="'+entry['widgetId']+'"')
        start=markup.find('<svg',position);end=markup.find('</svg>',start)+6
        if start>=0 and end>start:
            body=markup[start:end].encode();dest=assetroot/('inline-'+entry['widgetId']+'.svg');dest.write_bytes(body)
            source='inline:print-script-24:widget-'+entry['widgetId'];entry['sourceImage']=source;entry['image']='/assets/'+dest.name
            records[source]={'url':source,'path':str(dest.relative_to(ROOT)),'local':entry['image'],'sha256':hashlib.sha256(body).hexdigest(),'bytes':len(body),'mime':'image/svg+xml','status':'downloaded','origin':'Exact inline SVG bytes extracted from retained HTML literal; no evaluation.'}
    for s in slider['slides']:
        source=s['params'].get('bg',{}).get('image')
        data['slides'].append({'title':s['params'].get('title'),'sourceImage':source,'image':data['assets'].get(source),'width':s['params'].get('bg',{}).get('imageWidth'),'height':s['params'].get('bg',{}).get('imageHeight'),'order':s.get('order')})
    data['slides'].sort(key=lambda s:(not ('Canales Denuncia' in s['title']),int(s['order'])))
    data['provenance']['initialSlideChoice']='Denuncia matches the supplied visual reference; source order remains in each slide.order.'
    (ROOT/'src/data').mkdir(parents=True,exist_ok=True)
    (ROOT/'src/data/portal.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    provenance={'sourceCapture':'evidencias/rea-captura-publica.json','sourceEvidenceId':capture['evidence_id'],'resources':sorted(records.values(),key=lambda r:r['url']),'notes':['Only static public GET downloads; no original tracking or service scripts are executed.','Original CSS is retained solely as visual evidence, outside public/.','HTML and slider configuration are decoded string/JSON literals, not evaluated.']}
    oldpath.write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
    print('Extracted:',{k:len(data[k]['cards']) for k in ('services','customs')})
    print('Downloads:',sum(r['status']=='downloaded' for r in records.values()),'of',len(records))
    for r in records.values():
        if r['status']!='downloaded':print('Unavailable:',r['url'],r['error'])

if __name__=='__main__':main()
