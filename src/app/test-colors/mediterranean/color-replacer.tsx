'use client';

import { useEffect } from 'react';

/**
 * Color Replacer Component - Méditerranée
 * ========================================
 *
 * Force le remplacement des couleurs vertes par des tons méditerranéens
 * (turquoise, sable doré, terracotta)
 */

// Mapping des couleurs : VERT → MÉDITERRANÉE
const COLOR_MAP: Record<string, string> = {
  // Primaires - Turquoise
  '#3f6655': '#1B998B',
  '#2E7D5E': '#1B998B',
  '#2e7d5e': '#1B998B',
  '#1B4F3F': '#147569',
  '#1b4f3f': '#147569',

  // Hover states (boutons)
  '#2f5645': '#147569',
  '#2d5042': '#0F5F56',
  '#20332b': '#0A4A43',

  // Secondaires - Sable Doré
  '#4A9B7B': '#E9C46A',
  '#4a9b7b': '#E9C46A',
  '#E8F3EF': '#F8F5F2',
  '#e8f3ef': '#F8F5F2',
  '#B8D4C7': '#E5DED6',
  '#b8d4c7': '#E5DED6',

  // Boutons light
  '#b6ccae': '#E5DED6',
  '#a6bc9e': '#D9CFC3',

  // Borders et accents
  '#b2c2bb': '#E5DED6',
  '#d7e1ce': '#E5DED6',
  '#e5e8e0': '#F0EBE5',

  // Purple & Bleu → Terracotta (accents chauds)
  '#9461bc': '#E76F51', // Terracotta (top bar)
  '#5e69bd': '#E76F51', // Terracotta (CTA banner)

  // Newsletter button
  '#b4cafa': '#F4D6A0', // Sable clair

  // Accents existants → Méditerranée
  '#00A693': '#2EC4B6', // Teal → Turquoise vif
  '#7FD1C1': '#78CFC6', // Mint → Turquoise clair
  '#F4A261': '#E76F51', // Orange → Terracotta
  '#D4A574': '#E9C46A', // Gold → Sable doré

  // Backgrounds
  '#f8f7ef': '#FBF9F7',
  '#FAFBFC': '#FDFCFB',

  // Text
  '#41556b': '#4A5568',
  '#374151': '#524A42',

  // RGBA overlays
  'rgba(63, 102, 85, 0.2)': 'rgba(27, 153, 139, 0.2)',
  'rgba(63, 102, 85, 0.4)': 'rgba(27, 153, 139, 0.4)',
  'rgba(63,102,85,0.2)': 'rgba(27,153,139,0.2)',
  'rgba(63,102,85,0.4)': 'rgba(27,153,139,0.4)',

  // RGB (sans alpha)
  'rgb(63, 102, 85)': 'rgb(27, 153, 139)',
  'rgb(63,102,85)': 'rgb(27,153,139)',
  'rgb(46, 125, 94)': 'rgb(27, 153, 139)', // #2E7D5E
  'rgb(46,125,94)': 'rgb(27,153,139)',
  'rgb(27, 79, 63)': 'rgb(20, 117, 105)', // #1B4F3F
  'rgb(27,79,63)': 'rgb(20,117,105)',
  'rgb(47, 86, 69)': 'rgb(20, 117, 105)', // #2f5645
  'rgb(47,86,69)': 'rgb(20,117,105)',
  'rgb(45, 80, 66)': 'rgb(15, 95, 86)', // #2d5042
  'rgb(45,80,66)': 'rgb(15,95,86)',
  'rgb(215, 225, 206)': 'rgb(229, 222, 214)', // d7e1ce -> E5DED6
  'rgb(215,225,206)': 'rgb(229,222,214)',
  'rgb(182, 204, 174)': 'rgb(229, 222, 214)', // b6ccae -> E5DED6
  'rgb(182,204,174)': 'rgb(229,222,214)',
  'rgb(148, 97, 188)': 'rgb(231, 111, 81)', // 9461bc -> E76F51 (top bar)
  'rgb(148,97,188)': 'rgb(231,111,81)',
  'rgb(94, 105, 189)': 'rgb(231, 111, 81)', // 5e69bd -> E76F51 (CTA banner)
  'rgb(94,105,189)': 'rgb(231,111,81)',
  'rgb(74, 155, 123)': 'rgb(233, 196, 106)', // #4A9B7B -> E9C46A
  'rgb(74,155,123)': 'rgb(233,196,106)',
};

export function ColorReplacer() {
  useEffect(() => {
    console.log('🌊 Color Replacer activé - Palette Méditerranée');

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
