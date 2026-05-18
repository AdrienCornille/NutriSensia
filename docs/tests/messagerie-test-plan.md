# Plan de test - Epic Messagerie

> **87 cas de test** couvrant 8 domaines fonctionnels.
> Cocher la case `[ ]` au fur et a mesure de la validation.

---

## Prerequis

Avant de commencer les tests, verifier que tout est en place :

- [ ] Migration `add_nutritionist_presence.sql` executee
- [ ] Migration `add_messages_fts.sql` executee (+ extension `pg_trgm` active)
- [ ] Migration `14_notifications.sql` executee (tables `notifications`, `notification_types`)
- [ ] 2 comptes de test disponibles :
  - **P** = compte patient
  - **N** = compte nutritionniste
  - Les deux sont lies par une conversation existante
- [ ] Le patient **P** a un plan alimentaire actif (statut `published`)
- [ ] Ouvrir **P** et **N** dans 2 navigateurs differents (ou 1 normal + 1 navigation privee)

---

## 1. MSG-007 - Notification nouveau message

> Quand un utilisateur envoie un message, le destinataire recoit une notification in-app.

### Test 1 - Patient envoie un message

- **Etapes** : P > messagerie > envoyer un message texte
- **Attendu** : En DB, nouvelle ligne dans `notifications` pour N, type `new_message`
- [ ] OK

### Test 2 - Nutritionniste recoit la notification

- **Etapes** : N > cliquer sur "Notifications" dans la sidebar
- **Attendu** : La notification "X vous a envoye un message" apparait dans la liste
- [ ] OK

### Test 3 - Nutritionniste envoie un message

- **Etapes** : N > messagerie > selectionner la conversation > envoyer un message
- **Attendu** : En DB, nouvelle ligne dans `notifications` pour P, type `new_message`
- [ ] OK

### Test 4 - Patient voit le badge

- **Etapes** : P > regarder le badge sur la cloche en haut a droite
- **Attendu** : Badge rouge avec le nombre de notifications non lues
- [ ] OK

### Test 5 - Patient ouvre les notifications

- **Etapes** : P > cliquer sur la cloche
- **Attendu** : Page notifications avec "X vous a envoye un message"
- [ ] OK

### Test 6 - Erreur notification non bloquante

