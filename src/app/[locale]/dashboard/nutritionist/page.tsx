'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import {
  Users,
  Calendar,
  Clock,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export default function NutritionistDashboardPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-8 py-6'>
        <h1 className='text-2xl font-semibold text-gray-800'>
          Dashboard Nutritionniste
        </h1>
        <p className='text-gray-500 mt-1'>
          Bienvenue sur votre espace professionnel
        </p>
      </header>

      {/* Main content */}
      <main className='px-8 py-6'>
        {/* Quick stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl p-6 border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Patients actifs</p>
                <p className='text-2xl font-semibold text-gray-800 mt-1'>--</p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Users className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>RDV cette semaine</p>
                <p className='text-2xl font-semibold text-gray-800 mt-1'>--</p>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Messages non lus</p>
                <p className='text-2xl font-semibold text-gray-800 mt-1'>--</p>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                <MessageSquare className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Prochaine dispo</p>
                <p className='text-2xl font-semibold text-gray-800 mt-1'>--</p>
              </div>
              <div className='w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center'>
                <Clock className='w-6 h-6 text-amber-600' />
              </div>
            </div>
          </div>
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
