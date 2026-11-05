import React, { useState } from 'react';
import './side-views.css';
import './side-responsive.css';

export const SIDE_ROUTES = {
  agencia: '/demostracion/agencia-virtual',
  declaraguate: '/demostracion/declaraguate',
  uip: '/contenido/portal/libre-acceso-la-informacion-publica/',
  denuncias: '/contenido/portal/contacto/denuncias-no-facturacion/',
  chat: '/contenido/portal/soporte-chat/',
};
export const SIDE_TITLES = {agencia:'Agencia Virtual',declaraguate:'Declaraguate',uip:'Acceso a la Información Pública',denuncias:'Denuncias Tributarias',chat:'Chat SAT'};
export function sideViewFor(path) {
  return Object.keys(SIDE_ROUTES).find(key => SIDE_ROUTES[key].replace(/\/$/,'') === path.replace(/\/$/,''));
}
const image = name => `/assets/laterales/${name}`;
function DemoNotice({children='Demostración local · Datos ficticios · Sin validez tributaria'}) {
  return <p className="side-demo-notice">{children}</p>;
}
function Back({Link}) {return <Link className="side-back" href="/">← Volver al portal</Link>;}
function Status({children}) {return <div className="side-status" role="status">{children}</div>;}

function AgenciaVirtual({Link,asset,Icon}) {
  const [delegated,setDelegated]=useState(false);
  const [logged,setLogged]=useState(false);
  const [help,setHelp]=useState('');
  const options = {
    video:['Conoce más acerca de Agencia Virtual','La Agencia Virtual reúne servicios tributarios en línea. En esta réplica podés explorar el acceso y un panel con casos ficticios.'],
    password:['¿Olvidaste tu contraseña?','Simulación: se enviaría un enlace al correo ficticio persona@example.test. No se envió ningún correo.'],
    register:['¿No tienes Agencia Virtual?','Solicitud de ejemplo: Persona Ejemplo · NIT FICTICIO. El registro real no se realiza desde esta aplicación.'],
    email:['¿Olvidaste tu correo electrónico de Agencia Virtual?','Correo del caso ficticio: persona@example.test. No se consultó información de contribuyentes.'],
    user:['Usuario de demostración','DEMO-001 corresponde a Persona Ejemplo. Los campos están fijados a datos ficticios.'],
    pass:['Contraseña de demostración','demo1234 es una clave ficticia para esta simulación local.'],
  };
  return <section className="av-page" aria-label="Agencia Virtual de demostración">
    <Back Link={Link}/>
    <div className="av-layout">
      <div className="av-brand"><img className="av-logo" src={image('agencia-logo.png')} alt="Agencia Virtual"/>
        <button className="av-video" onClick={()=>setHelp('video')}><Icon name="play" size={18}/> Conoce más acerca de Agencia Virtual</button>
        <img className="av-sat" src={asset('logo_sat_blanco-1.png')} alt="Superintendencia de Administración Tributaria"/>
      </div>
      <div className="av-panel">
        <h1>{logged?'Tu Agencia Virtual':'Accede a tu Agencia Virtual'}</h1>
        {!logged?<>
          <form className="av-login" onSubmit={e=>{e.preventDefault();setLogged(true);setHelp('');}}>
            <div className="av-field"><Icon name="user"/><label className="sr-only" htmlFor="av-user">Usuario</label><input id="av-user" value="DEMO-001" readOnly autoComplete="off"/><button type="button" aria-label="Información del usuario" onClick={()=>setHelp('user')}>ⓘ</button></div>
            <div className="av-field"><Icon name="lock"/><label className="sr-only" htmlFor="av-password">Contraseña</label><input id="av-password" type="password" value="demo1234" readOnly autoComplete="off"/><button type="button" aria-label="Información de contraseña" onClick={()=>setHelp('pass')}>ⓘ</button></div>
            <label className="av-delegated"><input type="checkbox" checked={delegated} onChange={e=>setDelegated(e.target.checked)}/> Permisos delegados</label>
            <button className="av-submit" type="submit">INICIAR SESIÓN</button>
          </form>
          <div className="av-options">{['password','register','email'].map(key=><button key={key} onClick={()=>setHelp(key)}>{options[key][0]}</button>)}</div>
        </>:<div className="av-account"><Status>Sesión ficticia iniciada · Persona Ejemplo{delegated?' · Permisos delegados de ejemplo':''}</Status><h2>Servicios Tributarios</h2><Link className="primary-button" href={SIDE_ROUTES.declaraguate}>Declaraguate</Link><p>NIT: FICTICIO · No hay trámites reales.</p><button className="av-submit" onClick={()=>setLogged(false)}>Cerrar sesión de ejemplo</button></div>}
        {help&&<div className="av-help" role="status"><strong>{options[help][0]}</strong><p>{options[help][1]}</p><button onClick={()=>setHelp('')}>Cerrar información</button></div>}
        <DemoNotice>SIMULACIÓN LOCAL · Usuario DEMO-001 · Clave ficticia demo1234</DemoNotice>
      </div>
    </div>
  </section>;
}

