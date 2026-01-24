'use client';

import React from 'react';
import { User, Shield, Bell, Smartphone, Settings, Database, Award } from 'lucide-react';
import type { ProfileSection } from '@/types/profile';

interface ProfileTabsProps {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
}

const tabsConfig: { id: ProfileSection; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'badges', label: 'Badges', icon: Award },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Appareils', icon: Smartphone },
  { id: 'preferences', label: 'Préférences', icon: Settings },
  { id: 'data', label: 'Données', icon: Database },
];

export function ProfileTabs({ activeSection, onSectionChange }: ProfileTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProfileTabs;
