import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { mkdir, writeFile } from 'fs/promises';

const HOST = 'https://easylease.services'; // your frontend domain
const API = 'https://backend.easylease.services/api'; // your backend API base

async function getJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

async function main() {
    // Ensure dist exists even if you run the script manually
    await mkdir('./dist', { recursive: true });

    const links = [];

    // 1) Always include the homepage (prevents EmptyStream)
    links.push({ url: '/', changefreq: 'weekly', priority: 0.7 });

    // 2) Static routes (edit this list to match your app)
    const staticRoutes = [
        '/help-center',
        '/area-converter',
        '/home-loans/emi-calculator',
        '/chat-with-us',
        '/blogs',
        '/properties',
    ];
    staticRoutes.forEach((p) => links.push({ url: p, changefreq: 'weekly', priority: 0.7 }));

    let blogs = await getJSON(`${API}/sitemap/blogs`);
    // If your API returns { data: [...] }, uncomment next line:
    // blogs = Array.isArray(blogs?.data) ? blogs.data : blogs;
    blogs.forEach((b) => {
        if (b?.slug) {
            links.push({
                url: `/blog/${b.slug}`,
                lastmod: b.updated_at || undefined,
                changefreq: 'weekly',
                priority: 0.6,
});
}
});

// 4) Properties
let props = await getJSON(`${API}/sitemap/properties`);
// If your API returns { data: [...] }, uncomment next line:
props = Array.isArray(props?.data) ? props.data : props;
props.forEach((p) => {
    if (p?.slug) {
        links.push({
            url: `/property/${p.slug}`,
            lastmod: p.updated_at || undefined,
            changefreq: 'daily',
            priority: 0.8,
});
}
});

// Optional: debug counts
console.log(`Links -> static: ${staticRoutes.length + 1}, blogs: ${blogs.length}, properties: ${props.length}`);

// 5) Build XML and write to dist/sitemap.xml
const xml = await streamToPromise(Readable.from(links).pipe(new SitemapStream({ hostname: HOST })));
await writeFile('./dist/sitemap.xml', xml.toString(), 'utf8');
console.log('sitemap.xml generated in dist/');
}

main().catch((e) => {
    console.error('sitemap generation failed', e);
    process.exit(1);
});