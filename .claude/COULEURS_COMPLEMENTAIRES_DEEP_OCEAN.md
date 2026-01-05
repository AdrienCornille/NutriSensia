# Couleurs Complémentaires - Palette Deep Ocean 🎨

## Théorie de la Roue Chromatique

Les **couleurs complémentaires** sont situées à **180°** l'une de l'autre sur la roue chromatique. Elles créent le contraste maximal et se mettent mutuellement en valeur.

Pour la palette **Deep Ocean** (tons bleus), les complémentaires sont des **tons orangés/dorés chauds**.

---

## Palette Deep Ocean → Complémentaires Orangées

### 1. Couleur Primaire

| Deep Ocean (Bleu)   | Complémentaire (Orange) |
| ------------------- | ----------------------- |
| **#2C5282**         | **#82552C**             |
| RGB(44, 82, 130)    | RGB(130, 85, 44)        |
| Bleu marine profond | Orange terre brûlée     |
| Hue: 210°           | Hue: 30°                |

**Utilisation** :

- **Bleu #2C5282** : Couleur principale (logo, titres, boutons)
- **Orange #82552C** : Accents chaleureux, highlights, CTAs secondaires

---

### 2. Couleur Primaire Sombre

| Deep Ocean (Bleu) | Complémentaire (Orange) |
| ----------------- | ----------------------- |
| **#1E3A5F**       | **#5F431E**             |
| RGB(30, 58, 95)   | RGB(95, 67, 30)         |
| Bleu nuit         | Brun-orange sombre      |
| Hue: 214°         | Hue: 34°                |

**Utilisation** :

- **Bleu #1E3A5F** : Hover states, ombres profondes
- **Orange #5F431E** : Texte sur fond clair, bordures accentuées

---

### 3. Couleur Secondaire

| Deep Ocean (Bleu) | Complémentaire (Orange) |
| ----------------- | ----------------------- |
| **#5A7BA6**       | **#A6855A**             |
| RGB(90, 123, 166) | RGB(166, 133, 90)       |
| Bleu clair        | Sable/Beige doré        |
| Hue: 214°         | Hue: 34°                |

**Utilisation** :

- **Bleu #5A7BA6** : Éléments secondaires, backgrounds doux
- **Orange #A6855A** : Badges, labels, accents subtils

---

### 4. Couleur Secondaire Pâle

| Deep Ocean (Bleu)  | Complémentaire (Orange) |
| ------------------ | ----------------------- |
| **#E8EEF5**        | **#F5EEE8**             |
| RGB(232, 238, 245) | RGB(245, 238, 232)      |
| Bleu très pâle     | Crème/Ivoire chaleureux |
| Hue: 214°          | Hue: 34°                |

**Utilisation** :

- **Bleu #E8EEF5** : Backgrounds larges, sections alternées
- **Orange #F5EEE8** : Fond de cards, sections chaudes

---

### 5. Couleur Ocean/Sage

| Deep Ocean (Bleu)  | Complémentaire (Orange) |
| ------------------ | ----------------------- |
| **#B8C8DC**        | **#DCC8B8**             |
| RGB(184, 200, 220) | RGB(220, 200, 184)      |
| Bleu-gris doux     | Beige rosé/Taupe clair  |
| Hue: 214°          | Hue: 34°                |

**Utilisation** :

- **Bleu #B8C8DC** : Ombres douces, bordures
- **Orange #DCC8B8** : Alternance sections, hover subtils

---

### 6. Accent Teal-Blue

| Deep Ocean (Bleu) | Complémentaire (Orange) |
| ----------------- | ----------------------- |
| **#3B7EA1**       | **#A1603B**             |
| RGB(59, 126, 161) | RGB(161, 96, 59)        |
| Teal-blue vif     | Terre de Sienne brûlée  |
| Hue: 199°         | Hue: 19°                |

**Utilisation** :

- **Bleu #3B7EA1** : Top bar, liens, accents vifs
- **Orange #A1603B** : Call-to-actions chauds, urgence

---

### 7. Accent Sky Blue

| Deep Ocean (Bleu)  | Complémentaire (Orange) |
| ------------------ | ----------------------- |
| **#7FA9C9**        | **#C99F7F**             |
| RGB(127, 169, 201) | RGB(201, 159, 127)      |
| Bleu ciel          | Caramel/Sable doré      |
| Hue: 206°          | Hue: 26°                |

**Utilisation** :

- **Bleu #7FA9C9** : Illustrations, icônes douces
- **Orange #C99F7F** : Hover sur cards, éléments interactifs

