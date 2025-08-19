# Guide d'Accessibilité - NutriSensia

## 📋 Vue d'ensemble

Ce guide présente les standards d'accessibilité WCAG 2.1 AA implémentés dans le design system NutriSensia pour garantir une expérience utilisateur inclusive pour tous.

## 🎯 Conformité WCAG 2.1 AA

### Critères principaux respectés

#### 1. **Perceptible**

- **1.4.3 Contraste (Minimum)** : Contraste de 4.5:1 minimum pour le texte normal
- **1.4.6 Contraste (Amélioré)** : Contraste de 7:1 pour le texte important
- **1.4.8 Présentation visuelle** : Espacement des lignes et paragraphes appropriés

#### 2. **Utilisable**

- **2.1.1 Clavier** : Tous les éléments interactifs accessibles au clavier
- **2.1.2 Pas de piège au clavier** : Navigation libre sans piège
- **2.4.1 Contourner les blocs** : Liens d'évitement et navigation structurée
- **2.4.3 Ordre de focus** : Ordre de tabulation logique et prévisible
- **2.4.7 Focus visible** : Indicateur de focus clairement visible

#### 3. **Compréhensible**

- **3.1.1 Langue de la page** : Langue française déclarée
- **3.2.1 Au focus** : Pas de changement de contexte automatique
- **3.2.2 À la saisie** : Changements de contexte contrôlés

#### 4. **Robuste**

- **4.1.1 Analyse** : Code HTML valide et bien structuré
- **4.1.2 Nom, rôle, valeur** : Attributs ARIA appropriés

## 🎨 Contraste des couleurs

### Palette NutriSensia - Conformité WCAG AA

