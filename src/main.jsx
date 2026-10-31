import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import portal from './data/portal.json';
import './styles.css';

const OFFICIAL = 'https://portal.sat.gob.gt';
const asset = (name) => Object.entries(portal.assets).find(([url]) => decodeURIComponent(url).split('/').at(-1).split('?')[0] === name)?.[1];
const navItems = [['Servicios Tributarios','servicios'],['Aduanas','aduanas'],['Capacitación','capacitacion'],['Contáctanos','contactanos']];
const allCards = [...portal.services.cards, ...portal.customs.cards];
const records = new Map();
const pathOf = (url) => { try { return new URL(url, OFFICIAL).pathname; } catch { return '/'; } };
allCards.forEach(item => records.set(pathOf(item.url), {...item, type:'service'}));
portal.news.forEach(item => records.set(pathOf(item.url), {...item, type:'news'}));
portal.institutional.forEach(item => records.set(pathOf(item.url), {...item, type:'information'}));
[...portal.training, ...portal.contacts].forEach(item => item.links.forEach(link => {
  if (link.url?.startsWith(OFFICIAL)) records.set(pathOf(link.url), {title:link.title.replace(/^- /,''), description:item.description.startsWith('>')?'':item.description, url:link.url, image:item.image, type:'information'});
}));
[
 ['requisitos-de-inscripcion-personas-empresas','Requisitos de Inscripción','Consultá los requisitos de inscripción de personas y empresas.'],
 ['requisitos-de-personas-empresas','Requisitos de Inscripción','Consultá los requisitos de inscripción de personas y empresas.'],
 ['solicitud-electronica-de-nit','Solicitar NIT','Recorrido de demostración de una solicitud de NIT.'],
 ['citas-solicitud-de-NIT','Agendar mi Cita','Elegí una cita ficticia para conocer el funcionamiento de la réplica.'],
 ['preguntas-frecuentes','Preguntas Frecuentes','Encontrá orientación sobre los accesos y servicios de esta demostración.'],
 ['categoria/noticias','Todas las noticias','Publicaciones disponibles en la captura del portal público.'],
 ['estadisticas-tributarias-sat','Estadísticas Tributarias','Gráfico de ejemplo con valores ficticios para probar los controles.'],
 ['libre-acceso-la-informacion-publica','Unidad de Información Pública','Información pública institucional y transparencia.'],
 ['mapa-de-sitio','Mapa del sitio','Recorré las secciones y los contenidos disponibles en esta réplica.'],
 ['idiomas-mayas','Tijonem pa Maya’ taq ch’ab’äl','Acceso de orientación en idiomas mayas. El contenido completo no está incluido en la captura.'],
 ['operador-economico-autorizado','Operador Económico Autorizado','Información pública sobre el programa de Operador Económico Autorizado.'],
].forEach(([slug,title,description])=>records.set(`/portal/${slug}/`,{title,description,url:`${OFFICIAL}/portal/${slug}/`,type:/NIT|Cita/.test(title)?'service':'information'}));

