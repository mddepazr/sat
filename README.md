# Portal público SAT · Réplica local

Aplicación React y Vite basada en la captura de referencia y en las evidencias del portal público de la SAT de Guatemala. **Primera versión académica, sin relación oficial con la SAT.** Su finalidad es estudiar interfaces, navegación y diseño adaptable. Las consultas, citas y el chat son demostraciones locales con datos ficticios.

## Instalar e iniciar

Requisitos: Node.js 22.12 o superior y npm. Entorno comprobado: Node 24.22.1, npm 11.19.1, React 19.3.1 y Vite 8.3.5. Las versiones se fijan en `package-lock.json`.

Después de clonar el repositorio, ejecutar estos comandos desde su carpeta raíz. No se necesita `.env`, una cuenta SAT, claves de API ni configurar un servidor tributario; por eso no se incluye una plantilla `.env.example` vacía.

```bash
npm ci
npm run dev
```

Abrir **http://127.0.0.1:5173/**. Vite usa un puerto fijo; si está ocupado, cerrar la instancia anterior antes de volver a iniciarlo. `Ctrl+C` detiene el servidor.

Para generar y servir la versión de producción:

```bash
npm run build
npm run preview
```

La vista de producción queda en **http://127.0.0.1:4173/**. El resultado estático está en `dist/`. Un alojamiento distinto debe reenviar las rutas internas a `index.html` para permitir recargar las vistas `/contenido/...` y `/demostracion/...`.

## Funciones incluidas

- Cabecera, navegación por anclas con compensación de cabecera fija, menú móvil y acceso telefónico.
- Cinco banners locales, flechas, selección directa, teclado y pausa. Avance automático cada 12 segundos, desactivado inicialmente si se solicita movimiento reducido; se pausa con foco o puntero sobre el carrusel.
- Accesos de inscripción, NIT y cita; 66 tarjetas tributarias y 45 aduaneras distribuidas en sus 15 categorías originales. Las vistas iniciales muestran ocho y cuatro tarjetas, respectivamente.
- Capacitación, contactos, noticias, institucional, edificio, redes sociales y pie. Las tarjetas de opciones se abren mediante clic o teclado, también en pantallas táctiles.
- Búsqueda local por títulos y descripciones, insensible a tildes; resultados navegables, estado sin coincidencias y cierre con Escape.
- Vistas locales de información y extractos de noticias, preguntas frecuentes y mapa del sitio. Navegación coherente con historial y recarga de rutas.
- Consultas y citas simuladas con casos predefinidos. Descarga JSON marcada sin validez tributaria; no se generan documentos oficiales.
- Estadísticas de ejemplo con selector de año y valores explícitamente inventados.
- Chat de demostración mediante reglas locales, accesos laterales y botón para volver arriba.

Los recursos visuales y tipográficos están en `public/assets/`. La portada y sus demostraciones no necesitan servicios externos después de instalar dependencias. Los enlaces a redes y otros sitios públicos abren destinos externos en una pestaña nueva cuando el usuario los elige. Los sistemas tributarios y accesos autenticados representados se resuelven como demostraciones locales.

## Comprobaciones

```bash
npm test
```

Playwright ejecuta escenarios en escritorio (1520 × 900) y móvil (390 × 844). Reutiliza Vite si está funcionando o lo inicia durante la prueba. Utiliza el Chromium instalado en `/snap/chromium/current/usr/lib/chromium-browser/chrome` si existe. En otros entornos:

```bash
# Opción 1: indicar un Chromium ya instalado
CHROMIUM_PATH=/ruta/al/chrome npm test

# Opción 2: instalar el navegador de Playwright
npx playwright install chromium
npm test
```

La segunda opción descarga un navegador y requiere conexión a internet. Las pruebas no interactúan con la SAT; lanzan un navegador separado y acceden a la réplica local.

Para regenerar capturas comparativas de escritorio (1632 × 1000) y móvil (390 × 844):

```bash
# Con npm run dev activo
node scripts/visual-review.mjs
```

Los controles y el alcance de su comprobación están en [evidencias/funcionalidades.md](evidencias/funcionalidades.md). La primera versión tiene 22 pruebas aprobadas y una compilación de producción exitosa. El resumen histórico revisado está en [evidencias/pruebas-locales.md](evidencias/pruebas-locales.md) y [evidencias/resultados-publicables.json](evidencias/resultados-publicables.json). Cada ejecución genera `evidencias/playwright-results.json` (excluido de Git por incluir rutas del equipo), y las capturas se guardan en `evidencias/capturas-locales/`.

## Evidencias y procedencia

- [Análisis inicial conservado](evidencias/analisis-inicial.md).
- [Investigación complementaria y decisiones de réplica](evidencias/investigacion-complementaria.md).
- [Procedencia, tamaños y SHA-256 de recursos](evidencias/recursos.json).
- [Criterios de inclusión de evidencias en Git](evidencias/README.md).
- `src/data/portal.json`: contenido estructurado extraído de las evidencias originales.
- `evidencias/estilos-originales/`: CSS guardado únicamente como evidencia; no se carga en la aplicación.
- `scripts/extract-content.py`: herramienta de investigación para extraer literales HTML/JSON y descargar recursos estáticos. Necesita la captura bruta local, excluida del repositorio, además de acceso de red. Puede fallar si cambia el portal o bloquea las descargas. No hace falta ejecutarla para instalar, iniciar ni compilar la aplicación: los datos y recursos necesarios están incluidos.
- `scripts/browser-readonly.mjs`: lectura suplementaria de estilos, medidas y recursos públicos desde la pestaña SAT en CDP 9222. Solo se necesita para investigación, nunca para ejecutar la réplica. No navega ni pulsa controles.

Las imágenes y marcas conservan su procedencia SAT. Su presencia en el proyecto no implica autorización para usos comerciales o publicación como sitio oficial. Este proyecto se entrega para ejecución local.

Las capturas REA brutas, fuentes JavaScript originales exportadas, medidas del navegador y otros registros de investigación se conservan solo en el equipo de trabajo: algunos contienen nonces públicos, estado de Cloudflare o rutas del usuario. Los informes históricos los citan para trazabilidad, pero esos enlaces a archivos excluidos no estarán disponibles en un clon. Las capturas locales incluidas muestran la portada con información pública; no contienen cookies, tokens de sesión, formularios autenticados ni datos personales introducidos por el usuario. El repositorio es privado y no implica desplegar un sitio web público.

## Límites

La réplica reproduce la portada y sus controles, con vistas locales resumidas; no copia íntegramente todas las páginas enlazadas. Los extractos de noticias proceden de la captura, sin inventar artículos completos. No se verificó la disponibilidad de los destinos externos abriendo cada enlace.

El comportamiento de «Contribuyentes» se comprobó en el original tras una interacción manual del usuario; la estructura de las demás categorías y componentes se obtuvo del DOM, CSS y fuentes existentes. El informe distingue esas observaciones de inferencias y decisiones locales. La distribución móvil se diseñó para la réplica y se comprobó localmente; no se presenta como una captura móvil del original.

Los espacios vacíos y círculos de carga de la referencia fueron reemplazados por las imágenes públicas finales identificadas. La comparación visual es manual, no una certificación de igualdad píxel a píxel. La identificación visible «Réplica local» y los avisos de demostración son añadidos deliberados.

No se ejecutan scripts originales de WordPress, seguimiento, Cloudflare ni chat externo. No hay backend tributario, almacenamiento persistente de conversaciones, credenciales reales ni conexión de formularios locales a la SAT.
