// Local-only audit: inspect layout and capture each independent view.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/snap/chromium/current/usr/lib/chromium-browser/chrome',headless:true,args:['--no-sandbox']});
const routes={agencia:'/demostracion/agencia-virtual',declaraguate:'/demostracion/declaraguate',uip:'/contenido/portal/libre-acceso-la-informacion-publica/',denuncias:'/contenido/portal/contacto/denuncias-no-facturacion/',chat:'/contenido/portal/soporte-chat/'};
const sizes=[[320,740],[390,844],[768,1024],[1024,768],[1440,900],[844,390]];
const records=[];
const output=process.argv[2]||'evidencias/responsive-auditoria';
await fs.mkdir(output,{recursive:true});
try {
  for(const [width,height] of sizes){
    const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1100,reducedMotion:'reduce'});
    const page=await context.newPage();
    for(const [key,route] of Object.entries(routes)){
      await page.goto('http://127.0.0.1:5173'+route);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
      records.push({key,width,height,...await page.evaluate(()=>({
        viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        smallControls:[...document.querySelectorAll('main button,main input,main select')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&b.height<40;}).slice(0,16).map(e=>({text:(e.innerText||e.getAttribute('aria-label')||e.type).slice(0,50),height:Math.round(e.getBoundingClientRect().height)})),
        overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>document.documentElement.clientWidth+1||r.left< -1)&&!e.closest('.dg-table-wrap');}).slice(0,8).map(e=>({tag:e.tagName,class:e.className})),
      }))});
      await page.screenshot({path:`${output}/${width}x${height}-${key}.png`});
    }
    await context.close();
  }
  await fs.writeFile(`${output}/metricas.json`,JSON.stringify(records,null,2));
  console.log(JSON.stringify(records));
}finally{await browser.close();}
