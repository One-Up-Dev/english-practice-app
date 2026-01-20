# Scénarios Jeux de Rôle

**Fichier source** : `src/lib/scenarios.ts` - ligne 156

## Description

Situations professionnelles et pratiques de la vie quotidienne nécessitant des compétences de communication plus avancées.

---

## 1. Entretien d'Embauche (Job Interview)

**ID** : `roleplay-job-interview`
**Difficulté** : Intermédiaire
**Durée estimée** : 12 minutes
**Vocabulaire clé** : experience, qualifications, strengths, salary, responsibilities

### Étapes

#### Étape 1 - Introduction
**Instruction pour l'élève** :
> Greet the interviewer and introduce yourself briefly.

**Prompt pour l'IA** :
```
You are an interviewer for a marketing position. Greet the candidate, shake hands, and ask them to have a seat. Start with: Tell me a little about yourself.
```

---

#### Étape 2 - Expérience
**Instruction pour l'élève** :
> The interviewer asks about your experience. Describe your previous work.

**Prompt pour l'IA** :
```
Ask: What relevant experience do you have for this marketing role? Listen and ask a follow-up question about a specific project.
```

---

#### Étape 3 - Forces et faiblesses
**Instruction pour l'élève** :
> Answer when asked about your biggest strength and one area you want to improve.

**Prompt pour l'IA** :
```
Ask: What would you say is your biggest strength? And what is one area you are working to improve?
```

---

#### Étape 4 - Questions
**Instruction pour l'élève** :
> Ask the interviewer about the team you would be working with.

**Prompt pour l'IA** :
```
Wait for the candidate to ask questions. The team has 5 people, works hybrid with 3 days in office, and the role reports to the Marketing Director.
```

---

#### Étape 5 - Conclusion
**Instruction pour l'élève** :
> Thank the interviewer and ask about the next steps in the process.

**Prompt pour l'IA** :
```
Explain that you will contact candidates within a week. Thank them for their time and escort them out.
```

---

## 2. Rendez-vous Médical (Doctor's Appointment)

**ID** : `roleplay-doctor`
**Difficulté** : Intermédiaire
**Durée estimée** : 10 minutes
**Vocabulaire clé** : symptoms, prescription, appointment, diagnosis, pharmacy

### Étapes

#### Étape 1 - Raison de la visite
**Instruction pour l'élève** :
> Tell the doctor why you made this appointment.

**Prompt pour l'IA** :
```
You are a friendly doctor. Greet the patient and ask: What brings you in today? What symptoms are you experiencing?
```

---

#### Étape 2 - Symptômes
**Instruction pour l'élève** :
> Describe your symptoms in detail - when they started and how severe they are.

**Prompt pour l'IA** :
```
Ask follow-up questions: How long have you had these symptoms? Are they constant or do they come and go? Rate the pain from 1 to 10.
```

---

#### Étape 3 - Historique médical
**Instruction pour l'élève** :
> Answer questions about your medical history.

**Prompt pour l'IA** :
```
Ask: Do you have any allergies to medications? Are you currently taking any other medicines? Have you had this problem before?
```

---

#### Étape 4 - Diagnostic
**Instruction pour l'élève** :
> The doctor gives a diagnosis. Ask questions about it.

**Prompt pour l'IA** :
```
Diagnose a mild throat infection. Explain it is not serious but needs antibiotics. Prescribe medication for 7 days. Wait for patient questions.
```

---

#### Étape 5 - Instructions
**Instruction pour l'élève** :
> Ask about how to take the medicine and any side effects.

**Prompt pour l'IA** :
```
Explain: Take one pill twice a day with food. Side effects may include mild stomach upset. Rest and drink plenty of fluids. Come back if symptoms worsen.
```

---

## 3. Service Client (Phone Call to Customer Service)

**ID** : `roleplay-customer-service`
**Difficulté** : Intermédiaire
**Durée estimée** : 10 minutes
**Vocabulaire clé** : complaint, refund, manager, reference number, policy

### Étapes

#### Étape 1 - Problème
**Instruction pour l'élève** :
> Explain that you received a damaged product and want to report it.

**Prompt pour l'IA** :
```
You are a customer service agent. Answer: Thank you for calling. How may I help you today? Ask for the order number.
```

---

#### Étape 2 - Informations
**Instruction pour l'élève** :
> Provide your order details when asked.

**Prompt pour l'IA** :
```
Ask for the order number and the customer's email address to look up the order. Confirm you found it.
```

---

#### Étape 3 - Description
**Instruction pour l'élève** :
> Describe what is wrong with the product.

**Prompt pour l'IA** :
```
Ask: Can you describe the damage? When did you receive the item? Did you notice the damage when you opened it?
```

---

#### Étape 4 - Solution
**Instruction pour l'élève** :
> The agent offers a replacement. Ask if you can get a refund instead.

**Prompt pour l'IA** :
```
Apologize for the inconvenience. Offer to send a replacement product within 3 to 5 business days. Wait for the customer's response.
```

---

#### Étape 5 - Confirmation
**Instruction pour l'élève** :
> Accept the solution and ask for a confirmation email.

**Prompt pour l'IA** :
```
Agree to process the refund. It will take 5 to 7 business days to appear. Ask if you can help with anything else and provide a reference number.
```

---

## Points d'amélioration - Scénarios Roleplay

### Réalisme
- [ ] Ajouter des interruptions réalistes ?
- [ ] Gérer les silences/hésitations ?
- [ ] Situations où l'interlocuteur est difficile ?

### Vocabulaire professionnel
- [ ] Expressions de politesse formelle ?
- [ ] Jargon spécifique à chaque domaine ?
- [ ] Différences culturelles (UK/US) ?

### Complexité
- [ ] Scénarios avec plusieurs interlocuteurs ?
- [ ] Situations de négociation ?
- [ ] Gestion de conflits ?

### Nouveaux scénarios possibles
- [ ] Réunion de travail
- [ ] Présentation professionnelle
- [ ] Négociation commerciale
- [ ] Appel à l'assistance technique
- [ ] Rendez-vous bancaire
- [ ] Inscription à un cours/club
