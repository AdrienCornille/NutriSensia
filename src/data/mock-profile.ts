import type {
  UserProfile,
  SecuritySettings,
  ActiveSession,
  NotificationSettings,
  ConnectedDevice,
  UserPreferences,
  DataStats,
  ProfileState,
} from '@/types/profile';

// ==================== USER PROFILE ====================
export const mockUserProfile: UserProfile = {
  id: 'user-1',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@email.ch',
  phone: '+41 79 123 45 67',
  birthDate: '12 mars 1988',
  gender: 'Masculin',
  address: 'Rue de la Gare 15, 2000 Neuchâtel',
  avatar: null,
  avatarInitials: 'JD',
  memberSince: 'Décembre 2025',
};

// ==================== SECURITY ====================
export const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  lastPasswordChange: '15 décembre 2025',
};

export const mockActiveSessions: ActiveSession[] = [
  {
    id: 'session-1',
    device: 'desktop',
    deviceName: 'MacBook Pro',
    browser: 'Chrome',
    location: 'Neuchâtel',
    lastActive: 'Actif maintenant',
    isCurrent: true,
  },
  {
    id: 'session-2',
    device: 'mobile',
    deviceName: 'iPhone 14',
    browser: 'Safari',
    location: 'Neuchâtel',
    lastActive: 'Il y a 3 heures',
    isCurrent: false,
  },
];

// ==================== NOTIFICATIONS ====================
export const mockNotificationSettings: NotificationSettings = {
  email: {
    appointments: true,
    messages: true,
    weeklyReport: true,
    newContent: false,
    marketing: false,
  },
  push: {
    appointments: true,
    messages: true,
    mealReminders: true,
    hydrationReminders: true,
    weightReminders: false,
    streakAlerts: true,
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
  },
};

// ==================== CONNECTED DEVICES ====================
export const mockConnectedDevices: ConnectedDevice[] = [
  {
    id: 'device-1',
    name: 'Apple Health',
    icon: '🍎',
    status: 'connected',
    lastSync: 'Il y a 2 heures',
    dataTypes: ['Activité', 'Sommeil'],
  },
  {
    id: 'device-2',
    name: 'Withings Scale',
    icon: '⚖️',
    status: 'connected',
    lastSync: 'Il y a 1 jour',
    dataTypes: ['Poids', 'Masse grasse'],
  },
  {
    id: 'device-3',
    name: 'Google Fit',
    icon: '🏃',
    status: 'disconnected',
    lastSync: null,
    dataTypes: [],
  },
  {
    id: 'device-4',
    name: 'Fitbit',
    icon: '⌚',
    status: 'disconnected',
    lastSync: null,
    dataTypes: [],
  },
];

// ==================== PREFERENCES ====================
export const mockPreferences: UserPreferences = {
  language: 'fr',
  timezone: 'Europe/Zurich',
  firstDayOfWeek: 'monday',
  weightUnit: 'kg',
  heightUnit: 'cm',
  liquidUnit: 'L',
  appearance: 'light',
};

// ==================== DATA STATS ====================
export const mockDataStats: DataStats = {
  totalMeals: 156,
  totalWeightEntries: 24,
  totalMessages: 32,
  accountCreated: '15 décembre 2025',
};

// ==================== INITIAL STATE ====================
export const getInitialProfileState = (): ProfileState => ({
  activeSection: 'profile',
  userProfile: mockUserProfile,
  securitySettings: mockSecuritySettings,
  activeSessions: mockActiveSessions,
  notificationSettings: mockNotificationSettings,
  connectedDevices: mockConnectedDevices,
  preferences: mockPreferences,
  dataStats: mockDataStats,
  modals: {
    showEditModal: false,
    editField: null,
    showPasswordModal: false,
    show2FAModal: false,
    showExportModal: false,
    showDeleteModal: false,
  },
  isLoading: false,
  error: null,
});

// ==================== HELPER FUNCTIONS ====================
export function getDeviceIcon(device: 'desktop' | 'mobile' | 'tablet'): string {
  switch (device) {
    case 'desktop':
      return '💻';
    case 'mobile':
      return '📱';
    case 'tablet':
      return '📱';
    default:
      return '💻';
  }
}

export function getProfileFields(profile: UserProfile) {
  return [
    { key: 'firstName', label: 'Prénom', value: profile.firstName },
    { key: 'lastName', label: 'Nom', value: profile.lastName },
    { key: 'email', label: 'Email', value: profile.email, type: 'email' as const },
    { key: 'phone', label: 'Téléphone', value: profile.phone, type: 'tel' as const },
    { key: 'birthDate', label: 'Date de naissance', value: profile.birthDate },
    { key: 'gender', label: 'Sexe', value: profile.gender },
    { key: 'address', label: 'Adresse', value: profile.address },
  ];
}

export function getEmailNotificationLabels(): Record<keyof NotificationSettings['email'], string> {
  return {
    appointments: 'Rappels de rendez-vous',
    messages: 'Nouveaux messages',
    weeklyReport: 'Rapport hebdomadaire',
    newContent: 'Nouveau contenu exclusif',
    marketing: 'Actualités NutriSensia',
  };
}

export function getPushNotificationLabels(): Record<keyof NotificationSettings['push'], string> {
  return {
    appointments: 'Rappels de rendez-vous',
    messages: 'Nouveaux messages',
    mealReminders: 'Rappels de repas',
    hydrationReminders: "Rappels d'hydratation",
    weightReminders: 'Rappels de pesée',
    streakAlerts: 'Alertes de streak',
  };
}
