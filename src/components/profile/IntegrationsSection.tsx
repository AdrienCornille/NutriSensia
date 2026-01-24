'use client';

import React from 'react';
import type { ConnectedDevice } from '@/types/profile';

interface IntegrationsSectionProps {
  connectedDevices: ConnectedDevice[];
  onConnectDevice: (deviceId: string) => void;
  onDisconnectDevice: (deviceId: string) => void;
  onSyncDevice: (deviceId: string) => void;
}

export function IntegrationsSection({
  connectedDevices,
  onConnectDevice,
  onDisconnectDevice,
  onSyncDevice,
}: IntegrationsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Connected devices */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-2">Appareils et applications connectés</h2>
        <p className="text-sm text-gray-500 mb-6">
          Synchronisez automatiquement vos données de santé
        </p>
        <div className="space-y-4">
          {connectedDevices.map((device) => (
            <div
              key={device.id}
              className={`p-4 rounded-xl border ${
                device.status === 'connected'
                  ? 'border-[#1B998B]/30 bg-[#1B998B]/5'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      device.status === 'connected' ? 'bg-[#1B998B]/20' : 'bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{device.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{device.name}</p>
                    {device.status === 'connected' ? (
                      <div>
                        <p className="text-sm text-[#1B998B]">
                          ✓ Connecté • Synchro: {device.lastSync}
                        </p>
                        {device.dataTypes.length > 0 && (
                          <div className="flex gap-2 mt-1">
                            {device.dataTypes.map((type) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 bg-[#1B998B]/10 text-[#1B998B] text-xs rounded-full"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Non connecté</p>
                    )}
                  </div>
                </div>
                {device.status === 'connected' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSyncDevice(device.id)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      🔄 Synchro
                    </button>
                    <button
                      onClick={() => onDisconnectDevice(device.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
                    >
                      Déconnecter
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onConnectDevice(device.id)}
                    className="px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors"
                  >
                    Connecter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-800">Pourquoi connecter vos appareils ?</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>• Synchronisation automatique du poids</li>
              <li>• Import des activités sportives</li>
              <li>• Suivi du sommeil</li>
              <li>• Données plus complètes pour votre nutritionniste</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntegrationsSection;
