# Accesos laterales: inspección e implementación

Fecha: 4 de noviembre de 2026, America/Guatemala.

Se implementaron cinco pantallas React en `src/SideViews.jsx`, con estilos en `src/side-views.css`. Las rutas previas de Agencia Virtual, Declaraguate, UIPSAT, Denuncias y Chat se reutilizan. El componente de enlaces respeta los destinos locales con `target="_blank"` sin interceptar esos clics.

## Inspección del original

Se utilizó REA mediante MCP, conectado a Chromium en `http://127.0.0.1:9222`. El primer intento encontró el puerto inaccesible. Después de que el usuario confirmó que Chromium estaba abierto, se descubrieron las seis pestañas y se inspeccionaron las cinco pantallas y la portada con `inspect_web_page`.

| Pantalla | URL pública observada | Evidence ID de REA |
| --- | --- | --- |
| Portada | https://portal.sat.gob.gt/portal/ | `ev_d8f9dedcc370535c822f0b12fd30079e1b7ba622ca1a3a89ca1bc2941f1d0a55` |
| Agencia Virtual | https://farm3.sat.gob.gt/menu/login.jsf | `ev_070abed0b4220ee80287fa4259cc5c52d20e6d460a9fa7552af6245f7dd8ad91` |
| Declaraguate | https://declaraguate.sat.gob.gt/declaraguate-web/ | `ev_2367140e04426ec97f4831b0512ce526f6f67d8941dd95bad12813f5eb835a73` |
| UIPSAT | https://portal.sat.gob.gt/portal/libre-acceso-la-informacion-publica/ | `ev_4e61fe8a674378425fcc4266e1b55ea32fd1a4084ace73a20d29e7ca03ba7e8c` |
| Denuncias | https://portal.sat.gob.gt/portal/contacto/denuncias-no-facturacion/ | `ev_08162db0399dd89d793e990c666d16f16d65eee9191922956e93d7f797c7259f` |
| Chat SAT | https://portal.sat.gob.gt/portal/soporte-chat/ | `ev_0bd9ad5b4d4f9220e2f4801b81d0fe24abbe7322ace97d2b55d7b1dda1079858` |

`scripts/inspect-side-originals.mjs` complementó la inspección mediante lecturas CDP de atributos de enlaces, imágenes, tamaños, fuentes y los elementos de chat. No hace clics, no navega y no lee cookies ni almacenamiento. Las imágenes públicas se descargaron sin credenciales ni cookies y se guardan en `public/assets/laterales/`. La procedencia y los hashes figuran en [laterales-recursos.json](laterales-recursos.json).

### Pestañas y paneles

Los atributos `target` se leyeron en el DOM original. La tabla describe esas declaraciones de navegación; no se hicieron cinco clics adicionales sobre el original.

| Ícono | Ruta local | Apertura declarada en el original y aplicada localmente |
| --- | --- | --- |
| Agencia Virtual | `/demostracion/agencia-virtual` | Nueva pestaña (`_blank`) |
| Declaraguate | `/demostracion/declaraguate` | Nueva pestaña (`_blank`) |
| UIPSAT | `/contenido/portal/libre-acceso-la-informacion-publica/` | Nueva pestaña (`_blank`) |
| Denuncias Tributarias | `/contenido/portal/contacto/denuncias-no-facturacion/` | Pestaña actual (`_self`) |
| Chat SAT | `/contenido/portal/soporte-chat/` | Pestaña actual (`_self`) |
| Lupa | Panel de búsqueda local | El usuario pulsó la lupa; REA observó `#link-search`, el campo de búsqueda, Buscar y Close. Evidence ID `ev_85b1e38bd0a3fe4d10bde52f8471108cfb19e4e71e7cc32184188473d62e3de3`. |
| RITA | Panel de conversación local | El usuario cerró la búsqueda y pulsó RITA. REA observó el saludo, los temas y el campo «Escriba su mensaje...». No hubo navegación adicional; el fragmento anterior permanece. Evidence ID `ev_928b9e276261909d656099dbe039be7ffdde3a91de0459a745fd45850c46d9f8`. |

El comportamiento de lupa y RITA quedó confirmado. No se enviaron consultas ni formularios al original. El chat de soporte original contiene un iframe de Five9 y Denuncias un iframe de `farm3.sat.gob.gt`; ambos se sustituyen por componentes React con estado en memoria.

