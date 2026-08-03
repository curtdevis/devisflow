# Journal des publications Instagram — @devis.flow

## ⚠️ 2026-07-29 — Campagne automatique 43 jours activée
Depuis le 2026-07-29, un post + une story sont publiés automatiquement CHAQUE JOUR à 8h15 UTC via `/api/instagram/daily-post` (Vercel Cron, voir `vercel.json` et `scripts/daily-instagram-post.tsx`). Contenu généré par Gemini, rotation sur les 6 piliers de `.claude/instagram-strategy.md`. Progression réelle (jour actuel, statut, erreurs) : table Supabase `instagram_campaign_posts`, PAS ce fichier — ce journal manuel n'est plus mis à jour pour ces publications automatiques. Le community-manager (session manuelle) doit consulter cette table avant de publier quoi que ce soit en plus, pour éviter tout doublon avec la campagne auto. Fin prévue : jour 43 (~2026-09-10).

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

## 2026-07-30 — Reel 3 (pilier "témoignage" — POV essai 7 jours)
- **Type** : Reel vertical 1080x1920, 16s, composition Remotion `InstagramReel05` (`devisflow-video/src/Instagram2.tsx`, `Reel05Temoignage`) — composition existante réutilisée telle quelle, aucune nouvelle composition créée
- **Contenu** : narration "POV : tu testes DevisFlow pendant 7 jours" — Jour 1 (premier devis en 28s), Jour 3 (client qui signe en ligne depuis son téléphone), Jour 7 (bilan dashboard), verdict final. Témoignage générique/illustratif, non attribué à un artisan nommé — aucune fausse citation attribuée à une personne réelle.
- **Musique** : piste de fond `public/music.mp3` intégrée dans la composition (`<Audio src={staticFile("music.mp3")} volume={0.1} />`, déjà présente avant ce run), volume 0.1 — vérifié après rendu via `ffprobe` : le fichier final contient bien un flux audio AAC (pas de piste silencieuse).
- **Production** : rendu via `npx remotion render InstagramReel05` (nécessite toujours `Config.setBrowserExecutable` vers Edge dans `remotion.config.ts`, non modifié)
- **Légende** : écrite via l'outil Write dans un fichier UTF-8 propre (scratchpad), référencée via `--data-urlencode caption@chemin` — accents/emoji/apostrophes vérifiés intacts dans la légende publiée (pas de récidive de l'incident d'encodage Post 2)
- **Publication** : hébergement temporaire sur Supabase Storage (bucket public `social-assets`, chemin `manual/reel-03-temoignage.mp4`) puis publication via l'API Graph Instagram (`graph.instagram.com`, PAS `graph.facebook.com`), `media_type=REELS`, conteneur créé puis poll du `status_code` jusqu'à `FINISHED` avant `media_publish` — publication 100% automatisée, pas d'upload manuel nécessaire cette fois
- **Media ID** : 17895275892564120
- **Permalink** : https://www.instagram.com/reel/DbafHHsE848/
- **Statut** : publié avec succès

## 2026-07-30 — Story (écho au Reel témoignage)
- **Type** : Story vidéo 1080x1920 (même fichier que le Reel 3, réutilisé tel quel comme écho)
- **Publication** : via l'API Graph Instagram (`media_type=STORIES`), même hébergement temporaire Supabase que le Reel 3 — ne duplique pas la story automatique du cron du jour (pilier "avant_apres", `ig_story_id` 18381363199206157, postée 09:04 UTC via `instagram_campaign_posts` jour 2), contenu et pilier différents
- **Media ID** : 18123647830814317
- **Statut** : publié avec succès (non vérifiable via `/media` après coup, disparaît après 24h)

