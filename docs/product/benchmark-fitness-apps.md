# Benchmark Fitness Apps — TrackCoach / City Coaching

> Synthèse interne en vue de PR 2D et suivantes.
> Objectif : poser les standards UX/produit que la plateforme doit tenir
> avant de construire les écrans métier (builder, séance du jour, dashboard).
> On ne copie pas les interfaces. On retient les standards fonctionnels.

---

## 1. TrueCoach

**Positionnement :** outil de coachs personnels et petits studios, fort sur la
relation 1‑à‑1 et la livraison de programmes premium.

**À retenir :**
- Workout builder propre, par séance, avec séries / reps / charge / repos /
  notes coach et vidéo associée.
- Bibliothèque vidéo centrale réutilisable, indexée par muscle et équipement.
- Suivi client riche : logs, photos, mensurations, messages.
- Compliance tracking : *X séances faites cette semaine sur Y prescrites*.
- Messaging intégré coach ↔ adhérent, avec accusés de lecture.
- Branding personnalisable (logo + couleurs) — ouvre la voie au white‑label.
- Stripe pour paiements, packs de séances, abonnements.

**Standard à tenir :** un coach doit pouvoir « voir » sa salle en un coup
d'œil — qui suit, qui décroche, qui a séance aujourd'hui — sans cliquer
plus de deux fois.

---

## 2. ABC Trainerize

**Positionnement :** plateforme massive (50k+ coachs), large couverture
(workout, nutrition, habitudes, badges).

**À retenir :**
- AI workout builder (génère un programme à partir d'objectifs, niveau,
  équipements). Référence pour PR 5+ — pas pour maintenant.
- Programmes personnalisés combinables avec routines hebdomadaires.
- Tracking nutrition couplé aux objectifs caloriques.
- Habits / streaks pour rétention longue durée.
- Tags clients (segmentation : `débutant`, `prépa marathon`, `post‑bébé`…).
- Scheduling séances + rappels automatisés.
- Branded app (white‑label sous le nom de la salle).

**Standard à tenir :** la donnée client doit être segmentable. Tout client
doit pouvoir porter des tags exploitables (filtres, dashboard, exports).

---

## 3. Everfit *(référence n°1 pour le builder)*

**Positionnement :** outil moderne plébiscité pour son builder en 3 zones,
probablement la meilleure UX de programmation actuelle.

**À retenir — c'est la cible UX du PR 4 :**
- Layout 3 colonnes :
  - **Gauche** : bibliothèque d'exercices, filtrable (muscle, équipement,
    niveau, vidéo / pas vidéo, tags).
  - **Centre** : builder de séance, drag‑and‑drop, ajout rapide, supersets,
    duplication de blocs.
  - **Droite** : panneau planning / organisation (semaines, séances,
    placement dans le calendrier).
- Filtres rapides en chip (toggle multi‑select).
- Réutilisation : on construit une séance type une fois, on la déplace.
- Actions clavier (delete, duplicate, undo).

**Standard à tenir :** un coach équipé doit pouvoir construire une semaine
complète (4 séances, ~6 exercices chacune) en moins de 10 minutes.

---

## 4. Hevy / Strong *(référence n°1 pour la séance du jour adhérent)*

**Positionnement :** apps de logging mobile, ultra‑rapides, taillées pour
l'usage *pendant* l'entraînement, pas avant ni après.

**À retenir — c'est la cible UX du PR 5 :**
- Une vue par séance, liste d'exercices verticale.
- Par exercice : tableau série / reps / charge / RPE / coche `done`.
- Auto‑remplissage de la série précédente pour aller vite.
- Timer de repos automatique au tap sur `done`.
- PR (Personal Record) flaggé en évidence.
- Historique exercice : graphique simple charge × temps.
- Routines : copier la séance du jour pour la prochaine fois.
- Tap targets larges, pensés pour des doigts moites.

**Standard à tenir :** la séance du jour doit fonctionner mobile, hors‑ligne,
en moins de 3 taps pour logger une série.

---

## 5. Fitbod *(cible plus tardive — PR 7+)*

**Positionnement :** algorithmique. Génère la séance du jour à partir de
l'historique, de la fatigue par muscle, de l'équipement disponible.

**À retenir :**
- Modèle de fatigue par groupe musculaire (récupération attendue 48–72h).
- Adaptation des charges en fonction de la performance précédente
  (deload auto si raté, progression auto si validé propre).