function navigate(href) {
  history.pushState({},'',href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  const hash=href.split('#')[1];
  requestAnimationFrame(()=>requestAnimationFrame(()=>hash?document.getElementById(decodeURIComponent(hash))?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}):window.scrollTo({top:0,behavior:'instant'})));
}
function localPath(url) {
  if (!url) return '/';
  const parsed=new URL(url,OFFICIAL);
  if(parsed.origin===OFFICIAL) return '/contenido'+parsed.pathname;
  if(/(^|\.)sat\.gob\.gt$/.test(parsed.hostname)) return '/demostracion/'+(parsed.hostname.startsWith('reclutamiento')?'empleo':'agencia-virtual');
  return null;
}
function Link({href, children, onClick, ...props}) {
  const local=href?.startsWith('/')&&!href.startsWith('//')?href:localPath(href);
  return <a {...props} href={local||href} target={local?undefined:'_blank'} rel={local?undefined:'noopener noreferrer'} onClick={e=>{
    onClick?.(e);if(local&&!e.defaultPrevented&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&e.button===0){e.preventDefault();navigate(local);}
  }}>{children}</a>;
}
function Icon({name,size=24}) {
  const paths={home:'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',close:'m5 5 14 14M19 5 5 19',menu:'M3 6h18M3 12h18M3 18h18',left:'m15 5-7 7 7 7',right:'m9 5 7 7-7 7',up:'m5 15 7-7 7 7',chat:'M21 11a9 8 0 1 1-4-7M7 10h1m3 0h1m3 0h1M16 18l5 3-1-6',phone:'M8 2H4v5c0 7 6 13 13 13h5v-4l-6-3-2 3-6-6 3-2-3-6Z',mail:'M3 5h18v14H3zM3 5l9 8 9-8',external:'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',pause:'M8 5v14M16 5v14',play:'m7 4 13 8-13 8Z',check:'m4 12 5 5L20 6'};
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.right}/></svg>;
}
function Title({children}) {return <h2 className="section-title">{children}</h2>;}
function Modal({open,onClose,label,children,className=''}) {
  const ref=useRef();
  useEffect(()=>{const d=ref.current;if(open&&!d.open)d.showModal();if(!open&&d.open)d.close();},[open]);
  return <dialog ref={ref} aria-label={label} className={`modal ${className}`} onKeyDownCapture={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}}} onClose={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <button className="modal-close icon-button" aria-label="Cerrar" onClick={onClose}><Icon name="close"/></button>{children}
  </dialog>;
}
function Header({onSearch}) {
  const [menu,setMenu]=useState(false);
  return <header className="header">
    <Link className="brand" href="/#Institucional" aria-label="SAT · Institucional"><img src={asset('logo_sat_blanco-1.png')} width="176" height="70" alt="Superintendencia de Administración Tributaria"/></Link>
    <button className="menu-toggle icon-button" aria-label={menu?'Cerrar menú':'Abrir menú'} aria-expanded={menu} aria-controls="main-menu" onClick={()=>setMenu(!menu)}><Icon name={menu?'close':'menu'}/></button>
    <nav id="main-menu" aria-label="Navegación principal" className={menu?'navigation expanded':'navigation'}>
      <Link href="/" aria-label="Inicio" onClick={()=>setMenu(false)}><Icon name="home" size={22}/></Link>
      {navItems.map(([label,id])=><Link key={id} href={`/#${id}`} onClick={()=>setMenu(false)}>{label}</Link>)}
      <Link href="/contenido/portal/estadisticas-tributarias-sat/" onClick={()=>setMenu(false)}>Estadísticas Tributarias</Link>
      <button className="mobile-search" onClick={()=>{setMenu(false);onSearch();}}><Icon name="search" size={18}/> Buscar en el portal</button>
    </nav>
    <a className="contact-center" href="tel:1550" aria-label="Llamar al 1550"><span>♧</span><strong>1550<small>CONTACT CENTER</small></strong></a>
  </header>;
}
const slideTargets=['/portal/contacto/denuncias-por-corrupcion/','/portal/operador-economico-autorizado/'];
function slideHref(slide) {
 if(/Denuncia/i.test(slide.title))return OFFICIAL+slideTargets[0];
 if(/Importadores/i.test(slide.title))return OFFICIAL+slideTargets[1];
 if(/Corazon/i.test(slide.title))return 'https://svet.gob.gt/tratadepersonas/';
 return '/demostracion/agencia-virtual';
}
function Hero() {
  const [index,setIndex]=useState(Math.max(0,portal.slides.findIndex(s=>/Denuncia/i.test(s.title))));
  const [paused,setPaused]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hover,setHover]=useState(false);
  useEffect(()=>{if(paused||hover)return;const id=setInterval(()=>setIndex(i=>(i+1)%portal.slides.length),12000);return()=>clearInterval(id);},[paused,hover]);
  const move=step=>setIndex(i=>(i+step+portal.slides.length)%portal.slides.length);
  return <section className="hero" aria-label="Banner principal" aria-roledescription="carrusel" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocus={()=>setHover(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setHover(false);}} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key==='ArrowRight'){e.preventDefault();move(1);}}}>
    {portal.slides.map((slide,i)=><Link className={`hero-slide ${i===index?'active':''}`} href={slideHref(slide)} key={slide.image} tabIndex={i===index?0:-1} aria-hidden={i!==index} aria-label={slide.title.replace(/^\d+ /,'')}><img src={slide.image} alt={slide.title.replace(/^\d+ /,'')} fetchPriority={i===index?'high':'auto'}/></Link>)}
    <button className="slide-arrow previous" onClick={()=>move(-1)} aria-label="Banner anterior"><Icon name="left" size={30}/></button>
    <button className="slide-arrow next" onClick={()=>move(1)} aria-label="Banner siguiente"><Icon name="right" size={30}/></button>
    <div className="carousel-tools"><button aria-label={paused?'Reproducir carrusel':'Pausar carrusel'} onClick={()=>setPaused(!paused)}><Icon name={paused?'play':'pause'} size={14}/></button>{portal.slides.map((s,i)=><button key={s.image} className={`slide-dot ${i===index?'selected':''}`} aria-label={`Mostrar banner ${i+1}`} aria-pressed={i===index} onClick={()=>setIndex(i)}/>)}</div>
    <span className="sr-only" aria-live="polite">Banner {index+1} de {portal.slides.length}: {portal.slides[index].title.replace(/^\d+ /,'')}</span>
  </section>;
}
function GettingStarted(){return <>
  <div className="traveler"><Link href="/demostracion/declaracion-viajero" aria-label="Declaración Jurada Regional de Viajero · Demostración"><img src={asset('Declara-jurada-viajero-banner-1536x242.png')||asset('Declara-jurada-viajero-banner-768x121.png')} alt="Declaración Jurada Regional de viajero electrónica"/></Link></div>
  <section className="getting-started"><Title>QUIERO SER CONTRIBUYENTE</Title><div className="initial-grid">
    {[['Requisitos de Inscripción','Mesa-de-trabajo-9.png','requisitos-de-personas-empresas'],['Solicitar NIT','Mesa-de-trabajo-10.png','solicitud-electronica-de-nit'],['Agendar mi Cita','Mesa-de-trabajo-11.png','citas-solicitud-de-NIT']].map(([title,img,url],i)=><Link className="initial-item" key={title} href={`${OFFICIAL}/portal/${url}/`}><span className="step-number" aria-hidden="true">{i+1}.</span><img src={asset(img)} alt="" width="150" height="150"/><h3>{title}</h3></Link>)}
  </div></section>
 </>;}
