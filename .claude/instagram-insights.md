# Insights Instagram — @devis.flow

**Dernière analyse : 2026-08-03** (5e exécution de la boucle `instagram-analyst` ↔ `community-manager`, intègre le Reel 7 "coulisses" + sa story, et confirme la maturation complète du Reel 6 "preuve_produit" — désormais le meilleur reach du compte)

**Analyse anticipée demandée par l'utilisateur avant publication (2026-08-03)** : cette fois l'analyse a été faite AVANT de produire le Reel du jour (pas seulement après), pour orienter le choix du pilier sur des données fraîches plutôt que sur la seule logique de fraîcheur/couverture. Résultat : les deux logiques ont convergé sur "coulisses" (voir `.claude/instagram-log.md` 2026-08-03 pour le détail du raisonnement) — pas de conflit à trancher cette fois, mais si un futur pull montre un désaccord entre "pilier le plus stale" et "pilier le plus performant", **prioriser la performance réelle**, c'est ce que l'utilisateur a explicitement demandé.

**Méthode de collecte** : `instagram-analyst` de nouveau absent de la liste des types d'agents disponibles dans cette session (même limite que les jours précédents) — appels directs à l'API Graph (`graph.instagram.com`, v19.0) avec le token de `C:\Users\Natha\ig-mcp\.env`, reproduisant les mêmes endpoints que les tools MCP (`get_profile_info`, `get_media_posts`, `get_media_insights`, `get_account_insights`). Valeurs relevées en deux temps le 2026-08-03 : ~06h15 UTC (analyse pré-publication, 6 Reels + 7 posts image) et ~08h20 UTC (juste après publication du Reel 7 + sa story, non exploitable). Table Supabase `instagram_campaign_posts` interrogée — jour 7 pas encore posté par le cron au moment de la production (avant 08h15 UTC).