const formSamples=[
  ['SAT-2237','IVA GENERAL','Mensual','Impuesto al Valor Agregado. Régimen General. Declaración jurada y pago mensual.'],
  ['SAT-2046','IVA PEQUEÑO CONTRIBUYENTE','Mensual','Régimen de Pequeño Contribuyente. Declaración jurada simplificada y pago mensual.'],
  ['SAT-1311','ISR OPCIONAL MENSUAL','Mensual','Régimen opcional simplificado sobre ingresos de actividades lucrativas.'],
  ['SAT-1361','ISR TRIMESTRAL','Trimestral','Régimen sobre las Utilidades de Actividades Lucrativas.'],
  ['SAT-1411','ISR ANUAL','Anual','Impuesto Sobre la Renta. Declaración jurada y pago anual.'],
  ['SAT-1608','ISO','Trimestral','Impuesto de Solidaridad. Recibo de pago trimestral.'],
  ['SAT-4091','VEHÍCULOS CIRCULACIÓN','Anual','Impuesto Sobre Circulación de Vehículos.'],
  ['SAT-9911','AUTOCAPACITACIÓN','—','Entrenamiento en el uso del sistema Declaraguate.'],
];
const ethics='En SAT estamos comprometidos con la ética, integridad, transparencia y los valores institucionales, prohibiendo estrictamente la práctica, promoción o tolerancia de la corrupción en todas sus manifestaciones. Para ello, se establecen los controles y mecanismos necesarios a través de la mejora continua del Sistema de Gestión de Cumplimiento Ético, velando por la aplicación del Código de Ética de la SAT y régimen normativo relacionado, a efecto de recaudar de manera transparente; por lo que se promueve a través de la Gerencia de Asuntos Internos una cultura de cero tolerancia a la corrupción y cualquier acto de soborno e incumplimiento ético.';
function Declaraguate({Link}) {
  const tabs=[['llenar','Llenar formulario'],['buscar','Buscar formulario'],['presentar','Presentar formulario'],['preguntas','Preguntas frecuentes']];
  const [tab,setTab]=useState('llenar');
  const [form,setForm]=useState(null);
  const [saved,setSaved]=useState(false);
  const [found,setFound]=useState(false);
  const [presented,setPresented]=useState(false);
  const [declaration,setDeclaration]=useState({title:'SAT-2046 · IVA PEQUEÑO CONTRIBUYENTE',period:'2026-01',amount:'100.00'});
  function choose(key){setTab(key);setForm(null);setFound(false);}
  return <section className="dg-page">
    <nav className="dg-nav" aria-label="Navegación Declaraguate">{tabs.map(([key,title])=><a key={key} href={`#${key}-formulario`} aria-current={tab===key?'page':undefined} onClick={e=>{e.preventDefault();choose(key);}}>{title}</a>)}<img src={image('declaraguate-logo.png')} alt="Declaraguate.gt"/></nav>
    <div className="dg-body">
      <section className="dg-ethics"><h1>Declaración de Ética</h1><p>{ethics}</p></section>
      <Link className="dg-announcement" href={SIDE_ROUTES.agencia}><img src={image('declaraguate-aviso.png')} alt="Aviso importante: los formularios SAT-2237, SAT-1311, SAT-1361, SAT-1411 y SAT-1608 estarán disponibles únicamente desde la Agencia Virtual. Ingresá a Servicios Tributarios, Declaraguate, y completá el formulario."/></Link>
      <p className="dg-announcement-text"><strong>Aviso importante.</strong> Los formularios SAT-2237, SAT-1311, SAT-1361, SAT-1411 y SAT-1608 se encuentran en Agencia Virtual. Ingresá a Servicios Tributarios y seleccioná Declaraguate. <Link href={SIDE_ROUTES.agencia}>Ir a Agencia Virtual</Link></p>
      <h2>{tabs.find(([key])=>key===tab)[1]}</h2><DemoNotice>NAVEGACIÓN DE DEMOSTRACIÓN · Formularios con datos ficticios</DemoNotice>
      {tab==='llenar'&&!form&&<><p className="dg-table-hint" id="dg-table-hint">Deslizá la tabla para ver todas las columnas.</p><div className="dg-table-wrap" role="region" aria-label="Catálogo de formularios" aria-describedby="dg-table-hint" tabIndex={0}><table className="dg-forms"><thead><tr><th scope="col">Formulario</th><th scope="col">Periodicidad</th><th scope="col">Número</th><th scope="col">Descripción</th></tr></thead><tbody>{formSamples.map(item=><tr key={item[0]}><td><button className="side-text-link" onClick={()=>{setForm(item);setSaved(false);}}>{item[1]}</button></td><td>{item[2]}</td><td>{item[0]}</td><td>{item[3]}</td></tr>)}</tbody></table></div></>}
      {tab==='llenar'&&form&&<section className="dg-workspace"><h3>{form[0]} · {form[1]}</h3><form className="side-form" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);setDeclaration({title:form[0]+' · '+form[1],period:data.get('period'),amount:Number(data.get('amount')).toFixed(2)});setPresented(false);setSaved(true);}}><label>Contribuyente<textarea value="Persona Ejemplo · NIT FICTICIO" readOnly rows={2}/></label><label>Período de ejemplo<input name="period" type="month" defaultValue="2026-01" required/></label><label>Monto ficticio (Q)<input name="amount" type="number" min="0" step="0.01" defaultValue="100" required/></label><button className="primary-button">Guardar formulario de ejemplo</button></form>{saved&&<Status>Formulario DEMO-001 guardado en esta demostración. Código ficticio: 123456. <button className="side-text-link" onClick={()=>choose('presentar')}>Ir a Presentar formulario</button></Status>}<button className="side-text-link" onClick={()=>setForm(null)}>← Volver a formularios</button></section>}
      {tab==='buscar'&&<section className="dg-workspace"><form className="side-form" onSubmit={e=>{e.preventDefault();setFound(true);}}><label>Número de formulario de ejemplo<input readOnly value="DEMO-001"/></label><label>Código de acceso ficticio<input value="123456" readOnly/></label><button className="primary-button">Buscar ejemplo</button></form>{found&&<Status>DEMO-001 · Persona Ejemplo · {declaration.title} · {declaration.period} · Q{declaration.amount} · {presented?'Presentado en simulación':'Borrador ficticio'} · Sin validez tributaria.</Status>}</section>}
      {tab==='presentar'&&<section className="dg-workspace"><h3>Presentación de ejemplo</h3><p>Formulario DEMO-001 · Persona Ejemplo · {declaration.title} · {declaration.period} · Monto ficticio Q{declaration.amount}.</p><button className="primary-button" disabled={presented} onClick={()=>setPresented(true)}>Simular presentación</button>{presented&&<Status>Presentación simulada completada. No se envió ni pagó una declaración.</Status>}</section>}
      {tab==='preguntas'&&<div className="side-faq">{[['¿Cómo llenar un formulario?','Elegí Llenar formulario y seleccioná un ejemplo del catálogo.'],['¿Cómo buscar un formulario?','Usá Buscar formulario con el número ficticio DEMO-001 y código 123456.'],['¿Puedo realizar pagos o presentar declaraciones reales?','Esta aplicación solo simula la navegación. Los datos y resultados son ficticios.']].map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>}
      <Back Link={Link}/><p className="dg-footer">Réplica local de Declaraguate · No es un sitio oficial de la SAT.</p>
    </div>
    <button className="dg-help" onClick={()=>choose('preguntas')}><img src={image('declaraguate-whatsapp.png')} alt=""/> ¿Necesitas ayuda?</button>
  </section>;
}

