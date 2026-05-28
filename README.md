# Sitio HidroPro Exterior

Primera landing premium para el negocio de lavado a presión.

## Arquitectura actual

- `index.html`: home principal.
- `servicios/index.html`: hub SEO de servicios.
- `servicios/lavado-de-fachadas/index.html`: página de servicio.
- `servicios/lavado-de-techos/index.html`: página de servicio.
- `servicios/limpieza-de-pisos-exteriores/index.html`: página de servicio.
- `servicios/limpieza-de-piletas/index.html`: página de servicio.
- `zonas/index.html`: hub GEO/local.
- `zonas/san-martin/index.html`: página local.
- `trabajos/index.html`: galería con material real.
- `blog/index.html`: hub de guías.
- `blog/cuanto-cuesta-lavar-frente-casa/index.html`: artículo SEO.
- `blog/lavado-a-presion-o-soft-wash/index.html`: artículo SEO.
- `blog/como-limpiar-verdin-paredes-patios/index.html`: artículo SEO.
- `blog/lavar-techos-de-tejas-con-hidrolavadora/index.html`: artículo SEO.
- `blog/que-fotos-mandar-para-cotizar/index.html`: artículo de conversión.
- `blog/cada-cuanto-limpiar-exterior-casa/index.html`: artículo SEO.
- `blog/errores-comunes-hidrolavadora/index.html`: artículo SEO.
- `blog/preparar-casa-antes-lavado-a-presion/index.html`: artículo de preparación y conversión.
- `blog/lavado-veredas-entradas-patios/index.html`: artículo SEO de pisos exteriores.
- `blog/lavado-medianeras-paredes-exteriores/index.html`: artículo SEO de paredes y medianeras.
- `blog/limpieza-exterior-antes-vender-alquilar/index.html`: artículo para intención inmobiliaria.
- `blog/hidrolavado-consorcios-locales/index.html`: artículo para intención comercial y campañas.
- `blog/lavado-a-presion-zona-norte/index.html`: artículo GEO para San Martín y alrededores.
- `contacto/index.html`: formulario de cotización.
- `landing/cotizar-lavado-exterior/index.html`: página de cotización rápida con `noindex`.

## Datos placeholder para reemplazar

- Nombre: `HidroPro Exterior`
- WhatsApp: configurar número real en `script.js`.
- Zona: `San Martín y alrededores`
- URL schema: `https://lameapiton.github.io/lavado-de-casas`

Los placeholders están en:

- `index.html`: title, metadata, schema, textos visibles.
- `script.js`: `WHATSAPP_NUMBER` y `BUSINESS_NAME`.
- `robots.txt`: URL del sitemap.
- `sitemap.xml`: dominio real.
- `llms.txt`: datos de negocio para GEO/IA.

## Assets

- `assets/generated/hero-ai-pressure-washing.jpg`: imagen AI temporal para hero.
- `assets/media/*`: foto y videos reales recibidos por WhatsApp.
- `assets/blog/*`: imágenes editoriales temporales para artículos.

La imagen AI no debe presentarse como trabajo real. Cuando haya fotos profesionales reales, conviene reemplazar el hero y dejar esta imagen fuera de producción.

## Mejoras aplicadas para auditoría técnica

- Videos MP4 recomprimidos sin audio y con `faststart` para reducir peso inicial.
- Blog ampliado con guías para búsquedas informativas, locales y de conversión.
- Sitemap y `llms.txt` actualizados con los nuevos artículos.
- `.gitattributes` agregado para normalizar finales de línea y tratar media como binario.
