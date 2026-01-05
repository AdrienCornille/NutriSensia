import { redirect } from 'next/navigation';

// Rediriger vers la locale par défaut (français) quand `/` est demandé
export default function RootPage() {
  redirect('/fr');
}
