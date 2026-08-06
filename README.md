# PAMACEA

Sitio educativo de salud, prevención, anatomía y bienestar. Esta versión funciona como un sitio estático: no necesita servidor ASP.NET, base de datos ni claves API.

## Desarrollo local

Requiere Node.js 20 o superior.

```bash
npm install
npm run build
```

El resultado se genera en `dist/`. Para revisarlo localmente puedes servir esa carpeta con cualquier servidor estático.

## Publicación en Vercel

1. Importa este repositorio desde el panel de Vercel.
2. Vercel leerá automáticamente `vercel.json`.
3. El comando de construcción es `npm run build` y la carpeta de salida es `dist`.
4. Comprueba primero la URL temporal de Vercel.
5. Agrega `pamacea.com.mx` y `www.pamacea.com.mx` en **Settings → Domains**.
6. Cambia en el proveedor del dominio únicamente los registros DNS indicados por Vercel.

Las antiguas rutas ASP.NET (`/Home/Anatomia`, por ejemplo) redirigen automáticamente a las nuevas rutas estáticas.

## Contenido

- `/` — Inicio
- `/prevencion/` — Prevención y enfermedades
- `/anatomia/` — Explorador anatómico 3D
- `/salud-mental/` — Bienestar emocional
- `/recursos/` — Directorio de ayuda
- `/linea-de-vida/` — Línea de vida
- `/profesionales/` — Programa de verificados
- `/creditos/` — Equipo y créditos

> PAMACEA ofrece información educativa y no sustituye atención médica profesional.
