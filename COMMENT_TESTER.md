# 🎨 Comment Tester la Nouvelle Palette "Deep Ocean"

## Démarrage Rapide (2 minutes)

### 1. Lancez le serveur de développement

```bash
npm run dev
```

### 2. Visitez la page de test

Ouvrez dans votre navigateur :

```
http://localhost:3000/test-colors/deepocean
```

### 3. Comparez avec la page originale

Ouvrez un second onglet :

```
http://localhost:3000/fr
```

## Astuce : Comparaison Côte à Côte

1. **Windows/Linux** : Appuyez sur `Windows + ←` pour mettre un onglet à gauche, puis `Windows + →` pour l'autre
2. **Mac** : Utilisez Rectangle ou Magnet pour organiser les fenêtres côte à côte

## Ce que Vous Devriez Voir

### ✅ Changements Attendus

| Élément                 | Couleur Actuelle (Vert) | Nouvelle Couleur (Bleu) |
| ----------------------- | ----------------------- | ----------------------- |
| **Logo rond**           | Vert `#3f6655`          | Bleu marine `#2C5282`   |
| **Titres principaux**   | Vert `#3f6655`          | Bleu marine `#2C5282`   |
| **Boutons CTA**         | Vert `#3f6655`          | Bleu marine `#2C5282`   |
| **Boutons secondaires** | Vert clair `#b6ccae`    | Bleu-gris `#B8C8DC`     |
| **Shadow des cartes**   | Vert pâle `#d7e1ce`     | Bleu pâle `#CBD6E8`     |
| **Backgrounds**         | Beige `#f8f7ef`         | Blanc bleuté `#F5F8FA`  |
| **Overlay hero**        | Vert transparent        | Bleu transparent        |
| **Liens actifs**        | Vert                    | Bleu marine             |
| **Top bar**             | Violet `#9461bc`        | Teal-blue `#3B7EA1`     |

### 🎯 Points de Contrôle

Vérifiez spécifiquement :

- [ ] Le logo dans le header est bleu marine (au lieu de vert)
- [ ] Le titre du Hero "Et si manger redevenait un plaisir ?" est bleu marine
- [ ] Le bouton "Commencer" est bleu marine
- [ ] L'overlay sur l'image du Hero est bleuté (au lieu de verdâtre)
- [ ] Les cartes ont une ombre bleu pâle (au lieu de vert pâle)
- [ ] Le fond des sections est blanc bleuté (au lieu de beige)
- [ ] Le top bar est teal-blue (au lieu de violet)

## Fonctionnement Technique

La page de test utilise **3 mécanismes** pour remplacer les couleurs :

1. **CSS avec !important** ([ocean-theme-aggressive.css](src/styles/ocean-theme-aggressive.css))
   - Remplace toutes les couleurs dans les attributs style

2. **JavaScript Observer** ([color-replacer.tsx](src/app/[locale]/test-colors/color-replacer.tsx))
   - Observe le DOM et remplace les couleurs dynamiquement
   - S'exécute en continu pour attraper les changements

3. **Mapping automatique**
   - Toutes les nuances de vert sont automatiquement converties en bleu

## Problèmes Connus

### Certaines couleurs ne changent pas ?

C'est normal si :

- Les couleurs sont dans des images (PNG, JPG, SVG)
- Les couleurs sont générées par Canvas ou WebGL
- Les couleurs utilisent des noms (ex: `color: green`) au lieu de hex

### La page semble lente ?

Le Color Replacer observe le DOM en temps réel. Pour une version production, on remplacerait les couleurs directement dans les composants.

## Feedback

### Ce qui vous plaît

Notez ce qui fonctionne bien :

- _Exemple : "Le bleu marine est plus professionnel que le vert"_
- _..._

### Ce qui pourrait être amélioré

Notez ce qui pourrait être ajusté :

- _Exemple : "Le bleu est peut-être un peu trop foncé pour les boutons"_
- _..._

### Questions

- _Exemple : "Comment cela fonctionnerait-il sur mobile ?"_
- _..._

## Options de Test Supplémentaires

### Test sur Mobile/Tablette

Depuis votre appareil mobile sur le même réseau Wi-Fi :

1. Trouvez l'adresse IP de votre ordinateur (ex: 192.168.1.100)
2. Visitez `http://[VOTRE_IP]:3000/fr/test-colors`

### Test avec Différentes Tailles d'Écran

Dans Chrome DevTools :

1. Appuyez sur `F12`
2. Cliquez sur l'icône mobile/tablette (Toggle Device Toolbar)
3. Testez différentes tailles : iPhone, iPad, Desktop

### Comparaison Visuelle Statique

Ouvrez le fichier HTML de comparaison :

```
file:///Users/adriencornille/Desktop/NutriSensia/public/palette-comparison.html
```

## Prochaines Étapes

Une fois le test terminé :

### Si vous aimez la palette :

✅ Je peux l'implémenter complètement en modifiant directement les composants

### Si vous voulez ajuster :

🎨 Je peux créer des variantes (bleu plus clair, plus foncé, etc.)

### Si vous voulez explorer d'autres palettes :

🌈 Je peux créer d'autres propositions (voir [PALETTE_DEEP_OCEAN.md](.claude/PALETTE_DEEP_OCEAN.md))

## Support

Besoin d'aide ? Posez-moi vos questions :

- "La couleur X ne change pas, pourquoi ?"
- "Peux-tu rendre le bleu un peu plus clair ?"
- "Comment appliquer cette palette à tout le site ?"

---

**Bon test ! 🚀**

_Créé le 2025-12-18 avec Claude Code_
