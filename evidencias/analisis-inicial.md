# Análisis inicial del portal público de la SAT

Fecha: 31 de octubre de 2026, aproximadamente 10:12–10:15, America/Guatemala (UTC−06:00).

La portada observada organiza información y accesos mediante anclas, catálogos filtrables y enlaces a páginas de contenido. Hay evidencia fuerte de un frontend producido con WordPress, The7 y Elementor. La observación no permite establecer la arquitectura de los sistemas transaccionales enlazados ni del servidor.

## Alcance y método

Se utilizó el **servidor MCP REA**, conectado por CDP a `http://127.0.0.1:9222`. REA estuvo disponible y la conexión fue exitosa. Se ejecutaron `list_browser_targets`, `inspect_web_page`, `analyze_web_bundle`, consultas de evidencia retenida, `export_web_scripts` e `inspect_web_event_listeners`.

La inspección se limitó a la portada pública ya abierta y a sus recursos disponibles. No se hicieron clics, navegaciones, recargas, envíos de formularios, llamadas a APIs del sitio, ejecución de JavaScript en la página ni modificaciones de datos. Los scripts se leyeron y analizaron como texto. El navegador del usuario quedó abierto. Los únicos archivos creados por este trabajo están en `evidencias/`.

**Convenciones:** «hecho» significa observado en CDP o presente literalmente en una fuente capturada; «derivado» es un resultado reproducible de procesar esas fuentes sin ejecutarlas; «inferencia» es una interpretación, con sus límites. Que un script esté disponible no demuestra que cada función se haya ejecutado.

## Pestañas e identificación

El listado de REA devolvió una página HTTP(S):

| Título observado | URL | Target ID |
| --- | --- | --- |
| Superintendencia de Administración Tributaria SAT | <https://portal.sat.gob.gt/portal/> | `1F03AA16EBDEF798892CB49DBD862C6C` |

**Hecho:** el título y el dominio permiten identificar la pestaña solicitada. El navegador se identificó como `Chrome/156.0.8078.47`, con protocolo CDP `1.3`. Se excluyeron dos objetivos de tipo distinto de página; no se los contabiliza como pestañas públicas adicionales. El estado previo de conexión de otros depuradores quedó desconocido (`attached: null`). Evidencia: [listado completo](rea-pestanas.json), registro `ev_9becd66834d72d38960738e5624297d970adee4a4919d504bf0dd43ed38acf9f`.

## Navegación

Los nombres provienen del árbol de accesibilidad y los destinos de `metadata.dom_urls` en la [captura pública](rea-captura-publica.json). No se visitaron los destinos.

| Acceso | Evidencia del destino | Lectura |
| --- | --- | --- |
| Servicios Tributarios | DOM 513 y 589: `/portal/#servicios` | Ancla dentro de la portada. |
| Aduanas | DOM 518 y 595: `/portal/#aduanas` | Ancla dentro de la portada. |
| Capacitación | DOM 523 y 601: `/portal/#capacitacion` | Ancla dentro de la portada. |
| Contáctanos | DOM 528 y 607: `/portal/#contactanos` | Ancla dentro de la portada. |
| Estadísticas Tributarias | DOM 533 y 613: `/portal/estadisticas-tributarias-sat/` | Enlace a otra página. |
| Ir al contenido | DOM 466: `/portal/#content` | Acceso para saltar al contenido. |
| Institucional / enlaces del logo | DOM 483, 493 y otros: `/portal/#Institucional` | Ancla con mayúscula inicial; el código del logo coincide con ella. |

**Hecho de código:** el script `items[4]` registra un `DOMContentLoaded` que, cuando el hostname es `portal.sat.gob.gt`, asigna `/portal/#Institucional` a `.branding a, a.sticky-logo`. Los destinos ya observados coinciden, aunque no se registró la ejecución de ese manejador. Ver fragmento `logo-ancla` en [fragmentos JavaScript](fragmentos-javascript.json).

El catálogo tributario presenta siete filtros: Consultas Frecuentes, Contribuyentes, Cumplimiento Tributario, Mis Documentos, Requisitos, Solicitudes y Vehículos. Aduanas presenta ocho: Exportación, Facilitación de Comercio, Gestiones Aduaneras, Gestiones de Mercancías, Importación, Lucha contra la Defraudación y Contrabando Aduaneros, Marco Legal y MIAD. **Hecho:** sus enlaces llevan `?term=...` (por ejemplo, DOM 941 y 2526). Las tarjetas incluyen destinos `/portal/project/...`, como `factura-electronica/`, `impresion-de-rtu/` y `verificador-integrado/`.

