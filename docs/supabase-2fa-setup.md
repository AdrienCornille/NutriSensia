# Configuration de l'authentification à deux facteurs (2FA) dans Supabase

## 🔧 Guide de configuration étape par étape

### **Étape 1 : Accéder au dashboard Supabase**

1. **Allez sur** : https://supabase.com/dashboard
2. **Connectez-vous** avec votre compte Supabase
3. **Sélectionnez votre projet** : `ywshijyzpmothwjnvrxi`

### **Étape 2 : Activer la 2FA dans Supabase**

1. **Dans le menu de gauche**, cliquez sur **"Authentication"**
2. **Cliquez sur "Settings"** (ou "Paramètres")
3. **Trouvez la section "Multi-Factor Authentication"**
4. **Activez l'option "Enable Multi-Factor Authentication"**

### **Étape 3 : Configurer les paramètres 2FA**

#### **Paramètres recommandés :**

- ✅ **Enable MFA** : Activé
- ✅ **TOTP (Time-based One-Time Password)** : Activé
- ✅ **SMS** : Optionnel (pour la récupération)
- ✅ **Enforcement** :
  - **Optional** : Pour les tests
  - **Required for specific roles** : Pour la production

#### **Configuration pour les rôles :**

1. **Dans la section "MFA Enforcement"**
2. **Sélectionnez "Required for specific roles"**
3. **Ajoutez les rôles** :
   - `nutritionist`
   - `admin`

### **Étape 4 : Configurer les politiques RLS (Row Level Security)**

#### **Politique pour les nutritionnistes (2FA obligatoire) :**

```sql
-- Politique pour les données sensibles des nutritionnistes
CREATE POLICY "Nutritionists require MFA for sensitive data" ON public.profiles
FOR ALL TO authenticated
USING (
  (auth.jwt() ->> 'aal') = 'aal2' OR
  (auth.jwt() ->> 'role') != 'nutritionist'
);
```

#### **Politique pour les patients (2FA optionnelle) :**

```sql
-- Politique pour les données des patients
CREATE POLICY "Patients can access their own data" ON public.profiles
FOR ALL TO authenticated
USING (
  auth.uid() = id OR
  (auth.jwt() ->> 'role') = 'admin'
);
```

### **Étape 5 : Tester la configuration**

#### **Test 1 : Vérifier l'activation**

1. Allez sur `http://localhost:3002/mfa-test`
2. Créez un compte avec le rôle "nutritionist"
3. Vérifiez que la 2FA est demandée

#### **Test 2 : Configuration 2FA**

1. Scannez le QR code avec Google Authenticator
2. Entrez le code de vérification
3. Vérifiez que la 2FA est activée

#### **Test 3 : Vérification obligatoire**

1. Déconnectez-vous
2. Reconnectez-vous
3. Vérifiez que la 2FA est demandée pour les nutritionnistes

### **Étape 6 : Configuration avancée (optionnelle)**

#### **Paramètres de sécurité supplémentaires :**

1. **Session timeout** : 24 heures
2. **Refresh token rotation** : Activé
3. **Secure cookie** : Activé
4. **SameSite** : Lax

#### **Configuration des emails :**

1. **Email templates** : Personnaliser les emails de vérification
2. **SMTP settings** : Configurer un serveur SMTP personnalisé

### **Étape 7 : Monitoring et logs**

#### **Activer les logs d'authentification :**

1. **Dans "Settings" > "Logs"**
2. **Activez "Auth logs"**
3. **Configurez les alertes** pour les tentatives suspectes

#### **Surveillance des événements :**

- Tentatives de connexion échouées
- Activations/désactivations de 2FA
- Changements de rôles
- Accès aux données sensibles

### **Étape 8 : Tests de sécurité**

#### **Tests à effectuer :**

1. **Test de contournement** :
   - Essayer d'accéder aux données sans 2FA
   - Vérifier que les politiques RLS fonctionnent

2. **Test de récupération** :
   - Simuler la perte d'un appareil 2FA
   - Tester les codes de récupération

3. **Test de performance** :
   - Vérifier les temps de réponse
   - Tester avec plusieurs utilisateurs

### **🔧 Dépannage**

#### **Problème : 2FA ne s'active pas**

- Vérifiez que MFA est activé dans Supabase
- Vérifiez les politiques RLS
- Vérifiez les logs d'authentification

#### **Problème : Codes rejetés**

- Vérifiez la synchronisation de l'heure
- Vérifiez l'application d'authentification
- Vérifiez les paramètres TOTP

#### **Problème : Redirection en boucle**

- Vérifiez le middleware Next.js
- Vérifiez les routes protégées
- Vérifiez les niveaux d'assurance (AAL)

### **📚 Ressources supplémentaires**

- [Documentation Supabase MFA](https://supabase.com/docs/guides/auth/mfa)
- [Guide de sécurité Supabase](https://supabase.com/docs/guides/auth/security)
- [Politiques RLS](https://supabase.com/docs/guides/auth/row-level-security)

### **✅ Checklist de validation**

- [ ] MFA activé dans Supabase
- [ ] Politiques RLS configurées
- [ ] Tests de 2FA réussis
- [ ] Vérification obligatoire pour nutritionnistes
- [ ] Logs d'authentification activés
- [ ] Tests de sécurité effectués
- [ ] Documentation mise à jour

---

**Une fois ces étapes terminées, votre système 2FA sera entièrement fonctionnel !** 🔐✨
