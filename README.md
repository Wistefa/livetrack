# LiveTrack — GPS Live-Tracking

Echtzeit GPS-Tracking für Gruppen im Browser. Teilnehmer öffnen einen Link auf dem Handy — kein App-Download nötig.

## Features

- **Browser-GPS**: `navigator.geolocation` — funktioniert auf iOS Safari und Android Chrome
- **Echtzeit-Karte**: Leaflet.js + OpenStreetMap, alle Teilnehmer live mit Trail
- **WebSocket**: automatischer Reconnect bei Verbindungsabbruch
- **Sessions**: beliebig viele parallele Gruppen per Session-Code
- **Farbcodiert**: jeder Teilnehmer bekommt eigene Farbe, Initiale als Marker

## Starten

```bash
npm install
npm start
```

→ http://localhost:3000

## Nutzung

1. **Karte öffnen**: `http://localhost:3000` — Session-Code generieren (NEU-Button)
2. **Tracker-Link teilen**: erscheint automatisch im rechten Panel
3. **Teilnehmer**: Link auf dem Handy öffnen → Name eingeben → TRACKING STARTEN
4. **Karte**: alle Teilnehmer erscheinen live mit Marker und Trail

## Architektur

```
public/index.html   # Karte (Viewer, Desktop/Tablet)
public/track.html   # Tracker (GPS-Sender, Handy)
server.js           # Node.js WebSocket + HTTP Server
```

**WebSocket-Protokoll:**
| Nachricht | Richtung | Inhalt |
|---|---|---|
| `join` | Client → Server | sessionId, role (viewer/tracker), name |
| `location` | Tracker → Server | lat, lng, acc, speed, ts |
| `snapshot` | Server → Viewer | alle aktuellen Teilnehmer |
| `left` | Server → Viewer | name (Teilnehmer weg) |

## Technologien

| Komponente | Technologie |
|---|---|
| Backend | Node.js + Express + ws (WebSocket) |
| Karte | Leaflet.js 1.9 + OpenStreetMap |
| GPS | Browser Geolocation API |
| Storage | In-Memory (kein DB nötig) |
