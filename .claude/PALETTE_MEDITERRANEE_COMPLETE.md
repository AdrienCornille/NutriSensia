# Palette Méditerranée - Guide Complet 🌊☀️

## Vue d'ensemble

Ce document détaille toutes les variantes de couleurs nécessaires pour implémenter la palette Méditerranée sur l'ensemble du site NutriSensia.

---

## 1. Palette Principale

### Couleurs Primaires - Turquoise Azur

| Niveau  | Hex       | RGB                | Usage                          |
| ------- | --------- | ------------------ | ------------------------------ |
| **50**  | `#F0F9F8` | rgb(240, 249, 248) | Backgrounds très légers        |
| **100** | `#D2EFEC` | rgb(210, 239, 236) | Backgrounds légers             |
| **200** | `#A5DFD9` | rgb(165, 223, 217) | Éléments désactivés            |
| **300** | `#78CFC6` | rgb(120, 207, 198) | Accents légers                 |
| **400** | `#2EC4B6` | rgb(46, 196, 182)  | Accents vifs                   |
| **500** | `#1B998B` | rgb(27, 153, 139)  | **PRIMAIRE** - Titres, boutons |
| **600** | `#147569` | rgb(20, 117, 105)  | Hover states                   |
| **700** | `#0F5F56` | rgb(15, 95, 86)    | Active states                  |
| **800** | `#0A4A43` | rgb(10, 74, 67)    | Texte sur fond clair           |
| **900** | `#063530` | rgb(6, 53, 48)     | Très sombre                    |

### Couleurs Secondaires - Sable Doré

| Niveau  | Hex       | RGB                | Usage               |
| ------- | --------- | ------------------ | ------------------- |
| **50**  | `#FEFBF3` | rgb(254, 251, 243) | Backgrounds chauds  |
| **100** | `#FDF6E3` | rgb(253, 246, 227) | Sections alternées  |
| **200** | `#F8E8C4` | rgb(248, 232, 196) | Éléments doux       |
| **300** | `#F4D6A0` | rgb(244, 214, 160) | Badges, labels      |
| **400** | `#F0C67A` | rgb(240, 198, 122) | Accents secondaires |
| **500** | `#E9C46A` | rgb(233, 196, 106) | **SECONDAIRE**      |
| **600** | `#D4A84E` | rgb(212, 168, 78)  | Hover secondaire    |
| **700** | `#B88C38` | rgb(184, 140, 56)  | Active secondaire   |
| **800** | `#8E6B2A` | rgb(142, 107, 42)  | Texte doré          |
| **900** | `#644A1D` | rgb(100, 74, 29)   | Doré sombre         |

### Couleurs d'Accent - Terracotta

| Niveau  | Hex       | RGB                | Usage                     |
| ------- | --------- | ------------------ | ------------------------- |
| **50**  | `#FEF4F2` | rgb(254, 244, 242) | Background accent         |
| **100** | `#FCE4DF` | rgb(252, 228, 223) | Hover léger               |
| **200** | `#F9C4B9` | rgb(249, 196, 185) | Désactivé                 |
| **300** | `#F3A08D` | rgb(243, 160, 141) | Accent léger              |
| **400** | `#ED8872` | rgb(237, 136, 114) | Accent moyen              |
| **500** | `#E76F51` | rgb(231, 111, 81)  | **ACCENT** - CTAs urgents |
| **600** | `#D35A3D` | rgb(211, 90, 61)   | Hover accent              |
| **700** | `#B04530` | rgb(176, 69, 48)   | Active accent             |
| **800** | `#8D3725` | rgb(141, 55, 37)   | Sombre                    |
| **900** | `#6A291B` | rgb(106, 41, 27)   | Très sombre               |

### Couleurs Neutres - Beige & Crème

