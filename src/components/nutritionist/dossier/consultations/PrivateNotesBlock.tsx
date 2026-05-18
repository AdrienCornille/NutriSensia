'use client';

import React from 'react';

interface PrivateNotesBlockProps {
  children: React.ReactNode;
  label?: string;
}

/**
 * Sober "private notes" block — replaces the v2 red-alert block.
 * Renders with a subtle diagonal pattern + lock-mask icon + ink/cream tones.
 * The `non visible · patient` reminder is appended automatically via CSS.
 */
export function PrivateNotesBlock({
  children,
  label = 'Confidentiel',
}: PrivateNotesBlockProps) {
  return (
    <div className='fp-private'>
      <div className='fp-private-eyebrow'>{label}</div>
      {typeof children === 'string' ? <p>{children}</p> : children}
    </div>
  );
}
