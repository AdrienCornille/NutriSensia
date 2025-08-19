import React from 'react';
import ThemeSelector from '@/components/ui/ThemeSelector';

export default function ThemeManagementPage() {
  return (
    <div className='min-h-screen bg-background-secondary p-32dp'>
      <div className='max-w-4xl mx-auto space-y-64dp'>
        {/* Titre */}
        <div className='text-center'>
          <h1 className='text-h1 text-neutral-dark mb-16dp'>
            Gestion des Thèmes - NutriSensia
          </h1>
          <p className='text-body-large text-neutral-medium'>
            Testez et configurez les thèmes de l&apos;application
          </p>
        </div>

        {/* Sélecteur de thème */}
        <ThemeSelector />

        {/* Informations sur les thèmes */}
        <div className='bg-background-primary rounded-12dp p-32dp shadow-card-primary border border-neutral-border'>
          <h2 className='text-h2 text-neutral-dark mb-24dp'>
            À propos des thèmes
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-32dp'>
            <div>
              <h3 className='text-h3 text-neutral-dark mb-16dp'>Thème Clair</h3>
              <p className='text-body text-neutral-medium mb-16dp'>
                Le thème clair est idéal pour les environnements bien éclairés.
                Il offre un excellent contraste et une lisibilité optimale.
              </p>
              <ul className='text-body-small text-neutral-medium space-y-8dp'>
                <li>• Contraste élevé pour une meilleure lisibilité</li>
                <li>• Idéal pour les environnements de bureau</li>
                <li>• Respecte les standards d&apos;accessibilité WCAG AA</li>
              </ul>
            </div>

            <div>
              <h3 className='text-h3 text-neutral-dark mb-16dp'>
                Thème Sombre
              </h3>
              <p className='text-body text-neutral-medium mb-16dp'>
                Le thème sombre réduit la fatigue oculaire et économise la
                batterie sur les appareils mobiles. Parfait pour les
                environnements peu éclairés.
              </p>
              <ul className='text-body-small text-neutral-medium space-y-8dp'>
                <li>• Réduit la fatigue oculaire</li>
                <li>• Économise la batterie sur mobile</li>
                <li>• Idéal pour les environnements sombres</li>
              </ul>
            </div>
          </div>

          <div className='mt-32dp p-24dp bg-background-accent rounded-8dp'>
            <h3 className='text-h3 text-neutral-dark mb-16dp'>
              Mode Automatique
            </h3>
            <p className='text-body text-neutral-medium'>
              Le mode automatique détecte les préférences de votre système
              d&apos;exploitation et adapte automatiquement le thème. Vous
              pouvez également définir vos propres préférences
              d&apos;accessibilité pour un contrôle total.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