| Niveau  | Hex       | RGB                | Usage                |
| ------- | --------- | ------------------ | -------------------- |
| **50**  | `#FDFCFB` | rgb(253, 252, 251) | Blanc chaud          |
| **100** | `#FBF9F7` | rgb(251, 249, 247) | Background principal |
| **200** | `#F8F5F2` | rgb(248, 245, 242) | Sections alternées   |
| **300** | `#F0EBE5` | rgb(240, 235, 229) | Award cards          |
| **400** | `#E5DED6` | rgb(229, 222, 214) | Ombres, bordures     |
| **500** | `#D9CFC3` | rgb(217, 207, 195) | Hover light          |
| **600** | `#C4B5A5` | rgb(196, 181, 165) | Bordures fortes      |
| **700** | `#A89888` | rgb(168, 152, 136) | Texte désactivé      |
| **800** | `#7D7268` | rgb(125, 114, 104) | Texte secondaire     |
| **900** | `#524A42` | rgb(82, 74, 66)    | Texte principal      |

---

## 2. Boutons - États Complets

### Bouton Primaire (Primary)

```css
/* État Normal */
.btn-primary {
  background-color: #1b998b;
  color: #ffffff;
  border: none;
}

/* État Hover */
.btn-primary:hover {
  background-color: #147569;
}

/* État Active/Pressed */
.btn-primary:active {
  background-color: #0f5f56;
}

/* État Focus */
.btn-primary:focus {
  box-shadow: 0 0 0 3px rgba(27, 153, 139, 0.3);
}

/* État Disabled */
.btn-primary:disabled {
  background-color: #a5dfd9;
  cursor: not-allowed;
}
```

### Bouton Secondaire (Secondary/Outline)

```css
/* État Normal */
.btn-secondary {
  background-color: #ffffff;
  color: #1b998b;
  border: 2px solid #1b998b;
}

/* État Hover */
.btn-secondary:hover {
  background-color: #f0f9f8;
  border-color: #147569;
  color: #147569;
}

/* État Active */
.btn-secondary:active {
  background-color: #d2efec;
}

/* État Focus */
.btn-secondary:focus {
  box-shadow: 0 0 0 3px rgba(27, 153, 139, 0.2);
}
```

### Bouton Light (Tertiaire)

```css
/* État Normal */
.btn-light {
  background-color: #e5ded6;
  color: #4a5568;
}

/* État Hover */
.btn-light:hover {
  background-color: #d9cfc3;
}

/* État Active */
.btn-light:active {
  background-color: #c4b5a5;
}
```

### Bouton Hero

```css
/* État Normal */
.hero-btn {
  background-color: #1b998b;
  color: #fbf9f7;
  padding: 12px 24px;
  border-radius: 35px;
}

/* État Hover */
.hero-btn:hover {
  background-color: #0f5f56;
}

/* État Active */
.hero-btn:active {
  background-color: #0a4a43;
}
```

### Bouton Insurance

```css
/* État Normal */
.insurance-btn {
  background-color: #fbf9f7;
  color: #0a4a43;
  border: 1px solid #0a4a43;
}

/* État Hover */
.insurance-btn:hover {
  background-color: #0a4a43;
  color: #fbf9f7;
}
```

### Bouton Award/CTA Large

```css
/* État Normal */
.award-btn {
  background-color: #e5ded6;
  color: #1b998b;
  padding: 16px 40px;
  border-radius: 35px;
  font-weight: 700;
}

/* État Hover */
.award-btn:hover {
  background-color: #d9cfc3;
}
```

### Boutons Newsletter (Footer)

```css
/* Patient Newsletter */
.btn-newsletter-patient {
  background-color: #f4d6a0; /* Sable clair */
  color: #1b998b;
}

.btn-newsletter-patient:hover {
  background-color: #e9c46a;
}

/* Provider Newsletter */
.btn-newsletter-provider {
  background-color: #ffffff;
  color: #1b998b;
}

.btn-newsletter-provider:hover {
  background-color: #f8f5f2;
}
```

### Bouton Accent (CTA Urgent)

```css
/* État Normal */
.btn-accent {
  background-color: #e76f51;
  color: #ffffff;
}

/* État Hover */
.btn-accent:hover {
  background-color: #d35a3d;
}

/* État Active */
.btn-accent:active {
  background-color: #b04530;
}

/* État Focus */
.btn-accent:focus {
  box-shadow: 0 0 0 3px rgba(231, 111, 81, 0.3);
}
```

