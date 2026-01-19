# Roadmap UX - English Practice App

## Vue d'ensemble

Plan d'implémentation des améliorations UX, organisé par catégorie d'impact.

**Légende des statuts :**
- [ ] À faire
- [x] Terminé
- [~] En cours

---

## Phase 1 : Quick Wins (Impact Élevé / Effort Faible)

### 1.0 Mode Correction (Toggle) ✅
> Basculer entre mode conversation naturelle et mode correction explicite

**Objectif :** Permettre à l'utilisateur de choisir entre une conversation fluide ou des corrections détaillées

**Implémentation terminée :**
- [x] Ajout state `correctionMode` dans page.tsx
- [x] Toggle dans la sidebar (icône MessageCircle/PenLine)
- [x] Indicateur de mode sur mobile (header) et desktop (panneau VoiceOrb)
- [x] Passage du mode à l'API via `body: { correctionMode }`
- [x] Deux system prompts distincts dans route.ts

**Deux modes disponibles :**

| Mode | Icône | Couleur | Comportement |
|------|-------|---------|--------------|
| Conversation | `MessageCircle` | Bleu | Corrections subtiles (méthode "sandwich") |
| Correction | `PenLine` | Orange | Corrections explicites avec format structuré |

**Format Mode Correction :**
```
You said: "I go to the cinema yesterday"
Correct form: "I went to the cinema yesterday"
Why: Use past tense 'went' for actions that happened in the past.
```

**Fichiers modifiés :**
- `src/app/page.tsx` - UI toggle et state
- `src/app/api/chat/route.ts` - Dual system prompts

---

### 1.1 Corrections Inline (Visuel) ✅
> Affichage visuel des corrections avec mise en forme (rouge barré → vert)

**Objectif :** Amélioration visuelle du mode Correction avec highlighting

**Prérequis :** Mode Correction (1.0) ✅

**Implémentation terminée :**
- [x] Parser les corrections avec regex ("You said" / "Correct form" / "Why")
- [x] Composant `CorrectionHighlight` créé
- [x] Texte erroné en ~~rouge barré~~
- [x] Texte correct en **vert**
- [x] Explication "Why" en texte italique gris
- [x] **Actif uniquement en Correction Mode** (pas en Conversation Mode)
- [x] Border orange à gauche pour distinguer les blocs de correction

**Exemple visuel :**
```
┃ I go → I went
┃ Use past tense for actions in the past.
```

**Fichiers créés/modifiés :**
- `src/components/CorrectionHighlight.tsx` - Nouveau composant
- `src/app/page.tsx` - Intégration conditionnelle

---

### 1.2 Mobile Responsive ✅
> Adapter le layout pour mobile et tablette

**Objectif :** Permettre l'utilisation sur smartphone

**Todolist :**
- [x] Créer un layout mobile avec sidebar en drawer/bottom sheet
- [x] Cacher le panneau VoiceOrb sur mobile (ou le réduire en header)
- [x] Adapter la taille des boutons pour le touch (min 44px)
- [x] Tester sur différentes tailles d'écran (320px, 375px, 414px)
- [x] Ajouter un bouton hamburger pour ouvrir la sidebar
- [x] Optimiser le clavier virtuel (input qui ne se cache pas)

**Breakpoints :**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

### 1.3 Suggestions de Réponses ✅
> Boutons cliquables pour répondre rapidement

**Objectif :** Réduire la friction, aider les débutants

**Implémentation terminée :**
- [x] Modifier les system prompts pour générer 2-3 suggestions par réponse
- [x] Parser les suggestions avec le marqueur `---SUGGESTIONS---`
- [x] Afficher les suggestions comme boutons cliquables ("Try: ...")
- [x] Au clic, envoyer la suggestion comme message utilisateur
- [x] Masquer les suggestions quand l'utilisateur commence à taper
- [x] TTS utilise le texte nettoyé (sans le marqueur)

**Format utilisé :**
```
[Message de l'IA]

---SUGGESTIONS---
I'm fine, thank you!|Not so good today.|Great, thanks!
```

**Fichiers modifiés :**
- `src/app/api/chat/route.ts` - Instructions dans les system prompts
- `src/app/page.tsx` - Parsing et affichage des chips

---

### 1.4 Contrôle de Vitesse TTS ✅
> Boutons pour ajuster la vitesse de lecture

**Objectif :** Adapter à différents niveaux de compréhension

