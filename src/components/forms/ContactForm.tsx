'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

/**
 * Props pour les champs de formulaire
 */
interface FormFieldProps {
  label: string;
  name: string;
  type?:
    | 'text'
    | 'email'
    | 'tel'
    | 'number'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'multiselect';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  className?: string;
  description?: string;
  error?: string;
}

/**
 * Props du composant ContactForm
 */
export interface ContactFormProps<T extends Record<string, any>> {
  /**
   * Schéma de validation Zod
   */
  schema: z.ZodSchema<T>;

  /**
   * Configuration des champs du formulaire
   */
  fields: FormFieldProps[];

  /**
   * Type de formulaire pour l'identification
   */
  formType: 'general' | 'patient' | 'nutritionist' | 'demo';

  /**
   * Titre du formulaire
   */
  title: string;

  /**
   * Description du formulaire
   */
  description?: string;

  /**
   * Texte du bouton de soumission
   */
  submitText?: string;

  /**
   * Fonction appelée après soumission réussie
   */
  onSuccess?: (data: T) => void;

  /**
   * Fonction appelée en cas d'erreur
   */
  onError?: (error: Error) => void;

  /**
   * Classes CSS personnalisées
   */
  className?: string;

  /**
   * Valeurs par défaut
   */
  defaultValues?: Partial<T>;
}

/**
 * Composant FormField pour rendre les différents types de champs
 */
