'use client';

import React from 'react';
import { GraduationCap, Play } from 'lucide-react';
import { EducationalContent } from '@/types/educational-content';

interface ContentProgressCoursesProps {
  courses: EducationalContent[];
  onContinue?: (courseId: string) => void;
}

export function ContentProgressCourses({
  courses,
  onContinue,
}: ContentProgressCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <div className='px-8 py-6'>
      <h2 className='font-semibold text-gray-800 mb-4'>Vos cours</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {courses.map(course => (
          <div
            key={course.id}
            className='bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow'
          >
            <div className='flex items-center gap-4'>
              <div className='w-14 h-14 bg-[#1B998B]/10 rounded-xl flex items-center justify-center flex-shrink-0'>
                <GraduationCap className='w-7 h-7 text-[#1B998B]' />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='font-medium text-gray-800 truncate'>
                  {course.title}
                </h3>
                {course.summary && (
                  <p className='text-sm text-gray-500 mt-0.5 truncate'>
                    {course.summary}
                  </p>
                )}
              </div>
              <button
                onClick={() => onContinue?.(course.id)}
                className='px-4 py-2 bg-[#1B998B]/10 text-[#1B998B] font-medium rounded-lg hover:bg-[#1B998B]/20 transition-colors flex items-center gap-2 flex-shrink-0'
              >
                <Play className='w-4 h-4' />
                Ouvrir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentProgressCourses;
