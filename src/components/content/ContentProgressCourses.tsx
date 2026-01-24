'use client';

import React from 'react';
import { GraduationCap, Play } from 'lucide-react';
import type { ProgressCourse } from '@/types/content';

interface ContentProgressCoursesProps {
  courses: ProgressCourse[];
  onContinue?: (courseId: string) => void;
}

export function ContentProgressCourses({ courses, onContinue }: ContentProgressCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <div className="px-8 py-6">
      <h2 className="font-semibold text-gray-800 mb-4">Continuer votre apprentissage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => {
          const progress = (course.completedModules / course.modules) * 100;

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1B998B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-7 h-7 text-[#1B998B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {course.completedModules} / {course.modules} modules complétés
                  </p>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1B998B] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => onContinue?.(course.id)}
                  className="px-4 py-2 bg-[#1B998B]/10 text-[#1B998B] font-medium rounded-lg hover:bg-[#1B998B]/20 transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <Play className="w-4 h-4" />
                  Continuer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContentProgressCourses;