---

## 3. Cards - Styles Complets

### Ombre Signature

```css
/* Ombre standard */
box-shadow: 8px 8px 0 #e5ded6;

/* Ombre hover (légèrement plus grande) */
box-shadow: 10px 10px 0 #e5ded6;

/* Ombre petite (pour petits éléments) */
box-shadow: 4px 4px 0 #e5ded6;
box-shadow: 5px 5px 0 #e5ded6;
```

### Card Standard

```css
.card {
  background-color: #ffffff;
  border: 1px solid #e5ded6;
  border-radius: 10px;
  box-shadow: 8px 8px 0 #e5ded6;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px) translateX(-2px);
  border-width: 2px;
  box-shadow: 10px 10px 0 #e5ded6;
}
```

### Hero Card

```css
.hero-card {
  background-color: rgba(255, 255, 255, 0.85);
  border: 1px solid #e5ded6;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 8px 8px 0 #e5ded6;
}
```

### Condition/Feature Cards

```css
.condition-card {
  background-color: rgba(229, 222, 214, 0.15); /* #E5DED626 */
  border: 1px solid #e5ded6;
  border-radius: 10px;
  box-shadow: 8px 8px 0 #e5ded6;
}

.condition-card:hover {
  transform: translateY(-2px) translateX(-2px);
  border-width: 2px;
}
```

### Award Cards

```css
.award-card {
  background-color: #f0ebe5;
  border-radius: 10px;
  /* Pas d'ombre signature */
}
```

### Blog Cards

```css
.blog-card {
  background-color: #ffffff;
  border: 1px solid #e5ded6;
  border-radius: 16px;
  box-shadow: 8px 8px 0 #e5ded6;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 10px 10px 0 #e5ded6;
}

/* Image overlay sur les articles */
.blog-card-image-overlay {
  background-color: rgba(27, 153, 139, 0.4); /* Turquoise 40% */
}
```

---

## 4. Sections Spéciales

### Top Bar (Annonce)

```css
.top-bar {
  background-color: #e76f51; /* Terracotta */
  color: #ffffff;
}
```

### CTA Banner

```css
.cta-banner {
  background-color: #e76f51; /* Terracotta */
  color: #ffffff;
}

.cta-banner .btn {
  background-color: #ffffff;
  color: #1b998b;
}
```

### Trust Section (Stats)

```css
.trust-section {
  background-color: #1b998b; /* Turquoise principal */
  color: #ffffff;
}

.trust-number {
  color: #ffffff;
}

.trust-label {
  color: #ffffff;
}
```

### Footer

```css
.footer {
  background-color: #1b998b; /* Turquoise principal */
  color: #ffffff;
}

.footer-column h3 {
  color: #ffffff;
}

.footer-links a {
  color: #ffffff;
}

.social-icon {
  background-color: rgba(255, 255, 255, 0.2);
}

.social-icon:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
```

### Section Backgrounds Alternés

```css
/* Section 1 - Blanc */
background-color: #ffffff;

/* Section 2 - Crème */
background-color: #fbf9f7;

/* Section 3 - Blanc */
background-color: #ffffff;

/* Section 4 - Crème doré */
background-color: #f8f5f2;
```

---

## 5. Éléments de Texte

### Titres (Marcellus)

```css
h1,
h2,
h3 {
  color: #1b998b; /* Turquoise principal */
  font-family: 'Marcellus', serif;
  font-weight: 700;
}

/* Titres sur fond sombre */
.dark-bg h1,
.dark-bg h2 {
  color: #ffffff;
}
```

### Corps de Texte (Plus Jakarta Sans)

```css
p,
body {
  color: #4a5568; /* Gris ardoise */
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

### Sous-titres

```css
.subtitle {
  color: #1b998b;
  border-bottom: 1px solid #e5ded6;
}
```

### Liens

```css
a {
  color: #1b998b;
}

a:hover {
  color: #147569;
}

/* Liens sur fond sombre */
.dark-bg a {
  color: #ffffff;
}

