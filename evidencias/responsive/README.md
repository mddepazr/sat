# Revisión responsive de las cinco vistas locales

Fecha local: 4 de noviembre de 2026, America/Guatemala.

Se reutilizaron las capturas y la inspección REA de [la implementación anterior](../laterales-inspeccion.md). Esta revisión se hizo con Chromium sobre la aplicación local; no se repitieron interacciones con servicios SAT ni se enviaron formularios al original.

## Problemas encontrados y cambios

- **Agencia Virtual:** a 768 px y 844 px el contenido ampliaba el viewport a 924 px. Se eliminó el ancho fijo en tablet, se apilaron marca y panel hasta 900 px y se mantuvieron dos columnas desde 901 px. Los textos de recuperación se ajustan al panel y sus controles tienen altura táctil suficiente.
- **Declaraguate:** los textos pequeños del aviso ahora tienen una explicación legible adicional hasta 1100 px. El menú se distribuye en filas, la ayuda queda en el flujo de la página y la tabla conserva su desplazamiento dentro de una región con foco y nombre accesible. Los campos y resultados del formulario caben en el ancho disponible.
- **UIPSAT:** el contenido y la columna de enlaces se apilan hasta 900 px en su orden del DOM. Las imágenes conservan su proporción y los encabezados ajustan su tamaño. Los enlaces y la solicitud tienen controles de al menos 44 px de alto en los tamaños táctiles.
- **Denuncias:** el código, entrada y verificación tienen espacio táctil. Los valores ficticios largos de establecimiento y dirección se muestran en campos multilínea. La descripción de la opción elegida permite leer completo un concepto largo. El envío y reinicio siguen dentro de la página.
- **Chat SAT:** las columnas se apilan hasta 900 px. Conversación, temas, envío y encuesta se ajustan al ancho. Las respuestas desplazan solamente el historial del chat, sin mover la página.
- **Lupa y RITA:** los diálogos ajustan su alto a `100dvh`, con áreas internas desplazables y cierre de 44 px. RITA conserva visibles la cabecera y el envío en horizontal; los temas e historial se desplazan por separado. El fondo no se desplaza mientras hay un diálogo abierto.
- **Accesos y cabecera:** hasta 1100 px los siete accesos se distribuyen en una barra inferior con espacio reservado y soporte para el área segura. El distintivo local y Volver arriba quedan en el flujo para evitar tapar formularios. El menú compacto del portal se activa hasta 1000 px y permite desplazamiento con poca altura.

La composición inicial de escritorio se conserva. Se compararon las cinco vistas a 1440 × 900 con el diagnóstico anterior; también se revisaron visualmente las capturas de tablet y celular. La comparación con el portal SAT sigue siendo la referencia previa de REA; no se afirma haber observado el portal original en cada tamaño móvil.

## Matriz de capturas

Cada carpeta contiene las cinco vistas iniciales, recuperación y sesión de Agencia Virtual, formulario Declaraguate, solicitud UIPSAT, formulario de denuncias, chat y encuesta abiertos, resultados de búsqueda y mensajes en RITA.

| Tamaño de Chromium | Agencia Virtual | Declaraguate | UIPSAT | Denuncias | Chat SAT | Lupa | RITA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 320 × 740 | [Vista](320x740/agencia.png) | [Formulario](320x740/declaraguate-formulario.png) | [Vista](320x740/uip.png) | [Formulario](320x740/denuncias-formulario.png) | [Encuesta](320x740/chat-encuesta.png) | [Panel](320x740/lupa-resultados.png) | [Panel](320x740/rita-mensajes.png) |
| 390 × 844 | [Vista](390x844/agencia.png) | [Formulario](390x844/declaraguate-formulario.png) | [Vista](390x844/uip.png) | [Formulario](390x844/denuncias-formulario.png) | [Encuesta](390x844/chat-encuesta.png) | [Panel](390x844/lupa-resultados.png) | [Panel](390x844/rita-mensajes.png) |
| 768 × 1024 | [Vista](768x1024/agencia.png) | [Formulario](768x1024/declaraguate-formulario.png) | [Vista](768x1024/uip.png) | [Formulario](768x1024/denuncias-formulario.png) | [Conversación](768x1024/chat-abierto.png) | [Panel](768x1024/lupa-resultados.png) | [Panel](768x1024/rita-mensajes.png) |
| 1024 × 768 | [Vista](1024x768/agencia.png) | [Formulario](1024x768/declaraguate-formulario.png) | [Vista](1024x768/uip.png) | [Formulario](1024x768/denuncias-formulario.png) | [Conversación](1024x768/chat-abierto.png) | [Panel](1024x768/lupa-resultados.png) | [Panel](1024x768/rita-mensajes.png) |
| 1440 × 900 | [Vista](1440x900/agencia.png) | [Formulario](1440x900/declaraguate-formulario.png) | [Vista](1440x900/uip.png) | [Formulario](1440x900/denuncias-formulario.png) | [Conversación](1440x900/chat-abierto.png) | [Panel](1440x900/lupa-resultados.png) | [Panel](1440x900/rita-mensajes.png) |
| 844 × 390, horizontal | [Vista](844x390-horizontal/agencia.png) | [Formulario](844x390-horizontal/declaraguate-formulario.png) | [Vista](844x390-horizontal/uip.png) | [Formulario](844x390-horizontal/denuncias-formulario.png) | [Encuesta](844x390-horizontal/chat-encuesta.png) | [Panel](844x390-horizontal/lupa-resultados.png) | [Panel](844x390-horizontal/rita-mensajes.png) |

## Reproducción

```bash
npm run test:responsive
npm test
npm run build
```

La configuración `playwright.responsive.config.js` ejecuta seis escenarios en cada tamaño. Las pruebas comprueban el ancho contra el viewport configurado, campos contenidos, imágenes cargadas, altura de controles táctiles y que el centro de los controles no esté tapado. También verifican el desplazamiento de tabla, opciones de menú y temas RITA, apertura de pestañas desde portada e interacciones ficticias completas.

Los resultados finales quedan en [responsive-resultados.json](../responsive-resultados.json). Las capturas son del navegador Chromium automatizado; no equivalen a pruebas físicas de teclado virtual ni de todas las versiones de iOS/Android.
