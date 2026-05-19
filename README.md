# LiveTrack — GPS Live-Tracking

Echtzeit GPS-Tracking für Gruppen im Browser. Teilnehmer öffnen einen Link auf dem Handy — kein App-Download nötig. Alle Standorte erscheinen live auf einer gemeinsamen Karte.

## Wie es funktioniert

```
Handy A  ──GPS──▶  track.html  ──WebSocket──▶  server.js  ──WebSocket──▶  index.html (Karte)
Handy B  ──GPS──▶  track.html  ──────────────────────────▶  server.js  ──▶  index.html (Karte)
```

1. Veranstalter öffnet die Karte und generiert einen **Session-Code**
2. Teilnehmer öffnen den **Tracker-Link** auf dem Handy (kein App-Download)
3. Jeder gibt seinen Namen ein und startet das Tracking
4. Alle Teilnehmer erscheinen **live** auf der Karte mit Marker, Trail und Zeitstempel

## Features

- **Browser-GPS** — `navigator.geolocation`, funktioniert auf iOS Safari & Android Chrome
- **Echtzeit-Karte** — Leaflet.js + OpenStreetMap, farbcodierte Marker mit Initialen
- **Route als Trail** — Bewegungspfad jedes Teilnehmers wird mitgezeichnet
- **Popup-Details** — Koordinaten, Genauigkeit, Geschwindigkeit, Zeitstempel
- **Sessions** — mehrere parallele Gruppen gleichzeitig, jede mit eigenem Code
- **Auto-Reconnect** — bei Verbindungsabbruch automatisch wieder verbinden
- **Kein Login** — kein Konto, kein App-Download, nur ein Link

## Voraussetzungen

- Node.js 18+
- Handy mit GPS (iOS 16+ / Android 9+)
- HTTPS erforderlich für GPS auf iOS (lokal: HTTP reicht zum Testen)

## Installation & Start

```bash
git clone https://github.com/Wistefa/livetrack.git
cd livetrack
npm install
npm start
```

Server läuft auf **http://localhost:3000**

| URL | Zweck |
|---|---|
| `http://localhost:3000/` | Karte (Viewer) |
| `http://localhost:3000/track.html?s=CODE` | Tracker (Handy) |

## Deployment (öffentlich erreichbar)

Für echtes GPS-Tracking im Feld braucht der Server eine öffentliche IP und HTTPS (iOS erzwingt HTTPS für Geolocation).

**Option A — beliebiger VPS:**
```bash
# Node.js installieren, Repo klonen, dann:
PORT=443 node server.js  # hinter nginx/caddy mit TLS
```

**Option B — Railway / Render / Fly.io:**
```bash
# Einfach Repo verbinden → automatisches Deployment
# PORT wird als Umgebungsvariable gesetzt
```

## Projektstruktur

```
livetrack/
├── server.js           # Node.js WebSocket + HTTP Server
├── package.json
└── public/
    ├── index.html      # Karte / Viewer (Desktop & Tablet)
    └── track.html      # GPS-Tracker (Handy)
```

## WebSocket-Protokoll

| Nachricht | Richtung | Felder |
|---|---|---|
| `join` | Client → Server | `sessionId`, `role` (viewer/tracker), `name` |
| `location` | Tracker → Server | `lat`, `lng`, `acc`, `speed`, `ts` |
| `snapshot` | Server → Viewer | `participants` (alle aktuellen Positionen) |
| `location` | Server → Viewer | `name`, `lat`, `lng`, `acc`, `speed`, `ts` |
| `left` | Server → Viewer | `name` |
| `stop` | Tracker → Server | — (Tracking beendet) |

## Technologien

| Komponente | Technologie |
|---|---|
| Backend | Node.js 18 + Express 4 + ws 8 |
| Karte | Leaflet.js 1.9 + OpenStreetMap |
| GPS | Browser Geolocation API |
| Echtzeit | WebSocket (nativer Browser-Support) |
| Storage | In-Memory — kein Datenbank-Setup nötig |

## Lizenz

MIT
