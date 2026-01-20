# Outils IA

**Fichier source** : `src/app/api/chat/route.ts` - lignes 283-652

## Description

Ces outils sont appelés automatiquement par l'IA quand le contexte s'y prête. Ils fournissent des données structurées pour enrichir les réponses.

---

## 1. Explication de Grammaire (grammarExplain)

**Déclenchement** : Quand l'élève fait des erreurs répétées ou demande une explication.

### Règles disponibles

#### Past Simple (past_simple)
```
Name: Past Simple Tense
Explanation: Use the past simple for completed actions in the past. The action is finished.
Structure: Subject + verb(ed) OR irregular past form
Examples:
- I walked to school yesterday.
- She ate breakfast at 8am.
- They went to Paris last summer.
Common Mistakes: Using present tense for past actions: 'I go yesterday' instead of 'I went yesterday'
French Tip: Similar to French passé composé, but simpler - no auxiliary verb needed for most verbs.
```

#### Present Perfect (present_perfect)
```
Name: Present Perfect Tense
Explanation: Use present perfect for past actions with a connection to now, or for experiences without a specific time.
Structure: Subject + have/has + past participle
Examples:
- I have visited London twice.
- She has already eaten.
- Have you ever tried sushi?
Common Mistakes: Using past simple instead: 'Did you ever try sushi?' instead of 'Have you ever tried sushi?'
French Tip: Looks like passé composé but usage is different! English uses it for unfinished time periods.
```

#### Articles (articles)
```
Name: Articles (a, an, the)
Explanation: Use 'a/an' for general or first mention. Use 'the' for specific or already mentioned things.
Structure: a + consonant sound, an + vowel sound, the + specific noun
Examples:
- I saw a dog. The dog was brown.
- She is an engineer.
- The sun is bright today.
Common Mistakes: Omitting articles: 'I have car' instead of 'I have a car'
French Tip: French uses articles more than English. 'I like music' (no article) vs 'J'aime la musique'
```

#### Prepositions (prepositions)
```
Name: Prepositions of Time and Place
Explanation: Prepositions show relationships between words. Time: at, on, in. Place: at, on, in, to.
Structure: at (specific time/place), on (days/surfaces), in (months/years/enclosed spaces)
Examples:
- at 5 o'clock, at the station
- on Monday, on the table
- in January, in the room
Common Mistakes: Wrong preposition: 'in Monday' instead of 'on Monday'
French Tip: Different from French! 'In the morning' = 'le matin', 'at night' = 'la nuit'
```

#### Conditionals (conditionals)
```
Name: Conditional Sentences
Explanation: Express possibilities and their results. Zero (facts), First (likely), Second (unlikely), Third (past unreal).
Structure: If + condition, result / Result if + condition
Examples:
- Zero: If you heat water, it boils.
- First: If it rains, I will stay home.
- Second: If I won the lottery, I would travel.
- Third: If I had studied, I would have passed.
Common Mistakes: Mixing tenses: 'If I would have money' instead of 'If I had money'
French Tip: Second conditional uses past tense like French imparfait in 'si' clauses.
```

#### Passive Voice (passive_voice)
```
Name: Passive Voice
Explanation: Use passive when the action is more important than who did it, or when the doer is unknown.
Structure: Subject + be + past participle (+ by agent)
Examples:
- The cake was eaten.
- The book was written by Hemingway.
- English is spoken worldwide.
Common Mistakes: Forgetting 'be': 'The cake eaten' instead of 'The cake was eaten'
French Tip: Similar to French passive with être, but used more often in English.
```

#### Comparatives (comparatives)
```
Name: Comparatives and Superlatives
Explanation: Compare two things (comparative) or identify the extreme (superlative).
Structure: Short adj: -er/-est. Long adj: more/most + adj
Examples:
- She is taller than me.
- This is the most beautiful city.
- He runs faster than his brother.
Common Mistakes: Double comparison: 'more bigger' instead of 'bigger'
French Tip: Unlike French 'plus grand', short English adjectives change form: big → bigger
```

