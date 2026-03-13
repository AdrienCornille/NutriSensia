---
name: design-audit
description: Auditer la coherence d'un composant ou d'une page avec le design system NutriSensia (couleurs, typo, spacing, patterns de cartes)
argument-hint: "[file-path or component-name]"
allowed-tools: Read, Glob, Grep
context: fork
agent: Explore
---

# Design System Audit

Audite le fichier ou composant `$ARGUMENTS` pour verifier sa coherence avec le design system NutriSensia.

## Regles du Design System

### Couleurs autorisees

**Primaires** (utiliser les valeurs Tailwind custom ou les hex directement) :

- Primaire : `#1B998B` (boutons, accents, liens actifs)
- Primaire hover : `#178a7d` ou `#158578`
- Texte principal : `text-gray-800`
- Texte secondaire : `text-gray-500` ou `text-gray-600`
- Texte tertiaire : `text-gray-400`
- Fond de carte : `bg-white`
- Bordure de carte : `border-gray-200`
- Bordure separateur : `border-gray-100`
- Fond de page : `bg-gray-50`

**Couleurs fonctionnelles** :

- Succes/Vert : `emerald-500/600` (pas green sauf fibres)
- Avertissement : `amber-400/500/600`
- Erreur : `red-400/500/600`
- Info : `blue-500/600`
- Violet (templates) : `purple-600`

**Macronutriments** (grille 5 colonnes) :

- Calories : `orange-50/400/600/700`
- Proteines : `blue-50/400/600/700`
- Glucides : `amber-50/400/600/700`
- Lipides : `rose-50/400/600/700`
- Fibres : `green-50/500/600/700`

**Violations courantes a detecter** :

- Utilisation de `text-black` au lieu de `text-gray-800`
- Utilisation de `bg-green-*` pour autre chose que les fibres
- Couleurs hardcodees non reconnues (ex: `#333`, `rgb(...)`)
- Utilisation de `text-gray-900` au lieu de `text-gray-800`

### Typographie

- Titres de carte : `font-semibold text-gray-800` (pas bold, pas text-lg sauf exception)
- Sous-titres : `text-sm text-gray-500`
- Labels : `text-xs font-medium`
- Badges : `text-xs font-medium rounded-full` avec `px-2 py-0.5`
- Valeurs numeriques : `font-bold` ou `font-semibold`
- Bouton primaire : `text-sm font-medium`

### Spacing

- Padding de carte : `p-6` (header), `p-4` (content)
- Gap entre cartes : `gap-6` (grilles), `space-y-3` ou `space-y-4` (listes)
- Gap dans les grilles : `gap-2` (macros, micros), `gap-3` (stats)
- Marges internes badges : `px-2 py-0.5` (petit) ou `px-3 py-1` (moyen)

### Patterns de composants

**Carte standard** :

```
bg-white rounded-xl border border-gray-200 overflow-hidden
  > Header: p-6 border-b border-gray-100
    > Titre: font-semibold text-gray-800
    > Sous-titre: text-sm text-gray-500 mt-1
  > Content: p-4
  > Empty state: p-6 text-center > text-sm text-gray-500
```

**Bouton primaire** :

```
bg-[#1B998B] text-white font-medium rounded-lg hover:bg-[#178a7d] transition-colors
```

**Bouton secondaire** :

```
bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors
```

**Bouton ghost** :

```
text-gray-500 hover:text-[#1B998B] hover:bg-emerald-50 rounded-lg transition-colors
```

### Icones

- Taille standard : `w-4 h-4`
- Taille header : `w-5 h-5`
- Taille inline petit : `w-3 h-3` ou `w-3.5 h-3.5`
- Source : Lucide React uniquement

## Format de sortie

```markdown
## Audit Design System : [nom du fichier]

### Conformite : X/10

### Violations trouvees
1. **[Categorie]** Ligne X : `classe-problematique` → devrait etre `classe-correcte`

### Points positifs
- [Elements conformes au design system]

### Recommandations
- [Suggestions d'amelioration]
```
