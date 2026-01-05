import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Test Palette - NutriSensia',
  description: 'Page de test pour les nouvelles palettes de couleurs',
};

export default function TestColorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='fr'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
