'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface AuthSplitLayoutProps {
  editorial: React.ReactNode;
  children: React.ReactNode;
  /** Tight vertical padding — for dense forms (signup) that must fit a single viewport. */
  compact?: boolean;
}

export const AuthWordmark: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const t = useTranslations('Auth.layout');
  return (
    <Link
      href='/'
      className={`inline-flex items-center gap-[10px] no-underline ${className}`}
    >
      <span
        aria-hidden
        className='block w-[14px] h-[14px] rounded-full bg-peps border-[1.5px] border-ink'
      />
      <span className='font-serif text-[22px] font-medium tracking-[-0.02em] text-ink'>
        {t('wordmark')}
      </span>
    </Link>
  );
};

/**
 * Editorial split layout for auth pages (DS v2).
 *
 * - Left pane (1.4fr): editorial content (wordmark, eyebrow, headline, lede, Lucie note)
 * - Right pane (1fr):  centered form card
 * - Footer bar:        ink top-border, copyright + script tagline
 * - Mobile (<lg):      stacks single column, left pane gets bottom border instead of right
 */
export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  editorial,
  children,
  compact = false,
}) => {
  const t = useTranslations('Auth.layout');
  const year = new Date().getFullYear();

  const leftPaneClasses = compact
    ? 'min-w-0 flex flex-col justify-between gap-8 lg:gap-10 py-10 pb-6 lg:py-8 lg:pb-8 lg:pr-12 border-b-[1.5px] lg:border-b-0 lg:border-r-[1.5px] border-ink'
    : 'min-w-0 flex flex-col justify-between gap-12 lg:gap-14 py-12 pb-8 lg:py-[72px] lg:pb-14 lg:pr-16 border-b-[1.5px] lg:border-b-0 lg:border-r-[1.5px] border-ink';

  const rightPaneClasses = compact
    ? 'min-w-0 flex items-center justify-center py-8 lg:py-6 lg:pl-12'
    : 'min-w-0 flex items-center justify-center py-10 lg:py-[72px] lg:pl-16';

  return (
    <div
      className={`ns2 ${compact ? 'lg:h-screen' : 'min-h-screen'} flex flex-col bg-cream-100`}
    >
      <main className='flex-1 flex flex-col min-h-0'>
        <div className='ns2-container flex-1 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] min-w-0 min-h-0'>
          {/* Left · editorial pane */}
          <section className={leftPaneClasses}>{editorial}</section>

          {/* Right · form pane */}
          <section className={rightPaneClasses}>{children}</section>
        </div>
      </main>

      {/* Footer bar */}
      <footer
        className={`ns2-container border-t-[1.5px] border-ink ${compact ? 'py-2.5' : 'py-4'} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-[12px] text-ink-3 font-sans`}
      >
        <span>
          {t('footerCopyright', { year })} —{' '}
          <Link
            href='/mentions-legales'
            className='text-ink no-underline hover:text-peps-deep'
          >
            {t('footerLegal')}
          </Link>{' '}
          ·{' '}
          <Link
            href='/confidentialite'
            className='text-ink no-underline hover:text-peps-deep'
          >
            {t('footerPrivacy')}
          </Link>
        </span>
        <span className='font-script text-[17px] text-coral -rotate-1 inline-block'>
          {t('footerTagline')}
        </span>
      </footer>
    </div>
  );
};

export default AuthSplitLayout;