**Implémentation terminée :**
- [x] State `speechRate` avec valeur par défaut 0.9
- [x] Trois boutons : Slow (0.7x), Normal (0.9x), Fast (1.2x)
- [x] Contrôle dans la sidebar (visible quand Voice ON)
- [x] Préférence sauvegardée dans localStorage
- [x] Rate appliqué à `SpeechSynthesisUtterance`

**Fichiers modifiés :**
- `src/app/page.tsx` - State, localStorage, UI buttons

---

## Phase 1.5 : Amélioration de l'IA (Impact Élevé / Effort Moyen)

### 1.5.1 Corrections Formatées pour Affichage
> L'IA retourne les corrections dans un format parseable

**Objectif :** Permettre l'affichage inline des corrections (lié à 1.1)

**Todolist :**
- [ ] Modifier le system prompt pour formater les corrections :
  ```
  When correcting, use this format:
  [CORRECT: "wrong phrase" → "correct phrase" | RULE: explanation]
  ```
- [ ] Parser les corrections côté frontend avec regex
- [ ] Stocker les corrections pour statistiques
- [ ] Tester avec différents types d'erreurs

**Exemple de sortie IA :**
```
That's interesting! [CORRECT: "I go yesterday" → "I went yesterday" | RULE: Use past tense for completed actions]
So you went to the cinema. What movie did you see?
```

---

### 1.5.2 Niveau Adaptatif ✅
> System prompt dynamique selon le niveau

**Objectif :** Adapter le langage et la complexité au niveau de l'utilisateur

**Implémentation terminée :**
- [x] Créer 3 variantes du system prompt (beginner, intermediate, advanced)
- [x] Ajouter le niveau dans le body de la requête API
- [x] Modifier `/api/chat/route.ts` pour utiliser le bon prompt
- [x] Sauvegarder le niveau en localStorage
- [x] UI : sélecteur dans la sidebar
- [x] Indicateurs de niveau sur desktop et mobile
- [x] Synchronisation avec le profil DB

**System Prompts par niveau :**

| Niveau | Vocabulaire | Grammaire | Ton |
|--------|-------------|-----------|-----|
| Beginner | 500-1000 mots courants | Présent surtout | Très encourageant |
| Intermediate | Vocabulaire quotidien + idiomes | Tous les temps | Équilibré |
| Advanced | Riche, idiomes, nuances | Structures complexes | Challengeant |

**UI :**
- Sélecteur 3 boutons dans la sidebar (Beginner / Inter. / Advanced)
- Badge coloré sur desktop (vert/jaune/rouge)
- Lettre indicatrice sur mobile (B/I/A)

**Fichiers modifiés :**
- `src/app/api/chat/route.ts` - LEVEL_PROMPTS + injection
- `src/app/page.tsx` - State, sélecteur, indicateurs

---

### 1.5.3 Nouveaux Outils IA
> Étendre les capacités du professeur

**Objectif :** Enrichir l'expérience d'apprentissage

**Todolist :**
- [ ] **grammarExplain** : Expliquer une règle de grammaire en détail
  ```typescript
  grammarExplain: tool({
    description: "Explain a grammar rule when student asks or makes repeated errors",
    inputSchema: z.object({
      rule: z.string(), // "past_simple", "articles", "prepositions"
      context: z.string() // The sentence that triggered it
    }),
    execute: async ({ rule, context }) => { ... }
  })
  ```
- [ ] **pronunciationTip** : Donner des conseils de prononciation
  ```typescript
  pronunciationTip: tool({
    description: "Give pronunciation tips for tricky words",
    inputSchema: z.object({
      word: z.string(),
    }),
    execute: async ({ word }) => {
      // Return IPA, similar sounds, common mistakes
    }
  })
  ```
- [ ] **synonymSuggest** : Suggérer des synonymes pour enrichir le vocabulaire
- [ ] **culturalNote** : Expliquer les différences culturelles (UK vs US)

---

### 1.5.4 Paramètres de Génération
> Ajuster temperature, maxTokens, etc.

**Objectif :** Optimiser la qualité et la cohérence des réponses

**Todolist :**
- [ ] Ajouter `temperature` configurable (défaut: 0.7)
- [ ] Ajouter `maxTokens` pour limiter les réponses longues (défaut: 300)
- [ ] Tester différentes valeurs et documenter les résultats
- [ ] Option "mode créatif" (temperature: 1.2) pour les histoires
- [ ] Option "mode précis" (temperature: 0.3) pour les quiz

**Configuration recommandée :**
```typescript
// Conversation normale
{ temperature: 0.7, maxTokens: 300 }

// Quiz / Corrections
{ temperature: 0.3, maxTokens: 200 }

// Histoires / Role-play créatif
{ temperature: 1.0, maxTokens: 500 }
```

