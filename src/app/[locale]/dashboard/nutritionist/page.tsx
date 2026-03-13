'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import {
  Clock,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { ConsultationStatsSection } from '@/components/nutritionist/dashboard/ConsultationStatsSection';

export default function NutritionistDashboardPage() {
  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-8 h-[93px] flex items-center sticky top-0 z-10'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-800'>
            Dashboard Nutritionniste
          </h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Bienvenue sur votre espace professionnel
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className='px-8 py-6'>
        {/* Consultation Statistics (CONSULT-007) */}
        <div className='mb-8'>
          <ConsultationStatsSection />
        </div>

        {/* Quick actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Availability management */}
          <div className='bg-white rounded-xl p-6 border border-gray-200'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <h2 className='text-lg font-semibold text-gray-800'>
                  Gestion des disponibilites
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  Definissez vos plages horaires de travail
                </p>
              </div>
              <Clock className='w-8 h-8 text-[#1B998B]' />
            </div>
            <Link
              href='/dashboard/nutritionist/disponibilites'
              className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
            >
              Gerer mes disponibilites
              <ArrowRight className='w-4 h-4' />
            </Link>
          </div>

          {/* Upcoming appointments */}
          <div className='bg-white rounded-xl p-6 border border-gray-200'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <h2 className='text-lg font-semibold text-gray-800'>
                  Prochains rendez-vous
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  Consultez et gerez vos rendez-vous
                </p>
              </div>
              <Calendar className='w-8 h-8 text-[#1B998B]' />
            </div>
            <Link
              href='/dashboard/nutritionist/agenda'
              className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Voir mon agenda
              <ArrowRight className='w-4 h-4' />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
