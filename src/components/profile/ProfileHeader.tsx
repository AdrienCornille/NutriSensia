'use client';

import React from 'react';
import type { UserProfile } from '@/types/profile';

interface ProfileHeaderProps {
  userProfile: UserProfile;
}

export function ProfileHeader({ userProfile }: ProfileHeaderProps) {
  return (
    <div className="bg-white px-4 py-6 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-[#1B998B] rounded-full flex items-center justify-center text-white font-bold text-2xl">
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
          <h1 className="text-2xl font-bold text-gray-900">
            {userProfile.firstName} {userProfile.lastName}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez votre compte et vos préférences
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
