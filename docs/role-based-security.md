# Système de sécurité basé sur les rôles

## Vue d'ensemble

Ce document décrit le système de sécurité différencié selon les rôles utilisateurs dans NutriSensia, où les exigences d'authentification à deux facteurs (2FA) varient selon le type d'utilisateur.

## 🎯 **Réponse à votre question**

**Oui, actuellement les nutritionnistes ont besoin du AAL2 (2FA obligatoire).**

### Différenciation par rôle

| Rôle                  | Exigence 2FA    | Niveau AAL | Raison                                           |
| --------------------- | --------------- | ---------- | ------------------------------------------------ |
| **👨‍⚕️ Nutritionniste** | **Obligatoire** | **AAL2**   | Accès aux données de santé de plusieurs patients |
| **👤 Patient**        | **Recommandé**  | **AAL2**   | Protection des données personnelles de santé     |

## Architecture du système

### Logique de redirection selon le rôle

```typescript
// Dans useAuthRedirect.ts
if (userRole === 'nutritionist') {
  // Les nutritionnistes ont TOUJOURS besoin de AAL2
  if (nextLevel === 'aal2' && currentLevel === 'aal1') {
    // Redirection vers configuration/vérification 2FA
  }
} else {
  // Les patients peuvent utiliser AAL1 ou AAL2
  // Actuellement configuré pour AAL2 aussi
}
```

### Vérification des exigences

```typescript
const needsMFAForRole = async (role: string) => {
  if (role === 'nutritionist') {
    return true; // 2FA obligatoire
  }
  return true; // 2FA recommandé pour les patients
};
```

## 🔐 **Exigences de sécurité par rôle**

### 👨‍⚕️ **Nutritionniste**

- **2FA** : **Obligatoire**
- **Niveau AAL** : **AAL2**
- **Raison** : Accès aux données de santé de plusieurs patients
- **Conformité** : Standards de sécurité médicale
- **Protection** : Données sensibles de multiples patients

### 👤 **Patient**

- **2FA** : **Recommandé** (actuellement obligatoire)
- **Niveau AAL** : **AAL2**
- **Raison** : Protection des données personnelles de santé
- **Conformité** : RGPD et protection des données
- **Protection** : Données nutritionnelles personnelles

## 🚀 **Flux d'authentification par rôle**

### Pour les Nutritionnistes

1. **Connexion** → Email + mot de passe
2. **Vérification automatique** → Le système détecte le rôle "nutritionist"
3. **Redirection obligatoire** → Configuration 2FA si pas configuré
4. **Vérification 2FA** → Code d'authentification requis
5. **Accès à l'application** → AAL2 atteint

### Pour les Patients

1. **Connexion** → Email + mot de passe
2. **Vérification automatique** → Le système détecte le rôle "patient"
3. **Redirection recommandée** → Configuration 2FA (actuellement obligatoire)
4. **Vérification 2FA** → Code d'authentification requis
5. **Accès à l'application** → AAL2 atteint

## 🛡️ **Justification de la sécurité**

### Pourquoi AAL2 pour les nutritionnistes ?

- **Accès multi-patients** : Un nutritionniste accède aux données de plusieurs patients
- **Responsabilité légale** : Protection des données de santé
- **Conformité médicale** : Standards de sécurité du secteur santé
- **Prévention des fuites** : Protection contre les accès non autorisés

### Pourquoi AAL2 pour les patients ?

- **Données personnelles** : Informations nutritionnelles et médicales
- **RGPD** : Conformité avec la protection des données
- **Confidentialité** : Protection de la vie privée
- **Sécurité proactive** : Prévention des compromissions

## 🧪 **Pages de test**

### `/role-test`

- **Fonction** : Vérifier les exigences selon votre rôle
- **Affiche** : Rôle actuel, exigences 2FA, recommandations
- **Actions** : Tests de redirection, configuration 2FA

### `/auth-flow-test`

- **Fonction** : Tester le flux d'authentification complet
- **Affiche** : Statut 2FA, facteurs configurés
- **Actions** : Test des redirections automatiques

## 🔧 **Configuration technique**

### Récupération du rôle utilisateur

```typescript
// Dans les métadonnées Supabase
const userRole = session.user.user_metadata?.role || 'patient';
```

### Logique de redirection

```typescript
// Différenciation selon le rôle
if (userRole === 'nutritionist') {
  // Logique spécifique aux nutritionnistes
  // 2FA toujours obligatoire
} else {
  // Logique pour les patients
  // 2FA recommandé (actuellement obligatoire)
}
```

## 📊 **Évolutions futures**

### Configuration flexible

Actuellement, tous les utilisateurs ont besoin de AAL2. Possibilités d'évolution :

```typescript
// Configuration future possible
const securityConfig = {
  nutritionist: { mfaRequired: true, aalLevel: 'aal2' },
  patient: { mfaRequired: false, aalLevel: 'aal1' }, // Optionnel
};
```

### Rôles supplémentaires

- **Admin** : Gestion des utilisateurs et configuration
- **Assistant** : Accès limité aux données patients
- **Chercheur** : Accès anonymisé aux données

## 🚨 **Sécurité et conformité**

### Standards respectés

- **AAL2** : NIST SP 800-63B
- **RGPD** : Protection des données personnelles
- **HDS** : Hébergement des données de santé
- **ISO 27001** : Management de la sécurité

### Audit et traçabilité

- Logs d'authentification
- Historique des connexions
- Tentatives de connexion échouées
- Changements de configuration 2FA

## 💡 **Recommandations**

### Pour les nutritionnistes

1. **Configuration obligatoire** : Configurez le 2FA dès votre première connexion
2. **Application sécurisée** : Utilisez Google Authenticator ou Authy
3. **Sauvegarde** : Gardez vos codes de récupération en sécurité
4. **Formation** : Informez-vous sur les bonnes pratiques de sécurité

### Pour les patients

1. **Configuration recommandée** : Activez le 2FA pour plus de sécurité
2. **Protection personnelle** : Vos données nutritionnelles sont précieuses
3. **Simplicité** : Le 2FA est simple à configurer et utiliser
4. **Confiance** : Votre nutritionniste peut vous aider à configurer

## 🔍 **Dépannage**

### Problèmes courants

#### "2FA obligatoire pour nutritionniste"

- **Cause** : Rôle détecté comme "nutritionist"
- **Solution** : Configurer le 2FA ou vérifier le rôle

#### "Redirection en boucle"

- **Cause** : Erreur dans la vérification du rôle
- **Solution** : Vérifier les métadonnées utilisateur

#### "Rôle non reconnu"

- **Cause** : Métadonnées manquantes
- **Solution** : Réinscription ou mise à jour du profil

## 📞 **Support**

Pour toute question sur la sécurité ou la configuration :

- Consultez la page `/role-test` pour diagnostiquer
- Utilisez `/auth-flow-test` pour tester le flux
- Contactez l'équipe technique si nécessaire
