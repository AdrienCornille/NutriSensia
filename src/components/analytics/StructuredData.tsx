'use client';

/**
 * Composant pour les données structurées (Schema.org)
 *
 * Ce composant génère les données structurées JSON-LD pour :
 * - Les témoignages (Review schema)
 * - L'organisation (Organization schema)
 * - Les services (Service schema)
 * - Les FAQ (FAQPage schema)
 */

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date?: string;
  role: 'patient' | 'nutritionist';
}

interface StructuredDataProps {
  /** Type de données structurées à générer */
  type: 'reviews' | 'organization' | 'service' | 'faq';
  /** Données pour les témoignages */
  reviews?: Review[];
  /** Données pour les FAQ */
  faqItems?: Array<{ question: string; answer: string }>;
}

/**
 * Génère les données structurées pour les témoignages
 */
function generateReviewsSchema(reviews: Review[]) {
  const aggregateRating = {
    '@type': 'AggregateRating',
    ratingValue:
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };

  const reviewsSchema = reviews.map(review => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.name,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.comment,
    datePublished: review.date || new Date().toISOString().split('T')[0],
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NutriSensia',
    url: 'https://nutrisensia.ch',
    aggregateRating: aggregateRating,
    review: reviewsSchema,
  };
}

/**
 * Génère les données structurées pour l'organisation
 */
function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NutriSensia',
    url: 'https://nutrisensia.ch',
    logo: 'https://nutrisensia.ch/logo.png',
    description:
      'Plateforme suisse de nutrition personnalisée. Consultations en ligne avec des nutritionnistes certifiés ASCA/RME.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CH',
      addressLocality: 'Suisse',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+41-XX-XXX-XX-XX',
      contactType: 'customer service',
      availableLanguage: ['French', 'German', 'Italian'],
    },
    sameAs: [
      'https://www.linkedin.com/company/nutrisensia',
      'https://www.facebook.com/nutrisensia',
      'https://www.instagram.com/nutrisensia',
    ],
  };
}

/**
 * Génère les données structurées pour les services
 */
function generateServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Consultation Nutritionnelle Personnalisée',
    description:
      'Consultations nutritionnelles en ligne et en cabinet avec des nutritionnistes certifiés ASCA/RME',
    provider: {
      '@type': 'Organization',
      name: 'NutriSensia',
      url: 'https://nutrisensia.ch',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Switzerland',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: 'https://nutrisensia.ch',
      serviceSmsNumber: '+41-XX-XXX-XX-XX',
      servicePhone: '+41-XX-XXX-XX-XX',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Consultation Découverte',
        price: '120',
        priceCurrency: 'CHF',
        description:
          'Première consultation pour établir votre profil nutritionnel',
      },
      {
        '@type': 'Offer',
        name: 'Suivi Personnalisé',
        price: '85',
        priceCurrency: 'CHF',
        description:
          'Consultations de suivi pour optimiser votre plan nutritionnel',
      },
      {
        '@type': 'Offer',
        name: 'Programme Complet',
        price: '450',
        priceCurrency: 'CHF',
        description: "Programme d'accompagnement complet sur 6 mois",
      },
    ],
  };
}

/**
 * Génère les données structurées pour les FAQ
 */
function generateFAQSchema(
  faqItems: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Composant principal pour les données structurées
 */
export function StructuredData({
  type,
  reviews = [],
  faqItems = [],
}: StructuredDataProps) {
  let schema;

  switch (type) {
    case 'reviews':
      if (reviews.length === 0) return null;
      schema = generateReviewsSchema(reviews);
      break;
    case 'organization':
      schema = generateOrganizationSchema();
      break;
    case 'service':
      schema = generateServiceSchema();
      break;
    case 'faq':
      if (faqItems.length === 0) return null;
      schema = generateFAQSchema(faqItems);
      break;
    default:
      return null;
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
}

/**
 * Hook pour générer automatiquement les données structurées des témoignages
 */
export function useTestimonialsStructuredData(testimonials: Review[]) {
  if (typeof window === 'undefined' || testimonials.length === 0) {
    return null;
  }

  const schema = generateReviewsSchema(testimonials);

  // Ajouter le script au head de la page
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);

  // Vérifier si le script existe déjà
  const existingScript = document.querySelector(
    'script[type="application/ld+json"][data-testimonials]'
  );
  if (existingScript) {
    existingScript.remove();
  }

  script.setAttribute('data-testimonials', 'true');
  document.head.appendChild(script);

  return () => {
    // Nettoyage lors du démontage du composant
    const scriptToRemove = document.querySelector(
      'script[type="application/ld+json"][data-testimonials]'
    );
    if (scriptToRemove) {
      scriptToRemove.remove();
    }
  };
}
