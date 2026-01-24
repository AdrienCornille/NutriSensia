// ==================== TYPES ====================
export type ProfileSection = 'profile' | 'security' | 'notifications' | 'integrations' | 'preferences' | 'data' | 'badges';

export type AppearanceMode = 'light' | 'dark' | 'system';
export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ft';
export type LiquidUnit = 'L' | 'oz';
export type FirstDayOfWeek = 'monday' | 'sunday';
export type Language = 'fr' | 'de' | 'it' | 'en';

export type DeviceStatus = 'connected' | 'disconnected';
export type SessionDevice = 'desktop' | 'mobile' | 'tablet';

// ==================== INTERFACES ====================
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  address: string;
  avatar: string | null;
  avatarInitials: string;
  memberSince: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
}

export interface ActiveSession {
  id: string;
  device: SessionDevice;
  deviceName: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface EmailNotificationSettings {
  appointments: boolean;
  messages: boolean;
  weeklyReport: boolean;
  newContent: boolean;
  marketing: boolean;
}

export interface PushNotificationSettings {
  appointments: boolean;
  messages: boolean;
  mealReminders: boolean;
  hydrationReminders: boolean;
  weightReminders: boolean;
  streakAlerts: boolean;
}

export interface QuietHoursSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  quietHours: QuietHoursSettings;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  icon: string;
  status: DeviceStatus;
  lastSync: string | null;
  dataTypes: string[];
}

export interface UserPreferences {
  language: Language;
  timezone: string;
  firstDayOfWeek: FirstDayOfWeek;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  liquidUnit: LiquidUnit;
  appearance: AppearanceMode;
}

export interface DataStats {
  totalMeals: number;
  totalWeightEntries: number;
  totalMessages: number;
  accountCreated: string;
}

export interface EditableField {
  key: string;
  label: string;
  value: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

// ==================== STATE ====================
export interface ProfileState {
  activeSection: ProfileSection;
  userProfile: UserProfile;
  securitySettings: SecuritySettings;
  activeSessions: ActiveSession[];
  notificationSettings: NotificationSettings;
  connectedDevices: ConnectedDevice[];
  preferences: UserPreferences;
  dataStats: DataStats;
  modals: {
    showEditModal: boolean;
    editField: EditableField | null;
    showPasswordModal: boolean;
    show2FAModal: boolean;
    showExportModal: boolean;
    showDeleteModal: boolean;
  };
  isLoading: boolean;
  error: string | null;
}

// ==================== ACTIONS ====================
export type ProfileAction =
  | { type: 'SET_ACTIVE_SECTION'; payload: ProfileSection }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_SECURITY_SETTINGS'; payload: Partial<SecuritySettings> }
  | { type: 'TOGGLE_EMAIL_NOTIFICATION'; payload: keyof EmailNotificationSettings }
  | { type: 'TOGGLE_PUSH_NOTIFICATION'; payload: keyof PushNotificationSettings }
  | { type: 'UPDATE_QUIET_HOURS'; payload: Partial<QuietHoursSettings> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'CONNECT_DEVICE'; payload: string }
  | { type: 'DISCONNECT_DEVICE'; payload: string }
  | { type: 'DISCONNECT_SESSION'; payload: string }
  | { type: 'OPEN_EDIT_MODAL'; payload: EditableField }
  | { type: 'CLOSE_EDIT_MODAL' }
  | { type: 'OPEN_PASSWORD_MODAL' }
  | { type: 'CLOSE_PASSWORD_MODAL' }
  | { type: 'OPEN_2FA_MODAL' }
  | { type: 'CLOSE_2FA_MODAL' }
  | { type: 'OPEN_EXPORT_MODAL' }
  | { type: 'CLOSE_EXPORT_MODAL' }
  | { type: 'OPEN_DELETE_MODAL' }
  | { type: 'CLOSE_DELETE_MODAL' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// ==================== REDUCER ====================
export function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };

