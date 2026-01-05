/**
 * Base de données des auteurs et éditeurs du blog NutriSensia
 */

export interface Author {
  slug: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export const authors: Record<string, Author> = {
  'lucie-cornille': {
    slug: 'lucie-cornille',
    name: 'Lucie Cornille',
    title: 'Diététicienne-nutritionniste ASCA/RME',
    bio: "Lucie est nutritionniste diplômée (ASCA/RME) passionnée par l'alimentation santé. Avec plus de 10 ans d'expérience, elle accompagne ses patients vers une alimentation équilibrée et durable. Elle partage ses connaissances et conseils pratiques pour vous aider à adopter une alimentation équilibrée et durable au quotidien.",
    image: 'https://i.pravatar.cc/150?img=1',
    social: {
      linkedin: 'https://linkedin.com',
      email: 'lucie@nutrisensia.ch',
    },
  },
  'dr-sophie-martin': {
    slug: 'dr-sophie-martin',
    name: 'Dr. Sophie Martin',
    title: 'Médecin nutritionniste',
    bio: 'Dr. Sophie Martin est médecin nutritionniste avec une expertise en micronutrition et en maladies métaboliques. Elle collabore régulièrement avec NutriSensia pour garantir la qualité scientifique des contenus publiés.',
    image: 'https://i.pravatar.cc/150?img=5',
    social: {
      linkedin: 'https://linkedin.com',
    },
  },
};

/**
 * Récupère un auteur par son slug
 */
export function getAuthorBySlug(slug: string): Author | undefined {
  return authors[slug];
}

/**
 * Récupère tous les slugs d'auteurs
 */
export function getAllAuthorSlugs(): string[] {
  return Object.keys(authors);
}

/**
 * Convertit un nom complet en slug
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ''); // Enlever les tirets au début et à la fin
}
