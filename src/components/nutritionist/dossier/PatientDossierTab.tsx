'use client';

import React, { useState } from 'react';
import {
  ClipboardList,
  FileText,
  FolderOpen,
  Calendar,
  Target,
  Loader2,
  Download,
} from 'lucide-react';
import { useDossierSummary } from '@/hooks/useNutritionistDossier';
import { NutritionistAnamneseView } from './anamnese/NutritionistAnamneseView';
import { NutritionistDocumentsView } from './documents/NutritionistDocumentsView';
import { NutritionistObjectivesView } from './objectives/NutritionistObjectivesView';
import { NutritionistQuestionnairesView } from './questionnaires/NutritionistQuestionnairesView';
import { ExportDossierModal } from './export/ExportDossierModal';
import { ConsultationsTab } from './consultations';
import type { DossierTab } from '@/types/dossier';

interface PatientDossierTabProps {
  patientId: string;
  patientName?: string;
  patientFirstName?: string;
  patientLastName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientConsultationReason?: string;
}

const dossierSubTabs: {
  id: DossierTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'anamnese', label: 'Anamnèse', icon: ClipboardList },
  { id: 'questionnaires', label: 'Questionnaires', icon: FileText },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
  { id: 'consultations', label: 'Consultations', icon: Calendar },
  { id: 'objectifs', label: 'Objectifs', icon: Target },
];


export function PatientDossierTab({
  patientId,
  patientName,
  patientFirstName,
  patientLastName,
  patientEmail,
  patientPhone,
  patientConsultationReason,
}: PatientDossierTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<DossierTab>('anamnese');
  const [showExportModal, setShowExportModal] = useState(false);
  const { data: summary, isLoading: summaryLoading } =
    useDossierSummary(patientId);

  return (
    <div className='space-y-6'>
      {/* Summary cards + Export button */}
      <div className='flex items-start gap-4'>
        <div className='flex-1 grid grid-cols-2 md:grid-cols-5 gap-4'>
          <SummaryCard
            label='Anamnèse'
            value={summary?.anamnesis_status || '—'}
            isLoading={summaryLoading}
            isStatus
          />
          <SummaryCard
            label='Questionnaires'
            value={
              summary
                ? `${summary.completed_questionnaires}/${summary.completed_questionnaires + summary.pending_questionnaires}`
                : '—'
            }
            isLoading={summaryLoading}
          />
          <SummaryCard
            label='Documents'
            value={summary?.total_documents?.toString() || '0'}
            isLoading={summaryLoading}
          />
          <SummaryCard
            label='Consultations'
            value={summary?.total_consultations?.toString() || '0'}
            isLoading={summaryLoading}
          />
          <SummaryCard
            label='Objectifs actifs'
            value={
              summary
                ? `${summary.objectives_on_track}/${summary.active_objectives}`
                : '—'
            }
            isLoading={summaryLoading}
          />
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className='flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
          title='Exporter le dossier'
        >
          <Download className='w-4 h-4' />
          Export
        </button>
      </div>

      {/* Sub-tab navigation */}
      <div className='flex gap-1 bg-white border border-gray-200 p-1 rounded-xl'>
        {dossierSubTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1B998B]/10 text-[#1B998B]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className='w-4 h-4' />
              {tab.label}
              {tab.id === 'questionnaires' &&
                summary &&
                summary.pending_questionnaires > 0 && (
                  <span className='ml-1 px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700'>
                    {summary.pending_questionnaires}
                  </span>
                )}
              {tab.id === 'anamnese' &&
                summary &&
                summary.pending_changes > 0 && (
                  <span className='ml-1 px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700'>
                    {summary.pending_changes}
                  </span>
                )}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      {activeSubTab === 'anamnese' && (
        <NutritionistAnamneseView
          patientId={patientId}
          patientFirstName={patientFirstName}
          patientLastName={patientLastName}
          patientEmail={patientEmail}
          patientPhone={patientPhone}
          patientConsultationReason={patientConsultationReason}
        />
      )}
      {activeSubTab === 'questionnaires' && (
        <NutritionistQuestionnairesView patientId={patientId} />
      )}
      {activeSubTab === 'documents' && (
        <NutritionistDocumentsView patientId={patientId} />
      )}
      {activeSubTab === 'consultations' && (
        <ConsultationsTab
          patientId={patientId}
          patientName={patientName || 'Patient'}
        />
      )}
      {activeSubTab === 'objectifs' && (
        <NutritionistObjectivesView patientId={patientId} />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportDossierModal
          patientId={patientId}
          patientName={patientName || 'patient'}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function SummaryCard({
  label,
  value,
  isLoading,
  isStatus,
}: {
  label: string;
  value: string;
  isLoading: boolean;
  isStatus?: boolean;
}) {
  const statusMap: Record<string, { label: string; color: string }> = {
    completed: { label: 'Complétée', color: 'text-green-600' },
    draft: { label: 'Brouillon', color: 'text-amber-600' },
    pending: { label: 'En attente', color: 'text-blue-600' },
  };

  const displayValue =
    isStatus && statusMap[value] ? statusMap[value].label : value;
  const textColor =
    isStatus && statusMap[value] ? statusMap[value].color : 'text-gray-800';

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-4'>
      <p className='text-xs text-gray-500 mb-1'>{label}</p>
      {isLoading ? (
        <Loader2 className='w-4 h-4 animate-spin text-gray-300' />
      ) : (
        <p className={`text-lg font-semibold ${textColor}`}>{displayValue}</p>
      )}
    </div>
  );
}
