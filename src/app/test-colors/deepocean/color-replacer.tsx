'use client';

import { useEffect } from 'react';

/**
 * Color Replacer Component
 * ========================
 *
 * Ce composant force le remplacement des couleurs vertes par des bleus
 * dans tous les styles inline, même ceux appliqués dynamiquement.
 *
 * Il observe le DOM et remplace les couleurs à chaque modification.
 */

// Mapping des couleurs : VERT → BLEU
const COLOR_MAP: Record<string, string> = {
  // Primaires
  '#3f6655': '#2C5282',
  '#2E7D5E': '#2C5282',
  '#2e7d5e': '#2C5282',
  '#1B4F3F': '#1E3A5F',
  '#1b4f3f': '#1E3A5F',

  // Hover states
  '#2f5645': '#1E3A5F',
  '#2d5042': '#1A3551',

  // Secondaires
  '#4A9B7B': '#5A7BA6',
  '#4a9b7b': '#5A7BA6',
  '#E8F3EF': '#E8EEF5',
  '#e8f3ef': '#E8EEF5',
  '#B8D4C7': '#B8C8DC',
  '#b8d4c7': '#B8C8DC',

  // Boutons light
  '#b6ccae': '#B8C8DC',
  '#a6bc9e': '#A0B4CC',

  // Borders et accents
  '#b2c2bb': '#B8C8DC',
  '#d7e1ce': '#CBD6E8',

  // Purple → Orange (complémentaire pour top bar et accents)
  '#9461bc': '#E67E22', // Orange vif (top bar)

  // CTA Banner bleu → Orange vif principal
  '#5e69bd': '#E67E22', // Orange vif

  // Backgrounds
  '#f8f7ef': '#F5F8FA',

  // Text
  '#41556b': '#3A4A5C',

  // RGBA overlays
  'rgba(63, 102, 85, 0.2)': 'rgba(44, 82, 130, 0.2)',
  'rgba(63, 102, 85, 0.4)': 'rgba(44, 82, 130, 0.4)',
  'rgba(63,102,85,0.2)': 'rgba(44,82,130,0.2)',
  'rgba(63,102,85,0.4)': 'rgba(44,82,130,0.4)',

  // RGB (sans alpha) - pour les box-shadows notamment
  'rgb(63, 102, 85)': 'rgb(44, 82, 130)',
  'rgb(63,102,85)': 'rgb(44,82,130)',
  'rgb(215, 225, 206)': 'rgb(203, 214, 232)', // d7e1ce -> CBD6E8
  'rgb(215,225,206)': 'rgb(203,214,232)',
  'rgb(182, 204, 174)': 'rgb(184, 200, 220)', // b6ccae -> B8C8DC
  'rgb(182,204,174)': 'rgb(184,200,220)',
  'rgb(148, 97, 188)': 'rgb(230, 126, 34)', // 9461bc -> E67E22 (top bar)
  'rgb(148,97,188)': 'rgb(230,126,34)',
  'rgb(94, 105, 189)': 'rgb(230, 126, 34)', // 5e69bd -> E67E22 (CTA banner)
  'rgb(94,105,189)': 'rgb(230,126,34)',
};

export function ColorReplacer() {
  useEffect(() => {
    console.log('🎨 Color Replacer activé - Palette Deep Ocean');

    // Fonction pour remplacer les couleurs dans une chaîne
    const replaceColors = (str: string): string => {
      let result = str;
      for (const [oldColor, newColor] of Object.entries(COLOR_MAP)) {
        // Remplace toutes les occurrences (insensible à la casse pour les hex)
        const regex = new RegExp(oldColor.replace('#', '#?'), 'gi');
        result = result.replace(regex, newColor);
      }
      return result;
    };

    // Fonction pour traiter un élément
    const processElement = (element: HTMLElement) => {
      // Traite l'attribut style
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
            // Traite aussi les enfants
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

    // Re-traite les éléments toutes les 500ms pour attraper les changements dynamiques
    // (réduction de la fréquence pour éviter d'interférer avec les animations)
    const interval = setInterval(processAllElements, 500);

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement
}