- **Etapes** : Simuler une erreur (ex: supprimer le profil de l'expediteur temporairement)
- **Attendu** : Le message est envoye avec succes malgre l'echec de notification (warning en console serveur)
- [ ] OK

---

## 2. MSG-008 - Presence en ligne du nutritionniste

> Le patient voit si son nutritionniste est en ligne, avec un indicateur de temps de reponse moyen.

### 2.1 Heartbeat

### Test 7 - Heartbeat au chargement

- **Etapes** : N > ouvrir la messagerie. Ouvrir DevTools (F12) > onglet Network > filtrer sur `presence`
- **Attendu** : Un `POST /api/protected/conversations/presence` apparait immediatement (status 200)
- [ ] OK

### Test 8 - Heartbeat periodique

- **Etapes** : N > rester sur la messagerie pendant 2 minutes
- **Attendu** : Un nouveau `POST presence` toutes les 60 secondes dans l'onglet Network
- [ ] OK

### Test 9 - Cleanup a la navigation

- **Etapes** : N > cliquer sur "Dashboard" dans la sidebar
- **Attendu** : Aucun nouveau `POST presence` pendant 2 minutes apres avoir quitte la page
- [ ] OK

### Test 10 - Cleanup a la fermeture d'onglet

- **Etapes** : N > fermer l'onglet messagerie
- **Attendu** : Cote P, apres 2 minutes, le statut du nutritionniste passe hors ligne
- [ ] OK

### 2.2 Affichage du statut cote patient

### Test 11 - Statut "En ligne"

- **Etapes** : N est sur la messagerie. P ouvre sa messagerie
- **Attendu** : Header > point vert + texte "En ligne"
- [ ] OK

### Test 12 - Statut hors ligne

- **Etapes** : N quitte la messagerie > attendre plus de 2 minutes > P rafraichit sa page
- **Attendu** : Header > point gris + "Vu il y a X min"
- [ ] OK

### Test 13 - Temps de reponse moyen

- **Etapes** : Apres plusieurs echanges de messages sur quelques jours
- **Attendu** : Affichage "~X min" avec icone horloge a cote du statut hors ligne
- [ ] OK

### Test 14 - Pas de donnees de presence

- **Etapes** : Nouveau nutritionniste, aucun heartbeat encore envoye
- **Attendu** : Statut par defaut affiche, pas de crash
- [ ] OK

---

## 3. MSG-N-006 - Recherche full-text dans les messages

> Recherche avec stemming francais (PostgreSQL tsvector) et surlignage des resultats.

### 3.1 Cote nutritionniste

### Test 15 - Ouvrir la recherche

- **Etapes** : N > messagerie > cliquer sur l'icone loupe dans le header de la sidebar
- **Attendu** : Modal de recherche s'ouvre avec un champ de saisie
- [ ] OK

### Test 16 - Recherche basique

- **Etapes** : Taper un mot present dans les messages (ex: "bonjour")
- **Attendu** : Resultats affiches avec le mot surligne en jaune
- [ ] OK

### Test 17 - Stemming francais

- **Etapes** : Taper "mange" alors qu'un message contient "manger" ou "mangeons"
- **Attendu** : Le message est trouve grace au stemming francais
- [ ] OK

### Test 18 - Aucun resultat

- **Etapes** : Taper un terme inexistant (ex: "xyzabc123")
- **Attendu** : Message "Aucun resultat" affiche
- [ ] OK

### Test 19 - Clic sur un resultat

- **Etapes** : Cliquer sur un resultat d'une conversation
- **Attendu** : La conversation correspondante est selectionnee, le modal se ferme
- [ ] OK

### Test 20 - Debounce

- **Etapes** : Taper rapidement "bon" puis "bonjour"
- **Attendu** : Une seule requete API part pour "bonjour" (verifier dans Network)
- [ ] OK

### 3.2 Cote patient

### Test 21 - Ouvrir la recherche

- **Etapes** : P > messagerie > cliquer sur l'icone loupe dans le header
- **Attendu** : Modal de recherche s'ouvre
- [ ] OK

### Test 22 - Recherche et resultats

- **Etapes** : Taper un mot existant dans les messages
- **Attendu** : Resultats avec surlignage affiches
- [ ] OK

### Test 23 - Fermer la recherche

- **Etapes** : Cliquer sur X ou a l'exterieur du modal
- **Attendu** : Le modal se ferme
- [ ] OK

### 3.3 Securite

### Test 24 - Isolation des conversations

- **Etapes** : P cherche un terme present uniquement dans la conversation d'un autre patient
- **Attendu** : Aucun resultat retourne (les fonctions SQL filtrent par `user_id`)
- [ ] OK

### 3.4 Fallback

### Test 25 - Fallback ILIKE (sans migration FTS)

- **Etapes** : Si la RPC `search_messages` n'existe pas (migration non passee)
- **Attendu** : La recherche fonctionne en mode degrade via ILIKE (verifier logs serveur)
- [ ] OK

---

## 4. PAT-004 - Onglet messages dans le dossier patient

> Le nutritionniste peut envoyer des messages depuis la fiche patient.

### Test 26 - Chargement de la conversation

- **Etapes** : N > Patients > cliquer sur un patient > onglet "Messages"
- **Attendu** : La conversation se charge, messages affiches
- [ ] OK

### Test 27 - Creation automatique de conversation

- **Etapes** : N > ouvrir l'onglet Messages pour un patient sans conversation existante
- **Attendu** : Conversation creee automatiquement, UI prete pour envoyer
- [ ] OK

### Test 28 - Envoyer un message

- **Etapes** : N > taper un message et cliquer sur envoyer
- **Attendu** : Message envoye, apparait dans la liste, compteur de messages mis a jour
- [ ] OK

### Test 29 - Quick replies

- **Etapes** : N > cliquer sur une reponse rapide
- **Attendu** : Le texte de la reponse rapide s'insere dans l'input
- [ ] OK

### Test 30 - Piece jointe image

- **Etapes** : N > cliquer sur trombone > choisir une image
- **Attendu** : Upload reussi, image affichee dans la conversation
- [ ] OK

### Test 31 - Piece jointe document

- **Etapes** : N > cliquer sur trombone > choisir un PDF
- **Attendu** : Upload reussi, lien du document affiche dans la conversation
- [ ] OK

### Test 32 - Etat vide

- **Etapes** : N > ouvrir l'onglet pour un patient sans aucun message
- **Attendu** : Message "Aucun message - Envoyez un message a [nom]"
- [ ] OK

### Test 33 - Realtime

- **Etapes** : P envoie un message pendant que N a l'onglet Messages ouvert
- **Attendu** : Le message apparait en temps reel chez N sans rafraichir
- [ ] OK

---

## 5. MSG-009 - Demande de modification du plan alimentaire

> Le patient peut demander une modification de son plan via la messagerie.

### 5.1 Bouton et formulaire

### Test 34 - Bouton active (plan actif)

- **Etapes** : P a un plan alimentaire actif
- **Attendu** : Le bouton crayon dans le header de la messagerie est cliquable
- [ ] OK

### Test 35 - Bouton desactive (pas de plan)

- **Etapes** : P n'a pas de plan actif (supprimer ou archiver le plan)
- **Attendu** : Bouton grise avec tooltip "Aucun plan alimentaire actif"
- [ ] OK

### Test 36 - Ouvrir le formulaire

- **Etapes** : P > cliquer sur le bouton crayon
- **Attendu** : Modal avec grille de 5 types de modification
- [ ] OK

### Test 37 - Selection de type

- **Etapes** : Cliquer sur chaque type de modification
- **Attendu** : Le type selectionne est surligne en vert
- [ ] OK

### 5.2 Validation du formulaire

### Test 38 - Titre trop court

- **Etapes** : Saisir un titre de 2 caracteres
- **Attendu** : Bouton "Envoyer" reste desactive
- [ ] OK

### Test 39 - Description trop courte

- **Etapes** : Saisir une description de 3 caracteres
- **Attendu** : Bouton "Envoyer" reste desactive
- [ ] OK

### Test 40 - Formulaire valide

- **Etapes** : Titre >= 3 caracteres, description >= 5 caracteres
- **Attendu** : Bouton "Envoyer" devient actif (vert)
- [ ] OK

### 5.3 Champ alternative

### Test 41 - Type "Substitution"

- **Etapes** : Selectionner le type "Substitution"
- **Attendu** : Le champ "Alternative suggeree" apparait
- [ ] OK

### Test 42 - Type "Ajout"

- **Etapes** : Selectionner le type "Ajout"
- **Attendu** : Le champ "Alternative suggeree" apparait
- [ ] OK

### Test 43 - Autres types

- **Etapes** : Selectionner "Suppression", "Quantite" ou "Autre"
- **Attendu** : Pas de champ "Alternative suggeree"
- [ ] OK

### 5.4 Soumission

### Test 44 - Soumission reussie

- **Etapes** : Remplir le formulaire completement et soumettre
- **Attendu** : Modal se ferme, message de type `modification_request` apparait dans la conversation
- [ ] OK

### Test 45 - Bulle speciale

- **Etapes** : Regarder la conversation apres la soumission
- **Attendu** : Bulle ambree avec icone crayon, badge "En attente", titre et description
- [ ] OK

### Test 46 - Alternative affichee

- **Etapes** : Soumettre avec type "Substitution" et un texte d'alternative
- **Attendu** : La bulle affiche une fleche + le texte de l'alternative suggeree
- [ ] OK

### Test 47 - Annuler

- **Etapes** : Cliquer sur "Annuler" dans le formulaire
- **Attendu** : Modal se ferme, rien n'est envoye
- [ ] OK

### 5.5 Statuts (cote nutritionniste)

### Test 48 - Modification approuvee

- **Etapes** : N approuve la demande via l'API de modification requests
- **Attendu** : Badge vert "Approuvee" dans la bulle du message
- [ ] OK

### Test 49 - Modification refusee

- **Etapes** : N refuse la demande via l'API
- **Attendu** : Badge rouge "Refusee" dans la bulle du message
- [ ] OK

### 5.6 Erreurs

### Test 50 - Plan inexistant

- **Etapes** : Forcer un `mealPlanId` invalide (via DevTools)
- **Attendu** : Message d'erreur affiche dans le formulaire
- [ ] OK

### Test 51 - Conversation invalide

- **Etapes** : Forcer un `conversationId` invalide (via DevTools)
- **Attendu** : Message d'erreur affiche dans le formulaire
- [ ] OK

---

## 6. MSG-010 - Export conversation en PDF

> Export de l'historique de conversation au format PDF formate.

### 6.1 Cote patient

### Test 52 - Bouton export visible

- **Etapes** : P > messagerie > regarder les icones dans le header
- **Attendu** : Icone de telechargement visible et cliquable
- [ ] OK

### Test 53 - Telechargement du PDF

- **Etapes** : P > cliquer sur le bouton export
- **Attendu** : Fichier `conversation-YYYY-MM-DD.pdf` telecharge automatiquement
- [ ] OK

### Test 54 - Spinner pendant l'export

- **Etapes** : Observer pendant la generation du PDF
- **Attendu** : Icone remplacee par un spinner, bouton desactive
- [ ] OK

### 6.2 Cote nutritionniste

### Test 55 - Bouton export visible

- **Etapes** : N > messagerie > selectionner une conversation
- **Attendu** : Icone de telechargement visible dans le header de la conversation
- [ ] OK

### Test 56 - Telechargement du PDF

- **Etapes** : N > cliquer sur le bouton export
- **Attendu** : Fichier PDF telecharge
- [ ] OK

### 6.3 Contenu du PDF

### Test 57 - Header du PDF

- **Verification** : Ouvrir le PDF telecharge
- **Attendu** : "NutriSensia", "Export de conversation", noms du patient et du nutritionniste, date de debut de conversation, date d'export
- [ ] OK

### Test 58 - Messages

- **Verification** : Corps du PDF
- **Attendu** : Messages en ordre chronologique avec nom de l'expediteur et horodatage (HH:MM)
- [ ] OK

### Test 59 - Couleur du nutritionniste

- **Verification** : Nom de l'expediteur nutritionniste
- **Attendu** : Le nom est affiche en vert (#1B998B)
- [ ] OK

### Test 60 - Separateurs de date

- **Verification** : Conversation s'etalant sur plusieurs jours
- **Attendu** : Ligne separatrice avec la date entre les jours differents
- [ ] OK

### Test 61 - Pieces jointes

- **Verification** : Message contenant une piece jointe
- **Attendu** : Indicateur avec icone trombone et nom du fichier
- [ ] OK

### Test 62 - Demande de modification

- **Verification** : Message de type modification dans la conversation
- **Attendu** : Mention "Demande de modification" affichee
- [ ] OK

### Test 63 - Messages systeme

- **Verification** : Message systeme dans la conversation
- **Attendu** : Affiche centre, en gris, avec horodatage
- [ ] OK

### Test 64 - Pagination

- **Verification** : Conversation longue (plus de 50 messages)
- **Attendu** : Saut de page automatique, aucun texte coupe entre les pages
- [ ] OK

### Test 65 - Footer

- **Verification** : Derniere page du PDF
- **Attendu** : Compteur de messages + "NutriSensia (c) 2026"
- [ ] OK

### Test 66 - Conversation vide

- **Etapes** : Exporter une conversation sans aucun message
- **Attendu** : PDF avec header et footer, 0 messages exportes
- [ ] OK

### 6.4 Securite

### Test 67 - Acces non autorise

- **Etapes** : Tenter un `POST /api/protected/conversations/{id_autre_user}/export`
- **Attendu** : Reponse 403 Forbidden
- [ ] OK

---

## 7. Notifications in-app

> Centre de notifications pour patient et nutritionniste, connecte a l'API reelle.

### 7.1 Cote nutritionniste

### Test 68 - Badge dans la sidebar

- **Etapes** : Des notifications non lues existent en DB pour N
- **Attendu** : Badge rouge avec compteur sur "Notifications" dans la sidebar
- [ ] OK

### Test 69 - Page notifications

- **Etapes** : N > cliquer sur "Notifications" dans la sidebar
- **Attendu** : Page avec liste des notifications, filtres en haut, compteur de non lues
- [ ] OK

### Test 70 - Filtrer par type

- **Etapes** : Cliquer sur "Messages", "RDV", "Plans", "Systeme"
- **Attendu** : Seules les notifications du type selectionne sont affichees
- [ ] OK

### Test 71 - Filtrer non lues

- **Etapes** : Cliquer sur le filtre "Non lues"
- **Attendu** : Seules les notifications non lues sont affichees
- [ ] OK

### Test 72 - Marquer une notification comme lue

- **Etapes** : Cliquer sur l'icone check d'une notification
- **Attendu** : La notification passe en "lue" (fond blanc), badge compteur mis a jour
- [ ] OK

### Test 73 - Tout marquer comme lu

- **Etapes** : Cliquer sur "Tout marquer comme lu"
- **Attendu** : Toutes les notifications passent en lues, badge disparait
- [ ] OK

### Test 74 - Supprimer une notification

- **Etapes** : Cliquer sur l'icone corbeille d'une notification
- **Attendu** : La notification disparait de la liste
- [ ] OK

### Test 75 - Tout effacer

- **Etapes** : Cliquer sur "Tout effacer" > confirmer dans le dialogue
- **Attendu** : Toutes les notifications disparaissent
- [ ] OK

### Test 76 - Etat vide

- **Etapes** : Aucune notification existante
- **Attendu** : Message "Aucune notification - Vous etes a jour !"
- [ ] OK

### 7.2 Cote patient

### Test 77 - Badge dans le header

- **Etapes** : Des notifications non lues existent en DB pour P
- **Attendu** : Badge rouge sur la cloche dans le header patient
- [ ] OK

### Test 78 - Page notifications

- **Etapes** : P > cliquer sur la cloche
- **Attendu** : Page avec liste, filtres, groupement par date (Aujourd'hui, Hier, etc.)
- [ ] OK

### Test 79 - Marquer comme lu

- **Etapes** : Interagir avec une notification
- **Attendu** : Passe en lue (appel API PATCH verifie dans Network)
- [ ] OK

### Test 80 - Supprimer

- **Etapes** : Cliquer sur supprimer
- **Attendu** : Notification disparait (appel API DELETE verifie dans Network)
- [ ] OK

### Test 81 - Donnees reelles (pas de mock)

- **Etapes** : Verifier l'onglet Network lors du chargement de la page
- **Attendu** : Appel a `/api/protected/notifications`, pas d'import de `mock-notifications`
- [ ] OK

---

## 8. Tests transversaux

> Tests qui couvrent plusieurs features ou des cas limites.

### Test 82 - Realtime bidirectionnel

- **Etapes** : P envoie un message, observer chez N. Puis N envoie un message, observer chez P
- **Attendu** : Messages visibles en temps reel sans rafraichissement de page
- [ ] OK

### Test 83 - Mobile responsive : recherche

- **Etapes** : Ouvrir la recherche sur un ecran mobile (< 640px ou DevTools responsive)
- **Attendu** : Modal centree avec marges laterales, pas de debordement horizontal
- [ ] OK

### Test 84 - Mobile responsive : formulaire modification

- **Etapes** : Ouvrir le formulaire de modification de plan sur mobile
- **Attendu** : Formulaire scrollable, boutons accessibles en bas
- [ ] OK

### Test 85 - Mobile responsive : messagerie nutritionniste

- **Etapes** : Ouvrir la messagerie nutritionniste sur mobile
- **Attendu** : Liste des conversations en plein ecran, conversation selectionnee avec bouton retour (chevron)
- [ ] OK

### Test 86 - Erreur reseau

- **Etapes** : DevTools > Network > cocher "Offline" > envoyer un message
- **Attendu** : Toast d'erreur rouge en bas de page, pas de crash, pas de freeze
- [ ] OK

### Test 87 - Session expiree

- **Etapes** : Laisser la session expirer puis tenter d'envoyer un message
- **Attendu** : Redirection vers la page de connexion ou message d'erreur clair
- [ ] OK

---

## Resume

| #   | Feature                         | Nb tests | Statut      |
| --- | ------------------------------- | -------- | ----------- |
| 1   | MSG-007 Notification message    | 6        | \_ / 6      |
| 2   | MSG-008 Presence en ligne       | 8        | \_ / 8      |
| 3   | MSG-N-006 Recherche full-text   | 11       | \_ / 11     |
| 4   | PAT-004 Onglet messages dossier | 8        | \_ / 8      |
| 5   | MSG-009 Modification plan       | 18       | \_ / 18     |
| 6   | MSG-010 Export PDF              | 16       | \_ / 16     |
| 7   | Notifications in-app            | 14       | \_ / 14     |
| 8   | Tests transversaux              | 6        | \_ / 6      |
|     | **Total**                       | **87**   | **\_ / 87** |
