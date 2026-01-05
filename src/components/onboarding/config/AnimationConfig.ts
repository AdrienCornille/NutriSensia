/**
 * Configuration des animations pour l'onboarding
 * Optimisation des performances et accessibilité
 */

/**
 * Configuration globale des animations
 */
export const animationConfig = {
  // Respect des préférences utilisateur pour les animations réduites
  respectReducedMotion: true,

  // Durées standard (en secondes)
  durations: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    verySlow: 0.8,
  },

  // Courbes d'easing standard
  easings: {
    easeOut: [0.4, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    spring: { type: 'spring', stiffness: 400, damping: 25 },
  },

  // Configuration pour les animations de liste (stagger)
  stagger: {
    delayChildren: 0.1,
    staggerChildren: 0.05,
  },

  // Seuils de performance
  performance: {
    // Désactiver les animations complexes sur les appareils faibles
    disableOnLowEnd: true,
    // Réduire les animations si la batterie est faible
    respectPowerSaving: true,
    // Limite de FPS pour les animations
    targetFPS: 60,
  },
};

/**
 * Fonction utilitaire pour respecter les préférences d'accessibilité
 */
export const getAccessibleAnimation = (animation: any) => {
  if (typeof window === 'undefined') return animation;

  // Vérifier les préférences utilisateur pour les animations réduites
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion && animationConfig.respectReducedMotion) {
    return {
      initial: animation.animate || {},
      animate: animation.animate || {},
      exit: animation.animate || {},
      transition: { duration: 0 },
    };
  }

  return animation;
};

/**
 * Détection des capacités de l'appareil
 */
export const getDeviceCapabilities = () => {
  if (typeof window === 'undefined') {
    return { isLowEnd: false, supportsPowerAPI: false };
  }

  // Estimation approximative des performances de l'appareil
  const isLowEnd =
    // Nombre de cœurs CPU faible
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
    // Mémoire disponible faible (si supporté)
    // @ts-ignore
    (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
    // User agent suggérant un appareil faible
    /Android.*Chrome\/[0-5]/.test(navigator.userAgent);

  // Support de l'API Battery (expérimentale)
  // @ts-ignore
  const supportsPowerAPI = 'getBattery' in navigator;

  return { isLowEnd, supportsPowerAPI };
};

/**
 * Configuration adaptative des animations basée sur l'appareil
 */
export const getAdaptiveAnimationConfig = () => {
  const { isLowEnd } = getDeviceCapabilities();

  if (isLowEnd && animationConfig.performance.disableOnLowEnd) {
    return {
      ...animationConfig,
      durations: {
        fast: 0.1,
        normal: 0.15,
        slow: 0.2,
        verySlow: 0.3,
      },
      // Désactiver les animations complexes
      disableComplexAnimations: true,
    };
  }

  return animationConfig;
};

/**
 * Variantes d'animation optimisées pour l'accessibilité
 */
export const accessibleVariants = {
  // Fade simple sans mouvement
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Scale minimal
  scaleSubtle: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },

  // Mouvement vertical très léger
  slideSubtle: {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 },
  },
};

/**
 * Hook pour gérer les animations avec respect de l'accessibilité
 */
export const useAccessibleAnimation = (defaultVariants: any) => {
  const adaptiveConfig = getAdaptiveAnimationConfig();

  // Si les animations complexes sont désactivées, utiliser des variantes simples
  if (adaptiveConfig.disableComplexAnimations) {
    return getAccessibleAnimation(accessibleVariants.fade);
  }

  return getAccessibleAnimation(defaultVariants);
};

/**
 * Configuration spécifique pour l'onboarding
 */
export const onboardingAnimationConfig = {
  // Animations de transition entre étapes
  stepTransition: {
    duration: animationConfig.durations.normal,
    ease: animationConfig.easings.easeOut,
  },

  // Animations des illustrations
  illustration: {
    duration: animationConfig.durations.slow,
    ease: animationConfig.easings.easeOut,
    stagger: animationConfig.stagger.staggerChildren,
  },

  // Animations des éléments de progression
  progress: {
    duration: animationConfig.durations.verySlow,
    ease: animationConfig.easings.easeOut,
  },

  // Animations de célébration
  celebration: {
    duration: 3, // Plus long pour l'effet
    ease: animationConfig.easings.easeOut,
    particles: 30,
  },

  // Animations des tours guidés
  tour: {
    duration: animationConfig.durations.fast,
    ease: animationConfig.easings.easeOut,
  },
};

/**
 * Utilitaire pour créer des animations responsives
 */
export const createResponsiveAnimation = (
  mobileVariant: any,
  desktopVariant: any,
  breakpoint: number = 768
) => {
  if (typeof window === 'undefined') return desktopVariant;

  const isMobile = window.innerWidth < breakpoint;
  return isMobile ? mobileVariant : desktopVariant;
};

/**
 * Configuration ARIA pour les animations
 */
export const ariaConfig = {
  // Attributs ARIA pour les éléments animés
  animatedElement: {
    'aria-live': 'polite' as const,
    role: 'status' as const,
  },

  // Attributs pour les indicateurs de progression
  progressIndicator: {
    'aria-label': "Progression de l'onboarding",
    role: 'progressbar' as const,
  },

  // Attributs pour les tours guidés
  tourElement: {
    'aria-describedby': 'tour-description',
    role: 'dialog' as const,
    'aria-modal': 'true' as const,
  },
};
