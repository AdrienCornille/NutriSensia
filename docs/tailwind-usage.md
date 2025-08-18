# Guide d'utilisation Tailwind CSS - NutriSensia

## 🎨 Palette de couleurs

### Couleurs primaires

```css
/* Vert principal - Actions, navigation, identité de marque */
bg-primary text-white
text-primary

/* Blanc principal - Surfaces propres, arrière-plans */
bg-primary-white text-neutral-dark

/* Vert foncé - Contrastes élevés, texte sur fonds clairs */
bg-primary-dark text-primary-white
```

### Couleurs secondaires

```css
/* Vert secondaire clair - États de survol, boutons secondaires */
bg-secondary hover:bg-secondary-pale

/* Vert pâle - États sélectionnés, surbrillances */
bg-secondary-pale

/* Vert sauge - Arrière-plans d'accent */
bg-secondary-sage
```

### Couleurs d'accent

```css
/* Bleu-vert - États de succès, feedback positif */
bg-accent-teal text-white

/* Menthe - Éléments interactifs, micro-animations */
bg-accent-mint

/* Orange - Alertes, avertissements */
bg-accent-orange text-white
```

### Couleurs fonctionnelles

```css
/* Succès - Soumissions réussies, objectifs atteints */
bg-functional-success text-white

/* Erreur - Erreurs de formulaire, alertes critiques */
bg-functional-error text-white

/* Avertissement - États de prudence */
bg-functional-warning text-white

/* Information - Messages informatifs */
bg-functional-info text-white
```

### Couleurs neutres

```css
/* Gris clair - Arrière-plan d'application */
bg-neutral-light

/* Gris moyen - Texte secondaire, états désactivés */
text-neutral-medium

/* Gris foncé - Texte principal, titres */
text-neutral-dark

/* Gris bordure - Bordures, contours */
border-neutral-border
```

### Couleurs d'arrière-plan

```css
/* Blanc pur - Cartes de contenu */
bg-background-primary

/* Blanc cassé - Arrière-plan d'application */
bg-background-secondary

/* Teinte verte claire - Sections en vedette */
bg-background-accent
```

## 📝 Typographie

### En-têtes

```css
/* H1 - Titres de page principaux */
text-h1

/* H2 - En-têtes de section majeurs */
text-h2

/* H3 - En-têtes de section */
text-h3

/* H4 - En-têtes de sous-section */
text-h4
```

### Texte du corps

```css
/* Texte large - Contenu important */
text-body-large

/* Texte standard - Contenu général */
text-body

/* Texte petit - Détails, métadonnées */
text-body-small
```

### Texte spécial

```css
/* Légende - Textes d'aide, crédits */
text-caption

/* Bouton - Texte des boutons */
text-button

/* Lien - Texte des liens */
text-link

/* Étiquette - Labels de formulaire */
text-label
```

### Poids de police

```css
font-regular    /* 400 - Texte standard */
font-medium     /* 500 - Emphase, navigation */
font-semibold   /* 600 - En-têtes, métriques */
font-bold       /* 700 - Titres principaux */
```

## 📏 Système d'espacement

### Espacement en pixels (dp)

```css
p-2dp    /* 2px - Espacement micro */
p-4dp    /* 4px - Espacement minimal */
p-8dp    /* 8px - Petit espacement */
p-12dp   /* 12px - Espacement compact */
p-16dp   /* 16px - Espacement standard */
p-24dp   /* 24px - Espacement moyen */
p-32dp   /* 32px - Grand espacement */
p-48dp   /* 48px - Très grand espacement */
p-64dp   /* 64px - Espacement maximum */
```

### Utilisation avec margin et padding

```css
m-16dp   /* Margin standard */
p-24dp   /* Padding moyen */
gap-8dp  /* Espacement entre éléments flex/grid */
```

## 🧩 Composants UI

### Boutons

```css
/* Bouton primaire - 48dp de hauteur */
h-48dp bg-primary text-white rounded-8dp

/* Bouton secondaire - Bordure verte */
h-48dp border-2 border-primary text-primary rounded-8dp

/* Bouton fantôme - Transparent */
h-44dp text-primary

/* Bouton destructif - Rouge */
h-48dp bg-functional-error text-white rounded-8dp
```

### Cartes

```css
/* Carte primaire - Ombre standard */
bg-background-primary rounded-12dp shadow-card-primary p-20dp

/* Carte dashboard - Ombre légère */
bg-background-primary rounded-16dp shadow-card-dashboard p-24dp

/* Carte nutrition - Arrière-plan accent */
bg-background-accent rounded-12dp p-16dp
```

### Champs de saisie

```css
/* Champ standard - 56dp de hauteur */
h-56dp border-2 border-neutral-border focus:border-primary rounded-8dp

/* Champ de recherche - 44dp, arrondi */
h-44dp bg-background-secondary rounded-22dp

/* Zone de texte - 96dp minimum */
min-h-96dp p-16dp border-2 border-neutral-border rounded-8dp
```

