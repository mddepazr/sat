# Evidencias incluidas en la primera versión

Los informes Markdown, la procedencia de los recursos, el resumen de resultados, los estilos públicos de referencia y las capturas **locales** revisadas se incluyen para documentar este proyecto académico.

Se conservan fuera de Git, sin eliminarlos del equipo de trabajo:

- `rea-*.json`: capturas originales y resultados brutos, algunos con nonces o estado de Cloudflare.
- `medidas-publicas*.json`: inventarios completos del navegador y sus recursos.
- `fragmentos-javascript.json`, `estructura-desde-script-impresion.json` y `scripts-publicos/`: fuentes y contenido bruto exportado, que pueden reproducir valores efímeros del sitio original.
- `original-viewport.png`: captura de la sesión del navegador original, excluida junto con los registros de esa sesión.
- `playwright-results.json`, `test-results/` y trazas: resultados regenerables con rutas del equipo u otra información de ejecución.
- `laterales-dom-original.json`: atributos y estilos leídos de las seis pestañas originales; la exportación REA de esta inspección también queda excluida por el patrón `rea-*.json`.

Las capturas en `capturas-locales/` muestran únicamente la réplica, con contenido público de portada y la identificación de demostración. Se revisaron visualmente durante su creación; no contienen credenciales, cookies visibles, tokens, conversaciones personales ni datos tributarios ingresados por usuarios. La presencia de fotografías y nombres publicados en piezas de comunicación de SAT corresponde al contenido público reproducido, no a datos personales capturados de una sesión privada.

Los informes de investigación históricos se conservan con sus referencias originales. Un enlace a una captura bruta excluida puede no funcionar en un clon del repositorio. La aplicación y sus pruebas no dependen de esos archivos; la herramienta de reextracción sí necesita la captura de investigación original.

El [resumen publicable](resultados-publicables.json) conserva las estadísticas de la ejecución sin rutas locales. [pruebas-locales.md](pruebas-locales.md) explica el alcance y sus límites. [recursos.json](recursos.json) registra las URLs públicas, archivos y hashes de los recursos visuales.

No se necesita `.env` ni se incluyen credenciales. `.gitignore` excluye variables privadas, archivos de autenticación, logs, cachés y temporales.

La ampliación de los accesos laterales se documenta en [laterales-inspeccion.md](laterales-inspeccion.md). `capturas-laterales/` contiene imágenes únicamente de la aplicación local y casos ficticios; `laterales-recursos.json` conserva la procedencia de sus imágenes y `laterales-resultados.json` registra sus comprobaciones finales.

La [revisión responsive](responsive/README.md) amplía la comprobación a seis tamaños e incluye formularios y diálogos abiertos. `responsive-antes/` conserva el diagnóstico inicial local, y `responsive/` las capturas posteriores. `responsive-playwright.json` queda excluido por contener detalles regenerables de ejecución; `responsive-resultados.json` conserva el resumen.
