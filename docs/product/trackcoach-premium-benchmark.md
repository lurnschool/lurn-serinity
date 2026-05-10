# TrackCoach Premium — Benchmark massif

> Audit produit pour calibrer TrackCoach au niveau des meilleures apps fitness
> du marché. Aucune copie d'UI, on retient des **standards fonctionnels**.
> Doc tenu à jour par l'équipe produit. Livrable opérationnel : décisions GO /
> NO-GO en bas de chaque section, pas de blabla.

---

## 1. TrueCoach — référence coach 1-à-1

**Positionnement.** Outil pour coachs personnels et petits studios, fort sur la
relation 1-à-1, la livraison de programmes premium, la messagerie.

**Standards fonctionnels :**
- Builder par séance : séries / reps / charge / repos / notes coach + vidéo.
- Bibliothèque vidéo centrale, indexée par muscle et équipement.
- Suivi client : logs, photos, mensurations, messages.
- Compliance tracking : *X séances faites cette semaine sur Y prescrites*.
- Messaging coach ↔ adhérent avec accusés de lecture.
- Branding personnalisable (logo + couleurs) → ouvre la voie au white-label.
- Stripe pour paiements, packs de séances, abonnements.

**Ce qu'on reprend** : compliance hebdo, fiche client riche, branding par tenant.
**Ce qu'on refuse** : messagerie temps réel pour V1 (coût UX/infra) — on
pré-rédige les retours coach par IA à la place.
**GO** : compliance + retour coach IA. **NO-GO V1** : messagerie chat.

---

## 2. ABC Trainerize — plateforme massive

**Positionnement.** 50k+ coachs. Workout, nutrition, habitudes, badges.

**Standards fonctionnels :**
- AI workout builder à partir d'objectifs / niveau / équipement.
- Programmes personnalisés combinables avec routines hebdomadaires.
- Tracking nutrition (objectifs caloriques).
- Habits / streaks pour rétention longue durée.
- Tags clients (segmentation : `débutant`, `prépa marathon`, `post-bébé`…).
- Scheduling séances + rappels automatisés.
- Branded app (white-label sous le nom de la salle).

**Ce qu'on reprend** : AI builder (priorité 1), tags clients, streaks.
**Ce qu'on refuse** : nutrition complète V1 — trop coûteux pour la valeur sur
notre cible. On garde tour de taille / poids / objectifs.
**GO** : AI builder, tags, streak, white-label compatible. **NO-GO V1** :
tracking nutrition complet.

---

## 3. Everfit — référence builder

**Positionnement.** Meilleure UX de programmation actuelle, plébiscite des
coachs « modernes ».

**Standards fonctionnels — cible directe du Program Builder Pro :**
- Layout 3 colonnes :
  - **Gauche** : bibliothèque d'exercices, filtrable (muscle, équipement,
    niveau, vidéo / pas vidéo, tags).
  - **Centre** : builder de séance, drag-and-drop, ajout rapide, supersets,
    duplication de blocs.
  - **Droite** : panneau planning / organisation (semaines, séances,
    placement dans le calendrier).
- Filtres rapides en chip (toggle multi-select).
- Réutilisation : on construit une séance type une fois, on la déplace.
- Actions clavier (delete, duplicate, undo).

**Ce qu'on reprend** : layout 3 zones, chips filtres, duplication,
ajout rapide. **Ce qu'on refuse en V1** : drag-and-drop natif HTML5
(complexité tactile / accessibilité). On livre d'abord un **ajout rapide
premium** puis DnD en V2.
**GO** : 3 zones + ajout rapide. **NO-GO V1** : DnD complet.

---

## 4. Hevy / Strong — référence séance du jour

**Positionnement.** Apps de logging mobile, ultra-rapides, taillées pour
l'usage *pendant* l'entraînement.

