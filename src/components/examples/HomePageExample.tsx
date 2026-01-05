'use client';

import {
  Section,
  Container,
  Grid,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  H1,
  H2,
  H3,
  P,
  PLarge,
  Lead,
  ScrollAnimation,
} from '@/components/ui';

/**
 * Exemple de page d'accueil utilisant le Design System 2025
 *
 * Cette page démontre l'utilisation des nouveaux composants,
 * couleurs, polices et animations selon les spécifications.
 */
export function HomePageExample() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <Section
        background='default'
        animation='fadeIn'
        className='relative overflow-hidden'
      >
        <Container className='text-center py-20'>
          <ScrollAnimation animation='slideUp' delay={200}>
            <H1 className='mb-6'>NutriSensia</H1>
            <Lead className='mb-8 max-w-2xl mx-auto'>
              Plateforme suisse de nutrition personnalisée. Consultations en
              ligne avec des nutritionnistes certifiés ASCA/RME.
            </Lead>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button variant='primary' size='lg'>
                Commencer maintenant
              </Button>
              <Button variant='outline' size='lg'>
                En savoir plus
              </Button>
            </div>
          </ScrollAnimation>
        </Container>
      </Section>

      {/* Services Section */}
      <Section background='secondary' animation='slideUp' className='py-20'>
        <Container>
          <ScrollAnimation animation='fadeIn' delay={100}>
            <div className='text-center mb-16'>
              <H2 className='mb-4'>Nos Services</H2>
              <PLarge className='max-w-2xl mx-auto'>
                Des solutions nutritionnelles adaptées à vos besoins spécifiques
              </PLarge>
            </div>
          </ScrollAnimation>

          <Grid cols={3} gap='default'>
            <ScrollAnimation animation='slideUp' delay={200}>
              <Card variant='elevated' hover>
                <CardHeader>
                  <CardTitle>Consultation Personnalisée</CardTitle>
                  <CardDescription>
                    Bilan nutritionnel complet avec un expert certifié
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <P>
                    Analyse de vos habitudes alimentaires et création d'un plan
                    nutritionnel adapté à vos objectifs de santé.
                  </P>
                </CardContent>
              </Card>
            </ScrollAnimation>

            <ScrollAnimation animation='slideUp' delay={400}>
              <Card variant='elevated' hover>
                <CardHeader>
                  <CardTitle>Suivi Personnalisé</CardTitle>
                  <CardDescription>
                    Accompagnement continu pour maintenir vos résultats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <P>
                    Suivi régulier avec ajustements de votre plan nutritionnel
                    selon vos progrès et vos besoins évolutifs.
                  </P>
                </CardContent>
              </Card>
            </ScrollAnimation>

            <ScrollAnimation animation='slideUp' delay={600}>
              <Card variant='elevated' hover>
                <CardHeader>
                  <CardTitle>Plans Alimentaires</CardTitle>
                  <CardDescription>
                    Menus personnalisés selon vos préférences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <P>
                    Création de plans alimentaires détaillés avec recettes
                    adaptées à votre mode de vie et vos contraintes.
                  </P>
                </CardContent>
              </Card>
            </ScrollAnimation>
          </Grid>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section background='accent' animation='fadeIn' className='py-20'>
        <Container className='text-center'>
          <ScrollAnimation animation='slideUp' delay={200}>
            <H2 className='text-white mb-4'>
              Prêt à commencer votre parcours nutritionnel ?
            </H2>
            <PLarge className='text-white/90 mb-8 max-w-2xl mx-auto'>
              Rejoignez des milliers de personnes qui ont transformé leur santé
              grâce à nos conseils nutritionnels personnalisés.
            </PLarge>
            <Button
              variant='primary'
              size='lg'
              className='bg-white text-accent hover:bg-white/90'
            >
              Prendre rendez-vous
            </Button>
          </ScrollAnimation>
        </Container>
      </Section>

      {/* Footer */}
      <Section
        background='default'
        className='py-12 border-t border-neutral-border'
      >
        <Container>
          <div className='text-center'>
            <P className='text-text-light'>
              © 2024 NutriSensia. Tous droits réservés.
            </P>
          </div>
        </Container>
      </Section>
    </div>
  );
}
