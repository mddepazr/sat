import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const directory='evidencias/capturas-locales';
await fs.mkdir(directory,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/snap/chromium/current/usr/lib/chromium-browser/chrome',headless:true,args:['--no-sandbox']});
const results=[];
for(const viewport of [{width:1632,height:1000},{width:390,height:844}]){
 const page=await browser.newPage({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const external=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5173'))external.push(r.url());});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=750){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(50);}
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(300);
 const file=`${directory}/${viewport.width===390?'movil':'escritorio'}-${viewport.width}.png`;
 await page.screenshot({path:file,fullPage:true});
 results.push({viewport,file,errors,externalRequests:external,metrics:await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.body.scrollHeight,sections:Array.from(document.querySelectorAll('main>section')).map(s=>({id:s.id,class:s.className,top:s.offsetTop,height:s.offsetHeight})),brokenImages:Array.from(document.images).filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)}))});
 await page.close();
}
await fs.writeFile('evidencias/comparacion-visual-metricas.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));await browser.close();
