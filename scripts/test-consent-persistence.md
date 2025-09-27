# 🧪 Test de Persistance des Consentements

## Objectif
Vérifier que les cases à cocher des consentements reflètent correctement l'état sauvegardé en base de données.

## Étapes de Test

### 1. Test Initial (Cases vides)
1. Aller sur `http://localhost:3000/onboarding/nutritionist`
2. Ouvrir F12 → Console
3. Compléter jusqu'à l'étape de récapitulatif
4. **Vérifier** : Toutes les cases doivent être **décochées** par défaut

**Logs attendus :**
```
📋 Données de consentement chargées: {
  termsAccepted: false,
  privacyPolicyAccepted: false, 
  marketingConsent: false
}
🔄 Synchronisation états consentement avec données: {
  termsAccepted: false,
  privacyPolicyAccepted: false,
  marketingConsent: false
}
```

### 2. Test Sauvegarde
1. **Cocher** la case "Conditions d'utilisation"
2. **Cocher** la case "Politique de confidentialité"
3. **Cocher** la case "Communications marketing"

**Logs attendus pour chaque case :**
```
✅ Consentement termsAccepted sauvegardé: true
🔄 Déclenchement sauvegarde consentement depuis handleDataUpdate
💾 Sauvegarde termsAccepted: true
🔄 Mise à jour nutritionniste avec données: {...}
✅ Nutritionniste mis à jour avec succès
```

### 3. Test Persistance (Rechargement page)
1. **Recharger la page** (F5)
2. Compléter à nouveau jusqu'à l'étape de récapitulatif
3. **Vérifier** : Les cases doivent être **cochées** selon l'état sauvegardé

**Logs attendus :**
```
📋 Données de consentement chargées: {
  termsAccepted: true,
  privacyPolicyAccepted: true, 
  marketingConsent: true
}
🔄 Synchronisation états consentement avec données: {
  termsAccepted: true,
  privacyPolicyAccepted: true,
  marketingConsent: true
}
```

### 4. Test Modification
1. **Décocher** la case "Communications marketing"
2. **Vérifier** : Sauvegarde immédiate
3. **Recharger la page**
4. **Vérifier** : La case marketing doit être **décochée**, les autres **cochées**

**Logs attendus :**
```
📋 Données de consentement chargées: {
  termsAccepted: true,
  privacyPolicyAccepted: true, 
  marketingConsent: false  // ← Changé
}
```

## Résultats Attendus

✅ **Cases reflètent l'état DB** : Cochées si accepté, décochées si refusé
✅ **Sauvegarde immédiate** : Chaque clic déclenche une sauvegarde
✅ **Persistance complète** : État conservé après rechargement
✅ **Synchronisation parfaite** : Interface ↔ Base de données

## Vérification en Base de Données

Dans Supabase, exécuter :
```sql
SELECT 
    first_name,
    last_name,
    terms_accepted,
    privacy_policy_accepted,
    marketing_consent,
    terms_accepted_at,
    privacy_policy_accepted_at,
    marketing_consent_at
FROM nutritionists 
WHERE terms_accepted IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;
```

## Dépannage

**Si les cases ne se cochent pas :**
- Vérifier les logs de chargement des données
- Vérifier que la migration DB a bien ajouté les colonnes
- Vérifier que les données sont bien en base

**Si la sauvegarde ne fonctionne pas :**
- Vérifier les logs de handleDataUpdate
- Vérifier les logs de handleProgressSave
- Vérifier les erreurs Supabase dans la console


