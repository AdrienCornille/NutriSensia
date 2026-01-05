/**
 * Composant des paramètres de confidentialité du profil
 *
 * Permet aux utilisateurs de contrôler finement :
 * - La visibilité de leurs informations personnelles
 * - Les permissions de partage avec les professionnels
 * - Les préférences de communication
 * - Les paramètres de recherche et découvrabilité
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Shield,
  Users,
  Mail,
  Search,
  Lock,
  Globe,
  UserCheck,
  AlertTriangle,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Schéma de validation pour les paramètres de confidentialité
 */
const privacySettingsSchema = z.object({
  // Visibilité du profil
  profile_visibility: z.enum(['public', 'professionals_only', 'private']),

  // Informations visibles
  visible_fields: z.object({
    phone: z.boolean(),
    email: z.boolean(),
    avatar: z.boolean(),
    location: z.boolean(),
    specializations: z.boolean(),
    bio: z.boolean(),
    consultation_rates: z.boolean(),
    availability: z.boolean(),
  }),

  // Permissions de contact
  contact_permissions: z.object({
    allow_direct_contact: z.boolean(),
    allow_appointment_requests: z.boolean(),
    allow_consultation_inquiries: z.boolean(),
    require_referral: z.boolean(),
  }),

  // Paramètres de recherche
  search_settings: z.object({
    appear_in_search: z.boolean(),
    appear_in_recommendations: z.boolean(),
    allow_patient_reviews: z.boolean(),
    show_patient_count: z.boolean(),
  }),

  // Notifications
  notification_preferences: z.object({
    email_notifications: z.boolean(),
    sms_notifications: z.boolean(),
    marketing_communications: z.boolean(),
    appointment_reminders: z.boolean(),
  }),

  // Partage de données
  data_sharing: z.object({
    allow_analytics: z.boolean(),
    allow_research_participation: z.boolean(),
    allow_third_party_integrations: z.boolean(),
  }),
});

type PrivacySettingsForm = z.infer<typeof privacySettingsSchema>;

interface ProfilePrivacySettingsProps {
  /** Paramètres actuels */
  currentSettings?: Partial<PrivacySettingsForm>;
  /** Rôle de l'utilisateur */
  userRole: 'nutritionist' | 'patient';
  /** Callback pour sauvegarder */
  onSave?: (settings: PrivacySettingsForm) => Promise<void>;
  /** État de chargement */
  isLoading?: boolean;
}

/**
 * Composant de section de paramètres
 */