REA también capturó los píxeles de Agencia Virtual (`ev_cc80dd599582cc89d7cc3a9462c381f450465e596f8534090f093c0b6a7cc3cd`) y Chat SAT (`ev_7046fa6ac1a9a0395f20492b0c92319c0b323643a61c6151701784bef266cb2e`). La exportación completa de once registros permanece local en `rea-laterales-sesion.json`, excluida de Git junto con `laterales-dom-original.json`.

## Pantallas e interacciones locales

- **Agencia Virtual:** fondo y logo originales locales, panel de acceso, permisos delegados, opciones de contraseña, alta y correo. Los campos contienen exclusivamente `DEMO-001` y la clave ficticia `demo1234`, fijados a lectura. El inicio y cierre de sesión cambian el estado local; no hay autenticación real ni correos enviados.
- **Declaraguate:** navegación propia, declaración de ética, aviso original de migración a Agencia Virtual y catálogo de ocho formularios de ejemplo. Se puede llenar, guardar, buscar y presentar un caso ficticio; el monto y período guardados se conservan al cambiar entre esas opciones. El enlace del aviso abre Agencia Virtual local. La ayuda abre preguntas frecuentes locales.
- **UIPSAT:** cabecera del portal, información pública, solicitud y unidad de información, imágenes originales y cinco enlaces en columna lateral. Los enlaces muestran orientación local identificada; los documentos legales y estadísticas íntegros quedan fuera del alcance. La solicitud usa un solicitante ficticio.
- **Denuncias:** título, instrucciones y cédula dentro de la aplicación. El código visible `DEMO` se verifica localmente; el botón de refrescar lo cambia por `SAT8`. Una entrada incorrecta informa el error. El formulario posterior usa un establecimiento, dirección y relato ficticios, con concepto seleccionable y confirmación simulada.
- **Chat SAT:** soporte en dos columnas, horario, panel de atención y encuesta con su imagen original. El chat responde mediante reglas locales, la encuesta guarda una calificación en memoria y la cancelación de gestiones abre una explicación ficticia. RITA conserva su panel separado del acceso a la página de soporte.

Ninguna pantalla hace solicitudes a servicios externos al usarse. Los ejemplos se reinician al recargar; no se implementa almacenamiento persistente.

## Comparación visual y comprobaciones

Se compararon manualmente las cinco pantallas con las capturas adjuntas y las observaciones del original. Se reprodujeron los recursos finales disponibles, incluyendo el logo cargado del panel de soporte, que aparece roto en la captura adjunta pero sí cargó en la captura posterior de REA. Los avisos de réplica y los datos ficticios son añadidos deliberados.

| Pantalla | Escritorio 1920 × 932 | Móvil 390 × 844, captura completa |
| --- | --- | --- |
| Agencia Virtual | [Captura](capturas-laterales/referencia-1920-agencia.png) | [Captura](capturas-laterales/mobile-agencia.png) |
| Declaraguate | [Captura](capturas-laterales/referencia-1920-declaraguate.png) | [Captura](capturas-laterales/mobile-declaraguate.png) |
| UIPSAT | [Captura](capturas-laterales/referencia-1920-uip.png) | [Captura](capturas-laterales/mobile-uip.png) |
| Denuncias | [Captura](capturas-laterales/referencia-1920-denuncias.png) | [Captura](capturas-laterales/mobile-denuncias.png) |
| Chat SAT | [Captura](capturas-laterales/referencia-1920-chat.png) | [Captura](capturas-laterales/mobile-chat.png) |

La adaptación móvil es local: columnas apiladas, acceso inferior a los seis íconos y RITA, menú móvil y formularios que caben en el viewport. No se modificó el tamaño ni la navegación de las pestañas originales para afirmar una observación móvil del original. La comparación no es una certificación de igualdad píxel a píxel.

Las pruebas `tests/side-views.spec.js` hacen clic en los cinco íconos desde la portada, esperan la pestaña correcta, comprueban rutas, títulos y recarga, detectan solicitudes externas, imágenes rotas, errores JavaScript y desbordes contra el ancho configurado. Además ejercitan las cinco interacciones locales y los paneles de lupa y RITA en escritorio y móvil. Las capturas de las pruebas usan escritorio de 1520 × 900 y móvil de 390 × 844; `node scripts/visual-side-review.mjs` genera la comparación adicional a 1920 × 932.

Los resultados finales se registran en [laterales-resultados.json](laterales-resultados.json).
