# Investigación complementaria para la réplica

Fecha: 31 de octubre de 2026. Se conserva sin modificaciones `analisis-inicial.md` y la evidencia previa.

## Inspección realizada

Se reconectó **REA mediante MCP** a `http://127.0.0.1:9222`. `list_browser_targets` volvió a identificar la página pública `https://portal.sat.gob.gt/portal/`, target `1F03AA16EBDEF798892CB49DBD862C6C`. No se repitió el análisis completo de los scripts.

REA capturó el viewport de escritorio, de 1920 × 932 píxeles, en [original-viewport.png](original-viewport.png). Su registro completo es [rea-referencia-viewport.json](rea-referencia-viewport.json), con identidad del PNG y hora de captura. La imagen coincidió con una transición del carrusel: hay banners superpuestos. Esa superposición **no se reprodujo como estado final**. La captura adjunta por el usuario se utilizó como referencia principal de la distribución completa y del banner Denuncia.

Como REA no ofrece una herramienta específica de estilos calculados en el catálogo conectado, se complementó la captura con lectura CDP de DOM, `getComputedStyle`, rectángulos y URLs de recursos públicos. El helper `scripts/browser-readonly.mjs` está restringido a la portada SAT ya abierta y a lecturas; no navega, no pulsa controles ni accede a almacenamiento. Registros: [medidas-publicas.json](medidas-publicas.json) y [medidas-publicas-detalle.json](medidas-publicas-detalle.json). Esta lectura suplementaria evalúa una expresión propia para consultar el DOM; no ejecuta las fuentes JavaScript exportadas.

## Observaciones e inferencias

| Aspecto | Evidencia | Clasificación y consecuencia |
| --- | --- | --- |
| Cabecera | `.masthead`: altura 70 CSS px, fondo `rgb(23,82,127)`; logo natural 176 × 70 | Observado. Réplica azul `#17527f`, logo público local y cabecera adaptable. |
| Fuentes | Estilos calculados: Roboto para cuerpo y tarjetas, Libre Franklin para encabezados de sección | Observado. WOFF2 locales; no carga de Google Fonts remota. |
| Títulos | Encabezados de sección de 20 px, peso 600, color `#156ba0`; tarjeta visible `.ele-entry-title`: 22 px/30 px, peso 600, color `#153658` | Observado a la escala de la inspección. Se ajustaron tamaños de escritorio para las proporciones de la referencia adjunta. |
| Tarjetas | Cuatro columnas; ancho visible 342,7 px en viewport CSS 1520,8; texto máximo 80%, relleno 30 px y margen superior −110 px | Observado en DOM/estilos. Se recrearon superposición de cajas blancas, separación y filtros. |
| Descripciones | `.entry-excerpt` de 13 px/20 px | Observado. Escala visual de la réplica ajustada al viewport, con texto legible en móvil. |
| Declaración de viajero | Imagen renderizada de 1000 × 157,55 CSS px; PNG con amplios márgenes transparentes | Observado. Se amplió su caja para que el contenido visible coincida con la referencia; no se conservó el tamaño pequeño de la primera iteración. |
| Capacitación | Fondos `#f1f4fa`; seis imágenes y tamaños declarados en selectores de Elementor; cajas de 250 CSS px en el original | Observado. Se conservaron los dibujos SVG/PNG originales y el orden. |
| Contacto | Cinco paneles con imágenes finales de agencias, orientación, quejas, denuncias y CLIC | Derivado de HTML/CSS y contrastado con referencia. Se incluyen opciones accesibles mediante clic/teclado. |
| Banner | Configuración SR7 con cinco imágenes, dimensiones, orden y destinos; intervalo configurado de 12.000 ms | Hecho de configuración; no se midió el temporizador original. Se implementó ese intervalo y controles propios. Denuncia es el inicio elegido para coincidir con la referencia. |
| Carga diferida | URLs finales en fuentes, `currentSrc` y CSS; los placeholders de la captura no son imágenes finales | Observado y derivado. Se descargaron los recursos identificados, sin reproducir los círculos de carga. |
| Paneles reversibles | Estructura `flip-box` y listas de enlaces en HTML/CSS | Hecho estático. El clic/teclado y el botón Volver son adaptación local; no se afirma haber observado el hover original. |
| Móvil | No se cambió el viewport del navegador original | Diseño local: menú desplegable, dos columnas de tarjetas, filtros desplazables y accesos inferiores. Comprobación exclusivamente local. |
| Telegram | La evidencia contiene un destino mal formado basado en `@SAT_Guatemala_bot` | Normalización inferida a `https://t.me/SAT_Guatemala_bot`. No se verificó la existencia del bot. |

