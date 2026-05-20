# manadsblad-export

Puppeteer-baserad PDF-exportserver för [Månadsblad Pro](https://github.com/naoar88-stack/manadsblad).

## Endpoints

| Metod | Sökväg | Beskrivning |
|-------|--------|-------------|
| GET   | `/health` | Hälsokontroll |
| POST  | `/api/export` | Generera PDF från HTML |

### POST /api/export

**Body:**
```json
{
  "html": "<div>...</div>",
  "format": "A4"
}
```

**Format-alternativ:** `A4`, `A4 Liggande`, `IG Square`, `IG Story`

**Svar:** PDF-fil (`application/pdf`)

## Driftsätt på Render

1. Gå till [render.com](https://render.com) och logga in med GitHub
2. Tryck **New → Web Service**
3. Välj repot `manadsblad-export`
4. Render upptäcker `render.yaml` automatiskt — tryck **Deploy**
5. Du får en URL som `https://manadsblad-export.onrender.com`
6. Uppdatera `CLOUD_URL` i `src/lib/exportUtils.js` om din URL avviker

## Lokalt

```bash
npm install
npm run dev
```

Server startar på `http://localhost:3000`
