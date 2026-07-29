# Journal des publications Instagram — @devis.flow

## 2026-07-28 — Post 1 (pilier "coulisses" — présentation)
- **Type** : Post carré (1080x1080)
- **Visuel** : Dégradé navy → orange, logo DevisFlow, headline "Vos devis. Générés en 30 secondes."
- **Légende** : présentation DevisFlow, douleur artisan (devis chronophages), CTA essai gratuit 7 jours, 10 hashtags (artisanbtp, btpfrance, artisandufrance, chantierfrance, artisanat, petiteentreprise, entrepreneurfrance, logicieldevis, gestionchantier, saasfrancais)
- **Statut** : publié avec succès, visible sur le profil
- **Suivi du calendrier** : `.claude/instagram-strategy.md` semaine 1, lundi

## 2026-07-28 — Reel 1 (pilier "coulisses" — présentation)
- **Type** : Reel vertical 1080x1920, 16s, motion graphics (4 slides, zoom léger, fondu enchaîné)
- **Contenu** : "2h perdues sur un devis" → "Avec DevisFlow : 30 secondes" → "Devis clair, chiffré, prêt à envoyer" → "Essai gratuit 7 jours"
- **Production** : généré via pipeline sharp (slides) + ffmpeg (assemblage/zoompan/xfade), piste audio silencieuse ajoutée pour compatibilité upload
- **Publication** : upload automatisé impossible (limitation Instagram web avec fichiers vidéo), fichier remis sur le Bureau + légende fournie, publié manuellement par l'utilisateur depuis son téléphone avec musique tendance ajoutée
- **Statut** : publié avec succès

## 2026-07-29 — Post 2 (pilier "astuce devis" — 3 erreurs)
- **Type** : Post carré (1080x1080)
- **Visuel** : Dégradé navy → orange, 3 cartes numérotées (devis envoyé trop tard, prix approximatif, aucune relance)
- **Production** : image générée via script Python/Pillow (`generate_post.py`, scratchpad)
- **Légende** : "3 erreurs qui te font perdre des chantiers", 3 erreurs détaillées, CTA essai gratuit, 10 hashtags
- **Publication** : via l'API Graph Instagram (`publish_media`, media_type IMAGE) — première publication 100% automatisée, plus besoin d'upload manuel
- **Incident** : la légende initiale contenait des caractères corrompus (emojis/tirets → "??"/"�") à cause d'un problème d'encodage bash lors de la construction de la requête curl. Corrigé en éditant la légende directement dans l'app Instagram (l'édition de légende via l'API Graph accepte la requête avec `{"success":true}` mais n'applique rien réellement — piège à connaître). Pour toute future publication via curl/bash, toujours passer par un fichier écrit avec l'outil Write (UTF-8 propre) et un chemin Windows (`C:/Users/...`) pour `--data-urlencode name@fichier`, jamais interpoler des emojis via `$'...'` dans bash.
- **Media ID** : 17980958325054590
- **Statut** : publié avec succès, légende corrigée et vérifiée

## 2026-07-29 — Reel 2 (pilier "urgence e-facture")
- **Type** : Reel vertical 1080x1920, composition Remotion `InstagramReel04` (`devisflow-video/src/Instagram2.tsx`)
- **Contenu** : timeline obligation Factur-X 2024/2025/2026, DevisFlow déjà conforme
- **Production** : rendu via `npx remotion render` — nécessite `Config.setBrowserExecutable` vers Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) dans `remotion.config.ts` car le téléchargement du Chrome Headless Shell intégré ne persiste pas dans cet environnement (retélécharge à chaque fois puis échoue silencieusement)
- **Publication** : via l'API Graph Instagram (`media_type=REELS`), hébergement temporaire du fichier sur Supabase Storage (bucket public `social-assets`) le temps de la publication (l'API Instagram exige une URL publique, pas d'upload direct de fichier local)
- **Musique** : aucune piste ajoutée — la musique tendance Instagram n'est accessible que via l'éditeur de l'app mobile, pas via l'API. À faire manuellement si souhaité.
- **Media ID** : 18069279731711265
- **Statut** : publié avec succès, légende corrigée et vérifiée (même incident d'encodage que Post 2)

## 2026-07-29 — Story (écho au Reel urgence e-facture)
- **Type** : Story vidéo 1080x1920, composition Remotion `InstagramStory02`
- **Publication** : via l'API Graph Instagram (`media_type=STORIES`), même hébergement temporaire Supabase
- **Statut** : publié avec succès (les stories n'apparaissent pas dans `/media`, non vérifiable via API après coup — disparaît après 24h)
