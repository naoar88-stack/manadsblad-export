import puppeteer  from 'puppeteer-core';
import chromium   from '@sparticuz/chromium';

const FORMAT_MAP = {
  'A4':          { format: 'A4', landscape: false },
  'A4 Liggande': { format: 'A4', landscape: true  },
  'IG Square':   { width: '600px', height: '600px' },
  'IG Story':    { width: '450px', height: '800px' },
};

let browser = null;

async function getBrowser() {
  if (browser) return browser;
  browser = await puppeteer.launch({
    args:            chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath:  await chromium.executablePath(),
    headless:        chromium.headless,
  });
  browser.on('disconnected', () => { browser = null; });
  return browser;
}

export async function renderPDF(html, format = 'A4') {
  const cfg  = FORMAT_MAP[format] ?? FORMAT_MAP['A4'];
  const b    = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setContent(wrap(html), { waitUntil: 'networkidle0', timeout: 30_000 });
    await page.evaluate(() =>
      Promise.all([...document.images].filter(i => !i.complete)
        .map(i => new Promise(r => { i.onload = r; i.onerror = r; })))
    );
    const opts = { printBackground: true, margin: { top:0,right:0,bottom:0,left:0 } };
    if (cfg.format) { opts.format = cfg.format; opts.landscape = cfg.landscape; }
    else            { opts.width  = cfg.width;  opts.height    = cfg.height;    }
    return await page.pdf(opts);
  } finally {
    await page.close();
  }
}

function wrap(body) {
  return `<!DOCTYPE html><html lang="sv"><head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Poppins:wght@400;600;700;800&family=Nunito:wght@400;600;700;800&family=Montserrat:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>
</head><body>${body}</body></html>`;
}
