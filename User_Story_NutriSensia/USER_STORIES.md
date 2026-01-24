# NutriSensia - User Stories Patient Dashboard

## Statistiques

| Métrique | Valeur |
|----------|--------|
| Nombre total d'épics | 14 |
| Nombre total de user stories | 117 |
| Must Have (Priorité haute) | 43 (37%) |
| Should Have (Priorité moyenne) | 60 (51%) |
| Could Have (Priorité basse) | 14 (12%) |

---

## 1. Authentification & Onboarding (7 stories)

### AUTH-001 - Création de compte patient [Must Have] ⚠️
**En tant que** visiteur,
**Je veux** créer un compte sur NutriSensia,
**Afin de** je puisse accéder à l'application et commencer mon suivi nutritionnel.

**Critères d'acceptation:**
- Le formulaire demande : prénom, nom, email, mot de passe
- Le mot de passe doit contenir min. 8 caractères, 1 majuscule, 1 chiffre
- Un email de confirmation est envoyé
- Le compte est activé après clic sur le lien de confirmation
- L'utilisateur est automatiquement rattaché au nutritionniste NutriSensia

### AUTH-002 - Connexion au compte [Must Have] ⚠️
**En tant que** patient enregistré,
**Je veux** me connecter à mon compte,
**Afin de** je puisse accéder à mon tableau de bord et mes données.

**Critères d'acceptation:**
- Connexion par email + mot de passe
- Option 'Se souvenir de moi' disponible
- Message d'erreur clair si identifiants incorrects
- Redirection vers le dashboard après connexion réussie
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

### AUTH-004 - Onboarding - Raison de consultation [Should Have] ⚠️
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

---

## 2. Dashboard principal (7 stories)

### DASH-001 - Vue d'ensemble quotidienne [Must Have] ✅
**En tant que** patient,
**Je veux** voir un résumé de ma journée en un coup d'œil,
**Afin de** je sache où j'en suis par rapport à mes objectifs.

**Critères d'acceptation:**
- Affichage des calories consommées vs objectif
- Barres de progression pour protéines, glucides, lipides
- Indicateur visuel clair (vert/orange/rouge)
- Données mises à jour en temps réel

### DASH-002 - Tracker d'hydratation [Must Have] ✅
**En tant que** patient,
**Je veux** voir et mettre à jour mon hydratation du jour,
**Afin de** je puisse atteindre mon objectif quotidien d'eau.

**Critères d'acceptation:**
- Affichage visuel (jauge circulaire)
- Bouton d'ajout rapide
- Objectif personnalisable
- Historique des ajouts de la journée

### DASH-003 - Boutons d'enregistrement rapide des repas [Must Have] ✅
**En tant que** patient,
**Je veux** accéder rapidement à l'enregistrement de mes repas,
**Afin de** je puisse logger mes repas en quelques clics.

**Critères d'acceptation:**
- 4 boutons visibles : Petit-déjeuner, Déjeuner, Dîner, Collation
- Indication visuelle si repas déjà enregistré
- Clic ouvre directement le flow d'enregistrement

### DASH-004 - Progression hebdomadaire [Should Have] ✅
**En tant que** patient,
**Je veux** voir ma progression de la semaine,
**Afin de** je puisse évaluer mes efforts sur la durée.

**Critères d'acceptation:**
- Streak d'enregistrement des repas
- Tendance du poids (graphique mini)
- Pourcentage d'adhérence au plan
- Comparaison avec la semaine précédente

### DASH-005 - Prochain rendez-vous [Should Have] ✅
**En tant que** patient,
**Je veux** voir mon prochain rendez-vous depuis le dashboard,
**Afin de** je n'oublie pas mes consultations.

**Critères d'acceptation:**
- Affichage date, heure, type de consultation
- Compte à rebours (dans X jours)
- Lien vers l'agenda
- Masqué si aucun RDV planifié

### DASH-006 - Indicateur de messages non lus [Must Have] ✅
**En tant que** patient,
**Je veux** voir si j'ai des messages non lus,
**Afin de** je puisse répondre rapidement à mon nutritionniste.

**Critères d'acceptation:**
- Badge avec nombre de messages non lus
- Clic redirige vers la messagerie
- Mise à jour en temps réel

### DASH-007 - Objectifs hebdomadaires [Should Have] ✅
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

## 6. Mon dossier (7 stories)

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

## Légende des statuts

- ✅ Implémenté
- ⚠️ Partiellement implémenté (frontend prêt, backend requis)
- ⏳ À faire
- ❌ Non implémenté
- (pas de symbole) = Non commencé
