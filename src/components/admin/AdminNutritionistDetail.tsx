'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ExternalLink,
  User,
  Award,
  Languages,
  Clock,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminNutritionistProfile } from '@/types/admin';
import type { NutritionistDocument } from '@/types/nutritionist-registration';
import {
  NUTRITIONIST_STATUS_CONFIG,
  getStatusBadgeClasses,
  formatNutritionistName,
} from '@/types/admin';
import {
  DOCUMENT_CONFIG,
  formatFileSize,
} from '@/types/nutritionist-registration';

interface AdminNutritionistDetailProps {
  nutritionist: AdminNutritionistProfile;
  onBack: () => void;
  onValidate: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  isLoading?: boolean;
  className?: string;
}

const InfoSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className='bg-white rounded-xl border border-gray-100 p-6'>
    <div className='flex items-center gap-2 mb-4'>
      <div className='w-8 h-8 bg-[#1B998B]/10 rounded-lg flex items-center justify-center'>
        <Icon className='w-4 h-4 text-[#1B998B]' />
      </div>
      <h3 className='font-semibold text-gray-900'>{title}</h3>
    </div>
    {children}
  </div>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | React.ReactNode;
}) => (
  <div className='flex justify-between py-2 border-b border-gray-50 last:border-0'>
    <span className='text-sm text-gray-500'>{label}</span>
    <span className='text-sm text-gray-900 font-medium text-right'>
      {value || <span className='text-gray-400'>Non renseigné</span>}
    </span>
  </div>
);

