import React from 'react';

// Layout racine pour next-intl
// Ce layout minimal est requis quand on a un fichier not-found.tsx à la racine
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
