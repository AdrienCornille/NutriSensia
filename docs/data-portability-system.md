# Système de Portabilité des Données - Conforme RGPD

## Vue d'ensemble

Le système de portabilité des données de NutriSensia est une solution complète et conforme au RGPD qui permet aux utilisateurs d'exercer leurs droits fondamentaux concernant leurs données personnelles. Il implémente les articles 15 (droit d'accès) et 20 (droit à la portabilité) du RGPD.

## Fonctionnalités principales

### 1. Export de données complet
- **Formats multiples** : JSON (recommandé), CSV, XML
- **Sélection granulaire** : Choix des sections de données à exporter
- **Chiffrement optionnel** : Protection par mot de passe AES-256
- **Métadonnées RGPD** : Informations de conformité incluses
- **Liens temporaires** : Téléchargements sécurisés avec expiration

### 2. Import de données flexible
- **Validation automatique** : Vérification de l'intégrité des données
- **Gestion des conflits** : Stratégies de fusion intelligentes
- **Prévisualisation** : Aperçu avant import
- **Sauvegarde automatique** : Protection contre la perte de données

### 3. Historique et audit complets
- **Traçabilité complète** : Enregistrement de toutes les opérations
- **Informations techniques** : IP, user-agent, timestamps
- **Statuts détaillés** : Suivi en temps réel des opérations
- **Rétention conforme** : Suppression automatique après 7 jours

### 4. Sécurité renforcée
- **Chiffrement en transit** : HTTPS obligatoire
- **Chiffrement au repos** : Stockage sécurisé
- **Authentification forte** : Vérification d'identité
- **Checksums** : Vérification d'intégrité SHA-256

## Architecture technique

### Composants principaux

```
src/
├── lib/
│   └── data-export.ts              # Services d'export/import
├── hooks/
│   └── useDataExport.ts            # Hooks React avec TanStack Query
└── components/data-export/
    ├── DataExportWizard.tsx        # Assistant d'export
    ├── DataImportWizard.tsx        # Assistant d'import
    ├── ExportHistory.tsx           # Historique des opérations
    ├── DataPortabilityDashboard.tsx # Tableau de bord principal
    └── index.ts                    # Exports centralisés
```

### Services backend

#### DataExportService
```typescript
class DataExportService {
  // Export complet des données utilisateur
  async exportUserData(options: ExportOptions): Promise<ExportResult>
  
  // Collecte des données par section
  private async collectUserData(sections: ExportSection[]): Promise<Record<string, any>>
  
  // Formatage selon le format demandé
  private async formatData(data: Record<string, any>, format: string): Promise<string>
  
  // Chiffrement optionnel
  private async encryptData(data: string, password: string): Promise<string>
}
```

#### DataImportService
```typescript
class DataImportService {
  // Import de données depuis fichier
  async importUserData(fileContent: string, options: ImportOptions): Promise<void>
  
  // Validation des données
  private async validateImportData(data: any): Promise<void>
  
  // Traitement selon stratégie de conflit
  private async processImportData(data: any, strategy: ConflictStrategy): Promise<void>
}
```

### Hooks React optimisés

#### useDataExport
```typescript
const {
  startExport,      // Démarre un export
  isExporting,      // État de chargement
  progress,         // Progression (0-100)
  result,           // Résultat de l'export
  error,           // Erreur éventuelle
  downloadExport   // Télécharge le résultat
} = useDataExport();
```

#### useDataImport
```typescript
const {
  startImport,      // Démarre un import
  isImporting,      // État de chargement
  progress,         // Progression (0-100)
  isSuccess,        // Succès de l'import
  error            // Erreur éventuelle
} = useDataImport();
```

## Conformité RGPD

### Articles implémentés

#### Article 15 - Droit d'accès
- ✅ **Confirmation du traitement** : L'utilisateur peut confirmer que ses données sont traitées
- ✅ **Accès aux données** : Export complet de toutes les données personnelles
- ✅ **Informations sur le traitement** : Métadonnées incluses dans l'export
- ✅ **Finalités du traitement** : Documentation des usages
- ✅ **Durée de conservation** : Information sur la rétention des données

#### Article 20 - Droit à la portabilité
- ✅ **Format structuré** : JSON, CSV, XML supportés
- ✅ **Lisible par machine** : Formats standards
- ✅ **Transmission directe** : Possibilité d'import/export
- ✅ **Données fournies** : Toutes les données saisies par l'utilisateur
- ✅ **Traitement automatisé** : Données générées par le système

### Mesures de sécurité

#### Technique
- **Chiffrement AES-256** : Protection des données sensibles
- **HTTPS obligatoire** : Transmission sécurisée
- **Checksums SHA-256** : Vérification d'intégrité
- **Liens signés** : URLs de téléchargement temporaires
- **Expiration automatique** : Suppression après 7 jours

#### Organisationnelle
- **Audit complet** : Traçabilité de toutes les opérations
- **Authentification forte** : Vérification d'identité
- **Logs sécurisés** : Enregistrement des accès
- **Formation équipe** : Sensibilisation RGPD

## Guide d'utilisation

### Installation et configuration

1. **Dépendances requises** :
```bash
npm install @tanstack/react-query framer-motion lucide-react
```

2. **Configuration Supabase** :
```sql
-- Bucket pour les exports (à créer dans Supabase Storage)
CREATE BUCKET exports;

-- Policies RLS pour la sécurité
CREATE POLICY "Users can upload their own exports" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'exports' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Utilisation de base

#### Tableau de bord complet
```tsx
import { DataPortabilityDashboard } from '@/components/data-export';

function MyPage() {
  return (
    <DataPortabilityDashboard 
      initialView="overview"
      onClose={() => {/* Navigation */}}
    />
  );
}
```

#### Assistant d'export uniquement
```tsx
import { DataExportWizard } from '@/components/data-export';

