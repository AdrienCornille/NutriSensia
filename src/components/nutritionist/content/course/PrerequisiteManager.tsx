'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Lock, Loader2, BookOpen } from 'lucide-react';
import {
  useCoursePrerequisites,
  useAddPrerequisite,
  useRemovePrerequisite,
} from '@/hooks/useCourseBuilder';

interface PrerequisiteManagerProps {
  courseId: string;
}

interface AvailableCourse {
  id: string;
  title: string;
}

export function PrerequisiteManager({ courseId }: PrerequisiteManagerProps) {
  const { data: prerequisites, isLoading } = useCoursePrerequisites(courseId);
  const addMutation = useAddPrerequisite();
  const removeMutation = useRemovePrerequisite();

  const [showAdd, setShowAdd] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>(
    []
  );
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [requireCompletion, setRequireCompletion] = useState(true);
  const [requireQuizScore, setRequireQuizScore] = useState(false);
  const [minQuizScore, setMinQuizScore] = useState(70);

  useEffect(() => {
    if (!showAdd) return;
    setLoadingCourses(true);
    fetch('/api/protected/nutritionist/content?type=course&status=published', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(json => {
        const courses = (json.data || []).filter(
          (c: AvailableCourse) => c.id !== courseId
        );
        setAvailableCourses(courses);
      })
      .catch(() => setAvailableCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [showAdd, courseId]);

  const filteredCourses = availableCourses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const existingIds = new Set(
    (prerequisites || []).map((p: any) => p.prerequisite_course_id)
  );

  const handleAdd = () => {
    if (!selectedCourseId) return;
    addMutation.mutate(
      {
        courseId,
        data: {
          prerequisite_course_id: selectedCourseId,
          require_completion: requireCompletion,
          require_quiz_score: requireQuizScore,
          min_quiz_score: requireQuizScore ? minQuizScore : undefined,
        },
      },
      {
        onSuccess: () => {
          setSelectedCourseId('');
          setRequireCompletion(true);
          setRequireQuizScore(false);
          setMinQuizScore(70);
          setShowAdd(false);
        },
      }
    );
  };

  const handleRemove = (prerequisiteCourseId: string) => {
    removeMutation.mutate({ courseId, prerequisiteCourseId });
  };

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='w-6 h-6 border-2 border-[#1B998B] border-t-transparent rounded-full animate-spin' />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-5'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Lock className='w-5 h-5 text-primary' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Pr&eacute;requis du cours
          </h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className='flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors'
        >
          <Plus className='w-4 h-4' />
          Ajouter un pr&eacute;requis
        </button>
      </div>

      {/* Current prerequisites list */}
      {!prerequisites || prerequisites.length === 0 ? (
        <div className='text-center py-8 text-gray-500 text-sm'>
          <BookOpen className='w-8 h-8 mx-auto mb-2 text-gray-300' />
          Aucun pr&eacute;requis configur&eacute;. Ce cours sera accessible
          &agrave; tous les patients.
        </div>
      ) : (
        <div className='divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden'>
          {prerequisites.map((prereq: any) => (
            <div
              key={prereq.prerequisite_course_id}
              className='flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-50 transition-colors'
            >
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {prereq.prerequisite_course_title ||
                    prereq.prerequisite_course_id}
                </p>
                <div className='flex items-center gap-3 mt-1'>
                  {prereq.require_completion && (
                    <span className='inline-flex items-center text-xs text-[#1B998B] bg-[#1B998B]/10 px-2 py-0.5 rounded-full'>
                      Compl&eacute;tion 100%
                    </span>
                  )}
                  {prereq.require_quiz_score && (
                    <span className='inline-flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full'>
                      Score quizz &ge; {prereq.min_quiz_score}%
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemove(prereq.prerequisite_course_id)}
                disabled={removeMutation.isPending}
                className='ml-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add prerequisite form */}
      {showAdd && (
        <div className='border border-[#1B998B]/20 rounded-lg p-4 bg-[#1B998B]/5 space-y-4'>
          <h4 className='text-sm font-semibold text-gray-800'>
            Ajouter un pr&eacute;requis
          </h4>

          {/* Course search/select */}
          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              S&eacute;lectionner un cours
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Rechercher un cours...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
              />
            </div>
            {loadingCourses ? (
              <div className='flex items-center justify-center py-4'>
                <Loader2 className='w-4 h-4 animate-spin text-gray-400' />
              </div>
            ) : (
              <div className='mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100'>
                {filteredCourses.length === 0 ? (
                  <p className='text-sm text-gray-400 px-3 py-3 text-center'>
                    Aucun cours disponible
                  </p>
                ) : (
                  filteredCourses.map(course => {
                    const alreadyAdded = existingIds.has(course.id);
                    return (
                      <button
                        key={course.id}
                        disabled={alreadyAdded}
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          alreadyAdded
                            ? 'text-gray-300 cursor-not-allowed'
                            : selectedCourseId === course.id
                              ? 'bg-[#1B998B]/10 text-[#1B998B] font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {course.title}
                        {alreadyAdded && (
                          <span className='ml-2 text-xs text-gray-400'>
                            (d&eacute;j&agrave; ajout&eacute;)
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Conditions */}
          <div className='space-y-3'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={requireCompletion}
                onChange={e => setRequireCompletion(e.target.checked)}
                className='w-4 h-4 rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
              />
              <span className='text-sm text-gray-700'>
                Exiger la compl&eacute;tion &agrave; 100%
              </span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={requireQuizScore}
                onChange={e => setRequireQuizScore(e.target.checked)}
                className='w-4 h-4 rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
              />
              <span className='text-sm text-gray-700'>
                Exiger un score minimum au quizz final
              </span>
            </label>
            {requireQuizScore && (
              <div className='ml-6'>
                <label className='block text-xs text-gray-500 mb-1'>
                  Score minimum (%)
                </label>
                <input
                  type='number'
                  min={0}
                  max={100}
                  value={minQuizScore}
                  onChange={e => setMinQuizScore(Number(e.target.value))}
                  className='w-24 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B998B]/30 focus:border-[#1B998B]'
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='flex items-center gap-2 pt-1'>
            <button
              onClick={handleAdd}
              disabled={!selectedCourseId || addMutation.isPending}
              className='flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {addMutation.isPending && (
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
              )}
              Ajouter
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setSelectedCourseId('');
                setSearchTerm('');
              }}
              className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors'
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
