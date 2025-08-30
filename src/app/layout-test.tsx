import type { Metadata } from 'next';
import './globals-simple.css';

export const metadata: Metadata = {
  title: 'NutriSensia - Test Simple',
  description: 'Version simplifiée pour tester',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='fr'>
      <body className='antialiased'>{children}</body>
    </html>
  );
}
