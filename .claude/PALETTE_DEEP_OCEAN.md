# Palette de Couleurs "Deep Ocean" 🌊

## Vue d'ensemble

Cette palette propose une alternative élégante et sophistiquée à la palette verte actuelle, basée sur des **tons bleu-marine** qui évoquent la profondeur, la confiance et la sérénité.

### Philosophie de la Palette

- **Profondeur & Confiance** : Les bleus marines évoquent la stabilité et le professionnalisme
- **Sérénité & Calme** : Des tons apaisants qui créent une atmosphère rassurante
- **Élégance Intemporelle** : Une palette premium qui ne se démode pas
- **Différenciation** : Se démarque complètement des sites utilisant des verts
- **Universalité** : Les bleus sont universellement bien perçus dans le domaine de la santé

---

## Comparaison des Couleurs

### Couleurs Primaires

| Rôle          | Palette Actuelle (Verte)     | Nouvelle Palette (Bleue)      | Changement                    |
| ------------- | ---------------------------- | ----------------------------- | ----------------------------- |
| **Principal** | `#2E7D5E` (Vert forêt)       | `#2C5282` (Bleu marine)       | ✨ Plus profond, plus premium |
| **Sombre**    | `#1B4F3F` (Vert très sombre) | `#1E3A5F` (Bleu marine foncé) | ✨ Plus mystérieux            |
| **Blanc**     | `#FAFBFC` (Blanc cassé)      | `#F5F8FA` (Blanc bleuté)      | ✨ Légèrement plus frais      |

### Couleurs Secondaires

| Rôle           | Palette Actuelle (Verte)   | Nouvelle Palette (Bleue)   | Changement          |
| -------------- | -------------------------- | -------------------------- | ------------------- |
| **Secondaire** | `#4A9B7B` (Vert clair)     | `#5A7BA6` (Bleu clair)     | ✨ Plus lumineux    |
| **Pâle**       | `#E8F3EF` (Vert très pâle) | `#E8EEF5` (Bleu très pâle) | ✨ Plus aéré        |
| **Sage**       | `#B8D4C7` (Sage vert)      | `#B8C8DC` (Bleu-gris doux) | ✨ Plus sophistiqué |

### Couleurs d'Accent

| Rôle       | Palette Actuelle         | Nouvelle Palette      | Changement                        |
| ---------- | ------------------------ | --------------------- | --------------------------------- |
| **Teal**   | `#00A693` (Teal vert)    | `#3B7EA1` (Teal-blue) | ✨ Plus harmonieux avec les bleus |
| **Mint**   | `#7FD1C1` (Mint vert)    | `#7FA9C9` (Bleu ciel) | ✨ Plus cohérent                  |
| **Orange** | `#F4A261` (Orange chaud) | `#E87A5D` (Coral)     | ✨ Complément parfait au bleu     |
| **Gold**   | `#D4A574`                | `#D4A574`             | ✅ Conservé (fonctionne bien)     |

---

## Échelle de Couleurs "Ocean"

Cette échelle remplace l'échelle "Sage" actuelle :

```css
ocean: {
  50:  '#F5F8FA',  /* Très pâle - backgrounds */
  100: '#E8EEF5',  /* Pâle - cards, sections */
  200: '#B8C8DC',  /* Clair - borders, accents */
  300: '#9DB4CC',  /* Moyen-clair */
  400: '#7FA9C9',  /* Moyen */
  500: '#5A7BA6',  /* Base secondaire */
  600: '#4A6B8E',  /* Moyen-sombre */
  700: '#3A5576',  /* Sombre */
  800: '#2C5282',  /* Très sombre - primaire */
  900: '#1E3A5F',  /* Ultra-sombre */
}
```

---

## Applications Concrètes

### 1. Hero Section

```
Ancien : Fond vert forêt #2E7D5E
Nouveau : Fond bleu marine #2C5282
→ Plus sophistiqué, évoque la confiance professionnelle
```

### 2. Boutons Principaux

```
Ancien : Background #3f6655 (vert)
Nouveau : Background #2C5282 (bleu marine)
Hover ancien : #2f5645
Hover nouveau : #1E3A5F
→ Meilleur contraste, plus premium
```

### 3. Titres et Headings

```
Ancien : color: #3f6655
Nouveau : color: #2C5282
→ Plus autoritaire, meilleur pour le secteur santé
```

### 4. Cartes avec Shadow

