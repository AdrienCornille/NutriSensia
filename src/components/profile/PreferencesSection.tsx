'use client';

import React from 'react';
import type {
  UserPreferences,
  Language,
  WeightUnit,
  HeightUnit,
  LiquidUnit,
  FirstDayOfWeek,
  AppearanceMode,
} from '@/types/profile';
import {
  languageOptions,
  timezoneOptions,
  firstDayOptions,
  weightUnitOptions,
  heightUnitOptions,
  liquidUnitOptions,
  appearanceOptions,
} from '@/types/profile';

interface PreferencesSectionProps {
  preferences: UserPreferences;
  onUpdatePreferences: (key: keyof UserPreferences, value: string) => void;
}

export function PreferencesSection({
  preferences,
  onUpdatePreferences,
}: PreferencesSectionProps) {
  return (
    <div className='space-y-6'>
      {/* Language & Region */}
      <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
        <h2 className='font-semibold text-gray-800 mb-4'>Langue et région</h2>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm text-gray-500 mb-1'>Langue</label>
            <select
              value={preferences.language}
              onChange={e => onUpdatePreferences('language', e.target.value)}
              className='w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm text-gray-500 mb-1'>
              Fuseau horaire
            </label>
            <select
              value={preferences.timezone}
              onChange={e => onUpdatePreferences('timezone', e.target.value)}
              className='w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
            >
              {timezoneOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm text-gray-500 mb-1'>
              Premier jour de la semaine
            </label>
            <select
              value={preferences.firstDayOfWeek}
              onChange={e =>
                onUpdatePreferences('firstDayOfWeek', e.target.value)
              }
              className='w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
            >
              {firstDayOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Units */}
      <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
        <h2 className='font-semibold text-gray-800 mb-4'>Unités de mesure</h2>
        <div className='grid grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm text-gray-500 mb-1'>Poids</label>
            <select
              value={preferences.weightUnit}
              onChange={e => onUpdatePreferences('weightUnit', e.target.value)}
              className='w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
            >
              {weightUnitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm text-gray-500 mb-1'>Taille</label>
            <select
              value={preferences.heightUnit}
              onChange={e => onUpdatePreferences('heightUnit', e.target.value)}
              className='w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
            >
              {heightUnitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm text-gray-500 mb-1'>Liquides</label>
            <select
              value={preferences.liquidUnit}
              onChange={e => onUpdatePreferences('liquidUnit', e.target.value)}
              className='w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
            >
              {liquidUnitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
        <h2 className='font-semibold text-gray-800 mb-4'>Apparence</h2>
        <div className='flex gap-4'>
          {appearanceOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onUpdatePreferences('appearance', option.value)}
              className={`flex-1 p-4 rounded-xl border-2 text-center transition-colors ${
                preferences.appearance === option.value
                  ? 'border-[#1B998B] bg-[#1B998B]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className={`w-full h-16 rounded-lg mb-3 ${
                  option.value === 'light'
                    ? 'bg-white border border-gray-200'
                    : option.value === 'dark'
                      ? 'bg-gray-800'
                      : 'bg-gradient-to-b from-white to-gray-800'
                }`}
              />
              <p className='font-medium text-gray-800'>
                {option.icon} {option.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PreferencesSection;
