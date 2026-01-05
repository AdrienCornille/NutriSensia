'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Share2, Heart } from 'lucide-react';

export interface BlogPostActionsProps {
  className?: string;
}

export const BlogPostActions: React.FC<BlogPostActionsProps> = ({
  className,
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: 'Découvrez cet article sur NutriSensia',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erreur lors du partage:', err);
      }
    } else {
      // Fallback: copier l'URL dans le presse-papiers
      navigator.clipboard.writeText(window.location.href);
      // TODO: Afficher une notification de succès
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        onClick={handleShare}
        variant='outline'
        size='sm'
        className='flex items-center gap-2'
      >
        <Share2 size={16} />
        Partager
      </Button>

      <Button variant='outline' size='sm' className='flex items-center gap-2'>
        <Heart size={16} />
        J'aime
      </Button>
    </div>
  );
};

export default BlogPostActions;