```
Ancien : box-shadow: 8px 8px 0 #d7e1ce (vert pâle)
Nouveau : box-shadow: 8px 8px 0 #B8C8DC (bleu-gris)
→ Conserve l'effet mais avec la nouvelle identité
```

### 5. Backgrounds Alternés

```
Ancien : #f8f7ef (beige chaud)
Nouveau : #F5F8FA (blanc bleuté)
→ Plus frais, plus moderne
```

### 6. Accent Coral

```
Nouveau : #E87A5D pour les CTAs secondaires
→ Complément parfait au bleu marine (contraste chaud/froid)
```

---

## Avantages de cette Palette

### ✅ Professionnalisme

- Les bleus marines sont associés à la **confiance**, **l'expertise** et la **stabilité**
- Excellente association avec le domaine médical et de la santé

### ✅ Différenciation

- Se démarque complètement des sites utilisant des verts
- Crée une identité visuelle unique et mémorable

### ✅ Accessibilité

- Excellents ratios de contraste (WCAG AA/AAA)
- Fonctionne bien pour les daltoniens (contrairement aux palettes vert-rouge)

### ✅ Polyvalence

- S'adapte aussi bien au mode clair qu'au mode sombre
- Fonctionne sur tous les supports (mobile, desktop, print)

### ✅ Élégance

- Conserve le même niveau de sophistication que la palette actuelle
- Tons premium qui évoquent la qualité

### ✅ Psychologie des Couleurs

- **Bleu** : Calme, confiance, intelligence, sagesse
- **Coral** : Chaleur humaine, bienveillance, énergie positive
- **Gold** : Excellence, qualité, reconnaissance

---

## Comment Tester cette Palette

### Option 1 : Utiliser la Page de Test

1. Visitez `/test-colors` dans votre navigateur
2. Comparez visuellement avec la page d'accueil normale
3. Notez vos impressions et préférences

### Option 2 : Basculer la Configuration Tailwind (Temporaire)

Pour tester temporairement sur tout le site :

1. Renommez `tailwind.config.ts` en `tailwind.config.green.ts.backup`
2. Renommez `tailwind.config.ocean.ts` en `tailwind.config.ts`
3. Redémarrez le serveur de développement : `npm run dev`
4. Explorez tout le site avec la nouvelle palette
5. Pour revenir en arrière, inversez les opérations

### Option 3 : CSS Variables Override (Rapide)

Créez un fichier `src/styles/ocean-theme.css` et importez-le dans `globals.css` pour tester :

```css
:root {
  --color-primary: #2c5282;
  --color-primary-dark: #1e3a5f;
  /* ... autres variables ... */
}
```

---

## Prochaines Étapes

1. **Tester visuellement** la palette sur la page de test
2. **Comparer** avec des captures d'écran de la version actuelle
3. **Recueillir des feedbacks** (internes et externes)
4. **Décider** si vous souhaitez adopter cette palette ou explorer d'autres options
5. **Implémenter** progressivement si validation

---

## Alternatives à Considérer

Si cette palette ne vous convient pas complètement, voici d'autres directions possibles :

### Palette "Terre Cuite" 🏺

- Primaire : `#C15E3F` (Terracotta)
- Secondaire : `#E8D5C4` (Beige chaud)
- Accent : `#8B6F47` (Bronze)
- **Style** : Chaleureux, méditerranéen, organique

### Palette "Lavande Élégante" 🌸

- Primaire : `#7B68B8` (Lavande)
- Secondaire : `#E8E3F3` (Lavande pâle)
- Accent : `#D4AF37` (Or)
- **Style** : Doux, apaisant, premium

### Palette "Forêt Nordique" 🌲

- Primaire : `#2F4538` (Vert forêt sombre)
- Secondaire : `#7A8F7E` (Vert mousse)
- Accent : `#E8C19B` (Sable)
- **Style** : Naturel, scandinave, minimaliste

---

## Ressources Complémentaires

- **Tailwind Config** : [tailwind.config.ocean.ts](../tailwind.config.ocean.ts)
- **Page de Test** : `/test-colors`
- **Style Guide Original** : [NUTRISENSIA_STYLE_GUIDE.md](./NUTRISENSIA_STYLE_GUIDE.md)

---

**Créé le** : 2025-12-18
**Auteur** : Claude Code
**Version** : 1.0
**Statut** : Proposition pour validation
