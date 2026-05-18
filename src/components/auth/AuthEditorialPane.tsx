'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AuthWordmark } from './AuthSplitLayout';

type Namespace = 'Auth.Login' | 'Auth.Signup' | 'Auth.ForgotPassword';

interface AuthEditorialPaneProps {
  namespace: Namespace;
  /** Two-line headline structures differ slightly per page. */
  variant?: 'standard' | 'reset';
  /** Dense layout for forms that must fit one viewport (signup). */
  compact?: boolean;
}

/**
 * Left-side editorial pane shared by the 3 auth pages.
 *
 * Reads from `{namespace}.editorial.*` i18n keys.
 *
 * - `standard` variant: line 1 is a single sentence, line 2 has italic em.
 * - `reset` variant:    line 1 is a fragment (pre only), line 2 wraps the em.
 */
export const AuthEditorialPane: React.FC<AuthEditorialPaneProps> = ({
  namespace,
  variant = 'standard',
  compact = false,
}) => {
  const t = useTranslations(`${namespace}.editorial` as const);

  const headlineSize = 'text-[clamp(56px,7vw,108px)]';
  const wordmarkMb = compact ? 'mb-5' : 'mb-8';
  const headlineMt = compact ? 'mt-4' : 'mt-6';
  const bottomBlockPt = compact ? 'pt-5' : 'pt-8';
  const ledeSize = compact
    ? 'text-[17px] leading-[1.4]'
    : 'text-[20px] leading-[1.5]';
  const lucieCardPad = compact ? 'px-4 py-3' : 'px-5 py-4';
  const lucieAvatarSize = compact ? 'w-10 h-10' : 'w-11 h-11';
  const lucieQuoteSize = compact
    ? 'text-[14px] leading-[1.4]'
    : 'text-[16px] leading-[1.45]';

  return (
    <>
      {/* Top block: wordmark + eyebrow + headline */}
      <div>
        <AuthWordmark className={wordmarkMb} />

        <span className='inline-flex items-center gap-3 font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-ink-3'>
          <span
            aria-hidden
            className='block w-2 h-2 rounded-full bg-peps-deep'
          />
          {t('eyebrow')} ·{' '}
          <b className='text-ink font-bold'>{t('eyebrowBold')}</b>
        </span>

        <h1
          className={`font-serif font-medium text-ink ${headlineMt} max-w-[12ch] leading-[0.92] tracking-[-0.035em] ${headlineSize}`}
        >
          {variant === 'reset' ? (
            <>
              {t('headlineLine1Pre')}
              <br />
              {t('headlineLine2Pre')}{' '}
              <em className='italic font-normal'>{t('headlineLine2Em')}</em>
              {t('headlineLine2Post')}
            </>
          ) : (
            <>
              {t('headlineLine1')}
              <br />
              {t('headlineLine2Pre')}{' '}
              <em className='italic font-normal'>{t('headlineLine2Em')}</em>{' '}
              {t('headlineLine2Post')}
            </>
          )}
        </h1>
      </div>

      {/* Bottom block: lede + Lucie note */}
      <div
        className={`grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-5 md:gap-10 items-start border-t-[1.5px] border-ink ${bottomBlockPt}`}
      >
        <p className={`font-serif italic text-ink-2 m-0 ${ledeSize}`}>
          {t('ledePre')} <em className='italic'>{t('ledeEm')}</em>{' '}
          {t('ledePost')}
        </p>

        <aside
          className={`bg-[var(--ns-sage-100)] border-[1.5px] border-ink rounded-[14px] ${lucieCardPad} flex items-start gap-3.5`}
        >
          <span
            className={`block ${lucieAvatarSize} shrink-0 rounded-full border-[1.5px] border-ink overflow-hidden bg-peps relative`}
          >
            <Image
              src='/images/lucie-cornille-profile.jpg'
              alt=''
              fill
              sizes='44px'
              className='object-cover'
            />
          </span>
          <div>
            <p className={`m-0 font-serif italic text-ink ${lucieQuoteSize}`}>
              {t('lucieQuote')}
            </p>
            <span className='block mt-1.5 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-ink-3'>
              {t('lucieSig')}
            </span>
          </div>
        </aside>
      </div>
    </>
  );
};

export default AuthEditorialPane;