#### Question Forms (question_forms)
```
Name: Question Formation
Explanation: Form questions using auxiliary verbs (do/does/did) or inverting subject and verb.
Structure: Auxiliary + subject + main verb? / Question word + auxiliary + subject + verb?
Examples:
- Do you like coffee?
- Where did she go?
- Have you finished?
Common Mistakes: Missing auxiliary: 'You like coffee?' instead of 'Do you like coffee?'
French Tip: Unlike French intonation questions, English usually needs an auxiliary verb.
```

---

## 2. Conseils de Prononciation (pronunciationTip)

**Déclenchement** : Quand l'élève utilise un mot difficile à prononcer ou demande de l'aide.

### Mots avec données

| Mot | Phonétique | Astuce clé |
|-----|------------|------------|
| the | /ðə/ ou /ði/ | Langue entre les dents, pas "ze" |
| think | /θɪŋk/ | 'th' sourd, pas "sink" ou "zink" |
| comfortable | /ˈkʌmf.tə.bəl/ | 3 syllabes: CUMF-ter-bul |
| wednesday | /ˈwenz.deɪ/ | 2 syllabes: WENZ-day |
| would | /wʊd/ | Le 'l' est muet |
| interesting | /ˈɪn.trə.stɪŋ/ | 3 syllabes: IN-truh-sting |
| island | /ˈaɪ.lənd/ | Le 's' est muet |
| height | /haɪt/ | Rime avec "light" |
| clothes | /kloʊz/ | Presque comme "close" |
| breakfast | /ˈbrek.fəst/ | BREK-fust, pas "break-fast" |

### Structure des données
```typescript
{
  phonetic: string;      // Transcription phonétique
  sounds: string;        // Description du son
  tip: string;           // Astuce principale
  similarWords: string[]; // Mots similaires
  frenchTrap: string;    // Piège pour francophones
}
```

---

## 3. Suggestions de Synonymes (synonymSuggest)

**Déclenchement** : Quand l'élève utilise des mots basiques de façon répétée.

### Mots avec alternatives

#### good →
- great (beginner) - plus enthousiaste
- excellent (intermediate) - formel, haute qualité
- wonderful (intermediate) - émotionnel
- outstanding (advanced) - exceptionnellement bon
- superb (advanced) - extrêmement impressionnant

#### bad →
- terrible (beginner) - très mauvais
- awful (intermediate) - extrêmement mauvais
- dreadful (intermediate) - qui cause la peur
- appalling (advanced) - choquant
- atrocious (advanced) - de très mauvaise qualité

#### big →
- large (beginner) - plus formel
- huge (beginner) - très grand
- enormous (intermediate) - extrêmement grand
- massive (intermediate) - lourd et grand
- immense (advanced) - vaste

#### happy →
- glad (beginner) - content de quelque chose
- delighted (intermediate) - très content
- thrilled (intermediate) - excité et heureux
- overjoyed (advanced) - extrêmement heureux
- ecstatic (advanced) - débordant de joie

#### nice →
- lovely (beginner) - agréable, attrayant
- pleasant (intermediate) - agréable
- delightful (intermediate) - charmant
- charming (advanced) - agréablement plaisant
- exquisite (advanced) - extrêmement beau

---

## Points d'amélioration - Outils

### Grammaire
- [ ] Ajouter plus de règles (gerund, modals, etc.) ?
- [ ] Exercices pratiques après l'explication ?
- [ ] Liens entre règles connexes ?

### Prononciation
- [ ] Ajouter plus de mots difficiles ?
- [ ] Audio/liens vers des exemples ?
- [ ] Paires minimales pour francophones ?

### Synonymes
- [ ] Plus de mots de base à enrichir ?
- [ ] Contextes d'utilisation ?
- [ ] Collocations avec les nouveaux mots ?

### Nouveaux outils possibles
- [ ] Conjugaison de verbes
- [ ] Expressions idiomatiques par thème
- [ ] Différences UK/US English
- [ ] Registres formel/informel
- [ ] Connecteurs logiques
