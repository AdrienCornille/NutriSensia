import { ApproachPageWithIntro } from '@/components/landing/approach';
import { Metadata } from 'next';

/**
 * Métadonnées pour la page L'Approche
 */
export const metadata: Metadata = {
  title: 'Notre Approche Nutritionnelle | NutriSensia',
  description:
    'Découvrez notre approche nutritionnelle bienveillante et scientifique. Fini les régimes restrictifs, place à une méthode personnalisée qui respecte votre corps et votre vie.',
  keywords: [
    'approche nutritionnelle',
    'méthode nutrition',
    'diététicienne suisse',
    'nutrition bienveillante',
    'alimentation personnalisée',
    'NutriSensia',
  ],
  openGraph: {
    title: 'Notre Approche Nutritionnelle | NutriSensia',
    description:
      'Une approche nutritionnelle qui respecte votre corps et votre vie. Méthode scientifique, personnalisée et bienveillante.',
    type: 'website',
    locale: 'fr_CH',
  },
  alternates: {
    canonical: '/fr/approche',
    languages: {
      'fr-CH': '/fr/approche',
      'en-US': '/en/approach',
    },
  },
};

/**
 * Page "L'Approche" de NutriSensia
 *
 * Cette page présente l'approche nutritionnelle complète
 * avec la nouvelle section Intro simple et élégante.
 */
export default function ApprochePage() {
  return <ApproachPageWithIntro />;
}
