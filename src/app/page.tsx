export default function Home() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-primary'>NutriSensia</h1>
            </div>
            <nav className='hidden md:flex space-x-8'>
              <a
                href='#'
                className='text-neutral hover:text-primary transition-colors'
              >
                Accueil
              </a>
              <a
                href='#'
                className='text-neutral hover:text-primary transition-colors'
              >
                Fonctionnalités
              </a>
              <a
                href='#'
                className='text-neutral hover:text-primary transition-colors'
              >
                À propos
              </a>
              <a
                href='#'
                className='text-neutral hover:text-primary transition-colors'
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='text-center'>
          <h2 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
            Votre assistant nutritionnel
            <span className='text-primary block'>intelligent</span>
          </h2>
          <p className='text-xl text-neutral max-w-3xl mx-auto mb-8'>
            NutriSensia vous aide à atteindre vos objectifs nutritionnels grâce
            à l&apos;intelligence artificielle. Planifiez vos repas, suivez vos
            progrès et améliorez votre santé de manière personnalisée.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button className='btn-primary text-lg px-8 py-3'>
              Commencer maintenant
            </button>
            <button className='btn-accent text-lg px-8 py-3'>
              En savoir plus
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className='mt-20 grid md:grid-cols-3 gap-8'>
          <div className='card text-center'>
            <div className='w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl text-white'>🍎</span>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Planification intelligente
            </h3>
            <p className='text-neutral'>
              Créez des plans de repas personnalisés adaptés à vos objectifs et
              préférences alimentaires.
            </p>
          </div>

          <div className='card text-center'>
            <div className='w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl text-white'>📊</span>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Suivi des progrès
            </h3>
            <p className='text-neutral'>
              Visualisez vos progrès nutritionnels avec des graphiques détaillés
              et des analyses avancées.
            </p>
          </div>

          <div className='card text-center'>
            <div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl text-white'>🤖</span>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              IA personnalisée
            </h3>
            <p className='text-neutral'>
              Bénéficiez de recommandations nutritionnelles intelligentes basées
              sur vos données personnelles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-gray-50 border-t border-gray-100 mt-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center text-neutral'>
            <p>&copy; 2024 NutriSensia. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
