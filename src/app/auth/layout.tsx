import type { Metadata } from 'next';
import { Providers } from '../providers';
import '../globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Authentification | NutriSensia',
  description:
    'Connectez-vous ou créez votre compte NutriSensia pour accéder à votre espace nutrition personnalisé.',
};

/**
 * Layout for non-localized auth routes (callback, confirm, reset-password, update-password).
 *
 * Localized auth routes ([locale]/auth/{signin,signup,forgot-password}) inherit from
 * [locale]/layout.tsx instead. DS v2 fonts (Fraunces, Inter, Caveat) and tokens are
 * loaded globally via globals.css — no extra imports needed here.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='fr'>
      <body className='ns2 antialiased bg-cream-100 text-ink'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
