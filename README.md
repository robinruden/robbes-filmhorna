# Robbes filmhörna

Mobilanpassad React-app med Netflix-inspirerad filmhylla, streckkodsskanning med ZXing, SQLite, omslag, beskrivningar, sökning, format- och genrefilter samt lista för osedda filmer.

## Kör lokalt

Kräver Node.js 24 eller senare.

```sh
npm install
cp .env.example .env
npm run server
```

I en annan terminal:

```sh
npm run dev
```

Öppna adressen Vite visar. React kör på port 5173 och skickar API-anrop till servern på port 3001. För produktion: `npm run build` och sedan `npm start` (port 3001). Filmer sparas i `data/films.db`. Säkerhetskopiera den filen.

## Automatisk filmidentifiering

Ange egna nycklar i `.env`, starta sedan om servern:

- `BARCODE_LOOKUP_KEY`: Barcode Lookup API för att koppla EAN/UPC till produktens titel och eventuellt produktfoto. Täckningen varierar mellan utgåvor och länder. https://www.barcodelookup.com/api-documentation
- `TMDB_TOKEN`: TMDB API Read Access Token för titelsökning, beskrivning, utgivningsår och filmomslag. https://developer.themoviedb.org/docs/getting-started

Nycklar skickas aldrig till React-klienten. Skanna eller skriv streckkod → hämta produkt → sök film på titeln → välj rätt film → kontrollera genre, format och omslag → spara. Produktnamn kan innehålla upplageinformation som behöver tas bort före titelsökningen. Bekräftelse behövs eftersom en streckkod identifierar en fysisk utgåva medan TMDB identifierar filmen. Genre väljs manuellt i denna version. Filmuppgifter och omslags-URL kan även matas in helt manuellt.

## Mobil

Appen har webbmanifest och kan läggas på hemskärmen via webbläsaren. Kameran kräver HTTPS på mobilen (localhost är tillåtet vid utveckling på samma enhet). En vanlig HTTP-adress till datorns LAN-IP räcker inte för kameran. Använd en HTTPS-host med beständig disk för SQLite, eller en HTTPS-proxy framför Node-servern. Mobil och dator delar samlingen när de använder samma server. Appen kräver nätverksanslutning till servern och har inget offline-läge.

Denna första version saknar inloggning. Servern ska hållas på betrott nätverk eller bakom inloggning innan den exponeras på internet. Ingen hosting eller datakälla är ansluten automatiskt. För offentlig användning behöver TMDB:s aktuella licens- och attributionskrav följas, inklusive godkänd logotyp.
