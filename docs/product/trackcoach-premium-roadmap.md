# TrackCoach Premium — Roadmap produit

> Architecture produit cible TrackCoach. Pilotée pour devenir un SaaS
> revendable, pas une app interne City Coaching. Décisions opposables.

---

## Vision

TrackCoach est **l'OS de coaching sportif moderne** :
- Coach pilote 50+ adhérents sans effort cognitif inutile.
- Adhérent suit un programme personnalisé sans demander une seule fois
  « qu'est-ce que je fais aujourd'hui ? ».
- IA génère, surveille, alerte, pré-rédige.
- Médias premium (vidéos, animations, fallback haut de gamme).
- White-label compatible dès la V1 (architecture, pas UI).

---

## Modules

### 1. Coach Cockpit

| Bloc | V1 | V2 |
|---|---|---|
| Adhérents actifs vs silencieux | ✅ Sprint 3 | — |
| Compliance hebdo (séances faites / prescrites) | 🚧 Sprint 4 | — |
| Séances à reviewer | ✅ | — |
| Programmes IA en attente de validation | 🚧 Sprint 4 | — |
| Alertes intelligentes (stagnation, surcharge, décrochage) | 🚧 Sprint 4 | — |
| Graph progression globale salle | — | V2 |
| Multi-coachs / multi-salles | — | V2 (white-label) |

### 2. Adherent App

| Bloc | V1 | V2 |
|---|---|---|
| Onboarding premium | 🚧 Sprint 4 | — |
| Découverte programmes catalogue | ✅ Sprint 3 | — |
| Auto-assign | ✅ Sprint 3 | — |
| Programme actif + séance du jour | ✅ | — |
| Logging rapide (Hevy-style) | ✅ Sprint 3 | — |
| Mode séance focus plein écran (swipe) | 🚧 Sprint 4 | — |
| Timer repos | ✅ | — |
| Remplacement exercice IA | 🚧 Sprint 4 | — |
| Historique + PR + graphiques | ✅ | — |
| Feedback coach reçu | ✅ | — |
| Demande aide coach (chat) | — | V2 |

### 3. AI Program Generator

| Capacité | V1 |
|---|---|
| Génération à partir d'objectif/niveau/fréquence/équipement/restrictions | ✅ Sprint 4 |
| Validation slugs vs `ExerciseLibrary` (anti-hallucination) | ✅ |
| Sauvegarde Programme/Week/Session/SessionExercise/ClientProgramme | ✅ |
| Logging coût + latence + modèle | ✅ Sprint 4 |
| Refus si profil à risque (douleur invalidante, condition médicale) | ✅ Sprint 4 |
| Fallback offline si `ANTHROPIC_API_KEY` absent | ✅ Sprint 4 |

### 4. AI Exercise Replacement

| Capacité | V1 |
|---|---|
| Bouton "Remplacer" en séance | ✅ Sprint 4 |
| Raison (matériel / douleur / niveau / préférence) | ✅ |
| Suggestion 3 alternatives + justification | ✅ |
| Sauvegarde du remplacement (override sur SessionExercise) | ✅ |

### 5. AI Coach Review

| Capacité | V1 |
|---|---|
| Pré-rédaction message coach après séance | ✅ Sprint 4 |
| Détection surcharge (RPE > 9 répété) | ✅ |
| Détection stagnation (perf plateau 3 séances) | V2 |
| Détection décrochage (>14j inactif) | ✅ Sprint 3 |
| Coach valide / modifie / envoie | ✅ |

### 6. Exercise Media Library

| Capacité | V1 |
|---|---|
| Champs DB enrichis (type, source, license, status) | ✅ Sprint 4 |
| Composant `ExerciseMediaPlayer` (image/GIF/MP4/YouTube) | ✅ Sprint 4 |
| Fallback premium silhouette anatomique | ✅ Sprint 4 |
| Statut média visible côté coach | ✅ Sprint 4 |
| Validation média par coach | ✅ Sprint 4 |
| Tournage maison Cloudinary | V2 |

### 7. Program Builder Pro

| Capacité | V1 |
|---|---|
| Layout 3 zones (lib / builder / résumé) | ✅ existant |
| Ajout rapide depuis bibliothèque | ✅ existant |
| Duplication séance / semaine | ✅ existant (Sprint 2) |
| DnD complet | V2 |

### 8. Workout Execution Mode