const publicLinks=[
  'Ley de Acceso a la Información Pública (Decreto 57-2008, Artículo 10)',
  'Ley Orgánica del Presupuesto 2017 y sus Reformas',
  'Ley para el Fortalecimiento de la Transparencia Fiscal y la Gobernanza de la Superintendencia de Administración Tributaria (Decreto 37-2016)',
  'Estadísticas de sanciones y denuncias presentadas por SAT',
  'Estadísticas de solicitudes de Información Pública atendidas',
];
function PublicInformation({Link}) {
  const [selected,setSelected]=useState('');
  const [request,setRequest]=useState(false);
  return <article className="sat-side-page uip-page">
    <nav className="uip-breadcrumb" aria-label="Ubicación"><Link href="/">Inicio</Link><span>/</span> Libre Acceso a la Información…</nav>
    <div className="uip-layout"><div>
      <section><div className="uip-section-title"><img src={image('uip-acceso.png')} alt=""/><h1>Acceso a la Información Pública</h1></div>
        <p className="uip-description">Es el derecho de toda persona tiene para acceder a información en posesión de los sujetos obligados, según lo establece el Decreto Número 57-2008 del Congreso de la República de Guatemala. Es esencial para promover la transparencia y la rendición de cuentas de las entidades públicas y para fomentar la participación ciudadana. El acceso a la información se garantiza mediante la información que los sujetos obligados deben publicar, así como mediante el proceso de solicitud de información.</p>
        <ul className="uip-index">{['ÍNDICE DE INFORMACIÓN PÚBLICA DE LA SAT','INFORMACIÓN POR TRANSPARENCIA PROACTIVA'].map(text=><li key={text}><button className="side-text-link" onClick={()=>setSelected(text)}>{text}</button></li>)}</ul>
      </section>
      <section className="uip-request"><div className="uip-section-title"><img src={image('uip-solicitud.png')} alt=""/><h2>Solicitud de Información</h2></div>
        <p>Es el procedimiento mediante el cual se inicia el acceso a la información pública, en ese sentido, la Superintendencia de Administración Tributaria pone a disposición el correo electrónico <strong>uipsat@sat.gob.gt</strong>, donde recibirá una respuesta automática de confirmación que su solicitud ha sido ingresada o bien el formato por medio del portal web siguiente:</p>
        <DemoNotice>Solicitud de demostración · Solo se usan casos ficticios</DemoNotice>
        <form className="side-form" onSubmit={e=>{e.preventDefault();setRequest(true);}}><label>Solicitante de ejemplo<input value="Persona Ejemplo" readOnly/></label><label>Información de ejemplo<select><option>Información institucional</option><option>Estadísticas de ejemplo</option><option>Transparencia proactiva</option></select></label><button className="primary-button">Simular solicitud de información</button></form>{request&&<Status>Solicitud ficticia UIP-DEMO-001 registrada solo en esta pantalla.</Status>}
      </section>
      <section className="uip-unit"><h2>Unidad de Información Pública</h2><p>Es la dependencia responsable de recibir las solicitudes de información, así como de todo lo relacionado con las obligaciones que establece la Ley de Acceso a la Información Pública.</p><p>Lobby del Edificio Torre SAT, 7a. Avenida 3-73 zona 9, ciudad de Guatemala. Horario de atención de lunes a viernes de 8:00 a 16:00 horas.</p><p>Correo electrónico: <strong>uipsat@sat.gob.gt</strong><br/>Teléfono: 23297070, extensiones 1647 y 1648.</p></section>
      {selected&&<section className="uip-document" aria-live="polite"><h2>{selected}</h2><p>Vista de orientación local. El documento completo no se incluye en esta demostración.</p><button className="side-text-link" onClick={()=>setSelected('')}>Cerrar vista de orientación</button></section>}
    </div><aside className="uip-links" aria-label="Enlaces de información pública">{publicLinks.map(text=><button key={text} onClick={()=>setSelected(text)}>{text}</button>)}{selected&&<p role="status">Seleccionado: {selected}. La vista de orientación está al final del contenido.</p>}</aside></div><Back Link={Link}/>
  </article>;
}

