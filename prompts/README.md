# Prompts de l'Application English Practice

Ce dossier contient tous les prompts système utilisés par l'IA dans l'application.
Vous pouvez les modifier pour améliorer l'expérience d'apprentissage.

## Structure

| Fichier | Description |
|---------|-------------|
| [conversation-mode.md](./conversation-mode.md) | Mode par défaut - conversation naturelle avec corrections subtiles |
| [correction-mode.md](./correction-mode.md) | Mode corrections explicites avec explications détaillées |
| [levels.md](./levels.md) | Adaptations selon le niveau (débutant, intermédiaire, avancé) |
| [scenarios-travel.md](./scenarios-travel.md) | Scénarios de voyage (aéroport, hôtel, restaurant) |
| [scenarios-roleplay.md](./scenarios-roleplay.md) | Jeux de rôle (entretien, médecin, service client) |
| [scenarios-conversation.md](./scenarios-conversation.md) | Conversations sociales (rencontres, weekend, plans) |
| [scenarios-quiz.md](./scenarios-quiz.md) | Quiz (verbes irréguliers, prépositions, vocabulaire) |
| [tools.md](./tools.md) | Outils IA (grammaire, prononciation, synonymes) |

## Comment modifier les prompts

1. Modifiez le fichier markdown souhaité
2. Copiez le contenu dans le fichier source correspondant :
   - `src/app/api/chat/route.ts` pour les modes et niveaux
   - `src/lib/scenarios.ts` pour les scénarios guidés

## Conseils pour améliorer les prompts

### Clarté
- Utilisez des instructions claires et directes
- Structurez avec des sections (VOTRE APPROCHE, STYLE, etc.)
- Donnez des exemples concrets

### Immersion
- Définissez bien le personnage de l'IA
- Ajoutez des détails contextuels
- Encouragez les réponses naturelles

### Pédagogie
- Adaptez le vocabulaire au niveau
- Incluez des techniques de correction spécifiques
- Prévoyez des cas d'erreurs courantes

## Fichiers source

- **Prompts principaux** : `src/app/api/chat/route.ts` (lignes 23-181)
- **Scénarios guidés** : `src/lib/scenarios.ts`
