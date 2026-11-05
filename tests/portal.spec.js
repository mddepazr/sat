import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import portal from '../src/data/portal.json' with { type: 'json' };

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('portada completa, recursos locales sin errores y distribución sin desbordes', async ({ page }, testInfo) => {
  const errors=[]; const outbound=[]; const badResponses=[];
  page.on('pageerror', error=>errors.push(error.message));
  page.on('request', request=>{if(!request.url().startsWith('http://127.0.0.1:5173/')&&!request.url().startsWith('ws://127.0.0.1:5173/')&&!request.url().startsWith('data:'))outbound.push(request.url());});
  page.on('response',response=>{if(response.status()>=400)badResponses.push({url:response.url(),status:response.status()});});
  await page.reload();
  for(const name of ['QUIERO SER CONTRIBUYENTE','SERVICIOS TRIBUTARIOS','ADUANAS','CAPACITACIÓN','CONTÁCTANOS','NOTICIAS','INSTITUCIONAL']) await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
  await page.evaluate(async()=>{
    for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(resolve=>setTimeout(resolve,35));}
    await document.fonts.ready;scrollTo(0,0);
  });
  await expect.poll(()=>page.locator('img').evaluateAll(images=>images.filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.src))).toEqual([]);
  const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.viewport);
  expect(errors).toEqual([]);expect(outbound).toEqual([]);expect(badResponses).toEqual([]);
  await fs.mkdir('evidencias/capturas-locales',{recursive:true});
  await page.screenshot({path:`evidencias/capturas-locales/${testInfo.project.name}-portada.png`,fullPage:true});
  await page.screenshot({path:`evidencias/capturas-locales/${testInfo.project.name}-viewport.png`});
});

test('todos los filtros muestran exactamente las tarjetas de cada categoría', async ({ page })=>{
 for(const [id,data] of [['servicios',portal.services],['aduanas',portal.customs]]){
   const section=page.locator(`#${id}`);
   for(const category of data.categories){
     await section.getByRole('button',{name:category.name,exact:true}).click();
     await expect(section.getByRole('button',{name:category.name,exact:true})).toHaveAttribute('aria-pressed','true');
     const expected=data.cards.filter(card=>card.categories.includes(category.id));
     await expect(section.locator('article')).toHaveCount(expected.length);
     expect(await section.locator('article h3').allTextContents()).toEqual(expected.map(card=>card.title));
   }
 }
});