function Complaints({Link,Icon}) {
  const [challenge,setChallenge]=useState('DEMO');
  const [code,setCode]=useState('');
  const [verified,setVerified]=useState(false);
  const [error,setError]=useState('');
  const [sent,setSent]=useState(false);
  const [instructions,setInstructions]=useState(false);
  const [concept,setConcept]=useState('No Facturación');
  return <article className="sat-side-page complaints-page"><h1 className="sat-page-title">Denuncias Tributarias</h1>
    <div className="complaints-intro"><p>Estimado Contribuyente: Agradecemos tu comunicación con nosotros.</p><p>Ahora puedes realizar tus denuncias tributarias por los conceptos siguientes: No Facturación, Establecimiento No Inscrito, Defraudación Tributaria y/o Evasión de Impuestos y Contadores. <button className="side-text-link" onClick={()=>setInstructions(!instructions)} aria-expanded={instructions}><strong>Procedimiento de denuncias tributarias.</strong></button></p>{instructions&&<div className="side-instructions"><p>En esta simulación: verificá el código visible, seleccioná un concepto y revisá el caso ficticio antes de simular el envío. Los datos permanecen en la aplicación local.</p></div>}</div>
    <section className="complaint-frame" aria-label="Cédula de denuncias"><div className="complaint-sheet"><h2>CÉDULA DE DENUNCIAS</h2>
      {!verified?<form className="complaint-verification" onSubmit={e=>{e.preventDefault();if(code.trim().toUpperCase()===challenge){setVerified(true);setError('');}else setError('El texto no coincide. Ingresá el código de demostración visible.');}}>
        <button className="captcha-refresh" type="button" aria-label="Cambiar código de demostración" onClick={()=>{setChallenge(c=>c==='DEMO'?'SAT8':'DEMO');setCode('');setError('');}}><Icon name="refresh" size={34}/></button>
        <label htmlFor="complaint-code">Ingrese los caracteres que se muestran en la imagen</label><div className="demo-captcha" role="img" aria-label={`Código de demostración: ${challenge}`}>{challenge}</div><small>Puede ingresar mayúsculas o minúsculas</small>
        <input id="complaint-code" value={code} onChange={e=>setCode(e.target.value)} placeholder="Ingrese aquí el texto" autoComplete="off" maxLength={8} aria-describedby="captcha-notice" aria-invalid={Boolean(error)}/>
        <button className="verify-button">✓ Verificar</button>{error&&<p className="side-error" role="alert">{error}</p>}<small id="captcha-notice">Verificación simulada. Escribí {challenge}.</small>
      </form>:<div className="complaint-local-form"><DemoNotice>VERIFICACIÓN SIMULADA · No se envían denuncias a la SAT</DemoNotice>{!sent?<form className="side-form" onSubmit={e=>{e.preventDefault();setSent(true);}}><label>Concepto<select required value={concept} onChange={e=>setConcept(e.target.value)} aria-describedby="complaint-concept-description"><option>No Facturación</option><option>Establecimiento No Inscrito</option><option>Defraudación Tributaria y/o Evasión de Impuestos</option><option>Contadores</option></select></label><p className="select-description" id="complaint-concept-description">{concept}</p><label>Establecimiento ficticio<textarea value="Comercio de Ejemplo · NIT FICTICIO" readOnly rows={2}/></label><label>Dirección ficticia<textarea value="Calle de Ejemplo 123 · Ciudad Ficticia" readOnly rows={2}/></label><label>Descripción del caso ficticio<textarea value="Caso de demostración: no se entregó una factura en una compra ficticia." readOnly rows={4}/></label><button className="primary-button">Simular envío de denuncia</button></form>:<Status>Denuncia ficticia DEMO-DEN-001 registrada en esta pantalla. No se envió información a ninguna institución.</Status>}<button className="side-text-link" onClick={()=>{setVerified(false);setSent(false);setCode('');setConcept('No Facturación');}}>Reiniciar demostración</button></div>}
      <p className="complaint-version">Versión 2.0.0 · Réplica local</p>
    </div></section><Back Link={Link}/>
  </article>;
}