**Derivado:** un script de impresión contiene una copia de HTML, extraída decodificando un literal JSON sin ejecutar JavaScript. Allí los filtros tienen clases `filter-item` y atributos `data-filter`, por ejemplo `.category-15575` y `.category-15583`. El HTML de impresión también contiene los cinco destinos de anclas de secciones. Esto respalda la estructura, pero no equivale a una lectura de los valores de atributos del DOM vivo. Ver [estructura extraída](estructura-desde-script-impresion.json), origen `scripts.items[24]`.

**Inferencia fuerte:** los filtros están preparados para cambiar las tarjetas mostradas mediante JavaScript. El código de The7 lee `data-filter`, registra clics sobre `.filter-categories a` y contiene una rama que llama a `isotope({filter: ...})`, además de otra de filtrado CSS grid. No se comprobó cuál rama utiliza esta instancia ni el resultado de un clic. Los enlaces `?term=` son hechos; su respuesta del servidor queda sin verificar.

Hay accesos llamados Agencia Virtual, Declaraguate, UIPSAT, Denuncias Tributarias, Buscador y Chat SAT en accesibilidad (nodos 5086–5116). Su presentación corresponde probablemente a un menú de accesos flotante, dado el script de Float Menu; no se verificó su posición visual. También se observan enlaces a noticias, biblioteca, capacitación, contacto, transparencia, empleo y redes sociales. El contenido de impresión incluye destinos en otros dominios, por ejemplo la declaración del viajero en `farm2.sat.gob.gt`; estos destinos no fueron abiertos.

## Estructura y componentes

**Hechos del DOM capturado:** 5.263 entradas, incluyendo texto y pseudo-elementos; 354 elementos `A`, 24 `SECTION`, 115 `ARTICLE`, 134 `IMG`, un `HEADER`, un `NAV` y tres `FOOTER`. Estos números no representan componentes únicos ni garantizan visibilidad. Accesibilidad contiene 1.318 nodos, incluidos nodos ignorados.

| Área | Evidencia | Interpretación acotada |
| --- | --- | --- |
| Cabecera y menú | `HEADER` DOM 480; `NAV` 503; rol `navigation` AX 4; script UberMenu | Navegación principal con comportamiento adaptable previsto por el plugin. No se probó la vista móvil. |
| Banner | Un `SR7-MODULE`, diez `SR7-SLIDE`, dos `SR7-ARROW`; configuración `SR7.JSON['SR7_5_1']` titulada «Banner principal» | Carrusel de Slider Revolution, con configuración de transición y tamaños. No se midió su reproducción. |
| Inicio de contribuyente | Encabezado AX 806 y enlaces Requisitos de Inscripción, Solicitar NIT y Agendar mi Cita | Grupo de accesos para nuevos contribuyentes. |
| Servicios y Aduanas | Encabezados AX 946 y 2530, filtros y tarjetas `/project/` | Catálogos agrupados por categorías. |
| Capacitación | AX 3638; Sobre la SAT, Capacitaciones, Cultura Tributaria, Biblioteca Virtual y Preguntas Frecuentes | Tarjetas informativas y enlaces de orientación. |
| Contacto, noticias e institucional | Encabezados AX 4034, 4321 y 4556; cuatro `TIME` en DOM | Contacto, publicaciones fechadas y accesos institucionales. |
| Pie y ayudas | Roles `contentinfo`, enlace Mapa del sitio e Ir arriba | Cierre de navegación y accesos auxiliares. |
| Chat | DOM 5021 `APP-ROOT`, 5022 `CHAT-DIALOG`, 5040 `INPUT`; callback en polyfills de un recurso denominado chatbot | Componente separado, posiblemente basado en Angular; framework y versión no confirmados. No se abrió ni se escribió en el chat. |

**Derivado del HTML de impresión:** hay widgets `the7_elements.default` (2), `the7_elements_carousel.default` (1), `flip-box.default` (11), `menu-anchor.default` (5), además de imágenes, encabezados, iconos y redes sociales. Son declaraciones del contenido incrustado, no un inventario de instancias ejecutándose.

## Tecnologías y JavaScript

La primera captura retuvo **68 fuentes JavaScript**, todas con `is_module: false`, por un total de **3.466.262 bytes de texto UTF-8**. Se exportaron las 68 con sus hashes en [scripts-publicos/manifest.json](scripts-publicos/manifest.json). Esto mide las fuentes retenidas, no los bytes transferidos por red ni todo el JavaScript posible. Hay 93 etiquetas `SCRIPT` en el DOM; ambas cuentas corresponden a inventarios diferentes.

