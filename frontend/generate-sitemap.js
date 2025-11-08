import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'weekly', priority: 0.8 },
  { url: '/contact', changefreq: 'monthly', priority: 0.5 },
];

const stream = new SitemapStream({ hostname: 'https://www.yourdomain.com' });
stream.pipe(createWriteStream('./public/sitemap.xml'));
links.forEach(link => stream.write(link));
stream.end();

streamToPromise(stream).then(() => {
  console.log('✅ Sitemap created successfully!');
});
