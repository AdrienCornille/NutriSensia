'use client';

import React from 'react';
import type { ProfileSection, UserProfile } from '@/types/profile';
import { sectionConfig } from '@/types/profile';

interface ProfileSidebarProps {
  userProfile: UserProfile;
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
}

export function ProfileSidebar({
  userProfile,
  activeSection,
  onSectionChange,
}: ProfileSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
        {/* User info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1B998B] rounded-full flex items-center justify-center text-white font-medium text-lg">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={`${userProfile.firstName} ${userProfile.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                userProfile.avatarInitials
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {userProfile.firstName} {userProfile.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Patient depuis {userProfile.memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {sectionConfig.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-[#1B998B]/10 text-[#1B998B]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{section.icon}</span>
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default ProfileSidebar;
