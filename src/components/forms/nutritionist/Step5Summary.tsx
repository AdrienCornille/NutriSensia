'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  Award,
  Briefcase,
  Globe,
  MapPin,
  FileText,
  Image,
  Check,
  Pencil,
  Loader2,
} from 'lucide-react';
import type { NutritionistRegistrationData } from '@/types/nutritionist-registration';
import { LANGUAGES, formatFileSize } from '@/types/nutritionist-registration';

interface Step5SummaryProps {
  onBack: () => void;
  onSubmit: () => void;
  onEditStep: (step: number) => void;
  isSubmitting: boolean;
}

/**
 * Étape 5: Récapitulatif et soumission
 * @see AUTH-008 dans USER_STORIES.md
 */
export function Step5Summary({
  onBack,
  onSubmit,
  onEditStep,
  isSubmitting,
}: Step5SummaryProps) {
  const { watch } = useFormContext<NutritionistRegistrationData>();

  const data = watch();

  const getLanguageLabels = (codes: string[]) => {
    return codes
      .map(code => LANGUAGES.find(l => l.code === code)?.label || code)
      .join(', ');
  };

  const Section = ({
    title,
    icon: Icon,
    step,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    step: number;
    children: React.ReactNode;
  }) => (
    <div className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
      <div className='flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200'>
        <div className='flex items-center gap-2'>
          <Icon className='w-5 h-5 text-[#1B998B]' />
          <h3 className='font-medium text-gray-800'>{title}</h3>
        </div>
        <button
          type='button'
          onClick={() => onEditStep(step)}
          className='flex items-center gap-1 text-sm text-[#1B998B] hover:underline'
        >
          <Pencil className='w-3.5 h-3.5' />
          Modifier
        </button>
      </div>
      <div className='p-4'>{children}</div>
    </div>
  );

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | null;
  }) => (
    <div className='flex justify-between py-2 border-b border-gray-100 last:border-0'>
      <span className='text-sm text-gray-500'>{label}</span>
      <span className='text-sm text-gray-800 font-medium'>{value || '-'}</span>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* En-tête */}
      <div className='text-center mb-8'>
        <div className='w-16 h-16 mx-auto bg-[#1B998B]/10 rounded-full flex items-center justify-center mb-4'>
          <Check className='w-8 h-8 text-[#1B998B]' />
        </div>
        <h2 className='text-xl font-semibold text-gray-800'>
          Vérifiez vos informations
        </h2>
        <p className='text-sm text-gray-600 mt-2'>
          Relisez attentivement avant de soumettre votre demande
          d&apos;inscription.
        </p>
      </div>

      {/* Section 1: Informations personnelles */}
      <Section title='Informations personnelles' icon={User} step={1}>
        <InfoRow
          label='Nom complet'
          value={`${data.personalInfo?.firstName || ''} ${data.personalInfo?.lastName || ''}`}
        />
        <InfoRow label='Email' value={data.personalInfo?.email} />
        <InfoRow label='Téléphone' value={data.personalInfo?.phone} />
      </Section>

      {/* Section 2: Informations professionnelles */}
      <Section title='Informations professionnelles' icon={Briefcase} step={2}>
        {data.professionalInfo?.ascaNumber && (
          <InfoRow
            label='Numéro ASCA'
            value={data.professionalInfo.ascaNumber}
          />
        )}
        {data.professionalInfo?.rmeNumber && (
          <InfoRow label='Numéro RME' value={data.professionalInfo.rmeNumber} />
        )}
        <InfoRow
          label='Expérience'
          value={
            {
              '0-2': 'Moins de 2 ans',
              '2-5': '2 à 5 ans',
              '5-10': '5 à 10 ans',
              '10+': 'Plus de 10 ans',
            }[data.professionalInfo?.yearsOfExperience || '']
          }
        />
        <InfoRow
          label='Langues'
          value={getLanguageLabels(data.professionalInfo?.languages || [])}
        />
        <div className='py-2 border-b border-gray-100'>
          <span className='text-sm text-gray-500 block mb-2'>
            Spécialisations
          </span>
          <div className='flex flex-wrap gap-1.5'>
            {data.professionalInfo?.specializations?.map(spec => (
              <span
                key={spec}
                className='px-2 py-1 bg-[#1B998B]/10 text-[#1B998B] text-xs rounded-full'
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
        {data.professionalInfo?.cabinetAddress?.street && (
          <InfoRow
            label='Adresse du cabinet'
            value={`${data.professionalInfo.cabinetAddress.street}, ${data.professionalInfo.cabinetAddress.postalCode} ${data.professionalInfo.cabinetAddress.city}`}
          />
        )}
      </Section>

      {/* Section 3: Documents */}
      <Section title='Documents' icon={FileText} step={3}>
        <div className='space-y-3'>
          {data.documents?.ascaCertificate && (
            <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
              <FileText className='w-5 h-5 text-green-600' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-800 truncate'>
                  Certificat ASCA
                </p>
                <p className='text-xs text-gray-500'>
                  {data.documents.ascaCertificate.fileName} •{' '}
                  {formatFileSize(data.documents.ascaCertificate.fileSize)}
                </p>
              </div>
              <Check className='w-4 h-4 text-green-600' />
            </div>
          )}
          {data.documents?.rmeCertificate && (
            <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
              <FileText className='w-5 h-5 text-green-600' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-800 truncate'>
                  Certificat RME
                </p>
                <p className='text-xs text-gray-500'>
                  {data.documents.rmeCertificate.fileName} •{' '}
                  {formatFileSize(data.documents.rmeCertificate.fileSize)}
                </p>
              </div>
              <Check className='w-4 h-4 text-green-600' />
            </div>
          )}
          {data.documents?.diploma && (
            <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
              <FileText className='w-5 h-5 text-green-600' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-800 truncate'>
                  Diplôme
                </p>
                <p className='text-xs text-gray-500'>
                  {data.documents.diploma.fileName} •{' '}
                  {formatFileSize(data.documents.diploma.fileSize)}
                </p>
              </div>
              <Check className='w-4 h-4 text-green-600' />
            </div>
          )}
          {data.documents?.photo && (
            <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
              <Image className='w-5 h-5 text-green-600' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-800 truncate'>
                  Photo professionnelle
                </p>
                <p className='text-xs text-gray-500'>
                  {data.documents.photo.fileName} •{' '}
                  {formatFileSize(data.documents.photo.fileSize)}
                </p>
              </div>
              <Check className='w-4 h-4 text-green-600' />
            </div>
          )}
        </div>
      </Section>

      {/* Confirmation */}
      <div className='p-4 bg-amber-50 border border-amber-200 rounded-xl'>
        <p className='text-sm text-amber-800'>
          <strong>Important :</strong> En soumettant votre demande, vos
          documents seront examinés par notre équipe. Vous recevrez un email de
          confirmation dans les 48 heures ouvrées.
        </p>
      </div>

      {/* Boutons */}
      <div className='flex gap-4 pt-4'>
        <button
          type='button'
          onClick={onBack}
          disabled={isSubmitting}
          className='flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50'
        >
          Retour
        </button>
        <button
          type='button'
          onClick={onSubmit}
          disabled={isSubmitting}
          className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='w-5 h-5 animate-spin' />
              Envoi en cours...
            </>
          ) : (
            'Soumettre ma demande'
          )}
        </button>
      </div>
    </div>
  );
}

export default Step5Summary;