---

### 1.5.5 Mémoire Contextuelle ✅
> Se souvenir des sessions précédentes

**Objectif :** Personnaliser l'expérience au fil du temps

**Implémentation terminée :**
- [x] Table `user_profiles` créée (interests, common_errors, level, summary)
- [x] Fonctions DB : `getUserProfile`, `createOrUpdateProfile`, `generateProfileContext`
- [x] API endpoint `/api/profile` (GET/POST)
- [x] Injection du contexte dans le system prompt
- [x] Auto-tracking des intérêts (catégories sélectionnées)
- [x] Auto-increment du compteur de messages

**Schema DB :**
```sql
CREATE TABLE user_profiles (
  session_id UUID REFERENCES sessions(id),
  interests TEXT[],           -- ['conversation', 'travel']
  common_errors JSONB,        -- {"past_tense": 3, "articles": 2}
  level VARCHAR(20),          -- 'beginner' | 'intermediate' | 'advanced'
  summary TEXT,               -- AI-generated summary (future)
  total_messages INTEGER
);
```

**Injection dans le prompt :**
```
USER CONTEXT:
- Interests: conversation, travel
- Common errors: past_tense (3x), articles (2x)
- Level: beginner
- Total messages: 45

Focus on correcting past_tense errors when appropriate.
```

**Note :** Exécuter `/api/db/setup` pour créer la table.

**Fichiers créés/modifiés :**
- `src/lib/db.ts` - Types et fonctions
- `src/app/api/profile/route.ts` - Nouvel endpoint
- `src/app/api/db/setup/route.ts` - Nouvelle table
- `src/app/api/chat/route.ts` - Injection du contexte
- `src/app/page.tsx` - Tracking intérêts + sessionId

---

### 1.5.6 Choix du Modèle
> Permettre de changer de modèle IA

**Objectif :** Balance qualité/coût/vitesse

**Todolist :**
- [ ] Ajouter sélecteur de modèle dans les settings (admin only?)
- [ ] Supporter plusieurs modèles :
  - `gemini-2.0-flash` (défaut, gratuit, rapide)
  - `gemini-1.5-pro` (meilleur, payant)
  - `gemini-2.0-flash-thinking` (raisonnement, lent)
- [ ] Afficher le modèle actuel
- [ ] Logger l'usage par modèle pour le coût

---

## Phase 2 : Engagement & Gamification (Impact Élevé / Effort Moyen)

### 2.1 Streak Counter
> Compteur de jours consécutifs de pratique

**Objectif :** Encourager la pratique quotidienne