## Filtro observado mediante acción manual

Se pidió al usuario desplazarse a Servicios Tributarios, pulsar «Contribuyentes» y dejar la sección visible, sin abrir tarjetas ni enviar formularios. El usuario confirmó «Ya quedó visible».

La inspección posterior **REA** quedó en [rea-filtro-manual.json](rea-filtro-manual.json), Evidence ID `ev_cec88c764e0a242c6bff33d3161d405aac35f40504fd358a440c072fa09ef9c2`. Su accesibilidad contiene ahora Actividades Económicas, Agentes de Retención IVA y Constancias de retención del IVA e ISR recibidas como encabezados expuestos, frente a la selección inicial de Consultas Frecuentes. Las medidas suplementarias muestran tarjetas expuestas con rectángulos no vacíos y otras ocultas con tamaño cero.

**Hecho observado:** la acción manual produjo un cambio de tarjetas visibles. **Derivado:** las clases de categorías del HTML capturado definen 66 tarjetas tributarias y 45 aduaneras, con siete y ocho filtros. Los conjuntos iniciales tienen ocho y cuatro tarjetas, coincidentes con la referencia. **Límite:** no se pulsaron manualmente las otras catorce categorías en el sitio original; sí se prueban todas en la réplica.

## Recursos y ejecución

Las descargas son GET de imágenes, fuentes y CSS públicos; el inventario con URL de procedencia, archivo, tamaño y SHA-256 está en [recursos.json](recursos.json). Las peticiones directas inicialmente fallaron por restricciones de red y por HTTP 403; con autorización de red y cabeceras de navegador se obtuvieron los recursos estáticos. No se leyeron cookies ni credenciales del usuario para descargarlos.

Los cuatro SVG institucionales se extrajeron de literales HTML existentes, sin evaluación. Los archivos CSS originales se guardaron fuera de `public/` como evidencia. La aplicación usa React, CSS propio y datos estructurados; no carga WordPress ni scripts originales de seguimiento, servicios tributarios o chat. Los formularios locales solo actualizan estado en memoria y descargan ejemplos ficticios si el usuario lo pide.

Las demostraciones son decisiones de implementación, no reconstrucciones verificadas de los flujos autenticados de SAT. Las noticias internas muestran extractos de la portada y enlace a la fuente pública; no se presentan como artículos completos.

## Comparación visual

Se comparó visualmente la captura adjunta con [escritorio-1632.png](capturas-locales/escritorio-1632.png), y se revisó [movil-390.png](capturas-locales/movil-390.png). Las métricas y las solicitudes observadas están en [comparacion-visual-metricas.json](comparacion-visual-metricas.json). Se corrigieron el tamaño visible del banner de viajero, escala de los iconos iniciales, márgenes de las cajas blancas, espaciado vertical, anchura de capacitación y contacto, distribución institucional y recurso del robot de chat.

Se conserva el aspecto final de las imágenes y no los placeholders de carga. La comparación es visual y por medidas; no se calculó una diferencia de píxeles contra la imagen adjunta, que no está disponible como archivo local. La franja de identificación local, los controles explícitos de pausa y los avisos de demostración son diferencias deliberadas para identificar la réplica y permitir su uso accesible.
