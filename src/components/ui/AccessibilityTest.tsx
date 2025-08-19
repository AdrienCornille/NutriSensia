'use client';

import React, { useEffect, useState } from 'react';
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
 * Composant de test d'accessibilité pour valider la conformité WCAG AA
 * de tous les composants UI du design system NutriSensia
 */
export default function AccessibilityTest() {
  const [activeTab, setActiveTab] = useState('contrast');
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const [testResults, setTestResults] = useState<any[]>([]);

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
  ];

  // Données pour les onglets
  const tabs: NavigationItem[] = [
    { id: 'contrast', label: 'Contraste' },
    { id: 'focus', label: 'Focus' },
    { id: 'keyboard', label: 'Navigation clavier' },
    { id: 'screen-reader', label: 'Lecteur d&apos;écran' },
    { id: 'touch-targets', label: 'Cibles tactiles' },
  ];

  // Test de contraste des couleurs
  const ContrastTest = () => (
    <div className='space-y-32dp'>
      <h2 className='text-h2 text-neutral-dark'>Test de Contraste WCAG AA</h2>

      <div className='space-y-16dp'>
        <h3 className='text-h3 text-neutral-dark'>Texte sur fond coloré</h3>

        {/* Test des couleurs primaires */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16dp'>
          <div className='bg-primary text-white p-24dp rounded-8dp'>
            <p className='text-body'>Texte blanc sur vert primaire</p>
            <p className='text-caption'>Contraste: 4.5:1 minimum requis</p>
          </div>

          <div className='bg-secondary text-white p-24dp rounded-8dp'>
            <p className='text-body'>Texte blanc sur vert secondaire</p>
            <p className='text-caption'>Contraste: 4.5:1 minimum requis</p>
          </div>
        </div>

        {/* Test des couleurs fonctionnelles */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16dp'>
          <div className='bg-functional-success text-white p-24dp rounded-8dp'>
            <p className='text-body'>Texte blanc sur vert succès</p>
            <p className='text-caption'>Contraste: 4.5:1 minimum requis</p>
          </div>

          <div className='bg-functional-error text-white p-24dp rounded-8dp'>
            <p className='text-body'>Texte blanc sur rouge erreur</p>
            <p className='text-caption'>Contraste: 4.5:1 minimum requis</p>
          </div>
        </div>

        {/* Test des couleurs neutres */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16dp'>
          <div className='bg-neutral-dark text-white p-24dp rounded-8dp'>
            <p className='text-body'>Texte blanc sur gris foncé</p>
            <p className='text-caption'>Contraste: 4.5:1 minimum requis</p>
          </div>

          <div className='bg-neutral-light text-neutral-dark p-24dp rounded-8dp'>
            <p className='text-body'>Texte gris foncé sur gris clair</p>
            <p className='text-caption'>Contraste: 4.5:1 minimum requis</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Test des états de focus
  const FocusTest = () => (
    <div className='space-y-32dp'>
      <h2 className='text-h2 text-neutral-dark'>Test des États de Focus</h2>

      <div className='space-y-16dp'>
        <h3 className='text-h3 text-neutral-dark'>
          Focus visible sur tous les éléments interactifs
        </h3>

        {/* Test des boutons */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>Boutons</h4>
          <div className='flex flex-wrap gap-16dp'>
            <PrimaryButton>Bouton Primaire</PrimaryButton>
            <SecondaryButton>Bouton Secondaire</SecondaryButton>
            <GhostButton>Bouton Fantôme</GhostButton>
            <DestructiveButton>Bouton Destructif</DestructiveButton>
          </div>
        </div>

        {/* Test des inputs */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>Champs de saisie</h4>
          <div className='space-y-16dp max-w-md'>
            <StandardInput
              label='Champ standard'
              placeholder='Testez le focus ici...'
            />
            <SearchInput
              placeholder='Rechercher...'
              leftIcon={<SearchIcon />}
            />
            <Textarea
              label='Zone de texte'
              placeholder='Testez le focus ici...'
              rows={3}
            />
          </div>
        </div>

        {/* Test des cartes cliquables */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>Cartes cliquables</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-16dp'>
            <Card
              clickable
              hover
              tabIndex={0}
              role='button'
              aria-label='Carte cliquable 1'
            >
              <CardContent>
                <p className='text-body text-neutral-medium'>
                  Carte cliquable avec focus visible
                </p>
              </CardContent>
            </Card>

            <Card
              clickable
              hover
              tabIndex={0}
              role='button'
              aria-label='Carte cliquable 2'
            >
              <CardContent>
                <p className='text-body text-neutral-medium'>
                  Autre carte cliquable avec focus visible
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  // Test de navigation clavier
  const KeyboardTest = () => (
    <div className='space-y-32dp'>
      <h2 className='text-h2 text-neutral-dark'>Test de Navigation Clavier</h2>

      <div className='space-y-16dp'>
        <h3 className='text-h3 text-neutral-dark'>
          Ordre de tabulation logique
        </h3>

        {/* Instructions */}
        <div className='bg-background-accent p-24dp rounded-8dp'>
          <p className='text-body text-neutral-dark'>
            <strong>Instructions :</strong> Utilisez la touche Tab pour naviguer
            entre les éléments. L&apos;ordre doit être logique et prévisible.
          </p>
        </div>

        {/* Formulaire de test */}
        <div className='space-y-16dp max-w-md'>
          <h4 className='text-h4 text-neutral-dark'>Formulaire de test</h4>

          <StandardInput label='Prénom' placeholder='Votre prénom' />

          <StandardInput label='Nom' placeholder='Votre nom' />

          <StandardInput
            label='Email'
            type='email'
            placeholder='votre@email.com'
          />

          <Textarea label='Message' placeholder='Votre message...' rows={3} />

          <div className='flex gap-16dp'>
            <PrimaryButton>Envoyer</PrimaryButton>
            <SecondaryButton>Annuler</SecondaryButton>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>Navigation par onglets</h4>

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
    </div>
  );

  // Test lecteur d'écran
  const ScreenReaderTest = () => (
    <div className='space-y-32dp'>
      <h2 className='text-h2 text-neutral-dark'>Test Lecteur d&apos;Écran</h2>

      <div className='space-y-16dp'>
        <h3 className='text-h3 text-neutral-dark'>
          Attributs ARIA et labels appropriés
        </h3>

        {/* Test des boutons avec aria-label */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>Boutons avec aria-label</h4>
          <div className='flex flex-wrap gap-16dp'>
            <Button aria-label='Ajouter un nouveau patient'>
              <PlusIcon />
            </Button>

            <Button aria-label='Supprimer le patient sélectionné'>
              <TrashIcon />
            </Button>

            <Button aria-label='Modifier les informations du patient'>
              <EditIcon />
            </Button>
          </div>
        </div>

        {/* Test des inputs avec aria-describedby */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>
            Champs avec descriptions ARIA
          </h4>
          <div className='space-y-16dp max-w-md'>
            <div>
              <StandardInput
                label='Numéro AVS'
                placeholder='756.9217.0769.85'
                aria-describedby='avs-help avs-error'
              />
              <p
                id='avs-help'
                className='text-caption text-neutral-medium mt-4dp'
              >
                Format: XXX.XXXX.XXXX.XX
              </p>
              <p
                id='avs-error'
                className='text-caption text-functional-error mt-4dp'
                role='alert'
              >
                Numéro AVS invalide
              </p>
            </div>

            <div>
              <StandardInput
                label='Téléphone'
                placeholder='+41 79 123 45 67'
                aria-describedby='phone-help'
              />
              <p
                id='phone-help'
                className='text-caption text-neutral-medium mt-4dp'
              >
                Format suisse: +41 XX XXX XX XX
              </p>
            </div>
          </div>
        </div>

        {/* Test des cartes avec rôles ARIA */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>Cartes avec rôles ARIA</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-16dp'>
            <Card role='article' aria-labelledby='card-title-1'>
              <CardHeader>
                <h5 id='card-title-1' className='text-h4 text-neutral-dark'>
                  Carte avec titre accessible
                </h5>
              </CardHeader>
              <CardContent>
                <p className='text-body text-neutral-medium'>
                  Cette carte a un titre accessible via aria-labelledby.
                </p>
              </CardContent>
            </Card>

            <Card role='article' aria-labelledby='card-title-2'>
              <CardHeader>
                <h5 id='card-title-2' className='text-h4 text-neutral-dark'>
                  Autre carte accessible
                </h5>
              </CardHeader>
              <CardContent>
                <p className='text-body text-neutral-medium'>
                  Cette carte a également un titre accessible.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test des messages d'état */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>
            Messages d&apos;état ARIA
          </h4>
          <div className='space-y-16dp max-w-md'>
            <div role='status' aria-live='polite' className='sr-only'>
              Chargement en cours...
            </div>

            <div
              role='alert'
              aria-live='assertive'
              className='bg-functional-error text-white p-16dp rounded-8dp'
            >
              <p className='text-body'>
                Erreur critique : Impossible de sauvegarder les données
              </p>
            </div>

            <div
              role='status'
              aria-live='polite'
              className='bg-functional-success text-white p-16dp rounded-8dp'
            >
              <p className='text-body'>Données sauvegardées avec succès</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Test des cibles tactiles
  const TouchTargetsTest = () => (
    <div className='space-y-32dp'>
      <h2 className='text-h2 text-neutral-dark'>Test des Cibles Tactiles</h2>

      <div className='space-y-16dp'>
        <h3 className='text-h3 text-neutral-dark'>
          Cibles tactiles minimum 44dp (recommandé 48dp)
        </h3>

        {/* Instructions */}
        <div className='bg-background-accent p-24dp rounded-8dp'>
          <p className='text-body text-neutral-dark'>
            <strong>Instructions :</strong> Tous les éléments interactifs
            doivent avoir une zone tactile d&apos;au moins 44dp x 44dp pour être
            facilement utilisables sur mobile.
          </p>
        </div>

        {/* Test des boutons */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>
            Boutons (48dp de hauteur)
          </h4>
          <div className='flex flex-wrap gap-16dp'>
            <PrimaryButton>Bouton Primaire</PrimaryButton>
            <SecondaryButton>Bouton Secondaire</SecondaryButton>
            <GhostButton>Bouton Fantôme</GhostButton>
            <DestructiveButton>Bouton Destructif</DestructiveButton>
          </div>
        </div>

        {/* Test des inputs */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>
            Champs de saisie (56dp de hauteur)
          </h4>
          <div className='space-y-16dp max-w-md'>
            <StandardInput
              label='Champ standard'
              placeholder='Test tactile...'
            />
            <SearchInput
              placeholder='Rechercher...'
              leftIcon={<SearchIcon />}
            />
          </div>
        </div>

        {/* Test des cartes cliquables */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>Cartes cliquables</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-16dp'>
            <Card
              clickable
              hover
              tabIndex={0}
              role='button'
              aria-label='Carte cliquable avec zone tactile suffisante'
              className='min-h-96dp'
            >
              <CardContent>
                <p className='text-body text-neutral-medium'>
                  Cette carte a une zone tactile suffisante pour être facilement
                  cliquable sur mobile.
                </p>
              </CardContent>
            </Card>

            <Card
              clickable
              hover
              tabIndex={0}
              role='button'
              aria-label='Autre carte cliquable'
              className='min-h-96dp'
            >
              <CardContent>
                <p className='text-body text-neutral-medium'>
                  Autre carte avec zone tactile appropriée.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test des éléments de navigation */}
        <div className='space-y-16dp'>
          <h4 className='text-h4 text-neutral-dark'>Éléments de navigation</h4>
          <div className='flex'>
            <Sidebar
              items={sidebarItems}
              activeItem={activeSidebarItem}
              onItemClick={item => setActiveSidebarItem(item.id)}
            />
            <div className='flex-1 p-32dp'>
              <p className='text-body text-neutral-medium'>
                La sidebar a des éléments de navigation avec des zones tactiles
                appropriées.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
                Tests d&apos;Accessibilité - Design System NutriSensia
              </h1>
              <p className='text-body-large text-neutral-medium'>
                Validation de la conformité WCAG 2.1 AA
              </p>
            </div>

            {/* Navigation par onglets */}
            <div>
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={tab => setActiveTab(tab.id)}
              />

              {/* Section Contraste */}
              <TabPanel tabId='contrast' activeTab={activeTab}>
                <ContrastTest />
              </TabPanel>

              {/* Section Focus */}
              <TabPanel tabId='focus' activeTab={activeTab}>
                <FocusTest />
              </TabPanel>

              {/* Section Navigation clavier */}
              <TabPanel tabId='keyboard' activeTab={activeTab}>
                <KeyboardTest />
              </TabPanel>

              {/* Section Lecteur d'écran */}
              <TabPanel tabId='screen-reader' activeTab={activeTab}>
                <ScreenReaderTest />
              </TabPanel>

              {/* Section Cibles tactiles */}
              <TabPanel tabId='touch-targets' activeTab={activeTab}>
                <TouchTargetsTest />
              </TabPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icônes pour les tests
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

const SearchIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
      clipRule='evenodd'
    />
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

const TrashIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
      clipRule='evenodd'
    />
  </svg>
);

const EditIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
  </svg>
);
