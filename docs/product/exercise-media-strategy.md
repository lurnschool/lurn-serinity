# Stratégie média — exercices TrackCoach

> Décisions opposables sur la couche média de la bibliothèque exercices.
> Critère prioritaire : sécurité juridique pour une app revendable.

---

## Principe directeur

**Aucun média sans origine claire.** Pour chaque exercice, on doit pouvoir
répondre :
- D'où vient ce média ?
- Quelle licence ?
- Quel droit d'usage commercial ?

**Interdictions formelles** :
- Hotlink vers MuscleWiki, JEFIT, Athlean-X, ou tout site privé.
- Scraping de GIF / vidéos non sourcés.
- Téléchargement de contenus YouTube qu'on ne possède pas.
- Génération IA de mouvements non validés par coach humain.

---

## Sources évaluées

### 1. Wger (open-source)

**Licence :** CC-BY-SA 4.0 (textes + images partiels).
**Qualité :** moyenne. Photos parfois professionnelles, parfois amateur.
**Couverture :** ~400 exercices.
**Coût :** gratuit.
**Risque juridique :** **faible** sous condition d'attribution
("Source: Wger.de under CC-BY-SA 4.0") et de partage des modifications
sous licence compatible.
**Intégration :** API REST publique
`https://wger.de/api/v2/exercise/`. Mapping vers `ExerciseLibrary`
faisable en script offline.
**Décision : GO comme couche d'amorçage.** À utiliser pour combler les
trous textuels (instructions, muscles secondaires) avec attribution
explicite. Ne pas utiliser leurs images comme contenu de marque
TrackCoach — la qualité ne tiendrait pas l'objectif premium.

### 2. ExerciseDB (RapidAPI)

**Licence :** ambiguë. Les GIF sont fournis sans garantie écrite de
droits revendables. Le revendeur RapidAPI rejette généralement la
responsabilité côté provider.
**Qualité :** GIF cohérents, bonne couverture (~1300 exos).
**Coût :** freemium → ~10-30 $/mois pour usage modéré.
**Risque juridique :** **moyen-élevé** sans contrat explicite garantissant
les droits revendables de chaque GIF.
**Décision : NO-GO V1.** À reconsidérer uniquement avec licence écrite
explicite et clause de revente. Pas pour amorcer.

### 3. MuscleWiki

**Licence :** propriétaire, pas d'API publique.
**Qualité :** très bonne (GIF acteur réel, anatomie).
**Coût :** —
**Risque juridique :** **élevé** si on hotlink ou si on copie leurs GIF.
**Décision : NO-GO formel.** Benchmark uniquement. Aucune extraction.

### 4. JEFIT

**Licence :** propriétaire, fermée.
**Décision : NO-GO formel.** Benchmark uniquement.

### 5. Mixamo (Adobe)