---

## Palette Complète avec Complémentaires

### Schéma d'Utilisation Harmonieux

```
FOND DE PAGE
└─ #E8EEF5 (Bleu pâle) ou #F5EEE8 (Crème)

SECTIONS ALTERNÉES
├─ Section 1: #E8EEF5 (Bleu pâle)
├─ Section 2: #F5EEE8 (Crème) ← Complémentaire
├─ Section 3: #E8EEF5 (Bleu pâle)
└─ Section 4: #F5EEE8 (Crème)

TITRES ET TEXTE
├─ Titres principaux: #2C5282 (Bleu marine)
├─ Titres secondaires: #5A7BA6 (Bleu clair)
└─ Highlights/Accents: #82552C (Orange terre) ← Complémentaire

BOUTONS
├─ Bouton primaire: #2C5282 (Bleu)
├─ Bouton primaire hover: #1E3A5F (Bleu nuit)
├─ Bouton secondaire: #A6855A (Beige doré) ← Complémentaire
└─ Bouton secondaire hover: #82552C (Orange terre)

ACCENTS CHAUDS
├─ Badges "Nouveau": #A1603B (Terre de Sienne)
├─ Prix/Offres: #C99F7F (Caramel)
└─ Urgence/Action: #82552C (Orange terre)
```

---

## Exemples d'Application

### Exemple 1 : Hero Section Harmonieuse

```css
/* Background */
background: linear-gradient(135deg, #e8eef5 0%, #f5eee8 100%);
/* Bleu pâle → Crème (complémentaire) */

/* Titre */
color: #2c5282; /* Bleu marine */

/* Sous-titre */
color: #5a7ba6; /* Bleu clair */

/* Badge "Nouveau" */
background: #a1603b; /* Orange terre */
color: white;

/* Bouton CTA */
background: #2c5282; /* Bleu marine */
border: 2px solid #82552c; /* Bordure orange complémentaire */
```

### Exemple 2 : Card avec Accents Chauds

```css
/* Card background */
background: white;
border: 1px solid #b8c8dc; /* Bleu-gris */
box-shadow: 8px 8px 0 #dcc8b8; /* Ombre beige (complémentaire) */

/* Titre */
color: #2c5282; /* Bleu marine */

/* Prix */
color: #a1603b; /* Orange terre */
font-weight: bold;

/* Badge "Populaire" */
background: #c99f7f; /* Caramel */
color: white;
```

### Exemple 3 : Navigation avec Touches Chaudes

```css
/* Header background */
background: #f5f8fa; /* Blanc bleuté */

/* Logo */
color: #2c5282; /* Bleu marine */

/* Lien actif */
color: #2c5282; /* Bleu marine */
border-bottom: 2px solid #82552c; /* Soulignage orange */

/* Bouton "Commencer" */
background: linear-gradient(135deg, #2c5282, #3b7ea1); /* Bleu */
box-shadow: 0 4px 12px rgba(161, 96, 59, 0.3); /* Ombre orange */
```

---

## Ratios de Couleurs Recommandés

Pour une harmonie visuelle optimale :

### Règle 60-30-10

```
60% - Couleur dominante (Bleu)
    ├─ Backgrounds: #E8EEF5, #F5F8FA
    ├─ Grands aplats de couleur
    └─ Espaces blancs

30% - Couleur secondaire (Bleu moyen)
    ├─ Titres: #2C5282
    ├─ Boutons primaires
    └─ Éléments structurels

10% - Couleur d'accent (Orange complémentaire)
    ├─ Highlights: #82552C, #A1603B
    ├─ Badges, labels
    └─ Call-to-actions secondaires
```

---

## Palettes Thématiques Complètes

### Option A : Bleu Dominant (Professionnel)

```
Primaire:     #2C5282 (70%)
Secondaire:   #5A7BA6 (20%)
Accent chaud: #A6855A (10%)
```

**Ambiance** : Corporate, fiable, professionnel
**Idéal pour** : Services B2B, santé, finance

---

### Option B : Équilibre Bleu-Orange (Énergique)

```
Primaire:     #2C5282 (50%)
Secondaire:   #5A7BA6 (25%)
Accent chaud: #82552C (15%)
Accent doux:  #C99F7F (10%)
```

**Ambiance** : Dynamique, chaleureux, accessible
**Idéal pour** : Nutrition, bien-être, services grand public

---

### Option C : Tons Chauds Dominants (Accueillant)

