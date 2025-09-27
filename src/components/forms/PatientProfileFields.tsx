'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  UserIcon,
  HeartIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';

export function PatientProfileFields() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const watchedValues = watch();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className='space-y-8'
    >
      {/* Informations personnelles */}
      <div className='space-y-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <UserIcon className='h-6 w-6 text-primary' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Informations personnelles
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            name='date_of_birth'
            label='Date de naissance'
            type='date'
            placeholder='YYYY-MM-DD'
          />

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Genre
            </label>
            <select
              {...register('gender')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
            >
              <option value=''>Sélectionner un genre</option>
              <option value='male'>Homme</option>
              <option value='female'>Femme</option>
              <option value='other'>Autre</option>
              <option value='prefer_not_to_say'>Préfère ne pas dire</option>
            </select>
            {errors.gender && (
              <p className='text-sm text-red-600'>
                {errors.gender.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mesures physiques */}
      <div className='space-y-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <ScaleIcon className='h-6 w-6 text-primary' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Mesures physiques
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <FormField
            name='height'
            label='Taille (cm)'
            type='number'
            placeholder='170'
          />

          <FormField
            name='initial_weight'
            label='Poids initial (kg)'
            type='number'
            placeholder='70'
          />

          <FormField
            name='target_weight'
            label='Poids cible (kg)'
            type='number'
            placeholder='65'
          />
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
            Niveau d'activité physique
          </label>
          <select
            {...register('activity_level')}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
          >
            <option value=''>Sélectionner un niveau</option>
            <option value='sedentary'>
              Sédentaire (peu ou pas d'exercice)
            </option>
            <option value='light'>
              Légèrement actif (exercice léger 1-3 jours/semaine)
            </option>
            <option value='moderate'>
              Modérément actif (exercice modéré 3-5 jours/semaine)
            </option>
            <option value='active'>
              Très actif (exercice intense 6-7 jours/semaine)
            </option>
            <option value='very_active'>
              Extrêmement actif (exercice très intense, travail physique)
            </option>
          </select>
          {errors.activity_level && (
            <p className='text-sm text-red-600'>
              {errors.activity_level.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Contact d'urgence */}
      <div className='space-y-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <PhoneIcon className='h-6 w-6 text-primary' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Contact d'urgence
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            name='emergency_contact.name'
            label='Nom du contact'
            placeholder='Nom et prénom'
          />

          <FormField
            name='emergency_contact.phone'
            label='Téléphone'
            type='tel'
            placeholder='+41 XX XXX XX XX'
          />
        </div>

        <FormField
          name='emergency_contact.relationship'
          label='Relation'
          placeholder='Conjoint, parent, ami...'
        />
      </div>

      {/* Informations médicales */}
      <div className='space-y-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <HeartIcon className='h-6 w-6 text-primary' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Informations médicales
          </h2>
        </div>

        {/* Allergies */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
            Allergies alimentaires
          </label>
          <Controller
            name='allergies'
            control={control}
            render={({ field }) => (
              <div className='space-y-3'>
                <div className='flex flex-wrap gap-2'>
                  {field.value?.map((allergy, index) => (
                    <span
                      key={index}
                      className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800'
                    >
                      {allergy}
                      <button
                        type='button'
                        onClick={() => {
                          const newAllergies = field.value?.filter(
                            (_, i) => i !== index
                          );
                          field.onChange(newAllergies);
                        }}
                        className='ml-2 text-red-600 hover:text-red-800'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className='flex space-x-2'>
                  <input
                    type='text'
                    placeholder='Ajouter une allergie...'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && !field.value?.includes(value)) {
                          field.onChange([...(field.value || []), value]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      const input = document.querySelector(
                        'input[placeholder="Ajouter une allergie..."]'
                      ) as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !field.value?.includes(value)) {
                        field.onChange([...(field.value || []), value]);
                        input.value = '';
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            )}
          />
          {errors.allergies && (
            <p className='text-sm text-red-600'>
              {errors.allergies.message as string}
            </p>
          )}
        </div>

        {/* Restrictions alimentaires */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
            Restrictions alimentaires
          </label>
          <Controller
            name='dietary_restrictions'
            control={control}
            render={({ field }) => (
              <div className='space-y-3'>
                <div className='flex flex-wrap gap-2'>
                  {field.value?.map((restriction, index) => (
                    <span
                      key={index}
                      className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800'
                    >
                      {restriction}
                      <button
                        type='button'
                        onClick={() => {
                          const newRestrictions = field.value?.filter(
                            (_, i) => i !== index
                          );
                          field.onChange(newRestrictions);
                        }}
                        className='ml-2 text-yellow-600 hover:text-yellow-800'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className='flex space-x-2'>
                  <input
                    type='text'
                    placeholder='Ajouter une restriction...'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && !field.value?.includes(value)) {
                          field.onChange([...(field.value || []), value]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      const input = document.querySelector(
                        'input[placeholder="Ajouter une restriction..."]'
                      ) as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !field.value?.includes(value)) {
                        field.onChange([...(field.value || []), value]);
                        input.value = '';
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            )}
          />
          {errors.dietary_restrictions && (
            <p className='text-sm text-red-600'>
              {errors.dietary_restrictions.message as string}
            </p>
          )}
        </div>

        {/* Conditions médicales */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
            Conditions médicales
          </label>
          <Controller
            name='medical_conditions'
            control={control}
            render={({ field }) => (
              <div className='space-y-3'>
                <div className='flex flex-wrap gap-2'>
                  {field.value?.map((condition, index) => (
                    <span
                      key={index}
                      className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800'
                    >
                      {condition}
                      <button
                        type='button'
                        onClick={() => {
                          const newConditions = field.value?.filter(
                            (_, i) => i !== index
                          );
                          field.onChange(newConditions);
                        }}
                        className='ml-2 text-blue-600 hover:text-blue-800'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className='flex space-x-2'>
                  <input
                    type='text'
                    placeholder='Ajouter une condition médicale...'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && !field.value?.includes(value)) {
                          field.onChange([...(field.value || []), value]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      const input = document.querySelector(
                        'input[placeholder="Ajouter une condition médicale..."]'
                      ) as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !field.value?.includes(value)) {
                        field.onChange([...(field.value || []), value]);
                        input.value = '';
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            )}
          />
          {errors.medical_conditions && (
            <p className='text-sm text-red-600'>
              {errors.medical_conditions.message as string}
            </p>
          )}
        </div>

        {/* Médicaments */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
            Médicaments actuels
          </label>
          <Controller
            name='medications'
            control={control}
            render={({ field }) => (
              <div className='space-y-3'>
                <div className='flex flex-wrap gap-2'>
                  {field.value?.map((medication, index) => (
                    <span
                      key={index}
                      className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800'
                    >
                      {medication}
                      <button
                        type='button'
                        onClick={() => {
                          const newMedications = field.value?.filter(
                            (_, i) => i !== index
                          );
                          field.onChange(newMedications);
                        }}
                        className='ml-2 text-green-600 hover:text-green-800'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className='flex space-x-2'>
                  <input
                    type='text'
                    placeholder='Ajouter un médicament...'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && !field.value?.includes(value)) {
                          field.onChange([...(field.value || []), value]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      const input = document.querySelector(
                        'input[placeholder="Ajouter un médicament..."]'
                      ) as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !field.value?.includes(value)) {
                        field.onChange([...(field.value || []), value]);
                        input.value = '';
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            )}
          />
          {errors.medications && (
            <p className='text-sm text-red-600'>
              {errors.medications.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Informations d'abonnement */}
      <div className='space-y-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <CreditCardIcon className='h-6 w-6 text-primary' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Informations d'abonnement
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Niveau d'abonnement
            </label>
            <select
              {...register('subscription_tier', { valueAsNumber: true })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
            >
              <option value=''>Sélectionner un niveau</option>
              <option value='1'>Niveau 1 - Basique</option>
              <option value='2'>Niveau 2 - Standard</option>
              <option value='3'>Niveau 3 - Premium</option>
              <option value='4'>Niveau 4 - Pro</option>
              <option value='5'>Niveau 5 - Enterprise</option>
            </select>
            {errors.subscription_tier && (
              <p className='text-sm text-red-600'>
                {errors.subscription_tier.message as string}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Statut de l'abonnement
            </label>
            <select
              {...register('subscription_status')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
            >
              <option value=''>Sélectionner un statut</option>
              <option value='active'>Actif</option>
              <option value='inactive'>Inactif</option>
              <option value='suspended'>Suspendu</option>
              <option value='expired'>Expiré</option>
            </select>
            {errors.subscription_status && (
              <p className='text-sm text-red-600'>
                {errors.subscription_status.message as string}
              </p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            name='subscription_start_date'
            label="Date de début d'abonnement"
            type='datetime-local'
          />

          <FormField
            name='subscription_end_date'
            label="Date de fin d'abonnement"
            type='datetime-local'
          />
        </div>
      </div>
    </motion.div>
  );
}
