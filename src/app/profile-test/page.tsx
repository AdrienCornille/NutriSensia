import ProfileTest from '@/components/ProfileTest';

export default function ProfileTestPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Test du Système de Rôles et Profils
          </h1>
          <p className='text-gray-600'>
            Page de test pour valider le système complet de rôles et profils
            utilisateur
          </p>
        </div>

        {/* Composant de test des profils */}
        <ProfileTest />
      </div>
    </div>
  );
}
