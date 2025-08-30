# 🔐 Guide visuel : Activer la 2FA dans Supabase

## 🚨 **PROBLÈME IDENTIFIÉ**

La 2FA n'est **PAS ACTIVÉE** dans votre projet Supabase. C'est pourquoi le QR code ne s'affiche pas.

## 📋 **Étapes pour activer la 2FA**

### **Étape 1 : Accéder au dashboard Supabase**

1. **Allez sur** : https://supabase.com/dashboard
2. **Connectez-vous** avec votre compte Supabase
3. **Sélectionnez votre projet** : `ywshijyzpmothwjnvrxi`

### **Étape 2 : Aller dans Authentication**

1. **Dans le menu de gauche**, cherchez **"Authentication"**
2. **Cliquez sur "Authentication"**

### **Étape 3 : Accéder aux paramètres**

1. **Dans la page Authentication**, cherchez **"Settings"** ou **"Paramètres"**
2. **Cliquez sur "Settings"**

### **Étape 4 : Activer la 2FA**

1. **Faites défiler** jusqu'à la section **"Multi-Factor Authentication"**
2. **Trouvez l'option "Enable Multi-Factor Authentication"**
3. **Activez le toggle** (il doit passer de gris à bleu/vert)

### **Étape 5 : Configurer les paramètres**

#### **Paramètres recommandés :**

- ✅ **Enable MFA** : **ACTIVÉ**
- ✅ **TOTP (Time-based One-Time Password)** : **ACTIVÉ**
- ✅ **SMS** : **Optionnel** (pour la récupération)
- ✅ **Enforcement** : **Optional** (pour les tests)

#### **Configuration pour les rôles (optionnel) :**

1. **Dans "MFA Enforcement"**
2. **Sélectionnez "Required for specific roles"**
3. **Ajoutez les rôles** :
   - `nutritionist`
   - `admin`

### **Étape 6 : Sauvegarder**

1. **Cliquez sur "Save"** ou **"Sauvegarder"**
2. **Attendez la confirmation** que les paramètres sont sauvegardés

## 🧪 **Vérification après activation**

### **Test 1 : Vérifier avec le script**

```bash
npm run check-mfa
```

### **Test 2 : Tester sur l'application**

1. Allez sur `http://localhost:3002/mfa-test`
2. Créez un compte avec le rôle "nutritionist"
3. Cliquez sur "Configurer la 2FA"
4. **Le QR code devrait maintenant s'afficher !**

## 🔍 **Où trouver les paramètres MFA dans Supabase**

### **Navigation typique :**

```
Dashboard Supabase
├── Votre projet (ywshijyzpmothwjnvrxi)
    ├── Authentication (menu de gauche)
        ├── Settings
            ├── Multi-Factor Authentication
                ├── Enable Multi-Factor Authentication ← ACTIVER ICI
                ├── TOTP ← ACTIVER
                ├── SMS ← Optionnel
                └── Enforcement ← Optional
```

## ⚠️ **Si vous ne trouvez pas les paramètres**

### **Vérifiez que :**

1. Vous êtes connecté au bon projet Supabase
2. Vous avez les permissions d'administrateur
3. Votre projet Supabase est à jour

### **Alternative :**

Si vous ne trouvez pas les paramètres MFA, il est possible que :

- Votre projet Supabase soit sur une version plus ancienne
- Vous ayez besoin de mettre à jour votre projet
- Les paramètres soient dans une section différente

## 📞 **Aide supplémentaire**

### **Si vous avez des difficultés :**

1. **Capturez une capture d'écran** de votre dashboard Supabase
2. **Cherchez "MFA"** ou **"Multi-Factor"** dans la barre de recherche
3. **Vérifiez la documentation Supabase** : https://supabase.com/docs/guides/auth/mfa

### **Contactez le support Supabase si nécessaire :**

- Documentation : https://supabase.com/docs
- Support : https://supabase.com/support

## ✅ **Checklist de validation**

- [ ] Accédé au dashboard Supabase
- [ ] Allé dans Authentication > Settings
- [ ] Trouvé la section "Multi-Factor Authentication"
- [ ] Activé "Enable Multi-Factor Authentication"
- [ ] Activé "TOTP"
- [ ] Sauvegardé les paramètres
- [ ] Testé avec `npm run check-mfa`
- [ ] Vérifié que le QR code s'affiche sur `/mfa-test`

---

**Une fois la 2FA activée dans Supabase, le QR code devrait s'afficher correctement !** 🎯