function Catalog({id,title,data}){
 const [category,setCategory]=useState(data.categories.find(c=>c.default)?.id||data.categories[0].id);
 const cards=data.cards.filter(card=>card.categories.includes(category));
 return <section id={id} className={`catalog ${id}`}><Title>{title}</Title>
  <div className="filters" role="group" aria-label={`Categorías de ${title.toLowerCase()}`}>{data.categories.map(c=><button key={c.id} className={category===c.id?'active':''} aria-pressed={category===c.id} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</div>
  <div className="catalog-grid" aria-live="polite" aria-atomic="false">{cards.map((card,i)=><article className="service-card" key={card.url+i}>
    <Link href={card.url} className="card-image" tabIndex={-1} aria-hidden="true"><img src={card.image} alt="" loading="lazy"/></Link>
    <div className="card-copy"><h3><Link href={card.url}>{card.title}</Link></h3><p>{card.description}</p></div>
  </article>)}</div>
 </section>;
}
function FlipCard({item,contact=false}) {
 const [open,setOpen]=useState(false);
 let links=item.links;
 if(!links.length)links=[{title:'Ver información',url:item.title==='Preguntas Frecuentes'?`${OFFICIAL}/portal/preguntas-frecuentes/`:`${OFFICIAL}/portal/idiomas-mayas/`}];
 const isClic=/CLIC/i.test(item.title);
 if(isClic)return <Link className="contact-clic" href="https://clicelpoderanticorrupcion.gt/" aria-label="CLIC · El poder anticorrupción"><img src={item.image} alt="CLIC · El poder anticorrupción" loading="lazy"/></Link>;
 return <div className={`flip-card ${contact?'contact-card':''} ${open?'is-open':''}`}>
  <button className="flip-front" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label={`Ver opciones de ${item.title}`} style={{backgroundImage:`url("${item.image}")`,backgroundSize:contact?'cover':item.backgroundSize||'42% auto'}}><h3>{item.title}</h3></button>
  <div className="flip-back"><h3>{item.title}</h3><ul>{links.map(link=><li key={link.url}><Link href={link.url}>{link.title.replace(/^- /,'')}</Link></li>)}</ul><button className="flip-return" onClick={()=>setOpen(false)} aria-label={`Cerrar opciones de ${item.title}`}>Volver <Icon name="left" size={13}/></button></div>
 </div>;
}
function News({all=false}){return <section className={`news ${all?'all-news':''}`} id="noticias"><Title>NOTICIAS</Title><div className="news-grid">{portal.news.map(item=><article className="news-card" key={item.url}>
  <Link href={item.url} tabIndex={-1} aria-hidden="true"><img src={item.image} alt="" loading="lazy"/></Link><h3><Link href={item.url}>{item.title}</Link></h3><p>{item.description}</p><Link className="primary-button" href={item.url} aria-label={`Leer más: ${item.title}`}>Leer Más</Link>
 </article>)}</div>{!all&&<Link className="more-news" href={`${OFFICIAL}/portal/categoria/noticias/`}>LEER MÁS NOTICIAS</Link>}</section>;}
function Institutional(){return <section id="Institucional" className="institutional"><div className="institutional-content"><Title>INSTITUCIONAL</Title><div className="institutional-grid">{portal.institutional.map(item=><Link href={item.url} key={item.title} className="institutional-item"><img src={item.image} alt="" loading="lazy"/><h3>{item.title}</h3><p>{item.description}</p></Link>)}</div></div><img className="building" src={asset('edificio_sat.jpg')} alt="Edificio de la Superintendencia de Administración Tributaria" loading="lazy"/></section>;}
const socials=[['Facebook','\uf39e','https://www.facebook.com/SATgtRenovada/','#3b5998'],['X','X','https://twitter.com/satgt','#000'],['YouTube','\uf167','https://www.youtube.com/channel/UC5SZ9JUopefihv7bHlYy0kg','#ce171e'],['Instagram','\uf16d','https://www.instagram.com/satguatemala/','#222'],['TikTok','\ue07b','https://www.tiktok.com/@satguatemala','#000'],['LinkedIn','\uf0e1','https://www.linkedin.com/company/sat-superintendencia-de-administracion-tributaria-de-guatemala/','#007bac'],['Telegram','\uf3fe','https://t.me/SAT_Guatemala_bot','#2ca5d5'],['WhatsApp','\uf232','https://wa.me/50222174090?','#19ce65']];
function Footer(){return <footer><div className="socials" aria-label="Redes sociales">{socials.map(([name,glyph,url,color])=><a href={url} key={name} target="_blank" rel="noopener noreferrer" aria-label={name} style={{background:color}}><span className={name==='X'?'social-x':'brand-icon'} aria-hidden="true">{glyph}</span></a>)}</div><div className="footer-links"><a href="https://login.microsoftonline.com/" target="_blank" rel="noopener noreferrer">Correo electrónico</a><Link href={`${OFFICIAL}/portal/mapa-de-sitio/`}>Mapa del sitio</Link></div><div className="copyright">© Superintendencia de Administración Tributaria 2026. Todos los derechos reservados.</div><p className="replica-footer">Réplica local de estudio. No es un sitio oficial. Las demostraciones usan datos ficticios y no envían información a la SAT.</p></footer>;}
function Home(){return <><Hero/><GettingStarted/><Catalog id="servicios" title="SERVICIOS TRIBUTARIOS" data={portal.services}/><Catalog id="aduanas" title="ADUANAS" data={portal.customs}/><section id="capacitacion" className="training"><Title>CAPACITACIÓN</Title><div className="training-grid">{portal.training.map(item=><FlipCard item={item} key={item.widgetId}/>)}</div></section><section id="contactanos" className="contacts"><Title>CONTÁCTANOS</Title><div className="contact-grid">{portal.contacts.map(item=><FlipCard item={item} contact key={item.widgetId}/>)}</div></section><News/><Institutional/></>;}
function Demo({title='Agencia Virtual',description='',appointment=false}) {
 const [sample,setSample]=useState('DEMO-001');const [result,setResult]=useState(false);
 const report={demostracion:true,caso:sample,servicio:title,estado:'Ejemplo recibido',contribuyente:'Persona Ejemplo',nit:'FICTICIO',sinValidezTributaria:true};
 function download(){const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='demostracion-sin-validez.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <div className="demo"><p className="demo-label">DEMOSTRACIÓN LOCAL · DATOS FICTICIOS</p><p>{description||'Explorá este servicio con un caso de ejemplo. No se solicitan credenciales ni datos personales.'}</p><form onSubmit={e=>{e.preventDefault();setResult(true);}}><label htmlFor="demo-case">Caso de ejemplo</label><select id="demo-case" value={sample} onChange={e=>{setSample(e.target.value);setResult(false);}}><option value="DEMO-001">DEMO-001 · Persona Ejemplo</option><option value="DEMO-002">DEMO-002 · Empresa de Demostración</option></select>{appointment&&<><label htmlFor="demo-date">Horario de ejemplo</label><select id="demo-date"><option>Lunes · 09:00 · Agencia de ejemplo</option><option>Martes · 14:00 · Agencia de ejemplo</option></select></>}<button className="primary-button" type="submit">{appointment?'Simular cita':'Simular consulta'}</button></form>{result&&<div className="demo-result" role="status"><Icon name="check"/><div><h3>{appointment?'Cita ficticia seleccionada':'Resultado de ejemplo'}</h3><p>{sample} · {title} · Ejemplo recibido.</p><p>No se creó ningún trámite, cita ni documento oficial.</p><button className="text-button" onClick={download}>Descargar ejemplo JSON sin validez</button></div></div>}</div>;
}
function Statistics(){const [year,setYear]=useState('2026');const values=year==='2026'?[38,62,49,75,68,86]:[29,46,51,62,59,71];return <div className="statistics"><p className="demo-label">GRÁFICO DEMOSTRATIVO · CIFRAS INVENTADAS</p><label>Año de ejemplo <select value={year} onChange={e=>setYear(e.target.value)}><option>2026</option><option>2025</option></select></label><div className="bar-chart" role="img" aria-label={`Serie ficticia ${year}: ${values.join(', ')}`} >{values.map((v,i)=><div key={i}><span>{v}</span><i style={{height:v*2}}/><small>{['Ene','Feb','Mar','Abr','May','Jun'][i]}</small></div>)}</div></div>;}
function Content({pathname}){
 const sourcePath=pathname.replace(/^\/contenido/,'');let item=records.get(sourcePath);
 if(pathname.startsWith('/demostracion/'))item={title:pathname.includes('viajero')?'Declaración Jurada Regional de Viajero':pathname.includes('empleo')?'Bolsa de Empleo':pathname.includes('declaraguate')?'Declaraguate':'Agencia Virtual',type:'service'};
 if(!item)return <div className="content-page"><h1>Contenido no incluido</h1><p>Esta vista no forma parte de la captura pública disponible.</p><Link href="/" className="primary-button">Volver al portal</Link></div>;
 const isNewsIndex=sourcePath==='/portal/categoria/noticias/';const isMap=sourcePath==='/portal/mapa-de-sitio/';const stats=/estadisticas-tributarias/.test(sourcePath);const faq=/preguntas-frecuentes/.test(sourcePath);
 return <div className="content-page"><nav className="breadcrumbs" aria-label="Ubicación"><Link href="/">Inicio</Link><span>/</span><span>{item.title}</span></nav><h1>{item.title}</h1>{item.type==='service'?<Demo key={pathname} title={item.title} description={item.description} appointment={/Cita/i.test(item.title)}/>:<><p className="content-note">Vista local basada en la captura pública. El contenido completo del sitio original no está incluido.</p>{item.image&&<img className="content-image" src={item.image} alt=""/>}<p className="content-description">{item.description}</p></>}
  {stats&&<Statistics/>}{isNewsIndex&&<News all/>}{isMap&&<div className="sitemap"><h2>Secciones del portal</h2>{[...navItems,['Noticias','noticias'],['Institucional','Institucional']].map(([name,id])=><Link key={id} href={`/#${id}`}>{name}</Link>)}<h2>Servicios disponibles</h2>{[...new Map(allCards.map(x=>[x.url,x])).values()].map(x=><Link href={x.url} key={x.url}>{x.title}</Link>)}</div>}{faq&&<div className="faq">{[['¿Esta página es oficial?','No. Es una réplica local para estudiar y probar la navegación.'],['¿Puedo realizar un trámite?','Los servicios muestran exclusivamente casos ficticios; no crean trámites ante la SAT.'],['¿Cómo encuentro un servicio?','Usá los filtros de categorías o el buscador del lateral.']].map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>}
  {item.url&&<a className="source-link" href={item.url} target="_blank" rel="noopener noreferrer">Ver la página pública original <Icon name="external" size={15}/></a>}<Link className="back-home" href="/">← Volver al portal</Link>
 </div>;
}
function Search({open,onClose}){
 const [query,setQuery]=useState('');const input=useRef();
 useEffect(()=>{if(open)setTimeout(()=>input.current?.focus(),0);},[open]);
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const unique=[...new Map([...allCards,...portal.news,...portal.institutional].map(x=>[x.url,x])).values()];
 const results=query.trim()?unique.filter(x=>normalize(x.title+' '+x.description).includes(normalize(query.trim()))):[];
 return <Modal open={open} onClose={onClose} label="Buscar en el portal" className="search-modal"><h2>Buscador del portal</h2><p>Buscá en los contenidos de esta réplica local.</p><label htmlFor="portal-search">¿Qué estás buscando?</label><div className="search-field"><Icon name="search"/><input id="portal-search" ref={input} type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. RTU, vehículos, inscripción…"/></div><div className="search-results" aria-live="polite">{query.trim()?<><p>{results.length} resultado{results.length!==1?'s':''}</p>{results.length?results.map(item=><Link href={item.url} key={item.url} onClick={onClose}><strong>{item.title}</strong><span>{item.description}</span><Icon name="right" size={16}/></Link>):<p>No hay coincidencias. Probá con «NIT», «RTU» o «Aduanas».</p>}</>:<p>Escribí una palabra para comenzar.</p>}</div></Modal>;
}
function Chat({open,onClose}){
 const [message,setMessage]=useState('');const [messages,setMessages]=useState([{role:'assistant',text:'¡Hola! Este es un chat de demostración local. Puedo orientarte sobre NIT, RTU, vehículos y las secciones de la réplica. No ingresés información personal.'}]);
 const end=useRef();useEffect(()=>{end.current?.scrollIntoView({block:'nearest'});},[messages]);
 const send=(text)=>{if(!text.trim())return;const q=text.toLowerCase();const answer=q.includes('rtu')?'Podés explorar «Impresión de RTU» en Servicios Tributarios o buscar RTU en el buscador. La consulta muestra datos ficticios.':q.includes('nit')?'En «Quiero ser contribuyente» encontrás Solicitar NIT y Agendar mi Cita. Ambos son recorridos de demostración.':q.includes('veh')?'Elegí «Vehículos» en los filtros de Servicios Tributarios para ver sus tarjetas.':'Recorré Servicios Tributarios, Aduanas, Capacitación y Contáctanos. También podés usar la lupa del lateral para buscar. Esta respuesta se genera localmente con reglas simples.';setMessages(v=>[...v,{role:'user',text:text.trim()},{role:'assistant',text:answer}]);setMessage('');};
 return <Modal open={open} onClose={onClose} label="Chat de demostración" className="chat-modal"><div className="chat-header"><Icon name="chat"/><div><h2>Chat de demostración</h2><small>Local · No es atención oficial</small></div></div><div className="messages" role="log" aria-live="polite">{messages.map((m,i)=><p key={i} className={`bubble ${m.role}`}>{m.text}</p>)}<div ref={end}/></div><div className="chat-prompts">{['Consultar NIT','Impresión de RTU','Vehículos'].map(x=><button key={x} onClick={()=>send(x)}>{x}</button>)}</div><form onSubmit={e=>{e.preventDefault();send(message);}}><label htmlFor="chat-message" className="sr-only">Mensaje de demostración</label><input id="chat-message" value={message} onChange={e=>setMessage(e.target.value)} maxLength={300} placeholder="Escribí una consulta general…"/><button className="primary-button" disabled={!message.trim()}>Enviar</button></form></Modal>;
}
function Sidebar({onSearch,onChat}){
 const items=[['Agencia Virtual','icon-av-64.png','/demostracion/agencia-virtual'],['Declaraguate','icon-dg-64.png','/demostracion/declaraguate'],['UIPSAT','icon-uip-64.png',`${OFFICIAL}/portal/libre-acceso-la-informacion-publica/`],['Denuncias Tributarias','icon-denun-64.png',`${OFFICIAL}/portal/contacto/denuncias-no-facturacion/`]];
 return <><aside className="side-access" aria-label="Accesos rápidos"><div>{items.map(([title,img,url])=><Link href={url} key={title} aria-label={title} title={title}><img src={asset(img)} alt=""/><span className="side-tooltip">{title}</span></Link>)}<button onClick={onSearch} aria-label="Abrir buscador" title="Buscador"><img src={asset('icon-find-64.png')} alt=""/></button><button onClick={onChat} aria-label="Abrir chat de demostración" title="Chat de demostración"><img src={asset('ChatSAT-flotante.png')} alt=""/></button></div><button className="rita-launcher" onClick={onChat} aria-label="RITA · Chat de demostración"><img src={asset('satgt-rita-icon-v2-43x43.png')} alt=""/><small>DEMO LOCAL</small></button></aside><button className="back-top" aria-label="Volver arriba" onClick={()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}><Icon name="up"/></button></>;
}
function App(){
 const [pathname,setPathname]=useState(location.pathname);const [search,setSearch]=useState(false);const [chat,setChat]=useState(false);
 useEffect(()=>{const update=()=>setPathname(location.pathname);addEventListener('popstate',update);return()=>removeEventListener('popstate',update);},[]);
 useEffect(()=>{document.title=pathname==='/'?'Portal SAT · Réplica local':`${records.get(pathname.replace('/contenido',''))?.title||'Demostración'} · Réplica local SAT`;},[pathname]);
 return <><a href="#content" className="skip-link">Ir al contenido</a><Header onSearch={()=>setSearch(true)}/><main id="content">{pathname==='/'?<Home/>:<Content pathname={pathname}/>}</main><Footer/><Sidebar onSearch={()=>setSearch(true)} onChat={()=>setChat(true)}/><span className="local-badge">RÉPLICA LOCAL · NO OFICIAL</span><Search open={search} onClose={()=>setSearch(false)}/><Chat open={chat} onClose={()=>setChat(false)}/></>;
}
createRoot(document.getElementById('root')).render(<App/>);