**Todolist :**
- [ ] Créer table `user_streaks` en DB (user_id, current_streak, last_practice_date, longest_streak)
- [ ] API endpoint `GET/POST /api/streak`
- [ ] Logique : si last_practice = hier → streak++, sinon streak = 1
- [ ] Composant `StreakBadge` dans la sidebar (🔥 5 jours)
- [ ] Animation quand le streak augmente
- [ ] Notification si le streak est en danger (pas de pratique aujourd'hui)

**Schema DB :**
```sql
CREATE TABLE user_streaks (
  id SERIAL PRIMARY KEY,
  session_id TEXT UNIQUE,
  current_streak INT DEFAULT 1,
  longest_streak INT DEFAULT 1,
  last_practice_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.2 Vocabulaire Appris
> Tracker les nouveaux mots découverts

**Objectif :** Montrer la progression, permettre la révision

**Todolist :**
- [ ] Créer table `vocabulary` (word, translation, context, learned_at, session_id)
- [ ] Modifier le system prompt pour que l'IA marque les mots nouveaux avec `**word**`
- [ ] Parser les messages pour extraire les mots en gras
- [ ] API endpoint `GET/POST /api/vocabulary`
- [ ] Composant `VocabularyPanel` (liste des mots avec leur contexte)
- [ ] Ajouter un onglet "Vocabulary" dans la sidebar
- [ ] Afficher le compteur "23 words learned"

---

### 2.3 Niveau de Difficulté
> Sélecteur Beginner / Intermediate / Advanced

**Objectif :** Adapter le langage de l'IA au niveau de l'utilisateur

**Todolist :**
- [ ] Ajouter un state `difficulty` (beginner, intermediate, advanced)
- [ ] Modifier le system prompt selon le niveau choisi
- [ ] Créer un sélecteur dans la sidebar ou à l'onboarding
- [ ] Sauvegarder la préférence dans localStorage
- [ ] Indicateur visuel du niveau actuel

**System prompts par niveau :**
- Beginner: phrases courtes, vocabulaire simple, beaucoup d'encouragements
- Intermediate: phrases normales, corrections détaillées
- Advanced: expressions idiomatiques, nuances, moins de corrections

---

### 2.4 Score de Session
> Points basés sur l'activité

**Objectif :** Gamifier l'expérience

**Todolist :**
- [ ] Définir le système de points :
  - Message envoyé: +10 pts
  - Message > 20 mots: +5 pts bonus
  - Utiliser une correction: +15 pts
  - Session > 5 min: +20 pts
- [ ] Créer un composant `SessionScore` (affichage en temps réel)
- [ ] Animation "+10" quand on gagne des points
- [ ] Sauvegarder le score total en DB
- [ ] Afficher le score dans le header ou la sidebar

---

## Phase 3 : Expérience Vocale (Impact Moyen / Effort Moyen)

### 3.1 Mode Conversation Continue
> Push-to-talk sans taper

**Objectif :** Expérience plus naturelle et immersive

**Todolist :**
- [ ] Ajouter un toggle "Conversation Mode" dans la sidebar
- [ ] En mode conversation : clic sur l'orbe = start listening
- [ ] Quand l'utilisateur arrête de parler → envoyer automatiquement
- [ ] Quand l'IA répond → TTS automatique
- [ ] Quand TTS finit → re-activer l'écoute (boucle)
- [ ] Bouton "Pause" pour interrompre la boucle
- [ ] Indicateur visuel clair de l'état (Listening → Processing → Speaking)

---

### 3.2 Feedback Prononciation
> Comparer ce que l'utilisateur dit vs ce qu'il voulait dire

**Objectif :** Améliorer la prononciation

**Todolist :**
- [ ] Afficher la transcription STT sous l'input
- [ ] Si l'utilisateur avait cliqué une suggestion, comparer
- [ ] Mettre en évidence les différences
- [ ] L'IA peut commenter : "I heard 'tree', did you mean 'three'?"
- [ ] Option "Repeat after me" avec comparaison

---

### 3.3 Choix de Voix/Accent
> British, American, Australian

**Objectif :** S'entraîner avec différents accents

**Todolist :**
- [ ] Lister les voix disponibles avec `speechSynthesis.getVoices()`
- [ ] Filtrer les voix anglaises (en-US, en-GB, en-AU)
- [ ] Créer un sélecteur dans les settings
- [ ] Sauvegarder la préférence
- [ ] Afficher le nom de l'accent actuel

---

### 3.4 Sous-titres Live
> Afficher le texte pendant que l'IA parle

**Objectif :** Associer son et écrit pour mieux apprendre

**Todolist :**
- [ ] Utiliser l'événement `boundary` de SpeechSynthesis
- [ ] Créer un composant `LiveSubtitles` (overlay sur l'orbe)
- [ ] Highlight le mot actuel pendant la lecture
- [ ] Style karaoké (mot par mot)
- [ ] Option pour activer/désactiver

---

## Phase 4 : Contenu Structuré (Impact Moyen / Effort Élevé)

### 4.1 Scénarios Guidés
> Leçons structurées par thème

**Objectif :** Apprentissage progressif et structuré

**Todolist :**
- [ ] Créer une structure de données pour les scénarios :
  ```ts
  interface Scenario {
    id: string;
    category: 'travel' | 'roleplay' | 'conversation' | 'quiz';
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    steps: ScenarioStep[];
  }
  ```
- [ ] Écrire 3 scénarios par catégorie (12 total)
- [ ] Créer une page `/scenarios` avec liste des scénarios
- [ ] Modifier le chat pour suivre les étapes du scénario
- [ ] Indicateur de progression dans le scénario
- [ ] Badge "Completed" quand terminé

**Exemples de scénarios :**
- Travel: "Checking in at the airport"
- Role Play: "Job interview for a developer position"
- Conversation: "Making small talk at a party"
- Quiz: "Common irregular verbs"

---

### 4.2 Flashcards
> Réviser le vocabulaire avec des cartes

**Objectif :** Ancrer le vocabulaire dans la mémoire

**Todolist :**
- [ ] Créer une page `/flashcards`
- [ ] Afficher les mots du vocabulaire en mode carte
- [ ] Interaction : tap pour révéler la traduction
- [ ] Système de révision espacée (Leitner ou SM-2)
- [ ] Marquer comme "Known" ou "Review again"
- [ ] Statistiques de révision

---

### 4.3 Grammar Tips
> Pop-ups contextuels sur les règles

**Objectif :** Enseigner la grammaire de manière contextuelle

**Todolist :**
- [ ] Créer une base de données de règles grammaticales
- [ ] Quand l'IA corrige, ajouter un lien "Why?"
- [ ] Au clic, afficher un modal avec l'explication
- [ ] Exemples supplémentaires dans le tip
- [ ] Lien vers une ressource externe (optionnel)

**Exemple :**
```
Correction: "went" instead of "go"
[Why?] → Modal: "Past Simple Tense - Use 'went' (past of 'go') for actions completed in the past. Examples: I went, She went, They went"
```

---

## Phase 5 : Infrastructure & Polish (Fondation)

### 5.1 Authentification Utilisateur
> Login pour sauvegarder la progression

**Objectif :** Permettre la persistance cross-device

**Todolist :**
- [ ] Intégrer une solution d'auth (Clerk, NextAuth, ou Supabase Auth)
- [ ] Migrer les données de localStorage vers la DB liée à l'utilisateur
- [ ] Page de login/signup
- [ ] Profil utilisateur avec statistiques
- [ ] Option "Continue as guest"

---

### 5.2 Analytics & Métriques
> Comprendre comment les utilisateurs utilisent l'app

**Objectif :** Améliorer basé sur les données

**Todolist :**
- [ ] Intégrer Vercel Analytics ou Posthog
- [ ] Tracker : sessions, messages envoyés, temps passé, features utilisées
- [ ] Dashboard admin (optionnel)
- [ ] A/B testing pour nouvelles features

---

### 5.3 PWA & Offline
> Installer l'app sur mobile

**Objectif :** Expérience native-like

**Todolist :**
- [ ] Ajouter manifest.json
- [ ] Configurer le service worker
- [ ] Icônes pour iOS et Android
- [ ] Splash screen
- [ ] Mode offline (afficher historique, pas de nouvelles requêtes)

---

## Calendrier Suggéré

| Semaine | Phase | Features |
|---------|-------|----------|
| 1 | Quick Wins | Mode Correction ✅, Mobile ✅, Suggestions ✅, Vitesse TTS ✅, Inline ✅ |
| 2 | IA | Niveau adaptatif, Nouveaux outils, Paramètres génération |
| 3 | IA | Corrections formatées, Nouveaux outils (grammar, pronunciation) |
| 4 | IA + Engagement | Paramètres génération, Mémoire contextuelle, Streak counter |
| 5 | Engagement | Niveau difficulté UI, Vocabulaire, Score session |
| 6 | Voice | Mode conversation, Choix voix |
| 7 | Voice | Feedback prononciation, Sous-titres |
| 8-9 | Contenu | Scénarios guidés (x12) |
| 10 | Contenu | Flashcards, Grammar tips |
| 11 | Infra | Auth, Analytics, PWA |

---

## Métriques de Succès

| Métrique | Objectif |
|----------|----------|
| Temps moyen par session | > 5 minutes |
| Messages par session | > 10 |
| Retention J7 | > 30% |
| Streak moyen | > 3 jours |
| NPS | > 50 |

---

## Notes Techniques

### Stack actuelle
- Frontend: Next.js 16, React 19, Tailwind CSS 4
- AI: Vercel AI SDK + Google Gemini
- DB: Neon (PostgreSQL serverless)
- Hosting: Vercel

### Considérations
- **Rate limiting**: Gemini a des limites, prévoir du caching
- **Coûts**: Monitorer l'usage API, optimiser les prompts
- **Accessibilité**: WCAG 2.1 AA minimum
- **Performance**: Core Web Vitals dans le vert

---

*Dernière mise à jour: 19 Janvier 2026*

---

## Changelog

### 19 Janvier 2026
- ✅ **1.5.2 Niveau Adaptatif** - System prompt dynamique (Beginner/Intermediate/Advanced)
- ✅ **1.5.5 Mémoire Contextuelle** - Profils utilisateur avec intérêts, erreurs, niveau
- ✅ **1.1 Corrections Inline** - Highlighting visuel ~~rouge~~ → **vert** (Correction Mode uniquement)
- ✅ **1.4 Contrôle Vitesse TTS** - Boutons Slow/Normal/Fast pour la vitesse de lecture
- ✅ **1.3 Suggestions de Réponses** - Boutons cliquables pour répondre rapidement
- ✅ **1.0 Mode Correction** - Toggle entre conversation naturelle et corrections explicites
- ✅ **1.2 Mobile Responsive** - Layout adaptatif avec header/footer fixes