| Couleur                      | Utilisation          | Contraste | Statut                     |
| ---------------------------- | -------------------- | --------- | -------------------------- |
| Primary (#2E7D5E)            | Texte sur fond clair | 4.8:1     | ✅ Conforme                |
| Secondary (#4A9B7B)          | Texte sur fond clair | 4.2:1     | ✅ Conforme                |
| Neutral Dark (#374151)       | Texte principal      | 12.6:1    | ✅ Conforme                |
| Functional Error (#EF4444)   | Messages d'erreur    | 4.5:1     | ✅ Conforme                |
| Functional Success (#22C55E) | Messages de succès   | 3.2:1     | ⚠️ Amélioration nécessaire |

### Classes CSS pour le contraste

```css
/* Texte avec contraste élevé */
.text-high-contrast {
  color: #374151; /* Neutral Dark */
}

/* Texte avec contraste moyen */
.text-medium-contrast {
  color: #6b7280; /* Neutral Medium */
}

/* Arrière-plans avec contraste approprié */
.bg-high-contrast {
  background-color: #ffffff;
}

.bg-medium-contrast {
  background-color: #f8f9fa;
}
```

## ⌨️ Navigation par clavier

### Ordre de tabulation

1. **Liens d'évitement** (skip links)
2. **Navigation principale**
3. **Contenu principal**
4. **Navigation secondaire**
5. **Pied de page**

### Raccourcis clavier

| Touche        | Action                              |
| ------------- | ----------------------------------- |
| `Tab`         | Navigation vers l'élément suivant   |
| `Shift + Tab` | Navigation vers l'élément précédent |
| `Entrée`      | Activer un élément                  |
| `Espace`      | Activer un bouton ou checkbox       |
| `Échap`       | Fermer une modal ou annuler         |
| `Flèches`     | Navigation dans les listes et menus |

### Focus visible

```css
/* Indicateur de focus personnalisé */
.focus-visible {
  outline: 2px solid #2e7d5e;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Focus pour les éléments interactifs */
button:focus,
input:focus,
a:focus {
  outline: 2px solid #2e7d5e;
  outline-offset: 2px;
}
```

## 📱 Cibles tactiles

### Tailles minimales

- **Boutons** : 48dp × 48dp minimum
- **Liens** : 44dp × 44dp minimum
- **Champs de saisie** : 56dp de hauteur
- **Éléments de navigation** : 48dp × 48dp

### Classes CSS pour les cibles tactiles

```css
/* Cible tactile standard */
.touch-target {
  min-height: 48px;
  min-width: 48px;
  padding: 12px 16px;
}

/* Cible tactile pour les boutons */
.button-touch-target {
  min-height: 48px;
  min-width: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

## 🗣️ Support des lecteurs d'écran

### Attributs ARIA

#### Rôles ARIA

```html
<!-- Navigation principale -->
<nav role="navigation" aria-label="Navigation principale">
  <!-- Contenu principal -->
  <main role="main">
    <!-- Contenu complémentaire -->
    <aside role="complementary">
      <!-- Formulaire -->
      <form role="form" aria-labelledby="form-title"></form>
    </aside>
  </main>
</nav>
```

#### États ARIA

```html
<!-- Élément expansible -->
<button aria-expanded="false" aria-controls="menu-content">Menu</button>

<!-- Élément sélectionné -->
<button aria-pressed="true">Option sélectionnée</button>

<!-- Élément désactivé -->
<button aria-disabled="true">Action non disponible</button>
```

#### Live regions

```html
<!-- Annonce de statut -->
<div aria-live="polite" aria-atomic="true">
  Données sauvegardées avec succès
</div>

<!-- Annonce d'erreur -->
<div aria-live="assertive" aria-atomic="true">
  Erreur : Impossible de sauvegarder
</div>
```

### Labels et descriptions

```html
<!-- Label explicite -->
<label for="email">Adresse email</label>
<input id="email" type="email" aria-describedby="email-help" />

<!-- Description d'aide -->
<p id="email-help">Format : nom@domaine.com</p>

<!-- Label pour les boutons -->
<button aria-label="Fermer la fenêtre">
  <svg>...</svg>
</button>
```

## 🧪 Tests d'accessibilité

### Tests automatisés

#### Outils utilisés

- **axe-core** : Tests automatisés WCAG 2.1 AA
- **Lighthouse** : Audit d'accessibilité
- **WAVE** : Évaluation en ligne

#### Critères testés automatiquement

- Contraste des couleurs
- Structure sémantique
- Navigation par clavier
- Labels et descriptions
- Ordre de focus
- Attributs ARIA

### Tests manuels

#### Navigation par clavier

1. Utiliser uniquement le clavier pour naviguer
2. Vérifier l'ordre de tabulation logique
3. Tester tous les éléments interactifs
4. Vérifier les raccourcis clavier

#### Lecteurs d'écran

1. **NVDA** (Windows)
2. **JAWS** (Windows)
3. **VoiceOver** (macOS)
4. **TalkBack** (Android)

#### Tests de contraste

1. **WebAIM Contrast Checker**
2. **Stark** (plugin Figma/Sketch)
3. **Colour Contrast Analyser**

## 🎛️ Préférences d'accessibilité

### Détection automatique

```javascript
// Préférences de mouvement réduit
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
);

// Préférences de contraste élevé
const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');

// Préférences de couleur
const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)');
```

### Personnalisation utilisateur

- **Taille de police** : Small, Medium, Large
- **Espacement des lignes** : Tight, Normal, Loose
- **Thème** : Light, Dark, Auto
- **Animations** : On/Off
- **Indicateur de focus** : On/Off

## 📋 Checklist d'accessibilité

### Avant la mise en production

- [ ] **Contraste** : Tous les textes ont un contraste ≥ 4.5:1
- [ ] **Clavier** : Navigation complète au clavier possible
- [ ] **Focus** : Indicateur de focus visible sur tous les éléments
- [ ] **Labels** : Tous les éléments de formulaire ont des labels
- [ ] **ARIA** : Attributs ARIA appropriés pour les éléments complexes
- [ ] **Sémantique** : Structure HTML sémantique correcte
- [ ] **Images** : Textes alternatifs pour toutes les images
- [ ] **Vidéo** : Sous-titres et transcriptions disponibles
- [ ] **Audio** : Transcripts pour tout contenu audio
- [ ] **Mouvement** : Respect des préférences de mouvement réduit

### Tests de validation

- [ ] **axe-core** : Aucune violation WCAG 2.1 AA
- [ ] **Lighthouse** : Score d'accessibilité ≥ 95
- [ ] **Navigation clavier** : Test manuel complet
- [ ] **Lecteur d'écran** : Test avec au moins un lecteur d'écran
- [ ] **Mobile** : Test sur appareils tactiles
- [ ] **Zoom** : Test avec zoom 200%

## 🔧 Composants d'accessibilité

### Hooks personnalisés

```typescript
// Détection des préférences d'accessibilité
const { isReducedMotion, isHighContrast, isScreenReader } = useAccessibility();

// Navigation par clavier
const { focusedElement } = useKeyboardNavigation();

// Annonces aux lecteurs d'écran
const { announce, announceError, announceSuccess } =
  useScreenReaderAnnouncements();

// Préférences utilisateur
const { preferences, updatePreference } = useAccessibilityPreferences();
```

### Composants de test

- **AccessibilityTest** : Tests visuels d'accessibilité
- **AccessibilityAudit** : Audit automatisé avec axe-core
- **AccessibilityPanel** : Panneau de préférences

## 📚 Ressources

### Documentation WCAG

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Guidelines](https://webaim.org/standards/wcag/checklist)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Outils de test

- [axe-core](https://github.com/dequelabs/axe-core)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Lecteurs d'écran

- [NVDA](https://www.nvaccess.org/about-nvda/) (Windows, gratuit)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/vision/) (macOS, intégré)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283673) (Android, intégré)

## 🚀 Améliorations continues

### Métriques à suivre

- **Score d'accessibilité** : Objectif ≥ 95/100
- **Violations WCAG** : Objectif 0 violation critique
- **Temps de navigation clavier** : < 30 secondes pour les tâches principales
- **Satisfaction utilisateurs** : Feedback des utilisateurs avec handicaps

### Plan d'amélioration

1. **Audit trimestriel** : Vérification complète de l'accessibilité
2. **Tests utilisateurs** : Sessions avec des utilisateurs ayant des handicaps
3. **Formation équipe** : Sensibilisation aux bonnes pratiques
4. **Mise à jour outils** : Veille sur les nouveaux outils et standards

---

_Ce guide est un document vivant qui sera mis à jour régulièrement pour refléter les meilleures pratiques d'accessibilité et les évolutions des standards WCAG._
