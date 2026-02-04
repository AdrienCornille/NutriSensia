/**
 * Exports des composants de la page Agenda (Rendez-vous)
 */

// Main components
export { AgendaHeader } from './AgendaHeader';
export { AgendaTabs } from './AgendaTabs';

// Upcoming appointments components
export { NextAppointmentCard } from './appointments/NextAppointmentCard';
export { AppointmentItem } from './appointments/AppointmentItem';
export { AppointmentsList } from './appointments/AppointmentsList';
export { ReminderSettings } from './appointments/ReminderSettings';

// Past appointments components
export { PastAppointmentItem } from './past/PastAppointmentItem';
export { PastAppointmentsList } from './past/PastAppointmentsList';
export { AgendaStats } from './past/AgendaStats';

// Detail modal
export { AppointmentDetailModal } from './detail/AppointmentDetailModal';
export { CancellationConfirmModal } from './detail/CancellationConfirmModal';

// Booking modal components
export { BookingModal } from './booking/BookingModal';
export { BookingSuccessModal } from './booking/BookingSuccessModal';
export { BookingStepIndicator } from './booking/BookingStepIndicator';
export { BookingStepType } from './booking/BookingStepType';
export { BookingStepSlot } from './booking/BookingStepSlot';
export { BookingStepConfirm } from './booking/BookingStepConfirm';
export { ConsultationTypeCard } from './booking/ConsultationTypeCard';
export { CalendarPicker } from './booking/CalendarPicker';
export { TimeSlotGrid } from './booking/TimeSlotGrid';
