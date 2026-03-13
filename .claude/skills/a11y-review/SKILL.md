---
name: a11y-review
description: Audit accessibilite d'un composant ou d'une page (ARIA, HTML semantique, focus, contraste, clavier)
argument-hint: "[file-path or component-name]"
allowed-tools: Read, Glob, Grep
context: fork
agent: Explore
---

# Accessibility Review

Audite l'accessibilite du fichier ou composant `$ARGUMENTS`.

## Checklist d'audit

### 1. HTML Semantique

- [ ] `<button>` pour les actions cliquables (pas `<div onClick>`)
- [ ] `<a>` pour la navigation (avec `href`)
- [ ] `<form>` pour les formulaires avec `<label>` associes
- [ ] `<h1>` a `<h6>` dans l'ordre hierarchique (pas de saut)
- [ ] `<nav>`, `<main>`, `<section>`, `<article>` quand pertinent
- [ ] `<ul>/<ol>` pour les listes
- [ ] `<table>` avec `<thead>`, `<th>` pour les tableaux de donnees

**Violations courantes NutriSensia** :

- Boutons expand/collapse parfois en `<div>` au lieu de `<button>`
- Cards cliquables en `<div onClick>` sans role
- Icones decoratives sans `aria-hidden`

### 2. ARIA

- [ ] `aria-label` sur les boutons sans texte visible (boutons icone)
- [ ] `aria-expanded` sur les toggles (dropdowns, accordions)
- [ ] `aria-hidden="true"` sur les icones decoratives
- [ ] `aria-live="polite"` sur les zones qui changent dynamiquement (toasts, compteurs)
- [ ] `aria-describedby` sur les champs avec messages d'erreur
- [ ] `aria-invalid="true"` sur les champs en erreur
- [ ] `role="dialog"` + `aria-modal="true"` sur les modals
- [ ] `role="alert"` sur les messages d'erreur critiques

### 3. Focus et Navigation Clavier

- [ ] Tous les elements interactifs sont focusables (`tabIndex` si necessaire)
- [ ] Ordre de tabulation logique (pas de `tabIndex` positif)
- [ ] `focus:outline` ou `focus:ring` visible sur tous les elements interactifs
- [ ] Trap de focus dans les modals (`focus-trap` ou equivalent)
- [ ] `Escape` ferme les modals et dropdowns
- [ ] `Enter`/`Space` active les boutons
- [ ] Fleches haut/bas pour la navigation dans les listes

**Pattern Tailwind pour focus** :

```
focus:outline-none focus:ring-2 focus:ring-[#1B998B] focus:ring-offset-2
```

### 4. Formulaires

- [ ] Chaque `<input>` a un `<label>` associe (via `htmlFor` ou englobant)
- [ ] Placeholder n'est pas le seul label visible
- [ ] Messages d'erreur lies via `aria-describedby`
- [ ] Type d'input correct (`email`, `tel`, `number`, etc.)
- [ ] `required` et `aria-required` sur les champs obligatoires
- [ ] `autocomplete` pour les champs standards (name, email, etc.)

### 5. Images et Medias

- [ ] `alt` sur toutes les `<img>` (vide `alt=""` si decoratif)
- [ ] SVG inline : `aria-hidden="true"` si decoratif, `role="img"` + `aria-label` si informatif
- [ ] Icones Lucide : `aria-hidden="true"` sur toutes (decoratives par defaut)

### 6. Contraste de couleurs (WCAG AA)

Verifier les combinaisons de couleurs courantes :

| Texte | Fond | Ratio min | Conforme ? |
|---|---|---|---|
| `text-gray-800` | `bg-white` | 4.5:1 | Oui (12.6:1) |
| `text-gray-500` | `bg-white` | 4.5:1 | Oui (5.9:1) |
| `text-gray-400` | `bg-white` | 4.5:1 | Non (3.9:1) - grand texte OK |
| `text-white` | `bg-[#1B998B]` | 4.5:1 | Oui (4.6:1) |
| `text-amber-700` | `bg-amber-50` | 4.5:1 | Oui (7.1:1) |
| `text-red-600` | `bg-white` | 4.5:1 | Oui (5.4:1) |
| `text-emerald-600` | `bg-white` | 4.5:1 | Oui (4.5:1) |

**Attention** : `text-gray-400` sur fond blanc est sous le seuil pour le texte normal (14px). Acceptable uniquement pour le texte large (18px+) ou les elements decoratifs.

### 7. Motion et Animations

- [ ] `prefers-reduced-motion` respecte (Framer Motion le gere nativement)
- [ ] Pas d'animation qui clignote plus de 3 fois/seconde
- [ ] Les transitions sont subtiles (< 500ms)

## Format de sortie

```markdown
## Audit Accessibilite : [nom du fichier]

### Score : X/7 categories conformes

### Problemes critiques (a corriger)
1. **[Categorie]** Ligne X : description + correction suggeree

### Problemes mineurs (a ameliorer)
1. **[Categorie]** Ligne X : description

### Points positifs
- [Elements deja accessibles]

### Corrections suggerees (code)
- Ligne X : `ancien code` → `nouveau code`
```
