# Résolution de l'erreur "AAL2 required to enroll a new factor"

## 🚨 Problème
L'erreur `AAL2 required to enroll a new factor` apparaît lors de la tentative d'enrôlement du premier facteur MFA. Cette erreur indique que Supabase exige un niveau d'assurance AAL2 (déjà authentifié avec MFA) pour pouvoir enrôler de nouveaux facteurs MFA, créant un cercle vicieux.

## 🔍 Diagnostic

### Étape 1: Vérifier la configuration Supabase
1. Allez dans votre tableau de bord Supabase
2. Naviguez vers **Authentication > Settings**
3. Vérifiez la section **Multi-Factor Authentication**

### Étape 2: Exécuter le script de diagnostic
```bash
# Depuis le répertoire du projet
psql -h [YOUR_DB_HOST] -U postgres -d postgres -f scripts/fix-mfa-settings.sql
```

## 💡 Solutions

### Solution 1: Configuration via le tableau de bord Supabase
1. **Tableau de bord Supabase** → **Authentication** → **Settings**
2. Dans la section **Multi-Factor Authentication** :
   - ✅ Activer "Allow users to enroll MFA factors"
   - ✅ Désactiver "Require AAL2 for MFA enrollment" (si disponible)
   - ⚙️ Définir "Maximum enrolled factors per user" à `1` ou plus

### Solution 2: Configuration via SQL (pour les projets self-hosted)
```sql
-- Vérifier la configuration actuelle
SELECT name, value FROM auth.config WHERE name LIKE '%mfa%';

-- Permettre l'enrôlement du premier facteur (si la colonne existe)
UPDATE auth.config 
SET value = 'false' 
WHERE name = 'mfa_require_aal2_for_enrollment';

-- Activer l'enrôlement MFA
UPDATE auth.config 
SET value = 'true' 
WHERE name = 'mfa_enrollment_enabled';
```

### Solution 3: Politique RLS personnalisée (avancé)
```sql
-- Créer une politique pour permettre l'enrôlement du premier facteur
CREATE POLICY "allow_first_mfa_enrollment" ON auth.mfa_factors
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Permettre si l'utilisateur n'a aucun facteur vérifié
  NOT EXISTS (
    SELECT 1 FROM auth.mfa_factors 
    WHERE user_id = auth.uid() AND status = 'verified'
  )
);
```

### Solution 4: Contournement temporaire (développement uniquement)
```sql
-- ATTENTION: À utiliser uniquement en développement
-- Désactiver temporairement les vérifications AAL2
ALTER TABLE auth.mfa_factors DISABLE ROW LEVEL SECURITY;

-- Après les tests, réactiver la sécurité
ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;
```

## 🔧 Configuration recommandée pour NutriSensia

### Dans le tableau de bord Supabase:
1. **MFA Settings**:
   - ✅ `Enable MFA enrollment`
   - ❌ `Require AAL2 for enrollment` (désactivé)
   - 📊 `Max factors per user: 3`

2. **Security Settings**:
   - ✅ `Enable email confirmations`
   - ✅ `Secure email change`
   - ⏱️ `Session timeout: 24 hours`

## 🧪 Test de la solution

### 1. Tester l'enrôlement
```bash
# Aller sur la page de test
http://localhost:3000/test-mfa-enroll

# Se connecter avec un compte sans MFA
# Observer les logs de la console
```

### 2. Logs attendus (succès)
```
🔐 Initialisation de l'enrôlement MFA pour: user@example.com
🔍 Niveau d'assurance actuel: { currentLevel: 'aal1', nextLevel: null }
📋 Facteurs existants: { totp: [], phone: [] }
🔐 Données MFA reçues: { factorId: '...', hasQrCode: true, hasSecret: true }
✅ QR Code URI défini, longueur: 1234
```

## 🚨 Dépannage

### Erreur persiste après configuration
1. **Vider le cache du navigateur**
2. **Redémarrer le serveur de développement**
3. **Vérifier les variables d'environnement** (`.env.local`)
4. **Contacter le support Supabase** si le problème persiste

### Logs d'erreur courants
- `AAL2 required` → Configuration MFA incorrecte
- `Insufficient privileges` → Problème de permissions RLS
- `Factor already exists` → Facteur en cours d'enrôlement

## 📞 Support
Si le problème persiste après avoir suivi ce guide :
1. Vérifiez la [documentation Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa)
2. Consultez les [issues GitHub](https://github.com/supabase/supabase/issues)
3. Contactez le support Supabase via [supabase.help](https://supabase.help)

---

**Note**: Cette erreur est courante lors de la première configuration MFA. Une fois résolue, elle ne devrait plus se reproduire.

