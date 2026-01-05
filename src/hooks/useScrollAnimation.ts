import { useEffect, useRef, useState } from 'react';
import { Variants } from 'framer-motion';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook pour les animations déclenchées par le scroll
 *
 * Utilise l'Intersection Observer API pour détecter quand un élément
 * entre dans le viewport et déclencher les animations CSS.
 *
 * @param options Configuration de l'observer
 * @returns [ref, isVisible] - Ref à attacher à l'élément et état de visibilité
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);

          // Si triggerOnce est true (par défaut), on arrête d'observer après le premier trigger
          if (options.triggerOnce !== false) {
            observer.unobserve(entry.target);
          }
        } else if (options.triggerOnce === false) {
          // Si triggerOnce est false, on peut re-déclencher l'animation
          setIsInView(false);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '-50px',
      }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin, options.triggerOnce]);

  return { elementRef, isInView };
}

/**
 * Hook pour les animations avec délai (stagger effect)
 *
 * @param delay Délai en millisecondes avant de déclencher l'animation
 * @param options Options de l'observer
 * @returns [ref, isVisible] - Ref et état avec délai appliqué
 */
export function useScrollAnimationWithDelay(
  delay: number = 0,
  options: ScrollAnimationOptions = {}
) {
  const { elementRef, isInView: isIntersecting } = useScrollAnimation(options);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isIntersecting && delay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    } else if (isIntersecting) {
      setIsVisible(true);
    }
  }, [isIntersecting, delay]);

  return { elementRef, isInView: isVisible };
}

/**
 * Classes CSS pour les animations communes
 */
export const animationClasses = {
  // Fade-in simple
  fadeIn: {
    base: 'transition-opacity duration-600 ease-out',
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },

  // Fade + slide-up
  fadeSlideUp: {
    base: 'transition-all duration-800 ease-out',
    hidden: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },

  // Fade + slide-left (pour éléments venant de la droite)
  fadeSlideLeft: {
    base: 'transition-all duration-800 ease-out',
    hidden: 'opacity-0 translate-x-12',
    visible: 'opacity-100 translate-x-0',
  },

  // Fade + slide-right (pour éléments venant de la gauche)
  fadeSlideRight: {
    base: 'transition-all duration-800 ease-out',
    hidden: 'opacity-0 -translate-x-12',
    visible: 'opacity-100 translate-x-0',
  },

  // Scale-in
  scaleIn: {
    base: 'transition-all duration-500 ease-out',
    hidden: 'opacity-0 scale-90',
    visible: 'opacity-100 scale-100',
  },

  // Scale-in subtil (pour les boxes)
  scaleInSubtle: {
    base: 'transition-all duration-400 ease-out',
    hidden: 'opacity-0 scale-98',
    visible: 'opacity-100 scale-100',
  },
};

/**
 * Utilitaire pour créer des classes d'animation personnalisées
 */
export function createAnimationClass(
  isVisible: boolean,
  animationType: keyof typeof animationClasses
) {
  const animation = animationClasses[animationType];
  return `${animation.base} ${isVisible ? animation.visible : animation.hidden}`;
}

/**
 * Variantes d'animation pour Framer Motion
 */
export const animationVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  fadeSlideUp: {
    hidden: {
      opacity: 0,
      y: 32,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  },

  fadeSlideLeft: {
    hidden: {
      opacity: 0,
      x: 48,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  },

  fadeSlideRight: {
    hidden: {
      opacity: 0,
      x: -48,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  },

  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },

  staggerItem: {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },
};

/**
 * Créer une variante avec délai personnalisé
 */
export function createDelayedVariant(
  baseVariant: Variants,
  delay: number
): Variants {
  return {
    ...baseVariant,
    visible: {
      ...baseVariant.visible,
      transition: {
        ...baseVariant.visible?.transition,
        delay,
      },
    },
  };
}
