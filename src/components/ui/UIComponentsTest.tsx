'use client';

import React, { useState } from 'react';
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DestructiveButton,
} from './Button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  PrimaryCard,
  DashboardCard,
  NutritionCard,
} from './Card';
import { Input, Textarea, StandardInput, SearchInput } from './Input';
import { Sidebar, Tabs, TabPanel, NavigationItem } from './Navigation';

/**
 * Composant de test pour valider tous les composants UI du design system NutriSensia
 */
export default function UIComponentsTest() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  // Données pour la sidebar
  const sidebarItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <DashboardIcon />,
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: <PatientsIcon />,
      children: [
        { id: 'list', label: 'Liste des patients' },
        { id: 'add', label: 'Ajouter un patient' },
      ],
    },
    {
      id: 'consultations',
      label: 'Consultations',
      icon: <ConsultationsIcon />,
    },
    {
      id: 'billing',
      label: 'Facturation',
      icon: <BillingIcon />,
      disabled: true,
    },
  ];

  // Données pour les onglets
  const tabs: NavigationItem[] = [
    { id: 'buttons', label: 'Boutons' },
    { id: 'cards', label: 'Cartes' },
    { id: 'inputs', label: 'Champs de saisie' },
    { id: 'navigation', label: 'Navigation' },
  ];

  return (
    <div className='min-h-screen bg-background-secondary'>
      <div className='flex'>
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={item => setActiveSidebarItem(item.id)}
        />

        {/* Contenu principal */}
        <div className='flex-1 p-32dp'>
          <div className='max-w-6xl mx-auto space-y-64dp'>
            {/* Titre */}
            <div className='text-center'>
              <h1 className='text-h1 text-neutral-dark mb-16dp'>
                Composants UI - Design System NutriSensia
              </h1>
              <p className='text-body-large text-neutral-medium'>
                Test et validation de tous les composants réutilisables
              </p>
            </div>

            {/* Navigation par onglets */}
            <div>
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={tab => setActiveTab(tab.id)}
              />

              {/* Section Boutons */}
              <TabPanel tabId='buttons' activeTab={activeTab}>
                <div className='space-y-32dp'>
                  <h2 className='text-h2 text-neutral-dark'>Boutons</h2>

                  {/* Variantes de boutons */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>
                      Variantes
                    </h3>
                    <div className='flex flex-wrap gap-16dp'>
                      <PrimaryButton>Bouton Primaire</PrimaryButton>
                      <SecondaryButton>Bouton Secondaire</SecondaryButton>
                      <GhostButton>Bouton Fantôme</GhostButton>
                      <DestructiveButton>Bouton Destructif</DestructiveButton>
                    </div>
                  </div>

                  {/* Tailles de boutons */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>
                      Tailles
                    </h3>
                    <div className='flex flex-wrap gap-16dp items-center'>
                      <Button size='sm'>Petit</Button>
                      <Button size='md'>Moyen</Button>
                      <Button size='lg'>Grand</Button>
                    </div>
                  </div>

                  {/* États de boutons */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>États</h3>
                    <div className='flex flex-wrap gap-16dp'>
                      <Button loading>Chargement...</Button>
                      <Button disabled>Désactivé</Button>
                      <Button leftIcon={<PlusIcon />}>Avec icône gauche</Button>
                      <Button rightIcon={<ArrowIcon />}>
                        Avec icône droite
                      </Button>
                    </div>
                  </div>

                  {/* Boutons plein largeur */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>
                      Plein largeur
                    </h3>
                    <div className='space-y-16dp'>
                      <Button fullWidth>Bouton plein largeur</Button>
                      <SecondaryButton fullWidth>
                        Secondaire plein largeur
                      </SecondaryButton>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Section Cartes */}
              <TabPanel tabId='cards' activeTab={activeTab}>
                <div className='space-y-32dp'>
                  <h2 className='text-h2 text-neutral-dark'>Cartes</h2>

                  {/* Variantes de cartes */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>
                      Variantes
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-16dp'>
                      <PrimaryCard>
                        <CardHeader>
                          <h4 className='text-h4 text-neutral-dark'>
                            Carte Primaire
                          </h4>
                        </CardHeader>
                        <CardContent>
                          <p className='text-body text-neutral-medium'>
                            Contenu de la carte primaire avec ombre standard.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button size='sm'>Action</Button>
                        </CardFooter>
                      </PrimaryCard>

                      <DashboardCard>
                        <CardHeader>
                          <h4 className='text-h4 text-neutral-dark'>
                            Carte Dashboard
                          </h4>
                        </CardHeader>
                        <CardContent>
                          <p className='text-body text-neutral-medium'>
                            Contenu de la carte dashboard avec ombre légère.
                          </p>
                        </CardContent>
                      </DashboardCard>

                      <NutritionCard>
                        <CardHeader>
                          <h4 className='text-h4 text-neutral-dark'>
                            Carte Nutrition
                          </h4>
                        </CardHeader>
                        <CardContent>
                          <p className='text-body text-neutral-medium'>
                            Contenu de la carte nutrition avec arrière-plan
                            accent.
                          </p>
                        </CardContent>
                      </NutritionCard>
                    </div>
                  </div>

                  {/* États de cartes */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>États</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-16dp'>
                      <Card loading>
                        <CardContent>
                          <p>Cette carte est en chargement</p>
                        </CardContent>
                      </Card>

                      <Card clickable hover>
                        <CardContent>
                          <p className='text-body text-neutral-medium'>
                            Carte cliquable avec effet de survol
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Section Champs de saisie */}
              <TabPanel tabId='inputs' activeTab={activeTab}>
                <div className='space-y-32dp'>
                  <h2 className='text-h2 text-neutral-dark'>
                    Champs de saisie
                  </h2>

                  {/* Variantes d'inputs */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>
                      Variantes
                    </h3>
                    <div className='space-y-16dp max-w-md'>
                      <StandardInput
                        label='Champ standard'
                        placeholder='Saisissez votre texte...'
                        helperText="Ceci est un message d'aide"
                      />

                      <SearchInput
                        placeholder='Rechercher...'
                        leftIcon={<SearchIcon />}
                      />

                      <Textarea
                        label='Zone de texte'
                        placeholder='Saisissez votre message...'
                        rows={4}
                        helperText="Message d'aide pour la zone de texte"
                      />
                    </div>
                  </div>

                  {/* États d'inputs */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>États</h3>
                    <div className='space-y-16dp max-w-md'>
                      <Input
                        label='Champ avec erreur'
                        placeholder='Champ invalide'
                        error='Ce champ contient une erreur'
                      />

                      <Input
                        label='Champ en chargement'
                        placeholder='Chargement...'
                        loading
                      />

                      <Input
                        label='Champ désactivé'
                        placeholder='Champ désactivé'
                        disabled
                      />
                    </div>
                  </div>

                  {/* Tailles d'inputs */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>
                      Tailles
                    </h3>
                    <div className='space-y-16dp max-w-md'>
                      <Input size='sm' placeholder='Petit champ' />
                      <Input size='md' placeholder='Champ moyen' />
                      <Input size='lg' placeholder='Grand champ' />
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Section Navigation */}
              <TabPanel tabId='navigation' activeTab={activeTab}>
                <div className='space-y-32dp'>
                  <h2 className='text-h2 text-neutral-dark'>Navigation</h2>

                  {/* Onglets */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>
                      Onglets
                    </h3>
                    <div className='space-y-16dp'>
                      <Tabs
                        tabs={[
                          { id: 'tab1', label: 'Onglet 1' },
                          { id: 'tab2', label: 'Onglet 2' },
                          { id: 'tab3', label: 'Onglet 3' },
                        ]}
                        activeTab='tab1'
                      />
                      <div className='p-16dp bg-background-primary rounded-8dp'>
                        <p className='text-body text-neutral-medium'>
                          Contenu de l&apos;onglet sélectionné
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Onglets verticaux */}
                  <div>
                    <h3 className='text-h3 text-neutral-dark mb-16dp'>
                      Onglets verticaux
                    </h3>
                    <div className='flex'>
                      <Tabs
                        tabs={[
                          { id: 'vtab1', label: 'Onglet vertical 1' },
                          { id: 'vtab2', label: 'Onglet vertical 2' },
                        ]}
                        orientation='vertical'
                        activeTab='vtab1'
                      />
                      <div className='flex-1 p-16dp bg-background-primary rounded-8dp ml-16dp'>
                        <p className='text-body text-neutral-medium'>
                          Contenu de l&apos;onglet vertical sélectionné
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icônes simples pour les tests
const DashboardIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
  </svg>
);

const PatientsIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
  </svg>
);

const ConsultationsIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M8 7V3a2 2 0 012-2h4.586A1 1 0 0116 2.586L19.414 6A1 1 0 0119 7H15a2 2 0 00-2 2v1a2 2 0 01-2 2H8a2 2 0 01-2-2V7z' />
  </svg>
);

const BillingIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z' />
  </svg>
);

const PlusIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
      clipRule='evenodd'
    />
  </svg>
);

const ArrowIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
      clipRule='evenodd'
    />
  </svg>
);

const SearchIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
      clipRule='evenodd'
    />
  </svg>
);
