# Controles y comprobación de la réplica

Aplicación: React/Vite, local en `http://127.0.0.1:5173/`. Fecha: 31 de octubre de 2026. Las pruebas usan un Chromium separado; no pulsan controles del portal original ni envían información a SAT.

Resultado final: **22 pruebas aprobadas, 0 fallidas, 0 omitidas**, ejecutadas en escritorio y móvil. El barrido adicional renderizó las 150 rutas locales únicas procedentes de los enlaces capturados en cada tamaño; también se comprobó una entrada HTTP directa a una ruta profunda. `npm run build` completó correctamente.

**Estados:** «Comprobado» exige ejecución en navegador local. «Parcial» identifica el ejemplo o componente efectivamente ejecutado. «Inspeccionado» verifica implementación/destino, pero no representa una visita o una operación externa. El comportamiento original se documenta por separado en [investigacion-complementaria.md](investigacion-complementaria.md).

| Control o grupo | Acción esperada | Implementación | Estado y alcance de comprobación |
| --- | --- | --- | --- |
| Logo SAT | Ir a Institucional | Enlace local `/#Institucional`, como el destino observado del logo original | Comprobado: navegación y URL en escritorio/móvil. |
| Inicio | Volver a portada | Ruta `/`, reinicio del desplazamiento | Implementado; navegación de retorno e historial comprobados mediante otras acciones que usan el mismo router. |
| Servicios Tributarios, Aduanas, Capacitación, Contáctanos | Desplazar a la sección correspondiente | Anclas locales, IDs existentes y margen por cabecera fija | Parcial: clic en Capacitación comprobado en ambos tamaños; destinos de los cuatro enlaces presentes e inspeccionados. |
| Menú móvil | Abrir/cerrar navegación; cerrar al elegir destino | Estado React, `aria-expanded`, botón con nombre actualizado | Comprobado: apertura, elección de destino y cierre en móvil. |
| Estadísticas Tributarias | Abrir vista local y cambiar año de ejemplo | Ruta local, selector 2025/2026 y barras con cifras marcadas ficticias | Comprobado en escritorio/móvil; se verifica cambio de serie y aviso. |
| Contact Center 1550 | Invocar la aplicación telefónica | Enlace `tel:1550` | Inspeccionado. No se realizó una llamada. |
| Flechas del banner | Cambiar al banner anterior/siguiente, con vuelta circular | Índice de cinco imágenes locales | Comprobado: cambio de imagen y retorno al estado inicial. |
| Indicadores del banner | Elegir una diapositiva | Botones con `aria-pressed` y nombres numerados | Comprobado: selección directa de banner 3 en ambos tamaños. |
| Teclado del banner | Cambiar mediante flechas izquierda/derecha | Manejador limitado a la región del carrusel | Comprobado con navegación por teclado en pruebas locales. |
| Pausa y reproducción del banner | Detener o reanudar avance automático | Temporizador de 12 s; pausa por puntero/foco; movimiento reducido inicia pausado | Comprobado: botones y avance tras 12 s con reloj controlado de Playwright, sin esperar ni interactuar con SAT. |
| Banner pulsable | Abrir contenido público o demostración correspondiente | Destinos de configuración SR7; los accesos tributarios autenticados se convierten en demostración | Implementado e inspeccionado; no se abrió el destino externo SVET. |
| Declaración Jurada de Viajero | Abrir demostración local | `/demostracion/declaracion-viajero`, sin envío tributario | Implementado; ruta y aviso de demostración inspeccionados. |
| Requisitos de Inscripción / Solicitar NIT | Abrir vista local coherente | Contenido resumido y recorrido de ejemplo para NIT | Implementado; no se realiza una inscripción. |
| Agendar mi Cita | Elegir caso y horario ficticios, simular resultado | Dos selectores con ejemplos, formulario solo en memoria | Comprobado: horario disponible, simulación y aviso «Cita ficticia seleccionada». |
| Siete categorías tributarias | Mostrar el subconjunto correspondiente | Filtro por clases de categoría extraídas, `aria-pressed` | Comprobado: todas las categorías, conteos y títulos de tarjetas en ambos tamaños. |
| Ocho categorías aduaneras | Mostrar el subconjunto correspondiente | Mismo componente de catálogo; múltiples categorías por tarjeta cuando corresponde | Comprobado: las ocho categorías, conteos y títulos en ambos tamaños. |
| Tarjetas tributarias y aduaneras | Abrir una vista local del servicio | 111 tarjetas; router por URL pública extraída, contenido descriptivo y demo | Comprobado el renderizado de las rutas de todas las tarjetas dentro del barrido de 150 destinos. Interacción completa de Impresión de RTU y retorno comprobados; no se pulsó individualmente cada tarjeta. |
| Selector de caso / Simular consulta | Mostrar un resultado de ejemplo sin datos reales | Casos DEMO-001 y DEMO-002, resultado ficticio | Comprobado: selección DEMO-002 y resultado. |
| Descargar ejemplo JSON | Descargar archivo local marcado sin validez tributaria | Blob creado en navegador, sin red | Comprobado: contenido JSON con `demostracion`, `nit: FICTICIO` y `sinValidezTributaria: true`. |
| Capacitación: seis tarjetas | Mostrar opciones y permitir volver | Panel reversible controlado por botón, accesible en táctil y teclado | Parcial: Capacitaciones y Preguntas Frecuentes ejecutadas; las seis usan el mismo componente y están presentes en capturas. |
| Preguntas Frecuentes | Expandir respuestas locales | Elementos nativos `details/summary` | Comprobado: expansión y respuesta «Esta página es oficial». |
| Contacto: ubicaciones, orientación, quejas y denuncias | Abrir opciones; acceder a contenido o destino público | Listas de enlaces extraídas; rutas locales para información incluida | Parcial: apertura de Ubicaciones y Horarios y vista Agencias comprobadas; resto comparte componente y destinos inspeccionados. |
| CLIC | Abrir sitio público identificado | Enlace HTTPS externo, nueva pestaña y `noopener noreferrer` | Inspeccionado. No se visitó el sitio externo. |
| Noticias / Leer Más | Abrir vista local del extracto | Cuatro publicaciones con imagen, texto de portada y fuente pública | Comprobado el renderizado de sus rutas en el barrido; se conserva el alcance de extracto, no se inventan artículos completos. |
| Leer más noticias | Abrir índice de noticias local | Vista `/contenido/portal/categoria/noticias/` | Implementado; colección de cuatro noticias disponibles. |
| Institucional: cuatro tarjetas | Abrir información o demostración de empleo | Vistas locales; contratación autenticada se representa como demo | Rutas públicas locales incluidas en el barrido. Empleo implementado como demo e inspeccionado; no se registra currículum ni se solicitan credenciales. |
| Agencia Virtual y Declaraguate laterales | Abrir demostraciones locales identificadas | Rutas `/demostracion/agencia-virtual` y `/demostracion/declaraguate` | Implementado; no se conectan a formularios de SAT. |
| UIPSAT y Denuncias laterales | Abrir información local | Destinos extraídos y router compartido | Implementado e inspeccionado. |
| Lupa / Buscar | Buscar contenidos, normalizando tildes | Filtrado de títulos y descripciones en memoria, sin red | Comprobado: «vehiculos», «RTU», ausencia de resultados, foco inicial y navegación a resultado. |
| Cerrar buscador | Cerrar con X, fondo o Escape | Diálogo nativo y captura de Escape para evitar que el campo de búsqueda lo consuma | Comprobado Escape en escritorio/móvil. X y fondo implementados mediante el mismo cierre, sin prueba individual específica. |
| Chat y RITA | Abrir asistente de demostración local | Diálogo con aviso «No es atención oficial», sin servicio externo | Comprobado desde el acceso de chat. RITA usa la misma acción; su botón y recurso están inspeccionados. |
| Sugerencias / Enviar en chat | Responder a una consulta de ejemplo | Reglas locales NIT/RTU/vehículos y respuesta general; entrada vacía deshabilita envío | Comprobado: sugerencia RTU, mensaje escrito «vehículos», respuesta y Escape. No se usa IA remota ni se guarda la conversación. |
| Redes sociales | Abrir destino público en nueva pestaña | Ocho enlaces, `target=_blank`, `rel=noopener noreferrer` | Comprobados atributos; no se visitaron destinos. Telegram es una normalización inferida, indicada en el informe. |
| Correo electrónico | Abrir el destino público observado | Enlace a `https://login.microsoftonline.com/`, como la captura | Inspeccionado. No se inició sesión. |
| Mapa del sitio | Mostrar secciones y servicios locales | Índice generado con enlaces al contenido incluido | Comprobado: apertura y presencia de destinos. |
| Fuente pública de cada contenido | Abrir la fuente original identificada | Enlace separado, nueva pestaña | Inspeccionado; no se validó disponibilidad de todas las fuentes. |
| Volver al portal / historial | Volver a inicio o estado de ruta anterior | History API, `popstate` y enlaces locales | Comprobado: retorno desde demo y desde mapa, historial atrás desde tarjeta. |
| Volver arriba | Desplazar al inicio | `scrollTo`, respeta movimiento reducido | Comprobado: desplazamiento desde pie y posición final cero. |
| Recursos y diseño adaptable | Cargar imágenes/fuentes y evitar desborde horizontal | Recursos locales, CSS con puntos de adaptación y filtros desplazables | Comprobado en 1520 × 900, 1632 × 1000 y 390 × 844: sin imágenes rotas ni desborde horizontal en la portada; revisión visual de capturas. |
| Ausencia de controles vacíos | Cada enlace define un destino y cada botón tiene acción | Sin `href="#"` ni botones meramente decorativos | Comprobación automática de enlaces vacíos en portada e inspección de los manejadores. |

## Evidencias de ejecución

- Pruebas: [tests/portal.spec.js](../tests/portal.spec.js) y [playwright.config.js](../playwright.config.js).
- Resultado ejecutado: [playwright-results.json](playwright-results.json).
- Resumen de ejecución y límites: [pruebas-locales.md](pruebas-locales.md).
- Capturas: [escritorio 1632](capturas-locales/escritorio-1632.png), [móvil 390](capturas-locales/movil-390.png), además de capturas generadas por la suite en `capturas-locales/`.
- Métricas visuales: [comparacion-visual-metricas.json](comparacion-visual-metricas.json).

Las comprobaciones de consola, imágenes, respuestas HTTP y ausencia de solicitudes externas corresponden a la carga de la portada en el navegador de pruebas. No se extrapolan a la disponibilidad de internet, destinos externos ni a todos los estados posibles del navegador. No se comprobó el sitio original en móvil, ni se completó ningún flujo tributario real.
