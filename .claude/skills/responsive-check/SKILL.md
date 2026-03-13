---
name: responsive-check
description: Verifier le comportement responsive d'un composant ou d'une page (breakpoints, mobile-first, grilles adaptatives)
argument-hint: "[file-path or component-name]"
allowed-tools: Read, Glob, Grep
context: fork
agent: Explore
---

# Responsive Design Check

Verifie le comportement responsive du fichier ou composant `$ARGUMENTS`.

## Breakpoints Tailwind (mobile-first)

| Prefix | Min-width | Usage NutriSensia |
|---|---|---|
| (default) | 0px | Mobile (base) |
| `sm:` | 640px | Tablette portrait |
| `md:` | 768px | Tablette paysage |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Grand ecran |
| `2xl:` | 1536px | Tres grand ecran |

## Regles a verifier

### 1. Approche Mobile-First

Les styles de base (sans prefix) doivent etre pour mobile. Les breakpoints ajoutent la complexite :

**Correct** :

```tsx
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
```

**Incorrect** :

```tsx
<div className='grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4'>
```

### 2. Grilles adaptatives

Verifier que les grilles s'adaptent :

| Pattern desktop | Mobile attendu |
|---|---|
| `grid-cols-5` (macros) | `grid-cols-2` ou `grid-cols-3` sur mobile |
| `grid-cols-4` (layout 3/4+1/4) | `grid-cols-1` empile sur mobile |
| `grid-cols-3` (stats) | `grid-cols-1` ou `grid-cols-2` |

**Patterns NutriSensia courants** :

```tsx
// Layout principal
<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
  <div className='lg:col-span-3'>...</div>
  <div className='lg:col-span-1'>...</div>
</div>

// Grille macros
<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2'>

// Stats
<div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
```

### 3. Texte et Typographie

- [ ] Pas de `text-base` ou plus grand sans adaptation mobile
- [ ] Les titres longs ne debordent pas (`truncate` ou `line-clamp-*` si necessaire)
- [ ] `break-words` sur les contenus dynamiques (noms d'aliments, descriptions)

### 4. Sidebar et Navigation

- [ ] La sidebar sticky doit passer en contenu normal sur mobile
- [ ] Les tabs horizontaux restent scrollables sur mobile (`overflow-x-auto`)
- [ ] Le menu nutritionniste se collapse sur mobile

### 5. Modals

- [ ] Les modals sont en plein ecran sur mobile (`w-full h-full sm:max-w-lg sm:h-auto`)
- [ ] Le contenu des modals est scrollable (`overflow-y-auto`)
- [ ] Les boutons d'action sont accessibles (pas coupes par le clavier mobile)

### 6. Padding et Spacing

- [ ] Padding reduit sur mobile : `px-4 lg:px-6`
- [ ] Gap reduit si necessaire : `gap-3 lg:gap-6`
- [ ] Pas de padding excessif qui gaspille l'espace mobile

### 7. Elements caches/affiches

- [ ] `hidden lg:block` pour les elements desktop-only (sidebar, colonnes supplementaires)
- [ ] `lg:hidden` pour les elements mobile-only (bouton hamburger, vue simplifiee)
- [ ] Pas de contenu important cache sans alternative

### 8. Images et SVG

- [ ] `w-full max-w-*` pour limiter la largeur
- [ ] `aspect-ratio` ou `h-auto` pour maintenir les proportions
- [ ] Les graphiques (Recharts) ont un `ResponsiveContainer`

### 9. Touch targets

- [ ] Boutons et liens : minimum `44x44px` sur mobile (`min-h-[44px] min-w-[44px]`)
- [ ] Espacement suffisant entre les cibles tactiles
- [ ] Les petits boutons (`px-2 py-1`) ont une zone tactile elargie sur mobile

## Format de sortie

```markdown
## Audit Responsive : [nom du fichier]

### Score : X/9 categories conformes

### Problemes critiques (casse sur mobile)
1. **[Categorie]** Ligne X : `grid-cols-5` sans alternative mobile
   → Fix : `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`

### Problemes mineurs (UX degradee sur mobile)
1. **[Categorie]** Ligne X : padding trop large sur mobile

### Non applicable
- [Categories non pertinentes pour ce composant]

### Corrections suggerees
| Ligne | Actuel | Suggere |
|---|---|---|
| X | `grid-cols-4` | `grid-cols-1 lg:grid-cols-4` |
| Y | `p-6` | `p-4 lg:p-6` |
```