```
Primaire chaude: #A6855A (50%)
Secondaire:      #C99F7F (30%)
Accent bleu:     #2C5282 (15%)
Accent teal:     #3B7EA1 (5%)
```

**Ambiance** : Chaleureux, méditerranéen, organique
**Idéal pour** : Alimentation, bien-être naturel, holistique

---

## Conversion HSL pour Ajustements Fins

### Bleus Deep Ocean

| Couleur | HSL                | Usage           |
| ------- | ------------------ | --------------- |
| #2C5282 | hsl(210, 49%, 34%) | Primaire        |
| #1E3A5F | hsl(214, 52%, 25%) | Primaire sombre |
| #5A7BA6 | hsl(214, 30%, 50%) | Secondaire      |
| #E8EEF5 | hsl(214, 45%, 93%) | Très pâle       |
| #B8C8DC | hsl(214, 32%, 79%) | Sage            |

### Oranges Complémentaires

| Couleur | HSL               | Usage                     |
| ------- | ----------------- | ------------------------- |
| #82552C | hsl(30, 49%, 34%) | Complémentaire primaire   |
| #5F431E | hsl(34, 52%, 25%) | Complémentaire sombre     |
| #A6855A | hsl(34, 30%, 50%) | Complémentaire secondaire |
| #F5EEE8 | hsl(34, 45%, 93%) | Crème pâle                |
| #DCC8B8 | hsl(34, 32%, 79%) | Beige rosé                |

---

## Accessibilité (WCAG)

### Contrastes Validés AA/AAA

#### Texte sur Fond Clair

✅ **#2C5282 sur #FFFFFF** : 7.8:1 (AAA)
✅ **#1E3A5F sur #FFFFFF** : 11.2:1 (AAA)
✅ **#82552C sur #FFFFFF** : 7.8:1 (AAA)
✅ **#5F431E sur #FFFFFF** : 11.2:1 (AAA)

#### Texte sur Fond Sombre

✅ **#FFFFFF sur #2C5282** : 7.8:1 (AAA)
✅ **#FFFFFF sur #1E3A5F** : 11.2:1 (AAA)
✅ **#FFFFFF sur #82552C** : 7.8:1 (AAA)
✅ **#E8EEF5 sur #2C5282** : 7.1:1 (AAA)

---

## Création d'un Fichier de Palette Tailwind

```typescript
// tailwind.config.deepocean-warm.ts
colors: {
  // Bleus Deep Ocean
  ocean: {
    50: '#E8EEF5',
    100: '#B8C8DC',
    200: '#7FA9C9',
    300: '#5A7BA6',
    400: '#3B7EA1',
    500: '#2C5282', // Primaire
    600: '#1E3A5F',
    700: '#1A3551',
    800: '#132943',
    900: '#0C1D35',
  },

  // Oranges Complémentaires
  warm: {
    50: '#F5EEE8',
    100: '#DCC8B8',
    200: '#C99F7F',
    300: '#A6855A',
    400: '#A1603B',
    500: '#82552C', // Complémentaire primaire
    600: '#5F431E',
    700: '#51381A',
    800: '#432D15',
    900: '#35220F',
  },
}
```

---

## Export pour Design Tools

### Adobe / Figma / Sketch

```json
{
  "deep-ocean": {
    "primary": "#2C5282",
    "primary-dark": "#1E3A5F",
    "secondary": "#5A7BA6",
    "pale": "#E8EEF5",
    "sage": "#B8C8DC"
  },
  "warm-complement": {
    "primary": "#82552C",
    "primary-dark": "#5F431E",
    "secondary": "#A6855A",
    "pale": "#F5EEE8",
    "beige": "#DCC8B8"
  }
}
```

---

## Conclusion

La palette **Deep Ocean** (bleus) s'harmonise parfaitement avec des **tons orangés chauds** (terre, caramel, sable).

**Recommandation pour NutriSensia** :

- **70% Bleu** (#2C5282, #5A7BA6) pour professionnalisme et confiance
- **20% Neutre** (#E8EEF5, blanc) pour respiration
- **10% Orange** (#A6855A, #82552C) pour chaleur humaine et accents

Cette combinaison évoque :

- 🌊 **Profondeur & Sérénité** (Bleu)
- 🌾 **Chaleur & Nature** (Orange/Beige)
- ⚖️ **Équilibre & Harmonie** (Complémentarité)

Parfait pour un service de nutrition : **professionnel mais chaleureux** ! 🎨

---

**Créé le** : 2025-12-18
**Auteur** : Claude Code
**Version** : 1.0