**Standards fonctionnels — cible Workout Execution Mode :**
- Une vue par séance, liste d'exercices verticale.
- Par exercice : tableau série / reps / charge / RPE / coche `done`.
- Auto-remplissage de la série précédente pour aller vite.
- Timer de repos automatique au tap sur `done`.
- PR (Personal Record) flaggé en évidence.
- Historique exercice : graphique simple charge × temps.
- Routines : copier la séance du jour pour la prochaine fois.
- Tap targets larges, pensés pour des doigts moites.

**Ce qu'on reprend** : tout. C'est notre base. **On ajoute** : mode focus
plein écran exercice par exercice (swipe), le mode liste reste accessible.
**GO** : déjà partiellement livré (Sprint 3). Sprint actuel = mode focus
swipeable plein écran.

---

## 5. Fitbod — référence IA adaptative

**Positionnement.** Algorithmique. Génère la séance du jour à partir de
l'historique, de la fatigue par muscle, de l'équipement disponible.

**Standards fonctionnels :**
- Modèle de fatigue par groupe musculaire (récupération attendue 48-72h).
- Adaptation des charges en fonction de la performance précédente
  (deload auto si raté, progression auto si validé propre).
- Recommandations d'exercices alternatifs si l'équipement manque.

**Ce qu'on reprend maintenant** : remplacement d'exercice par IA selon
matériel / douleur / niveau (livré dans ce sprint).
**Ce qu'on garde pour plus tard** : moteur de fatigue par muscle (V2 — on a
déjà la donnée RPE + actualLoad, le moteur viendra quand on aura assez
d'historique pour calibrer).
**GO V1** : remplacement IA. **GO V2** : moteur fatigue.

---

## 6. JEFIT — référence catalogue

**Positionnement.** Catalogue exercices massif, social, instructions
détaillées.

**Standards fonctionnels :**
- Catalogue >1300 exercices avec animations.
- Fiches détaillées : muscles primaires/secondaires, équipement,
  instructions étape par étape, erreurs courantes.
- Plans préconçus filtrables (objectif, durée, niveau).
- Stats long terme (poids x temps, volume).

**Ce qu'on reprend** : structure de fiche exercice (instructions, erreurs
courantes, contre-indications) — déjà dans `ExerciseLibrary`. **Ce qu'on
refuse** : volet social / leaderboard public V1.
**GO** : enrichir les fiches existantes via IA.

---

## 7. MuscleWiki — référence pédagogique

**Positionnement.** Site/app gratuit, GIF d'exercices avec acteur, muscles
ciblés visualisés sur silhouette anatomique.

**Standards fonctionnels :**
- GIF court boucle d'un acteur réel exécutant l'exercice (haute valeur péda).
- Sélecteur muscle anatomique pour découvrir des exercices.
- Filtres équipement / type / muscle.

**Décision média** : voir `exercise-media-strategy.md`. **NO-GO sur le
hotlinking ou la copie de leurs GIF** (zone juridique grise pour une app
revendable). On benchmark, on ne copie pas.

---

## 8. Wger — référence open-source

**Positionnement.** App fitness open-source, base de données d'exercices
sous licence CC-BY-SA.

**Standards fonctionnels :**
- API REST publique, gratuite, documentée.
- ~400 exercices avec descriptions, muscles, équipement.
- Images parfois disponibles, qualité variable.

**Décision média** : **GO comme source d'amorçage** (texte + images
compatibles avec CC-BY-SA, attribution requise). Détails dans
`exercise-media-strategy.md`. **Limite** : qualité hétérogène, à compléter
par tournage maison.

---

## 9. ExerciseDB / RapidAPI — option commerciale

**Positionnement.** API payante listant ~1300 exercices avec GIF.

**Standards fonctionnels :**
- ~1300 exercices, GIF inclus, search par muscle/équipement.
- Tarif : freemium puis ~10-30 $/mois selon volume.

**Décision** : **NO-GO pour l'instant**. Licence ambiguë (les GIF
proviennent souvent de tiers sans garantie de droits revendables) +
dépendance à un acteur unique. À reconsidérer si on a besoin de combler
rapidement avant tournage maison, et seulement si on obtient une licence
écrite explicite. **NO-GO V1**.