const DocumentCard = ({ document }: { document: NutritionistDocument }) => {
  const config = DOCUMENT_CONFIG[document.type];
  const isPdf = document.mimeType === 'application/pdf';
  const isImage = document.mimeType.startsWith('image/');

  return (
    <div className='border border-gray-200 rounded-xl p-4 hover:border-[#1B998B]/30 transition-colors'>
      <div className='flex items-start gap-4'>
        {/* Aperçu */}
        <div className='flex-shrink-0'>
          {isImage ? (
            <img
              src={document.fileUrl}
              alt={document.fileName}
              className='w-16 h-16 rounded-lg object-cover'
            />
          ) : (
            <div className='w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center'>
              <FileText className='w-8 h-8 text-red-500' />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className='flex-1 min-w-0'>
          <p className='font-medium text-gray-900 truncate'>{config.label}</p>
          <p className='text-sm text-gray-500 truncate'>{document.fileName}</p>
          <p className='text-xs text-gray-400 mt-1'>
            {formatFileSize(document.fileSize)}
          </p>
        </div>

        {/* Actions */}
        <div className='flex gap-2'>
          <a
            href={document.fileUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='p-2 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/10 rounded-lg transition-colors'
            title='Voir'
          >
            <ExternalLink className='w-4 h-4' />
          </a>
          <a
            href={document.fileUrl}
            download={document.fileName}
            className='p-2 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/10 rounded-lg transition-colors'
            title='Télécharger'
          >
            <Download className='w-4 h-4' />
          </a>
        </div>
      </div>

      {/* Badge vérifié */}
      {document.verified && (
        <div className='mt-3 flex items-center gap-1 text-xs text-emerald-600'>
          <CheckCircle className='w-3 h-3' />
          Document vérifié
        </div>
      )}
    </div>
  );
};

/**
 * Détail d'un nutritionniste pour le panel admin
 * Affiche toutes les informations et permet la validation
 */
export function AdminNutritionistDetail({
  nutritionist,
  onBack,
  onValidate,
  onReject,
  onRequestInfo,
  isLoading = false,
  className,
}: AdminNutritionistDetailProps) {
  const statusConfig = NUTRITIONIST_STATUS_CONFIG[nutritionist.status];

  const formatDate = (date: Date | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-CH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = () => {
    const addr = nutritionist.cabinetAddress;
    if (!addr) return null;
    const parts = [addr.street, addr.postalCode, addr.city, addr.canton].filter(
      Boolean
    );
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header avec retour */}
      <div className='flex items-center justify-between'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
          <span>Retour à la liste</span>
        </button>

        {/* Badge statut */}
        <span
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium',
            getStatusBadgeClasses(nutritionist.status)
          )}
        >
          {statusConfig.labelFr}
        </span>
      </div>

      {/* Profil principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white rounded-2xl border border-gray-100 p-6'
      >
        <div className='flex items-start gap-6'>
          {/* Avatar */}
          <div className='flex-shrink-0'>
            {nutritionist.documents.find(d => d.type === 'photo')?.fileUrl ? (
              <img
                src={
                  nutritionist.documents.find(d => d.type === 'photo')?.fileUrl
                }
                alt={formatNutritionistName(nutritionist)}
                className='w-24 h-24 rounded-2xl object-cover'
              />
            ) : (
              <div className='w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center'>
                <User className='w-12 h-12 text-gray-400' />
              </div>
            )}
          </div>

          {/* Infos principales */}
          <div className='flex-1'>
            <h1 className='text-2xl font-bold text-gray-900'>
              {formatNutritionistName(nutritionist)}
            </h1>

            <div className='flex flex-wrap gap-4 mt-3 text-sm text-gray-600'>
              <a
                href={`mailto:${nutritionist.email}`}
                className='flex items-center gap-1 hover:text-[#1B998B]'
              >
                <Mail className='w-4 h-4' />
                {nutritionist.email}
              </a>
              {nutritionist.phone && (
                <a
                  href={`tel:${nutritionist.phone}`}
                  className='flex items-center gap-1 hover:text-[#1B998B]'
                >
                  <Phone className='w-4 h-4' />
                  {nutritionist.phone}
                </a>
              )}
            </div>

            <div className='flex items-center gap-1 mt-2 text-xs text-gray-400'>
              <Calendar className='w-3 h-3' />
              Inscription le {formatDate(nutritionist.createdAt)}
            </div>
          </div>
        </div>

        {/* Bio */}
        {nutritionist.bio && (
          <div className='mt-6 pt-6 border-t border-gray-100'>
            <p className='text-sm text-gray-600 leading-relaxed'>
              {nutritionist.bio}
            </p>
          </div>
        )}
      </motion.div>

      {/* Actions - Visible seulement si pending ou info_required */}
      {(nutritionist.status === 'pending' ||
        nutritionist.status === 'info_required') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='bg-amber-50 border border-amber-200 rounded-xl p-6'
        >
          <h3 className='font-semibold text-amber-900 mb-4 flex items-center gap-2'>
            <AlertCircle className='w-5 h-5' />
            Actions de validation
          </h3>

          <div className='flex flex-wrap gap-3'>
            <button
              onClick={onValidate}
              disabled={isLoading}
              className='flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50'
            >
              <CheckCircle className='w-4 h-4' />
              Valider la demande
            </button>

            <button
              onClick={onReject}
              disabled={isLoading}
              className='flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50'
            >
              <XCircle className='w-4 h-4' />
              Rejeter la demande
            </button>

            <button
              onClick={onRequestInfo}
              disabled={isLoading}
              className='flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              <AlertCircle className='w-4 h-4' />
              Demander des informations
            </button>
          </div>
        </motion.div>
      )}

      {/* Info requise - Message et réponse */}
      {nutritionist.status === 'info_required' &&
        nutritionist.infoRequestMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className='bg-blue-50 border border-blue-200 rounded-xl p-6'
          >
            <h3 className='font-semibold text-blue-900 mb-3'>
              Informations demandées
            </h3>
            <p className='text-sm text-blue-800 bg-white p-3 rounded-lg'>
              {nutritionist.infoRequestMessage}
            </p>

            {nutritionist.infoResponse && (
              <div className='mt-4'>
                <h4 className='text-sm font-medium text-blue-900 mb-2'>
                  Réponse du nutritionniste (
                  {formatDate(nutritionist.infoRespondedAt)})
                </h4>
                <p className='text-sm text-blue-800 bg-white p-3 rounded-lg'>
                  {nutritionist.infoResponse}
                </p>
              </div>
            )}
          </motion.div>
        )}

      {/* Raison du rejet */}
      {nutritionist.status === 'rejected' && nutritionist.rejectionReason && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className='bg-red-50 border border-red-200 rounded-xl p-6'
        >
          <h3 className='font-semibold text-red-900 mb-3'>Raison du rejet</h3>
          <p className='text-sm text-red-800 bg-white p-3 rounded-lg'>
            {nutritionist.rejectionReason}
          </p>
        </motion.div>
      )}

      {/* Grille d'informations */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Informations professionnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InfoSection title='Certifications' icon={Award}>
            <InfoRow label='Numéro ASCA' value={nutritionist.ascaNumber} />
            <InfoRow label='Numéro RME' value={nutritionist.rmeNumber} />
            {!nutritionist.ascaNumber && !nutritionist.rmeNumber && (
              <p className='text-sm text-amber-600 mt-2 flex items-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                Aucune certification fournie
              </p>
            )}
          </InfoSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <InfoSection title='Expérience' icon={Briefcase}>
            <InfoRow
              label="Années d'expérience"
              value={nutritionist.yearsOfExperience}
            />
            <InfoRow
              label='Spécialisations'
              value={
                nutritionist.specializations.length > 0
                  ? nutritionist.specializations.join(', ')
                  : undefined
              }
            />
          </InfoSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InfoSection title='Langues' icon={Languages}>
            <InfoRow
              label='Langues parlées'
              value={
                nutritionist.languages.length > 0
                  ? nutritionist.languages.join(', ')
                  : undefined
              }
            />
          </InfoSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <InfoSection title='Cabinet' icon={MapPin}>
            <InfoRow label='Adresse' value={formatAddress()} />
          </InfoSection>
        </motion.div>
      </div>

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <InfoSection title='Documents' icon={FileText}>
          {nutritionist.documents.length > 0 ? (
            <div className='grid sm:grid-cols-2 gap-4'>
              {nutritionist.documents.map(doc => (
                <DocumentCard key={doc.id || doc.type} document={doc} />
              ))}
            </div>
          ) : (
            <p className='text-sm text-gray-500 text-center py-8'>
              Aucun document téléchargé
            </p>
          )}
        </InfoSection>
      </motion.div>

      {/* Historique validation */}
      {nutritionist.validatedAt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <InfoSection title='Historique' icon={Clock}>
            <InfoRow
              label='Date de validation'
              value={formatDate(nutritionist.validatedAt)}
            />
            {nutritionist.validatedBy && (
              <InfoRow label='Validé par' value={nutritionist.validatedBy} />
            )}
          </InfoSection>
        </motion.div>
      )}
    </div>
  );
}

export default AdminNutritionistDetail;
