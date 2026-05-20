import express       from 'express';
import cors          from 'cors';
import helmet        from 'helmet';
import rateLimit     from 'express-rate-limit';
import { renderPDF } from './lib/renderer.js';

const app  = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '4mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max:      30,
  message:  { error: 'F\u00f6r m\u00e5nga f\u00f6rfr\u00e5gningar. V\u00e4nta en minut.' },
});
app.use('/api/', limiter);

// ---- Health check ----
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ---- Export endpoint ----
// POST /api/export
// Body: { html: string, format: 'A4' | 'A4 Liggande' | 'IG Square' | 'IG Story' }
app.post('/api/export', async (req, res) => {
  const { html, format = 'A4' } = req.body ?? {};

  if (!html || typeof html !== 'string') {
    return res.status(400).json({ error: '"html" kr\u00e4vs i request body.' });
  }
  if (html.length > 3_500_000) {
    return res.status(413).json({ error: 'HTML-inneh\u00e5llet \u00e4r f\u00f6r stort (max ~3.5 MB).' });
  }

  try {
    const pdf = await renderPDF(html, format);
    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': 'attachment; filename="manadsblad.pdf"',
      'Content-Length':      pdf.length,
    });
    res.end(pdf);
  } catch (err) {
    console.error('[Export] Fel:', err.message);
    res.status(500).json({ error: 'PDF-generering misslyckades.', detail: err.message });
  }
});

app.listen(PORT, () => console.log(`\u2705 manadsblad-export k\u00f6r p\u00e5 port ${PORT}`));
