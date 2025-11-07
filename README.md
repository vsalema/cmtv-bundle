# Live Player v5

Correctifs majeurs:
- Shaka via `attach(video)` pour supprimer l’avertissement de dépréciation.
- Champ URL + bouton **Tester** qui renvoie statut HTTP et CORS.
- Bouton **Charger** pour relancer sans recharger la page.
- Menu **Démos** avec flux publics pour valider l’UI.
- Fallback natif si Shaka indisponible.

## Usage
1) Déployez le dossier.
2) Ouvrez `/index.html` et collez l’URL du flux, ou utilisez les démos.
3) Si 404/401/403, réparez côté serveur, pas côté front.

## Rappels serveurs
- CORS sur manifeste ET segments.
- MIME: `.m3u8 = application/vnd.apple.mpegurl`, `.mpd = application/dash+xml`.
- HTTPS si la page est HTTPS.
