'use client';

import React, { useReducer, useMemo, useCallback, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  AgendaHeader,
  AgendaTabs,
  NextAppointmentCard,
  AppointmentsList,
  ReminderSettings,
  PastAppointmentsList,
  AgendaStats,
  AppointmentDetailModal,
  BookingModal,
  CancellationConfirmModal,
} from '@/components/agenda';
import {
  agendaReducer,
  initialAgendaState,
  getNextAppointment,
  calculateAgendaStats,
} from '@/types/agenda';
import type { AgendaTab, Appointment, BookingFormData, ReminderSettings as ReminderSettingsType } from '@/types/agenda';
import {
  getUpcomingAppointments,
  getPastAppointments,
  bookAppointment,
  cancelAppointment as cancelAppointmentMock,
  modifyAppointment as modifyAppointmentMock,
  updateReminderSettings,
} from '@/data/mock-agenda';

export default function AgendaPage() {
  const [state, dispatch] = useReducer(agendaReducer, initialAgendaState);

  // Load appointments into state on mount (AGENDA-006)
  useEffect(() => {
    if (!state.appointmentsLoaded) {
      dispatch({
        type: 'SET_APPOINTMENTS',
        upcoming: getUpcomingAppointments(),
        past: getPastAppointments(),
      });
    }
  }, [state.appointmentsLoaded]);

  // Get appointments from state
  const { upcomingAppointments, pastAppointments } = state;

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
  const handleConfirmCancellation = useCallback((appointment: Appointment) => {
    // Update mock data store
    cancelAppointmentMock(appointment.id);
    // Update local state immediately
    dispatch({ type: 'CANCEL_APPOINTMENT', appointmentId: appointment.id });
    dispatch({ type: 'CLOSE_CANCELLATION_MODAL' });
  }, []);

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

  const handleBookingSubmit = useCallback((formData: BookingFormData) => {
    dispatch({ type: 'SET_BOOKING_SUBMITTING', isSubmitting: true });
    const isEditMode = state.editingAppointment !== null;

    // Simulate API call
    setTimeout(() => {
      if (isEditMode && state.editingAppointment) {
        // AGENDA-007: Modify existing appointment
        const updatedAppointment = modifyAppointmentMock(state.editingAppointment.id, formData);
        if (updatedAppointment) {
          dispatch({ type: 'UPDATE_APPOINTMENT', appointment: updatedAppointment });
          alert('Rendez-vous modifié ! Votre nutritionniste sera notifié du changement.');
        } else {
          dispatch({
            type: 'SET_BOOKING_ERROR',
            error: 'Une erreur est survenue lors de la modification.',
          });
          dispatch({ type: 'SET_BOOKING_SUBMITTING', isSubmitting: false });
        }
      } else {
        // New booking
        const newAppointment = bookAppointment(formData);
        if (newAppointment) {
          // Add new appointment to state immediately (AGENDA-006)
          dispatch({ type: 'ADD_APPOINTMENT', appointment: newAppointment });
          dispatch({ type: 'CLOSE_BOOKING_MODAL' });
          alert('Rendez-vous confirmé ! Vous recevrez un email de confirmation.');
        } else {
          dispatch({
            type: 'SET_BOOKING_ERROR',
            error: 'Une erreur est survenue lors de la réservation.',
          });
          dispatch({ type: 'SET_BOOKING_SUBMITTING', isSubmitting: false });
        }
      }
    }, 1000);
  }, [state.editingAppointment]);

  // Render tab content
  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'upcoming':
        return (
          <div className="space-y-6">
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
          <div className="space-y-6">
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard Header - Bonjour + Notifications */}
      <DashboardHeader />

      {/* Agenda Header - Title + Booking button */}
      <AgendaHeader onBookAppointment={handleOpenBooking} />

      {/* Tabs */}
      <AgendaTabs activeTab={state.activeTab} onTabChange={handleTabChange} />

      {/* Main content */}
      <main className="px-8 py-6">{renderTabContent()}</main>

      {/* Booking Modal */}
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
    </div>
  );
}
