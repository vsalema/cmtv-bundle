# Live Player Bundle (sans token)

Version allégée sans gestion de jeton ni query string supplémentaire.

## Fichiers
- `index.html` — page principale.
- `css/styles.css` — thèmes clair/sombre.
- `js/app.js` — logique Shaka Player sans token.
- `assets/favicon.svg` — icône.

## Utilisation
```
/index.html?src=/streams/CMTVPT.m3u8&title=CMTVPT&autoplay=1&muted=1
```
Aucun paramètre `token` n’est accepté.

## Caractéristiques
- Zéro CORS hack.
- Aucune URL absolue.
- Compatible mobile.
