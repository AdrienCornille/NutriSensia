'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';

export function NutritionistProfileFields() {
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
      {/* Informations professionnelles */}
      <div className='space-y-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <AcademicCapIcon className='h-6 w-6 text-primary' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Informations professionnelles
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Numéro ASCA */}
          <FormField
            name='asca_number'
            label='Numéro ASCA'
            placeholder='XX123456'
          />

          {/* Numéro RME */}
          <FormField
            name='rme_number'
            label='Numéro RME'
            placeholder='RME123456'
          />

          {/* Code EAN */}
          <FormField
            name='ean_code'
            label='Code EAN'
            placeholder='1234567890123'
          />
        </div>

        {/* Spécialisations */}
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
            Spécialisations
          </label>
          <Controller
            name='specializations'
            control={control}
            render={({ field }) => (
              <div className='space-y-3'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {[
                    'Nutrition sportive',
                    'Perte de poids',
                    'Gain de masse musculaire',
                    'Nutrition clinique',
                    'Allergies alimentaires',
                    'Intolérances',
                    'Nutrition pédiatrique',
                    'Nutrition gériatrique',
                    'Nutrition végétarienne',
                    'Nutrition végane',
                    'Troubles du comportement alimentaire',
                    'Nutrition préventive',
                  ].map(specialization => (
                    <label
                      key={specialization}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='checkbox'
                        checked={field.value?.includes(specialization) || false}
                        onChange={e => {
                          const currentValue = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...currentValue, specialization]);
                          } else {
                            field.onChange(
                              currentValue.filter(s => s !== specialization)
                            );
                          }
                        }}
                        className='rounded border-gray-300 text-primary focus:ring-primary'
                      />
                      <span className='text-sm text-gray-700'>
                        {specialization}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          />
          {errors.specializations && (
            <p className='text-sm text-red-600'>
              {errors.specializations.message as string}
            </p>
          )}
        </div>

        {/* Bio */}
        <FormField
          name='bio'
          label='Biographie professionnelle'
          type='textarea'
          placeholder='Décrivez votre parcours, vos spécialités et votre approche...'
        />
      </div>

      {/* Tarifs de consultation */}
      <div className='space-y-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <CurrencyDollarIcon className='h-6 w-6 text-primary' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Tarifs de consultation
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Consultation initiale (CHF)
            </label>
            <input
              type='number'
              step='0.01'
              min='50'
              max='500'
              {...register('consultation_rates.initial', {
                valueAsNumber: true,
              })}
              placeholder='150.00'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
            />
            {errors.consultation_rates?.initial && (
              <p className='text-sm text-red-600'>
                {errors.consultation_rates.initial.message as string}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Consultation de suivi (CHF)
            </label>
            <input
              type='number'
              step='0.01'
              min='30'
              max='300'
              {...register('consultation_rates.follow_up', {
                valueAsNumber: true,
              })}
              placeholder='100.00'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
            />
            {errors.consultation_rates?.follow_up && (
              <p className='text-sm text-red-600'>
                {errors.consultation_rates.follow_up.message as string}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Consultation express (CHF)
            </label>
            <input
              type='number'
              step='0.01'
              min='15'
              max='150'
              {...register('consultation_rates.express', {
                valueAsNumber: true,
              })}
              placeholder='50.00'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
            />
            {errors.consultation_rates?.express && (
              <p className='text-sm text-red-600'>
                {errors.consultation_rates.express.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Adresse du cabinet */}
      <div className='space-y-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <BuildingOfficeIcon className='h-6 w-6 text-primary' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Adresse du cabinet
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            name='practice_address.street'
            label='Rue et numéro'
            placeholder='Rue de la Paix 123'
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              name='practice_address.postal_code'
              label='Code postal'
              placeholder='1200'
            />

            <FormField
              name='practice_address.city'
              label='Ville'
              placeholder='Genève'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Canton
            </label>
            <select
              {...register('practice_address.canton')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
            >
              <option value=''>Sélectionner un canton</option>
              <option value='AG'>Argovie (AG)</option>
              <option value='AI'>Appenzell Rhodes-Intérieures (AI)</option>
              <option value='AR'>Appenzell Rhodes-Extérieures (AR)</option>
              <option value='BE'>Berne (BE)</option>
              <option value='BL'>Bâle-Campagne (BL)</option>
              <option value='BS'>Bâle-Ville (BS)</option>
              <option value='FR'>Fribourg (FR)</option>
              <option value='GE'>Genève (GE)</option>
              <option value='GL'>Glaris (GL)</option>
              <option value='GR'>Grisons (GR)</option>
              <option value='JU'>Jura (JU)</option>
              <option value='LU'>Lucerne (LU)</option>
              <option value='NE'>Neuchâtel (NE)</option>
              <option value='NW'>Nidwald (NW)</option>
              <option value='OW'>Obwald (OW)</option>
              <option value='SG'>Saint-Gall (SG)</option>
              <option value='SH'>Schaffhouse (SH)</option>
              <option value='SO'>Soleure (SO)</option>
              <option value='SZ'>Schwytz (SZ)</option>
              <option value='TG'>Thurgovie (TG)</option>
              <option value='TI'>Tessin (TI)</option>
              <option value='UR'>Uri (UR)</option>
              <option value='VD'>Vaud (VD)</option>
              <option value='VS'>Valais (VS)</option>
              <option value='ZG'>Zug (ZG)</option>
              <option value='ZH'>Zurich (ZH)</option>
            </select>
            {errors.practice_address?.canton && (
              <p className='text-sm text-red-600'>
                {errors.practice_address.canton.message as string}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Pays
            </label>
            <input
              type='text'
              {...register('practice_address.country')}
              value='CH'
              readOnly
              className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50'
            />
          </div>
        </div>
      </div>

      {/* Statut professionnel */}
      <div className='space-y-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <CheckCircleIcon className='h-6 w-6 text-primary' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Statut professionnel
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Statut de vérification
            </label>
            <Controller
              name='verified'
              control={control}
              render={({ field }) => (
                <div className='flex items-center space-x-4'>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='radio'
                      {...field}
                      value='true'
                      checked={field.value === true}
                      className='text-primary focus:ring-primary'
                    />
                    <span className='text-sm text-gray-700'>Vérifié</span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='radio'
                      {...field}
                      value='false'
                      checked={field.value === false}
                      className='text-primary focus:ring-primary'
                    />
                    <span className='text-sm text-gray-700'>Non vérifié</span>
                  </label>
                </div>
              )}
            />
            {errors.verified && (
              <p className='text-sm text-red-600'>
                {errors.verified.message as string}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Statut d'activité
            </label>
            <Controller
              name='is_active'
              control={control}
              render={({ field }) => (
                <div className='flex items-center space-x-4'>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='radio'
                      {...field}
                      value='true'
                      checked={field.value === true}
                      className='text-primary focus:ring-primary'
                    />
                    <span className='text-sm text-gray-700'>Actif</span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='radio'
                      {...field}
                      value='false'
                      checked={field.value === false}
                      className='text-primary focus:ring-primary'
                    />
                    <span className='text-sm text-gray-700'>Inactif</span>
                  </label>
                </div>
              )}
            />
            {errors.is_active && (
              <p className='text-sm text-red-600'>
                {errors.is_active.message as string}
              </p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>
            Nombre maximum de patients
          </label>
          <input
            type='number'
            {...register('max_patients', { valueAsNumber: true })}
            placeholder='50'
            min='1'
            max='200'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
          />
          {errors.max_patients && (
            <p className='text-sm text-red-600'>
              {errors.max_patients.message as string}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
