import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const routes={
  agencia:['Agencia Virtual','/demostracion/agencia-virtual',true],
  declaraguate:['Declaraguate','/demostracion/declaraguate',true],
  uip:['UIPSAT','/contenido/portal/libre-acceso-la-informacion-publica/',true],
  denuncias:['Denuncias Tributarias','/contenido/portal/contacto/denuncias-no-facturacion/',false],
  chat:['Chat SAT','/contenido/portal/soporte-chat/',false],
};

test.beforeEach(async({context})=>{
  context.on('page',page=>page.on('pageerror',error=>{throw error;}));
});

async function usable(locator,{touch=true}={}){
  await expect(locator).toBeVisible();
  await locator.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest'}));
  const box=await locator.boundingBox();
  if(touch)expect(box.height).toBeGreaterThanOrEqual(44);
  const available=await locator.evaluate(el=>{
    const r=el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
  });
  expect(available,'El centro del control debe quedar libre de superposiciones').toBe(true);
}

async function tap(locator,options){await usable(locator,options);await locator.click();}
async function openView(page,key){
  await page.goto('/');
  const [name,path,popup]=routes[key];
  const link=page.getByRole('complementary',{name:'Accesos rápidos'}).getByRole('link',{name,exact:true});
  await usable(link);
  let view=page;
  if(popup){const pending=page.waitForEvent('popup');await link.click();view=await pending;await expect(page).toHaveURL('http://127.0.0.1:5173/');}
  else await link.click();
  await expect(view).toHaveURL('http://127.0.0.1:5173'+path);
  await view.getByRole('heading',{level:1}).waitFor();
  return view;
}

async function audit(page,testInfo,name){
  const width=testInfo.project.use.viewport.width;
  await page.evaluate(async()=>{await document.fonts.ready;const scope=document.querySelector('dialog[open]')||document.querySelector('main');await Promise.all([...scope.querySelectorAll('img')].filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.y<innerHeight;}).map(i=>i.decode().catch(()=>{})));});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  expect(await page.locator('main img').evaluateAll(items=>items.filter(i=>i.loading!=='lazy'&&(!i.complete||!i.naturalWidth)).map(i=>i.src))).toEqual([]);
  const clipped=await page.locator('main input,main textarea,main select,dialog[open]').evaluateAll(items=>items.filter(el=>{
    const r=el.getBoundingClientRect();return r.width>0&&(r.x<0||r.right>document.documentElement.clientWidth+1);
  }).map(el=>el.outerHTML.slice(0,160)));
  expect(clipped).toEqual([]);
  await fs.mkdir(`evidencias/responsive/${testInfo.project.name}`,{recursive:true});
  await page.screenshot({path:`evidencias/responsive/${testInfo.project.name}/${name}.png`});
}

test('Agencia Virtual: acceso, recuperación y sesión sin cortes',async({page},info)=>{
  const view=await openView(page,'agencia'),touch=info.project.use.hasTouch;
  await view.evaluate(()=>scrollTo(0,0));await audit(view,info,'agencia');
  await tap(view.getByRole('button',{name:'¿Olvidaste tu correo electrónico de Agencia Virtual?',exact:true}),{touch});
  await expect(view.getByRole('status')).toContainText('Correo del caso ficticio');
  await usable(view.getByRole('button',{name:'Cerrar información',exact:true}),{touch});
  await audit(view,info,'agencia-recuperacion');
  await view.getByRole('button',{name:'Cerrar información',exact:true}).click();
  await tap(view.getByRole('button',{name:'INICIAR SESIÓN',exact:true}),{touch});
  await expect(view.getByRole('status')).toContainText('Sesión ficticia');
  await audit(view,info,'agencia-sesion');
  await tap(view.getByRole('button',{name:'Cerrar sesión de ejemplo',exact:true}),{touch});
});

test('Declaraguate: tabla contenida, formulario abierto y monto conservado',async({page},info)=>{
  const view=await openView(page,'declaraguate'),touch=info.project.use.hasTouch;
  await audit(view,info,'declaraguate');
  const table=view.getByRole('region',{name:'Catálogo de formularios'});
  await table.scrollIntoViewIfNeeded();
  const canScroll=await table.evaluate(el=>{el.scrollLeft=el.scrollWidth;return {width:el.clientWidth,scrollWidth:el.scrollWidth,moved:el.scrollLeft};});
  if(info.project.use.viewport.width<700)expect(canScroll.scrollWidth).toBeGreaterThan(canScroll.width);
  if(canScroll.scrollWidth>canScroll.width)expect(canScroll.moved).toBeGreaterThan(0);
  await table.evaluate(el=>el.scrollLeft=0);
  await tap(view.getByRole('button',{name:'IVA PEQUEÑO CONTRIBUYENTE',exact:true}),{touch});
  await view.getByLabel('Monto ficticio (Q)',{exact:true}).fill('250.50');
  await usable(view.getByRole('button',{name:'Guardar formulario de ejemplo',exact:true}),{touch});
  await audit(view,info,'declaraguate-formulario');
  await view.getByRole('button',{name:'Guardar formulario de ejemplo',exact:true}).click();
  await tap(view.getByRole('button',{name:'Ir a Presentar formulario',exact:true}),{touch});
  await expect(view.locator('.dg-workspace')).toContainText('Q250.50');
  await tap(view.getByRole('button',{name:'Simular presentación',exact:true}),{touch});
  await expect(view.getByRole('status')).toContainText('completada');
});

