# Revisión para la primera publicación en GitHub

Fecha: 31 de octubre de 2026. Proyecto académico de réplica local del portal público SAT; publicación prevista en el repositorio privado `mddepazr/sat`.

- Estado inicial: la carpeta no era un repositorio Git inicializado. No había historial, ramas ni remotos configurados. Se inició una rama `main` vacía.
- GitHub CLI: cuenta autenticada `mddepazr`, verificada con la API tras habilitar acceso de red. La consulta de `mddepazr/sat` devolvió HTTP 404 antes de la creación; no se reutilizó un repositorio ajeno ni se sobrescribió historial.
- Compilación ejecutada: `npm run build`, finalización exitosa con Vite `8.3.5`. Los cambios de esta publicación son documentación y configuración de Git; no modifican la aplicación comprobada previamente.
- Pruebas históricas del código de esta versión: 22 aprobadas, cero fallidas y cero omitidas. El resumen sin rutas privadas está en [resultados-publicables.json](resultados-publicables.json).
- Se revisaron los archivos preparados y se buscaron patrones de claves privadas, tokens GitHub, claves de acceso AWS y JWT, sin coincidencias entre los archivos incluidos. Es una revisión orientada a la publicación, no una auditoría exhaustiva de seguridad.
- Se excluyeron dependencias, compilación, variables privadas, credenciales, configuración de herramientas, logs, temporales y resultados brutos regenerables mediante `.gitignore`.
- Se detectaron nonces y estado de Cloudflare en capturas brutas de investigación: esos archivos, las fuentes exportadas y la captura de la sesión original se conservan solo localmente. No se eliminaron las evidencias previas.
- Las seis capturas locales incluidas fueron revisadas visualmente durante la comprobación de escritorio/móvil. Muestran la portada pública recreada; no contienen sesiones autenticadas ni datos ingresados por usuarios. No se incluyen trazas de navegador ni capturas de formularios reales.
- No se necesita un archivo `.env`; no se agregó una plantilla vacía ni ninguna credencial.
- `.gitattributes` conserva los bytes exactos de los recursos públicos y estilos de referencia para mantener la trazabilidad de sus hashes.

Los criterios y el alcance de los archivos disponibles en el repositorio se explican en [README.md](README.md). Los informes históricos conservan referencias a evidencias brutas omitidas; esos archivos no están disponibles en un clon y no son necesarios para instalar, iniciar, compilar o probar la réplica.
