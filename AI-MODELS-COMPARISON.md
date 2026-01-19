# Comparaison des Modèles IA pour English Practice App

> Recherche effectuée en Janvier 2026

## Résumé Exécutif

| Modèle | Coût/1M tokens (in/out) | Qualité | Vitesse | Recommandation |
|--------|-------------------------|---------|---------|----------------|
| **Gemini 2.0 Flash** | GRATUIT | Bonne | Rapide | **Actuel - Garder** |
| **Gemini 2.5 Flash** | $0.15 / $0.60 | Très bonne | Rapide | **Upgrade recommandé** |
| **GPT-4o Mini** | $0.15 / $0.60 | Très bonne | Rapide | Alternative solide |
| **Claude Haiku 3.5** | $0.80 / $4.00 | Bonne | Très rapide | Trop cher |
| **Groq + Llama 3.3** | $0.59 / $0.79 | Bonne | **Ultra rapide** | **Best for voice** |
| **DeepSeek V3** | $0.27 / $1.10 | Bonne | Moyen | Budget option |

---

## 1. Modèles Gratuits

### Gemini 2.0 Flash (Actuel) ⭐
**Status:** Utilisé actuellement dans l'app

| Caractéristique | Valeur |
|-----------------|--------|
| Coût | **GRATUIT** |
| Rate Limits | 10 RPM, 250K TPM, 250 req/jour |
| Context Window | 1M tokens |
| Qualité conversation | Bonne |
| Multilingue | Excellent (MMMLU: 91.8) |

**Avantages:**
- Zéro coût
- Context window énorme (1M tokens)
- Bon pour le français → anglais

**Inconvénients:**
- Rate limits stricts (250 req/jour)
- Qualité inférieure aux modèles payants
- Pas de garantie SLA

**Verdict:** Parfait pour le développement et les tests. Limite de 250 req/jour peut être atteinte avec plusieurs utilisateurs.

---

### Groq Free Tier (Llama 3.3 70B)
**Status:** Alternative gratuite intéressante

| Caractéristique | Valeur |
|-----------------|--------|
| Coût | **GRATUIT** (avec limits) |
| Vitesse | **275+ tokens/sec** (10x plus rapide) |
| Context Window | 128K tokens |
| Rate Limits | ~30 req/min (free tier) |

**Avantages:**
- Ultra rapide (idéal pour la conversation vocale)
- Llama 3.3 est un excellent modèle
- Latence très basse

**Inconvénients:**
- Rate limits sur le free tier
- Moins bon en français que Gemini

**Verdict:** Excellent pour le mode conversation vocale où la latence compte.

---

## 2. Modèles Payants Budget (< $1/1M tokens)

### Gemini 2.5 Flash ⭐⭐ (Recommandé)
**Status:** Upgrade naturel de notre modèle actuel

| Caractéristique | Valeur |
|-----------------|--------|
| Coût Input | $0.15 / 1M tokens |
| Coût Output | $0.60 / 1M tokens |
| Context Window | 1M tokens |
| Rate Limits | Élevés (pay-as-you-go) |

**Calcul de coût pour notre app:**
```
Message moyen: ~100 tokens input, ~150 tokens output
Coût par message: $0.000015 + $0.00009 = $0.000105
1000 messages = $0.105 (10 centimes!)
10,000 messages/mois = ~$1
```

**Avantages:**
- Même API que notre code actuel (changement minimal)
- Excellent rapport qualité/prix
- Context window 1M (historique complet des conversations)
- Meilleur que Flash 2.0

**Inconvénients:**
- Payant (mais très peu cher)

---

### GPT-4o Mini
**Status:** Alternative OpenAI

| Caractéristique | Valeur |
|-----------------|--------|
| Coût Input | $0.15 / 1M tokens |
| Coût Output | $0.60 / 1M tokens |
| Context Window | 128K tokens |
| MMLU Score | 82.0% |

**Avantages:**
- Excellente qualité de conversation
- Très bon pour les corrections grammaticales
- Feature "Memory" de ChatGPT (pas via API)

**Inconvénients:**
- Nécessite de changer de provider (code)
- Context plus petit que Gemini

---

### DeepSeek V3
**Status:** Option ultra-budget

| Caractéristique | Valeur |
|-----------------|--------|
| Coût Input | $0.27 / 1M tokens |
| Coût Output | $1.10 / 1M tokens |
| Context Window | 64K tokens |

**Avantages:**
- Très économique
- Bon pour le raisonnement

**Inconvénients:**
- Moins testé pour l'enseignement des langues
- Context window plus petit

---

### Groq + Llama 3.3 70B (Payant) ⭐⭐
**Status:** Meilleur pour la conversation vocale

| Caractéristique | Valeur |
|-----------------|--------|
| Coût Input | $0.59 / 1M tokens |
| Coût Output | $0.79 / 1M tokens |
| Vitesse | **275 tokens/sec** |
| Context Window | 128K tokens |

**Avantages:**
- Vitesse imbattable (essentiel pour TTS fluide)
- Latence ultra-basse
- Prix raisonnable

**Inconvénients:**
- Llama moins bon en multilingue que Gemini
- Nécessite changement de provider

