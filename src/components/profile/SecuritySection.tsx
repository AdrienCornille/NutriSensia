'use client';

import React from 'react';
import type { SecuritySettings, ActiveSession } from '@/types/profile';
import { getDeviceIcon } from '@/data/mock-profile';

interface SecuritySectionProps {
  securitySettings: SecuritySettings;
  activeSessions: ActiveSession[];
  onChangePassword: () => void;
  onEnable2FA: () => void;
  onDisconnectSession: (sessionId: string) => void;
}

export function SecuritySection({
  securitySettings,
  activeSessions,
  onChangePassword,
  onEnable2FA,
  onDisconnectSession,
}: SecuritySectionProps) {
  return (
    <div className="space-y-6">
      {/* Mot de passe */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Mot de passe</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">Dernière modification</p>
            <p className="text-sm text-gray-500">{securitySettings.lastPasswordChange}</p>
          </div>
          <button
            onClick={onChangePassword}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Changer le mot de passe
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">
              Authentification à deux facteurs (2FA)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Ajoutez une couche de sécurité supplémentaire
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              securitySettings.twoFactorEnabled
                ? 'bg-[#1B998B]/10 text-[#1B998B]'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {securitySettings.twoFactorEnabled ? 'Activé' : 'Désactivé'}
          </span>
        </div>
        {!securitySettings.twoFactorEnabled && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-start gap-3">
              <span className="text-amber-500">⚠️</span>
              <p className="text-sm text-amber-700">
                Recommandé pour la sécurité de vos données de santé
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onEnable2FA}
          className="mt-4 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors"
        >
          {securitySettings.twoFactorEnabled ? 'Gérer la 2FA' : 'Activer la 2FA'}
        </button>
      </div>

      {/* Sessions actives */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Sessions actives</h2>
        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getDeviceIcon(session.device)}</span>
                <div>
                  <p className="font-medium text-gray-800">
                    {session.deviceName} - {session.browser}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>
              {session.isCurrent ? (
                <span className="px-2 py-1 bg-[#1B998B]/10 text-[#1B998B] text-xs rounded-full">
                  Session actuelle
                </span>
              ) : (
                <button
                  onClick={() => onDisconnectSession(session.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Déconnecter
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SecuritySection;