**Licence :** gratuite, usage commercial autorisé sur les projets portant
les animations (toujours valider précisément cas par cas via les
conditions d'utilisation Adobe en vigueur).
**Qualité :** animations 3D mocap propres.
**Couverture :** ~2500 animations, dont une fraction utile en fitness.
**Coût :** gratuit (compte Adobe).
**Intégration :** export FBX → Three.js viewer + retargeting personnage,
ou rendu vers MP4. Coût implémentation ~3-5 semaines dev.
**Décision : GO V2** comme couche premium long terme. Architecture média
prête à recevoir des MP4 ou des liens viewer 3D.

### 6. Sketchfab

**Licence :** mixte (CC-BY, CC-BY-SA, propriétaire selon asset).
**Décision : GO ponctuel** pour des assets spécifiques avec licence
revendable confirmée. Pas une stratégie globale.

### 7. Tournage maison City Coaching

**Licence :** 100% propriétaire TrackCoach.
**Qualité :** maîtrisée (matos, cadrage, coach formé).
**Couverture initiale :** 43 exercices fondamentaux (couvrent 80% des
prescriptions courantes).
**Coût :** ~800-1500 € (1 demi-journée tournage + montage).
**Stockage :** Cloudinary (CDN, transformations, formats automatiques).
**Décision : GO V2 — recommandation forte.** C'est le seul moyen d'avoir
une qualité premium et des droits 100% revendables. Déclencher après
validation modèle économique TrackCoach.

### 8. Génération IA vidéo / 3D

**Décision : NO-GO V1, V2.** Risque biomécanique. À reconsidérer dans
18-24 mois si la qualité dépasse le seuil de validation coach humain.

---

## Photos curées Unsplash — couche d'amorçage immédiate (Sprint 4.1)

Intégration de photos Unsplash sélectionnées manuellement via
`src/lib/media-presets.js`. Hotlink direct sur le CDN
`images.unsplash.com` autorisé par la licence Unsplash
(https://unsplash.com/license — usage commercial libre, attribution non
obligatoire mais affichée dans le composant lecteur).

Photos curées par :
- 6 objectifs (`OBJECTIF_HEROS`) — cards programme.
- 12 groupes musculaires (`MUSCLE_HEROS`) — fallback pour fiches
  exercices sans média propriétaire encore tourné.
- 10 équipements (`EQUIPMENT_HEROS`) — wizard onboarding.

Composant `MuscleHero` :
- `<img>` natif avec `loading="lazy"` et `decoding="async"`.
- Fallback gradient anatomique stylé si l'image plante (réseau, blocage).
- Crédit "Unsplash" affiché discrètement en haut-droite.

**Cette couche remplace les emojis et la silhouette SVG** dans toutes
les zones visuelles utilisateur (cards programme, hero exercice,
sélecteur objectif du wizard IA). La silhouette SVG reste disponible
techniquement pour des cas debug/admin.

---

## Architecture média

### Champs DB ajoutés à `ExerciseLibrary`

```prisma
mediaType         String  @default("none")  // none | image | gif | mp4 | youtube | three_d
mediaUrl          String?                    // URL principale (existant)
thumbnailUrl      String?                    // miniature pour cards
videoProvider     String?                    // youtube | cloudinary | self | wger
mediaSource       String?                    // wger | maison | mixamo | sketchfab
mediaLicense      String?                    // CC-BY-SA-4.0 | proprietary | mixamo-adobe
mediaAttribution  String?                    // texte d'attribution à afficher
mediaStatus       String  @default("pending") // pending | approved | rejected
muscleMapUrl      String?                    // silhouette anatomique
animationUrl      String?                    // URL viewer 3D si applicable
demonstrationType String  @default("static") // static | loop | full
lastMediaReviewAt DateTime?
```

### Composant `ExerciseMediaPlayer`

Responsabilités :
1. Détecter le `mediaType`.
2. Afficher en priorité : MP4 > YouTube > GIF > image.
3. Si aucun média ou statut ≠ `approved` → fallback premium :
   - Silhouette anatomique stylée.
   - Label muscle principal.
   - Label équipement.
   - Badge "Vidéo bientôt" si la fiche est marquée
     `mediaStatus = pending` et la vidéo en cours de tournage.
4. Lazy load (Intersection Observer).
5. Optimisation mobile : pause auto hors viewport.
6. Affichage attribution si requis par licence.

### Fallback premium — design

Plutôt qu'un emoji, on affiche une **silhouette humaine vectorielle**
avec le muscle principal coloré (vert brand). Ce composant est rendu
côté client à partir d'une SVG embarquée. Couvre les ~12 groupes
musculaires (PECTORAUX, DOS, EPAULES, BICEPS, TRICEPS, JAMBES,
FESSIERS, ABDOS, MOLLETS, AVANT_BRAS, FULL_BODY, CARDIO).

---

## Workflow tournage maison (V2)

1. **Préparation** : liste 43 exercices fondamentaux (générée depuis
   `ExerciseLibrary` triée par `goalTags` + ordre d'usage).
2. **Tournage** : 1 demi-journée, coach exécute chaque mouvement
   correctement, 2 angles (vertical 9:16 + horizontal 16:9), boucle
   4-6s + démo complète 15-20s.
3. **Montage** : trim, color grade léger, no-audio, format MP4 H.264.
4. **Upload** : Cloudinary, structure dossier `exercises/{slug}/...`.
5. **Mapping DB** : script `seed-media.js` qui met à jour `mediaUrl`,
   `thumbnailUrl`, `videoProvider="cloudinary"`, `mediaSource="maison"`,
   `mediaLicense="proprietary"`, `mediaStatus="approved"`.

---

## Engagement juridique

Cette stratégie respecte :
- Droit d'auteur (aucune copie sans licence).
- Droit à l'image (acteurs maison consentants par contrat).
- Conditions d'usage des plateformes tierces (pas de scraping,
  pas de hotlink hors API autorisée).
- Conditions de revente SaaS (chaque média intégré supporte la
  redistribution commerciale via TrackCoach).

**Validation finale obligatoire** avant intégration de toute source
tierce : revoir la licence, archiver une copie écrite du consentement /
des conditions, attribuer si requis.
