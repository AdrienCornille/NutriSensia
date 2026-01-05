import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  const t = useTranslations('Errors');

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <svg
            className='w-12 h-12 text-red-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>

        <h1 className='text-4xl font-bold text-gray-900 mb-4'>404</h1>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
          {t('pageNotFound')}
        </h2>
        <p className='text-gray-600 mb-8'>{t('pageNotFoundDescription')}</p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link href='/'>
            <Button className='w-full sm:w-auto'>{t('goHome')}</Button>
          </Link>
          <Link href='/contact'>
            <Button variant='secondary' className='w-full sm:w-auto'>
              {t('contactSupport')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
