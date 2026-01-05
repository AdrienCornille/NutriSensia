'use client';

import Link from 'next/link';

export default function TestColorsIndexPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8'>
      <div className='max-w-6xl w-full'>
        <div className='text-center mb-12'>
          <h1 className='text-5xl font-bold text-gray-800 mb-4'>
            🎨 Test des Palettes de Couleurs
          </h1>
          <p className='text-xl text-gray-600 mb-2'>
            NutriSensia - Choix de la palette graphique
          </p>
          <p className='text-sm text-gray-500'>
            Cliquez sur une palette pour voir le rendu de la page d'accueil
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Original - Verts */}
          <Link href='/' className='group'>
            <div className='bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-transparent hover:border-[#2E7D5E] transform hover:-translate-y-2'>
              <div className='h-32 bg-gradient-to-br from-[#2E7D5E] to-[#4A9B7B] flex items-center justify-center'>
                <div className='text-white text-center'>
                  <div className='text-4xl mb-2'>🌿</div>
                  <div className='text-2xl font-bold'>Original</div>
                </div>
              </div>
              <div className='p-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-3'>
                  Palette Actuelle
                </h3>
                <div className='flex gap-2 mb-4'>
                  <div className='w-8 h-8 rounded-full bg-[#2E7D5E] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#4A9B7B] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#B8D4C7] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#E8F3EF] border-2 border-white shadow'></div>
                </div>
                <p className='text-gray-600 text-sm mb-3'>
                  Tons verts naturels et apaisants
                </p>
                <div className='text-xs text-gray-500 space-y-1'>
                  <div>✅ Naturel & Bio</div>
                  <div>✅ Apaisant & Sain</div>
                  <div>✅ Familier & Accessible</div>
                </div>
              </div>
            </div>
          </Link>

          {/* Deep Ocean */}
          <Link href='/test-colors/deepocean' className='group'>
            <div className='bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-transparent hover:border-[#2C5282] transform hover:-translate-y-2'>
              <div className='h-32 bg-gradient-to-br from-[#2C5282] to-[#5A7BA6] flex items-center justify-center'>
                <div className='text-white text-center'>
                  <div className='text-4xl mb-2'>💙</div>
                  <div className='text-2xl font-bold'>Deep Ocean</div>
                </div>
              </div>
              <div className='p-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-3'>
                  Bleu Marine & Orange
                </h3>
                <div className='flex gap-2 mb-4'>
                  <div className='w-8 h-8 rounded-full bg-[#2C5282] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#5A7BA6] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#E67E22] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#E8EEF5] border-2 border-white shadow'></div>
                </div>
                <p className='text-gray-600 text-sm mb-3'>
                  Bleus profonds avec accents orange vifs
                </p>
                <div className='text-xs text-gray-500 space-y-1'>
                  <div>✅ Professionnel & Moderne</div>
                  <div>✅ Confiance & Fiabilité</div>
                  <div>✅ Dynamique & Énergique</div>
                </div>
              </div>
            </div>
          </Link>

          {/* Terra Natura */}
          <Link href='/test-colors/terra' className='group'>
            <div className='bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-transparent hover:border-[#8B6F47] transform hover:-translate-y-2'>
              <div className='h-32 bg-gradient-to-br from-[#8B6F47] to-[#A6855A] flex items-center justify-center'>
                <div className='text-white text-center'>
                  <div className='text-4xl mb-2'>🌾</div>
                  <div className='text-2xl font-bold'>Terra Natura</div>
                </div>
              </div>
              <div className='p-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-3'>
                  Tons Terre & Naturels
                </h3>
                <div className='flex gap-2 mb-4'>
                  <div className='w-8 h-8 rounded-full bg-[#8B6F47] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#A6855A] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#C17A58] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#F5F1E8] border-2 border-white shadow'></div>
                </div>
                <p className='text-gray-600 text-sm mb-3'>
                  Terre cuite, sable et terracotta
                </p>
                <div className='text-xs text-gray-500 space-y-1'>
                  <div>✅ Chaleureux & Réconfortant</div>
                  <div>✅ Naturel & Organique</div>
                  <div>✅ Authentique & Terroir</div>
                </div>
              </div>
            </div>
          </Link>

          {/* Méditerranée */}
          <Link href='/test-colors/mediterranean' className='group'>
            <div className='bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-transparent hover:border-[#1B998B] transform hover:-translate-y-2'>
              <div className='h-32 bg-gradient-to-br from-[#1B998B] to-[#E9C46A] flex items-center justify-center'>
                <div className='text-white text-center'>
                  <div className='text-4xl mb-2'>🌊</div>
                  <div className='text-2xl font-bold'>Méditerranée</div>
                </div>
              </div>
              <div className='p-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-3'>
                  Turquoise & Terracotta
                </h3>
                <div className='flex gap-2 mb-4'>
                  <div className='w-8 h-8 rounded-full bg-[#1B998B] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#E9C46A] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#E76F51] border-2 border-white shadow'></div>
                  <div className='w-8 h-8 rounded-full bg-[#F8F5F2] border-2 border-white shadow'></div>
                </div>
                <p className='text-gray-600 text-sm mb-3'>
                  Turquoise azur, sable doré et terracotta
                </p>
                <div className='text-xs text-gray-500 space-y-1'>
                  <div>✅ Frais & Vitalité</div>
                  <div>✅ Diète Méditerranéenne</div>
                  <div>✅ Santé & Bien-être</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className='mt-12 bg-white rounded-xl shadow-lg p-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4 text-center'>
            💡 Guide de Sélection
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700'>
            <div className='bg-green-50 rounded-lg p-4 border-l-4 border-green-500'>
              <div className='font-bold mb-2'>🌿 Original (Vert)</div>
              <div className='text-xs'>
                Idéal si vous souhaitez conserver votre identité actuelle
                naturelle et bio
              </div>
            </div>
            <div className='bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500'>
              <div className='font-bold mb-2'>💙 Deep Ocean (Bleu)</div>
              <div className='text-xs'>
                Pour un positionnement plus professionnel, moderne et corporate
                (services B2B)
              </div>
            </div>
            <div className='bg-amber-50 rounded-lg p-4 border-l-4 border-amber-600'>
              <div className='font-bold mb-2'>🌾 Terra Natura (Terre)</div>
              <div className='text-xs'>
                Pour une approche chaleureuse, organique et artisanale
                (alimentation locale)
              </div>
            </div>
            <div className='bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500'>
              <div className='font-bold mb-2'>🌊 Méditerranée (Turquoise)</div>
              <div className='text-xs'>
                Pour mettre en avant la santé, la vitalité et la diète
                méditerranéenne
              </div>
            </div>
          </div>
        </div>

        <div className='mt-8 text-center text-sm text-gray-500'>
          <p>
            Chaque palette est appliquée sur l'ensemble de la page d'accueil
          </p>
          <p className='mt-1'>
            Prenez le temps de comparer les différentes options 🎨
          </p>
        </div>
      </div>
    </div>
  );
}
