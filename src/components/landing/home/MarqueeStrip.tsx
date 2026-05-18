'use client';

/**
 * Marquee strip — DS v2.
 * Italic Fraunces words scrolling on ink with peps stars. Used as a
 * decorative section divider. Pauses for users with prefers-reduced-motion
 * (handled in globals.css).
 */
const DEFAULT_WORDS = [
  'Sans régime',
  'Sans culpabilité',
  'Sans Instagram',
  'Avec plaisir',
  'En douceur',
  'Pour de vrai',
  'À votre rythme',
  'Au beurre, parfois',
  'Sans drame',
];

export function MarqueeStrip({ words = DEFAULT_WORDS }: { words?: string[] }) {
  return (
    <div className='ns2-marquee' aria-hidden='true'>
      <div className='ns2-marquee-track'>
        {[...Array(2)].flatMap((_, dup) =>
          words.map((word, i) => (
            <span key={`${dup}-${i}`} className='ns2-marquee-item'>
              <span>{word}</span>
              <span className='ns2-marquee-star'>★</span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
