# Live Player Bundle

Front statique autonome pour flux HLS/DASH avec Shaka Player.

## Fichiers
- `index.html` — page principale réactive et mobile-friendly.
- `css/styles.css` — thèmes clair/sombre, HUD, loader.
- `js/app.js` — initialisation Shaka, parsing d’URL, contrôles.
- `assets/favicon.svg` — icône.

## Démarrage
Hébergez le dossier tel quel sur n’importe quel serveur statique.
Ouvrez l’URL avec paramètres :

```
/index.html?src=/streams/CMTVPT.m3u8&title=CMTVPT&autoplay=1&muted=1
```

### Paramètres
- `src` — URL du flux HLS/DASH. Chemins relatifs acceptés.
- `type` — optionnel (`hls` | `dash`), auto-détection sinon.
- `title` — titre de la page et de l’entête.
- `autoplay` — `1` pour tenter la lecture auto.
- `muted` — `0` pour démarrer avec le son, sinon muet par défaut.
- `poster` — URL d’une image d’attente.
- `token` — valeur ajoutée en query `?token=…` sans aucun hack CORS.

## Notes conformité
- Aucun script de blocage CORS. Pas d’URL absolue imposée.
- Si le flux exige des entêtes d’authentification, faites-le via un reverse proxy côté serveur.
