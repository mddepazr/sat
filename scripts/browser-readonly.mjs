// Read-only helper for the public SAT page. No navigation, clicks, forms or storage access.
import fs from 'node:fs/promises';
import path from 'node:path';
const endpoint = 'http://127.0.0.1:9222';
const targets = await (await fetch(`${endpoint}/json/list`)).json();
const target = targets.find(t => t.type === 'page' && t.url.startsWith('https://portal.sat.gob.gt/portal/'));
if (!target) throw new Error('No public SAT page target found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject) => {ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
let sequence=0; const pending=new Map();
ws.addEventListener('message', e=> {const m=JSON.parse(e.data);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}});
async function command(method,params={}) {return new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`Timeout: ${method}`));},20000);pending.set(id,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id,method,params}));});}
try {
 const {frameTree}=await command('Page.getResourceTree'); const frameId=frameTree.frame.id;
 if(process.argv[2]==='--inventory') {
  const expression=`(()=>{const selectors=['.masthead','.branding img','nav','.main-nav','.wf-wrap','#main','#servicios','#aduanas','#capacitacion','#contactanos','#Institucional','.filter-categories a','article','.post-entry-content','.ele-entry-title','.entry-title','.entry-excerpt','.elementor-element-f9acc1d img','.elementor-heading-title','.elementor-flip-box__front','.elementor-flip-box__back','footer','.float-menu','sr7-module'];return {url:location.href,viewport:{width:innerWidth,height:innerHeight,scrollY},elements:selectors.flatMap(selector=>Array.from(document.querySelectorAll(selector)).slice(0,8).map(el=>{const s=getComputedStyle(el),b=el.getBoundingClientRect();return {selector,tag:el.tagName,text:el.innerText?.slice(0,150),src:el.currentSrc||el.src||null,rect:{x:b.x,y:b.y,width:b.width,height:b.height},styles:Object.fromEntries(['color','backgroundColor','backgroundImage','fontFamily','fontSize','fontWeight','lineHeight','padding','margin','gap','display','gridTemplateColumns','maxWidth','minHeight'].map(k=>[k,s[k]]))}})),images:Array.from(document.images).map(el=>({src:el.currentSrc||el.src,lazy:el.dataset.lazySrc||null,alt:el.alt,width:el.naturalWidth,height:el.naturalHeight})),links:Array.from(document.querySelectorAll('a')).filter(el=>el.closest('header,footer,.float-menu,.fm-menu')).map(el=>({text:el.innerText,title:el.title,href:el.href})),resources:performance.getEntriesByType('resource').map(r=>({url:r.name,type:r.initiatorType}))}})()`;
  const r=await command('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw new Error('Read-only inventory evaluation failed');
  const out=process.argv[3]||'evidencias/medidas-publicas.json';await fs.writeFile(out,JSON.stringify({method:'Supplementary read-only CDP DOM/style inspection; no navigation or events dispatched',capturedAt:new Date().toISOString(),...r.result.value,resourceTree:frameTree},null,2));console.log(`Inventory saved: ${out}`);
 } else if(process.argv[2]==='--download-list') {
  const list=JSON.parse(await fs.readFile(process.argv[3],'utf8'));const results=[];
  for(const entry of list){const url=entry.url;const u=new URL(url);if(u.origin!=='https://portal.sat.gob.gt'||! /\.(png|jpe?g|webp|gif|svg|woff2?|ttf|css)(\?|$)/i.test(url))throw new Error(`Outside public asset scope: ${url}`);
   try {let body;let provenance='Page.getResourceContent';try{const r=await command('Page.getResourceContent',{frameId,url});body=Buffer.from(r.content,r.base64Encoded?'base64':'utf8');}catch{
    provenance='Browser public static GET';const expression=`fetch(${JSON.stringify(url)},{method:'GET',cache:'force-cache'}).then(async r=>{if(!r.ok)throw new Error('HTTP '+r.status);const a=new Uint8Array(await r.arrayBuffer());let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s)})`;
    const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||'Public asset unavailable');body=Buffer.from(r.result.value,'base64');}
    await fs.mkdir(path.dirname(entry.path),{recursive:true});await fs.writeFile(entry.path,body);results.push({url,path:entry.path,bytes:body.length,method:provenance,state:'saved'});
   }catch(e){results.push({url,path:entry.path,state:'unavailable',error:e.message});}
  }
  await fs.writeFile(process.argv[4]||'evidencias/descarga-navegador.json',JSON.stringify(results,null,2));console.log(JSON.stringify({saved:results.filter(x=>x.state==='saved').length,failed:results.filter(x=>x.state!=='saved').length}));
 } else throw new Error('Use --inventory or --download-list');
} finally {ws.close();}
