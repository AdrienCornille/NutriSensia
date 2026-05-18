'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Circle, Lock } from 'lucide-react';

interface ChapterViewProps {
  chapter: {
    id: string;
    chapter_number: number;
    title: string;
    sections: {
      id: string;
      title: string;
      order_index: number;
      is_locked?: boolean;
    }[];
  };
  progress: Map<string, boolean>;
  onSectionClick: (sectionId: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

export default function ChapterView({
  chapter,
  progress,
  onSectionClick,
  expanded,
  onToggle,
}: ChapterViewProps) {
  const sections = chapter.sections || [];
  const completedCount = sections.filter(s => progress.get(s.id)).length;
  const totalCount = sections.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  return (
    <div className='overflow-hidden rounded-xl border border-gray-200 bg-white'>
      {/* Header */}
      <button
        onClick={onToggle}
        className='flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50'
      >
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            allDone ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {allDone ? (
            <CheckCircle2 className='h-5 w-5' />
          ) : (
            chapter.chapter_number
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <p className='font-semibold text-gray-900'>{chapter.title}</p>
          <p className='text-sm text-gray-500'>
            {completedCount}/{totalCount} sections terminées
          </p>
        </div>

        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Sections list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='border-t border-gray-100 px-5 py-2'>
              {sections.map(section => {
                const completed = progress.get(section.id);
                const locked = section.is_locked;

                return (
                  <button
                    key={section.id}
                    onClick={() => !locked && onSectionClick(section.id)}
                    disabled={locked}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                      locked
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {locked ? (
                      <Lock className='h-5 w-5 flex-shrink-0 text-gray-300' />
                    ) : completed ? (
                      <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-primary' />
                    ) : (
                      <Circle className='h-5 w-5 flex-shrink-0 text-gray-300' />
                    )}
                    <span
                      className={`text-sm ${
                        completed
                          ? 'font-medium text-gray-900'
                          : 'text-gray-600'
                      }`}
                    >
                      {section.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