## ⚠️ 2026-07-31 — Couverture unique des Reels (nouvelle consigne utilisateur, obligatoire à partir d'aujourd'hui)
**Décision technique** : après vérification de la doc officielle Meta (`developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/`), le endpoint `POST /{ig-user-id}/media` avec `media_type=REELS` accepte bien un paramètre **`cover_url`** dédié : *"The path to an image to use as the cover image for the Reels tab."* — JPEG, 8 Mo max, sRGB, ratio 9:16 recommandé. Si `cover_url` ET `thumb_offset` sont fournis, `cover_url` est prioritaire et `thumb_offset` est ignoré. C'est donc la méthode correcte à utiliser — **pas besoin** d'insérer la couverture comme premier frame fixe de la composition Remotion (solution de repli envisagée dans la consigne initiale, finalement inutile car l'API supporte nativement une image de couverture séparée).
- Le SDK `ig-mcp` (`mcp__instagram__publish_media`) ne supporte ni `media_type=REELS` explicite ni `cover_url` (voir `PublishMediaRequest` dans `instagram_client.py` — seulement `image_url`/`video_url`/`caption`/`location_id`) : comme pour les Reels précédents, publication faite en appel direct `curl` sur `graph.instagram.com`, pas via le MCP.
- **Génération de la couverture** : script Node + `sharp` (rendu d'un SVG vers JPEG 1080x1920, `chromaSubsampling: 4:4:4`, qualité 92) — navy `#1E3A5F`/`#0a2540` en dégradé, cercles décoratifs orange `#f97316` en transparence, bouton "play" stylisé, wordmark "DevisFlow" (Devis blanc + Flow orange), tagline "Vos devis. Générés en 30 secondes.", pastille CTA orange "devis-flow.fr" + "Essai gratuit 7 jours". Fichier : 1080x1920, JPEG, ~117 Ko (largement sous la limite 8 Mo).
- **Stockage réutilisable** : uploadée UNE FOIS sur Supabase Storage, bucket public `social-assets`, chemin fixe `brand/reel-cover-devisflow.jpg` → URL publique permanente `https://vpkafkilducttjucrzze.supabase.co/storage/v1/object/public/social-assets/brand/reel-cover-devisflow.jpg`. **Tous les prochains Reels doivent réutiliser cette même URL en `cover_url`, sans regénérer l'image** (le script de génération n'a pas été conservé dans le repo — l'asset publié sur Supabase fait foi ; si besoin de le régénérer un jour, refaire le même script sharp/SVG décrit ci-dessus).
- **Vérification** : après publication du Reel 4 ci-dessous, la miniature réellement affichée par Instagram (`thumbnail_url` retourné par l'API) a été téléchargée et inspectée visuellement — elle correspond exactement à la couverture designée (pas une frame aléatoire de la vidéo). Confirmé.

## 2026-07-31 — Reel 4 (pilier "astuce devis/métier" — hook "3h de devis")
- **Contexte** : le Reel du jour n'avait pas été produit ce matin (le reel n'est PAS automatisé, contrairement au post+story qui tournent via le cron `instagram_campaign_posts` — cf. avertissement en tête de ce fichier) ; publié en rattrapage l'après-midi.
- **Choix du pilier** : la table Supabase `instagram_campaign_posts` a été consultée avant de choisir — le cron avait déjà publié aujourd'hui le pilier "preuve_produit" (jour 3, 08:42 UTC, `ig_media_id` 17985050280019932). Les 2-3 derniers Reels manuels étaient "témoignage" (30/07) et "urgence_efacture" (29/07), et le cron avait couvert "avant_apres" la veille (30/07). Pilier "astuce devis/métier" retenu car non touché par aucun canal (manuel ou cron) depuis 2 jours (dernière fois : post 2 manuel + jour 1 cron, 29/07) — meilleure diversité de contenu sur la journée.
- **Type** : Reel vertical 1080x1920, 15s (450 frames à 30fps), composition Remotion existante `InstagramReel01` (`devisflow-video/src/Instagram.tsx`, `Reel01Hook`) — réutilisée telle quelle, aucune nouvelle composition créée.
- **Contenu** : hook "Tu passes encore 3h à faire tes devis ?" → comparatif AVANT (3h, tableur Excel, erreurs de calcul) / APRÈS (30 secondes, depuis le chantier, PDF pro immédiat) → démo formulaire (ligne devis chiffrées, total TTC) → CTA DevisFlow / essai gratuit. Contenu produit uniquement, aucune fausse statistique ni témoignage attribué à une personne réelle.
- **Musique** : piste `public/music.mp3` intégrée dans la composition (`<Audio src={staticFile("music.mp3")} volume={0.1} />`, déjà présente), volume 0.1 — vérifié après rendu via `ffprobe` : flux audio AAC ~15.06s présent aux côtés du flux vidéo H.264 ~15.00s.
- **Production** : rendu via `npx remotion render InstagramReel01 out/reel-04-astuce.mp4` (toujours via `Config.setBrowserExecutable` vers Edge dans `remotion.config.ts`, non modifié) — 866 Ko en sortie.
- **Couverture** : `cover_url` = asset unique réutilisable décrit ci-dessus (voir section couverture).
- **Légende** : écrite via l'outil Write dans un fichier UTF-8 propre (scratchpad), référencée via `--data-urlencode caption@chemin` — accents/emoji vérifiés intacts après publication (relecture de la légende retournée par l'API : "Tu passes encore 3h à faire tes devis ?" etc., aucune corruption).
- **Publication** : hébergement temporaire sur Supabase Storage (bucket `social-assets`, chemin `manual/reel-04-astuce.mp4`), puis `POST /{account}/media` avec `media_type=REELS`, `video_url`, `cover_url`, `caption` sur `graph.instagram.com` (pas `graph.facebook.com`) — conteneur créé puis poll du `status_code` (FINISHED dès la première tentative) avant `media_publish`. 100% automatisé, aucun upload manuel.
- **Media ID** : 18109283051092818
- **Permalink** : https://www.instagram.com/reel/DbdAUkcClur/
- **Statut** : publié avec succès, couverture custom confirmée visuellement identique à l'asset designé.

## 2026-07-31 — Story (écho au Reel 4 "astuce")
- **Type** : Story vidéo 1080x1920 (même fichier que le Reel 4, réutilisé tel quel comme écho)
- **Vérification anti-doublon** : table `instagram_campaign_posts` consultée avant publication — le cron avait déjà publié une story automatique aujourd'hui (pilier "preuve_produit", `ig_story_id` 18014125109877593, jour 3, 08:42 UTC). Cette story manuelle est un contenu et pilier différents ("astuce"), ne duplique pas celle du cron — même logique que les 29/07 et 30/07.
- **Publication** : via l'API Graph Instagram (`media_type=STORIES`), même hébergement Supabase que le Reel 4, conteneur créé puis poll `status_code` (FINISHED) avant `media_publish`.
- **Media ID** : 17990653721828354
- **Statut** : publié avec succès (non vérifiable via `/media` après coup, disparaît après 24h).

## ✅ 2026-07-31 — Boucle `instagram-analyst` fermée (a posteriori)
Le point ouvert ci-dessous a été traité en session principale le 2026-07-31 : `.claude/instagram-insights.md` a été rafraîchi avec les données réelles (Graph API en appel direct, mêmes outils `mcp__instagram__*` toujours non chargés dans cette session non plus) intégrant Reel 4 + post/story auto jour 3. Changement principal : le clivage reach Reel(>0) vs Post image(=0) se confirme sur 9 publications sans exception ; Reel 3 a mûri (3/4 → 12/14) ; Reel 4 trop frais (13 min) pour être exploitable, à mesurer au prochain pull. Voir `.claude/instagram-insights.md` pour le détail complet.

<details>
<summary>Note originale (résolue)</summary>

`community-manager.md` impose de réinvoquer `instagram-analyst` après chaque publication pour rafraîchir `.claude/instagram-insights.md`. Cette session n'avait pas accès à l'agent `instagram-analyst` (absent de la liste des types d'agents disponibles dans ce contexte, et les outils `mcp__instagram__*` n'étaient pas non plus chargés — token/API validés en direct via `curl` à la place). À faire au prochain passage en session principale : invoquer `instagram-analyst` pour intégrer le Reel 4 + Story du jour aux insights (`.claude/instagram-insights.md` date encore du 2026-07-30, il a maintenant 2 jours de retard).

</details>

## ⚠️ 2026-08-01 — Reel du jour non produit ce matin (récidive)
Comme le 31/07, le Reel du jour n'avait de nouveau pas été produit à l'automatique — rappel : contrairement au post+story (cron quotidien 8h15 UTC, table Supabase `instagram_campaign_posts`), le Reel n'a jamais été automatisé et doit être produit manuellement chaque jour. Produit et publié en rattrapage ci-dessous, en une seule session, sans repasser par l'utilisateur.

## 2026-08-01 — Reel 5 (pilier "avant/après" — temps gagné 2h47min → 28sec)
- **Choix du pilier** : table Supabase `instagram_campaign_posts` consultée avant de choisir — le cron avait déjà publié aujourd'hui (jour 4, 08:33 UTC) le pilier "urgence_efacture" (`ig_media_id` 18093561017161739, `ig_story_id` 18005742836763990). Historique des Reels manuels : coulisses (28/07), urgence_efacture (29/07), témoignage (30/07), astuce (31/07) — jamais "avant_apres". Ce pilier n'avait été touché que par le cron il y a 2 jours (jour 2, 30/07, `avant_apres`), plus stale que "preuve_produit" (touché hier par le cron, jour 3, 31/07). "avant_apres" retenu pour la meilleure diversité de contenu sur la journée, même logique que le choix du Reel 4 le 31/07.
- **Type** : Reel vertical 1080x1920, 10s (300 frames à 30fps), composition Remotion existante `InstagramReel02` (`devisflow-video/src/Instagram.tsx`, `Reel02AvantApres`) — réutilisée telle quelle, aucune nouvelle composition créée. Composition non listée dans les 4 exemples habituels (Reel01/04/05/Comparateur) mais déjà présente dans le repo et correspondant exactement au pilier "avant/après" (contrairement à `ReelComparateur`, plus orienté "preuve produit").
- **Contenu** : "Pourquoi perdre du temps au bureau ?" → temps moyen sans DevisFlow (2h47min, barre de progression rouge) → temps avec DevisFlow (28 secondes, barre verte) → CTA devis-flow.fr / essai gratuit. Comparatif de temps générique/illustratif, aucune fausse statistique attribuée à une personne réelle.
- **Musique** : piste `public/music.mp3` intégrée dans la composition (`<Audio src={staticFile("music.mp3")} volume={0.1} />`, déjà présente), volume 0.1 — vérifié après rendu via `ffprobe` : flux audio AAC 48kHz stéréo ~10.05s présent aux côtés du flux vidéo H.264 ~10.00s (pas de piste silencieuse).
- **Production** : rendu via `npx remotion render InstagramReel02 out/reel-05-avant-apres.mp4` (toujours via `Config.setBrowserExecutable` vers Edge dans `remotion.config.ts`, non modifié) — 505.7 Ko en sortie.
- **Couverture** : `cover_url` = asset unique réutilisable (`brand/reel-cover-devisflow.jpg`, décrit dans la section couverture du 31/07) — **vérifié après publication** : `thumbnail_url` retourné par l'API téléchargé et comparé visuellement (lecture d'image) à l'asset de référence — identique en tout point (dégradé navy, bouton play orange, wordmark DevisFlow, tagline, CTA devis-flow.fr).
- **Légende** : écrite via l'outil Write dans un fichier UTF-8 propre (scratchpad), référencée via `--data-urlencode caption`/paramètre `caption` dans le corps de requête — accents/apostrophes/emoji vérifiés intacts en relisant la légende retournée par l'API (`GET /{media-id}?fields=caption`), aucune corruption.
- **Publication** : hébergement temporaire sur Supabase Storage (bucket public `social-assets`, chemin `manual/reel-05-avant-apres.mp4`, upload vérifié HTTP 200 + taille exacte), puis `POST /{account}/media` avec `media_type=REELS`, `video_url`, `cover_url`, `caption` sur `graph.instagram.com` (pas `graph.facebook.com`) — conteneur créé puis poll du `status_code` jusqu'à `FINISHED` (5 tentatives, ~20s) avant `media_publish`. 100% automatisé, aucun upload manuel.
- **Media ID** : 18110785987795662
- **Permalink** : https://www.instagram.com/reel/DbfbOudgWsV/
- **Statut** : publié avec succès, couverture custom confirmée visuellement identique à l'asset designé, légende confirmée intacte.