    case 'UPDATE_PROFILE':
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };

    case 'UPDATE_SECURITY_SETTINGS':
      return { ...state, securitySettings: { ...state.securitySettings, ...action.payload } };

    case 'TOGGLE_EMAIL_NOTIFICATION':
      return {
        ...state,
        notificationSettings: {
          ...state.notificationSettings,
          email: {
            ...state.notificationSettings.email,
            [action.payload]: !state.notificationSettings.email[action.payload],
          },
        },
      };

    case 'TOGGLE_PUSH_NOTIFICATION':
      return {
        ...state,
        notificationSettings: {
          ...state.notificationSettings,
          push: {
            ...state.notificationSettings.push,
            [action.payload]: !state.notificationSettings.push[action.payload],
          },
        },
      };

    case 'UPDATE_QUIET_HOURS':
      return {
        ...state,
        notificationSettings: {
          ...state.notificationSettings,
          quietHours: { ...state.notificationSettings.quietHours, ...action.payload },
        },
      };

    case 'UPDATE_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };

    case 'CONNECT_DEVICE':
      return {
        ...state,
        connectedDevices: state.connectedDevices.map((device) =>
          device.id === action.payload
            ? { ...device, status: 'connected' as DeviceStatus, lastSync: 'Maintenant' }
            : device
        ),
      };

    case 'DISCONNECT_DEVICE':
      return {
        ...state,
        connectedDevices: state.connectedDevices.map((device) =>
          device.id === action.payload
            ? { ...device, status: 'disconnected' as DeviceStatus, lastSync: null, dataTypes: [] }
            : device
        ),
      };

    case 'DISCONNECT_SESSION':
      return {
        ...state,
        activeSessions: state.activeSessions.filter((session) => session.id !== action.payload),
      };

    case 'OPEN_EDIT_MODAL':
      return { ...state, modals: { ...state.modals, showEditModal: true, editField: action.payload } };

    case 'CLOSE_EDIT_MODAL':
      return { ...state, modals: { ...state.modals, showEditModal: false, editField: null } };

    case 'OPEN_PASSWORD_MODAL':
      return { ...state, modals: { ...state.modals, showPasswordModal: true } };

    case 'CLOSE_PASSWORD_MODAL':
      return { ...state, modals: { ...state.modals, showPasswordModal: false } };

    case 'OPEN_2FA_MODAL':
      return { ...state, modals: { ...state.modals, show2FAModal: true } };

    case 'CLOSE_2FA_MODAL':
      return { ...state, modals: { ...state.modals, show2FAModal: false } };

    case 'OPEN_EXPORT_MODAL':
      return { ...state, modals: { ...state.modals, showExportModal: true } };

    case 'CLOSE_EXPORT_MODAL':
      return { ...state, modals: { ...state.modals, showExportModal: false } };

    case 'OPEN_DELETE_MODAL':
      return { ...state, modals: { ...state.modals, showDeleteModal: true } };

    case 'CLOSE_DELETE_MODAL':
      return { ...state, modals: { ...state.modals, showDeleteModal: false } };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// ==================== CONFIGURATIONS ====================
export const sectionConfig: { id: ProfileSection; label: string; icon: string }[] = [
  { id: 'profile', label: 'Informations personnelles', icon: '👤' },
  { id: 'security', label: 'Sécurité', icon: '🔒' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'integrations', label: 'Appareils connectés', icon: '📱' },
  { id: 'preferences', label: 'Préférences', icon: '⚙️' },
  { id: 'data', label: 'Mes données', icon: '📊' },
];

export const languageOptions: { value: Language; label: string; flag: string }[] = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

export const timezoneOptions = [
  { value: 'Europe/Zurich', label: 'Europe/Zurich (UTC+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
];

export const firstDayOptions: { value: FirstDayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Lundi' },
  { value: 'sunday', label: 'Dimanche' },
];

export const weightUnitOptions: { value: WeightUnit; label: string }[] = [
  { value: 'kg', label: 'Kilogrammes (kg)' },
  { value: 'lb', label: 'Livres (lb)' },
];

export const heightUnitOptions: { value: HeightUnit; label: string }[] = [
  { value: 'cm', label: 'Centimètres (cm)' },
  { value: 'ft', label: 'Pieds / Pouces' },
];

export const liquidUnitOptions: { value: LiquidUnit; label: string }[] = [
  { value: 'L', label: 'Litres (L)' },
  { value: 'oz', label: 'Onces (oz)' },
];

export const appearanceOptions: { value: AppearanceMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Clair', icon: '☀️' },
  { value: 'dark', label: 'Sombre', icon: '🌙' },
  { value: 'system', label: 'Système', icon: '💻' },
];

export const exportDataCategories = [
  { id: 'personal', label: 'Informations personnelles' },
  { id: 'meals', label: 'Historique des repas' },
  { id: 'tracking', label: 'Données de suivi' },
  { id: 'messages', label: 'Messages' },
  { id: 'documents', label: 'Documents' },
];

export const quietHoursOptions = [
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00',
  '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
];
