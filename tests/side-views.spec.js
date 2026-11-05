import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const accesses=[
  ['Agencia Virtual','/demostracion/agencia-virtual','Accede a tu Agencia Virtual',true,'agencia'],
  ['Declaraguate','/demostracion/declaraguate','Declaración de Ética',true,'declaraguate'],
  ['UIPSAT','/contenido/portal/libre-acceso-la-informacion-publica/','Acceso a la Información Pública',true,'uip'],
  ['Denuncias Tributarias','/contenido/portal/contacto/denuncias-no-facturacion/','Denuncias Tributarias',false,'denuncias'],
  ['Chat SAT','/contenido/portal/soporte-chat/','Chat SAT',false,'chat'],
];

async function openAccess(page,name,newTab){
  await page.goto('/');
  const link=page.getByRole('complementary',{name:'Accesos rápidos'}).getByRole('link',{name,exact:true});
  if(newTab){const popup=page.waitForEvent('popup');await link.click();return await popup;}
  await link.click();return page;
}

test('cada ícono abre su vista local con la pestaña observada en el original',async({page},testInfo)=>{
  const errors=[],outbound=[],badResponses=[];
  page.context().on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
  page.on('pageerror',e=>errors.push(e.message));
  page.context().on('request',r=>{if(!/^(http|ws):\/\/127\.0\.0\.1:5173\//.test(r.url())&&!r.url().startsWith('data:'))outbound.push(r.url());});
  page.context().on('response',r=>{if(r.status()>=400)badResponses.push(r.url());});
  await fs.mkdir('evidencias/capturas-laterales',{recursive:true});
  for(const [name,path,heading,newTab,key] of accesses){
    const view=await openAccess(page,name,newTab);
    await expect(view).toHaveURL(`http://127.0.0.1:5173${path}`);
    await expect(view.getByRole('heading',{level:1,name:heading,exact:true})).toBeVisible();
    await expect(view).toHaveTitle(/Réplica local/);
    if(newTab)await expect(page).toHaveURL('http://127.0.0.1:5173/');
    await view.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
    await view.mouse.move(0,0);
    expect(await view.locator('main img').evaluateAll(images=>images.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src))).toEqual([]);
    expect(await view.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(testInfo.project.name==='mobile'?390:1520);
    await view.screenshot({path:`evidencias/capturas-laterales/${testInfo.project.name}-${key}.png`,fullPage:true});
    await view.screenshot({path:`evidencias/capturas-laterales/${testInfo.project.name}-${key}-viewport.png`});
    await view.reload();await expect(view.getByRole('heading',{level:1,name:heading,exact:true})).toBeVisible();
    if(newTab)await view.close();
  }
  expect(errors).toEqual([]);expect(outbound).toEqual([]);expect(badResponses).toEqual([]);
});

test('Agencia Virtual simula sesión, permisos y opciones de recuperación',async({page})=>{
  const view=await openAccess(page,'Agencia Virtual',true);
  await expect(view.getByLabel('Usuario',{exact:true})).toHaveValue('DEMO-001');
  await expect(view.getByLabel('Contraseña',{exact:true})).toHaveAttribute('readonly','');
  for(const name of ['¿Olvidaste tu contraseña?','¿No tienes Agencia Virtual?','¿Olvidaste tu correo electrónico de Agencia Virtual?']){
    await view.getByRole('button',{name,exact:true}).click();await expect(view.getByRole('status')).toContainText(name);await view.getByRole('button',{name:'Cerrar información',exact:true}).click();
  }
  await view.getByLabel('Permisos delegados',{exact:true}).check();
  await view.getByRole('button',{name:'INICIAR SESIÓN',exact:true}).click();
  await expect(view.getByRole('status')).toContainText('Permisos delegados de ejemplo');
  await view.getByRole('button',{name:'Cerrar sesión de ejemplo',exact:true}).click();
  await expect(view.getByRole('heading',{name:'Accede a tu Agencia Virtual',exact:true})).toBeVisible();
});

test('Declaraguate permite llenar, guardar, buscar y presentar ejemplos y navegar a preguntas',async({page})=>{
  const view=await openAccess(page,'Declaraguate',true),nav=view.getByRole('navigation',{name:'Navegación Declaraguate'});
  await view.getByRole('button',{name:'IVA PEQUEÑO CONTRIBUYENTE',exact:true}).click();
  await view.getByLabel('Monto ficticio (Q)',{exact:true}).fill('200');
  await view.getByRole('button',{name:'Guardar formulario de ejemplo',exact:true}).click();await expect(view.getByRole('status')).toContainText('DEMO-001 guardado');
  await nav.getByRole('link',{name:'Buscar formulario',exact:true}).click();await view.getByRole('button',{name:'Buscar ejemplo',exact:true}).click();await expect(view.getByRole('status')).toContainText('Borrador ficticio');
  await nav.getByRole('link',{name:'Presentar formulario',exact:true}).click();await expect(view.locator('.dg-workspace')).toContainText('Q200.00');await view.getByRole('button',{name:'Simular presentación',exact:true}).click();await expect(view.getByRole('status')).toContainText('No se envió ni pagó');
  await nav.getByRole('link',{name:'Buscar formulario',exact:true}).click();await view.getByRole('button',{name:'Buscar ejemplo',exact:true}).click();await expect(view.getByRole('status')).toContainText('Presentado en simulación');
  await nav.getByRole('link',{name:'Preguntas frecuentes',exact:true}).click();await view.getByText('¿Cómo llenar un formulario?',{exact:true}).click();await expect(view.getByText('Elegí Llenar formulario y seleccioná un ejemplo del catálogo.',{exact:true})).toBeVisible();
});

test('UIPSAT conserva la columna de enlaces y una solicitud ficticia local',async({page})=>{
  const view=await openAccess(page,'UIPSAT',true);
  const sidebar=view.getByRole('complementary',{name:'Enlaces de información pública'});
  await expect(sidebar.getByRole('button')).toHaveCount(5);
  await sidebar.getByRole('button').first().click();await expect(view.locator('.uip-document')).toContainText('Decreto 57-2008');
  await view.getByRole('button',{name:'Simular solicitud de información',exact:true}).click();await expect(view.locator('.uip-request').getByRole('status')).toContainText('UIP-DEMO-001');
});

test('Denuncias valida el código simulado antes de permitir el formulario local',async({page})=>{
  await openAccess(page,'Denuncias Tributarias',false);
  await page.getByLabel('Ingrese los caracteres que se muestran en la imagen',{exact:true}).fill('incorrecto');await page.getByRole('button',{name:'✓ Verificar',exact:true}).click();await expect(page.getByRole('alert')).toContainText('no coincide');
  await page.getByRole('button',{name:'Cambiar código de demostración',exact:true}).click();
  await page.getByLabel('Ingrese los caracteres que se muestran en la imagen',{exact:true}).fill('sat8');await page.getByRole('button',{name:'✓ Verificar',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Concepto',exact:true})).toBeVisible();await page.getByRole('combobox',{name:'Concepto',exact:true}).selectOption('Contadores');
  await page.getByRole('button',{name:'Simular envío de denuncia',exact:true}).click();await expect(page.getByRole('status')).toContainText('DEMO-DEN-001');
  await page.getByRole('button',{name:'Reiniciar demostración',exact:true}).click();await expect(page.getByRole('button',{name:'✓ Verificar',exact:true})).toBeVisible();
});

test('Chat SAT tiene atención local y encuesta, y RITA y lupa abren paneles',async({page})=>{
  await openAccess(page,'Chat SAT',false);
  await expect(page.locator('.support-columns>aside')).toContainText('Cuéntenos su experiencia');
  await page.getByRole('button',{name:'Iniciar chat de demostración',exact:true}).click();
  const chat=page.locator('.support-live-chat');
  await chat.getByLabel('Mensaje de demostración',{exact:true}).fill('vehículos');await chat.getByRole('button',{name:'Enviar',exact:true}).click();await expect(chat.getByRole('log')).toContainText('Elegí «Vehículos»');
  await page.getByRole('button',{name:'Ir a la encuesta',exact:true}).click();await page.getByRole('combobox',{name:'¿Cómo calificarías esta demostración?',exact:true}).selectOption('4');await page.getByRole('button',{name:'Guardar opinión de ejemplo',exact:true}).click();await expect(page.locator('.survey-form').getByRole('status')).toContainText('Gracias');
  await page.goto('/');
  await page.getByRole('button',{name:'Abrir buscador',exact:true}).click();await expect(page.getByRole('dialog',{name:'Buscar en el portal'})).toBeVisible();await expect(page).toHaveURL('http://127.0.0.1:5173/');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'RITA · Chat de demostración',exact:true}).click();await expect(page.getByRole('dialog',{name:'Chat de demostración',exact:true})).toBeVisible();await expect(page).toHaveURL('http://127.0.0.1:5173/');
});