---

## 3. Modèles Premium (> $1/1M tokens)

### Gemini 1.5 Pro
| Caractéristique | Valeur |
|-----------------|--------|
| Coût Input | $1.25 / 1M tokens |
| Coût Output | $5.00 / 1M tokens |
| Context Window | 2M tokens |

**Verdict:** Trop cher pour notre use case. Réservé aux tâches complexes.

---

### Claude Sonnet 4.5
| Caractéristique | Valeur |
|-----------------|--------|
| Coût Input | $3.00 / 1M tokens |
| Coût Output | $15.00 / 1M tokens |
| Context Window | 200K (1M avec surcoût) |

**Avantages:**
- Meilleure qualité de rédaction
- Excellent pour les corrections nuancées

**Inconvénients:**
- 25x plus cher que Gemini Flash
- Overkill pour des conversations simples

**Verdict:** Trop cher. Réservé aux features premium.

---

### GPT-4o / GPT-5
| Caractéristique | Valeur |
|-----------------|--------|
| Coût Input | $2.50 - $5.00 / 1M tokens |
| Coût Output | $10.00 - $20.00 / 1M tokens |

**Verdict:** Trop cher pour une app gratuite.

---

## 4. Recommandation Stratégique

### Architecture Multi-Modèle Proposée

```
┌─────────────────────────────────────────────────────────────┐
│                    ROUTING INTELLIGENT                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Conversation normale  ──────►  Gemini 2.5 Flash            │
│  (80% des requêtes)              $0.15/$0.60 per M          │
│                                                             │
│  Mode Vocal (low latency) ────►  Groq + Llama 3.3           │
│  (15% des requêtes)              $0.59/$0.79 per M          │
│                                  275 tokens/sec              │
│                                                             │
│  Corrections détaillées  ─────►  Claude Haiku 4.5           │
│  (5% des requêtes)               $1.00/$5.00 per M          │
│                                  (ou GPT-4o mini)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Coût Estimé Mensuel

| Scénario | Messages/mois | Coût estimé |
|----------|---------------|-------------|
| 1 utilisateur actif | 500 | ~$0.05 |
| 10 utilisateurs | 5,000 | ~$0.50 |
| 100 utilisateurs | 50,000 | ~$5 |
| 1000 utilisateurs | 500,000 | ~$50 |

**Note:** Avec Gemini gratuit, ces coûts sont $0 jusqu'aux limites.

---

## 5. Plan d'Implémentation

### Phase 1: Garder Gemini 2.0 Flash (Gratuit)
- Suffisant pour le développement
- 250 req/jour = ~25 utilisateurs actifs

### Phase 2: Upgrade vers Gemini 2.5 Flash
- Quand les limites sont atteintes
- Changement minimal (juste le nom du modèle)
- Coût: ~$5/mois pour 100 utilisateurs

### Phase 3: Ajouter Groq pour le Mode Vocal
- Quand on implémente la conversation continue
- Réduire la latence de 2-3s à <500ms
- Coût additionnel: ~$2/mois pour 100 utilisateurs

### Phase 4: Premium (Optionnel)
- Offrir Claude/GPT-4o comme option premium
- Monétisation via abonnement

---

## 6. Code de Changement de Modèle

### Gemini (actuel → 2.5 Flash)
```typescript
// Avant
const model = google("gemini-2.0-flash");

// Après
const model = google("gemini-2.5-flash");
```

### Ajouter Groq
```typescript
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({});
const model = groq("llama-3.3-70b-versatile");
```

### Ajouter OpenAI
```typescript
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({});
const model = openai("gpt-4o-mini");
```

---

## 7. Benchmarks pour Language Learning

| Critère | Gemini Flash | GPT-4o Mini | Claude Haiku | Llama 3.3 |
|---------|--------------|-------------|--------------|-----------|
| Corrections grammaticales | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Conversation naturelle | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Multilingue (FR→EN) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Vitesse | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Coût | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 8. Conclusion

### Pour English Practice App:

1. **Court terme:** Garder **Gemini 2.0 Flash** (gratuit)
2. **Scaling:** Passer à **Gemini 2.5 Flash** ($0.15/$0.60)
3. **Mode vocal:** Ajouter **Groq + Llama** pour la latence
4. **Premium:** Optionnel avec **Claude** ou **GPT-4o**

### Meilleur choix global: **Gemini 2.5 Flash**
- Même écosystème (changement minimal)
- Excellent rapport qualité/prix
- Meilleur en multilingue
- Context window énorme (1M)

---

## Sources

- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Claude Pricing](https://docs.claude.com/en/docs/about-claude/pricing)
- [Groq Pricing](https://groq.com/pricing)
- [LLM Leaderboard 2025](https://www.vellum.ai/llm-leaderboard)
- [AI Model Comparison 2025](https://www.promptitude.io/post/ultimate-2025-ai-language-models-comparison-gpt5-gpt-4-claude-gemini-sonar-more)
- [Best AI for Language Learning](https://www.jolii.ai/the-best-ai-apps-to-learn-english/)

---

*Document créé le 19 Janvier 2026*
