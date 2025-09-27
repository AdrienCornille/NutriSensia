/**
 * Types TypeScript pour les analytics d'onboarding
 */

// Types de base pour les événements
export type OnboardingRole = 'nutritionist' | 'patient' | 'admin';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type BrowserType = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Other' | 'unknown';

// Types d'événements d'onboarding
export type OnboardingEventType = 
  | 'Onboarding Started'
  | 'Onboarding Step Started'
  | 'Onboarding Step Completed'
  | 'Onboarding Step Skipped'
  | 'Onboarding Step Error'
  | 'Onboarding Help Requested'
  | 'Onboarding Completed'
  | 'Onboarding Abandoned'
  | 'Onboarding Page View';

// Types d'erreurs
export type OnboardingErrorType = 
  | 'validation_error'
  | 'network_error'
  | 'server_error'
  | 'timeout_error'
  | 'unknown_error';

// Types d'aide
export type HelpType = 
  | 'tooltip'
  | 'help_text'
  | 'video_tutorial'
  | 'contact_support'
  | 'faq'
  | 'documentation';

// Interface de base pour les événements d'onboarding
export interface BaseOnboardingEvent {
  event: OnboardingEventType;
  properties: {
    userId?: string;
    role?: OnboardingRole;
    step?: string;
    stepNumber?: number;
    totalSteps?: number;
    completionPercentage?: number;
    timeSpent?: number;
    sessionId?: string;
    deviceType?: DeviceType;
    browser?: BrowserType;
    timestamp?: string;
    [key: string]: any;
  };
}

// Événements spécifiques
export interface OnboardingStartedEvent extends BaseOnboardingEvent {
  event: 'Onboarding Started';
  properties: BaseOnboardingEvent['properties'] & {
    role: OnboardingRole;
  };
}

export interface OnboardingStepStartedEvent extends BaseOnboardingEvent {
  event: 'Onboarding Step Started';
  properties: BaseOnboardingEvent['properties'] & {
    step: string;
    stepNumber: number;
    totalSteps: number;
    role: OnboardingRole;
  };
}

export interface OnboardingStepCompletedEvent extends BaseOnboardingEvent {
  event: 'Onboarding Step Completed';
  properties: BaseOnboardingEvent['properties'] & {
    step: string;
    stepNumber: number;
    totalSteps: number;
    role: OnboardingRole;
    completionPercentage: number;
    timeSpent: number;
  };
}

export interface OnboardingStepSkippedEvent extends BaseOnboardingEvent {
  event: 'Onboarding Step Skipped';
  properties: BaseOnboardingEvent['properties'] & {
    step: string;
    stepNumber: number;
    totalSteps: number;
    role: OnboardingRole;
    skipped: true;
    reason?: string;
    timeSpent: number;
  };
}

export interface OnboardingStepErrorEvent extends BaseOnboardingEvent {
  event: 'Onboarding Step Error';
  properties: BaseOnboardingEvent['properties'] & {
    step: string;
    stepNumber: number;
    role: OnboardingRole;
    errorType: OnboardingErrorType;
    errorMessage?: string;
  };
}

export interface OnboardingHelpRequestedEvent extends BaseOnboardingEvent {
  event: 'Onboarding Help Requested';
  properties: BaseOnboardingEvent['properties'] & {
    step: string;
    stepNumber: number;
    role: OnboardingRole;
    helpRequested: true;
    helpType: HelpType;
  };
}

export interface OnboardingCompletedEvent extends BaseOnboardingEvent {
  event: 'Onboarding Completed';
  properties: BaseOnboardingEvent['properties'] & {
    role: OnboardingRole;
    totalSteps: number;
    completionPercentage: 100;
    timeSpent: number;
  };
}

export interface OnboardingAbandonedEvent extends BaseOnboardingEvent {
  event: 'Onboarding Abandoned';
  properties: BaseOnboardingEvent['properties'] & {
    step: string;
    stepNumber: number;
    role: OnboardingRole;
    timeSpent: number;
    reason?: string;
  };
}

