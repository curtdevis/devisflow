# Stratégie Instagram DevisFlow

*Dernière mise à jour : 2026-07-28*

## 1. Personas cibles

### Persona A — L'artisan indépendant (priorité #1, low ticket 29€/mois)
- **Qui** : plombier, électricien, peintre, maçon, 1-3 salariés, 30-50 ans, gère ses devis le soir ou entre deux chantiers
- **Douleur principale** : perd 1-2h par devis, le fait souvent en retard, relance mal les clients
- **Ce qui l'arrête sur le scroll** : chantier avant/après spectaculaire, chiffre choc ("30 secondes" vs "2 heures"), autre artisan qui témoigne en vidéo courte
- **Objection à l'achat** : "encore un logiciel à apprendre", "mes devis Excel/papier suffisent"

### Persona B — Le patron de petite entreprise BTP (mid-tier, 5-15 salariés)
- **Qui** : gère plusieurs équipes, doit standardiser les devis, sensible à l'image pro envoyée au client
- **Douleur principale** : incohérence entre les devis de ses différents artisans, pas de suivi centralisé
- **Ce qui l'arrête** : dashboard, preuve de gain de temps à l'échelle équipe, conformité e-facture 2026
- **Objection** : prix, migration de l'existant

### Persona C — Agences comptables / groupements BTP (high ticket 300-1000€/mois)
- Signal fort : **Instagram n'est probablement pas le bon canal principal** pour ce segment (peu de décideurs B2B y passent du temps professionnel). Recommandation : contenu témoignage/preuve sociale qui peut être repartagé par ce segment sur LinkedIn, mais ne pas construire de piliers de contenu dédiés à ce persona sur IG. À confirmer avec l'utilisateur si un budget LinkedIn séparé est envisagé.

## 2. Piliers de contenu (organique)

| Pilier | Fréquence | Exemple |
|---|---|---|
| **Astuce devis/métier** | 1x/semaine | "3 erreurs qui font perdre un chantier au devis" |
| **Avant/après chantier (repost artisan)** | 1x/semaine | Photo chantier + mention du temps gagné sur le devis associé |
| **Preuve produit (screen dashboard/devis PDF)** | 1x/2 semaines | Capture réelle d'un devis généré, floutée si données client |
| **Urgence e-facture sept 2026** | 1x/2 semaines | Compte à rebours, ce que ça change concrètement pour un artisan |
| **Témoignage artisan** | 1x/2 semaines | Vidéo courte ou citation avec photo |
| **Coulisses / humain derrière DevisFlow** | 1x/mois | Pourquoi le produit existe, qui répond aux emails |

## 3. Cadence de publication recommandée (mise à jour 2026-07-28 — décision utilisateur)
- **Reels : 1 par jour** — priorité absolue. Format motion-graphics de marque (slides animées + texte + zoom/pan) tant qu'on n'a pas de vraies images de chantier ; à remplacer par du vrai contenu terrain dès que disponible.
- **Posts** : 2/semaine (piliers astuce/preuve produit/urgence e-facture/témoignage)
- **Stories** : quotidien, en écho au Reel du jour + coulisses/sondages

## 3bis. Format Reel (motion graphics de marque, sans tournage)
- Résolution 1080x1920 (9:16), 15-20s, 3-4 slides avec transition fondu + effet de zoom léger
- Structure narrative fixe : Accroche/douleur → Solution DevisFlow → Preuve/bénéfice → CTA essai gratuit
- Générés via pipeline `sharp` (slides SVG) + `ffmpeg` (assemblage, zoompan, transitions) — reproductible chaque jour
- Musique/audio : à ajouter manuellement dans l'app Instagram au moment de la publication (l'audio tendance change trop vite pour être anticipé, et c'est un facteur clé de portée)

## 4. Hashtags (à vérifier actifs avant chaque campagne, ils évoluent vite)
- **Métier BTP France** : #artisanbtp #btpfrance #artisandufrance #chantierfrance
- **Généraliste artisanat** : #artisanat #petiteentreprise #entrepreneurfrance
- **Niche SaaS/outils pro** : #logicieldevis #gestionchantier #saasfrancais
- Limiter à 8-12 hashtags pertinents par post, mixer gros volume + niche (jamais uniquement des hashtags à 1M+ posts, noyés).

## 5. Bio & configuration de page recommandées
- **Nom** : DevisFlow
- **Catégorie de compte** : Logiciel / Application (ou "Service aux entreprises")
- **Bio suggérée** : `Devis pro pour artisans & BTP, générés en 30 secondes ⚡ Essai gratuit 7 jours 👇`
- **Lien** : devis-flow.fr (ou lien trackable si outil de tracking dispo)
- **Compte** : doit être en mode **Professionnel (Business ou Créateur)** — obligatoire pour Meta Business Suite et toute automatisation future

## 6. Calendrier de contenu — 2 premières semaines (à exécuter par `community-manager`)

**Semaine 1**
- Lun : Post — présentation DevisFlow (pilier "coulisses")
- Mer : Story — teasing "3 erreurs de devis" (renvoie au post jeudi)
- Jeu : Post — "3 erreurs qui font perdre un chantier au devis" (pilier astuce)
- Ven : Story — capture d'écran produit + CTA essai gratuit

**Semaine 2**
- Lun : Post — urgence e-facture sept 2026 (pilier urgence)
- Mer : Story — sondage "Combien de temps passez-vous sur un devis ?"
- Jeu : Post — preuve produit (screen dashboard/devis)
- Ven : Story — récap engagement semaine + teaser semaine 3

## 7. Ciblage publicitaire payant (si envisagé)
Non activé par défaut — nécessite une décision et un budget explicites de l'utilisateur. Si activé :
- Audience type : France, 25-55 ans, intérêts BTP/artisanat/entrepreneuriat, exclusion des zones hors cible géographique de DevisFlow
- Outil recommandé : `pipeboard-co/meta-ads-mcp` (voir community-manager.md pour détails) — ne jamais lancer de campagne sans confirmation explicite du budget

## 8. Ce qui manque pour exécuter (voir aussi le récap donné à l'utilisateur en conversation)
- Accès à la page Instagram/Meta Business Suite (identifiants ou session déjà connectée dans Chrome)
- Confirmation : compte déjà en mode Professionnel (Business/Creator) ?
- Décision : publicité payante activée ou organique uniquement pour l'instant ?
- Photos/vidéos de chantiers réels (si disponibles) pour les piliers avant/après et témoignage — sinon le community manager devra travailler uniquement avec des visuels produit générés