- Recommandations d'exercices alternatifs si l'équipement manque.

**Standard à tenir (différé) :** notre `WorkoutLog` + `WorkoutSetLog` doivent
suffire à alimenter ce moteur le jour venu — c'est le cas (RPE,
`actualLoad`, `actualReps` déjà capturés).

---

## 6. My PT Hub

**Positionnement :** outil coach UK très complet, orienté reporting.

**À retenir :**
- Personal Bests automatisés (max load, max reps, volume séance).
- Reporting hebdomadaire export client (PDF email).
- Habitudes côté nutrition + sommeil.
- Vue progress photos avant/après.

**Standard à tenir :** le coach doit pouvoir générer un rapport client
synthétique (1 page) à la demande. À cibler en PR 7.

---

## Décisions produit pour TrackCoach / City Coaching

### Ce qu'on fait maintenant (PR 2D)

- **Design system premium** — couleurs sport sobres, typo Inter, radius
  16/20px, shadows discrets, accent vert sport unique sur fond sombre.
- **Layout coach premium** — sidebar fixe, topbar contextuelle, container
  large, états vides travaillés.
- **Layout adhérent mobile-first** — bottom navigation, container étroit,
  CTA gros doigts, header compact.
- **Composants UI réutilisables** — `Card`, `Button`, `Badge`, `Input`,
  `Select`, `Textarea`, `Modal`, `EmptyState`, `LoadingState`, `ErrorState`,
  `StatCard`, `ProgressCard`, `PageHeader`, `Chip`.
- **Seed bibliothèque exercices** — 40+ exercices fondamentaux, CLI.

### Ce qu'on garde pour plus tard

- **PR 3** : interface admin de la bibliothèque d'exercices (search,
  filtres muscle/niveau/équipement, archivage soft, fiches détaillées).
- **PR 4** : builder programme 3 zones inspiré Everfit.
- **PR 5** : séance du jour adhérent inspirée Hevy / Strong (timer repos,
  PR, log rapide).
- **PR 6** : dashboard coach intelligent (compliance, alertes, séances du
  jour, clients silencieux).
- **PR 7** : tracking avancé, rapports, personal bests, exports.
- **PR 8** : white‑label / multi‑salle / branding par tenant.

### Ce qu'on refuse

- ❌ Dashboards décoratifs avec graphiques sans signal (vanity charts).
- ❌ Builder pauvre type formulaire à plat — Everfit ou rien.
- ❌ UI admin générique « Bootstrap 2017 ».
- ❌ Interface adhérent qui ressemble à un back‑office.
- ❌ Séance du jour qui demande plus de 3 taps pour logger une série.
- ❌ Logique sportive superficielle (ignorer RPE, fatigue, progression).
- ❌ AI gimmick sans données (pas de génération avant d'avoir l'historique).
- ❌ Mock de données métier pour faire joli — états vides assumés et
  travaillés à la place.

---

## UX premium — règles transverses

1. **Densité maîtrisée.** Un écran ne montre que ce qui sert *cette*
   action. Le reste est à un clic.
2. **Action primaire évidente.** Une seule par écran, contraste fort,
   coin haut‑droit ou flottante mobile.
3. **États vides racontent.** Toujours une explication + un CTA, jamais
   un *« No data »*.
4. **Hiérarchie typographique stricte.** `display` → `title` → `heading`
   → `body` → `caption`. Pas d'autres tailles ad‑hoc.
5. **Couleur sémantique constante.** Vert = succès / brand, ambre =
   attention, rouge = danger, bleu = info, violet/orange = catégorie. On
   ne mélange jamais.
6. **Feedback immédiat.** Toute action a une transition < 200ms.
7. **Mobile = first.** Tout flux adhérent doit fonctionner pouce droit
   uniquement.
8. **Accessibilité.** Contraste AA, focus visible, tap target ≥ 44px.

---

## Standards de nommage

- **Coach** : « espace coach », pas « admin », pas « back‑office ».
- **Adhérent** : « adhérent » (jamais « client » côté UI adhérent).
- **Programme** : structure (semaines + séances + exercices prescrits).
- **Séance** : unité d'entraînement réelle exécutée par l'adhérent.
- **Exercice** : prescription dans une séance (vs `ExerciseLibrary` =
  référentiel).
- **PR** : Personal Record (à ne pas confondre avec Pull Request 😅).

---

*Doc tenu à jour à chaque PR produit majeur.*
