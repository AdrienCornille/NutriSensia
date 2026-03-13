'use client';

import React, {
  useReducer,
  useMemo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  AgendaHeader,
  AgendaTabs,
  NextAppointmentCard,
  AppointmentsList,
  ReminderSettings,
  PastAppointmentsList,
  AgendaStats,
  CancelledAppointmentsList,
  CancelledAppointmentItem,
  AppointmentDetailModal,
  BookingModal,
  BookingSuccessModal,
  CancellationConfirmModal,
  Pagination,
} from '@/components/agenda';
import {
  agendaReducer,
  initialAgendaState,
  getNextAppointment,
  calculateAgendaStats,
} from '@/types/agenda';
import type {
  AgendaTab,
  Appointment,
  BookingFormData,
} from '@/types/agenda';
// API Hooks
import {
  useUpcomingAppointments,
  usePastAppointments,
  useCancelledAppointments,
  useNoShowAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
} from '@/hooks/useAppointments';
// Transformers
import {
  transformAppointmentToUI,
  modeUItoAPI,
} from '@/lib/appointments-transformers';
import { Toast, type ToastType } from '@/components/suivi/shared/Toast';

export default function AgendaPage() {
  const [state, dispatch] = useReducer(agendaReducer, initialAgendaState);

  // State for success modal after booking
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAppointment, setCreatedAppointment] =
    useState<Appointment | null>(null);

  // Pagination state
  const ITEMS_PER_PAGE = 10;
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [cancelledPage, setCancelledPage] = useState(1);
  const [noShowPage, setNoShowPage] = useState(1);

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
  }>({ visible: false, type: 'success', title: '' });

  const hideToast = useCallback(
    () => setToast(t => ({ ...t, visible: false })),
    []
  );

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      setToast({ visible: true, type, title, message });
    },
    []
  );

  // ============================================================================
  // API QUERIES
  // ============================================================================
  const {
    data: upcomingData,
    isLoading: isLoadingUpcoming,
    error: upcomingError,
  } = useUpcomingAppointments(upcomingPage, ITEMS_PER_PAGE);

  const {
    data: pastData,
    isLoading: isLoadingPast,
    error: pastError,
  } = usePastAppointments(pastPage, ITEMS_PER_PAGE);

  const {
    data: cancelledData,
    isLoading: isLoadingCancelled,
    error: cancelledError,
  } = useCancelledAppointments(cancelledPage, ITEMS_PER_PAGE);

  const {
    data: noShowData,
    isLoading: isLoadingNoShow,
    error: noShowError,
  } = useNoShowAppointments(noShowPage, ITEMS_PER_PAGE);

  // ============================================================================
  // API MUTATIONS
  // ============================================================================
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const cancelAppointmentMutation = useCancelAppointment();

  // ============================================================================
  // TRANSFORM API DATA TO UI FORMAT
  // ============================================================================
  const upcomingAppointments = useMemo(() => {
    if (!upcomingData?.appointments) return [];
    return upcomingData.appointments.map(transformAppointmentToUI);
  }, [upcomingData]);

  const pastAppointments = useMemo(() => {
    if (!pastData?.appointments) return [];
    return pastData.appointments.map(transformAppointmentToUI);
  }, [pastData]);

  const cancelledAppointments = useMemo(() => {
    if (!cancelledData?.appointments) return [];
    return cancelledData.appointments.map(transformAppointmentToUI);
  }, [cancelledData]);

  const noShowAppointments = useMemo(() => {
    if (!noShowData?.appointments) return [];
    return noShowData.appointments.map(transformAppointmentToUI);
  }, [noShowData]);

  // Patient gender from API response (for gendered labels)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patientGender: string | null = (cancelledData as any)?.patient_gender || (upcomingData as any)?.patient_gender || null;

  // Load appointments into reducer state for UI management (modals, selection)
  useEffect(() => {
    if (upcomingAppointments.length > 0 || pastAppointments.length > 0) {
      if (!state.appointmentsLoaded) {
        dispatch({
          type: 'SET_APPOINTMENTS',
          upcoming: upcomingAppointments,
          past: pastAppointments,
        });
      }
    }
  }, [upcomingAppointments, pastAppointments, state.appointmentsLoaded]);

  // Get next appointment
  const nextAppointment = useMemo(
    () => getNextAppointment(upcomingAppointments),
    [upcomingAppointments]
  );

  // Calculate stats
  const stats = useMemo(
    () => calculateAgendaStats(pastAppointments),
    [pastAppointments]
  );

  // Loading state
  const isLoading = isLoadingUpcoming || isLoadingPast || isLoadingCancelled || isLoadingNoShow;
  const hasError = upcomingError || pastError || cancelledError || noShowError;

  // Handlers
  const handleTabChange = useCallback((tab: AgendaTab) => {
    dispatch({ type: 'SET_TAB', tab });
    // Reset pagination to page 1 when switching tabs
    setUpcomingPage(1);
    setPastPage(1);
    setCancelledPage(1);
    setNoShowPage(1);
  }, []);

  const handleOpenBooking = useCallback(() => {
    dispatch({ type: 'OPEN_BOOKING_MODAL' });
  }, []);

  const handleCloseBooking = useCallback(() => {
    dispatch({ type: 'CLOSE_BOOKING_MODAL' });
  }, []);

  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    dispatch({ type: 'OPEN_DETAIL_MODAL', appointment });
  }, []);

  const handleCloseDetail = useCallback(() => {
    dispatch({ type: 'CLOSE_DETAIL_MODAL' });
  }, []);

  const handleJoinVisio = useCallback((visioLink: string) => {
    window.open(visioLink, '_blank');
  }, []);

  // AGENDA-007: Open modification flow
  const handleModifyAppointment = useCallback((appointment: Appointment) => {
    dispatch({ type: 'START_EDITING_APPOINTMENT', appointment });
  }, []);

  // AGENDA-008: Open cancellation modal
  const handleCancelAppointment = useCallback((appointment: Appointment) => {
    dispatch({ type: 'OPEN_CANCELLATION_MODAL', appointment });
  }, []);

  // AGENDA-008: Confirm cancellation
  const handleConfirmCancellation = useCallback(
    async (appointment: Appointment, reason?: string) => {
      try {
        await cancelAppointmentMutation.mutateAsync({
          id: appointment.id,
          reason: reason || 'Annulation par le patient',
        });
        // Update local state immediately
        dispatch({ type: 'CANCEL_APPOINTMENT', appointmentId: appointment.id });
        dispatch({ type: 'CLOSE_CANCELLATION_MODAL' });
        showToast('success', 'Rendez-vous annulé');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'annulation";
        showToast('error', 'Erreur', errorMessage);
      }
    },
    [cancelAppointmentMutation, showToast]
  );

  // AGENDA-008: Close cancellation modal
  const handleCloseCancellation = useCallback(() => {
    dispatch({ type: 'CLOSE_CANCELLATION_MODAL' });
  }, []);

  // Close success modal
  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    setCreatedAppointment(null);
  }, []);

  const handleBookingSubmit = useCallback(
    async (formData: BookingFormData) => {
      dispatch({ type: 'SET_BOOKING_SUBMITTING', isSubmitting: true });
      const isEditMode = state.editingAppointment !== null;

      // Validate required fields
      if (
        !formData.selectedDate ||
        !formData.selectedTime ||
        !formData.mode ||
        !formData.consultationTypeId
      ) {
        dispatch({
          type: 'SET_BOOKING_ERROR',
          error: 'Veuillez remplir tous les champs obligatoires',
        });
        dispatch({ type: 'SET_BOOKING_SUBMITTING', isSubmitting: false });
        return;
      }

      try {
        if (isEditMode && state.editingAppointment) {
          // AGENDA-007: Modify existing appointment via API
          const scheduledDate = new Date(formData.selectedDate);
          const [hours, minutes] = formData.selectedTime.split(':');
          scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const updateData: {
            scheduled_at?: string;
            mode?: 'visio' | 'cabinet' | 'phone';
            patient_notes?: string;
          } = {
            scheduled_at: scheduledDate.toISOString(),
            mode: modeUItoAPI(formData.mode),
          };

          if (formData.message) {
            updateData.patient_notes = formData.message;
          }

          await updateAppointmentMutation.mutateAsync({
            id: state.editingAppointment.id,
            data: updateData,
          });

          dispatch({ type: 'CLOSE_BOOKING_MODAL' });
          showToast('success', 'Rendez-vous modifié', 'Votre nutritionniste sera notifié du changement');
        } else {
          // New booking via API
          // Build scheduled_at from date and time
          const scheduledDate = new Date(formData.selectedDate);
          const [hours, minutes] = formData.selectedTime.split(':');
          scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const createData = {
            // nutritionist_id est optionnel - le backend utilise celui assigné au patient
            consultation_type_id: formData.consultationTypeId,
            scheduled_at: scheduledDate.toISOString(),
            mode: modeUItoAPI(formData.mode),
            patient_notes: formData.message || undefined,
          };

          const newAppointment =
            await createAppointmentMutation.mutateAsync(createData);

          // Transform and add to local state
          const transformedAppointment =
            transformAppointmentToUI(newAppointment);
          dispatch({
            type: 'ADD_APPOINTMENT',
            appointment: transformedAppointment,
          });
          dispatch({ type: 'CLOSE_BOOKING_MODAL' });

          // Show success modal with calendar option
          setCreatedAppointment(transformedAppointment);
          setShowSuccessModal(true);
          showToast('success', 'Rendez-vous réservé', 'Votre demande a été envoyée au nutritionniste');
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Une erreur est survenue';
        dispatch({
          type: 'SET_BOOKING_ERROR',
          error: errorMessage,
        });
        dispatch({ type: 'SET_BOOKING_SUBMITTING', isSubmitting: false });
        showToast('error', 'Erreur de réservation', errorMessage);
      }
    },
    [
      state.editingAppointment,
      createAppointmentMutation,
      updateAppointmentMutation,
      showToast,
    ]
  );

  // Render tab content
  const renderTabContent = () => {
    // Show loading state
    if (isLoading) {
      return (
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4'></div>
            <p className='text-gray-500'>Chargement de vos rendez-vous...</p>
          </div>
        </div>
      );
    }

    // Show error state
    if (hasError) {
      return (
        <div className='bg-red-50 border border-red-200 rounded-xl p-6 text-center'>
          <p className='text-red-600 font-medium'>
            Une erreur est survenue lors du chargement de vos rendez-vous.
          </p>
          <p className='text-red-500 text-sm mt-2'>
            {upcomingError?.message ||
              pastError?.message ||
              cancelledError?.message ||
              noShowError?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
          >
            Réessayer
          </button>
        </div>
      );
    }

    switch (state.activeTab) {
      case 'upcoming':
        return (
          <div className='space-y-6'>
            {/* Next appointment highlight */}
            {nextAppointment && (
              <NextAppointmentCard
                appointment={nextAppointment}
                onViewDetails={handleAppointmentClick}
                onJoinVisio={handleJoinVisio}
              />
            )}

            {/* Upcoming list */}
            <AppointmentsList
              appointments={upcomingAppointments}
              onAppointmentClick={handleAppointmentClick}
              onBookAppointment={handleOpenBooking}
            />

            <Pagination
              currentPage={upcomingPage}
              totalItems={upcomingData?.total || 0}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setUpcomingPage}
            />

            {/* Reminder Settings */}
            <ReminderSettings onShowToast={showToast} />
          </div>
        );

      case 'past':
        return (
          <div className='space-y-6'>
            {/* Past appointments list */}
            <PastAppointmentsList
              appointments={pastAppointments}
              onAppointmentClick={handleAppointmentClick}
            />

            <Pagination
              currentPage={pastPage}
              totalItems={pastData?.total || 0}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setPastPage}
            />

            {/* Stats */}
            <AgendaStats
              totalConsultations={stats.totalConsultations}
              firstConsultationDate={stats.firstConsultationDate}
              followUpDuration={stats.followUpDuration}
            />
          </div>
        );

      case 'cancelled':
        return (
          <div className='space-y-6'>
            <CancelledAppointmentsList
              appointments={cancelledAppointments}
              onAppointmentClick={handleAppointmentClick}
              patientGender={patientGender}
              title='Rendez-vous annulés'
              emptyMessage='Aucun rendez-vous annulé'
              emptyDescription='Les rendez-vous annulés apparaîtront ici'
            />

            <Pagination
              currentPage={cancelledPage}
              totalItems={cancelledData?.total || 0}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCancelledPage}
            />
          </div>
        );

      case 'no_show':
        return (
          <div className='space-y-6'>
            <CancelledAppointmentsList
              appointments={noShowAppointments}
              onAppointmentClick={handleAppointmentClick}
              patientGender={patientGender}
              title='Absences'
              emptyMessage='Aucune absence enregistrée'
              emptyDescription='Les rendez-vous marqués comme absence apparaîtront ici'
            />

            <Pagination
              currentPage={noShowPage}
              totalItems={noShowData?.total || 0}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setNoShowPage}
            />
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

      {/* Agenda Header - Title + Booking button */}
      <AgendaHeader onBookAppointment={handleOpenBooking} />

      {/* Tabs */}
      <AgendaTabs activeTab={state.activeTab} onTabChange={handleTabChange} />

      {/* Main content */}
      <main className='px-8 py-6'>{renderTabContent()}</main>

      {/* Booking Modal - nutritionistId is auto-fetched by the API from patient profile */}
      <BookingModal
        isOpen={state.showBookingModal}
        onClose={handleCloseBooking}
        bookingState={state.bookingState}
        currentMonth={state.currentMonth}
        dispatch={dispatch}
        onSubmit={handleBookingSubmit}
        editingAppointment={state.editingAppointment}
      />

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        isOpen={state.showDetailModal}
        appointment={state.selectedAppointment}
        onClose={handleCloseDetail}
        onJoinVisio={handleJoinVisio}
        onModify={handleModifyAppointment}
        onCancel={handleCancelAppointment}
        onRebook={handleOpenBooking}
        patientGender={patientGender}
        onShowToast={showToast}
      />

      {/* AGENDA-008: Cancellation Confirm Modal */}
      <CancellationConfirmModal
        isOpen={state.showCancellationModal}
        appointment={state.selectedAppointment}
        onClose={handleCloseCancellation}
        onConfirm={handleConfirmCancellation}
        isLoading={cancelAppointmentMutation.isPending}
      />

      {/* Booking Success Modal with calendar option */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        appointment={createdAppointment}
        onClose={handleCloseSuccessModal}
        onShowToast={showToast}
      />

      {/* Toast */}
      <Toast
        isVisible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
