# Roadmap UX - English Practice App

## Vue d'ensemble

Plan d'implémentation des améliorations UX, organisé par catégorie d'impact.

**Légende des statuts :**
- [ ] À faire
- [x] Terminé
- [~] En cours

---

## Phase 1 : Quick Wins (Impact Élevé / Effort Faible)

### 1.1 Corrections Inline
> L'IA souligne les erreurs et montre la correction en temps réel

**Objectif :** Permettre à l'utilisateur de voir ses erreurs et apprendre

**Todolist :**
- [ ] Modifier le system prompt pour demander des corrections formatées (JSON ou markdown)
- [ ] Créer un composant `CorrectionHighlight` pour afficher les erreurs en rouge barré
- [ ] Afficher la correction en vert à côté
- [ ] Ajouter un tooltip explicatif sur chaque correction
- [ ] Tester avec différents types d'erreurs (grammaire, orthographe, vocabulaire)

**Format attendu de l'IA :**
```
Your sentence: "I go to school yesterday"
Correction: "I **went** to school yesterday" (past tense needed)
```

---

### 1.2 Mobile Responsive
> Adapter le layout pour mobile et tablette

**Objectif :** Permettre l'utilisation sur smartphone

**Todolist :**
- [ ] Créer un layout mobile avec sidebar en drawer/bottom sheet
- [ ] Cacher le panneau VoiceOrb sur mobile (ou le réduire en header)
- [ ] Adapter la taille des boutons pour le touch (min 44px)
- [ ] Tester sur différentes tailles d'écran (320px, 375px, 414px)
- [ ] Ajouter un bouton hamburger pour ouvrir la sidebar
- [ ] Optimiser le clavier virtuel (input qui ne se cache pas)

**Breakpoints :**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

### 1.3 Suggestions de Réponses
> Boutons cliquables pour répondre rapidement

**Objectif :** Réduire la friction, aider les débutants

**Todolist :**
- [ ] Modifier l'API pour que l'IA génère 2-3 suggestions de réponses
- [ ] Créer un composant `SuggestionChips` (boutons horizontaux)
- [ ] Afficher les suggestions sous le dernier message de l'IA
- [ ] Au clic, envoyer la suggestion comme message utilisateur
- [ ] Masquer les suggestions quand l'utilisateur commence à taper
- [ ] Style : petits boutons outline, scrollable horizontalement sur mobile

**Format attendu de l'IA :**
```json
{
  "message": "Hello! How are you today?",
  "suggestions": ["I'm fine, thank you!", "Not so good...", "I'm excited!"]
}
```

---

### 1.4 Contrôle de Vitesse TTS
> Slider pour ajuster la vitesse de lecture

**Objectif :** Adapter à différents niveaux de compréhension

**Todolist :**
- [ ] Ajouter un state `speechRate` (0.5 à 1.5, défaut 0.9)
- [ ] Créer un composant `SpeedControl` (slider ou boutons 0.5x/1x/1.5x)
- [ ] Placer le contrôle dans la sidebar sous "Voice ON/OFF"
- [ ] Sauvegarder la préférence dans localStorage
- [ ] Appliquer le rate à `SpeechSynthesisUtterance`

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
| 1 | Quick Wins | Corrections inline, Mobile responsive |
| 2 | Quick Wins | Suggestions réponses, Contrôle vitesse |
| 3 | Engagement | Streak counter, Niveau difficulté |
| 4 | Engagement | Vocabulaire, Score session |
| 5 | Voice | Mode conversation, Choix voix |
| 6 | Voice | Feedback prononciation, Sous-titres |
| 7-8 | Contenu | Scénarios guidés (x12) |
| 9 | Contenu | Flashcards, Grammar tips |
| 10 | Infra | Auth, Analytics, PWA |

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

*Dernière mise à jour: Janvier 2026*