| Capacité | V1 |
|---|---|
| Mode liste (Hevy-style) | ✅ Sprint 3 |
| Mode focus plein écran (swipe exercice par exercice) | ✅ Sprint 4 |
| Affichage média exercice | ✅ Sprint 4 |
| Timer repos visible | ✅ |

### 9. Progress Intelligence

| Capacité | V1 |
|---|---|
| Volume hebdo + PR + RPE moyen + streak | ✅ Sprint 3 |
| Compliance par adhérent | ✅ Sprint 4 |
| Stagnation par exercice | V2 |
| Heatmap muscles travaillés | V2 |

### 10. SaaS / White-label

| Capacité | V1 |
|---|---|
| Architecture compatible multi-tenant | ✅ (User.role + Client.praticienId) |
| Branding par salle (logo, couleurs) | V2 |
| Plan d'abonnement coach | ✅ partial (Stripe schema) |
| Onboarding nouvelle salle self-serve | V3 |

---

## Phases livrables

### Sprint 4 — Premium Autonomous OS (CE SPRINT)

**Objectif :** Faire passer TrackCoach de "app correcte" à "app premium".

Livrables :
1. Schema Prisma : champs média + audit IA (migration versionnée).
2. `src/lib/ai/` : architecture IA propre (client, schemas, safety, cost).
3. Onboarding adhérent premium (5 étapes visuelles).
4. API `/api/adherent/ai/generate-program` : génération autonome
   adhérent + sauvegarde DB + assignment.
5. Composant `ExerciseMediaPlayer` premium.
6. API `/api/adherent/ai/replace-exercise` : remplacement IA.
7. API `/api/coach/ai/review-session` : pré-rédaction retour coach.
8. API `/api/coach/cockpit` enrichi : compliance + IA pending +
   alertes intelligentes.
9. Mode séance focus (`/adherent/seance/focus`) plein écran swipeable.
10. Bibliothèque exercices premium (filtres + drawer + statut média).

### Sprint 5 — Tournage maison + tags clients (V2)

- Tournage 43 exercices fondamentaux Cloudinary.
- Tags clients (segmentation cockpit).
- Streaks visuels.
- Stagnation par exercice (graphique).

### Sprint 6 — White-label (V2)

- Branding par tenant (logo, couleurs, nom salle).
- Multi-coachs par salle.
- Onboarding nouvelle salle self-serve.

### Sprint 7 — Moteur fatigue + heatmap (V3)

- Modèle fatigue par groupe musculaire (récupération 48-72h).
- Heatmap muscles travaillés sur 7/14/30j.
- Recommandation séance du jour basée historique.

---

## Critère de réussite Sprint 4

**Adhérent peut, sans assistance coach :**
1. Recevoir un accès, se connecter.
2. Faire un onboarding visuel premium en < 90s.
3. Générer un programme IA personnalisé (ou choisir un template catalogue).
4. Voir le programme assigné automatiquement.
5. Démarrer la séance du jour en mode focus plein écran.
6. Voir l'exercice avec média ou fallback premium.
7. Logger ses séries en < 3 taps.
8. Demander un remplacement IA si machine prise / douleur.
9. Terminer la séance, voir le résumé.
10. Recevoir un retour coach (pré-rédigé par IA, validé par coach).

**Coach peut :**
1. Voir cockpit avec compliance, alertes IA, programmes à valider.
2. Valider / ajuster / refuser un programme IA généré.
3. Pré-générer un retour de séance par IA, le modifier, l'envoyer.
4. Gérer la bibliothèque exercices avec statut média.
5. Construire ses propres programmes (existant).
6. Réviser les séances réalisées (existant).

---

## Sécurité IA

- `ANTHROPIC_API_KEY` côté serveur uniquement, jamais exposée client.
- Validation Zod stricte avant sauvegarde DB.
- Refus si profil adhérent contient mot-clé risque
  (`douleur aiguë`, `chirurgie récente`, `cardiopathie`).
- Cap 16k tokens par requête.
- Logging coût/latence/modèle dans table `AiUsageLog`.
- Aucune génération si `safetyCheck` échoue → fallback "RDV coach".

---

## Sécurité données

- Aucun secret dans le code.
- Toutes les routes IA passent par `requireCoach` ou `requireAdherent`.
- Aucun hard delete sur `ExerciseLibrary` (soft delete via `isActive`).
- Migration versionnée Prisma, jamais `db push` direct.
- Backup DB préalable à toute migration impactant des données existantes.
