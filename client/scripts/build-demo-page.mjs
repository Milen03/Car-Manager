// Turns the demo build (dist-demo/) into one self-contained HTML page that can
// be published anywhere static, e.g. as a Claude artifact: CSS, JS and the logo
// are inlined. Usage: npm run build:demo [-- path/to/smaller-logo.png]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = 'dist-demo';
const logoPath = process.argv[2] || 'public/Car-Managers-LOGO.png';
const html = readFileSync(join(outDir, 'index.html'), 'utf8');

const asset = (pattern) => {
    const match = html.match(pattern);
    if (!match) throw new Error(`Not found in ${outDir}/index.html: ${pattern}`);
    return readFileSync(join(outDir, match[1].replace(/^\.?\//, '')), 'utf8');
};

const css = asset(/<link rel="stylesheet"[^>]*href="([^"]+)"/);
let js = asset(/<script type="module"[^>]*src="([^"]+)"/);

// The logo is used in several places, so embed it once and point them all at it.
const logo = `data:image/png;base64,${readFileSync(logoPath).toString('base64')}`;
js = js.replace(/(["'])\/Car-Managers-LOGO\.png\1/g, 'window.__carManagerLogo');

// Inline scripts end at the first "</script", so escape any inside the bundle.
js = js.replace(/<\/script/gi, '<\\/script');

const page = `<title>Car Manager</title>
<meta name="description" content="Car Manager — следи колите си и сервизната им история на едно място.">
<style>
html, body { background: #030712; color-scheme: dark; }
${css}
</style>
<div id="root"></div>
<script>window.__carManagerLogo = ${JSON.stringify(logo)};</script>
<script type="module">
${js}
</script>
`;

writeFileSync(join(outDir, 'car-manager-demo.html'), page);
console.log(`${outDir}/car-manager-demo.html (${Math.round(page.length / 1024)} KB)`);
