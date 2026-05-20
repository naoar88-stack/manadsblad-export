# manadsblad-export

Puppeteer PDF-server för [Månadsblad Pro](https://manadsblad.vercel.app).

## Endpoints

| Metod | Sökväg | Beskrivning |
|---|---|---|
| GET  | `/`           | Info + endpoint-lista |
| GET  | `/health`     | Hälsokontroll |
| POST | `/api/export` | Generera PDF från HTML |

### POST /api/export

```json
{ "html": "<div>...</div>", "format": "A4" }
```

Format: `A4` \| `A4 Liggande` \| `IG Square` \| `IG Story`

## Deploy på Render

```
Build: npm install
Start: node server.js
```