### Navigation

```css
/* Barre latérale - 240dp de largeur */
w-240dp bg-primary-white

/* Onglets - 48dp de hauteur */
h-48dp border-b-2 border-primary
```

### Icônes

```css
/* Icône primaire - 24x24px */
w-6 h-6

/* Icône petite - 20x20px */
w-5 h-5

/* Icône navigation - 28x28px */
w-7 h-7

/* Icône fonctionnalité - 32x32px */
w-8 h-8
```

## 🎬 Animations et transitions

### Durées de transition

```css
transition-duration-standard    /* 200ms */
transition-duration-emphasis    /* 300ms */
transition-duration-micro       /* 150ms */
transition-duration-page        /* 350ms */
transition-duration-loading     /* 1200ms */
```

### Fonctions d'interpolation

```css
transition-timing-standard      /* ease-out */
transition-timing-emphasis      /* cubic-bezier(0.4, 0.0, 0.2, 1) */
transition-timing-micro         /* ease-in-out */
transition-timing-page          /* cubic-bezier(0.25, 0.46, 0.45, 0.94) */
transition-timing-loading       /* linear */
```

### Exemples d'utilisation

```css
/* Transition standard pour survol */
hover:bg-secondary transition-duration-standard transition-timing-standard

/* Transition d'emphase pour clic */
active:scale-95 transition-duration-emphasis transition-timing-emphasis

/* Micro-transition pour toggle */
transition-duration-micro transition-timing-micro
```

## ♿ Accessibilité

### États de focus

```css
/* Anneau de focus - 2dp Primary Green avec 20% d'opacité */
focus:shadow-focus focus:outline-none

/* Focus visible pour navigation clavier */
focus-visible:shadow-focus
```

### Cibles tactiles

```css
/* Taille minimum 44dp pour éléments interactifs */
min-h-44dp min-w-44dp

/* Taille recommandée 48dp pour actions principales */
h-48dp w-48dp
```

## 🌙 Mode sombre

### Activation du mode sombre

```css
/* Classe automatique appliquée selon les préférences système */
.dark {
  /* Variables CSS automatiquement mises à jour */
}
```

### Utilisation des variables CSS

```css
/* Utilisation directe des variables */
background-color: var(--color-background-primary);
color: var(--color-neutral-dark);
```

## 📱 Responsive Design

### Breakpoints Tailwind par défaut

```css
sm:  /* 640px et plus */
md:  /* 768px et plus */
lg:  /* 1024px et plus */
xl:  /* 1280px et plus */
2xl: /* 1536px et plus */
```

### Exemples d'utilisation responsive

```css
/* Mobile-first : petit sur mobile, grand sur desktop */
text-body-small md:text-body-large

/* Navigation : bottom sur mobile, sidebar sur desktop */
bottom-0 md:bottom-auto md:left-0 md:w-240dp

/* Espacement adaptatif */
p-16dp md:p-24dp lg:p-32dp
```

## 🎯 Bonnes pratiques

### 1. Utiliser les classes sémantiques

```css
/* ✅ Bon - Utilise les classes NutriSensia */
bg-primary text-white h-48dp rounded-8dp

/* ❌ Éviter - Utilise des valeurs arbitraires */
bg-[#2E7D5E] text-white h-[48px] rounded-[8px]
```

### 2. Respecter la hiérarchie des couleurs

```css
/* ✅ Bon - Utilise la hiérarchie définie */
text-neutral-dark    /* Texte principal */
text-neutral-medium  /* Texte secondaire */
text-functional-error /* Texte d'erreur */
```

### 3. Utiliser le système d'espacement cohérent

```css
/* ✅ Bon - Utilise les valeurs dp */
p-16dp m-24dp gap-8dp

/* ❌ Éviter - Mélange d'unités */
p-4 m-6 gap-2
```

### 4. Optimiser pour l'accessibilité

```css
/* ✅ Bon - Inclut les états de focus */
focus:shadow-focus focus:outline-none

/* ✅ Bon - Taille tactile appropriée */
min-h-44dp min-w-44dp
```

## 🔧 Personnalisation

### Ajouter de nouvelles couleurs

```typescript
// Dans tailwind.config.ts
colors: {
  custom: {
    light: '#FFE4E1',
    DEFAULT: '#FFB6C1',
    dark: '#FF69B4',
  }
}
```

### Créer de nouvelles classes utilitaires

```typescript
// Dans tailwind.config.ts
plugins: [
  function ({ addUtilities }: any) {
    addUtilities({
      '.text-gradient': {
        background:
          'linear-gradient(45deg, var(--color-primary), var(--color-accent-teal))',
        '-webkit-background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
      },
    });
  },
];
```

## 📚 Ressources supplémentaires

- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Spécifications du design system NutriSensia](./design-system-specs.md)
- [Guide d'accessibilité WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Variables CSS personnalisées](https://developer.mozilla.org/fr/docs/Web/CSS/Using_CSS_custom_properties)
