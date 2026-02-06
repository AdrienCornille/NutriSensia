import type { Metadata } from 'next';
import { Providers } from '../providers';
import '../globals.css';

// Force dynamic rendering pour les pages auth qui utilisent useSearchParams
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Authentification | NutriSensia',
  description:
    'Connectez-vous ou créez votre compte NutriSensia pour accéder à votre espace nutrition personnalisé.',
};

/**
 * Layout pour les pages d'authentification
 *
 * Ce layout est séparé du layout principal [locale] car les pages auth
 * sont exclues du middleware i18n pour simplifier les URLs.
 *
 * Design: Palette Méditerranée (Style Guide NutriSensia)
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='fr'>
      <head>
        {/* Google Fonts - Marcellus (titres) et Plus Jakarta Sans (body) */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Marcellus&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
          rel='stylesheet'
        />
      </head>
      <body className='antialiased' style={{ backgroundColor: '#f8f7ef' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
