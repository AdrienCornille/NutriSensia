'use client';

import React, { useState } from 'react';
import { Users, UserPlus, X, Search, Loader2, CheckCircle } from 'lucide-react';
import {
  useContentAssignments,
  useAssignContent,
  useRemoveAssignment,
} from '@/hooks/useContentInteractions';

interface ContentAssignmentsProps {
  contentId: string;
  patients?: { id: string; firstName: string; lastName: string }[];
}

export function ContentAssignments({
  contentId,
  patients = [],
}: ContentAssignmentsProps) {
  const { data: assignments, isLoading } = useContentAssignments(contentId);
  const assignMutation = useAssignContent();
  const removeMutation = useRemoveAssignment();
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');

  const assignedPatientIds = new Set((assignments || []).map(a => a.patientId));

  const filteredPatients = patients.filter(
    p =>
      !assignedPatientIds.has(p.id) &&
      (!search ||
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

  const handleAssign = (patientId: string) => {
    assignMutation.mutate({
      contentId,
      patientIds: [patientId],
      note: note || undefined,
    });
    setNote('');
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
          <Users className='w-4 h-4 text-[#1B998B]' />
          Assigné à {(assignments || []).length} patient
          {(assignments || []).length > 1 ? 's' : ''}
        </h3>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className='flex items-center gap-1.5 text-xs text-[#1B998B] hover:underline'
        >
          <UserPlus className='w-3.5 h-3.5' />
          Assigner
        </button>
      </div>

      {/* Assigned patients list */}
      {(assignments || []).length > 0 ? (
        <div className='space-y-1.5'>
          {(assignments || []).map(assignment => (
            <div
              key={assignment.id}
              className='flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg'
            >
              <div className='w-8 h-8 rounded-full bg-[#1B998B]/10 flex items-center justify-center'>
                <span className='text-xs font-medium text-[#1B998B]'>
                  {(assignment.patientName || '?')[0].toUpperCase()}
                </span>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {assignment.patientName || 'Patient'}
                </p>
                {assignment.note && (
                  <p className='text-xs text-gray-400 truncate'>
                    {assignment.note}
                  </p>
                )}
              </div>
              <span className='text-xs text-gray-400'>
                {new Date(assignment.assignedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <button
                onClick={() =>
                  removeMutation.mutate({
                    contentId,
                    assignmentId: assignment.id,
                  })
                }
                className='p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-sm text-gray-400 text-center py-4'>
          Visible par tous vos patients. Assignez pour recommander
          spécifiquement.
        </p>
      )}

      {/* Patient picker */}
      {showPicker && (
        <div className='border border-gray-200 rounded-lg overflow-hidden'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Rechercher un patient...'
              className='w-full pl-9 pr-4 py-2.5 text-sm border-b border-gray-200 focus:outline-none'
              autoFocus
            />
          </div>
          {/* Optional note */}
          <div className='px-3 py-2 border-b border-gray-100'>
            <input
              type='text'
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder='Note (optionnel, ex: "À lire avant la prochaine consultation")'
              className='w-full text-xs text-gray-600 bg-transparent focus:outline-none'
            />
          </div>
          <div className='max-h-48 overflow-y-auto'>
            {filteredPatients.map(patient => (
              <button
                key={patient.id}
                onClick={() => handleAssign(patient.id)}
                disabled={assignMutation.isPending}
                className='flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left'
              >
                <div className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center'>
                  <span className='text-xs font-medium text-gray-500'>
                    {patient.firstName[0]}
                  </span>
                </div>
                <span className='truncate'>
                  {patient.firstName} {patient.lastName}
                </span>
              </button>
            ))}
            {filteredPatients.length === 0 && (
              <p className='px-3 py-4 text-sm text-gray-400 text-center'>
                {patients.length === 0
                  ? 'Aucun patient'
                  : 'Tous les patients sont déjà assignés'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