const SettingsSection = ({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <motion.div
    className='bg-white rounded-lg border p-6'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className='flex items-start space-x-3 mb-4'>
      <div className='p-2 bg-blue-100 text-blue-600 rounded-lg'>
        <Icon className='w-5 h-5' />
      </div>
      <div>
        <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
        <p className='text-sm text-gray-600'>{description}</p>
      </div>
    </div>
    <div className='space-y-4'>{children}</div>
  </motion.div>
);

/**
 * Composant de toggle avec label
 */
const ToggleField = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <div className='flex items-center justify-between py-2'>
    <div className='flex-1'>
      <label className='text-sm font-medium text-gray-900'>{label}</label>
      {description && (
        <p className='text-xs text-gray-500 mt-1'>{description}</p>
      )}
    </div>
    <button
      type='button'
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

/**
 * Composant de sélection radio
 */
const RadioField = ({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: string; label: string; description: string }[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}) => (
  <div className='space-y-3'>
    {options.map(option => (
      <div key={option.value} className='flex items-start space-x-3'>
        <input
          type='radio'
          id={`${name}-${option.value}`}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={e => onChange(e.target.value)}
          className='mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500'
        />
        <div className='flex-1'>
          <label
            htmlFor={`${name}-${option.value}`}
            className='text-sm font-medium text-gray-900 cursor-pointer'
          >
            {option.label}
          </label>
          <p className='text-xs text-gray-500 mt-1'>{option.description}</p>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Composant principal des paramètres de confidentialité
 */
export const ProfilePrivacySettings = ({
  currentSettings = {},
  userRole,
  onSave,
  isLoading = false,
}: ProfilePrivacySettingsProps) => {
  const [hasChanges, setHasChanges] = useState(false);

  // Configuration par défaut
  const defaultSettings: PrivacySettingsForm = {
    profile_visibility: 'professionals_only',
    visible_fields: {
      phone: userRole === 'nutritionist',
      email: false,
      avatar: true,
      location: userRole === 'nutritionist',
      specializations: userRole === 'nutritionist',
      bio: userRole === 'nutritionist',
      consultation_rates: userRole === 'nutritionist',
      availability: userRole === 'nutritionist',
    },
    contact_permissions: {
      allow_direct_contact: userRole === 'nutritionist',
      allow_appointment_requests: userRole === 'nutritionist',
      allow_consultation_inquiries: userRole === 'nutritionist',
      require_referral: userRole === 'patient',
    },
    search_settings: {
      appear_in_search: userRole === 'nutritionist',
      appear_in_recommendations: userRole === 'nutritionist',
      allow_patient_reviews: userRole === 'nutritionist',
      show_patient_count: userRole === 'nutritionist',
    },
    notification_preferences: {
      email_notifications: true,
      sms_notifications: false,
      marketing_communications: false,
      appointment_reminders: true,
    },
    data_sharing: {
      allow_analytics: true,
      allow_research_participation: false,
      allow_third_party_integrations: false,
    },
  };

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<PrivacySettingsForm>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: { ...defaultSettings, ...currentSettings },
  });

  const watchedValues = watch();

  useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty, watchedValues]);

  const handleSave = async (data: PrivacySettingsForm) => {
    try {
      await onSave?.(data);
      setHasChanges(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleReset = () => {
    reset({ ...defaultSettings, ...currentSettings });
    setHasChanges(false);
  };

  // Options de visibilité du profil
  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Visible par tous les utilisateurs de la plateforme',
    },
    {
      value: 'professionals_only',
      label: 'Professionnels uniquement',
      description: 'Visible seulement par les professionnels de santé vérifiés',
    },
    {
      value: 'private',
      label: 'Privé',
      description: 'Visible seulement par vos contacts directs',
    },
  ];

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* En-tête */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200'>
        <div className='flex items-center space-x-3'>
          <Shield className='w-8 h-8 text-blue-600' />
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Paramètres de confidentialité
            </h2>
            <p className='text-gray-600 mt-1'>
              Contrôlez qui peut voir vos informations et comment elles sont
              utilisées
            </p>
          </div>
        </div>

        {hasChanges && (
          <motion.div
            className='mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className='flex items-center space-x-2 text-yellow-800'>
              <AlertTriangle className='w-4 h-4' />
              <span className='text-sm font-medium'>
                Vous avez des modifications non sauvegardées
              </span>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit(handleSave)} className='space-y-6'>
        {/* Visibilité du profil */}
        <SettingsSection
          title='Visibilité du profil'
          description='Choisissez qui peut voir votre profil'
          icon={Eye}
        >
          <Controller
            name='profile_visibility'
            control={control}
            render={({ field }) => (
              <RadioField
                options={visibilityOptions}
                value={field.value}
                onChange={field.onChange}
                name='profile_visibility'
              />
            )}
          />
        </SettingsSection>

        {/* Informations visibles */}
        <SettingsSection
          title='Informations visibles'
          description='Sélectionnez les informations que les autres peuvent voir'
          icon={Users}
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Controller
              name='visible_fields.avatar'
              control={control}
              render={({ field }) => (
                <ToggleField
                  label='Photo de profil'
                  description='Votre photo de profil'
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name='visible_fields.phone'
              control={control}
              render={({ field }) => (
                <ToggleField
                  label='Numéro de téléphone'
                  description='Votre numéro de contact'
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name='visible_fields.email'
              control={control}
              render={({ field }) => (
                <ToggleField
                  label='Adresse email'
                  description='Votre adresse email'
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {userRole === 'nutritionist' && (
              <>
                <Controller
                  name='visible_fields.specializations'
                  control={control}
                  render={({ field }) => (
                    <ToggleField
                      label='Spécialisations'
                      description="Vos domaines d'expertise"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name='visible_fields.consultation_rates'
                  control={control}
                  render={({ field }) => (
                    <ToggleField
                      label='Tarifs de consultation'
                      description='Vos tarifs professionnels'
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </>
            )}
          </div>
        </SettingsSection>

        {/* Permissions de contact */}
        {userRole === 'nutritionist' && (
          <SettingsSection
            title='Permissions de contact'
            description='Contrôlez comment les patients peuvent vous contacter'
            icon={Mail}
          >
            <div className='space-y-4'>
              <Controller
                name='contact_permissions.allow_direct_contact'
                control={control}
                render={({ field }) => (
                  <ToggleField
                    label='Autoriser le contact direct'
                    description='Les patients peuvent vous contacter directement'
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name='contact_permissions.allow_appointment_requests'
                control={control}
                render={({ field }) => (
                  <ToggleField
                    label='Demandes de rendez-vous'
                    description='Recevoir des demandes de rendez-vous en ligne'
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </SettingsSection>
        )}

        {/* Paramètres de recherche */}
        <SettingsSection
          title='Découvrabilité'
          description='Gérez votre visibilité dans les recherches'
          icon={Search}
        >
          <div className='space-y-4'>
            <Controller
              name='search_settings.appear_in_search'
              control={control}
              render={({ field }) => (
                <ToggleField
                  label='Apparaître dans les recherches'
                  description='Votre profil peut être trouvé via la recherche'
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name='search_settings.appear_in_recommendations'
              control={control}
              render={({ field }) => (
                <ToggleField
                  label='Recommandations automatiques'
                  description='Être suggéré aux utilisateurs pertinents'
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection
          title='Notifications'
          description='Choisissez comment vous souhaitez être contacté'
          icon={Mail}
        >
          <div className='space-y-4'>
            <Controller
              name='notification_preferences.email_notifications'
              control={control}
              render={({ field }) => (
                <ToggleField
                  label='Notifications par email'
                  description='Recevoir les notifications importantes par email'
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name='notification_preferences.appointment_reminders'
              control={control}
              render={({ field }) => (
                <ToggleField
                  label='Rappels de rendez-vous'
                  description='Recevoir des rappels avant vos rendez-vous'
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name='notification_preferences.marketing_communications'
              control={control}
              render={({ field }) => (
                <ToggleField
                  label='Communications marketing'
                  description='Recevoir des informations sur les nouvelles fonctionnalités'
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </SettingsSection>

        {/* Actions */}
        <div className='flex items-center justify-between bg-gray-50 rounded-lg p-4'>
          <button
            type='button'
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
            className='flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <RotateCcw className='w-4 h-4' />
            <span>Annuler les modifications</span>
          </button>

          <button
            type='submit'
            disabled={!hasChanges || isLoading}
            className='flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors'
          >
            <Save className='w-4 h-4' />
            <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
