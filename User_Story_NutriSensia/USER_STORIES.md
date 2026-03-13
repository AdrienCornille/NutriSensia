# NutriSensia - User Stories Patient Dashboard

> **Version 2.0** | Février 2026 | Mise à jour : Ajout des stories Profil Nutritionnel (FILE-008 à FILE-014)

## Statistiques

| Métrique | Valeur |
|----------|--------|
| Nombre total d'épics | 14 |
| Nombre total de user stories | 130 |
| Must Have (Priorité haute) | 49 (38%) |
| Should Have (Priorité moyenne) | 65 (50%) |
| Could Have (Priorité basse) | 16 (12%) |

### Changements v2.0

- **+7 stories** dans l'épic "Mon dossier" (FILE-008 à FILE-014)
- Nouvelles fonctionnalités : Profil nutritionnel patient (consultation, historique, suggestions, comparaison, export)
- Miroir des stories nutritionniste CALC-001 à CALC-016

---

## 1. Authentification & Onboarding (13 stories)

### AUTH-001 - Création de compte patient [Must Have] ✅
**En tant que** visiteur,
**Je veux** créer un compte sur NutriSensia,
**Afin de** je puisse accéder à l'application et commencer mon suivi nutritionnel.

**Point d'entrée:** Bouton "Commencer" dans le header du site → mène directement à /auth/signup

**Critères d'acceptation:**
- Le formulaire demande : prénom, nom, email, mot de passe
- Le mot de passe doit contenir min. 8 caractères, 1 majuscule, 1 chiffre
- Un email de confirmation est envoyé
- Le compte est activé après clic sur le lien de confirmation
- L'utilisateur est automatiquement rattaché au nutritionniste NutriSensia
- Le compte est créé avec le rôle "patient" par défaut

### AUTH-002 - Connexion au compte (unifiée) [Must Have] ✅
**En tant que** utilisateur enregistré (patient ou nutritionniste),
**Je veux** me connecter à mon compte via une page de connexion unique,
**Afin de** je puisse accéder à mon espace personnel.

**Point d'entrée:** Bouton "Connexion" dans le header → mène à /auth/signin (page neutre sans distinction de rôle)

**Critères d'acceptation:**

- Page de connexion unique pour tous les rôles (patient, nutritionniste, admin)
- Connexion par email + mot de passe
- Option 'Se souvenir de moi' disponible
- Message d'erreur clair si identifiants incorrects
- Détection automatique du rôle après authentification réussie
- Redirection automatique vers le dashboard approprié (voir AUTH-012)
- Blocage temporaire après 5 tentatives échouées

### AUTH-003 - Réinitialisation du mot de passe [Must Have] ✅
**En tant que** patient,
**Je veux** réinitialiser mon mot de passe si je l'ai oublié,
**Afin de** je puisse récupérer l'accès à mon compte.

**Critères d'acceptation:**
- Lien 'Mot de passe oublié' sur la page de connexion
- Email de réinitialisation envoyé en moins de 2 minutes
- Le lien expire après 24 heures
- Confirmation visuelle après changement réussi

### AUTH-004 - Onboarding - Raison de consultation [Should Have] ✅
**En tant que** nouveau patient,
**Je veux** indiquer ma raison de consultation,
**Afin de** mon nutritionniste puisse préparer notre première rencontre.

**Critères d'acceptation:**
- Liste déroulante avec raisons prédéfinies
- Champ texte libre optionnel pour précisions
- Possibilité de passer cette étape
- Information visible dans le dossier patient côté nutritionniste

### AUTH-005 - Onboarding - Réservation première consultation [Should Have] ❌
**En tant que** nouveau patient,
**Je veux** réserver ma première consultation lors de l'inscription,
**Afin de** je puisse commencer mon suivi rapidement.

**Critères d'acceptation:**
- Affichage du calendrier avec créneaux disponibles
- Choix du mode (visio ou cabinet)
- Confirmation immédiate de la réservation
- Email de confirmation avec détails du RDV

### AUTH-006 - Tutoriel interactif [Could Have] ⚠️
**En tant que** nouveau patient,
**Je veux** suivre un mini-tutoriel de l'application,
**Afin de** je comprenne rapidement les fonctionnalités principales.

**Critères d'acceptation:**
- Tutoriel optionnel (bouton 'Passer')
- Maximum 5 étapes courtes
- Mise en surbrillance des éléments clés
- Possibilité de relancer depuis les paramètres

### AUTH-007 - Configuration 2FA [Should Have] ❌
**En tant que** patient soucieux de la sécurité,
**Je veux** activer l'authentification à deux facteurs,
**Afin de** mon compte et mes données de santé soient mieux protégés.

**Critères d'acceptation:**
- Proposition lors de l'onboarding (non obligatoire)
- Support des applications TOTP
- QR code à scanner + code manuel de secours
- Codes de récupération fournis

### AUTH-008 - Inscription nutritionniste - Formulaire [Must Have] ⚠️
**En tant que** nutritionniste,
**Je veux** m'inscrire via un formulaire dédié,
**Afin de** créer mon compte professionnel sur NutriSensia.

**Point d'entrée:** Lien "Devenir Nutritionniste NutriSensia" dans le footer du site → mène à /inscription/nutritionniste

**Critères d'acceptation:**

- Formulaire multi-étapes (5 étapes)
- Étape 1 : Informations personnelles (prénom, nom, email, téléphone, mot de passe)
- Étape 2 : Informations professionnelles (numéro ASCA/RME, spécialisations, expérience, langues)
- Étape 3 : Upload des documents (certificats, diplôme, photo)
- Étape 4 : Acceptation des conditions
- Étape 5 : Récapitulatif et soumission
- Compte créé avec rôle "nutritionist" et status "pending" après soumission
- Redirection vers /inscription/nutritionniste/en-attente après soumission
- Email de confirmation envoyé

### AUTH-009 - Inscription nutritionniste - Documents [Must Have] ✅
**En tant que** nutritionniste,
**Je veux** uploader mes certifications (ASCA/RME) lors de l'inscription,
**Afin de** prouver ma qualification professionnelle.

**Critères d'acceptation:**

- Upload de certificat ASCA ou RME (PDF/image, max 5MB) - au moins un obligatoire
- Upload de diplôme (PDF/image, max 5MB) - optionnel
- Upload de photo professionnelle (image, max 2MB) - obligatoire
- Prévisualisation des documents avant soumission
- Validation du type MIME et de la taille
- Stockage sécurisé dans Supabase Storage (bucket: nutritionist-documents)

### AUTH-010 - Inscription nutritionniste - Validation admin [Must Have] ⚠️
**En tant qu'** administrateur,
**Je veux** valider ou rejeter les demandes d'inscription nutritionniste,
**Afin de** garantir la qualité des professionnels sur la plateforme.

**Critères d'acceptation:**
- Liste des demandes en attente accessible depuis /admin/nutritionnistes
- Filtres par statut (pending, active, rejected)
- Consultation des documents uploadés
- Action "Valider" → status = "active", email de confirmation envoyé
- Action "Rejeter" → motif obligatoire, status = "rejected", email envoyé
- Action "Demander plus d'infos" → status = "info_required", message envoyé
- Historique des actions de validation

### AUTH-011 - Notification validation inscription [Should Have] ❌
**En tant que** nutritionniste,
**Je veux** être notifié par email quand ma demande est validée ou rejetée,
**Afin de** savoir si je peux accéder à mon dashboard.

**Critères d'acceptation:**
- Email envoyé lors de la validation (bienvenue + lien dashboard)
- Email envoyé lors du rejet (motif + possibilité de recours)
- Email envoyé lors de demande d'informations (message admin + lien pour répondre)
- Templates d'emails personnalisés en français

### AUTH-012 - Redirection par rôle [Must Have] ✅
**En tant qu'** utilisateur connecté,
**Je veux** être redirigé vers mon dashboard approprié,
**Afin de** accéder directement à mon espace.

