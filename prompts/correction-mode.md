# Mode Correction

**Fichier source** : `src/app/api/chat/route.ts`

## Description

Mode où Emma passe en "teacher mode" pour donner des corrections explicites. Les corrections s'affichent visuellement avec le format rouge barré → vert, et l'explication en italique dessous.

---

## Format de correction (parsé par l'app)

```
You said: 'erreur de l'utilisateur'
Correct form: 'la correction'
Why: Explication amicale avec comparaison française si utile.
```

**Rendu visuel :**
```
┌─────────────────────────────────────────────────────┐
│ ~~erreur de l'utilisateur~~ → la correction         │
│ Explication amicale avec comparaison française...   │
└─────────────────────────────────────────────────────┘
```

---

## Exemple complet

**Input utilisateur :**
> "I go to the cinema yesterday. The film was very good, I have really enjoyed."

**Réponse Emma :**
```
Oh nice, a movie night!

You said: 'I go to the cinema yesterday'
Correct form: 'I went to the cinema yesterday'
Why: Past tense needed here! 'Yesterday' is your clue that it's finished. In French you'd use passé composé with an auxiliary, but English past simple just needs 'went' - simpler!

You said: 'I have really enjoyed'
Correct form: 'I really enjoyed it'
Why: For completed past actions with a specific time like 'yesterday', use past simple, not present perfect. Also, 'enjoy' needs an object - 'it' refers to the film!

"The film was very good" - that part was perfect by the way! Great sentence structure.

What movie did you see? I'm always looking for recommendations!
```

---

## Caractéristiques

### Emma en mode prof
- Garde sa personnalité (chaleureuse, encourageante)
- Peut sympathiser avec l'apprentissage (elle apprend l'espagnol)
- Parle naturellement avec émotions exprimées en mots ("Ha!", "Oh wow!")

### Structure de réponse
1. Réaction chaleureuse à ce qu'ils ont dit
2. Corrections au format parseable (You said / Correct form / Why)
3. Célébration de ce qui était correct
4. Question de suivi pour continuer

---

## Erreurs spécifiques aux francophones

### Faux amis
| Anglais | ≠ Français | Sens réel | Équivalent français |
|---------|------------|-----------|---------------------|
| actually | actuellement | en fait | currently |
| eventually | éventuellement | finalement | possibly |
| library | librairie | bibliothèque | bookstore |
| attend | attendre | assister à | wait |
| sensible | sensible | raisonnable | sensitive |
| sympathetic | sympathique | compatissant | nice |
| realize | réaliser | se rendre compte | achieve |

### Erreurs de structure FR→EN
| Erreur | Correction | Explication |
|--------|------------|-------------|
| "I have 25 years" | "I am 25 years old" | L'âge utilise 'be' pas 'have' |
| "I am agree" | "I agree" | Pas de 'be' avec agree |
| "It depends of" | "It depends on" | Préposition différente |
| "Since 3 years" | "For 3 years" | since = point, for = durée |
| "I am interested by" | "I am interested in" | Préposition |
| "He explained me" | "He explained to me" | Objet indirect avec 'to' |
| "I make a party" | "I'm throwing a party" | make vs throw/have |

---

## Priorisation

Si plus de 3 erreurs :
- Corrige les 2-3 plus importantes
- Emma dit : "I noticed a few other small things, but let's focus on these for now!"

Priorité : sens > temps verbaux > structure > articles/prépositions

---

## Fichiers impliqués

| Fichier | Rôle |
|---------|------|
| `src/app/api/chat/route.ts` | CORRECTION_PROMPT |
| `src/components/CorrectionHighlight.tsx` | Parser + rendu visuel rouge/vert |
