'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FileText, AlertCircle, Check } from 'lucide-react';
import { DocumentUploader } from '@/components/ui/DocumentUploader';
import type {
  NutritionistRegistrationData,
  NutritionistDocument,
} from '@/types/nutritionist-registration';

interface Step3DocumentsProps {
  onNext: () => void;
  onBack: () => void;
  userId?: string;
}

/**
 * Étape 3: Upload des documents
 * @see AUTH-009 dans USER_STORIES.md
 */
export function Step3Documents({
  onNext,
  onBack,
  userId,
}: Step3DocumentsProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<NutritionistRegistrationData>();

  const documents = watch('documents');
  const ascaNumber = watch('professionalInfo.ascaNumber');
  const rmeNumber = watch('professionalInfo.rmeNumber');

  // Vérifier si au moins un certificat est uploadé
  const hasAsca = !!documents?.ascaCertificate;
  const hasRme = !!documents?.rmeCertificate;
  const hasPhoto = !!documents?.photo;
  const hasCertificate = hasAsca || hasRme;

  // Message de validation
  const getValidationMessage = () => {
    const missing: string[] = [];

    if (!hasCertificate) {
      if (ascaNumber && !hasAsca) missing.push('certificat ASCA');
      if (rmeNumber && !hasRme) missing.push('certificat RME');
      if (!ascaNumber && !rmeNumber) missing.push('certificat ASCA ou RME');
    }

    if (!hasPhoto) missing.push('photo professionnelle');

    return missing;
  };

  const missingDocs = getValidationMessage();
  const canProceed = hasCertificate && hasPhoto;

  const handleDocumentUpload = (
    type: 'ascaCertificate' | 'rmeCertificate' | 'diploma' | 'photo',
    document: NutritionistDocument
  ) => {
    setValue(`documents.${type}`, document, { shouldValidate: true });
  };

  const handleDocumentDelete = (
    type: 'ascaCertificate' | 'rmeCertificate' | 'diploma' | 'photo'
  ) => {
    setValue(`documents.${type}`, undefined, { shouldValidate: true });
  };

  return (
    <div className='space-y-8'>
      {/* En-tête */}
      <div className='flex items-start gap-3 p-4 bg-blue-50 rounded-xl'>
        <FileText className='w-5 h-5 text-blue-600 mt-0.5' />
        <div>
          <p className='text-sm font-medium text-blue-800'>Documents requis</p>
          <p className='text-sm text-blue-600 mt-1'>
            Téléchargez vos certifications pour validation. Ces documents seront
            vérifiés par notre équipe avant activation de votre compte.
          </p>
        </div>
      </div>

      {/* Certificat ASCA */}
      {ascaNumber && (
        <DocumentUploader
          type='asca_certificate'
          currentDocument={documents?.ascaCertificate}
          userId={userId}
          onUploadSuccess={doc => handleDocumentUpload('ascaCertificate', doc)}
          onDelete={() => handleDocumentDelete('ascaCertificate')}
        />
      )}

      {/* Certificat RME */}
      {rmeNumber && (
        <DocumentUploader
          type='rme_certificate'
          currentDocument={documents?.rmeCertificate}
          userId={userId}
          onUploadSuccess={doc => handleDocumentUpload('rmeCertificate', doc)}
          onDelete={() => handleDocumentDelete('rmeCertificate')}
        />
      )}

      {/* Si aucun numéro n'a été renseigné, afficher les deux options */}
      {!ascaNumber && !rmeNumber && (
        <div className='space-y-6'>
          <DocumentUploader
            type='asca_certificate'
            currentDocument={documents?.ascaCertificate}
            userId={userId}
            onUploadSuccess={doc =>
              handleDocumentUpload('ascaCertificate', doc)
            }
            onDelete={() => handleDocumentDelete('ascaCertificate')}
          />
          <DocumentUploader
            type='rme_certificate'
            currentDocument={documents?.rmeCertificate}
            userId={userId}
            onUploadSuccess={doc => handleDocumentUpload('rmeCertificate', doc)}
            onDelete={() => handleDocumentDelete('rmeCertificate')}
          />
        </div>
      )}

      {/* Diplôme (optionnel) */}
      <DocumentUploader
        type='diploma'
        currentDocument={documents?.diploma}
        userId={userId}
        onUploadSuccess={doc => handleDocumentUpload('diploma', doc)}
        onDelete={() => handleDocumentDelete('diploma')}
      />

      {/* Photo professionnelle */}
      <DocumentUploader
        type='photo'
        currentDocument={documents?.photo}
        userId={userId}
        onUploadSuccess={doc => handleDocumentUpload('photo', doc)}
        onDelete={() => handleDocumentDelete('photo')}
      />

      {/* Récapitulatif des documents */}
      <div className='p-4 bg-gray-50 rounded-xl'>
        <h4 className='text-sm font-medium text-gray-700 mb-3'>
          Récapitulatif des documents
        </h4>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            {hasCertificate ? (
              <Check className='w-4 h-4 text-green-600' />
            ) : (
              <AlertCircle className='w-4 h-4 text-amber-500' />
            )}
            <span
              className={`text-sm ${hasCertificate ? 'text-green-700' : 'text-amber-700'}`}
            >
              Certificat ASCA ou RME
            </span>
          </div>
          <div className='flex items-center gap-2'>
            {hasPhoto ? (
              <Check className='w-4 h-4 text-green-600' />
            ) : (
              <AlertCircle className='w-4 h-4 text-amber-500' />
            )}
            <span
              className={`text-sm ${hasPhoto ? 'text-green-700' : 'text-amber-700'}`}
            >
              Photo professionnelle
            </span>
          </div>
          {documents?.diploma && (
            <div className='flex items-center gap-2'>
              <Check className='w-4 h-4 text-green-600' />
              <span className='text-sm text-green-700'>
                Diplôme (optionnel)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Message d'erreur si documents manquants */}
      {missingDocs.length > 0 && (
        <div className='p-4 bg-amber-50 border border-amber-200 rounded-xl'>
          <div className='flex items-start gap-2'>
            <AlertCircle className='w-5 h-5 text-amber-600 mt-0.5' />
            <div>
              <p className='text-sm font-medium text-amber-800'>
                Documents manquants
              </p>
              <p className='text-sm text-amber-700 mt-1'>
                Veuillez télécharger : {missingDocs.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Boutons */}
      <div className='flex gap-4 pt-4'>
        <button
          type='button'
          onClick={onBack}
          className='flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors'
        >
          Retour
        </button>
        <button
          type='button'
          onClick={onNext}
          disabled={!canProceed}
          className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

export default Step3Documents;
