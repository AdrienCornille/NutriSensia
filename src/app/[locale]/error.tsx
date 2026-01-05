'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='max-w-md w-full p-8 bg-white rounded-lg shadow-lg'>
        <h2 className='text-2xl font-bold text-red-600 mb-4'>
          Une erreur s'est produite
        </h2>
        <p className='text-gray-600 mb-4'>
          {error.message || "Une erreur inattendue s'est produite."}
        </p>
        <button
          onClick={reset}
          className='w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors'
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
