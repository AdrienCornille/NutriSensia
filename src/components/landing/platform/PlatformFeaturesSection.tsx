'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BarChart3,
  UtensilsCrossed,
  ShoppingCart,
  Camera,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { FeatureItem } from './FeatureItem';

/**
 * Section Fonctionnalités - Tout Ce Dont Vous Avez Besoin, au Même Endroit
 *
 * Design conforme au NutriSensia Style Guide :
 * - Typographie : Marcellus (serif) pour le titre + Plus Jakarta Sans pour body
 * - Couleurs : #3f6655 (vert principal), #41556b (texte body), #f8f7ef (background)
 * - Section titre centrée avec sous-ligne accent
 * - Layout alternant pour les features
 */
export function PlatformFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const featuresData = [
    {
      id: 1,
      title: 'Tableau de Bord Personnalisé',
      subtitle: "Votre vue d'ensemble en un coup d'œil",
      description: 'Dès que vous vous connectez :',
      bullets: [
        'Votre prochain rendez-vous',
        'Vos progrès de la semaine (poids, énergie, symptômes)',
        'Vos objectifs et leur avancement',
        'Messages non lus',
        'Plan de repas du jour',
      ],
      whyUseful:
        'Plus besoin de fouiller. Tout est centralisé, clair, accessible.',
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80',
      alt: 'Tableau de bord avec graphiques et métriques de santé',
    },
    {
      id: 2,
      title: 'Plans de Repas Personnalisés',
      subtitle: 'Votre feuille de route alimentaire, évolutive',
      description: 'Chaque semaine, vous retrouvez :',
      bullets: [
        'Repas planifiés selon VOS besoins (petit-déj, déjeuner, dîner, collations)',
        'Quantités recommandées (ajustables à votre faim)',
        "Alternatives si vous n'aimez pas un ingrédient",
        'Informations nutritionnelles',
      ],
      additionalText:
        'Adapté à : Vos contraintes (végétarien, allergies), vos goûts, votre emploi du temps, vos objectifs.',
      whyUseful:
        "Ce n'est pas un PDF figé. C'est un plan vivant que j'ajuste après chaque consultation.",
      image:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&q=80',
      alt: 'Assiette équilibrée avec légumes colorés et protéines',
    },
    {
      id: 3,
      title: 'Listes de Courses Automatiques',
      subtitle: 'Ne manquez plus jamais un ingrédient',
      description:
        'En un clic, votre liste se génère depuis votre plan de repas.',
      additionalText:
        'Organisée par rayon : Fruits & légumes, Viandes, Produits laitiers, Féculents, Épicerie, Surgelés.',
      bullets: [
        'Cochez les articles au fur et à mesure',
        'Ajoutez vos propres items',
        'Partagez avec votre conjoint(e)',
        'Accessible depuis votre téléphone au supermarché',
      ],
      whyUseful:
        'Fini les courses à tâtons. Vous savez exactement quoi acheter.',
      image:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop&q=80',
      alt: 'Panier de courses avec fruits et légumes frais',
    },
    {
      id: 4,
      title: 'Journal Alimentaire Simplifié',
      subtitle: 'Suivez ce que vous mangez sans prise de tête',
      description: "Plusieurs façons d'enregistrer :",
      bullets: [
        "Recherche dans la base de données (milliers d'aliments)",
        'Photo de votre assiette (rapide et visuel)',
        'Favoris sauvegardés (1 clic pour votre petit-déj habituel)',
        'Note rapide si pas le temps',
      ],
      additionalText:
        'Ce que ça vous permet : Prendre conscience de vos habitudes réelles, Identifier les moments de stress/ennui vs faim, Me montrer votre alimentation pour ajuster précisément',
      whyUseful:
        "Le journal n'est pas là pour juger ou compter obsessionnellement. C'est un outil de conscience et de dialogue.",
      image:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&q=80',
      alt: "Photo d'une assiette saine vue du dessus",
    },
    {
      id: 5,
      title: 'Suivi de Vos Progrès',
      subtitle: 'Mesurez votre évolution au-delà de la balance',
      description: "La balance ne raconte qu'une partie de l'histoire.",
      bullets: [
        'Mesures physiques: Poids (graphique), tours, photos progression',
        "Bien-être & Énergie: Niveau d'énergie quotidien, qualité sommeil, humeur, stress",
        'Symptômes spécifiques: Ballonnements, douleurs menstruelles, fringales, clarté mentale',
      ],
      whyUseful:
        "Souvent, vous perdez 0g certaines semaines mais vous dormez mieux, avez plus d'énergie, vos ballonnements ont disparu. Ces victoires comptent autant. Les graphiques vous montrent vos progrès réels, même quand vous avez l'impression de stagner.",
      image:
        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop&q=80',
      alt: 'Montre connectée affichant des données de santé',
    },
    {
      id: 6,
      title: 'Messagerie + Bibliothèque',
      subtitle: 'Restez en contact et apprenez',
      description:
        'Messagerie sécurisée : Posez vos questions directement, Partagez photos de repas pour validation, Recevez mes réponses et ajustements, Réponse sous 48-72h (ou 24h avec option prioritaire)',
      additionalText:
        'Bibliothèque de ressources : Articles explicatifs (index glycémique, hormones, inflammation), Guides pratiques (restaurant, lire les étiquettes), Recettes saines et simples, Contenus adaptés à votre forfait',
      whyUseful:
        "Vous ne devriez pas attendre 2 semaines pour une réponse qui vous bloque aujourd'hui. Et plus vous comprenez, moins vous avez besoin de moi.",
      image:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&q=80',
      alt: 'Personne utilisant une application de messagerie sur tablette',
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#f8f7ef',
        padding: '96px 0',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center',
          marginBottom: '64px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '57.6px',
              color: '#3f6655',
              marginBottom: '16px',
            }}
            className='section-title'
          >
            Tout Ce Dont Vous Avez Besoin, au Même Endroit
          </h2>
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '18px',
              lineHeight: '28px',
              color: '#41556b',
              maxWidth: '600px',
              margin: '0 auto',
            }}
            className='section-subtitle'
          >
            Six outils essentiels pour transformer votre quotidien nutritionnel.
          </p>
        </motion.div>
      </div>

      {/* Features List */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {featuresData.map((feature, index) => (
          <FeatureItem
            key={feature.id}
            {...feature}
            isReversed={index % 2 !== 0}
            index={index}
          />
        ))}
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .section-title {
            font-size: 32px !important;
            line-height: 40px !important;
          }

          .section-subtitle {
            font-size: 16px !important;
            line-height: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .section-title {
            font-size: 28px !important;
            line-height: 36px !important;
          }
        }
      `}</style>
    </section>
  );
}