Las versiones de la tabla son cadenas publicadas en URLs o fuentes; no constituyen una verificación de la instalación del servidor.

| Tecnología | Hecho verificable en `scripts.items` | Conclusión |
| --- | --- | --- |
| WordPress | Recursos `/wp-includes/`, `/wp-content/`; configuración `/wp-admin/admin-ajax.php` y `/wp-json/` en índice 13 | Inferencia fuerte de frontend WordPress. Versión del núcleo y backend sin confirmar. |
| The7 / The7 Core | Índices 25 y 1: `themes/dt-the7/js/main.min.js?ver=15.0.7` y `plugins/dt-the7-core/...post-type.min.js?ver=2.7.13` | Fuentes identificables del tema y su complemento. |
| Elementor / Pro | Índices 37 y 40: `frontend.min.js?ver=4.3.5` y `?ver=4.3.2`; HTML con `data-elementor-id="52883"` | Evidencia fuerte del uso del constructor para el contenido de portada. |
| jQuery | Índice 48, cabecera literal `jQuery v3.7.1`; Migrate en 35 y jQuery UI en 29, 11 y 39 | Bibliotecas presentes; UI anuncia `ver=1.14.2`. |
| UberMenu | Índice 22: `ubermenu.min.js?ver=3.8.5`, código de eventos táctiles y ratón | Menú con soporte adaptable en el código disponible. |
| Slider Revolution | Índices 9, 13 y 30; elementos `SR7-*` | Hay distintas cadenas: configuración `6.7.58` y `SR7.version` con `6.7.40`. No se asigna una versión única verificada. |
| Isotope y Swiper | Cabecera `Isotope PACKAGED v3.0.0` dentro de 25; índice 28 `swiper.min.js?ver=8.4.5` | Capacidades de organización de tarjetas y carruseles presentes. |
| WP Rocket / LazyLoad | Índice 26 bajo `plugins/wp-rocket/.../17.8.3/`; índice 56 configura imágenes e iframes diferidos | Optimización y carga diferida en el código. `17.8.3` identifica el archivo de LazyLoad, no la versión de WP Rocket. |
| WP File Download y dFlip | Índices 47 y 33, configuración dFlip en 7 | Código para búsquedas/documentos y visor de publicaciones. Su presencia no prueba que cada función se use en esta portada. |
| Google Tag Manager / Site Kit | Índice 10 inicializa `dataLayer` y declara carga de `gtm.js`; índices 50 y 64 son proveedores de eventos Site Kit | Integración de medición configurada. No se observó el envío de eventos. |
| Cloudflare | Índices 8 y 66: `/cdn-cgi/challenge-platform/...` y `__CF$cv$params` | Inferencia fuerte de integración con su plataforma de challenge; no verifica la topología de alojamiento ni políticas del servidor. |

Los [fragmentos JavaScript](fragmentos-javascript.json) conservan URL, `script_key`, SHA-256 y coordenadas para revisar estas afirmaciones. En particular:

- `filtro-isotope` y `filtro-css-grid`: lectura de `data-filter` y ramas de filtrado de The7. `scroll-anclas` muestra cálculo del desplazamiento de anclas.
- `lazyload-observer` y `lazyload-rocket`: uso de `IntersectionObserver`, `MutationObserver` y selectores de carga diferida.
- `sr7-endpoints` y `wpfd-get`: URLs/configuración de AJAX y una llamada GET construida con `wpfdajaxurl + "task=search.getTagByCatId"`. Son hechos del código, no tráfico observado. No se invocaron esas rutas.
- `impresion-sessionStorage`: código de la aplicación que prepara `h5ab-print-article` en `sessionStorage`. Se leyó su fuente; REA no ejecutó esa escritura ni leyó valores del almacenamiento del navegador.

**Listener observado:** el primer `.filter-categories a` existe y tiene un listener `click`, no pasivo. CDP ubica el callback en `https://s3.amazonaws.com/s3bucket-satgt-pro-chatbot-ac-portal-sat/v3.0.4/polyfills.js`, línea 0, columna UTF-16 21386 (coordenadas CDP desde cero). La fuente contiene Zone.js. Es compatible con un envoltorio de eventos; no demuestra que el chat implemente el filtro ni identifica el manejador final de The7. La ejecución figura como `unknown`. La identidad del script se vinculó al contexto principal del frame, y REA confirmó la liberación de su conexión de inspección. Evidencia: [listener del filtro](rea-listener-filtro.json), `ev_ca66f278eba6a2bbbe8570391d1ac5d29153c40e0173787b493b11c257a34b75`.

