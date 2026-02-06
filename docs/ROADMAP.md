# NutriSensia - Roadmap

Ce document liste les fonctionnalités futures planifiées pour NutriSensia.

---

## Visioconférence

### État actuel
- **Solution** : Jitsi Meet (gratuit, open-source)
- **Fonctionnement** : Génération automatique d'un lien `meet.jit.si/nutrisensia-{id}` pour chaque RDV en visio
- **Avantages** : Aucune configuration requise, RGPD-friendly, fonctionne immédiatement

### Évolution planifiée : Google Meet

**Priorité** : Moyenne
**Complexité** : Élevée
**Statut** : À planifier

#### Pourquoi Google Meet ?
- Meilleure familiarité des utilisateurs avec l'interface Google
- Qualité vidéo/audio supérieure
- Intégration native avec Google Calendar

#### Prérequis techniques
1. **API Google Calendar** - Pas d'API Google Meet directe ; il faut créer un événement Calendar avec `conferenceData`
2. **OAuth 2.0** - Le nutritionniste doit autoriser l'accès à son Google Calendar
3. **Credentials Google Cloud** - Clés API et OAuth client ID/secret
4. **Consentement utilisateur** - Écran de consentement Google à configurer

#### Architecture proposée
```
Patient réserve RDV
       ↓
API NutriSensia
       ↓
Google Calendar API (avec OAuth du nutritionniste)
       ↓
Événement créé avec conferenceData
       ↓
Lien Google Meet retourné et stocké en DB
```

#### Étapes d'implémentation
1. Créer un projet Google Cloud Console
2. Activer Google Calendar API
3. Configurer l'écran de consentement OAuth
4. Implémenter le flux OAuth pour les nutritionnistes (connexion Google)
5. Stocker les tokens de refresh en DB (chiffrés)
6. Créer les événements Calendar via API lors de la réservation
7. Extraire le lien Meet de la réponse API

#### Alternatives considérées

| Solution | Avantages | Inconvénients |
|----------|-----------|---------------|
| **Jitsi** (actuel) | Gratuit, simple, RGPD | Moins connu |
| **Google Meet** | Familier, qualité | OAuth complexe |
| **Zoom** | Très connu, API simple | Coût (payant) |
| **Cal.com** | Tout-en-un | Payant pour API |

---

## Autres fonctionnalités futures

### Notifications push
- **Priorité** : Haute
- **Description** : Notifications push mobile pour rappels de RDV
- **Technologies** : Firebase Cloud Messaging ou Web Push API

### Emails transactionnels
- **Priorité** : Haute
- **Description** : Envoi d'emails automatiques pour les événements clés
- **Emails prévus** :
  - Confirmation de rendez-vous (patient + nutritionniste)
  - Rappel de rendez-vous (J-1, H-1)
  - Annulation de rendez-vous
  - Modification de rendez-vous
  - Bienvenue après inscription
- **Technologies** : Resend, SendGrid ou Postmark
- **Templates** : React Email pour des templates maintenables

### Export des données patient
- **Priorité** : Moyenne
- **Description** : Export PDF/CSV des données nutritionnelles pour le patient
- **Conformité** : RGPD Article 20 (portabilité des données)

### Application mobile native
- **Priorité** : Basse
- **Description** : Version React Native de l'application
- **Prérequis** : Stabilisation de la version web

---

## Historique des décisions

| Date | Décision | Raison |
|------|----------|--------|
| 2025-02 | Abandon Cal.com | Nécessite plan payant pour l'API |
| 2025-02 | Choix Jitsi | Solution gratuite et immédiate |
| 2025-02 | Report Google Meet | Complexité OAuth, à implémenter plus tard |

---

*Dernière mise à jour : Février 2025*