## 2026-08-01 — Story (écho au Reel 5 "avant/après")
- **Type** : Story vidéo 1080x1920 (même fichier que le Reel 5, réutilisé tel quel comme écho)
- **Vérification anti-doublon** : table `instagram_campaign_posts` consultée avant publication — le cron avait déjà publié une story automatique aujourd'hui (pilier "urgence_efacture", `ig_story_id` 18005742836763990, jour 4, 08:33 UTC). Cette story manuelle est un contenu et pilier différents ("avant_apres"), ne duplique pas celle du cron — même logique que les 29/07, 30/07 et 31/07.
- **Publication** : via l'API Graph Instagram (`media_type=STORIES`), même hébergement Supabase que le Reel 5, conteneur créé puis poll `status_code` (FINISHED après ~70s) avant `media_publish`.
- **Media ID** : 18179874274373629
- **Statut** : publié avec succès (non vérifiable via `/media` après coup, disparaît après 24h).

## 2026-08-01 — Boucle `instagram-analyst` fermée
`instagram-analyst` absent de la liste des types d'agents disponibles dans cette session (même limite que le 31/07). Rafraîchissement de `.claude/instagram-insights.md` fait directement via appels `curl`/Graph API en session courante (mêmes données réelles, pas de best practice générique) — voir `.claude/instagram-insights.md` pour le détail intégrant Reel 5 + post/story auto jour 4.

