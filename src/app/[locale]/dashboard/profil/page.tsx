'use client';

import React, { useReducer } from 'react';
import {
  ProfileHeader,
  ProfileTabs,
  ProfileSection,
  SecuritySection,
  NotificationsSection,
  IntegrationsSection,
  PreferencesSection,
  DataSection,
  BadgesSection,
  EditFieldModal,
  PasswordModal,
  TwoFactorModal,
  ExportDataModal,
  DeleteAccountModal,
} from '@/components/profile';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { profileReducer, type EditableField, type UserPreferences, type EmailNotificationSettings, type PushNotificationSettings } from '@/types/profile';
import { getInitialProfileState } from '@/data/mock-profile';

export default function ProfilePage() {
  const [state, dispatch] = useReducer(profileReducer, undefined, getInitialProfileState);

  // Navigation handlers
  const handleSectionChange = (section: typeof state.activeSection) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  };

  // Profile section handlers
  const handleEditField = (field: EditableField) => {
    dispatch({ type: 'OPEN_EDIT_MODAL', payload: field });
  };

  const handleSaveField = (key: string, value: string) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { [key]: value } });
  };

  const handleChangePhoto = () => {
    // TODO: Implement photo upload
    console.log('Change photo clicked');
  };

  const handleRemovePhoto = () => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { avatar: null } });
  };

  // Security section handlers
  const handleChangePassword = () => {
    dispatch({ type: 'OPEN_PASSWORD_MODAL' });
  };

  const handleSavePassword = (currentPassword: string, newPassword: string) => {
    // TODO: Implement password change with backend
    console.log('Password changed');
    dispatch({
      type: 'UPDATE_SECURITY_SETTINGS',
      payload: { lastPasswordChange: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
    });
  };

  const handleEnable2FA = () => {
    dispatch({ type: 'OPEN_2FA_MODAL' });
  };

  const handleActivate2FA = (code: string) => {
    // TODO: Implement 2FA activation with backend
    console.log('2FA activated with code:', code);
    dispatch({ type: 'UPDATE_SECURITY_SETTINGS', payload: { twoFactorEnabled: true } });
  };

  const handleDisconnectSession = (sessionId: string) => {
    dispatch({ type: 'DISCONNECT_SESSION', payload: sessionId });
  };

  // Notifications section handlers
  const handleToggleEmail = (key: keyof EmailNotificationSettings) => {
    dispatch({ type: 'TOGGLE_EMAIL_NOTIFICATION', payload: key });
  };

  const handleTogglePush = (key: keyof PushNotificationSettings) => {
    dispatch({ type: 'TOGGLE_PUSH_NOTIFICATION', payload: key });
  };

  const handleToggleQuietHours = () => {
    dispatch({
      type: 'UPDATE_QUIET_HOURS',
      payload: { enabled: !state.notificationSettings.quietHours.enabled },
    });
  };

  const handleUpdateQuietHours = (startTime?: string, endTime?: string) => {
    dispatch({
      type: 'UPDATE_QUIET_HOURS',
      payload: {
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      },
    });
  };

  // Integrations section handlers
  const handleConnectDevice = (deviceId: string) => {
    // TODO: Implement OAuth connection
    dispatch({ type: 'CONNECT_DEVICE', payload: deviceId });
  };

  const handleDisconnectDevice = (deviceId: string) => {
    dispatch({ type: 'DISCONNECT_DEVICE', payload: deviceId });
  };

  const handleSyncDevice = (deviceId: string) => {
    // TODO: Implement sync with backend
    console.log('Syncing device:', deviceId);
  };

  // Preferences section handlers
  const handleUpdatePreferences = (key: keyof UserPreferences, value: string) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: { [key]: value } });
  };

  // Data section handlers
  const handleExportData = () => {
    dispatch({ type: 'OPEN_EXPORT_MODAL' });
  };

  const handleRequestExport = (categories: string[]) => {
    // TODO: Implement export request with backend
    console.log('Export requested for categories:', categories);
  };

  const handleDeleteAccount = () => {
    dispatch({ type: 'OPEN_DELETE_MODAL' });
  };

  const handleConfirmDelete = () => {
    // TODO: Implement account deletion with backend
    console.log('Account deletion confirmed');
  };

  // Render active section content
  const renderContent = () => {
    switch (state.activeSection) {
      case 'profile':
        return (
          <ProfileSection
            userProfile={state.userProfile}
            onEditField={handleEditField}
            onChangePhoto={handleChangePhoto}
            onRemovePhoto={handleRemovePhoto}
          />
        );
      case 'security':
        return (
          <SecuritySection
            securitySettings={state.securitySettings}
            activeSessions={state.activeSessions}
            onChangePassword={handleChangePassword}
            onEnable2FA={handleEnable2FA}
            onDisconnectSession={handleDisconnectSession}
          />
        );
      case 'notifications':
        return (
          <NotificationsSection
            notificationSettings={state.notificationSettings}
            onToggleEmail={handleToggleEmail}
            onTogglePush={handleTogglePush}
            onToggleQuietHours={handleToggleQuietHours}
            onUpdateQuietHours={handleUpdateQuietHours}
          />
        );
      case 'integrations':
        return (
          <IntegrationsSection
            connectedDevices={state.connectedDevices}
            onConnectDevice={handleConnectDevice}
            onDisconnectDevice={handleDisconnectDevice}
            onSyncDevice={handleSyncDevice}
          />
        );
      case 'preferences':
        return (
          <PreferencesSection
            preferences={state.preferences}
            onUpdatePreferences={handleUpdatePreferences}
          />
        );
      case 'data':
        return (
          <DataSection
            dataStats={state.dataStats}
            onExportData={handleExportData}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      case 'badges':
        return <BadgesSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <ProfileHeader userProfile={state.userProfile} />

      <ProfileTabs
        activeSection={state.activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Content */}
      <div className="p-6">{renderContent()}</div>

      {/* Modals */}
      <EditFieldModal
        isOpen={state.modals.showEditModal}
        field={state.modals.editField}
        onClose={() => dispatch({ type: 'CLOSE_EDIT_MODAL' })}
        onSave={handleSaveField}
      />

      <PasswordModal
        isOpen={state.modals.showPasswordModal}
        onClose={() => dispatch({ type: 'CLOSE_PASSWORD_MODAL' })}
        onSave={handleSavePassword}
      />

      <TwoFactorModal
        isOpen={state.modals.show2FAModal}
        onClose={() => dispatch({ type: 'CLOSE_2FA_MODAL' })}
        onActivate={handleActivate2FA}
      />

      <ExportDataModal
        isOpen={state.modals.showExportModal}
        onClose={() => dispatch({ type: 'CLOSE_EXPORT_MODAL' })}
        onExport={handleRequestExport}
      />

      <DeleteAccountModal
        isOpen={state.modals.showDeleteModal}
        onClose={() => dispatch({ type: 'CLOSE_DELETE_MODAL' })}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
