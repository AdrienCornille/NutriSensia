'use client';

import React, { useReducer, useEffect } from 'react';
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
import type { DossierTab, AnamneseSectionId, PatientDocument, DocumentCategory } from '@/types/dossier';
import {
  getAnamneseData,
  getQuestionnairesData,
  getDocumentsData,
  getConsultationsData,
  getObjectivesData,
} from '@/data/mock-dossier';

export default function DossierPage() {
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(dossierReducer, initialDossierState);

  // Handle tab query parameter from URL (e.g., from Agenda link)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['anamnese', 'questionnaires', 'documents', 'consultations', 'objectifs'].includes(tabParam)) {
      dispatch({ type: 'SET_TAB', tab: tabParam as DossierTab });
    }
  }, [searchParams]);

  // Load mock data
  const anamneseData = getAnamneseData();
  const questionnaires = getQuestionnairesData();
  const documents = getDocumentsData();
  const consultations = getConsultationsData();
  const objectives = getObjectivesData();

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
    alert(`${files.length} fichier(s) sélectionné(s) - Upload en cours de développement`);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'anamnese':
        return (
          <div className="space-y-6">
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
          <div className="space-y-6">
            <QuestionnairesInfo />
            <QuestionnairesList questionnaires={questionnaires} />
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
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
          <div className="space-y-6">
            <PrivateNotesInfo />
            <ConsultationsTimeline consultations={consultations} />
          </div>
        );

      case 'objectifs':
        return (
          <div className="space-y-6">
            <ObjectivesOverview globalProgress={globalProgress} />
            <ObjectivesList objectives={objectives} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard Header - Bonjour + Notifications */}
      <DashboardHeader />

      {/* Dossier Header - Title + Export button */}
      <DossierHeader onExport={handleExport} />

      {/* Tabs */}
      <DossierTabs activeTab={state.activeTab} onTabChange={handleTabChange} />

      {/* Main content */}
      <div className="px-8 py-6">{renderTabContent()}</div>
    </div>
  );
}
