# Comprobación de la réplica local

Fecha: 31 de octubre de 2026, America/Guatemala. Resultado de la última corrida: **22 pruebas aprobadas, 0 fallidas y 0 omitidas**, en aproximadamente 59 segundos.

## Ejecución reproducible

```bash
npm test
```

La configuración [playwright.config.js](../playwright.config.js) reutiliza Vite en `http://127.0.0.1:5173` o inicia `npm run dev` si no está disponible. En este entorno, Chromium necesitó ejecución fuera de las restricciones del sandbox del agente; no se instaló otro navegador ni se modificó el navegador del usuario.

Versiones utilizadas: Node.js `24.22.1`, npm `11.19.1`, React `19.3.1`, Vite `8.3.5`, Playwright Test `1.64.1` y Chromium `156.0.8078.47`. El ejecutable de Chromium fue `/snap/chromium/current/usr/lib/chromium-browser/chrome`; `CHROMIUM_PATH` permite seleccionar otro ejecutable compatible.

Cada escenario se ejecutó en un navegador headless nuevo y en dos proyectos: escritorio `1520 × 900` y móvil `390 × 844`, con preferencia de movimiento reducido. No se usó ni alteró la pestaña del portal original.

## Cobertura comprobada

Los once escenarios de [tests/portal.spec.js](../tests/portal.spec.js) se ejecutaron en ambos tamaños:

| Escenario | Comprobación ejecutada |
| --- | --- |
| Portada y recursos | Siete secciones principales presentes; todas las imágenes del DOM completaron carga con ancho natural positivo; sin errores JavaScript `pageerror`, respuestas HTTP de error ni solicitudes externas registradas durante esa carga. Ancho del documento no supera el viewport. |
| Filtros | Las quince categorías, siete tributarias y ocho aduaneras, cambian su estado seleccionado y muestran exactamente los títulos y cantidades del conjunto extraído. |
| Búsqueda | La consulta sin tilde `vehiculos` encuentra tarjetas con «Vehículos»; una consulta inexistente informa ausencia; Escape cierra el modal; un resultado de RTU abre su vista local. |
| Anclas y menú | Capacitación e Institucional cambian el hash y desplazan la página. En móvil, el menú se abre, anuncia su estado y se cierra al elegir el destino. |
| Carrusel | Flechas, teclado izquierda/derecha y selección directa cambian imágenes. Reproducción y pausa actualizan sus controles. El avance de 12 segundos se comprobó con el reloj controlado de Playwright. |
| Demo y descarga | Una tarjeta de RTU abre una vista local identificada; elegir `DEMO-002` y simular genera un resultado ficticio. La descarga JSON contiene `demostracion: true`, `nit: FICTICIO` y `sinValidezTributaria: true`. El historial vuelve a la portada. |
| Cita, capacitación, contacto y FAQ | Se selecciona una cita ficticia; se abren y cierran opciones de capacitación; una opción de contacto abre una vista interna; una pregunta frecuente revela su respuesta. |
| Estadísticas | El selector de año cambia la serie del gráfico, identificada como ficticia. |
| Chat | Se identifica como demostración sin atención oficial; un acceso sugerido y un mensaje escrito reciben respuestas locales; Escape cierra el diálogo. |
| Pie, mapa y subir | Ocho redes tienen URLs HTTPS, nueva pestaña y protección `noopener`; no hay enlaces vacíos ni `href="#"` en el DOM inicial; el mapa local presenta accesos y el botón «Volver arriba» lleva a posición cero. |
| Barrido de rutas | Se renderizan **150 rutas únicas de contenido** de todas las tarjetas, noticias y enlaces internos capturados de capacitación, contacto e institucional. Cada ruta presenta un H1 no vacío y evita «Contenido no incluido». También se abre por HTTP una ruta profunda con extensión PDF que muestra su vista local «Manual de uso». |

Los resultados detallados están en [playwright-results.json](playwright-results.json). Las capturas completas y del viewport están en [capturas-locales/desktop-portada.png](capturas-locales/desktop-portada.png), [desktop-viewport.png](capturas-locales/desktop-viewport.png), [mobile-portada.png](capturas-locales/mobile-portada.png) y [mobile-viewport.png](capturas-locales/mobile-viewport.png).

## Límites

- El barrido de 150 rutas prueba renderizado mediante History API y `popstate`; no equivale a pulsar cada uno de los enlaces. Los escenarios anteriores sí ejercitan clics, escritura, selección y descarga en los recorridos indicados.
- Los destinos externos se comprobaron como atributos y acciones de apertura. No se visitaron las redes sociales, destinos tributarios ni formularios externos durante estas pruebas; su disponibilidad no queda verificada.
- El avance automático del carrusel se probó con tiempo controlado, no mediante una observación de doce segundos reales. No se reconstruyó el comportamiento temporal del portal original.
- El inventario de red y `pageerror` corresponde a la carga local comprobada. No es una auditoría general de seguridad ni de todos los tipos de mensajes de consola.
- Las capturas son evidencia visual para revisión; no constituyen una comparación automática píxel a píxel contra la captura adjunta. El diseño adaptable se probó en los dos tamaños indicados, sin afirmar cobertura de todos los dispositivos o navegadores.
- La prueba móvil usa emulación de viewport y entrada táctil en Chromium; no se ejecutó en un teléfono físico.