## Límites y hallazgos no confirmados

La captura principal observó durante 1.500 ms; su ventana total fue `2026-10-31T16:12:27.289Z`–`16:12:29.977Z`. No registró solicitudes ni conexiones WebSocket en esa ventana. La actividad anterior a la conexión de REA no está disponible: no corresponde concluir que la página no haga solicitudes o no utilice APIs.

El origen autorizado para la captura principal fue `https://portal.sat.gob.gt`. Su estado es `policy_filtered`, también limitado por el momento de conexión, sin secciones truncadas ni eventos descartados por capacidad. Se filtraron ocho scripts por otro origen, uno por origen no atribuible y dieciséis por URL no admitida; once recursos de otros orígenes también quedaron fuera. Dos frames con URL no admitida se excluyeron. El listener posterior tiene su propia atribución de contexto y no convierte la captura inicial en un inventario completo de terceros.

El análisis estático de REA tiene estado `partial`: 67 scripts procesados, uno fuera del plazo por script y otro con recuperación de errores de parser. El detalle del timeout dice: `analyze_web_bundle reached its 30000 ms per-script deadline (deadlineExpired) for analysis_timeout_ms. This is not total_analysis_timeout_ms and not the MCP client deadline.` Afecta a `revslider/public/js/sr7.js`; sus bytes sí están conservados en la primera captura. No se reintentó ni se modificó la configuración para ampliar el análisis.

El inventario automático normalizado devuelve cero patrones de rutas y cinco lagunas; **no demuestra ausencia de rutas**. El resultado bruto incluye como candidato de `property:path` una cadena de dibujo SVG que empieza `M742 167L500...`, descartada aquí por no ser una ruta web. También propone candidatos de baja confianza como `settings` y `pageViews` por llamadas `.get(...)`; no se presentan como endpoints reales. La navegación descrita arriba está respaldada por enlaces y código específico, no por esos candidatos genéricos.

Solo se identificó una declaración de source map, la de Swiper; no se descargaron mapas ni dependencias faltantes. La presencia de rutas `wp-admin` o `app/admin/assets` en configuraciones o archivos públicos no demuestra acceso administrativo. Quedan desconocidos los resultados de navegación, funcionamiento de filtros y búsqueda, estados autenticados, API reales de trámites, framework del chat, infraestructura y bases de datos. No se realizó una evaluación de vulnerabilidades.

## Evidencias guardadas

| Archivo | Contenido / identidad |
| --- | --- |
| [rea-pestanas.json](rea-pestanas.json) | Listado de pestañas y metadatos del navegador. |
| [rea-captura-publica.json](rea-captura-publica.json) | DOM, accesibilidad, URLs, recursos y fuentes. Evidence ID `ev_4c0a4a4413a2e4153b4915d73179a4788017a1403d00fc827e1463670d33a9c8`. |
| [scripts-publicos/manifest.json](scripts-publicos/manifest.json) | Relación entre URLs, `script_key`, archivos exportados y SHA-256; variantes con query y scripts inline quedan aislados, sin asumir resolución de módulos. |
| [rea-analisis-javascript.json](rea-analisis-javascript.json) | Evidence completa de `analyze_web_bundle`, `ev_764f194a3f82b3cc5b37858041817af154cf3a5df363dde6ae8cf0d2a494b3ef`. Incluye limitaciones y candidatos automáticos sin validar. |
| [rea-rutas-resumen.json](rea-rutas-resumen.json) | Proyección normalizada con cobertura y conteos del inventario de rutas. |
| [rea-listener-filtro.json](rea-listener-filtro.json) | Descriptor del listener y fuente de polyfills con hash. |
| [fragmentos-javascript.json](fragmentos-javascript.json) | Quince fragmentos derivados con posiciones y hashes de sus fuentes. |
| [estructura-desde-script-impresion.json](estructura-desde-script-impresion.json) | IDs, widgets y enlaces derivados exclusivamente del HTML incrustado para impresión. |

Los índices DOM, AX y de scripts pertenecen a sus respectivas colecciones; no son intercambiables. En `fragmentos-javascript.json`, las líneas y columnas empiezan en uno; `script_index` empieza en cero. Los `relative_path` del manifiesto de scripts se resuelven contra `scripts-publicos/files/`, indicado por `analysis_input.input_path`. Se verificaron el SHA-256 y el tamaño de los 68 archivos exportados, el hash de la captura indicado en el manifiesto, la trazabilidad de los quince fragmentos, la validez de los JSON y los enlaces locales del informe. Los archivos conservan las evidencias completas citadas para permitir su revisión independiente.