**Comportement:** Après connexion réussie (AUTH-002), le système détecte automatiquement le rôle et le statut de l'utilisateur pour rediriger vers la bonne page.

**Critères d'acceptation:**

- Patient → /dashboard/patient
- Nutritionniste actif (status = "active") → /dashboard/nutritionist
- Nutritionniste en attente (status = "pending") → /inscription/nutritionniste/en-attente
- Nutritionniste rejeté (status = "rejected") → /inscription/nutritionniste/rejete
- Nutritionniste info requise (status = "info_required") → /inscription/nutritionniste/info-requise
- Admin → /admin
- Protection des routes par rôle (403 si accès non autorisé)
- Le rôle est stocké dans user_metadata.role (patient, nutritionist, admin)
- Le statut nutritionniste est stocké dans la table nutritionist_profiles

### AUTH-013 - Changement de rôle patient → nutritionniste [Could Have] ❌
**En tant que** patient,
**Je veux** pouvoir demander à devenir nutritionniste,
**Afin de** utiliser la plateforme en tant que professionnel.

**Critères d'acceptation:**
- Formulaire de demande accessible depuis les paramètres
- Mêmes étapes que l'inscription nutritionniste (documents, conditions)
- Validation admin requise
- Conservation de l'historique patient (optionnel)
- Email de confirmation du changement de rôle

---

## 2. Dashboard principal (7 stories)

### DASH-001 - Vue d'ensemble quotidienne [Must Have] ⚠️
**En tant que** patient,
**Je veux** voir un résumé de ma journée en un coup d'œil,
**Afin de** je sache où j'en suis par rapport à mes objectifs.

**Critères d'acceptation:**
- Affichage des calories consommées vs objectif
- Barres de progression pour protéines, glucides, lipides
- Indicateur visuel clair (vert/orange/rouge)
- Données mises à jour en temps réel

### DASH-002 - Tracker d'hydratation [Must Have] ⚠️
**En tant que** patient,
**Je veux** voir et mettre à jour mon hydratation du jour,
**Afin de** je puisse atteindre mon objectif quotidien d'eau.

**Critères d'acceptation:**
- Affichage visuel (jauge circulaire)
- Bouton d'ajout rapide
- Objectif personnalisable
- Historique des ajouts de la journée

### DASH-003 - Boutons d'enregistrement rapide des repas [Must Have] ⚠️
**En tant que** patient,
**Je veux** accéder rapidement à l'enregistrement de mes repas,
**Afin de** je puisse logger mes repas en quelques clics.

**Critères d'acceptation:**
- 4 boutons visibles : Petit-déjeuner, Déjeuner, Dîner, Collation
- Indication visuelle si repas déjà enregistré
- Clic ouvre directement le flow d'enregistrement

### DASH-004 - Progression hebdomadaire [Should Have] ⚠️
**En tant que** patient,
**Je veux** voir ma progression de la semaine,
**Afin de** je puisse évaluer mes efforts sur la durée.

**Critères d'acceptation:**
- Streak d'enregistrement des repas
- Tendance du poids (graphique mini)
- Pourcentage d'adhérence au plan
- Comparaison avec la semaine précédente

### DASH-005 - Prochain rendez-vous [Should Have] ⚠️
**En tant que** patient,
**Je veux** voir mon prochain rendez-vous depuis le dashboard,
**Afin de** je n'oublie pas mes consultations.

**Critères d'acceptation:**
- Affichage date, heure, type de consultation
- Compte à rebours (dans X jours)
- Lien vers l'agenda
- Masqué si aucun RDV planifié

### DASH-006 - Indicateur de messages non lus [Must Have] ⚠️
**En tant que** patient,
**Je veux** voir si j'ai des messages non lus,
**Afin de** je puisse répondre rapidement à mon nutritionniste.

**Critères d'acceptation:**
- Badge avec nombre de messages non lus
- Clic redirige vers la messagerie
- Mise à jour en temps réel

### DASH-007 - Objectifs hebdomadaires [Should Have] ⚠️
**En tant que** patient,
**Je veux** voir mes objectifs de la semaine avec leur progression,
**Afin de** je reste focalisé sur mes priorités.

**Critères d'acceptation:**
- Liste des objectifs définis avec le nutritionniste
- Barre de progression pour chaque objectif
- Indication du temps restant
- Célébration visuelle si objectif atteint

---

## 3. Gestion des repas (16 stories)

### MEAL-001 - Page principale Repas [Must Have] ✅
**Critères d'acceptation:**
- Page accessible via le menu 'Repas' de la sidebar
- Header avec titre, CTA 'Ajouter un repas' et toggle de vue
- Navigation temporelle avec calendrier horizontal scrollable
- Bouton 'Aujourd'hui' pour revenir à la date du jour
- Sidebar résumé visible sur desktop

### MEAL-002 - Vue Jour des repas [Must Have] ✅
**Critères d'acceptation:**
- 4 sections : Petit-déjeuner, Déjeuner, Dîner, Collation
- Repas enregistré : icône, heure, nb aliments, total kcal et macros
- Clic sur repas = expansion avec détail des aliments et photo
- Repas non enregistré : card pointillée avec bouton '+ Ajouter'
- Boutons Modifier/Supprimer dans le détail expansé

### MEAL-003 - Vue Semaine des repas [Should Have] ✅
**Critères d'acceptation:**
- Grille 7 jours × 4 types de repas
- Cellule avec ✓ vert si repas enregistré, + gris sinon
- Colonne du jour actuel mise en évidence
- Ligne de totaux avec calories et % de l'objectif par jour
- Clic sur cellule = navigation vers le détail du repas

