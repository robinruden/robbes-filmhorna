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

Öppna adressen Vite visar. React kör på port 5174 och skickar API-anrop till servern på port 3001. För produktion: `npm run build` och sedan `npm start` (port 3001). Filmer sparas i `data/films.db`. Säkerhetskopiera den filen.

## Automatisk filmidentifiering

Streckkodsuppslag använder UPCitemdbs kostnadsfria Explorer-API, utan konto eller nyckel: https://www.upcitemdb.com/api

Skanna eller skriv streckkoden → hämta titel och omslagsadress → kontrollera träffen → spara. Gratisnivån tillåter totalt 100 anrop per dag och har även begränsningar för täta anrop. Täckning och bildkvalitet varierar per utgåva. Vissa produktnamn innehåller även streckkod och skådespelare. Appen visar tydligt om ingen film hittas eller tjänsten begränsar uppslagen. Sparade filmer ligger i SQLite och behöver inga nya uppslag för att visas. Omslagsbilder laddas från källans externa bildadress.

Den separata TMDB-titelsökningen finns kvar som framtida utökning och kräver `TMDB_TOKEN` i `.env`; den används inte i huvudflödet. Nyckeln skickas aldrig till React-klienten.

## Mobil

Appen har webbmanifest och kan läggas på hemskärmen via webbläsaren. Direktskanning kräver HTTPS på mobilen (localhost är tillåtet vid utveckling på samma enhet). På en vanlig HTTP-adress till datorns LAN-IP använder skanningsknappen i stället mobilens fotoväljare med kamerafångst. Fotot avkodas lokalt med ZXing och laddas inte upp till servern. Kameravalet beror på mobilens webbläsare; det går också att välja en befintlig bild. Använd en HTTPS-host med beständig disk för SQLite, eller en HTTPS-proxy framför Node-servern. Mobil och dator delar samlingen när de använder samma server. Appen kräver nätverksanslutning till servern och har inget offline-läge.

Denna första version saknar inloggning. Servern ska hållas på betrott nätverk eller bakom inloggning innan den exponeras på internet. Ingen hosting eller datakälla är ansluten automatiskt. För offentlig användning behöver TMDB:s aktuella licens- och attributionskrav följas, inklusive godkänd logotyp.
