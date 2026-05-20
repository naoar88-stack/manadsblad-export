import express from 'express';
import cors    from 'cors';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '4mb' }));

app.get('/',        (_,r) => r.json({ status: 'ok', service: 'manadsblad-export' }));
app.get('/health',  (_,r) => r.json({ status: 'ok', ts: new Date().toISOString() }));
app.post('/api/export', (req, res) => {
  res.json({ status: 'ok', message: 'PDF-export kommer snart — server fungerar!' });
});

app.listen(PORT, () => console.log(`manadsblad-export kör på port ${PORT}`));