function ExportPage() {
  return (
    <DataExportWizard
      onComplete={() => console.log('Export terminé')}
      onClose={() => console.log('Assistant fermé')}
    />
  );
}
```

#### Historique des exports
```tsx
import { ExportHistory } from '@/components/data-export';

function HistoryPage() {
  return (
    <ExportHistory 
      pageSize={10}
      compact={false}
    />
  );
}
```

### Configuration avancée

#### Options d'export personnalisées
```typescript
const customExportOptions: ExportOptions = {
  format: 'json',
  sections: ['profile', 'professional', 'medical'],
  includeMetadata: true,
  encrypt: true,
  password: 'motDePasseSecurise123!',
  includeFiles: true
};
```

#### Validation personnalisée
```typescript
const { validateFile, validateImportData } = useImportValidation();

// Validation de fichier
const fileValidation = validateFile(selectedFile);
if (!fileValidation.isValid) {
  console.error('Erreurs:', fileValidation.errors);
}

// Validation de données
const dataValidation = await validateImportData(fileContent, 'json');
```

## Sections de données exportables

### Utilisateurs communs
- **profile** : Données personnelles de base
- **preferences** : Paramètres utilisateur
- **activity** : Historique d'activité
- **files** : Fichiers uploadés
- **privacy** : Paramètres de confidentialité

### Nutritionnistes
- **professional** : Certifications, spécialisations
- **audit** : Logs d'activité professionnelle

### Patients
- **medical** : Informations de santé
- **subscription** : Données d'abonnement

## Formats d'export

### JSON (Recommandé)
```json
{
  "_metadata": {
    "export_version": "1.0",
    "exported_at": "2024-01-15T10:30:00Z",
    "user_id": "user_123",
    "user_role": "nutritionist",
    "gdpr_compliant": true
  },
  "profile": {
    "first_name": "Marie",
    "last_name": "Dubois",
    "email": "marie.dubois@example.com"
  },
  "professional": {
    "asca_number": "ASCA-12345",
    "specializations": ["Nutrition sportive"]
  }
}
```

### CSV
```csv
Section,Field,Value,Type
profile,first_name,"Marie",string
profile,last_name,"Dubois",string
professional,asca_number,"ASCA-12345",string
```

### XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<user_data>
  <profile>
    <first_name>Marie</first_name>
    <last_name>Dubois</last_name>
  </profile>
  <professional>
    <asca_number>ASCA-12345</asca_number>
  </professional>
</user_data>
```

## Sécurité et chiffrement

### Chiffrement des exports
```typescript
// Chiffrement automatique avec mot de passe
const encryptedExport = await exportService.exportUserData({
  format: 'json',
  sections: ['profile'],
  encrypt: true,
  password: 'motDePasseSecurise123!'
});
```

### Déchiffrement
```typescript
// Le déchiffrement se fait côté client avec le même mot de passe
// Implémentation utilisant Web Crypto API
const decryptedData = await crypto.subtle.decrypt(
  { name: 'AES-GCM', iv },
  key,
  encryptedBuffer
);
```

## Tests et validation

### Tests unitaires
```bash
# Tester les services d'export
npm test src/lib/data-export.test.ts

# Tester les hooks React
npm test src/hooks/useDataExport.test.ts

# Tester les composants
npm test src/components/data-export/
```

### Tests de conformité RGPD
```bash
# Script de validation RGPD
npm run test:gdpr

# Vérification des métadonnées
npm run validate:metadata

# Test de sécurité
npm run test:security
```

### Validation manuelle

1. **Export complet** :
   - Créer un export avec toutes les sections
   - Vérifier la présence des métadonnées RGPD
   - Contrôler l'intégrité avec le checksum

2. **Chiffrement** :
   - Exporter avec chiffrement
   - Vérifier l'impossibilité de lire sans mot de passe
   - Tester le déchiffrement avec le bon mot de passe

3. **Import** :
   - Importer un export précédent
   - Vérifier la cohérence des données
   - Tester les stratégies de conflit

## Monitoring et métriques

### Métriques importantes
- **Taux de succès des exports** : > 99%
- **Temps moyen d'export** : < 30 secondes
- **Taille moyenne des exports** : Varie selon les données
- **Nombre d'exports par jour** : Suivi des tendances

### Alertes à configurer
- Échec d'export > 1%
- Temps d'export > 2 minutes
- Erreurs de chiffrement
- Tentatives d'accès non autorisées

## Dépannage

### Problèmes courants

#### Export échoue
```bash
# Vérifier les permissions Supabase
# Contrôler la configuration du bucket
# Valider l'authentification utilisateur
```

#### Import impossible
```bash
# Vérifier le format du fichier
# Contrôler la taille (< 10MB)
# Valider la structure JSON
```

#### Chiffrement défaillant
```bash
# Vérifier la force du mot de passe
# Contrôler le support Web Crypto API
# Tester avec un navigateur récent
```

## Évolutions futures

### Fonctionnalités prévues
- **Export automatique** : Programmation d'exports réguliers
- **Formats additionnels** : PDF, Excel
- **Intégrations tierces** : APIs externes
- **Compression** : Réduction de la taille des fichiers
- **Signature numérique** : Authentification des exports

### Améliorations techniques
- **Performance** : Optimisation pour gros volumes
- **Streaming** : Export de très gros datasets
- **Parallélisation** : Traitement concurrent
- **Cache intelligent** : Optimisation des re-exports

---

Ce système de portabilité des données fournit une base solide pour la conformité RGPD tout en offrant une excellente expérience utilisateur. Il peut être étendu selon les besoins spécifiques de l'application NutriSensia.



