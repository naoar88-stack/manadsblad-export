import puppeteer from 'puppeteer';

// Pappersformat → Puppeteer-inställningar
const FORMAT_MAP = {
  'A4':           { format: 'A4',  landscape: false, width: null,    height: null   },
  'A4 Liggande':  { format: 'A4',  landscape: true,  width: null,    height: null   },
  'IG Square':    { format: null,  landscape: false, width: '600px', height: '600px'},
  'IG Story':     { format: null,  landscape: false, width: '450px', height: '800px'},
};

let browserInstance = null;

async function getBrowser() {
  if (browserInstance) return browserInstance;
  browserInstance = await puppeteer.launch({
    headless:  'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });
  // Återställ instansen om webbläsaren kraschar
  browserInstance.on('disconnected', () => { browserInstance = null; });
  return browserInstance;
}

export async function renderPDF(html, format = 'A4') {
  const cfg     = FORMAT_MAP[format] ?? FORMAT_MAP['A4'];
  const browser = await getBrowser();
  const page    = await browser.newPage();

  try {
    // Läs in HTML inkl. externa fonter via Google Fonts
    await page.setContent(
      wrapHTML(html),
      { waitUntil: 'networkidle0', timeout: 30_000 }
    );

    // Vänta extra på bilder
    await page.evaluate(() =>
      Promise.all(
        [...document.images]
          .filter(img => !img.complete)
          .map(img => new Promise(res => { img.onload = res; img.onerror = res; }))
      )
    );

    const pdfOptions = {
      printBackground: true,
      margin:          { top: 0, right: 0, bottom: 0, left: 0 },
    };

    if (cfg.format) {
      pdfOptions.format    = cfg.format;
      pdfOptions.landscape = cfg.landscape;
    } else {
      pdfOptions.width  = cfg.width;
      pdfOptions.height = cfg.height;
    }

    return await page.pdf(pdfOptions);
  } finally {
    await page.close();
  }
}

function wrapHTML(body) {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Poppins:wght@400;600;700;800&family=Nunito:wght@400;600;700;800&family=Montserrat:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: transparent; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>${body}</body>
</html>`;
}