function SupportChat({Link,asset,ChatConversation}) {
  const [active,setActive]=useState(false);
  const [survey,setSurvey]=useState(false);
  const [rating,setRating]=useState('5');
  const [surveySent,setSurveySent]=useState(false);
  const [cancel,setCancel]=useState(false);
  return <article className="sat-side-page support-page"><h1 className="sat-page-title">Chat SAT</h1>
    <div className="support-intro"><h2>Estimado contribuyente:</h2><p>Si su consulta es sobre la <strong>cancelación</strong> de gestiones de: solicitud de primer NIT, actualización de datos, activación de Agencia Virtual, cambio de correo electrónico en Agencia Virtual, reinicio de contraseña de Agencia Virtual, por favor llenar el formulario en el siguiente <button className="side-text-link" onClick={()=>setCancel(!cancel)} aria-expanded={cancel}>link</button>.</p><p>No es necesario interactuar con un operador. Es un gusto atenderle.</p>{cancel&&<div className="side-instructions"><h3>Cancelación de gestión · Demostración</h3><p>Gestión ficticia DEMO-001 · Persona Ejemplo. No se modifican solicitudes reales.</p><button className="primary-button" onClick={()=>setCancel(false)}>Cerrar ejemplo</button></div>}</div>
    <div className="support-columns"><section className="support-attention" aria-label="Panel de atención"><div className="support-warning">¡No te dejes engañar! La SAT no llama para confirmar datos por teléfono y no envía links para ingresar a páginas.</div><div className="support-brand"><img src={asset('logo_sat_blanco-1.png')} alt="SAT"/></div>
      {!active?<div className="support-hours"><p>Estimado Contribuyente, nuestro horario de atención es de lunes a viernes de 08:00 a 16:00 horas. Adicionalmente, de lunes a viernes contamos con un horario extendido de atención de 16:00 a 18:00 horas, disponible por teléfono al 1550 y por correo electrónico en ayuda@sat.gob.gt. También le atendemos los días sábado de 08:00 a 12:00 horas.</p><svg className="support-chat-symbol" viewBox="0 0 170 140" fill="none" aria-hidden="true"><path d="M103 42h33q20 0 20 20v55l-21-12h-32" stroke="#c6e1ee" strokeWidth="8" strokeLinejoin="round"/><path d="M30 10h58q20 0 20 20v50q0 20-20 20H43l-25 22V30q0-20 12-20Z" stroke="#2b91bf" strokeWidth="8" strokeLinejoin="round"/><path d="M44 40h3m31 0h3M43 76q20-20 40 0" stroke="#2b91bf" strokeWidth="5" strokeLinecap="round"/><path d="m43 26 8-2m24 0 8 3" stroke="#2b91bf" strokeWidth="3" strokeLinecap="round"/></svg><DemoNotice>CHAT LOCAL · No es atención oficial</DemoNotice><button className="primary-button" onClick={()=>setActive(true)}>Iniciar chat de demostración</button></div>:<div className="support-live-chat"><h2>Atención de demostración</h2><DemoNotice>Respuestas locales · No hay un operador real</DemoNotice><ChatConversation/><button className="side-text-link" onClick={()=>setActive(false)}>Finalizar chat de ejemplo</button></div>}
    </section><aside className="support-survey"><h2>Cuéntenos su experiencia</h2><p>Responda esta <button className="side-text-link" onClick={()=>setSurvey(true)}>encuesta de satisfacción</button> de 3 minutos y cuéntenos sobre su experiencia con el Chat de SAT.</p><p>Queremos tomar su opinión en cuenta y brindarle un servicio de calidad. <button className="side-text-link" onClick={()=>setSurvey(true)}>Ir a la encuesta</button></p>
      <button className="survey-art" onClick={()=>setSurvey(true)} aria-label="Abrir encuesta de satisfacción"><img src={image('chat-rita.png')} alt="Encuesta de satisfacción con el Chat SAT"/></button>
      {survey&&<div className="survey-form"><h3>Encuesta local</h3><DemoNotice>Opinión ficticia · No se envía a la SAT</DemoNotice>{surveySent?<Status>Gracias. Tu respuesta de ejemplo fue registrada en esta pantalla.</Status>:<form className="side-form" onSubmit={e=>{e.preventDefault();setSurveySent(true);}}><label>¿Cómo calificarías esta demostración?<select value={rating} onChange={e=>setRating(e.target.value)}>{['5','4','3','2','1'].map(v=><option key={v} value={v}>{v} de 5</option>)}</select></label><button className="primary-button">Guardar opinión de ejemplo</button></form>}<button className="side-text-link" onClick={()=>setSurvey(false)}>Cerrar encuesta</button></div>}
    </aside></div><Back Link={Link}/>
  </article>;
}
export default function SideView({view,...props}) {
  const Component={agencia:AgenciaVirtual,declaraguate:Declaraguate,uip:PublicInformation,denuncias:Complaints,chat:SupportChat}[view];
  return Component?<Component {...props}/>:null;
}