.dark-bg a:hover {
  text-decoration: underline;
}
```

---

## 6. Bordures & Séparateurs

### Bordures de Cards

```css
border: 1px solid #e5ded6; /* Standard */
border: 2px solid #e5ded6; /* Hover */
```

### Bordure d'Accent

```css
border: 1px solid #1b998b;
border-bottom: 1px solid #e5ded6; /* Sous-titre */
```

### Séparateurs

```css
.separator {
  height: 4px;
  background-color: #e5ded6;
}
```

### Bordures de Tableaux

```css
.table {
  border: 1px solid #4a5568;
}

.table-header {
  background-color: #f0ebe5;
  border: 1px solid #1b998b;
}
```

---

## 7. États Focus & Accessibility

### Focus Ring

```css
/* Focus turquoise */
:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(27, 153, 139, 0.3);
}

/* Focus terracotta (pour éléments accent) */
.accent:focus {
  box-shadow: 0 0 0 3px rgba(231, 111, 81, 0.3);
}
```

### États Désactivés

```css
:disabled {
  background-color: #e5ded6;
  color: #a89888;
  cursor: not-allowed;
  opacity: 0.7;
}
```

---

## 8. Overlays & Transparences

### Overlays sur Images

```css
/* Overlay turquoise léger */
rgba(27, 153, 139, 0.2)   /* 20% */
rgba(27, 153, 139, 0.4)   /* 40% */

/* Overlay sombre */
rgba(0, 0, 0, 0.05)
rgba(0, 0, 0, 0.1)
```

### Backgrounds Semi-Transparents

```css
/* Card backgrounds */
rgba(229, 222, 214, 0.15)   /* Beige 15% - #E5DED626 */
rgba(229, 222, 214, 0.26)   /* Beige 26% */

/* Hero card */
rgba(255, 255, 255, 0.85)

/* Social icons */
rgba(255, 255, 255, 0.2)
rgba(255, 255, 255, 0.3)   /* hover */
```

### Décorations (Cercles)

```css
/* Cercles décoratifs Award section */
rgba(27, 153, 139, 0.15)
rgba(27, 153, 139, 0.20)
rgba(27, 153, 139, 0.25)
rgba(27, 153, 139, 0.30)
rgba(27, 153, 139, 0.35)
rgba(27, 153, 139, 0.40)
```

---

## 9. Couleurs Fonctionnelles

Ces couleurs restent standards pour l'accessibilité :

```css
/* Success */
--color-success: #22c55e;

/* Error */
--color-error: #ef4444;

/* Warning */
--color-warning: #f59e0b;

/* Info - Adapté turquoise */
--color-info: #2ec4b6; /* Turquoise vif */
```

---

## 10. Mapping Complet Vert → Méditerranée

### Conversion Directe

| Original (Vert) | Méditerranée | Usage            |
| --------------- | ------------ | ---------------- |
| `#3f6655`       | `#1B998B`    | Primaire         |
| `#2E7D5E`       | `#1B998B`    | Primaire alt     |
| `#1B4F3F`       | `#147569`    | Primaire sombre  |
| `#2f5645`       | `#147569`    | Hover            |
| `#2d5042`       | `#0F5F56`    | Hover dark       |
| `#20332b`       | `#0A4A43`    | Texte sombre     |
| `#4A9B7B`       | `#E9C46A`    | Secondaire       |
| `#E8F3EF`       | `#F8F5F2`    | Pâle             |
| `#B8D4C7`       | `#E5DED6`    | Sage             |
| `#b6ccae`       | `#E5DED6`    | Boutons light    |
| `#b6ccae26`     | `#E5DED626`  | Card bg          |
| `#a6bc9e`       | `#D9CFC3`    | Hover light      |
| `#b2c2bb`       | `#E5DED6`    | Bordures         |
| `#d7e1ce`       | `#E5DED6`    | Shadows          |
| `#f8f7ef`       | `#FBF9F7`    | Background       |
| `#e5e8e0`       | `#F0EBE5`    | Award cards      |
| `#41556b`       | `#4A5568`    | Texte corps      |
| `#9461bc`       | `#E76F51`    | Accent (top bar) |
| `#5e69bd`       | `#E76F51`    | Accent (CTA)     |
| `#b4cafa`       | `#F4D6A0`    | Newsletter       |
| `#00A693`       | `#2EC4B6`    | Teal accent      |
| `#7FD1C1`       | `#78CFC6`    | Mint accent      |
| `#F4A261`       | `#E76F51`    | Orange accent    |
| `#D4A574`       | `#E9C46A`    | Gold accent      |