test('UIPSAT: orden de columnas, enlaces y solicitud visible',async({page},info)=>{
  const view=await openView(page,'uip'),touch=info.project.use.hasTouch;
  await audit(view,info,'uip');
  if(info.project.use.viewport.width<=900){
    const main=await view.locator('.uip-layout>div').boundingBox(),side=await view.locator('.uip-links').boundingBox();
    expect(side.y).toBeGreaterThanOrEqual(main.y+main.height);
  }
  await tap(view.getByRole('button',{name:'Simular solicitud de información',exact:true}),{touch});
  await expect(view.locator('.uip-request').getByRole('status')).toContainText('UIP-DEMO-001');
  await audit(view,info,'uip-solicitud');
  const link=view.getByRole('complementary',{name:'Enlaces de información pública'}).getByRole('button').first();
  await tap(link,{touch});
  await expect(view.locator('.uip-document')).toContainText('Decreto 57-2008');
});

test('Denuncias: código, error, formulario abierto y envío accesible',async({page},info)=>{
  const view=await openView(page,'denuncias'),touch=info.project.use.hasTouch;
  await audit(view,info,'denuncias');
  await view.getByLabel('Ingrese los caracteres que se muestran en la imagen',{exact:true}).fill('MAL');
  await tap(view.getByRole('button',{name:'✓ Verificar',exact:true}),{touch});
  await expect(view.getByRole('alert')).toContainText('no coincide');
  await view.getByLabel('Ingrese los caracteres que se muestran en la imagen',{exact:true}).fill('DEMO');
  await tap(view.getByRole('button',{name:'✓ Verificar',exact:true}),{touch});
  await view.getByRole('combobox',{name:'Concepto',exact:true}).selectOption('Defraudación Tributaria y/o Evasión de Impuestos');
  if(touch)await expect(view.locator('.select-description')).toBeVisible();
  await view.getByRole('textbox',{name:'Dirección ficticia',exact:true}).scrollIntoViewIfNeeded();
  await audit(view,info,'denuncias-formulario');
  await tap(view.getByRole('button',{name:'Simular envío de denuncia',exact:true}),{touch});
  await expect(view.getByRole('status')).toContainText('DEMO-DEN-001');
});

test('Chat SAT: conversación y encuesta abiertas sin controles tapados',async({page},info)=>{
  const view=await openView(page,'chat'),touch=info.project.use.hasTouch;
  await audit(view,info,'chat');
  await tap(view.getByRole('button',{name:'Iniciar chat de demostración',exact:true}),{touch});
  const chat=view.locator('.support-live-chat');
  await chat.getByLabel('Mensaje de demostración',{exact:true}).fill('Vehículos');
  await tap(chat.getByRole('button',{name:'Enviar',exact:true}),{touch});
  await expect(chat.getByRole('log')).toContainText('Elegí «Vehículos»');
  await audit(view,info,'chat-abierto');
  await tap(view.getByRole('button',{name:'Ir a la encuesta',exact:true}),{touch});
  await view.getByRole('combobox',{name:'¿Cómo calificarías esta demostración?',exact:true}).selectOption('4');
  await usable(view.getByRole('button',{name:'Guardar opinión de ejemplo',exact:true}),{touch});
  await audit(view,info,'chat-encuesta');
  await view.getByRole('button',{name:'Guardar opinión de ejemplo',exact:true}).click();
  await expect(view.locator('.survey-form').getByRole('status')).toContainText('Gracias');
});

test('Portada: menú, lupa y RITA con resultados, mensajes y poca altura',async({page},info)=>{
  await page.goto('/');
  const touch=info.project.use.hasTouch;
  if(info.project.use.viewport.width<=1000){
    await tap(page.getByRole('button',{name:'Abrir menú',exact:true}),{touch});
    const menu=page.getByRole('navigation',{name:'Navegación principal'});
    await expect(menu).toBeVisible();
    expect(await menu.evaluate(el=>el.scrollHeight>=el.clientHeight)).toBe(true);
    await usable(menu.getByRole('link',{name:'Estadísticas Tributarias',exact:true}),{touch});
    await tap(page.getByRole('button',{name:'Cerrar menú',exact:true}),{touch});
  }
  await tap(page.getByRole('button',{name:'Abrir buscador',exact:true}),{touch});
  const search=page.getByRole('dialog',{name:'Buscar en el portal',exact:true});
  await search.getByRole('searchbox').fill('RTU');
  await expect(search.locator('.search-results>a').first()).toBeVisible();
  await audit(page,info,'lupa-resultados');
  await tap(search.getByRole('button',{name:'Cerrar',exact:true}));
  await tap(page.getByRole('button',{name:'RITA · Chat de demostración',exact:true}),{touch});
  const rita=page.getByRole('dialog',{name:'Chat de demostración',exact:true});
  const ritaBox=await rita.boundingBox();
  expect(ritaBox.y).toBeGreaterThanOrEqual(0);expect(ritaBox.y+ritaBox.height).toBeLessThanOrEqual(info.project.use.viewport.height);
  await tap(rita.getByRole('button',{name:'Consultar NIT',exact:true}),{touch});
  await rita.getByLabel('Mensaje de demostración',{exact:true}).fill('RTU');
  await tap(rita.getByRole('button',{name:'Enviar',exact:true}),{touch});
  await expect(rita.getByRole('log')).toContainText('datos ficticios');
  await audit(page,info,'rita-mensajes');
  await tap(rita.getByRole('button',{name:'Cerrar',exact:true}));
  await expect(rita).not.toBeVisible();
});
