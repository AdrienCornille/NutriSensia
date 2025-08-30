export default function HomePage() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          NutriSensia - Test Simple
        </h1>
        <p className='text-xl text-gray-600'>
          Version simplifiée pour diagnostiquer les erreurs Webpack
        </p>
        <div className='mt-8'>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}
