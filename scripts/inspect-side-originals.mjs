// Supplement REA with read-only DOM attributes/styles and public image downloads.
// No clicks, navigation, form submission, cookies or storage access.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const output = [];
try {
  for (const page of browser.contexts().flatMap(context => context.pages())) {
    if (!/^https:\/\/(portal|farm3|declaraguate)\.sat\.gob\.gt\//.test(page.url())) continue;
    const data = await page.evaluate(() => {
      const clean = value => value?.replace(/;jsessionid=[^?\s"']+/gi, '');
      const rect = el => {
        const r = el.getBoundingClientRect(), s = getComputedStyle(el);
        return { x:r.x,y:r.y,width:r.width,height:r.height,font:s.font,color:s.color,background:s.background,padding:s.padding };
      };
      return {
        url: clean(location.href), viewport:{width:innerWidth,height:innerHeight},
        links: [...document.querySelectorAll('a.fm-link')].map(el => ({text:el.innerText,href:clean(el.href),target:el.target,class:el.className})),
        images:[...document.images].map(el => ({src:clean(el.currentSrc||el.src),alt:el.alt,...rect(el)})),
        headings:[...document.querySelectorAll('h1,h2,h3')].map(el => ({text:el.innerText,...rect(el)})),
        frames:[...document.querySelectorAll('iframe')].map(el => ({src:clean(el.src),...rect(el)})),
        chat:[...document.querySelectorAll('app-root,chat-dialog,app-chat-dialog')].map(el => ({tag:el.tagName,html:el.outerHTML.slice(0,16000)})),
        svg:[...document.querySelectorAll('main svg, #main svg')].map(el => el.outerHTML),
      };
    });
    output.push(data);
  }
} finally { await browser.close(); }
await fs.writeFile('evidencias/laterales-dom-original.json', JSON.stringify(output,null,2));
console.log(JSON.stringify(output.map(x=>({url:x.url,links:x.links,headings:x.headings,frames:x.frames.map(f=>({src:f.src.split('?')[0],width:f.width,height:f.height}))})),null,2));

if (process.argv.includes('--download')) {
  const urls = [
    ['agencia-logo.png','https://farm3.sat.gob.gt/menu/javax.faces.resource/images/logAV.png.jsf'],
    ['agencia-background.png','https://farm3.sat.gob.gt/menu/resources/images/loginSAT.png?v=1.2'],
    ['declaraguate-aviso.png','https://declaraguate.sat.gob.gt/declaraguate-web/images/Banner_Aviso_Importante__V4__Normales.png'],
    ['declaraguate-logo.png','https://declaraguate.sat.gob.gt/declaraguate-web/images/Logo1.png'],
    ['uip-acceso.png','https://portal.sat.gob.gt/portal/wp-content/uploads/2018/09/Acceso-a-la-Informacion-Publica-de-Oficio.png'],
    ['uip-solicitud.png','https://portal.sat.gob.gt/portal/wp-content/uploads/2018/09/Solicitud-de-Informacion.png'],
    ['chat-rita.png','https://portal.sat.gob.gt/portal/wp-content/uploads/2020/06/banner-servicio-RITA.png'],
    ['rita-icon.png','https://s3bucket-satgt-pro-chatbot-ac-portal-sat.s3.amazonaws.com/v3.0.4/assets/icono_rita.png'],
    ['declaraguate-whatsapp.png','https://declaraguate.sat.gob.gt/declaraguate-web/images/WhatsappIcon.png'],
  ];
  await fs.mkdir('public/assets/laterales',{recursive:true});
  const manifest = await Promise.all(urls.map(async ([name,url]) => {
    const response = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});
    if (!response.ok) throw new Error(`${response.status}: ${url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Not an image: ${url}`);
    await fs.writeFile(`public/assets/laterales/${name}`,bytes);
    return {name,url,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  }));
  await fs.writeFile('evidencias/laterales-recursos.json',JSON.stringify(manifest,null,2));
  console.log('Downloaded',manifest.map(x=>x.name));
}
