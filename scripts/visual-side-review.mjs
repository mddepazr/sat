import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/snap/chromium/current/usr/lib/chromium-browser/chrome',args:['--no-sandbox']});
const page = await browser.newPage({viewport:{width:1920,height:932},reducedMotion:'reduce',locale:'es-GT'});
const routes={agencia:'/demostracion/agencia-virtual',declaraguate:'/demostracion/declaraguate',uip:'/contenido/portal/libre-acceso-la-informacion-publica/',denuncias:'/contenido/portal/contacto/denuncias-no-facturacion/',chat:'/contenido/portal/soporte-chat/'};
const metrics=[];
try {
  await fs.mkdir('evidencias/capturas-laterales',{recursive:true});
  for(const [key,route] of Object.entries(routes)) {
    await page.goto('http://127.0.0.1:5173'+route);
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
    const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.querySelector('h1')?.innerText,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}));
    if(result.scrollWidth>1920||result.brokenImages.length)throw new Error(JSON.stringify(result));
    metrics.push({key,route,...result});
    await page.screenshot({path:`evidencias/capturas-laterales/referencia-1920-${key}.png`});
  }
  await fs.writeFile('evidencias/laterales-revision-1920.json',JSON.stringify(metrics,null,2));
  console.log(JSON.stringify(metrics));
} finally {await browser.close();}