### MEAL-004 - Vue Liste des repas [Should Have] ✅
**Critères d'acceptation:**
- Liste groupée par date (Aujourd'hui, Hier, etc.)
- Filtres par type de repas (pilules)
- Card avec thumbnail, badge type, heure, aliments, calories
- Bouton 'Charger plus de repas' pour pagination
- Clic sur card = ouverture du détail

### MEAL-005 - Résumé journalier sidebar [Should Have] ✅
**Critères d'acceptation:**
- Barre de progression calories avec reste à consommer
- Barres pour Protéines, Glucides, Lipides
- Comparaison vs Plan alimentaire avec % d'adhérence
- Actions rapides : voir plan du jour, statistiques

### MEAL-006 - Drawer d'ajout rapide [Must Have] ✅
**Critères d'acceptation:**
- Drawer slide-in depuis la droite
- Étape 1 : sélection du type de repas (grid 2×2)
- Étape 2 : recherche d'aliments + favoris + récents
- Boutons Scan code-barres et Favoris accessibles
- Footer sticky avec Annuler / Enregistrer

### MEAL-007 - Sélection du type de repas [Must Have] ✅
**Critères d'acceptation:**
- 4 options : Petit-déjeuner, Déjeuner, Dîner, Collation
- Plages horaires suggérées pour chaque type
- Sélection visuelle avec bordure colorée
- Possibilité de changer le type à tout moment

### MEAL-008 - Recherche d'aliments [Must Have] ✅
**Critères d'acceptation:**
- Recherche textuelle tolérante aux fautes
- Résultats affichés avec calories et macros
- Affichage des aliments récents et favoris
- Minimum 3 caractères pour lancer la recherche

### MEAL-009 - Scan code-barres [Must Have] ✅
**Critères d'acceptation:**
- Ouverture de la caméra pour scan
- Reconnaissance du code-barres en moins de 3 secondes
- Affichage des infos nutritionnelles si trouvé
- Message clair si produit non trouvé
- Option import d'image si pas de caméra

### MEAL-010 - Saisie des quantités [Must Have] ✅
**Critères d'acceptation:**
- Saisie en grammes ou portions standards
- Portions prédéfinies (cuillère à soupe, poignée, etc.)
- Recalcul automatique des macros
- Aperçu des valeurs nutritionnelles en temps réel

### MEAL-011 - Ajout de photo au repas [Should Have] ✅
**Critères d'acceptation:**
- Prise de photo ou import depuis galerie
- Photo optionnelle
- Compression automatique pour stockage
- Prévisualisation avant validation
- Badge 📷 visible dans l'historique si photo présente

### MEAL-012 - Notes et contexte du repas [Could Have] ✅
**Critères d'acceptation:**
- Champ texte libre pour notes
- Tags prédéfinis : Maison, Travail, Restaurant, etc.
- Informations visibles dans le détail du repas

### MEAL-013 - Duplication de repas [Should Have] ✅
**Critères d'acceptation:**
- Option 'Dupliquer' accessible depuis le détail d'un repas
- Liste des repas fréquents dans le drawer d'ajout
- Possibilité de modifier après duplication
- Copie de tous les aliments et quantités

### MEAL-014 - Comparaison repas vs plan [Should Have] ✅
**Critères d'acceptation:**
- % d'adhérence visible dans la sidebar résumé
- Feedback textuel sur les écarts (ex: 'Léger écart sur les glucides')
- Indicateur visuel vert/orange selon conformité
- Lien vers le plan du jour

### MEAL-015 - Modification de repas [Must Have] ✅
**Critères d'acceptation:**
- Bouton 'Modifier' dans le détail expansé du repas
- Ouverture du flow d'édition avec données pré-remplies
- Recalcul automatique des totaux après modification
- Historique des modifications non visible (écrasement)

### MEAL-016 - Suppression de repas [Must Have] ✅
**Critères d'acceptation:**
- Bouton 'Supprimer' dans le détail expansé du repas
- Confirmation requise avant suppression
- Recalcul automatique des totaux journaliers
- Suppression irréversible

---

## 4. Plan alimentaire (7 stories)

### PLAN-001 - Consultation du plan - Vue jour [Must Have] ✅
**Critères d'acceptation:**
- Affichage des 4 repas avec détail des aliments
- Quantités précises pour chaque aliment
- Total journalier (calories, macros)
- Navigation entre les jours

### PLAN-002 - Consultation du plan - Vue semaine [Should Have] ✅
**Critères d'acceptation:**
- Grille 7 jours x 4 repas
- Totaux journaliers visibles
- Clic sur une cellule = détail du repas
- Semaine en cours mise en évidence

### PLAN-003 - Détail nutritionnel du plan [Should Have] ✅
**Critères d'acceptation:**
- Calories et macros principaux toujours visibles
- Micronutriments en détail (toggle pour afficher)
- Comparaison avec les apports recommandés

### PLAN-004 - Alternatives aux aliments [Should Have] ✅
**Critères d'acceptation:**
- Liste d'alternatives pour chaque aliment
- Équivalence nutritionnelle indiquée
- Pas besoin de contacter le nutritionniste pour des substitutions mineures

### PLAN-005 - Demande de modification du plan [Must Have] ⚠️
**Critères d'acceptation:**
- Bouton 'Demander une modification'
- Formulaire avec motif de la demande
- Notification envoyée au nutritionniste
- Suivi du statut de la demande

### PLAN-006 - Génération de liste de courses [Should Have] ✅
**Critères d'acceptation:**
- Génération pour la semaine en cours
- Regroupement par catégorie
- Quantités cumulées pour la semaine
- Export ou partage possible

### PLAN-007 - Informations du plan actif [Could Have] ✅
**Critères d'acceptation:**
- Nom du nutritionniste
- Date de création/dernière modification
- Objectif du plan
- Badge 'Plan actif'

---

## 5. Suivi biométrique (9 stories)

### BIO-001 - Enregistrement du poids [Must Have] ✅
**Critères d'acceptation:**
- Saisie rapide du poids en kg
- Date automatique (modifiable)
- Validation et enregistrement immédiat
- Affichage de la variation vs dernière pesée

### BIO-002 - Graphique d'évolution du poids [Must Have] ✅
**Critères d'acceptation:**
- Graphique linéaire avec tous les points
- Ligne d'objectif visible
- Sélection de période (1 semaine, 1 mois, 3 mois, tout)
- Tendance calculée (moyenne mobile)

### BIO-003 - Cartes de résumé poids [Should Have] ✅
**Critères d'acceptation:**
- Poids actuel
- Poids objectif
- Progression en % et kg
- Tendance hebdomadaire

### BIO-004 - Enregistrement des mensurations [Should Have] ✅
**Critères d'acceptation:**
- Zones : tour de poitrine, taille, hanches, cuisses, bras
- Saisie en centimètres
- Historique des entrées
- Badge de variation depuis la dernière mesure

### BIO-005 - Suivi du bien-être quotidien [Should Have] ✅
**Critères d'acceptation:**
- Niveau d'énergie (échelle 1-5)
- Heures de sommeil
- Humeur (5 emojis)
- Tags digestion
- Historique consultable

### BIO-006 - Insights automatiques [Could Have] ✅
**Critères d'acceptation:**
- Détection automatique des corrélations
- Affichage sous forme de message
- Basé sur les données des 2 dernières semaines minimum

### BIO-007 - Suivi de l'activité physique [Should Have] ✅
**Critères d'acceptation:**
- Sélection du type d'activité
- Durée et intensité
- Estimation des calories brûlées
- Résumé hebdomadaire

### BIO-008 - Tracker d'hydratation détaillé [Must Have] ⏳
**Critères d'acceptation:**
- Jauge visuelle du jour
- Boutons d'ajout rapide
- Saisie de quantité personnalisée
- Graphique hebdomadaire vs objectif

### BIO-009 - Synchronisation balance connectée [Could Have] ⏳
**Critères d'acceptation:**
- Support Withings et Xiaomi minimum
- Connexion OAuth sécurisée
- Import automatique des nouvelles pesées
- Indication de la dernière synchronisation

---

## 6. Mon dossier (14 stories) 🆕

> **Mise à jour v2.0** : +7 stories pour le profil nutritionnel (FILE-008 à FILE-014)

### FILE-001 - Consultation de l'anamnèse [Must Have] ✅
**En tant que** patient,
**Je veux** consulter mon questionnaire d'anamnèse,
**Afin de** je puisse revoir les informations partagées.

**Critères d'acceptation:**
- Affichage de toutes les sections
- Sections dépliables
- Mode lecture seule
- Date de création et nutritionniste indiqués

### FILE-002 - Signalement de changement [Should Have] ✅
**En tant que** patient,
**Je veux** signaler qu'une information de mon dossier a changé,
**Afin de** mon nutritionniste puisse mettre à jour.

**Critères d'acceptation:**
- Bouton 'Signaler un changement'
- Message envoyé au nutritionniste via messagerie
- Types de changements : nouveau traitement, allergie, etc.

### FILE-003 - Consultation des questionnaires de suivi [Should Have] ✅
**En tant que** patient,
**Je veux** voir mes questionnaires de suivi passés,
**Afin de** je puisse suivre mon évolution.

**Critères d'acceptation:**
- Liste des questionnaires avec date
- Lien vers la consultation associée
- Statut (complété, en attente)
- Lecture seule pour les questionnaires validés

### FILE-004 - Gestion des documents [Should Have] ✅
**En tant que** patient,
**Je veux** consulter et ajouter des documents à mon dossier,
**Afin de** je puisse partager des analyses avec mon nutritionniste.

**Critères d'acceptation:**
- Upload de fichiers (PDF, images)
- Taille max 10 Mo par fichier
- Catégorisation
- Indication de qui a uploadé

### FILE-005 - Historique des consultations [Must Have] ✅
**En tant que** patient,
**Je veux** voir l'historique de mes consultations,
**Afin de** je puisse relire les résumés et recommandations.

**Critères d'acceptation:**
- Liste chronologique des consultations
- Date, durée, mode
- Résumé et points clés partagés
- Prochaines étapes indiquées

### FILE-006 - Suivi des objectifs [Must Have] ✅
**En tant que** patient,
**Je veux** voir mes objectifs et leur progression,
**Afin de** je reste motivé et focalisé.

**Critères d'acceptation:**
- Liste des objectifs définis
- Valeur de départ, actuelle, cible
- Barre de progression
- Statut (en bonne voie, en cours, à améliorer)

### FILE-007 - Export du dossier complet [Must Have] ✅
**En tant que** patient,
**Je veux** exporter l'intégralité de mon dossier,
**Afin de** je puisse exercer mon droit RGPD à la portabilité.

**Critères d'acceptation:**
- Bouton 'Exporter mon dossier'
- Sélection des données à inclure
- Format téléchargeable
- Délai maximum 24h

---

### FILE-008 - Consultation du profil nutritionnel [Must Have] ❌ 🆕

**En tant que** patient,
**Je veux** voir le détail de mon profil nutritionnel actif,
**Afin de** comprendre mes objectifs caloriques et nutritionnels personnalisés.

**Point d'entrée** : Onglet "Mon dossier" → Section "Mon profil nutritionnel"

**Critères d'acceptation** :
- ✓ Affichage du profil actif avec toutes les informations :
  - **Mes données de base** : poids, taille, âge, IMC (avec interprétation colorée)
  - **Mes calculs** : 
    - Métabolisme de base (BMR) avec nom de la formule utilisée
    - Niveau d'activité avec description
    - Dépense énergétique totale (TDEE)
  - **Mon objectif** : type (perte/maintien/prise), ajustement calorique, cible finale
  - **Mes macronutriments** : objectifs en % et grammes (protéines, glucides, lipides, fibres)
  - **Mes micronutriments** : objectifs principaux (mode basique) ou complets (mode avancé)
- ✓ Notes du nutritionniste visibles (champ `notes`)
- ✓ Notes privées du nutritionniste NON visibles (champ `private_notes`)
- ✓ Date de création et dernière modification du profil
- ✓ Nom du profil si renseigné (ex: "Profil perte de poids - Phase 1")
- ✓ Cas spécial affiché si applicable (grossesse, allaitement, sportif, etc.)
- ✓ Message "Aucun profil nutritionnel" si pas encore créé, avec explication
- ✓ Design pédagogique avec infobulles explicatives sur chaque section
- ✓ Bouton "Suggérer une modification" (voir FILE-011)
- ✓ Bouton "Voir l'historique" si plusieurs profils existent (voir FILE-010)

**↔ Miroir nutritionniste** : CALC-010

**💡 Notes Claude Code** :
- Créer un composant `NutritionalProfilePatientView` en lecture seule
- Réutiliser les composants d'affichage du nutritionniste mais sans les actions d'édition
- Exclure `private_notes` de l'API patient (filtrage côté serveur obligatoire)
- Utiliser des tooltips (Radix UI) pour les explications pédagogiques

---

### FILE-009 - Comprendre mes calculs nutritionnels [Should Have] ❌ 🆕

**En tant que** patient,
**Je veux** comprendre comment mes besoins nutritionnels ont été calculés,
**Afin de** mieux adhérer à mon plan et comprendre la démarche de mon nutritionniste.

**Point d'entrée** : Bouton "ℹ️ Comment ça marche ?" dans FILE-008

**Critères d'acceptation** :
- ✓ Modale ou page dédiée "Comprendre mes calculs"
- ✓ Explication du **métabolisme de base (BMR)** :
  - Définition simple : "L'énergie que votre corps dépense au repos"
  - Formule utilisée avec nom et pourquoi elle a été choisie
  - Facteurs qui l'influencent (âge, sexe, poids, taille)
- ✓ Explication du **niveau d'activité (PAL)** :
  - Description de chaque niveau avec exemples concrets
  - Pourquoi le nutritionniste a choisi ce niveau pour vous
- ✓ Explication du **TDEE** :
  - Calcul simple : BMR × PAL = TDEE
  - Ce que cela représente concrètement
- ✓ Explication de l'**objectif calorique** :
  - Pourquoi un déficit/surplus a été appliqué
  - Lien entre déficit et perte de poids estimée
- ✓ Explication des **macronutriments** :
  - Rôle de chaque macro (protéines, glucides, lipides)
  - Pourquoi cette répartition spécifique pour vous
- ✓ Si cas spécial (grossesse, sportif, etc.) : explication des ajustements
- ✓ Illustrations ou schémas simples pour visualiser
- ✓ Ton pédagogique et accessible (pas de jargon technique)
- ✓ Bouton "J'ai une question" → ouvre la messagerie avec le nutritionniste

**↔ Miroir nutritionniste** : CALC-003, CALC-016

**💡 Notes Claude Code** :
- Créer un composant `NutritionalExplanationModal` ou une page `/dashboard/patient/dossier/comprendre-mes-calculs`
- Le contenu doit être dynamique selon les données du profil
- Utiliser des animations ou illustrations SVG pour rendre l'explication visuelle

---

### FILE-010 - Historique de mes profils nutritionnels [Should Have] ❌ 🆕

**En tant que** patient,
**Je veux** voir l'historique de mes profils nutritionnels,
**Afin de** suivre l'évolution de mes besoins dans le temps.

**Point d'entrée** : Bouton "Voir l'historique" dans FILE-008

**Critères d'acceptation** :
- ✓ Liste chronologique des profils (du plus récent au plus ancien)
- ✓ Pour chaque profil :
  - Nom (si renseigné)
  - Date de création
  - Statut (actif / archivé)
  - Cible calorique
  - Objectif (perte / maintien / prise)
  - Indicateur visuel du profil actif (badge vert)
- ✓ Clic sur un profil → voir le détail complet (même vue que FILE-008)
- ✓ Indication du nombre de profils dans l'historique
- ✓ Message "Vous n'avez qu'un seul profil pour le moment" si un seul
- ✓ Graphique optionnel : évolution de la cible calorique dans le temps

**↔ Miroir nutritionniste** : CALC-014

**💡 Notes Claude Code** :
- Créer un composant `NutritionalProfileHistory`
- Filtrer côté API : ne retourner que les profils du patient connecté
- Réutiliser `NutritionalProfilePatientView` pour le détail

---

### FILE-011 - Suggérer une modification de profil [Should Have] ❌ 🆕

**En tant que** patient,
**Je veux** suggérer une modification de mon profil nutritionnel à mon nutritionniste,
**Afin que** mes besoins évoluent avec ma situation.

**Point d'entrée** : Bouton "Suggérer une modification" dans FILE-008

**Critères d'acceptation** :
- ✓ Modale de suggestion avec formulaire :
  - **Type de suggestion** (dropdown) :
    - Niveau d'activité ("Mon activité a changé")
    - Objectif ("Je souhaite changer d'objectif")
    - Répartition des macros ("J'aimerais ajuster mes macros")
    - Autre
  - **Valeur actuelle** : affichée automatiquement selon le type choisi
  - **Valeur souhaitée** : 
    - Pour activité : dropdown des niveaux
    - Pour objectif : dropdown (perte/maintien/prise)
    - Pour macros : sliders ou inputs %
    - Pour autre : texte libre
  - **Raison de la demande** : champ texte obligatoire (min 20 caractères)
- ✓ Prévisualisation de l'impact si possible (ex: nouvelle cible calorique)
- ✓ Bouton "Envoyer la suggestion"
- ✓ Confirmation d'envoi avec message "Votre suggestion a été envoyée à votre nutritionniste"
- ✓ Notification envoyée au nutritionniste
- ✓ **Suivi des suggestions** :
  - Liste des suggestions envoyées avec statut :
    - 🟡 En attente
    - ✅ Approuvée (avec date)
    - ❌ Refusée (avec réponse du nutritionniste)
    - 💬 À discuter en consultation
  - Accessible via un onglet ou section "Mes suggestions"
- ✓ Notification patient quand le nutritionniste répond

**↔ Miroir nutritionniste** : CALC-011, CALC-012

**Tables DB** : `nutritional_profile_suggestions`

**💡 Notes Claude Code** :
- Créer un composant `ProfileSuggestionModal`
- Calculer et afficher l'impact en temps réel si possible
- Utiliser l'API POST `/api/protected/patient/profile-suggestions`
- Créer une notification via `create_notification()` pour le nutritionniste

---

### FILE-012 - Notifications de mise à jour du profil [Must Have] ❌ 🆕

**En tant que** patient,
**Je veux** être notifié quand mon profil nutritionnel est modifié,
**Afin de** rester informé des changements de mes objectifs.

**Critères d'acceptation** :
- ✓ Notification in-app quand :
  - Un nouveau profil est créé
  - Le profil actif est modifié
  - Un profil est archivé (et un nouveau activé)
  - Une suggestion est approuvée/refusée
- ✓ Contenu de la notification :
  - Titre clair (ex: "Votre profil nutritionnel a été mis à jour")
  - Résumé du changement principal (ex: "Nouvelle cible : 2,200 kcal/jour")
  - Lien direct vers le profil
- ✓ Badge de notification sur l'onglet "Mon dossier" si non lu
- ✓ Email optionnel selon les préférences du patient
- ✓ Historique des notifications consultable

**Types de notifications** :

| Type | Titre | Corps |
|------|-------|-------|
| `nutritional_profile_created` | Nouveau profil nutritionnel | Votre nutritionniste a créé un profil : [nom]. Cible : X kcal/jour |
| `nutritional_profile_updated` | Profil nutritionnel modifié | Votre profil a été mis à jour. Nouvelle cible : X kcal/jour |
| `profile_suggestion_approved` | Suggestion approuvée ✅ | Votre suggestion concernant [type] a été approuvée |
| `profile_suggestion_rejected` | Suggestion refusée | Votre suggestion concernant [type] n'a pas été retenue. [message] |
| `profile_suggestion_discuss` | À discuter en consultation | Votre nutritionniste souhaite discuter de votre suggestion |

**↔ Miroir nutritionniste** : Système de notifications transversal

**💡 Notes Claude Code** :
- Utiliser le système de notifications existant (`notifications` table)
- Ajouter les nouveaux types dans l'enum de notifications
- S'assurer que le hook `useNotifications` côté patient capte ces types

---

### FILE-013 - Comparer mes profils nutritionnels [Should Have] ❌ 🆕

**En tant que** patient,
**Je veux** comparer deux de mes profils nutritionnels,
**Afin de** visualiser l'évolution de mes besoins.

**Point d'entrée** : Bouton "Comparer deux profils" dans FILE-010 (historique)

**Critères d'acceptation** :
- ✓ Sélection de deux profils à comparer (dropdowns ou sélection dans la liste)
- ✓ Affichage côte à côte (side-by-side) :
  - Dates de création
  - Données patient (poids, taille, IMC) avec variation
  - BMR et TDEE avec variation
  - Cible calorique avec variation (en kcal et en %)
  - Objectif (perte/maintien/prise)
  - Macros en % et grammes avec variation
- ✓ Code couleur pour les variations :
  - 🟢 Amélioration / augmentation souhaitée
  - 🔴 Dégradation / diminution
  - ⚪ Pas de changement
- ✓ Interprétation textuelle simple des changements principaux
- ✓ Graphique optionnel montrant l'évolution

**↔ Miroir nutritionniste** : CALC-014

**💡 Notes Claude Code** :
- Créer un composant `ProfileComparisonView`
- Les calculs de variation doivent être faits côté client pour réactivité
- Générer le résumé textuel automatiquement basé sur les variations principales

---

### FILE-014 - Exporter mon profil nutritionnel en PDF [Could Have] ❌ 🆕

**En tant que** patient,
**Je veux** exporter mon profil nutritionnel en PDF,
**Afin de** le conserver, l'imprimer ou le partager avec un autre professionnel.

**Point d'entrée** : Bouton "Exporter en PDF" dans FILE-008

**Critères d'acceptation** :
- ✓ Génération d'un PDF contenant :
  - En-tête avec logo NutriSensia et date d'export
  - Informations du patient (nom, prénom)
  - Informations du nutritionniste (nom, cabinet)
  - Toutes les données du profil (comme dans FILE-008)
  - Explications simplifiées des calculs
  - Notes du nutritionniste (sauf notes privées)
  - Pied de page avec mention "Document généré par NutriSensia"
- ✓ Design professionnel et lisible
- ✓ Téléchargement immédiat ou envoi par email
- ✓ Nom du fichier : `profil-nutritionnel-[date].pdf`
- ✓ Option d'inclure ou non l'historique des profils

**↔ Miroir nutritionniste** : CALC-010 (export côté nutritionniste)

**💡 Notes Claude Code** :
- Utiliser une librairie de génération PDF côté serveur (ex: `@react-pdf/renderer`, `puppeteer`, ou `pdfkit`)
- Créer un template HTML puis le convertir en PDF
- Route API : POST `/api/protected/patient/nutritional-profile/[id]/export-pdf`

---

## 7. Agenda & Rendez-vous (10 stories)

### AGENDA-001 - Consultation des RDV à venir [Must Have] ✅
**En tant que** patient,
**Je veux** voir mes rendez-vous à venir,
**Afin de** je puisse m'organiser.

**Critères d'acceptation:**
- Liste des RDV avec date, heure, type
- Mode de consultation (visio ou cabinet)
- Mise en avant du prochain RDV
- Countdown (dans X jours)

### AGENDA-002 - Consultation des RDV passés [Should Have] ✅
**En tant que** patient,
**Je veux** voir mes rendez-vous passés,
**Afin de** je puisse consulter l'historique de mon suivi.

**Critères d'acceptation:**
- Liste chronologique inversée
- Résumé de chaque consultation
- Lien vers le détail dans 'Mon dossier'

### AGENDA-003 - Prise de rendez-vous - Choix du type [Must Have] ✅
**En tant que** patient,
**Je veux** choisir le type de consultation,
**Afin de** je réserve le bon format de RDV.

**Critères d'acceptation:**
- Types disponibles : Suivi, Approfondi, Urgence
- Prix affiché pour chaque type
- Description du type de consultation

### AGENDA-004 - Prise de rendez-vous - Sélection créneau [Must Have] ✅
**En tant que** patient,
**Je veux** choisir une date et un horaire,
**Afin de** je réserve un créneau qui me convient.

**Critères d'acceptation:**
- Calendrier avec jours disponibles
- Créneaux horaires affichés par jour
- Créneaux indisponibles grisés

### AGENDA-005 - Prise de rendez-vous - Choix du mode [Must Have] ✅
**En tant que** patient,
**Je veux** choisir entre visio et cabinet,
**Afin de** je puisse consulter selon mes contraintes.

**Critères d'acceptation:**
- Option visioconférence
- Option cabinet avec adresse affichée
- Choix mémorisé pour les prochaines fois

### AGENDA-006 - Confirmation de rendez-vous [Must Have] ✅
**En tant que** patient,
**Je veux** confirmer ma réservation,
**Afin de** le RDV soit enregistré.

**Critères d'acceptation:**
- Récapitulatif complet avant validation
- Champ pour message au nutritionniste
- Email de confirmation envoyé
- RDV visible immédiatement dans l'agenda

### AGENDA-007 - Modification de rendez-vous [Should Have] ⚠️
**En tant que** patient,
**Je veux** modifier un rendez-vous existant,
**Afin de** je puisse changer de créneau si besoin.

**Critères d'acceptation:**
- Modification possible jusqu'à 24h avant
- Sélection d'un nouveau créneau
- Notification au nutritionniste
- Email de confirmation de modification

### AGENDA-008 - Annulation de rendez-vous [Should Have] ⚠️
**En tant que** patient,
**Je veux** annuler un rendez-vous,
**Afin de** je libère le créneau si je ne peux pas venir.

**Critères d'acceptation:**
- Annulation possible jusqu'à 24h avant
- Confirmation requise
- Notification au nutritionniste
- Politique d'annulation affichée

### AGENDA-009 - Rappels de rendez-vous [Should Have] ⚠️
**En tant que** patient,
**Je veux** recevoir des rappels avant mes RDV,
**Afin de** je n'oublie pas mes consultations.

**Critères d'acceptation:**
- Rappel email J-1
- Rappel push H-1 (si activé)
- Fréquence configurable

### AGENDA-010 - Rejoindre une visio [Must Have] ✅
**En tant que** patient,
**Je veux** rejoindre ma consultation visio facilement,
**Afin de** je puisse démarrer la consultation à l'heure.

**Critères d'acceptation:**
- Bouton 'Rejoindre la visio' visible
- Lien actif 15 minutes avant l'heure
- Ouverture dans un nouvel onglet

---

## 8. Messagerie (10 stories)

### MSG-001 - Envoi de message texte [Must Have] ⚠️
**En tant que** patient,
**Je veux** envoyer un message à mon nutritionniste,
**Afin de** je puisse poser mes questions entre les consultations.

**Critères d'acceptation:**
- Champ de saisie de texte
- Envoi par bouton ou touche Entrée
- Message affiché immédiatement
- Horodatage visible

### MSG-002 - Envoi de photo [Should Have] ⚠️
**En tant que** patient,
**Je veux** envoyer une photo à mon nutritionniste,
**Afin de** je puisse partager une photo de repas.

**Critères d'acceptation:**
- Bouton d'attachement visible
- Prise de photo ou import depuis galerie
- Prévisualisation avant envoi
- Possibilité d'ajouter une légende

### MSG-003 - Envoi de document [Should Have] ⚠️
**En tant que** patient,
**Je veux** envoyer un document PDF à mon nutritionniste,
**Afin de** je puisse partager des résultats d'analyses.

**Critères d'acceptation:**
- Support des fichiers PDF
- Taille max 10 Mo
- Affichage du nom et taille du fichier
- Téléchargeable par le destinataire

### MSG-004 - Indicateurs de lecture [Should Have] ⚠️
**En tant que** patient,
**Je veux** savoir si mon message a été lu,
**Afin de** je sache si mon nutritionniste l'a vu.

**Critères d'acceptation:**
- ✓ = envoyé
- ✓✓ = lu
- Indication visuelle claire

### MSG-005 - Réponses rapides [Could Have] ✅
**En tant que** patient,
**Je veux** utiliser des réponses pré-définies,
**Afin de** je puisse répondre rapidement.

**Critères d'acceptation:**
- Suggestions de réponses courantes
- Clic = texte inséré
- Modifiable avant envoi

### MSG-006 - Historique des conversations [Should Have] ⚠️
**En tant que** patient,
**Je veux** voir tout l'historique de mes échanges,
**Afin de** je puisse retrouver d'anciennes informations.

**Critères d'acceptation:**
- Scroll infini vers le haut
- Messages groupés par date
- Recherche dans les messages

### MSG-007 - Notification de nouveau message [Must Have]
**En tant que** patient,
**Je veux** être notifié quand mon nutritionniste m'écrit,
**Afin de** je puisse répondre rapidement.

**Critères d'acceptation:**
- Notification push (si activée)
- Email (si activé)
- Badge sur l'icône messagerie

### MSG-008 - Statut du nutritionniste [Could Have] ⚠️
**En tant que** patient,
**Je veux** voir si mon nutritionniste est en ligne,
**Afin de** je sache si je peux attendre une réponse rapide.

**Critères d'acceptation:**
- Indicateur en ligne/hors ligne
- Temps de réponse moyen affiché

### MSG-009 - Demande de modification via messagerie [Should Have] ⚠️
**En tant que** patient,
**Je veux** faire une demande de modification de plan via la messagerie,
**Afin de** la demande soit tracée et suivie.

**Critères d'acceptation:**
- Type de message spécial 'Demande de modification'
- Statut visible (en attente, approuvé, refusé)
- Notification quand statut change

### MSG-010 - Export de l'historique de conversation [Should Have] ❌

**En tant que** patient,
**Je veux** télécharger l'historique de ma conversation avec mon nutritionniste,
**Afin de** je puisse conserver une trace de nos échanges (RGPD).

**Critères d'acceptation:**

- Bouton 'Exporter la conversation' accessible
- Format téléchargeable (PDF ou TXT)
- Inclusion de tous les messages avec horodatage
- Inclusion des pièces jointes ou liens vers celles-ci

---

## 9. Recettes (8 stories)

### REC-001 - Navigation par catégorie [Should Have] ✅
**En tant que** patient,
**Je veux** parcourir les recettes par catégorie,
**Afin de** je trouve facilement des idées pour chaque repas.

**Critères d'acceptation:**
- Catégories : Petit-déjeuner, Déjeuner, Dîner, Collation, Dessert, Boisson
- Grille visuelle de catégories
- Compteur de recettes par catégorie

### REC-002 - Recherche de recettes [Should Have] ✅
**En tant que** patient,
**Je veux** rechercher une recette par nom ou ingrédient,
**Afin de** je trouve rapidement ce que je cherche.

**Critères d'acceptation:**
- Barre de recherche visible
- Recherche par titre ou ingrédient
- Résultats affichés en temps réel

### REC-003 - Filtres avancés [Should Have] ✅
**En tant que** patient,
**Je veux** filtrer les recettes selon mes critères,
**Afin de** je trouve des recettes adaptées à mes contraintes.

**Critères d'acceptation:**
- Filtres : difficulté, temps de préparation, régime alimentaire
- Filtres cumulables
- Compteur de résultats mis à jour
- Bouton réinitialiser

### REC-004 - Consultation détail recette [Should Have] ✅
**En tant que** patient,
**Je veux** voir le détail complet d'une recette,
**Afin de** je puisse la préparer.

**Critères d'acceptation:**
- Image, titre, temps, difficulté
- Valeurs nutritionnelles complètes
- Liste des ingrédients avec quantités
- Étapes de préparation numérotées
- Astuces du nutritionniste

### REC-005 - Ajout aux favoris [Should Have] ⚠️
**En tant que** patient,
**Je veux** ajouter une recette à mes favoris,
**Afin de** je puisse la retrouver facilement.

**Critères d'acceptation:**
- Bouton favori sur chaque recette
- Onglet 'Favoris' dédié
- Suppression possible des favoris

### REC-006 - Recettes recommandées [Could Have] ⚠️
**En tant que** patient,
**Je veux** voir des recettes recommandées pour moi,
**Afin de** je découvre des idées adaptées à mon profil.

**Critères d'acceptation:**
- Onglet 'Pour vous'
- Recettes basées sur le profil et objectifs
- Badge 'Recommandé' visible

### REC-007 - Ajout à la liste de courses [Should Have] ⚠️
**En tant que** patient,
**Je veux** ajouter les ingrédients d'une recette à ma liste,
**Afin de** je puisse faire mes courses facilement.

**Critères d'acceptation:**
- Bouton 'Ajouter à ma liste'
- Ingrédients ajoutés avec quantités
- Fusion si ingrédient déjà présent

### REC-008 - Gestion de la liste de courses [Should Have] ⚠️
**En tant que** patient,
**Je veux** gérer ma liste de courses,
**Afin de** je puisse cocher ce que j'ai acheté.

**Critères d'acceptation:**
- Liste organisée par catégorie
- Cases à cocher par article
- Ajout manuel d'articles
- Barre de progression
- Régénération depuis le plan

---

## 10. Base d'aliments (7 stories)

### FOOD-001 - Recherche d'aliment [Must Have] ✅
**En tant que** patient,
**Je veux** rechercher un aliment dans la base,
**Afin de** je puisse consulter ses informations nutritionnelles.

**Critères d'acceptation:**
- Recherche textuelle tolérante
- Recherche par nom ou marque
- Résultats avec aperçu des macros
- Historique des recherches récentes

### FOOD-002 - Navigation par catégorie [Should Have] ✅
**En tant que** patient,
**Je veux** parcourir les aliments par catégorie,
**Afin de** je puisse explorer les options disponibles.

**Critères d'acceptation:**
- Catégories : Fruits, Légumes, Viandes, Poissons, Féculents, etc.
- Compteur d'aliments par catégorie
- Sous-catégories si pertinent

### FOOD-003 - Fiche détaillée d'un aliment [Must Have] ✅
**En tant que** patient,
**Je veux** voir le détail nutritionnel complet d'un aliment,
**Afin de** je connaisse sa composition exacte.

**Critères d'acceptation:**
- Calories, protéines, glucides, lipides, fibres
- Micronutriments (sodium, potassium, vitamines, etc.)
- Valeurs pour 100g de référence
- Portions standards avec calcul automatique

### FOOD-004 - Portions standards [Must Have] ✅
**En tant que** patient,
**Je veux** voir les portions standards d'un aliment,
**Afin de** je puisse estimer facilement les quantités.

**Critères d'acceptation:**
- Liste de portions
- Macros recalculées pour chaque portion
- Clic sur portion = ajout rapide au repas

### FOOD-005 - Aliments favoris [Should Have] ⚠️
**En tant que** patient,
**Je veux** marquer des aliments en favoris,
**Afin de** je les retrouve rapidement.

**Critères d'acceptation:**
- Bouton favori sur chaque aliment
- Liste des favoris accessible en sidebar
- Favoris apparaissent en priorité lors de la recherche

### FOOD-006 - Scan code-barres [Should Have] ⚠️
**En tant que** patient,
**Je veux** scanner un code-barres pour trouver un produit,
**Afin de** je gagne du temps sur les produits industriels.

**Critères d'acceptation:**
- Bouton scanner visible
- Accès caméra pour scan
- Affichage immédiat si produit trouvé
- Option d'import d'image si pas de caméra

### FOOD-007 - Vue liste vs grille [Could Have] ✅
**En tant que** patient,
**Je veux** choisir l'affichage des aliments (liste ou grille),
**Afin de** je consulte selon ma préférence.

**Critères d'acceptation:**
- Toggle liste/grille
- Vue grille : cards visuelles
- Vue liste : tableau avec toutes les valeurs
- Préférence mémorisée

---

## 11. Contenu exclusif (8 stories)

### CONTENT-001 - Navigation par type de contenu [Should Have] ✅
**En tant que** patient,
**Je veux** filtrer le contenu par type,
**Afin de** je trouve le format qui me convient.

**Critères d'acceptation:**
- Onglets : Tout, Articles, Vidéos, Guides, Podcasts, Sauvegardés
- Compteur par type
- Filtrage instantané

### CONTENT-002 - Navigation par thème [Should Have] ✅
**En tant que** patient,
**Je veux** explorer le contenu par thème,
**Afin de** je trouve des ressources sur mes sujets d'intérêt.

**Critères d'acceptation:**
- Thèmes : Bases nutrition, Astuces cuisine, Psychologie, Sport, Santé, Mode de vie
- Filtres cumulables avec les types
- Badge coloré par thème

### CONTENT-003 - Contenu à la une [Should Have] ✅
**En tant que** patient,
**Je veux** voir le contenu mis en avant par mon nutritionniste,
**Afin de** je ne manque pas les ressources importantes.

**Critères d'acceptation:**
- Section 'À la une' en haut de page
- Design différencié
- Badge 'Nouveau' si récent

### CONTENT-004 - Lecture d'un article [Should Have] ✅
**En tant que** patient,
**Je veux** lire un article en entier,
**Afin de** je puisse apprendre et m'informer.

**Critères d'acceptation:**
- Modale ou page dédiée
- Auteur, date, temps de lecture
- Contenu formaté
- Points clés en résumé

### CONTENT-005 - Lecture d'une vidéo [Should Have] ✅
**En tant que** patient,
**Je veux** regarder une vidéo,
**Afin de** je puisse apprendre de façon visuelle.

**Critères d'acceptation:**
- Player vidéo intégré
- Contrôles (play, pause, volume, plein écran)
- Durée affichée
- Description sous la vidéo

### CONTENT-006 - Téléchargement de guide PDF [Should Have] ⚠️
**En tant que** patient,
**Je veux** télécharger un guide au format PDF,
**Afin de** je puisse le consulter hors-ligne.

**Critères d'acceptation:**
- Bouton 'Télécharger PDF'
- Fichier téléchargé sur l'appareil
- Indication du nombre de pages

### CONTENT-007 - Sauvegarde de contenu [Should Have] ✅
**En tant que** patient,
**Je veux** sauvegarder du contenu pour plus tard,
**Afin de** je puisse le retrouver facilement.

**Critères d'acceptation:**
- Bouton 'Sauvegarder' sur chaque contenu
- Onglet 'Sauvegardés' dédié
- Suppression possible

### CONTENT-008 - Parcours d'apprentissage [Could Have] ✅
**En tant que** patient,
**Je veux** suivre un parcours d'apprentissage structuré,
**Afin de** j'apprenne progressivement.

**Critères d'acceptation:**
- Cours en plusieurs modules
- Progression sauvegardée
- Barre de progression visible
- Bouton 'Continuer' pour reprendre

---

## 12. Profil & Paramètres (11 stories)

### PROF-001 - Modification des informations personnelles [Must Have] ⚠️
**En tant que** patient,
**Je veux** modifier mes informations personnelles,
**Afin de** mes données soient à jour.

**Critères d'acceptation:**
- Modification : prénom, nom, email, téléphone, adresse
- Validation de l'email si changé
- Sauvegarde immédiate

### PROF-002 - Modification de la photo de profil [Could Have] ⚠️
**En tant que** patient,
**Je veux** changer ma photo de profil,
**Afin de** mon compte soit personnalisé.

**Critères d'acceptation:**
- Upload d'image (JPG, PNG, GIF)
- Taille max 2 Mo
- Prévisualisation avant validation
- Option de suppression

### PROF-003 - Changement de mot de passe [Must Have] ⚠️
**En tant que** patient,
**Je veux** changer mon mot de passe,
**Afin de** je puisse sécuriser mon compte.

**Critères d'acceptation:**
- Saisie de l'ancien mot de passe
- Saisie et confirmation du nouveau
- Validation des critères de sécurité
- Déconnexion des autres sessions

### PROF-004 - Gestion de la 2FA [Should Have] ⚠️
**En tant que** patient,
**Je veux** activer ou désactiver la 2FA,
**Afin de** je contrôle la sécurité de mon compte.

**Critères d'acceptation:**
- Activation via QR code + code de vérification
- Codes de récupération générés
- Désactivation avec confirmation

### PROF-005 - Gestion des sessions actives [Should Have] ⚠️
**En tant que** patient,
**Je veux** voir et gérer mes sessions actives,
**Afin de** je puisse déconnecter les appareils non reconnus.

**Critères d'acceptation:**
- Liste des sessions avec appareil et localisation
- Session actuelle identifiée
- Déconnexion individuelle ou globale

### PROF-006 - Configuration des notifications email [Should Have] ⚠️
**En tant que** patient,
**Je veux** configurer mes notifications email,
**Afin de** je reçoive uniquement ce qui m'intéresse.

**Critères d'acceptation:**
- Toggle par type : RDV, messages, rapports, newsletter
- Sauvegarde immédiate
- Option tout activer/désactiver

### PROF-007 - Configuration des notifications push [Should Have] ⚠️
**En tant que** patient,
**Je veux** configurer mes notifications push,
**Afin de** je contrôle les alertes sur mon appareil.

**Critères d'acceptation:**
- Toggle par type : RDV, messages, rappels repas, hydratation, pesée
- Heures calmes configurables
- Test de notification possible

### PROF-008 - Connexion d'appareils [Could Have] ⚠️
**En tant que** patient,
**Je veux** connecter mes appareils de santé,
**Afin de** mes données soient synchronisées automatiquement.

**Critères d'acceptation:**
- Liste des intégrations disponibles
- Connexion OAuth sécurisée
- Types de données synchronisées affichés
- Déconnexion possible

### PROF-009 - Préférences d'affichage [Should Have] ⚠️
**En tant que** patient,
**Je veux** configurer mes préférences d'affichage,
**Afin de** l'application corresponde à mes habitudes.

**Critères d'acceptation:**
- Langue (FR, DE, IT, EN)
- Fuseau horaire
- Unités (kg/lb, cm/ft, L/oz)
- Thème (clair, sombre, système)
- Premier jour de la semaine

### PROF-010 - Export des données personnelles [Must Have] ⚠️
**En tant que** patient,
**Je veux** exporter toutes mes données,
**Afin de** je puisse exercer mon droit RGPD.

**Critères d'acceptation:**
- Sélection des catégories de données
- Format téléchargeable
- Délai max 24h
- Notification quand prêt

### PROF-011 - Suppression du compte [Must Have] ⚠️
**En tant que** patient,
**Je veux** supprimer définitivement mon compte,
**Afin de** toutes mes données soient effacées.

**Critères d'acceptation:**
- Avertissement clair des conséquences
- Liste de ce qui sera supprimé
- Confirmation textuelle requise (taper 'SUPPRIMER')
- Délai de grâce de 30 jours

---

## 13. Centre de notifications (6 stories)

### ⚠️ NOTIF-001 - Consultation des notifications [Must Have]
**En tant que** patient,
**Je veux** voir toutes mes notifications,
**Afin de** je ne manque aucune information importante.

**Critères d'acceptation:**
- Liste de toutes les notifications
- Groupement par date (Aujourd'hui, Hier, Cette semaine, Plus ancien)
- Indicateur visuel pour les non lues

### ⚠️ NOTIF-002 - Filtrage des notifications [Should Have]
**En tant que** patient,
**Je veux** filtrer mes notifications par type,
**Afin de** je trouve rapidement ce qui m'intéresse.

**Critères d'acceptation:**
- Filtres : Toutes, Non lues, Messages, RDV, Rappels, Récompenses
- Compteur par filtre
- Filtrage instantané

### ⚠️ NOTIF-003 - Marquage comme lu [Must Have]
**En tant que** patient,
**Je veux** marquer une notification comme lue,
**Afin de** je sache ce que j'ai déjà traité.

**Critères d'acceptation:**
- Clic sur notification = marquée comme lue
- Bouton 'Tout marquer comme lu'
- Changement visuel immédiat

### ⚠️ NOTIF-004 - Action depuis notification [Should Have]
**En tant que** patient,
**Je veux** agir directement depuis une notification,
**Afin de** je gagne du temps.

**Critères d'acceptation:**
- Lien d'action contextuel
- Redirection vers la page concernée
- Notification marquée comme lue après action

### ⚠️ NOTIF-005 - Suppression de notification [Should Have]
**En tant que** patient,
**Je veux** supprimer des notifications,
**Afin de** je garde ma liste propre.

**Critères d'acceptation:**
- Bouton supprimer sur chaque notification
- Option 'Effacer toutes les notifications'
- Suppression immédiate sans confirmation

### ⚠️ NOTIF-006 - Badge de notifications non lues [Must Have]
**En tant que** patient,
**Je veux** voir le nombre de notifications non lues,
**Afin de** je sache s'il y a quelque chose à voir.

**Critères d'acceptation:**
- Badge sur l'icône cloche dans la navigation
- Compteur mis à jour en temps réel
- Badge disparaît quand tout est lu

---

## 14. Gamification & Motivation (4 stories)

### ⚠️ GAME-001 - Streaks d'enregistrement [Should Have]
**En tant que** patient,
**Je veux** voir mon streak d'enregistrement de repas,
**Afin de** je sois motivé à maintenir ma régularité.

**Critères d'acceptation:**
- Compteur de jours consécutifs
- Visuel flame ou similaire
- Affichage sur le dashboard
- Pas de pénalité agressive si streak cassé

### ⚠️ GAME-002 - Badges de progression [Could Have]
**En tant que** patient,
**Je veux** débloquer des badges pour mes accomplissements,
**Afin de** je célèbre mes progrès.

**Critères d'acceptation:**
- Badges pour : premier repas enregistré, 7 jours streak, 1 kg perdu, etc.
- Notification au déblocage
- Collection visible dans le profil

### ⚠️ GAME-003 - Célébrations de milestones [Could Have]
**En tant que** patient,
**Je veux** être félicité quand j'atteins un objectif,
**Afin de** je me sente encouragé.

**Critères d'acceptation:**
- Animation/confetti lors d'un milestone
- Message de félicitation personnalisé
- Partage optionnel avec le nutritionniste

### ⚠️ GAME-004 - Ton bienveillant sans culpabilisation [Must Have]
**En tant que** patient,
**Je veux** que l'app ne me culpabilise jamais,
**Afin de** je reste motivé même quand je dévie.

**Critères d'acceptation:**
- Aucun message négatif ou culpabilisant
- Focus sur la progression, pas la perfection
- Encouragements même après un écart
- Pas de gamification sur le poids directement

---

## Correspondances Patient ↔ Nutritionniste

Features bidirectionnelles nécessitant une cohérence frontend + backend.

| Feature | Côté Patient | Côté Nutritionniste | Statut |
|---------|--------------|---------------------|--------|
| Anamnèse | FILE-001 (lecture) | DOSSIER-001/002 (lecture/écriture) | ✅ Fait |
| Signalements | FILE-002 (envoie) | DOSSIER-004 (traite) | ✅ Fait |
| Questionnaires | FILE-003 (remplit) | DOSSIER-005/006 (crée/lit) | ✅ Fait |
| Documents | FILE-004 (uploade) | DOSSIER-007 (gère) | ✅ Fait |
| Consultations | FILE-005 (lecture) | CONSULT-001/002 (écriture) | ❌ Phase 3 |
| Objectifs | FILE-006 (progression) | DOSSIER-008/009 (définition) | ✅ Fait |
| Export dossier | FILE-007 (exporte) | DOSSIER-010 (exporte) | ✅ Fait |
| **Profil nutritionnel** | **FILE-008 à FILE-014** | **CALC-001 à CALC-016** | **❌ Phase 2.5** 🆕 |
| Plan alimentaire | PLAN-001 à 007 (consulte) | PLAN-N-001 à 009 (crée) | ✅ Fait |
| Agenda | AGENDA-001 à 010 (réserve) | AGENDA-N-001 à 011 (gère) | ⚠️ Partiel |
| Messagerie | MSG-001 à 010 (échange) | MSG-N-001 à 006 (échange) | ✅ Fait |
| Contenu | CONTENT-001 à 008 (consulte) | CONTENT-N-001 à 007 (publie) | ❌ Phase 5 |
| Recettes | REC-001 à 008 (consulte) | RECIPE-N-001/002 (gère) | ❌ Phase 5 |
| Suivi bio | BIO-001 à 009 (saisit) | SUIVI-001 à 006 (consulte) | ❌ Phase 4 |
| Repas | MEAL-001 à 016 (enregistre) | SUIVI-007 (consulte) | ❌ Phase 4 |

---

## Légende des statuts

| Symbole | Signification |
|---------|---------------|
| ✅ | Implémenté (frontend + backend fonctionnels) |
| ⚠️ | Partiellement implémenté (frontend prêt, backend requis) |
| ⏳ | À faire |
| ❌ | Non implémenté |
| 🆕 | Nouveau dans cette version |

---

## Composants à créer pour FILE-008 à FILE-014

| Composant | Description | Stories |
|-----------|-------------|---------|
| `NutritionalProfilePatientView` | Affichage lecture seule du profil | FILE-008 |
| `NutritionalExplanationModal` | Explications pédagogiques | FILE-009 |
| `NutritionalProfileHistory` | Liste historique des profils | FILE-010 |
| `ProfileSuggestionModal` | Formulaire de suggestion | FILE-011 |
| `ProfileSuggestionsList` | Liste des suggestions envoyées | FILE-011 |
| `ProfileComparisonView` | Comparaison side-by-side | FILE-013 |
| `ProfilePdfExport` | Génération PDF | FILE-014 |
