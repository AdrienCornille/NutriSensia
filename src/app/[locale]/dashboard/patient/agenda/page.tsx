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
  AppointmentDetailModal,
  BookingModal,
  BookingSuccessModal,
  CancellationConfirmModal,
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
  ReminderSettings as ReminderSettingsType,
} from '@/types/agenda';
// API Hooks
import {
  useUpcomingAppointments,
  usePastAppointments,
  useCancelledAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
} from '@/hooks/useAppointments';
// Transformers
import {
  transformAppointmentToUI,
  modeUItoAPI,
} from '@/lib/appointments-transformers';
// Mock for reminder settings only (not yet implemented in backend)
import { updateReminderSettings } from '@/data/mock-agenda';

export default function AgendaPage() {
  const [state, dispatch] = useReducer(agendaReducer, initialAgendaState);

  // State for success modal after booking
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAppointment, setCreatedAppointment] =
    useState<Appointment | null>(null);

  // ============================================================================
  // API QUERIES
  // ============================================================================
  const {
    data: upcomingData,
    isLoading: isLoadingUpcoming,
    error: upcomingError,
  } = useUpcomingAppointments(1, 50);

  const {
    data: pastData,
    isLoading: isLoadingPast,
    error: pastError,
  } = usePastAppointments(1, 50);

  const {
    data: cancelledData,
    isLoading: isLoadingCancelled,
    error: cancelledError,
  } = useCancelledAppointments(1, 50);

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
  const isLoading = isLoadingUpcoming || isLoadingPast || isLoadingCancelled;
  const hasError = upcomingError || pastError || cancelledError;

  // Handlers
  const handleTabChange = useCallback((tab: AgendaTab) => {
    dispatch({ type: 'SET_TAB', tab });
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
    async (appointment: Appointment) => {
      try {
        await cancelAppointmentMutation.mutateAsync({
          id: appointment.id,
          reason: 'Annulation par le patient',
        });
        // Update local state immediately
        dispatch({ type: 'CANCEL_APPOINTMENT', appointmentId: appointment.id });
        dispatch({ type: 'CLOSE_CANCELLATION_MODAL' });
        alert('Rendez-vous annulé avec succès.');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'annulation";
        alert(errorMessage);
      }
    },
    [cancelAppointmentMutation]
  );

  // AGENDA-008: Close cancellation modal
  const handleCloseCancellation = useCallback(() => {
    dispatch({ type: 'CLOSE_CANCELLATION_MODAL' });
  }, []);

  const handleReminderSettingsChange = useCallback(
    (settings: Partial<ReminderSettingsType>) => {
      updateReminderSettings(settings);
      dispatch({ type: 'UPDATE_REMINDER_SETTINGS', settings });
    },
    []
  );

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
          alert(
            'Rendez-vous modifié ! Votre nutritionniste sera notifié du changement.'
          );
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
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Une erreur est survenue';
        dispatch({
          type: 'SET_BOOKING_ERROR',
          error: errorMessage,
        });
        dispatch({ type: 'SET_BOOKING_SUBMITTING', isSubmitting: false });
      }
    },
    [
      state.editingAppointment,
      createAppointmentMutation,
      updateAppointmentMutation,
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
              cancelledError?.message}
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

            {/* Reminder settings */}
            <ReminderSettings
              settings={state.reminderSettings}
              onSettingChange={handleReminderSettingsChange}
            />
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
            {/* Cancelled appointments list */}
            <CancelledAppointmentsList
              appointments={cancelledAppointments}
              onAppointmentClick={handleAppointmentClick}
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
      />

      {/* AGENDA-008: Cancellation Confirm Modal */}
      <CancellationConfirmModal
        isOpen={state.showCancellationModal}
        appointment={state.selectedAppointment}
        onClose={handleCloseCancellation}
        onConfirm={handleConfirmCancellation}
      />

      {/* Booking Success Modal with calendar option */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        appointment={createdAppointment}
        onClose={handleCloseSuccessModal}
      />
    </div>
  );
}
