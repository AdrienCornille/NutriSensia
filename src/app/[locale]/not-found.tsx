import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('NotFound');

  return (
    <div
      className='ns2 min-h-screen flex flex-col'
      style={{ backgroundColor: 'var(--ns-cream-100)' }}
    >
      <main
        className='flex-1 flex items-center'
        data-screen-label='404 — Page introuvable'
      >
        <section className='nf-hero nf-hero-full'>
          <div className='ns2-container'>
            <span className='nf-hero-eyebrow'>
              {t('eyebrowPrefix')} <b>{t('eyebrowCode')}</b> ·{' '}
              {t('eyebrowSuffix')}
            </span>

            <div className='nf-number-row'>
              <h1 className='nf-number'>
                <span className='nf-crumb nf-crumb-1' aria-hidden='true'>
                  {t('crumb1')}
                </span>
                <span className='nf-crumb nf-crumb-2' aria-hidden='true'>
                  {t('crumb2')}
                </span>
                <span className='nf-crumb nf-crumb-3' aria-hidden='true'>
                  {t('crumb3')}
                </span>
                <span className='nf-seed a' aria-hidden='true' />
                <span className='nf-seed b' aria-hidden='true' />
                <span className='nf-seed c' aria-hidden='true' />
                <span className='nf-seed d' aria-hidden='true' />4
                <span className='zero'>0</span>4
                <span className='nf-sticker-on-num' aria-hidden='true'>
                  <span className='ns2-sticker'>{t('sticker')}</span>
                </span>
              </h1>

              <aside className='nf-side'>
                <span className='nf-stamp'>
                  {t('stampLine1')}
                  <br />
                  {t('stampLine2')}
                </span>
                <span className='nf-side-rule' aria-hidden='true' />
                <span className='nf-side-note'>{t('sideNote')}</span>
              </aside>
            </div>

            <div className='nf-headline-row'>
              <h2 className='nf-h1'>
                {t('h1Part1')} <em>{t('h1Em')}</em> {t('h1Part2')}
              </h2>
              <p className='nf-lede'>{t('lede')}</p>

              <div className='nf-actions'>
                <Link href='/' className='ns2-btn ns2-btn-peps'>
                  {t('ctaHome')}
                </Link>
                <Link href='/blog' className='ns2-btn ns2-btn-outline'>
                  {t('ctaBlog')}
                </Link>
                <Link
                  href={'/blog/recettes' as never}
                  className='ns2-btn ns2-btn-ghost'
                >
                  {t('ctaRecipes')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
