import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceDirectory = path.join(root, 'src');
const outputDirectory = path.join(root, 'dist');
const layout = await readFile(path.join(sourceDirectory, 'layout.html'), 'utf8');

const pages = [
  {
    source: 'index.html', route: '/', nav: 'index', title: 'Salud que puedes entender',
    description: 'Información visual y accesible sobre salud, prevención, anatomía y bienestar.'
  },
  {
    source: 'prevencion.html', route: '/prevencion/', nav: 'prevencion', title: 'Prevención y enfermedades',
    description: 'Información general sobre enfermedades comunes, síntomas frecuentes y medidas de prevención.'
  },
  {
    source: 'anatomia.html', route: '/anatomia/', nav: 'anatomia', title: 'Anatomía interactiva',
    description: 'Explora un modelo 3D educativo y conoce la función general de distintos órganos.'
  },
  {
    source: 'salud-mental.html', route: '/salud-mental/', nav: 'salud-mental', title: 'Salud mental',
    description: 'Recursos educativos para comprender las emociones y construir hábitos de bienestar.'
  },
  {
    source: 'recursos.html', route: '/recursos/', nav: 'recursos', title: 'Recursos de ayuda',
    description: 'Directorio de líneas y servicios de ayuda disponibles en ciudades de Tamaulipas.'
  },
  {
    source: 'linea-de-vida.html', route: '/linea-de-vida/', nav: 'recursos', title: 'Línea de vida',
    description: 'Información para contactar apoyo gratuito y confidencial en momentos difíciles.'
  },
  {
    source: 'profesionales.html', route: '/profesionales/', nav: 'recursos', title: 'Programa de verificados',
    description: 'Conoce el proceso de revisión de profesionales interesados en participar en PAMACEA.'
  },
  {
    source: 'creditos.html', route: '/creditos/', nav: 'recursos', title: 'Acerca de PAMACEA',
    description: 'Conoce al equipo, los asesores y el impulso tecnológico detrás de PAMACEA.'
  }
];

function escapeForXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function renderPage(page, content) {
  let document = layout
    .replaceAll('{{title}}', page.title)
    .replaceAll('{{description}}', page.description)
    .replaceAll('{{route}}', page.route)
    .replace('{{content}}', content);

  for (const nav of ['index', 'prevencion', 'anatomia', 'salud-mental', 'recursos']) {
    document = document.replaceAll(`{{nav:${nav}}}`, page.nav === nav ? 'active' : '');
  }

  return document;
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await cp(path.join(root, 'wwwroot'), outputDirectory, {
  recursive: true,
  filter(source) {
    const relative = path.relative(path.join(root, 'wwwroot'), source).replaceAll('\\', '/');
    return relative !== '' || source === path.join(root, 'wwwroot');
  }
});

for (const page of pages) {
  const content = await readFile(path.join(sourceDirectory, 'pages', page.source), 'utf8');
  const destination = page.route === '/'
    ? path.join(outputDirectory, 'index.html')
    : path.join(outputDirectory, page.route.slice(1), 'index.html');
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, renderPage(page, content), 'utf8');
}

const routes = pages.map(page => `  <url><loc>${escapeForXml(`https://pamacea.com.mx${page.route}`)}</loc></url>`).join('\n');
await writeFile(path.join(outputDirectory, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes}\n</urlset>\n`);
await writeFile(path.join(outputDirectory, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://pamacea.com.mx/sitemap.xml\n');

const notFound = renderPage(
  { route: '/404', nav: '', title: 'Página no encontrada', description: 'La página solicitada no existe.' },
  '<section class="internal-hero compact"><div class="page-shell"><span class="section-kicker">Error 404</span><h1>No encontramos esa página.</h1><p>El contenido pudo cambiar de dirección. Puedes volver al inicio para seguir explorando.</p><a href="/" class="button button-primary">Volver al inicio <span>→</span></a></div></section>'
);
await writeFile(path.join(outputDirectory, '404.html'), notFound, 'utf8');
