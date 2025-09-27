'use client';

import React, { useState } from 'react';
import {
  Container,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  ResponsiveSidebar,
  ResponsiveTabs,
  ResponsiveTab,
  MobileNavigation,
  Spacing,
  Margin,
  Stack,
  ResponsiveHeading,
  ResponsiveText,
  ResponsiveList,
  ResponsiveTable,
  ResponsiveTableHead,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell,
  ResponsiveTableCard,
} from './index';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export default function ResponsiveLayoutTest() {
  const [activeTab, setActiveTab] = useState('containers');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'consultations', label: 'Consultations', icon: '📅' },
    { id: 'meal-plans', label: 'Plans alimentaires', icon: '🍽️' },
    { id: 'billing', label: 'Facturation', icon: '💰' },
  ];

  const tableData = [
    {
      id: 1,
      name: 'Marie Dupont',
      status: 'Actif',
      nextAppointment: '2024-01-15',
      compliance: '85%',
    },
    {
      id: 2,
      name: 'Jean Martin',
      status: 'En attente',
      nextAppointment: '2024-01-20',
      compliance: '72%',
    },
    {
      id: 3,
      name: 'Sophie Bernard',
      status: 'Actif',
      nextAppointment: '2024-01-18',
      compliance: '91%',
    },
    {
      id: 4,
      name: 'Pierre Durand',
      status: 'Inactif',
      nextAppointment: '-',
      compliance: '45%',
    },
  ];

  const tabs = [
    { id: 'containers', label: 'Conteneurs' },
    { id: 'grid', label: 'Grille & Flexbox' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'spacing', label: 'Espacement' },
    { id: 'typography', label: 'Typographie' },
    { id: 'tables', label: 'Tableaux' },
  ];

  return (
    <div className='min-h-screen bg-background-secondary'>
      {/* Header */}
      <header className='bg-background-primary border-b border-neutral-border p-16dp'>
        <Flex justify='between' align='center'>
          <ResponsiveHeading level={1} size='lg'>
            Tests de Layout Responsive - NutriSensia
          </ResponsiveHeading>
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant='ghost'
            className='lg:hidden'
          >
            ☰
          </Button>
        </Flex>
      </header>

      <Flex>
        {/* Sidebar */}
        <ResponsiveSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant='overlay'
        >
          <div className='p-16dp'>
            <ResponsiveHeading level={3} className='mb-24dp'>
              Navigation
            </ResponsiveHeading>
            <Stack spacing='md'>
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  className='flex items-center p-12dp text-left hover:bg-background-accent rounded-8dp transition-colors'
                >
                  <span className='mr-12dp'>{item.icon}</span>
                  <ResponsiveText>{item.label}</ResponsiveText>
                </button>
              ))}
            </Stack>
          </div>
        </ResponsiveSidebar>

        {/* Main Content */}
        <Flex direction='col' className='flex-1'>
          {/* Tabs */}
          <ResponsiveTabs
            orientation='horizontal'
            variant='default'
            className='border-b border-neutral-border'
          >
            {tabs.map(tab => (
              <ResponsiveTab
                key={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </ResponsiveTab>
            ))}
          </ResponsiveTabs>

          {/* Content */}
          <div className='p-24dp'>
            {activeTab === 'containers' && (
              <Container variant='wide' padding='lg'>
                <ResponsiveHeading level={2} className='mb-32dp'>
                  Tests des Conteneurs Responsives
                </ResponsiveHeading>

                <Stack spacing='xl'>
                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Container Default
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveText>
                        Ce conteneur utilise la variante par défaut avec une
                        largeur maximale et un centrage automatique.
                      </ResponsiveText>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Container Narrow
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveText>
                        Ce conteneur utilise la variante narrow pour un contenu
                        plus focalisé.
                      </ResponsiveText>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Container Wide
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveText>
                        Ce conteneur utilise la variante wide pour les
                        dashboards et les tableaux de données.
                      </ResponsiveText>
                    </CardContent>
                  </Card>
                </Stack>
              </Container>
            )}

            {activeTab === 'grid' && (
              <Container variant='wide' padding='lg'>
                <ResponsiveHeading level={2} className='mb-32dp'>
                  Tests de Grille et Flexbox
                </ResponsiveHeading>

                <Stack spacing='xl'>
                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Grille Responsive
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <Grid cols={1} colsMd={2} colsLg={3} gap='md'>
                        {[1, 2, 3, 4, 5, 6].map(item => (
                          <GridItem key={item}>
                            <Card variant='dashboard'>
                              <CardContent>
                                <ResponsiveText>Élément {item}</ResponsiveText>
                              </CardContent>
                            </Card>
                          </GridItem>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Flexbox Responsive
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <Flex
                        direction='col'
                        directionMd='row'
                        gap='md'
                        wrap='wrap'
                      >
                        <FlexItem grow>
                          <Card variant='nutrition'>
                            <CardContent>
                              <ResponsiveText>
                                Élément flexible qui grandit
                              </ResponsiveText>
                            </CardContent>
                          </Card>
                        </FlexItem>
                        <FlexItem basis='1/3'>
                          <Card variant='nutrition'>
                            <CardContent>
                              <ResponsiveText>
                                Élément avec base fixe
                              </ResponsiveText>
                            </CardContent>
                          </Card>
                        </FlexItem>
                        <FlexItem basis='1/3'>
                          <Card variant='nutrition'>
                            <CardContent>
                              <ResponsiveText>
                                Élément avec base fixe
                              </ResponsiveText>
                            </CardContent>
                          </Card>
                        </FlexItem>
                      </Flex>
                    </CardContent>
                  </Card>
                </Stack>
              </Container>
            )}

            {activeTab === 'navigation' && (
              <Container variant='wide' padding='lg'>
                <ResponsiveHeading level={2} className='mb-32dp'>
                  Tests de Navigation Responsive
                </ResponsiveHeading>

                <Stack spacing='xl'>
                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Onglets Responsive
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveTabs orientation='horizontal' variant='pills'>
                        <ResponsiveTab isActive>Onglet 1</ResponsiveTab>
                        <ResponsiveTab>Onglet 2</ResponsiveTab>
                        <ResponsiveTab>Onglet 3</ResponsiveTab>
                      </ResponsiveTabs>
                      <Spacing size='lg' direction='top'>
                        <ResponsiveText>
                          Contenu de l&apos;onglet actif. Les onglets
                          s&apos;adaptent automatiquement selon la taille
                          d&apos;écran.
                        </ResponsiveText>
                      </Spacing>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Navigation Mobile
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setMobileNavOpen(!mobileNavOpen)}>
                        Toggle Navigation Mobile
                      </Button>
                      <ResponsiveText className='mt-16dp'>
                        Cliquez sur le bouton pour tester la navigation mobile
                        en bas d&apos;écran.
                      </ResponsiveText>
                    </CardContent>
                  </Card>
                </Stack>
              </Container>
            )}

            {activeTab === 'spacing' && (
              <Container variant='wide' padding='lg'>
                <ResponsiveHeading level={2} className='mb-32dp'>
                  Tests d&apos;Espacement Responsive
                </ResponsiveHeading>

                <Stack spacing='xl'>
                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Espacement Responsive
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing='md'>
                        <Spacing size='sm' responsive>
                          <Card variant='nutrition'>
                            <ResponsiveText>
                              Espacement Small Responsive
                            </ResponsiveText>
                          </Card>
                        </Spacing>
                        <Spacing size='md' responsive>
                          <Card variant='nutrition'>
                            <ResponsiveText>
                              Espacement Medium Responsive
                            </ResponsiveText>
                          </Card>
                        </Spacing>
                        <Spacing size='lg' responsive>
                          <Card variant='nutrition'>
                            <ResponsiveText>
                              Espacement Large Responsive
                            </ResponsiveText>
                          </Card>
                        </Spacing>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Stack Responsive
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing='md' direction='horizontal' responsive>
                        <Card variant='nutrition'>
                          <ResponsiveText>Élément 1</ResponsiveText>
                        </Card>
                        <Card variant='nutrition'>
                          <ResponsiveText>Élément 2</ResponsiveText>
                        </Card>
                        <Card variant='nutrition'>
                          <ResponsiveText>Élément 3</ResponsiveText>
                        </Card>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Container>
            )}

            {activeTab === 'typography' && (
              <Container variant='wide' padding='lg'>
                <ResponsiveHeading level={2} className='mb-32dp'>
                  Tests de Typographie Responsive
                </ResponsiveHeading>

                <Stack spacing='xl'>
                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Titres Responsives
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing='md'>
                        <ResponsiveHeading level={1} responsive>
                          Titre H1 Responsive
                        </ResponsiveHeading>
                        <ResponsiveHeading level={2} responsive>
                          Titre H2 Responsive
                        </ResponsiveHeading>
                        <ResponsiveHeading level={3} responsive>
                          Titre H3 Responsive
                        </ResponsiveHeading>
                        <ResponsiveHeading level={4} responsive>
                          Titre H4 Responsive
                        </ResponsiveHeading>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Texte Responsive
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing='md'>
                        <ResponsiveText variant='body-large' responsive>
                          Texte Body Large Responsive
                        </ResponsiveText>
                        <ResponsiveText variant='body' responsive>
                          Texte Body Responsive
                        </ResponsiveText>
                        <ResponsiveText variant='body-small' responsive>
                          Texte Body Small Responsive
                        </ResponsiveText>
                        <ResponsiveText variant='caption' responsive>
                          Texte Caption Responsive
                        </ResponsiveText>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Liste Responsive
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveList variant='ul' spacing='md' responsive>
                        <li>Premier élément de la liste</li>
                        <li>Deuxième élément de la liste</li>
                        <li>Troisième élément de la liste</li>
                        <li>Quatrième élément de la liste</li>
                      </ResponsiveList>
                    </CardContent>
                  </Card>
                </Stack>
              </Container>
            )}

            {activeTab === 'tables' && (
              <Container variant='wide' padding='lg'>
                <ResponsiveHeading level={2} className='mb-32dp'>
                  Tests de Tableaux Responsives
                </ResponsiveHeading>

                <Stack spacing='xl'>
                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Tableau avec Défilement
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveTable variant='striped' responsive='scroll'>
                        <ResponsiveTableHead>
                          <ResponsiveTableRow>
                            <ResponsiveTableCell variant='header'>
                              ID
                            </ResponsiveTableCell>
                            <ResponsiveTableCell variant='header'>
                              Nom
                            </ResponsiveTableCell>
                            <ResponsiveTableCell variant='header'>
                              Statut
                            </ResponsiveTableCell>
                            <ResponsiveTableCell variant='header'>
                              Prochaine Consultation
                            </ResponsiveTableCell>
                            <ResponsiveTableCell variant='header'>
                              Conformité
                            </ResponsiveTableCell>
                          </ResponsiveTableRow>
                        </ResponsiveTableHead>
                        <ResponsiveTableBody>
                          {tableData.map(row => (
                            <ResponsiveTableRow key={row.id}>
                              <ResponsiveTableCell>
                                {row.id}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell>
                                {row.name}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell>
                                {row.status}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell>
                                {row.nextAppointment}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell>
                                {row.compliance}
                              </ResponsiveTableCell>
                            </ResponsiveTableRow>
                          ))}
                        </ResponsiveTableBody>
                      </ResponsiveTable>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <ResponsiveHeading level={3}>
                        Tableau en Cartes (Mobile)
                      </ResponsiveHeading>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveTable variant='default' responsive='cards'>
                        <ResponsiveTableHead>
                          <ResponsiveTableRow>
                            <ResponsiveTableCell variant='header'>
                              ID
                            </ResponsiveTableCell>
                            <ResponsiveTableCell variant='header'>
                              Nom
                            </ResponsiveTableCell>
                            <ResponsiveTableCell variant='header'>
                              Statut
                            </ResponsiveTableCell>
                            <ResponsiveTableCell variant='header'>
                              Prochaine Consultation
                            </ResponsiveTableCell>
                            <ResponsiveTableCell variant='header'>
                              Conformité
                            </ResponsiveTableCell>
                          </ResponsiveTableRow>
                        </ResponsiveTableHead>
                        <ResponsiveTableBody>
                          {tableData.map(row => (
                            <ResponsiveTableRow key={row.id}>
                              <ResponsiveTableCell label='ID'>
                                {row.id}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell label='Nom'>
                                {row.name}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell label='Statut'>
                                {row.status}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell label='Prochaine Consultation'>
                                {row.nextAppointment}
                              </ResponsiveTableCell>
                              <ResponsiveTableCell label='Conformité'>
                                {row.compliance}
                              </ResponsiveTableCell>
                            </ResponsiveTableRow>
                          ))}
                        </ResponsiveTableBody>
                      </ResponsiveTable>
                    </CardContent>
                  </Card>
                </Stack>
              </Container>
            )}
          </div>
        </Flex>
      </Flex>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={mobileNavOpen}
        onToggle={() => setMobileNavOpen(!mobileNavOpen)}
        variant='bottom'
      >
        <Flex justify='around' className='w-full'>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className='flex flex-col items-center p-8dp text-center'
            >
              <span className='text-24dp mb-4dp'>{item.icon}</span>
              <ResponsiveText variant='caption'>{item.label}</ResponsiveText>
            </button>
          ))}
        </Flex>
      </MobileNavigation>
    </div>
  );
}