const FormField: React.FC<{
  field: FormFieldProps;
  control: any;
  error?: string;
}> = ({ field, control, error }) => {
  const {
    label,
    name,
    type = 'text',
    placeholder,
    required,
    options,
    rows = 4,
    description,
  } = field;

  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className='space-y-2'>
      <label
        htmlFor={fieldId}
        className='block text-sm font-medium text-gray-700 dark:text-gray-300'
      >
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      {description && (
        <p
          id={descriptionId}
          className='text-sm text-gray-500 dark:text-gray-400'
        >
          {description}
        </p>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field: controllerField }) => {
          const baseProps = {
            id: fieldId,
            'aria-describedby': cn(
              description && descriptionId,
              error && errorId
            ),
            'aria-invalid': !!error,
            className: cn(
              'w-full px-3 py-2 border rounded-lg transition-colors',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            ),
            placeholder,
            ...controllerField,
          };

          switch (type) {
            case 'textarea':
              return <textarea {...baseProps} rows={rows} />;

            case 'select':
              return (
                <select {...baseProps}>
                  <option value=''>Sélectionnez...</option>
                  {options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              );

            case 'multiselect':
              return (
                <div className='space-y-2'>
                  {options?.map(option => (
                    <label
                      key={option.value}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='checkbox'
                        value={option.value}
                        checked={
                          controllerField.value?.includes(option.value) || false
                        }
                        onChange={e => {
                          const currentValue = controllerField.value || [];
                          if (e.target.checked) {
                            controllerField.onChange([
                              ...currentValue,
                              option.value,
                            ]);
                          } else {
                            controllerField.onChange(
                              currentValue.filter(
                                (v: string) => v !== option.value
                              )
                            );
                          }
                        }}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm text-gray-700 dark:text-gray-300'>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              );

            case 'radio':
              return (
                <div className='space-y-2'>
                  {options?.map(option => (
                    <label
                      key={option.value}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='radio'
                        value={option.value}
                        checked={controllerField.value === option.value}
                        onChange={() => controllerField.onChange(option.value)}
                        className='border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm text-gray-700 dark:text-gray-300'>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              );

            case 'checkbox':
              return (
                <label className='flex items-start space-x-2'>
                  <input
                    type='checkbox'
                    checked={controllerField.value || false}
                    onChange={e => controllerField.onChange(e.target.checked)}
                    className='mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {placeholder}
                  </span>
                </label>
              );

            case 'number':
              return (
                <input
                  {...baseProps}
                  type='number'
                  onChange={e =>
                    controllerField.onChange(Number(e.target.value))
                  }
                />
              );

            default:
              return <input {...baseProps} type={type} />;
          }
        }}
      />

      {error && (
        <p
          id={errorId}
          className='text-sm text-red-600 dark:text-red-400'
          role='alert'
        >
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Composant ContactForm générique avec React Hook Form et Zod
 *
 * Ce composant fournit une base réutilisable pour tous les formulaires de contact
 * avec validation, protection anti-spam et accessibilité intégrées.
 */
export function ContactForm<T extends Record<string, any>>({
  schema,
  fields,
  formType,
  title,
  description,
  submitText = 'Envoyer',
  onSuccess,
  onError,
  className,
  defaultValues,
}: ContactFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: {
      website: '', // Champ honeypot
      consent: false,
      ...defaultValues,
    } as any,
  });

  /**
   * Fonction pour obtenir l'adresse IP du client (côté serveur)
   */
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('/api/client-info');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  /**
   * Fonction pour vérifier le spam
   */
  const checkSpam = async (data: T): Promise<boolean> => {
    // Vérifier le champ honeypot
    if ((data as any).website && (data as any).website.trim() !== '') {
      return true; // Spam détecté
    }

    // Vérifications supplémentaires côté client
    const message = (data as any).message || '';
    const name = (data as any).name || '';

    // Détection de patterns de spam simples
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|winner)\b/i,
      /\b(click here|visit now|act now)\b/i,
      /\$\$\$|!!!/,
      /\b\d{10,}\b/, // Trop de chiffres consécutifs
    ];

    return spamPatterns.some(
      pattern => pattern.test(message) || pattern.test(name)
    );
  };

  /**
   * Fonction de soumission du formulaire
   */
  const onSubmit = async (data: T) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Vérification anti-spam
      const isSpam = await checkSpam(data);
      if (isSpam) {
        throw new Error('Soumission détectée comme spam');
      }

      // Obtenir les métadonnées
      const clientIP = await getClientIP();
      const userAgent = navigator.userAgent;
      const referrer = document.referrer;

      // Préparer les données pour Supabase
      const { website, consent, ...formData } = data as any;
      const submissionData = {
        form_type: formType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message || null,
        consent,
        form_data: formData,
        ip_address: clientIP,
        user_agent: userAgent,
        referrer: referrer || null,
      };

      // Insérer dans Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert([submissionData]);

      if (error) {
        throw error;
      }

      // Succès
      setSubmitStatus('success');
      setSubmitMessage(
        'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
      );
      reset();
      onSuccess?.(data);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setSubmitStatus('error');
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'envoi. Veuillez réessayer."
      );
      onError?.(error instanceof Error ? error : new Error('Erreur inconnue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn('max-w-2xl mx-auto', className)}>
      <CardHeader>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
          {title}
        </h2>
        {description && (
          <p className='text-gray-600 dark:text-gray-300'>{description}</p>
        )}
      </CardHeader>

      <CardContent>
        {/* Message de statut */}
        {submitStatus !== 'idle' && (
          <div
            className={cn(
              'mb-6 p-4 rounded-lg',
              submitStatus === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            )}
          >
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                {submitStatus === 'success' ? (
                  <svg
                    className='w-5 h-5 text-green-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-5 h-5 text-red-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium'>{submitMessage}</p>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn('space-y-6', `${formType}-form`)}
          data-form-type={formType}
          noValidate
        >
          {/* Champ honeypot caché */}
          <div style={{ display: 'none' }}>
            <Controller
              name='website'
              as
              any
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type='text'
                  tabIndex={-1}
                  autoComplete='off'
                  aria-hidden='true'
                />
              )}
            />
          </div>

          {/* Rendu des champs */}
          {fields.map(field => (
            <FormField
              key={field.name}
              field={field}
              control={control}
              error={errors[field.name]?.message as string}
            />
          ))}

          {/* Bouton de soumission */}
          <div className='pt-4'>
            <Button
              type='submit'
              disabled={isSubmitting}
              loading={isSubmitting}
              className='w-full cta-button'
              data-cta={`${formType}-submit`}
              size='lg'
            >
              {isSubmitting ? 'Envoi en cours...' : submitText}
            </Button>
          </div>

          {/* Mentions légales */}
          <div className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            En soumettant ce formulaire, vous acceptez notre{' '}
            <a
              href='/privacy'
              className='text-blue-600 hover:text-blue-800 underline'
            >
              politique de confidentialité
            </a>{' '}
            et nos{' '}
            <a
              href='/terms'
              className='text-blue-600 hover:text-blue-800 underline'
            >
              conditions d'utilisation
            </a>
            .
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ContactForm;
