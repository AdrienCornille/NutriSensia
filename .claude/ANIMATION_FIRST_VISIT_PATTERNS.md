# Patterns d'Animation First-Visit - NutriSensia

Ce document décrit les deux patterns d'animation utilisés pour gérer les animations d'entrée sur le site NutriSensia.

## Résumé

| Pattern      | Hook                  | Usage                           | Comportement                                  |
| ------------ | --------------------- | ------------------------------- | --------------------------------------------- |
| **Global**   | `useGlobalFirstVisit` | Header, Footer, Barre d'annonce | Animation uniquement à la 1ère visite du SITE |
| **Par Page** | `useFirstVisit`       | Sections de contenu de page     | Animation à la 1ère visite de CHAQUE PAGE     |

---

## 1. Pattern Global (Layout Elements)

### Hook: `useGlobalFirstVisit`

**Fichier:** `src/hooks/useGlobalFirstVisit.ts`

**À utiliser pour:**

- `MarketingHeader` (header de navigation)
- `MarketingFooter` (footer)
- Barre d'annonce (announcement bar)
- Tout élément de layout persistant entre les pages

**Comportement:**

- ✅ Animation à la première visite du site (n'importe quelle page)
- ❌ Pas d'animation lors des navigations internes
- ✅ Animation à nouveau lors d'une nouvelle session navigateur

**Implémentation:**

```tsx
import { useGlobalFirstVisit } from '@/hooks/useGlobalFirstVisit';

export function MarketingHeader() {
  const { isFirstVisit } = useGlobalFirstVisit();

  // Style initial : cacher seulement si première visite du SITE
  const getHiddenStyle = (axis: 'x' | 'y', offset: number) => {
    if (!isFirstVisit) {
      return {}; // Pas première visite : visible immédiatement
    }
    return {
      opacity: 0,
      transform:
        axis === 'x' ? `translateX(${offset}px)` : `translateY(${offset}px)`,
    };
  };

  // Transition : animation seulement si première visite
  const getTransition = (delay: number = 0) => {
    if (isFirstVisit) {
      return { delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] };
    }
    return { duration: 0 };
  };

  return (
    <motion.div
      style={getHiddenStyle('y', -20)}
      animate={{ opacity: 1, y: 0 }}
      transition={getTransition(0.1)}
    >
      {/* Contenu */}
    </motion.div>
  );
}
```

**SessionStorage Key:** `nutrisensia_site_visited`

---

## 2. Pattern Par Page (Page Content)

### Hook: `useFirstVisit`

**Fichier:** `src/hooks/useFirstVisit.ts`

**À utiliser pour:**

- Hero sections de chaque page
- Sections de contenu (Benefits, FAQ, Process, etc.)
- Cartes, grilles, accordéons
- Tout composant spécifique à une page

**Comportement:**

- ✅ Animation à la première visite de CHAQUE page
- ❌ Pas d'animation si la page a déjà été visitée dans cette session
- ✅ Animation à nouveau lors d'une nouvelle session navigateur

**Implémentation:**

```tsx
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

export function MySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite de la PAGE
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Style initial : cacher seulement si première visite de cette page
  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) {
      return {}; // Pas première visite : visible immédiatement
    }
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px)`,
    };
  };

  // Transition : animation seulement si première visite ET en vue
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  return (
    <section ref={ref}>
      <motion.div
        style={getHiddenStyle(30)}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={getTransition(0)}
      >
        {/* Contenu */}
      </motion.div>
    </section>
  );
}
```

**SessionStorage Key:** `nutrisensia_visited_pages` (JSON array des pathnames visitées)

---

## Composants utilisant chaque pattern

### Pattern Global (`useGlobalFirstVisit`)

- `src/components/landing/MarketingHeader.tsx`
- `src/components/landing/MarketingFooter.tsx`

### Pattern Par Page (`useFirstVisit`)

**Page d'accueil (`/`):**

- `src/components/landing/home/HeroSection.tsx`
- `src/components/landing/home/AccordionBenefitsSection.tsx`
- `src/components/landing/home/HowItWorksSection.tsx`
- `src/components/landing/home/IsThisForYouSection.tsx`
- `src/components/landing/home/CTABannerSection.tsx`
- `src/components/landing/home/AboutMeSection.tsx`
- `src/components/landing/home/BlogPreviewSection.tsx`
- `src/components/landing/home/FAQSection.tsx`

**Page Approche (`/approche`):**

- `src/components/landing/approach/HeroBanner.tsx`
- `src/components/landing/approach/PrinciplesSection.tsx`
- `src/components/landing/approach/MethodsSection.tsx`
- `src/components/landing/ProcessTimelineCards.tsx`

---

## Points techniques importants

### 1. Pourquoi `usePathname()` au lieu de `window.location.pathname`?

Next.js utilise la navigation client-side. `window.location.pathname` ne se met pas à jour immédiatement lors des navigations internes via `<Link>`. `usePathname()` de `next/navigation` retourne le bon chemin immédiatement.

### 2. Pourquoi capturer la valeur avec `useRef`?

Les sections hors écran (below the fold) montent en même temps que les sections visibles. Sans capture via `useRef`, quand l'utilisateur scrolle et que `useInView` devient `true`, la valeur `isFirstVisit` pourrait déjà avoir changé. Le `useRef` capture la valeur au moment du montage et la garde stable.

### 3. Pourquoi deux clés sessionStorage différentes?

- `nutrisensia_site_visited` : Simple booléen pour le pattern global
- `nutrisensia_visited_pages` : JSON array pour tracker chaque page individuellement

### 4. Logique `showContent` vs `shouldAnimate`

```tsx
const shouldAnimate = isFirstVisit && isInView; // Animer seulement si première visite ET visible
const showContent = !isFirstVisit || isInView; // Montrer si pas première visite OU si visible
```

- `showContent = false` → Élément caché (opacity: 0, y: offset)
- `showContent = true` → Élément visible (opacity: 1, y: 0)
- `shouldAnimate = true` → Transition animée
- `shouldAnimate = false` → Transition instantanée (duration: 0)

---

## Scénarios de test

1. **Nouvelle session** → Visiter `/` → Header, Footer, et contenu s'animent
2. **Navigation interne** → Cliquer sur "Approche" → Header/Footer ne s'animent PAS, contenu de `/approche` s'anime
3. **Retour arrière** → Retourner sur `/` → Rien ne s'anime (tout déjà visité)
4. **Nouvelle session** → Fermer l'onglet, rouvrir → Tout s'anime à nouveau
