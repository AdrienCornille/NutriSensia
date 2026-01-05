'use client';

import { useEffect } from 'react';

/**
 * Color Replacer Component - Terra Natura
 * ========================================
 *
 * Force le remplacement des couleurs vertes par des tons terre
 * dans tous les styles inline, même dynamiques.
 */

// Mapping des couleurs : VERT → TONS TERRE
const COLOR_MAP: Record<string, string> = {
  // Primaires
  '#3f6655': '#8B6F47',
  '#2E7D5E': '#8B6F47',
  '#2e7d5e': '#8B6F47',
  '#1B4F3F': '#5C4A33',
  '#1b4f3f': '#5C4A33',

  // Hover states
  '#2f5645': '#5C4A33',
  '#2d5042': '#4A3829',

  // Secondaires
  '#4A9B7B': '#A6855A',
  '#4a9b7b': '#A6855A',
  '#E8F3EF': '#F5F1E8',
  '#e8f3ef': '#F5F1E8',
  '#B8D4C7': '#D4C4B0',
  '#b8d4c7': '#D4C4B0',

  // Boutons light
  '#b6ccae': '#D4C4B0',
  '#a6bc9e': '#C4B49F',

  // Borders et accents
  '#b2c2bb': '#D4C4B0',
  '#d7e1ce': '#E8DDD0',

  // Purple & Bleu → Terracotta (accents chauds)
  '#9461bc': '#C17A58', // Terracotta (top bar)
  '#5e69bd': '#C17A58', // Terracotta (CTA banner)

  // Backgrounds
  '#f8f7ef': '#FAF8F3',

  // Text
  '#41556b': '#5C5248',

  // RGBA overlays
  'rgba(63, 102, 85, 0.2)': 'rgba(139, 111, 71, 0.2)',
  'rgba(63, 102, 85, 0.4)': 'rgba(139, 111, 71, 0.4)',
  'rgba(63,102,85,0.2)': 'rgba(139,111,71,0.2)',
  'rgba(63,102,85,0.4)': 'rgba(139,111,71,0.4)',

  // RGB (sans alpha)
  'rgb(63, 102, 85)': 'rgb(139, 111, 71)',
  'rgb(63,102,85)': 'rgb(139,111,71)',
  'rgb(215, 225, 206)': 'rgb(232, 221, 208)', // d7e1ce -> E8DDD0
  'rgb(215,225,206)': 'rgb(232,221,208)',
  'rgb(182, 204, 174)': 'rgb(212, 196, 176)', // b6ccae -> D4C4B0
  'rgb(182,204,174)': 'rgb(212,196,176)',
  'rgb(148, 97, 188)': 'rgb(193, 122, 88)', // 9461bc -> C17A58 (top bar)
  'rgb(148,97,188)': 'rgb(193,122,88)',
  'rgb(94, 105, 189)': 'rgb(193, 122, 88)', // 5e69bd -> C17A58 (CTA banner)
  'rgb(94,105,189)': 'rgb(193,122,88)',
};

export function ColorReplacer() {
  useEffect(() => {
    console.log('🌾 Color Replacer activé - Palette Terra Natura');

    // Fonction pour remplacer les couleurs dans une chaîne
    const replaceColors = (str: string): string => {
      let result = str;
      for (const [oldColor, newColor] of Object.entries(COLOR_MAP)) {
        const regex = new RegExp(oldColor.replace('#', '#?'), 'gi');
        result = result.replace(regex, newColor);
      }
      return result;
    };

    // Fonction pour traiter un élément
    const processElement = (element: HTMLElement) => {
      if (element.style) {
        // Background-color
        if (element.style.backgroundColor) {
          const oldBg = element.style.backgroundColor;
          const newBg = replaceColors(oldBg);
          if (oldBg !== newBg) {
            element.style.backgroundColor = newBg;
          }
        }

        // Color
        if (element.style.color) {
          const oldColor = element.style.color;
          const newColor = replaceColors(oldColor);
          if (oldColor !== newColor) {
            element.style.color = newColor;
          }
        }

        // Border-color
        if (element.style.borderColor) {
          const oldBorder = element.style.borderColor;
          const newBorder = replaceColors(oldBorder);
          if (oldBorder !== newBorder) {
            element.style.borderColor = newBorder;
          }
        }

        // Border (shorthand)
        if (element.style.border) {
          const oldBorder = element.style.border;
          const newBorder = replaceColors(oldBorder);
          if (oldBorder !== newBorder) {
            element.style.border = newBorder;
          }
        }

        // Border-bottom
        if (element.style.borderBottom) {
          const oldBorderBottom = element.style.borderBottom;
          const newBorderBottom = replaceColors(oldBorderBottom);
          if (oldBorderBottom !== newBorderBottom) {
            element.style.borderBottom = newBorderBottom;
          }
        }

        // Box-shadow
        if (element.style.boxShadow) {
          const oldShadow = element.style.boxShadow;
          const newShadow = replaceColors(oldShadow);
          if (oldShadow !== newShadow) {
            element.style.boxShadow = newShadow;
          }
        }
      }
    };

    // Traite tous les éléments existants
    const processAllElements = () => {
      const elements = document.querySelectorAll<HTMLElement>('[style]');
      elements.forEach(processElement);
    };

    // Exécute immédiatement
    processAllElements();

    // Observe les changements du DOM
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        // Traite les nouveaux nœuds ajoutés
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            processElement(node);
            node
              .querySelectorAll<HTMLElement>('[style]')
              .forEach(processElement);
          }
        });

        // Traite les modifications d'attributs style
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style'
        ) {
          if (mutation.target instanceof HTMLElement) {
            processElement(mutation.target);
          }
        }
      });
    });

    // Configure l'observateur
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    });

    // Re-traite les éléments toutes les 500ms
    const interval = setInterval(processAllElements, 500);

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}
