# Scénarios de Voyage

**Fichier source** : `src/lib/scenarios.ts` - ligne 32

## Description

Situations réelles de voyage pour pratiquer l'anglais dans des contextes concrets.

---

## 1. À l'Aéroport (At the Airport)

**ID** : `travel-airport`
**Difficulté** : Débutant
**Durée estimée** : 10 minutes
**Vocabulaire clé** : boarding pass, gate, luggage, security, delayed

### Étapes

#### Étape 1 - Check-in
**Instruction pour l'élève** :
> Greet the check-in agent and say you have a flight to London.

**Prompt pour l'IA** :
```
You are a friendly airline check-in agent. Greet the passenger warmly and ask for their passport and booking reference.
```

---

#### Étape 2 - Bagages
**Instruction pour l'élève** :
> The agent asks about luggage. Tell them you have one suitcase to check and one carry-on.

**Prompt pour l'IA** :
```
Ask about luggage - how many bags to check and any carry-on items. Mention the weight limit is 23 kilograms.
```

---

#### Étape 3 - Porte d'embarquement
**Instruction pour l'élève** :
> Ask the agent which gate your flight departs from.

**Prompt pour l'IA** :
```
Hand over the boarding pass and tell them the flight leaves from Gate 42. Boarding starts at 2:30 PM. Wish them a good flight.
```

---

#### Étape 4 - Sécurité
**Instruction pour l'élève** :
> At security, the officer asks you to remove items. Respond appropriately.

**Prompt pour l'IA** :
```
You are a security officer. Ask the passenger to remove their laptop from their bag, take out any liquids, and remove their belt and jacket.
```

---

#### Étape 5 - Retard
**Instruction pour l'élève** :
> You hear an announcement that your flight is delayed. Ask an airport staff member for more information.

**Prompt pour l'IA** :
```
Announce that the flight to London is delayed by 45 minutes. Apologize for the inconvenience and offer a voucher for free coffee at the airport cafe.
```

---

## 2. À l'Hôtel (Checking into a Hotel)

**ID** : `travel-hotel`
**Difficulté** : Débutant
**Durée estimée** : 8 minutes
**Vocabulaire clé** : reservation, room key, checkout, amenities, reception

### Étapes

#### Étape 1 - Arrivée
**Instruction pour l'élève** :
> Approach the reception desk and say you have a reservation.

**Prompt pour l'IA** :
```
You are a hotel receptionist. Greet the guest warmly and ask for their name and confirmation number.
```

---

#### Étape 2 - Confirmation
**Instruction pour l'élève** :
> Confirm your booking details when asked.

**Prompt pour l'IA** :
```
Ask the guest to confirm: 3 nights, double room, breakfast included. Ask if this is correct.
```

---

#### Étape 3 - Questions
**Instruction pour l'élève** :
> Ask what time breakfast is served and where the restaurant is.

**Prompt pour l'IA** :
```
Provide the room key for room 305 on the third floor. Wait for the guest to ask questions about the hotel.
```

---

#### Étape 4 - Problème
**Instruction pour l'élève** :
> Call reception and report that the air conditioning is not working in your room.

**Prompt pour l'IA** :
```
Answer the phone as the reception. Listen to the complaint and apologize. Offer to send maintenance right away or offer a room change.
```

---

## 3. Au Restaurant (Ordering at a Restaurant)

**ID** : `travel-restaurant`
**Difficulté** : Débutant
**Durée estimée** : 10 minutes
**Vocabulaire clé** : menu, waiter, bill, tip, reservation, vegetarian

### Étapes

#### Étape 1 - Réservation
**Instruction pour l'élève** :
> Tell the host you have a reservation for two people.

**Prompt pour l'IA** :
```
You are a restaurant host. Greet the guests and ask for the name on the reservation.
```

---

#### Étape 2 - Menu
**Instruction pour l'élève** :
> Ask the waiter what the special of the day is.

**Prompt pour l'IA** :
```
You are the waiter. Present menus and wait for questions. The special today is grilled salmon with vegetables.
```

---

#### Étape 3 - Commande
**Instruction pour l'élève** :
> Order your food. Get a starter, main course, and drink.

**Prompt pour l'IA** :
```
Take the order. Repeat it back to confirm. Ask how they would like their steak cooked if they order one.
```

---

#### Étape 4 - Allergies
**Instruction pour l'élève** :
> Tell the waiter you have a food allergy and ask if the dish contains nuts.

**Prompt pour l'IA** :
```
Respond to the allergy concern seriously. Confirm the dish does not contain nuts but is prepared in a kitchen that handles nuts. Offer alternatives.
```

---

#### Étape 5 - Addition
**Instruction pour l'élève** :
> Ask for the bill and ask if service is included.

**Prompt pour l'IA** :
```
Bring the bill. It is 45 pounds total. Service is not included. Accept payment by card or cash.
```

---

## Points d'amélioration - Scénarios Voyage

### Immersion
- [ ] Ajouter plus de détails contextuels (bruits, ambiance) ?
- [ ] Personnages avec noms/personnalités ?
- [ ] Situations imprévues pour plus de réalisme ?

### Vocabulaire
- [ ] Le vocabulaire clé est-il bien introduit ?
- [ ] Ajouter des expressions idiomatiques de voyage ?
- [ ] Prévoir des variantes UK/US ?

### Difficulté
- [ ] Les étapes sont-elles progressives ?
- [ ] Ajouter des versions plus difficiles ?
- [ ] Situations de stress/urgence pour niveau avancé ?

### Nouveaux scénarios possibles
- [ ] Train/métro
- [ ] Location de voiture
- [ ] Office de tourisme
- [ ] Urgences (perte de passeport, problème médical)
