'use client';

import React, { useReducer, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  DossierHeader,
  DossierTabs,
  AnamneseHeader,
  AnamneseReadOnlyAlert,
  AnamneseSectionList,
  SignalChangeCard,
  QuestionnairesList,
  QuestionnairesInfo,
  DocumentUploadZone,
  DocumentsList,
  DocumentModal,
  ConsultationsTimeline,
  PrivateNotesInfo,
  ObjectivesOverview,
  ObjectivesList,
} from '@/components/dossier';
import {
  dossierReducer,
  initialDossierState,
  calculateGlobalProgress,
} from '@/types/dossier';
import type {
  DossierTab,
  AnamneseSectionId,
  PatientDocument,
  DocumentCategory,
  Objective,
  ObjectiveCategory as DossierObjCategory,
  ObjectiveStatus,
} from '@/types/dossier';
import {
  getAnamneseData,
  getQuestionnairesData,
  getDocumentsData,
  getConsultationsData,
} from '@/data/mock-dossier';
import { useWeeklyObjectives } from '@/hooks/useObjectives';

/**
 * Transforme les objectifs hebdomadaires API en format Dossier (Objective[])
 */
function mapApiCategoryToDossier(category: string): DossierObjCategory {
  switch (category) {
    case 'nutrition':
    case 'tracking':
      return 'Habitude';
    case 'hydration':
      return 'Habitude';
    case 'activity':
      return 'Comportement';
    case 'recipes':
      return 'Habitude';
    default:
      return 'Comportement';
  }
}

function mapProgressToStatus(progress: number): ObjectiveStatus {
  if (progress >= 70) return 'on-track';
  if (progress >= 40) return 'in-progress';
  return 'needs-attention';
}

export default function DossierPage() {
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(dossierReducer, initialDossierState);

  // Handle tab query parameter from URL (e.g., from Agenda link)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam &&
      [
        'anamnese',
        'questionnaires',
        'documents',
        'consultations',
        'objectifs',
      ].includes(tabParam)
    ) {
      dispatch({ type: 'SET_TAB', tab: tabParam as DossierTab });
    }
  }, [searchParams]);

  // Load mock data (anamnese, questionnaires, documents, consultations)
  const anamneseData = getAnamneseData();
  const questionnaires = getQuestionnairesData();
  const documents = getDocumentsData();
  const consultations = getConsultationsData();

  // FILE-006: Objectifs depuis l'API
  const { data: weeklyObjectivesData, isLoading: objectivesLoading } =
    useWeeklyObjectives();

  // Transformer les objectifs API en format Dossier
  const objectives: Objective[] = useMemo(() => {
    if (!weeklyObjectivesData?.objectives?.length) return [];

    return weeklyObjectivesData.objectives.map(obj => ({
      id: obj.id,
      title: obj.label,
      category: mapApiCategoryToDossier(obj.category),
      target: `${obj.target} ${obj.unit}`,
      current: `${obj.current} ${obj.unit}`,
      startValue: `0 ${obj.unit}`,
      progress: obj.progress,
      deadline: weeklyObjectivesData.week_end
        ? new Date(weeklyObjectivesData.week_end).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : null,
      status: obj.isCompleted ? 'on-track' as ObjectiveStatus : mapProgressToStatus(obj.progress),
    }));
  }, [weeklyObjectivesData]);

  // Calculate global progress for objectives
  const globalProgress = calculateGlobalProgress(objectives);

  // Handlers
  const handleTabChange = (tab: DossierTab) => {
    dispatch({ type: 'SET_TAB', tab });
  };

  const handleSectionToggle = (sectionId: AnamneseSectionId) => {
    dispatch({ type: 'TOGGLE_SECTION', section: sectionId });
  };

  const handleDocumentClick = (document: PatientDocument) => {
    dispatch({ type: 'OPEN_DOCUMENT_MODAL', document });
  };

  const handleCloseModal = () => {
    dispatch({ type: 'CLOSE_DOCUMENT_MODAL' });
  };

  const handleFilterChange = (filter: DocumentCategory | 'all') => {
    dispatch({ type: 'SET_DOCUMENT_FILTER', filter });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export du dossier en cours de développement');
  };

  const handleSignalChange = () => {
    // TODO: Implement signal change functionality
    alert('Fonctionnalité de signalement en cours de développement');
  };

  const handleUpload = (files: FileList) => {
    // TODO: Implement upload functionality
    console.log('Files to upload:', files);
    alert(
      `${files.length} fichier(s) sélectionné(s) - Upload en cours de développement`
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'anamnese':
        return (
          <div className='space-y-6'>
            <AnamneseHeader data={anamneseData} />
            <AnamneseReadOnlyAlert />
            <AnamneseSectionList
              sections={anamneseData.sections}
              expandedSection={state.expandedSection}
              onToggleSection={handleSectionToggle}
            />
            <SignalChangeCard onSignalChange={handleSignalChange} />
          </div>
        );

      case 'questionnaires':
        return (
          <div className='space-y-6'>
            <QuestionnairesInfo />
            <QuestionnairesList questionnaires={questionnaires} />
          </div>
        );

      case 'documents':
        return (
          <div className='space-y-6'>
            <DocumentUploadZone onUpload={handleUpload} />
            <DocumentsList
              documents={documents}
              filter={state.documentFilter}
              onFilterChange={handleFilterChange}
              onDocumentClick={handleDocumentClick}
            />
            <DocumentModal
              isOpen={state.showDocumentModal}
              document={state.selectedDocument}
              onClose={handleCloseModal}
              nutritionistName={anamneseData.nutritionist}
            />
          </div>
        );

      case 'consultations':
        return (
          <div className='space-y-6'>
            <PrivateNotesInfo />
            <ConsultationsTimeline consultations={consultations} />
          </div>
        );

      case 'objectifs':
        return (
          <div className='space-y-6'>
            {objectivesLoading ? (
              <div className='animate-pulse space-y-4'>
                <div className='h-24 bg-gray-200 rounded-xl' />
                <div className='h-32 bg-gray-100 rounded-xl' />
                <div className='h-32 bg-gray-100 rounded-xl' />
              </div>
            ) : objectives.length > 0 ? (
              <>
                <ObjectivesOverview globalProgress={globalProgress} />
                <ObjectivesList objectives={objectives} />
              </>
            ) : (
              <div className='text-center py-12'>
                <p className='text-gray-500'>
                  Aucun objectif défini pour cette semaine.
                </p>
                <p className='text-sm text-gray-400 mt-1'>
                  Votre nutritionniste peut vous définir des objectifs personnalisés.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen'>
      {/* Dashboard Header - Bonjour + Notifications */}
      <DashboardHeader />

      {/* Dossier Header - Title + Export button */}
      <DossierHeader onExport={handleExport} />

      {/* Tabs */}
      <DossierTabs activeTab={state.activeTab} onTabChange={handleTabChange} />

      {/* Main content */}
      <div className='px-8 py-6'>{renderTabContent()}</div>
    </div>
  );
}