---

## 11. Variables CSS Complètes

```css
:root {
  /* Primaires - Turquoise */
  --color-primary: #1b998b;
  --color-primary-light: #2ec4b6;
  --color-primary-dark: #147569;
  --color-primary-darker: #0f5f56;
  --color-primary-pale: #f0f9f8;

  /* Secondaires - Sable Doré */
  --color-secondary: #e9c46a;
  --color-secondary-light: #f4d6a0;
  --color-secondary-dark: #d4a84e;
  --color-secondary-pale: #fefbf3;

  /* Accents - Terracotta */
  --color-accent: #e76f51;
  --color-accent-light: #ed8872;
  --color-accent-dark: #d35a3d;
  --color-accent-pale: #fef4f2;

  /* Neutres */
  --color-background: #fbf9f7;
  --color-surface: #ffffff;
  --color-border: #e5ded6;
  --color-shadow: #e5ded6;

  /* Texte */
  --color-text-primary: #4a5568;
  --color-text-heading: #1b998b;
  --color-text-muted: #a89888;
  --color-text-inverse: #ffffff;

  /* Fonctionnels */
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #2ec4b6;
}
```

---

## 12. Configuration Tailwind Proposée

```typescript
// tailwind.config.ts - Palette Méditerranée
colors: {
  // Primaires - Turquoise
  primary: {
    DEFAULT: '#1B998B',
    50: '#F0F9F8',
    100: '#D2EFEC',
    200: '#A5DFD9',
    300: '#78CFC6',
    400: '#2EC4B6',
    500: '#1B998B',
    600: '#147569',
    700: '#0F5F56',
    800: '#0A4A43',
    900: '#063530',
  },

  // Secondaires - Sable
  secondary: {
    DEFAULT: '#E9C46A',
    50: '#FEFBF3',
    100: '#FDF6E3',
    200: '#F8E8C4',
    300: '#F4D6A0',
    400: '#F0C67A',
    500: '#E9C46A',
    600: '#D4A84E',
    700: '#B88C38',
    800: '#8E6B2A',
    900: '#644A1D',
  },

  // Accent - Terracotta
  accent: {
    DEFAULT: '#E76F51',
    50: '#FEF4F2',
    100: '#FCE4DF',
    200: '#F9C4B9',
    300: '#F3A08D',
    400: '#ED8872',
    500: '#E76F51',
    600: '#D35A3D',
    700: '#B04530',
    800: '#8D3725',
    900: '#6A291B',
  },

  // Neutres - Beige
  neutral: {
    50: '#FDFCFB',
    100: '#FBF9F7',
    200: '#F8F5F2',
    300: '#F0EBE5',
    400: '#E5DED6',
    500: '#D9CFC3',
    600: '#C4B5A5',
    700: '#A89888',
    800: '#7D7268',
    900: '#524A42',
  },

  // Fonctionnels
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#2EC4B6',
}
```

---

## Récapitulatif Visuel

### Palette Condensée

```
TURQUOISE (Primaire)
████████ #1B998B - Principal
████████ #147569 - Hover
████████ #0F5F56 - Active/Dark

SABLE (Secondaire)
████████ #E9C46A - Principal
████████ #F4D6A0 - Light
████████ #D4A84E - Hover

TERRACOTTA (Accent)
████████ #E76F51 - Principal
████████ #D35A3D - Hover
████████ #B04530 - Active

NEUTRES
████████ #FBF9F7 - Background
████████ #E5DED6 - Borders/Shadows
████████ #4A5568 - Text
```

---

**Créé le** : 2025-12-18
**Version** : 1.0
**Pour** : Migration NutriSensia vers palette Méditerranée