---

## 10. Mixamo / Sketchfab / mocap — option 3D

**Positionnement.** Banques d'animations 3D, certaines gratuites pour usage
commercial (Mixamo Adobe).

**Standards fonctionnels :**
- Personnages 3D animés exécutant des mouvements.
- Format FBX / GLB exportable.
- Mixamo : licence Adobe, gratuite, usage commercial autorisé sur projets
  portant l'animation (à valider précisément cas par cas).

**Décision** : **GO V2** (premium long terme). Permet d'avoir une animation
3D propriétaire par exercice, sans tournage. Coût implémentation ~3-5
semaines (rig + retargeting + rendu vers MP4 ou viewer Three.js). **NO-GO
V1** : trop lourd. **GO V2 / V3** quand on aura validé le marché.

---

## 11. Tournage maison City Coaching — option premium recommandée

**Positionnement.** Vidéos propriétaires, droits 100% TrackCoach, qualité
contrôlée.

**Standards fonctionnels :**
- 43 exercices fondamentaux à tourner (couvre 80% des besoins).
- Format vertical 9:16 + horizontal 16:9 pour fallback.
- Loop court 4-6s ou démo complète 15-20s.
- Stockage : Cloudinary (CDN, transformations, formats).

**Décision** : **GO** comme socle long terme. Workflow : 1 demi-journée de
tournage avec un coach + 1 caméraman → 43 vidéos + thumbnails. Coût ~800-
1500 €. À déclencher après validation modèle économique.
**GO V2** dès que budget validé.

---

## 12. Génération IA vidéo / 3D

**Décision** : **NO-GO V1 et V2**. Risque biomécanique (formes incorrectes,
mauvais signal péda). On ne ferait pas confiance à un coach généré IA pour
montrer un soulevé de terre. À reconsidérer dans 18-24 mois si la
qualité dépasse le seuil de validation coach humain.

---

## Décision média finale

**Stratégie en 3 couches :**

1. **Couche 1 — fallback premium (LIVRÉ MAINTENANT)** :
   silhouette anatomique stylée + nom muscle + équipement. Aucun emoji
   cheap. Aucune dépendance externe. Toujours dispo.

2. **Couche 2 — amorçage open-source (À AMORCER)** :
   intégration Wger pour 100-150 exercices (texte + images CC-BY-SA),
   attribution dans la fiche.

3. **Couche 3 — tournage maison (GO V2)** :
   43 vidéos propriétaires Cloudinary, déclenchée après validation
   économique. Architecture média prête à recevoir les fichiers
   (champs DB + composant `ExerciseMediaPlayer` capable de lire image,
   GIF, MP4, YouTube).

**Aucun hotlink. Aucun scraping. Aucun GIF non sourcé.**

---

## UX premium — règles transverses

1. **Densité maîtrisée.** Un écran ne montre que ce qui sert *cette* action.
2. **Action primaire évidente.** Une seule par écran, contraste fort.
3. **États vides racontent.** Toujours explication + CTA, jamais "No data".
4. **Hiérarchie typographique stricte.** display → title → heading → body.
5. **Couleur sémantique constante.** Vert = succès / brand, ambre =
   attention, rouge = danger, bleu = info, violet = catégorie.
6. **Feedback immédiat.** Toute action a une transition < 200ms.
7. **Mobile = first.** Tout flux adhérent fonctionne pouce droit uniquement.
8. **Accessibilité.** Contraste AA, focus visible, tap target ≥ 44px.

---

## Standards de nommage

- **Coach** : « espace coach », pas « admin », pas « back-office ».
- **Adhérent** : « adhérent » (jamais « client » côté UI adhérent).
- **Programme** : structure (semaines + séances + exercices prescrits).
- **Séance** : unité d'entraînement réelle exécutée par l'adhérent.
- **Exercice** : prescription dans une séance (vs `ExerciseLibrary`
  = référentiel).
- **PR** : Personal Record.
