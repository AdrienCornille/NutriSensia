'use client';

import React, { useState } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  ThemeSelector,
  ThemeDemo,
  AccessibilityPreferences,
} from './ThemeSelector';
import { Button } from './Button';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { Input } from './Input';
import { cn } from '@/lib/utils';

// Données de test pour les couleurs personnalisées
const CUSTOM_COLORS = [
  {
    name: 'Vert NutriSensia',
    primary: '#2E7D5E',
    secondary: '#4A9B7B',
    accent: '#00A693',
  },
  {
    name: 'Bleu Médical',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#06B6D4',
  },
  {
    name: 'Violet Moderne',
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#EC4899',
  },
  {
    name: 'Orange Énergique',
    primary: '#F59E0B',
    secondary: '#FBBF24',
    accent: '#EF4444',
  },
];

export function ThemeManagementTest() {
  const { theme, mode, preferences, updatePreferences } = useThemeContext();
  const [activeTab, setActiveTab] = useState('demo');
  const [customColorIndex, setCustomColorIndex] = useState(0);

  // Application de couleurs personnalisées
  const applyCustomColors = (index: number) => {
    const colors = CUSTOM_COLORS[index];
    updatePreferences({
      customColors: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
      },
    });
    setCustomColorIndex(index);
  };

  // Tabs pour organiser le contenu
  const tabs = [
    { id: 'demo', label: 'Démonstration', icon: '🎨' },
    { id: 'customization', label: 'Personnalisation', icon: '⚙️' },
    { id: 'accessibility', label: 'Accessibilité', icon: '♿' },
    { id: 'testing', label: 'Tests', icon: '🧪' },
  ];

  return (
    <div className='min-h-screen bg-background-primary dark:bg-background-secondary p-6'>
      <div className='max-w-6xl mx-auto space-y-8'>
        {/* En-tête */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl font-bold text-neutral-dark dark:text-neutral-light'>
            Système de Gestion des Thèmes
          </h1>
          <p className='text-lg text-neutral-medium max-w-2xl mx-auto'>
            Test complet du système de thèmes avec support du mode sombre,
            personnalisation en temps réel et préférences d&apos;accessibilité.
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className='flex flex-wrap gap-2 justify-center'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                'flex items-center space-x-2',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-neutral-light dark:bg-neutral-dark text-neutral-dark dark:text-neutral-light hover:bg-neutral-border dark:hover:bg-neutral-medium'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className='space-y-8'>
          {/* Onglet Démonstration */}
          {activeTab === 'demo' && (
            <div className='space-y-8'>
              <ThemeDemo />

              {/* Exemples de composants avec différents thèmes */}
              <div className='space-y-6'>
                <h3 className='text-2xl font-semibold text-neutral-dark dark:text-neutral-light'>
                  Exemples de Composants
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {/* Carte exemple */}
                  <Card variant='primary'>
                    <CardHeader>
                      <h4 className='text-lg font-semibold text-neutral-dark dark:text-neutral-light'>
                        Carte Exemple
                      </h4>
                      <p className='text-sm text-neutral-medium dark:text-neutral-light'>
                        Cette carte s&apos;adapte automatiquement au thème
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className='text-neutral-dark dark:text-neutral-light'>
                        Le contenu de cette carte utilise les couleurs du thème
                        actuel. Mode actuel: <strong>{mode}</strong>
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant='primary' size='sm'>
                        Action
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Formulaire exemple */}
                  <Card variant='dashboard'>
                    <CardHeader>
                      <h4 className='text-lg font-semibold text-neutral-dark dark:text-neutral-light'>
                        Formulaire
                      </h4>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <Input
                        label='Nom'
                        placeholder='Votre nom'
                        variant='standard'
                      />
                      <Input
                        label='Email'
                        placeholder='votre@email.com'
                        variant='standard'
                        type='email'
                      />
                    </CardContent>
                    <CardFooter>
                      <Button variant='secondary' size='sm'>
                        Envoyer
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Statistiques exemple */}
                  <Card variant='nutrition'>
                    <CardHeader>
                      <h4 className='text-lg font-semibold text-neutral-dark dark:text-neutral-light'>
                        Statistiques
                      </h4>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='flex justify-between'>
                          <span className='text-neutral-dark dark:text-neutral-light'>
                            Patients actifs
                          </span>
                          <span className='font-semibold text-functional-success'>
                            1,234
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-neutral-dark dark:text-neutral-light'>
                            Consultations
                          </span>
                          <span className='font-semibold text-functional-info'>
                            567
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-neutral-dark dark:text-neutral-light'>
                            Rendez-vous
                          </span>
                          <span className='font-semibold text-functional-warning'>
                            89
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Personnalisation */}
          {activeTab === 'customization' && (
            <div className='space-y-8'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Couleurs personnalisées */}
                <Card variant='primary'>
                  <CardHeader>
                    <h3 className='text-xl font-semibold'>
                      Couleurs Personnalisées
                    </h3>
                    <p className='text-sm text-neutral-medium'>
                      Testez différentes palettes de couleurs
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {CUSTOM_COLORS.map((colorSet, index) => (
                        <button
                          key={index}
                          onClick={() => applyCustomColors(index)}
                          className={cn(
                            'w-full p-4 rounded-lg border-2 transition-all duration-200',
                            'flex items-center space-x-3',
                            customColorIndex === index
                              ? 'border-primary bg-primary/5'
                              : 'border-neutral-border hover:border-neutral-medium'
                          )}
                        >
                          <div className='flex space-x-2'>
                            <div
                              className='w-6 h-6 rounded-full border border-neutral-border'
                              style={{ backgroundColor: colorSet.primary }}
                            />
                            <div
                              className='w-6 h-6 rounded-full border border-neutral-border'
                              style={{ backgroundColor: colorSet.secondary }}
                            />
                            <div
                              className='w-6 h-6 rounded-full border border-neutral-border'
                              style={{ backgroundColor: colorSet.accent }}
                            />
                          </div>
                          <span className='font-medium text-neutral-dark dark:text-neutral-light'>
                            {colorSet.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Prévisualisation */}
                <Card variant='dashboard'>
                  <CardHeader>
                    <h3 className='text-xl font-semibold text-neutral-dark dark:text-neutral-light'>
                      Prévisualisation
                    </h3>
                    <p className='text-sm text-neutral-medium dark:text-neutral-light'>
                      Voir les changements en temps réel
                    </p>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-neutral-dark dark:text-neutral-light'>
                        Couleur primaire
                      </label>
                      <div
                        className='h-12 rounded-lg border border-neutral-border'
                        style={{
                          backgroundColor:
                            preferences.customColors?.primary || '#2E7D5E',
                        }}
                      />
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-neutral-dark dark:text-neutral-light'>
                        Couleur secondaire
                      </label>
                      <div
                        className='h-12 rounded-lg border border-neutral-border'
                        style={{
                          backgroundColor:
                            preferences.customColors?.secondary || '#4A9B7B',
                        }}
                      />
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-neutral-dark dark:text-neutral-light'>
                        Couleur d&apos;accent
                      </label>
                      <div
                        className='h-12 rounded-lg border border-neutral-border'
                        style={{
                          backgroundColor:
                            preferences.customColors?.accent || '#00A693',
                        }}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        updatePreferences({ customColors: undefined })
                      }
                    >
                      Réinitialiser
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {/* Onglet Accessibilité */}
          {activeTab === 'accessibility' && (
            <div className='space-y-8'>
              <AccessibilityPreferences />

              {/* Tests d'accessibilité */}
              <Card variant='primary'>
                <CardHeader>
                  <h3 className='text-xl font-semibold text-neutral-dark dark:text-neutral-light'>
                    Tests d&apos;Accessibilité
                  </h3>
                  <p className='text-sm text-neutral-medium dark:text-neutral-light'>
                    Vérifiez la conformité WCAG 2.1 AA
                  </p>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Test de contraste */}
                  <div className='space-y-3'>
                    <h4 className='font-semibold text-neutral-dark dark:text-neutral-light'>
                      Test de Contraste
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='p-4 bg-neutral-light dark:bg-neutral-dark rounded-lg'>
                        <p className='text-neutral-dark dark:text-neutral-light'>
                          Texte normal sur fond neutre
                        </p>
                      </div>
                      <div className='p-4 bg-primary rounded-lg'>
                        <p className='text-white'>
                          Texte blanc sur fond primaire
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Test de focus */}
                  <div className='space-y-3'>
                    <h4 className='font-semibold text-neutral-dark dark:text-neutral-light'>
                      Test de Focus
                    </h4>
                    <div className='flex flex-wrap gap-4'>
                      <Button variant='primary'>Bouton Principal</Button>
                      <Button variant='secondary'>Bouton Secondaire</Button>
                      <Button variant='ghost'>Bouton Fantôme</Button>
                      <ThemeSelector variant='button' />
                    </div>
                  </div>

                  {/* Test de mouvement */}
                  <div className='space-y-3'>
                    <h4 className='font-semibold text-neutral-dark dark:text-neutral-light'>
                      Test de Mouvement
                    </h4>
                    <div className='flex items-center space-x-4'>
                      <div className='w-8 h-8 bg-primary rounded-full animate-pulse' />
                      <div className='w-8 h-8 bg-secondary rounded-full animate-bounce' />
                      <div className='w-8 h-8 bg-accent-teal rounded-full animate-spin' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Onglet Tests */}
          {activeTab === 'testing' && (
            <div className='space-y-8'>
              {/* Informations système */}
              <Card variant='primary'>
                <CardHeader>
                  <h3 className='text-xl font-semibold text-neutral-dark dark:text-neutral-light'>
                    Informations Système
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <h4 className='font-semibold text-neutral-dark dark:text-neutral-light'>
                        État du Thème
                      </h4>
                      <div className='space-y-1 text-sm text-neutral-dark dark:text-neutral-light'>
                        <div>
                          <span className='font-medium'>
                            Thème sélectionné:
                          </span>{' '}
                          {theme}
                        </div>
                        <div>
                          <span className='font-medium'>Mode effectif:</span>{' '}
                          {mode}
                        </div>
                        <div>
                          <span className='font-medium'>Est sombre:</span>{' '}
                          {mode === 'dark' ? 'Oui' : 'Non'}
                        </div>
                        <div>
                          <span className='font-medium'>Mode automatique:</span>{' '}
                          {theme === 'auto' ? 'Oui' : 'Non'}
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <h4 className='font-semibold text-neutral-dark dark:text-neutral-light'>
                        Préférences
                      </h4>
                      <div className='space-y-1 text-sm text-neutral-dark dark:text-neutral-light'>
                        <div>
                          <span className='font-medium'>Contraste élevé:</span>{' '}
                          {preferences.accessibility?.highContrast
                            ? 'Oui'
                            : 'Non'}
                        </div>
                        <div>
                          <span className='font-medium'>Mouvement réduit:</span>{' '}
                          {preferences.accessibility?.reducedMotion
                            ? 'Oui'
                            : 'Non'}
                        </div>
                        <div>
                          <span className='font-medium'>Texte agrandi:</span>{' '}
                          {preferences.accessibility?.largeText ? 'Oui' : 'Non'}
                        </div>
                        <div>
                          <span className='font-medium'>
                            Couleurs personnalisées:
                          </span>{' '}
                          {preferences.customColors ? 'Oui' : 'Non'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tests de performance */}
              <Card variant='dashboard'>
                <CardHeader>
                  <h3 className='text-xl font-semibold text-neutral-dark dark:text-neutral-light'>
                    Tests de Performance
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-neutral-dark dark:text-neutral-light'>
                        Changement de thème
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          const start = performance.now();
                          // Simuler un changement de thème
                          setTimeout(() => {
                            const end = performance.now();
                            console.log(
                              `Changement de thème: ${end - start}ms`
                            );
                          }, 0);
                        }}
                      >
                        Tester
                      </Button>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-neutral-dark dark:text-neutral-light'>
                        Chargement des préférences
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          const start = performance.now();
                          localStorage.getItem('nutrisensia-theme-preferences');
                          const end = performance.now();
                          console.log(
                            `Chargement préférences: ${end - start}ms`
                          );
                        }}
                      >
                        Tester
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