// Union de tous les événements
export type OnboardingEvent = 
  | OnboardingStartedEvent
  | OnboardingStepStartedEvent
  | OnboardingStepCompletedEvent
  | OnboardingStepSkippedEvent
  | OnboardingStepErrorEvent
  | OnboardingHelpRequestedEvent
  | OnboardingCompletedEvent
  | OnboardingAbandonedEvent;

// Types pour les métriques
export interface OnboardingMetrics {
  totalUsers: number;
  completionRate: number;
  averageTimeToComplete: number;
  dropOffPoints: DropOffPoint[];
  errorRates: ErrorRate[];
  helpRequests: HelpRequest[];
  stepCompletionRates: StepCompletionRate[];
  timeToCompleteByRole: TimeToCompleteByRole[];
}

export interface DropOffPoint {
  step: string;
  stepNumber: number;
  dropOffRate: number;
  usersDropped: number;
  totalUsers: number;
}

export interface ErrorRate {
  step: string;
  stepNumber: number;
  errorType: OnboardingErrorType;
  errorRate: number;
  errorCount: number;
  totalAttempts: number;
}

export interface HelpRequest {
  step: string;
  stepNumber: number;
  helpType: HelpType;
  requestCount: number;
  uniqueUsers: number;
}

export interface StepCompletionRate {
  step: string;
  stepNumber: number;
  completionRate: number;
  averageTimeSpent: number;
  skipRate: number;
}

export interface TimeToCompleteByRole {
  role: OnboardingRole;
  averageTime: number;
  medianTime: number;
  completionRate: number;
  totalUsers: number;
}

// Types pour les filtres et requêtes
export interface OnboardingAnalyticsFilter {
  startDate?: string;
  endDate?: string;
  role?: OnboardingRole;
  step?: string;
  deviceType?: DeviceType;
  browser?: BrowserType;
}

export interface OnboardingAnalyticsQuery {
  filter?: OnboardingAnalyticsFilter;
  groupBy?: ('role' | 'step' | 'deviceType' | 'browser' | 'date')[];
  limit?: number;
  offset?: number;
}

// Types pour les réponses API
export interface OnboardingAnalyticsResponse {
  metrics: OnboardingMetrics;
  events: OnboardingEvent[];
  totalEvents: number;
  hasMore: boolean;
}

// Types pour les tableaux de bord
export interface OnboardingDashboardData {
  overview: {
    totalUsers: number;
    completionRate: number;
    averageTimeToComplete: number;
    currentActiveUsers: number;
  };
  funnel: {
    step: string;
    stepNumber: number;
    usersEntered: number;
    usersCompleted: number;
    dropOffRate: number;
    averageTimeSpent: number;
  }[];
  errors: {
    step: string;
    errorType: OnboardingErrorType;
    count: number;
    rate: number;
  }[];
  helpRequests: {
    step: string;
    helpType: HelpType;
    count: number;
  }[];
  trends: {
    date: string;
    usersStarted: number;
    usersCompleted: number;
    completionRate: number;
  }[];
}

// Types pour les alertes
export interface OnboardingAlert {
  id: string;
  type: 'drop_off' | 'error_rate' | 'completion_rate' | 'help_requests';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  step?: string;
  threshold: number;
  currentValue: number;
  createdAt: string;
  isActive: boolean;
}

// Types pour les exports
export interface OnboardingDataExport {
  format: 'csv' | 'json' | 'xlsx';
  filter: OnboardingAnalyticsFilter;
  includeEvents: boolean;
  includeMetrics: boolean;
}

// Types pour les tests A/B
export interface OnboardingABTest {
  id: string;
  name: string;
  description: string;
  variants: OnboardingABTestVariant[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
  targetRole?: OnboardingRole;
  metrics: string[];
}

export interface OnboardingABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number; // 0-100
  configuration: Record<string, any>;
  results?: {
    users: number;
    completionRate: number;
    averageTime: number;
    conversionRate: number;
  };
}
