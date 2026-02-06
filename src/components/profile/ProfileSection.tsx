'use client';

import React from 'react';
import type { UserProfile, EditableField } from '@/types/profile';
import { getProfileFields } from '@/data/mock-profile';

interface ProfileSectionProps {
  userProfile: UserProfile;
  onEditField: (field: EditableField) => void;
  onChangePhoto: () => void;
  onRemovePhoto: () => void;
}

export function ProfileSection({
  userProfile,
  onEditField,
  onChangePhoto,
  onRemovePhoto,
}: ProfileSectionProps) {
  const fields = getProfileFields(userProfile);

  return (
    <div className='space-y-6'>
      {/* Photo de profil */}
      <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
        <h2 className='font-semibold text-gray-800 mb-4'>Photo de profil</h2>
        <div className='flex items-center gap-6'>
          <div className='w-24 h-24 bg-[#1B998B] rounded-full flex items-center justify-center text-white font-bold text-3xl'>
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={`${userProfile.firstName} ${userProfile.lastName}`}
                className='w-full h-full rounded-full object-cover'
              />
            ) : (
              userProfile.avatarInitials
            )}
          </div>
          <div>
            <div className='flex gap-3'>
              <button
                onClick={onChangePhoto}
                className='px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
              >
                Changer la photo
              </button>
              <button
                onClick={onRemovePhoto}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Supprimer
              </button>
            </div>
            <p className='text-sm text-gray-500 mt-2'>
              JPG, PNG ou GIF. Max 2 Mo.
            </p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
        <h2 className='font-semibold text-gray-800 mb-4'>
          Informations personnelles
        </h2>
        <div className='space-y-4'>
          {fields.map(field => (
            <div
              key={field.key}
              className='flex items-center justify-between py-3 border-b border-gray-100 last:border-0'
            >
              <div>
                <p className='text-sm text-gray-500'>{field.label}</p>
                <p className='font-medium text-gray-800'>{field.value}</p>
              </div>
              <button
                onClick={() => onEditField(field)}
                className='px-3 py-1 text-[#1B998B] hover:bg-[#1B998B]/10 rounded-lg text-sm font-medium transition-colors'
              >
                Modifier
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfileSection;
