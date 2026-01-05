'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Star, Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

/**
 * Interface pour un témoignage dans l'admin
 */
interface AdminTestimonial {
  id: string;
  name: string;
  role: 'patient' | 'nutritionist';
  location?: string;
  rating: number;
  comment: string;
  avatar?: string;
  date: string;
  results?: string;
  specialty?: string;
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Props du composant TestimonialsManager
 */
interface TestimonialsManagerProps {
  /** Classes CSS personnalisées */
  className?: string;
}

/**
 * Composant de gestion des témoignages pour l'admin
 *
 * Fonctionnalités :
 * - Liste des témoignages avec filtres
 * - Ajout/modification/suppression
 * - Gestion de la visibilité
 * - Mise en avant des témoignages
 * - Prévisualisation
 */
export function TestimonialsManager({ className }: TestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'patient' | 'nutritionist' | 'featured'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les témoignages
  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des témoignages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les témoignages
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'featured' && testimonial.is_featured) ||
      testimonial.role === filter;

    const matchesSearch =
      !searchTerm ||
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.comment.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Basculer la visibilité
  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);

      if (error) throw error;

      setTestimonials(prev =>
        prev.map(t =>
          t.id === id ? { ...t, is_visible: !currentVisibility } : t
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la visibilité:', error);
    }
  };

  // Basculer la mise en avant
  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;

      setTestimonials(prev =>
        prev.map(t =>
          t.id === id ? { ...t, is_featured: !currentFeatured } : t
        )
      );
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour de la mise en avant:',
        error
      );
    }
  };

  // Supprimer un témoignage
  const deleteTestimonial = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* En-tête */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Gestion des témoignages
          </h2>
          <p className='text-gray-600'>
            {testimonials.length} témoignage
            {testimonials.length !== 1 ? 's' : ''} au total
          </p>
        </div>

        <Button className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          Ajouter un témoignage
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex gap-2'>
          {[
            { key: 'all', label: 'Tous' },
            { key: 'patient', label: 'Patients' },
            { key: 'nutritionist', label: 'Nutritionnistes' },
            { key: 'featured', label: 'Mis en avant' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'primary' : 'outline'}
              size='sm'
              onClick={() => setFilter(key as any)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className='flex-1 max-w-md'>
          <input
            type='text'
            placeholder='Rechercher par nom ou commentaire...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
      </div>

      {/* Statistiques */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='text-2xl font-bold text-blue-600'>
              {testimonials.filter(t => t.is_visible).length}
            </div>
            <div className='text-sm text-gray-600'>Visibles</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='text-2xl font-bold text-green-600'>
              {testimonials.filter(t => t.is_featured).length}
            </div>
            <div className='text-sm text-gray-600'>Mis en avant</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='text-2xl font-bold text-purple-600'>
              {testimonials.filter(t => t.role === 'patient').length}
            </div>
            <div className='text-sm text-gray-600'>Patients</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='text-2xl font-bold text-orange-600'>
              {testimonials.filter(t => t.role === 'nutritionist').length}
            </div>
            <div className='text-sm text-gray-600'>Nutritionnistes</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des témoignages */}
      <div className='grid gap-4'>
        {filteredTestimonials.length === 0 ? (
          <Card>
            <CardContent className='p-8 text-center'>
              <p className='text-gray-500'>Aucun témoignage trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredTestimonials.map(testimonial => (
            <Card key={testimonial.id} className='overflow-hidden'>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                        {testimonial.avatar ? (
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className='w-10 h-10 rounded-full object-cover'
                          />
                        ) : (
                          <span className='text-sm font-medium text-gray-600'>
                            {testimonial.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-medium text-gray-900'>
                            {testimonial.name}
                          </h3>
                          <Badge
                            variant={
                              testimonial.role === 'patient'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {testimonial.role === 'patient'
                              ? 'Patient'
                              : 'Nutritionniste'}
                          </Badge>
                          {testimonial.is_featured && (
                            <Badge
                              variant='outline'
                              className='text-yellow-600 border-yellow-600'
                            >
                              Mis en avant
                            </Badge>
                          )}
                        </div>

                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                          <div className='flex items-center gap-1'>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-3 w-3',
                                  i < testimonial.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                )}
                              />
                            ))}
                          </div>
                          {testimonial.location && (
                            <span>• {testimonial.location}</span>
                          )}
                          <span>
                            •{' '}
                            {new Date(testimonial.date).toLocaleDateString(
                              'fr-CH'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className='text-gray-700 mb-3 italic'>
                      "{testimonial.comment}"
                    </p>

                    {(testimonial.results || testimonial.specialty) && (
                      <div className='mb-3'>
                        <Badge variant='outline' className='text-xs'>
                          {testimonial.results || testimonial.specialty}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        toggleVisibility(testimonial.id, testimonial.is_visible)
                      }
                      className={cn(
                        'p-2',
                        testimonial.is_visible
                          ? 'text-green-600'
                          : 'text-gray-400'
                      )}
                    >
                      {testimonial.is_visible ? (
                        <Eye className='h-4 w-4' />
                      ) : (
                        <EyeOff className='h-4 w-4' />
                      )}
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        toggleFeatured(testimonial.id, testimonial.is_featured)
                      }
                      className={cn(
                        'p-2',
                        testimonial.is_featured
                          ? 'text-yellow-600'
                          : 'text-gray-400'
                      )}
                    >
                      <Star
                        className={cn(
                          'h-4 w-4',
                          testimonial.is_featured && 'fill-current'
                        )}
                      />
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      className='p-2 text-blue-600'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => deleteTestimonial(testimonial.id)}
                      className='p-2 text-red-600'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