## ⚠️ 2026-08-02 — Reel du jour non produit ce matin (récidive)
Comme le 31/07 et le 01/08, le Reel du jour n'avait de nouveau pas été produit à l'automatique. Rappel identique : le Reel n'a jamais été automatisé, contrairement au post+story (cron quotidien, table Supabase `instagram_campaign_posts`) qui ont tourné normalement aujourd'hui à 08:55 UTC (jour 6, pilier "coulisses", `ig_media_id` 18117076535314965, `ig_story_id` 18095723684287510). Produit et publié en une seule session, sans repasser par l'utilisateur.

## 2026-08-02 — Reel 6 (pilier "preuve_produit" — démo 30 secondes chrono en direct)
- **Choix du pilier** : table Supabase `instagram_campaign_posts` consultée avant de choisir (day_number=6, pilier "coulisses", déjà posté ce matin 08:55 UTC). Historique complet des Reels manuels : coulisses (28/07), urgence_efacture (29/07), témoignage (30/07), astuce (31/07), avant_apres (01/08) — **"preuve_produit" n'avait encore jamais été couvert par un Reel manuel**, seulement par le cron (jour 3, 31/07). C'est aussi la recommandation explicite laissée dans `.claude/instagram-insights.md` du 2026-08-01 ("piliers pas encore couverts par un Reel manuel : preuve_produit et coulisses"). Choisi pour maximiser la diversité de la journée (cron=coulisses, reel=preuve_produit, aucun chevauchement).
- **Type** : Reel vertical 1080x1920, 18s (540 frames à 30fps), composition Remotion existante `InstagramReel03` (`devisflow-video/src/Instagram2.tsx`, `Reel03Demo30sec`) — réutilisée telle quelle, aucune nouvelle composition créée. Seule composition Reel jamais utilisée manuellement jusqu'ici avec `ReelComparateur`; choisie car son contenu (démo produit en direct, chrono, formulaire rempli en temps réel, confettis de succès) correspond exactement au pilier "preuve_produit" — contrairement à `ReelComparateur`, plus orienté tableau comparatif face à la concurrence.
- **Contenu** : "DÉFI : créer un devis en 30 secondes en direct" → chrono qui tourne pendant que le formulaire se remplit (nom artisan, client, description travaux, matériaux, main d'oeuvre) → barre de progression génération IA → confettis de succès. Démo produit illustrative, aucune fausse statistique ni témoignage attribué à une personne réelle.
- **Musique** : piste `public/music.mp3` intégrée dans la composition (`<Audio src={staticFile("music.mp3")} volume={0.1} />`, déjà présente), volume 0.1 — vérifié après rendu via `ffprobe` : flux vidéo H.264 18.00s + flux audio AAC 48kHz stéréo ~18.05s présent (pas de piste silencieuse).
- **Production** : rendu via `npx remotion render InstagramReel03 out/reel-06-preuve-produit.mp4` (toujours via `Config.setBrowserExecutable` vers Edge dans `remotion.config.ts`, non modifié) — 1.4 Mo en sortie.
- **Couverture** : `cover_url` = asset unique réutilisable (`brand/reel-cover-devisflow.jpg`, décrit dans la section couverture du 31/07) — **vérifié après publication** : `thumbnail_url` retourné par l'API téléchargé (104 794 octets) et comparé visuellement (lecture d'image côte à côte) à l'asset de référence (117 122 octets) — identique en tout point (dégradé navy, bouton play orange cerclé, wordmark DevisFlow, tagline "Vos devis. Générés en 30 secondes.", pastille CTA orange devis-flow.fr / Essai gratuit 7 jours).
- **Légende** : écrite via l'outil Write dans un fichier UTF-8 propre (scratchpad) — accents/apostrophes/emoji vérifiés intacts en relisant la légende retournée par l'API (`GET /{media-id}?fields=caption`), aucune corruption.
- **Publication** : hébergement temporaire sur Supabase Storage (bucket public `social-assets`, chemin `manual/reel-06-preuve-produit.mp4`, upload vérifié HTTP 200 + taille exacte 1 417 160 octets, URL publique vérifiée accessible HEAD 200), puis `POST /me/media` avec `media_type=REELS`, `video_url`, `cover_url`, `caption` sur `graph.instagram.com` (pas `graph.facebook.com`, endpoint `/me` utilisé plutôt que l'ID de compte explicite — le token résout systématiquement vers `@devis.flow` quel que soit l'ID passé, confirmé en comparant `/me` et l'ID stocké) — conteneur créé puis poll du `status_code` jusqu'à `FINISHED` (5 tentatives, ~20s) avant `media_publish`. 100% automatisé, aucun upload manuel.
- **Media ID** : 18151162084506788
- **Permalink** : https://www.instagram.com/reel/DbiRdWqEYOZ/
- **Statut** : publié avec succès, couverture custom confirmée visuellement identique à l'asset designé, légende confirmée intacte.

## 2026-08-02 — Story (écho au Reel 6 "preuve_produit")
- **Type** : Story vidéo 1080x1920 (même fichier que le Reel 6, réutilisé tel quel comme écho)
- **Vérification anti-doublon** : table `instagram_campaign_posts` consultée avant publication — le cron avait déjà publié une story automatique aujourd'hui (pilier "coulisses", `ig_story_id` 18095723684287510, jour 6, 08:55 UTC). Cette story manuelle est un contenu et pilier différents ("preuve_produit"), ne duplique pas celle du cron — même logique que les jours précédents.
- **Publication** : via l'API Graph Instagram (`media_type=STORIES`), même hébergement Supabase que le Reel 6, conteneur créé puis poll `status_code` (FINISHED après ~20s) avant `media_publish`.
- **Media ID** : 17961610338160648
- **Statut** : publié avec succès (non vérifiable via `/media` après coup, disparaît après 24h).

## 2026-08-02 — Boucle `instagram-analyst` fermée
`instagram-analyst` absent de la liste des types d'agents disponibles dans cette session (même limite que les jours précédents). Rafraîchissement de `.claude/instagram-insights.md` fait directement via appels API Graph en session courante (mêmes données réelles, pas de best practice générique) — voir `.claude/instagram-insights.md` pour le détail intégrant Reel 6 + post/story auto jour 6, et la maturation du Reel 5 (0/0 → 18 reach/18 vues, 2582 ms de watch time moyen).

## 2026-08-03 — Analyse de performance à froid, avant publication (demande explicite utilisateur)
Avant de produire le Reel du jour, insights rafraîchis en direct via l'API Graph (`graph.instagram.com`) sur les 6 Reels existants (le Reel 6 avait eu le temps de mûrir depuis le 02/08, ~21h) :

| Reel | Pilier | Reach | Vues | Watch time moy. |
|---|---|---|---|---|
| Reel 6 (18151162084506788) | preuve_produit | **103** | 109 | 1757 ms |
| Reel 2 (18069279731711265) | urgence_efacture | **88** | 97 | 3111 ms, 1 save (seule interaction du compte) |
| Reel 1 (18090522386436782) | coulisses | **77** | 80 | 1635 ms |
| Reel 5 (18110785987795662) | avant_apres | 18 | 18 | 2582 ms |
| Reel 3 (17895275892564120) | témoignage | 12 | 14 | 6165 ms (meilleur watch time, mais reach faible) |
| Reel 4 (18109283051092818) | astuce | 3 | 4 | 4353 ms |

Compte : reach global 227 (fenêtre 29/07→03/08, en forte hausse depuis la maturation du Reel 6), profile_views 20, toujours 0 followers. Conclusion actionnable : le format Reel écrase toujours le format image (0 reach constant sur 7 posts image), et les 3 piliers **preuve_produit, urgence_efacture, coulisses** forment un trio de tête net, loin devant avant_apres/témoignage/astuce. "Coulisses" combine donc un bon signal de performance réel (3e meilleur reach, 77) ET le critère de fraîcheur (un seul Reel manuel dessus, le tout premier du 28/07, jamais repris depuis) — les deux logiques convergent, pas de compromis nécessaire ce jour-ci.

## 2026-08-03 — Reel 7 (pilier "coulisses" — humain derrière DevisFlow)
- **Choix du pilier** : voir analyse de performance ci-dessus. "Coulisses" choisi pour la convergence performance (3e meilleur reach du compte, 77) + fraîcheur (non repris depuis le Reel 1 du 28/07). Table Supabase `instagram_campaign_posts` vérifiée : le cron jour 7 n'avait pas encore tourné au moment de la production (avant 08h15 UTC), pas de conflit possible avec le pilier du jour côté auto.
- **Type** : Reel vertical 1080x1920, 15s (450 frames à 30fps), **nouvelle composition Remotion** `InstagramReel06` (`devisflow-video/src/Instagram2.tsx`, `Reel06Coulisses`) — aucune composition existante ne couvrait le pilier "coulisses" (contenu humain/origine, différent des démos produit), composition créée en suivant la structure narrative fixe de la stratégie (accroche → contexte → preuve/bénéfice → CTA) et le style visuel standard (navy `#1e3a5f`/orange `#f97316`, mêmes helpers `fadeIn`).
- **Contenu** : hook "Qui y a-t-il vraiment derrière DevisFlow ?" → origine du produit (soirs perdus sur les devis) → humain derrière le support ("c'est nous qui répondons, pas un bot", réponse sous 24h) → CTA essai gratuit. Contenu illustratif/générique sur la mission produit, aucune fausse statistique ni témoignage attribué à une personne réelle.
- **Musique** : piste `public/music.mp3` ajoutée manuellement dans la nouvelle composition (`<Audio src={staticFile("music.mp3")} volume={0.1} />`, première ligne de l'`AbsoluteFill`, comme l'exige la consigne pour toute nouvelle composition) — vérifié après rendu via `ffprobe` : flux vidéo H.264 15.00s + flux audio AAC 15.06s présents.
- **Production** : rendu via `npx remotion render InstagramReel06 out/reel-07-coulisses.mp4` (toujours via `Config.setBrowserExecutable` vers Edge dans `remotion.config.ts`, non modifié) — 824.2 Ko en sortie.
- **Couverture** : `cover_url` = asset unique réutilisable (`brand/reel-cover-devisflow.jpg`) — vérifié après publication : `thumbnail_url` téléchargé (104 794 octets, taille identique octet pour octet à la référence) et inspecté visuellement, identique à l'asset designé.
- **Légende** : écrite via l'outil Write dans un fichier UTF-8 propre (scratchpad), référencée via `--data-urlencode caption@chemin` — accents/apostrophes/emoji vérifiés intacts en relisant la légende retournée par l'API, aucune corruption.
- **Publication** : hébergement temporaire sur Supabase Storage (bucket public `social-assets`, chemin `manual/reel-07-coulisses.mp4`, upload vérifié HTTP 200 + taille exacte 824 156 octets). **Note technique** : la clé `SUPABASE_SERVICE_ROLE_KEY` du projet a été rotée vers le nouveau format Supabase (`sb_secret_...`, non-JWT) — l'upload Storage échouait avec `Invalid Compact JWS` en n'envoyant que `Authorization: Bearer`, résolu en ajoutant aussi le header `apikey` avec la même valeur (les deux headers sont nécessaires avec ce nouveau format de clé). Puis `POST /me/media` avec `media_type=REELS`, `video_url`, `cover_url`, `caption` sur `graph.instagram.com` — conteneur créé puis poll du `status_code` jusqu'à `FINISHED` (6 tentatives, ~24s) avant `media_publish`. 100% automatisé, aucun upload manuel.
- **Media ID** : 18098243501353917
- **Permalink** : https://www.instagram.com/reel/DbkU57Ogo8p/
- **Statut** : publié avec succès, couverture custom confirmée visuellement identique à l'asset designé, légende confirmée intacte.

## 2026-08-03 — Story (écho au Reel 7 "coulisses")
- **Type** : Story vidéo 1080x1920 (même fichier que le Reel 7, réutilisé tel quel comme écho)
- **Vérification anti-doublon** : table `instagram_campaign_posts` interrogée avant publication — le cron jour 7 n'avait pas encore posté (avant 08h15 UTC), aucun risque de doublon de pilier avec l'automatique du jour.
- **Publication** : via l'API Graph Instagram (`media_type=STORIES`), même hébergement Supabase que le Reel 7, conteneur créé puis poll `status_code` (FINISHED après ~16s) avant `media_publish`.
- **Media ID** : 18034471733828123
- **Statut** : publié avec succès (non vérifiable via `/media` après coup, disparaît après 24h).