**⚠️ Premier follower du compte (2026-08-03)** : `followers_count` passe de **0 à 1** entre le 08-02 et le 08-03 — première fois depuis le lancement de la campagne le 28/07. Trop tôt pour en tirer une cause (impossible de savoir si c'est lié au Reel 6 qui a mûri entre-temps, ou une action externe), mais à noter comme premier signal de traction réel. À surveiller si la courbe continue.

**Note technique pour la prochaine analyse** : le paramètre `plays` sur `/insights` des Reels est déprécié et renvoie une erreur — utiliser `views` à la place (confirmé par le message d'erreur de l'API, liste des métriques valides retournée). Les métriques `profile_views`, `website_clicks`, `accounts_engaged`, `total_interactions` au niveau compte renvoyaient `{"data":[]}` (vide) jusqu'au 2026-07-31 — ce n'est **plus le cas** ce pull-ci (voir section compte ci-dessous), premier signal de volume exploitable.

---

## ⚠️ Avertissement — historique toujours insuffisant, mais en croissance

**14 publications au total (media_count = 14, +3 depuis la dernière analyse), 0 followers, 6 comptes suivis, quasi aucun like/commentaire/partage.** Toujours largement en dessous du seuil indicatif de fiabilité pour des conclusions fermes — la distribution reste trop concentrée sur peu de Reels matures. Les observations ci-dessous restent **descriptives, pas des conclusions validées**. Continuer avec la stratégie de base reste la bonne approche.

Données manquantes/non disponibles (à ne jamais halluciner) :
- **Démographie audience** (`reached_audience_demographics`) : toujours vide — compte à 0 followers, sous le seuil minimum Meta pour publier une démographie.
- **Insights des stories** : toujours aucune récupérable après coup (11 stories publiées au total à ce jour : 6 échos manuels + 6 auto du cron — aucune n'apparaît dans `/media`, aucune n'a été captée pendant sa fenêtre de vie de 24h).
- **`profile_views` / `website_clicks` / `accounts_engaged` / `total_interactions`** (niveau compte) : toujours non vides, en légère hausse. Voir section compte ci-dessous.

---

## Données brutes collectées

### Profil (`get_profile_info`)
- `followers_count` : **1** (était 0 jusqu'au 08-02 — premier follower, voir avertissement ci-dessus)
- `follows_count` : 7
- `media_count` : **15** (+1 depuis le 2026-08-02 : Reel 7 — le post/story auto jour 7 pas encore publiés au moment du relevé, avant 08h15 UTC)

### Compte — insights globaux (`get_account_insights`)
- `reach` (period=day, `metric_type=total_value`, fenêtre explicite 2026-07-29 → 2026-08-03) : **227** (forte hausse vs 123 le 08-02, tirée par la maturation du Reel 6)
- `profile_views` : **20** (en hausse continue : 7 → 18 → 20)
- `accounts_engaged` : **1** (inchangé)
- `total_interactions` : **1** (inchangé)
- `website_clicks` : 0 — toujours aucun clic mesuré vers devis-flow.fr malgré les 20 visites de profil cumulées

### Média par média (`get_media_posts` + `get_media_insights`)

| Publication | Type | Pilier | Publié (UTC) | Reach | Vues | Watch time moy. | Likes | Comm. | Partages | Saves | Interactions tot. |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Post 1 (18069861431444410) | Image | coulisses | 07-28 15:53 | 0 | – | – | 0 | 0 | 0 | 0 | 0 |
| Reel 1 (18090522386436782) | Reel | coulisses | 07-28 16:35 | 77 | 80 | 1635 ms | 0 | 0 | 0 | 0 | 0 |
| Post 2 (17980958325054590) | Image | astuce | 07-29 18:27 | 0 | – | – | 0 | 0 | 0 | 0 | 0 |
| Reel 2 (18069279731711265) | Reel | urgence_efacture | 07-29 18:35 | 88 | 97 | 3111 ms | 0 | 0 | 0 | 1 | 1 |
| Day 1 auto (18084824324211397) | Image auto | astuce | 07-29 19:33 | 0 | – | – | 0 | 0 | 0 | 0 | 0 |
| Day 2 auto (18137950180578251) | Image auto | avant_apres | 07-30 09:04 | 0 | – | – | 0 | 0 | 0 | 0 | 0 |
| Reel 3 (17895275892564120) | Reel | témoignage | 07-30 10:43 | 12 | 14 | 6165 ms | 0 | 0 | 0 | 0 | 0 |
| Day 3 auto (17985050280019932) | Image auto | preuve_produit | 07-31 08:42 | **0** (toujours, à J+1) | – | – | 0 | 0 | 0 | 0 | 0 |
| Reel 4 (18109283051092818) | Reel | astuce | 07-31 10:06 | **2** | **2** | **5167 ms** | 0 | 0 | 0 | 0 | 0 |
| Day 4 auto (18093561017161739) | Image auto | urgence_efacture | 08-01 08:32 | 0 | – | – | 0 | 0 | 0 | 0 | 0 |
| Reel 5 (18110785987795662) | Reel | avant_apres | 08-01 08:37 | **18** | **18** | **2582 ms** | 0 | 0 | 0 | 0 | 0 |
| Day 5 auto (18109826908790721) | Image auto | témoignage | 08-01 09:10 | 0 (à J+1) | – | – | 0 | 0 | 0 | 0 | 0 |
| Day 6 auto (18117076535314965) | Image auto | coulisses | 08-02 08:55 | 0 (à J+1) | – | – | 0 | 0 | 0 | 0 | 0 |
| Reel 6 (18151162084506788) | Reel | preuve_produit | 08-02 11:09 | **103** | **109** | **1757 ms** | 0 | 0 | 0 | 0 | 0 |
| **Reel 7 (18098243501353917)** | Reel | coulisses | 08-03 08:20 | **0** | **0** | **0 ms** | 0 | 0 | 0 | 0 | 0 |

*(pilier/media ID des publications automatiques confirmés via Supabase `instagram_campaign_posts` : jour 1 astuce, jour 2 avant_apres, jour 3 preuve_produit, jour 4 urgence_efacture, jour 5 témoignage, jour 6 coulisses — tous statut `posted`. Jour 7 pas encore posté au moment de ce pull, avant 08h15 UTC.)*

**Reel 6 a mûri depuis le dernier pull, et de loin le plus fortement observé à ce jour** : 0 reach/0 vue (mesuré le 08-02 à quelques minutes de la publication) → **103 reach/109 vues** (mesuré le 08-03, ~21h après publication) — devient le meilleur reach du compte, largement devant Reel 2 (88) et Reel 1 (77). Watch time relativement bas (1757 ms) pour ce reach très large : cohérent avec une diffusion algorithmique large (beaucoup de vues courtes/scroll rapide) plutôt qu'un engagement profond — à surveiller si ce pattern reach-fort/watch-faible se confirme sur d'autres piliers "preuve_produit".

**Reel 4 légèrement révisé** : 2/2 → **3/4** (watch time 4353 ms) — variation mineure, cohérent avec la maturation lente déjà documentée, ne change rien au classement.

**Post day 6 (coulisses) reste à 0 reach même à J+1** — 8e post image consécutif à 0, le clivage format Reel/Image tient toujours sans exception.

**Reel 7 n'est PAS exploitable dans cette analyse** : publié à 08:20 UTC, données relevées quelques minutes après — beaucoup trop tôt d'après la courbe de maturation observée sur tous les Reels précédents (mûrissent surtout entre J+0 et J+1). Reach/vues à 0 ne veut rien dire à ce stade, attendre le prochain pull.

**Note de méthode sur `reach` niveau compte** : la fenêtre glissante de `/insights?period=day&metric_type=total_value` n'est pas strictement comparable d'un pull à l'autre (07-28→08-01 = 179 le 08-01 ; 07-29→08-02 = 123 ce pull-ci) car la fenêtre se décale et le paramétrage exact des bornes `since`/`until` varie selon la date d'exécution — ne pas lire la baisse apparente (179 → 123) comme une régression réelle, c'est un artefact de fenêtre.

---

## Résumé — ce qu'on observe (avec prudence)

1. **Le clivage Reel vs Image tient toujours, sans une seule exception sur 15 publications** : les 6 Reels matures ont chacun un reach/vues non nul (77/80, 88/97, 12/14, 3/4, 18/18, **103/109**), alors que **les 8 posts image ont tous un reach de 0**, y compris à J+1 systématiquement. **Signal descriptif toujours très solide sur le format (reel > image pour un compte quasi sans followers), toujours aucun signal fiable et définitif sur le pilier — mais un trio de tête commence à se dessiner (point 2).**
2. **Un trio de piliers en tête se dégage nettement** : preuve_produit (Reel 6, reach 103), urgence_efacture (Reel 2, reach 88), coulisses (Reel 1, reach 77) — tous ≥ 77 de reach. Loin derrière : avant_apres (18), témoignage (12), astuce (3-4). Échantillon toujours n=1 par pilier donc à confirmer, mais l'écart est net (facteur ~20x entre le meilleur et le pire) — assez marqué pour commencer à orienter le choix de pilier activement, pas seulement la diversité/fraîcheur. Décision utilisateur du 08-03 : en cas de désaccord entre "pilier le plus stale" et "pilier le plus performant", prioriser la performance.
3. **La maturation des Reels suit toujours une courbe sur ~24h, jamais un plateau immédiat** : Reel 3 (3/4 → 12/14), Reel 4 (0/0 → 3/4), Reel 5 (0/0 → 18/18), Reel 6 (**0/0 → 103/109**, la plus forte progression observée à ce jour). Un pull à moins de quelques heures après publication (Reel 7 dans cette analyse) n'est jamais exploitable — attendre systématiquement le lendemain.
4. **Durée de visionnage moyenne** : 1635 ms (Reel 1) → 3111 ms (Reel 2) → 6165 ms (Reel 3) → 4353 ms (Reel 4) → 2582 ms (Reel 5) → **1757 ms (Reel 6, mesuré à J+1, meilleur reach mais watch time parmi les plus bas)**. Pattern à surveiller : le pilier le plus "reach" (preuve_produit) n'est pas celui qui retient le plus longtemps — cohérent avec une diffusion algorithmique large mais un hook qui ne retient pas forcément la moyenne des spectateurs. Pas encore assez de volume pour trancher si c'est un vrai trade-off reach/rétention ou juste du bruit à 6 points.
5. **Engagement (likes/comments/shares) toujours quasiment nul** : sur 15 publications, toujours seul Reel 2 a 1 save et 1 interaction totale. Aucune hiérarchie hashtag/pilier/CTA possible sur cette base — rien à comparer.
6. **Premier follower du compte (2026-08-03)** : `followers_count` 0 → 1. Signal trop isolé pour en tirer une cause, mais première traction mesurable depuis le lancement — à recroiser avec le prochain pull pour voir si la courbe continue.
7. **Signal de niveau compte en croissance continue** : `profile_views` 7 (08-01) → 18 (08-02) → **20** (08-03), en hausse constante. `reach` compte bondit à **227** (vs 123 la veille), tiré par la maturation du Reel 6. `accounts_engaged`/`total_interactions` restent stables à 1. `website_clicks` reste à 0 malgré 20 visites de profil cumulées — pas de conversion profil → site mesurée pour l'instant.

---

## Recommandation pour la prochaine publication (Reel jour 8, ~2026-08-04)

- **Format** : Reel — confirmé encore plus fortement (6 Reels vs 8 posts image, écart reach 0 vs >0 toujours sans exception). Continuer à prioriser le Reel quotidien sans hésitation.
- **Pilier** : privilégier le trio de tête (preuve_produit 103, urgence_efacture 88, coulisses 77) plutôt que la seule logique de fraîcheur/couverture, sur décision explicite utilisateur du 08-03. "Urgence_efacture" n'a été fait qu'une fois en Reel manuel (29/07, il y a longtemps) et combine bon reach (88) ET meilleur engagement du compte (1 save) — bon candidat pour le prochain Reel si le pilier du cron du jour ne le couvre pas déjà (vérifier `instagram_campaign_posts` avant de choisir). Éviter "astuce"/"témoignage"/"avant_apres" (reach systématiquement < 20) sauf s'ils reviennent avec un angle très différent à tester.
- **Horaire cible** : toujours pas de signal fiable isolable de l'horaire (n=6 reels matures, horaires 08h20-18h35 UTC). Continuer sans règle stricte.
- **Nouveau point à surveiller** : le possible trade-off reach/watch-time du pilier "preuve_produit" (point 4 ci-dessus) — si un futur Reel "preuve_produit" confirme reach fort + watch time faible, ça orientera vers optimiser le hook (3 premières secondes) plutôt que le contenu global.
- **Ne rien changer d'autre** : toujours pas assez de recul pour hashtags/légende/ciblage détaillé.

---

## Prochaine étape pour la boucle
Réinvoquer `instagram-analyst` après la prochaine publication. Objectifs prioritaires du prochain pull : (1) mesurer Reel 7 "coulisses" une fois mûri (J+1) — confirmera ou non sa place dans le trio de tête au 3e point de données sur ce pilier, (2) confirmer si le follower gagné le 08-03 reste stable ou si d'autres suivent, (3) recroiser `instagram_campaign_posts` pour le jour 7 (pas encore posté au moment de ce pull) et le jour 8 attendu (~08-04).
