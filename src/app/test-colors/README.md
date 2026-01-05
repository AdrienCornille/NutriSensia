# Test de Palettes de Couleurs

Ce dossier contient les pages de test pour différentes palettes de couleurs.

## Structure

```
test-colors/
├── deepocean/          # Palette "Deep Ocean" (bleu marine)
│   ├── page.tsx        # Page de test principale
│   └── color-replacer.tsx  # Système de remplacement dynamique des couleurs
└── README.md           # Ce fichier
```

## Pages de Test Disponibles

### Deep Ocean (Bleu Marine)

- **URL**: http://localhost:3000/test-colors/deepocean
- **Description**: Palette élégante basée sur des tons bleu-marine
- **Système**: Remplacement CSS + JavaScript en temps réel

## Comment Ajouter une Nouvelle Palette de Test

1. Créer un nouveau dossier dans `test-colors/` (ex: `terracotta/`)
2. Ajouter un fichier `page.tsx` avec le composant de la page
3. Créer le CSS de la palette dans `src/styles/`
4. Optionnel : Ajouter un `color-replacer.tsx` pour le remplacement dynamique

## Notes Techniques

- Ces pages sont des routes Next.js App Router standard
- Elles utilisent `'use client'` car elles importent du CSS et des hooks
- Le système de remplacement de couleurs fonctionne en 3 couches :
  1. CSS avec `!important`
  2. JavaScript Observer du DOM
  3. Mapping automatique des couleurs

## Dépannage

### Erreur 404

Si vous obtenez une erreur 404 :

1. Nettoyez le cache Next.js :

   ```bash
   rm -rf .next
   ```

2. Redémarrez le serveur :

   ```bash
   npm run dev
   ```

3. Ou utilisez le script de démarrage :
   ```bash
   ./scripts/start-test-palette.sh
   ```

### Page blanche

Vérifiez la console du navigateur (F12) pour voir les erreurs JavaScript.

### Couleurs qui ne changent pas

Assurez-vous que le fichier CSS est bien importé dans `page.tsx`.
