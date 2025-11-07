# Live Player v4

Bundle multi-fichiers. Boutons fonctionnels. Chargement Shaka dynamique avec fallback natif.

## Fichiers
- `index.html`
- `css/styles.css`
- `js/shaka-loader.js`
- `js/app.js`
- `assets/favicon.svg`

## Utilisation
Déployez tel quel sur un hébergement statique, puis ouvrez :
```
/index.html?src=/streams/CMTVPT.m3u8&title=CMTVPT&autoplay=1&muted=1
```
Aucune URL absolue imposée. Aucun hack CORS.

## Dépannage rapide
- Mixed content: flux en http sur page https → bloqué par le navigateur.
- CORS: ajoutez `Access-Control-Allow-Origin` côté serveur pour le manifeste ET les segments.
- Types MIME: `.m3u8 = application/vnd.apple.mpegurl`, `.mpd = application/dash+xml`.
