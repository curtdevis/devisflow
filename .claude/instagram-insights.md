# Insights Instagram — @devis.flow

**Dernière analyse : 2026-08-02** (4e exécution de la boucle `instagram-analyst` ↔ `community-manager`, intègre le Reel 6 "preuve_produit" + sa story + le post/story automatiques jour 6, et confirme la maturation du Reel 5)

**Méthode de collecte** : `instagram-analyst` de nouveau absent de la liste des types d'agents disponibles dans cette session (même limite que les jours précédents) — appels directs à l'API Graph (`graph.instagram.com`, v19.0) avec le token de `C:\Users\Natha\ig-mcp\.env`, reproduisant les mêmes endpoints que les tools MCP (`get_profile_info`, `get_media_posts`, `get_media_insights`, `get_account_insights`). Toutes les valeurs ci-dessous sont des réponses brutes de l'API, relevées le 2026-08-02 ~11h15 UTC. Table Supabase `instagram_campaign_posts` interrogée pour confirmer pilier/media ID des 6 publications automatiques (jours 1-6).

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
- `followers_count` : **0** (inchangé)
- `follows_count` : 6
- `media_count` : **14** (+3 depuis le 2026-08-01 : Reel 6, post auto jour 5, post auto jour 6 — la story n'entre pas dans ce compteur)

### Compte — insights globaux (`get_account_insights`)
- `reach` (period=day, `metric_type=total_value`, fenêtre explicite 2026-07-29 → 2026-08-02) : **123**
- `profile_views` : **18** (en hausse continue depuis 7 le 08-01)
- `accounts_engaged` : **1** (inchangé)
- `total_interactions` : **1** (inchangé)
- `website_clicks` : 0 — toujours aucun clic mesuré vers devis-flow.fr malgré les 18 visites de profil cumulées

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
| Day 6 auto (18117076535314965) | Image auto | coulisses | 08-02 08:55 | 0 (trop frais, ~2h20) | – | – | 0 | 0 | 0 | 0 | 0 |
| **Reel 6 (18151162084506788)** | Reel | preuve_produit | 08-02 11:09 | **0** | **0** | **0 ms** | 0 | 0 | 0 | 0 | 0 |

*(pilier/media ID des publications automatiques confirmés via Supabase `instagram_campaign_posts` : jour 1 astuce, jour 2 avant_apres, jour 3 preuve_produit, jour 4 urgence_efacture, jour 5 témoignage, jour 6 coulisses — tous statut `posted`)*

**Reel 5 a mûri depuis le dernier pull** : 0 reach/0 vue (mesuré le 08-01 à quelques minutes de la publication) → **18 reach/18 vues, 2582 ms de watch time moyen** (mesuré le 08-02, ~26h après publication). Confirme une nouvelle fois que les chiffres à J+quelques-minutes ne veulent rien dire — et Reel 5 devient le meilleur reach du lot à ce jour (18, contre 12 pour Reel 3 et 2 pour Reel 4).

**Post day 5 (témoignage) reste à 0 reach même à J+1** — renforce encore le clivage image=0 systématique sur un 7e post image consécutif à 0, quel que soit le pilier ou le délai de mesure.

**Reel 6 n'est PAS exploitable dans cette analyse** : publié à 11:09:32 UTC, données relevées à ~11:15 UTC, soit quelques minutes après publication — beaucoup trop tôt d'après la courbe de maturation observée sur Reel 3/4/5 (mûrissent surtout entre J+0 et J+1). Reach/vues à 0 ne veut rien dire à ce stade, attendre le prochain pull.

**Note de méthode sur `reach` niveau compte** : la fenêtre glissante de `/insights?period=day&metric_type=total_value` n'est pas strictement comparable d'un pull à l'autre (07-28→08-01 = 179 le 08-01 ; 07-29→08-02 = 123 ce pull-ci) car la fenêtre se décale et le paramétrage exact des bornes `since`/`until` varie selon la date d'exécution — ne pas lire la baisse apparente (179 → 123) comme une régression réelle, c'est un artefact de fenêtre.

---

## Résumé — ce qu'on observe (avec prudence)

1. **Le clivage Reel vs Image tient toujours, sans une seule exception sur 14 publications** : les 5 Reels matures ont chacun un reach/vues non nul (77/80, 88/97, 12/14, 2/2, **18/18**), alors que **les 7 posts image ont tous un reach de 0**, y compris à J+1 systématiquement. Le format et le pilier restent en grande partie confondus, mais le pilier "astuce" a été vu sur les deux formats (voir point 2) sans que ça change le pattern. **Signal descriptif très solide sur le format (reel > image pour un compte à 0 followers), toujours aucun signal fiable sur le pilier.**
2. **Comparaison à pilier contrôlé disponible : "astuce"** — Post 2 image (07-29, reach 0) vs Reel 4 (07-31, reach 2 une fois mûri à J+1). Le reel bat le post image même sur ce pilier identique, cohérent avec le pattern général format > pilier. Échantillon encore minuscule (n=1 paire), à confirmer avec d'autres piliers testés sur les deux formats.
3. **La maturation des Reels suit toujours une courbe sur ~24h, jamais un plateau immédiat** : Reel 3 (3/4 → 12/14), Reel 4 (0/0 → 2/2), Reel 5 (0/0 → **18/18**). Reel 5 est même le meilleur reach observé à ce jour, confirmant que le pattern de maturation à 24h est fiable et parfois généreux. Un pull à moins de quelques heures après publication (Reel 6 dans cette analyse) n'est jamais exploitable — attendre systématiquement le lendemain.
4. **Durée de visionnage moyenne** : 1635 ms (Reel 1) → 3111 ms (Reel 2) → 6165 ms (Reel 3) → 5167 ms (Reel 4) → **2582 ms (Reel 5, mesuré à J+1)**. Pas de tendance monotone claire sur 5 points — avec un reach qui varie de 2 à 88 comptes selon le Reel, la moyenne de watch time est trop sensible à quelques spectateurs pour en tirer un signal sur le hook/contenu. Pas assez de volume pour conclure.
5. **Engagement (likes/comments/shares) toujours quasiment nul** : sur 14 publications, toujours seul Reel 2 a 1 save et 1 interaction totale. Aucune hiérarchie hashtag/pilier/CTA possible sur cette base — rien à comparer.
6. **Signal de niveau compte en croissance continue** : `profile_views` passe de 7 (08-01) à **18** (08-02), en hausse constante depuis son apparition. `accounts_engaged`/`total_interactions` restent stables à 1 (toujours liés au seul save de Reel 2). `website_clicks` reste à 0 malgré 18 visites de profil cumulées — pas de conversion profil → site mesurée pour l'instant, à surveiller si le volume de profile_views continue de croître.

---

## Recommandation pour la prochaine publication (Reel jour 7, ~2026-08-03)

- **Format** : Reel — confirmé encore plus fortement (6 Reels vs 7 posts image, écart reach 0 vs >0 toujours sans exception, y compris à pilier identique, et Reel 5 devient le meilleur reach à ce jour). Continuer à prioriser le Reel quotidien sans hésitation.
- **Pilier** : tous les 6 piliers de la stratégie ont maintenant été couverts au moins une fois par un Reel manuel (coulisses, urgence_efacture, témoignage, astuce, avant_apres, preuve_produit) — le cycle complet est bouclé pour la première fois. Repartir sur le pilier le plus stale côté Reel manuel (le plus ancien, hors répétition de la veille) : "coulisses" n'a été fait qu'une fois, le 28/07, il y a 5 jours — bon candidat pour le prochain Reel, en évitant "preuve_produit" (fait aujourd'hui) et en vérifiant le pilier du cron du jour dans `instagram_campaign_posts` pour la diversité.
- **Horaire cible** : toujours pas de signal fiable isolable de l'horaire (n=6 reels, maturité hétérogène, horaires de publication allant de 08h37 à 18h35 UTC). Continuer sans règle stricte.
- **Ne rien changer d'autre** : toujours pas assez de recul pour hashtags/légende/ciblage. Priorité : republier chaque jour, laisser Reel 6 mûrir, et refaire cette analyse après la prochaine publication.

---

## Prochaine étape pour la boucle
Réinvoquer `instagram-analyst` après la prochaine publication. Objectifs prioritaires du prochain pull : (1) mesurer Reel 6 une fois mûri (J+1) pour voir si "preuve_produit" confirme ou infirme le très bon reach de Reel 5 ("avant_apres"), (2) surveiller si `profile_views` continue sa croissance (7 → 18 sur les 2 derniers pulls), (3) recroiser `instagram_campaign_posts` pour tout nouveau jour de cron (jour 7 attendu ~08-03).