test('buscador normaliza acentos, enlaza resultados, informa ausencia y cierra con Escape',async({page})=>{
 await page.getByRole('button',{name:'Abrir buscador',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Buscar en el portal'});
 const input=dialog.getByRole('searchbox');
 await expect(input).toBeFocused();await input.fill('vehiculos');
 await expect(dialog.locator('.search-results').getByRole('link').first()).toBeVisible();
 await expect(dialog.locator('.search-results')).toContainText('Vehículos');
 await input.fill('zzzinexistente999');await expect(dialog).toContainText('No hay coincidencias');
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
 await page.getByRole('button',{name:'Abrir buscador',exact:true}).click();await input.fill('RTU');
 await dialog.getByRole('link').filter({hasText:'Impresión de RTU'}).first().click();
 await expect(page.getByRole('heading',{name:'Impresión de RTU',exact:true})).toBeVisible();
 await expect(dialog).not.toBeVisible();
});

test('navegación por anclas y menú móvil',async({page},testInfo)=>{
 const mobile=testInfo.project.name==='mobile';
 if(mobile){await page.getByRole('button',{name:'Abrir menú',exact:true}).click();await expect(page.getByRole('button',{name:'Cerrar menú',exact:true})).toHaveAttribute('aria-expanded','true');}
 await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Capacitación',exact:true}).click();
 await expect(page).toHaveURL(/#capacitacion$/);
 expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(100);
 if(mobile)await expect(page.getByRole('button',{name:'Abrir menú',exact:true})).toHaveAttribute('aria-expanded','false');
 await page.getByRole('link',{name:'SAT · Institucional',exact:true}).click();await expect(page).toHaveURL(/#Institucional$/);
});

test('carrusel cambia imágenes, selecciona diapositiva y permite pausa',async({page})=>{
 const hero=page.getByRole('region',{name:'Banner principal'});
 const initial=await hero.locator('.hero-slide.active img').getAttribute('src');
 await hero.getByRole('button',{name:'Banner siguiente',exact:true}).click();
 await expect(hero.locator('.hero-slide.active img')).not.toHaveAttribute('src',initial);
 await hero.getByRole('button',{name:'Banner anterior',exact:true}).click();await expect(hero.locator('.hero-slide.active img')).toHaveAttribute('src',initial);
 await page.keyboard.press('ArrowLeft');await expect(hero.locator('.hero-slide.active img')).not.toHaveAttribute('src',initial);
 await page.keyboard.press('ArrowRight');await expect(hero.locator('.hero-slide.active img')).toHaveAttribute('src',initial);
 await hero.getByRole('button',{name:'Mostrar banner 3',exact:true}).click();await expect(hero.getByRole('button',{name:'Mostrar banner 3',exact:true})).toHaveAttribute('aria-pressed','true');
 // Reduced motion starts paused; toggle twice to check both actions.
 await page.clock.install();
 await hero.getByRole('button',{name:'Reproducir carrusel',exact:true}).click();await expect(hero.getByRole('button',{name:'Pausar carrusel',exact:true})).toBeVisible();
 await page.locator('.getting-started .section-title').click();
 const beforeAuto=await hero.locator('.hero-slide.active img').getAttribute('src');
 await page.clock.runFor(12020);await expect(hero.locator('.hero-slide.active img')).not.toHaveAttribute('src',beforeAuto);
 await hero.getByRole('button',{name:'Pausar carrusel',exact:true}).click();await expect(hero.getByRole('button',{name:'Reproducir carrusel',exact:true})).toBeVisible();
});

test('tarjetas abren demo, selección ficticia y descarga; historial vuelve a portada',async({page})=>{
 await page.locator('#servicios').getByRole('link',{name:'Impresión de RTU',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Impresión de RTU',exact:true})).toBeVisible();await expect(page).toHaveURL(/\/contenido\/portal\/project\//);
 await expect(page.locator('.demo-label')).toContainText('DATOS FICTICIOS');await page.getByLabel('Caso de ejemplo').selectOption('DEMO-002');
 await page.getByRole('button',{name:'Simular consulta',exact:true}).click();await expect(page.getByRole('status')).toContainText('DEMO-002');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar ejemplo JSON sin validez',exact:true}).click();
 const download=await downloadPromise;const text=await fs.readFile(await download.path(),'utf8');expect(JSON.parse(text)).toMatchObject({demostracion:true,caso:'DEMO-002',sinValidezTributaria:true,nit:'FICTICIO'});
 await page.goBack();await expect(page.locator('#servicios .service-card')).toHaveCount(8);
});

test('cita ficticia, paneles de capacitación y contacto, preguntas frecuentes',async({page})=>{
 await page.getByRole('link',{name:'Agendar mi Cita',exact:true}).click();await expect(page.getByLabel('Horario de ejemplo')).toBeVisible();
 await page.getByRole('button',{name:'Simular cita',exact:true}).click();await expect(page.getByRole('status')).toContainText('Cita ficticia seleccionada');
 await page.getByRole('link',{name:/Volver al portal/}).click();
 await page.getByRole('button',{name:'Ver opciones de Capacitaciones',exact:true}).click();
 await expect(page.getByRole('link',{name:/Calendario de Capacitaciones$/})).toBeVisible();
 await page.getByRole('button',{name:'Cerrar opciones de Capacitaciones',exact:true}).click();
 await expect(page.getByRole('button',{name:'Ver opciones de Capacitaciones',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Ver opciones de Ubicaciones y Horarios',exact:true}).click();
 await page.getByRole('link',{name:/Agencias$/}).click();await expect(page.getByRole('heading',{name:/Agencias$/})).toBeVisible();
 await page.getByRole('link',{name:/Volver al portal/}).click();
 await page.getByRole('button',{name:'Ver opciones de Preguntas Frecuentes',exact:true}).click();
 await page.locator('#capacitacion .is-open').getByRole('link',{name:/Preguntas Frecuentes$/}).click();
 await page.getByText('¿Esta página es oficial?',{exact:true}).click();await expect(page.getByText('No. Es una réplica local para estudiar y probar la navegación.',{exact:true})).toBeVisible();
});

test('estadísticas demuestran selección de año sin presentar cifras reales',async({page},testInfo)=>{
 if(testInfo.project.name==='mobile')await page.getByRole('button',{name:'Abrir menú',exact:true}).click();
 await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Estadísticas Tributarias',exact:true}).click();
 await expect(page).toHaveURL(/estadisticas-tributarias/);await expect(page.getByText('GRÁFICO DEMOSTRATIVO · CIFRAS INVENTADAS',{exact:true})).toBeVisible();
 const chart=page.getByRole('img',{name:/Serie ficticia/});await expect(chart).toHaveAttribute('aria-label',/2026: 38/);
 await page.getByLabel('Año de ejemplo').selectOption('2025');await expect(chart).toHaveAttribute('aria-label',/2025: 29/);
});

test('chat local responde a temas, admite mensaje y no aparenta atención oficial',async({page})=>{
 await page.getByRole('button',{name:'RITA · Chat de demostración',exact:true}).click();const chat=page.getByRole('dialog',{name:'Chat de demostración',exact:true});
 await expect(chat).toContainText('No es atención oficial');await chat.getByRole('button',{name:'Información sobre RTU Digital',exact:true}).click();await expect(chat.getByRole('log')).toContainText('La consulta muestra datos ficticios');
 await chat.getByRole('textbox',{name:'Mensaje de demostración',exact:true}).fill('vehículos');await chat.getByRole('button',{name:'Enviar',exact:true}).click();await expect(chat.getByRole('log')).toContainText('Elegí «Vehículos»');
 await page.keyboard.press('Escape');await expect(chat).not.toBeVisible();
});

test('mapa local, destinos externos definidos y volver arriba',async({page})=>{
 const links=page.locator('.socials a');await expect(links).toHaveCount(8);
 for(const link of await links.all()){await expect(link).toHaveAttribute('href',/^https:\/\//);await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel',/noopener/);}
 const inert=await page.locator('a').evaluateAll(links=>links.filter(link=>!link.getAttribute('href')||link.getAttribute('href')==='#').map(link=>link.textContent));expect(inert).toEqual([]);
 await page.getByRole('link',{name:'Mapa del sitio',exact:true}).click();await expect(page.getByRole('heading',{name:'Mapa del sitio',exact:true})).toBeVisible();await expect(page.locator('.sitemap a')).not.toHaveCount(0);
 await page.getByRole('link',{name:/Volver al portal/}).click();await page.locator('footer').scrollIntoViewIfNeeded();expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(500);
 await page.getByRole('button',{name:'Volver arriba',exact:true}).click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
});

test('barrido de renderizado de todas las rutas de contenido capturadas',async({page})=>{
 test.setTimeout(120000);
 const candidates=[...portal.services.cards,...portal.customs.cards,...portal.news,...portal.institutional,...portal.training.flatMap(item=>item.links),...portal.contacts.flatMap(item=>item.links)];
 const routes=[...new Set(candidates.filter(item=>item.url?.startsWith('https://portal.sat.gob.gt/')).map(item=>'/contenido'+new URL(item.url).pathname))];
 expect(routes.length).toBeGreaterThan(100);
 for(const route of routes){
   // This checks client routing/rendering; other scenarios exercise actual clicks.
   await page.evaluate(async href=>{history.pushState({},'',href);dispatchEvent(new PopStateEvent('popstate'));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));},route);
   await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
   await expect(page.getByRole('heading',{level:1})).not.toHaveText('Contenido no incluido');
   await expect(page.getByRole('heading',{level:1})).not.toBeEmpty();
 }
 // Also exercise a deep HTTP entry, rather than only history changes.
 await page.goto('/contenido/portal/descarga/15423/gestion-de-calidad/60881/manual-de-usuario-ingreso-de-quejas.pdf');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Manual de uso');
});
