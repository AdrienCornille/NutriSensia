'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Bookmark,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Eye,
} from 'lucide-react';
import type { Content } from '@/types/content';

interface VideoPlayerModalProps {
  isOpen: boolean;
  content: Content | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (contentId: string) => void;
}

export function VideoPlayerModal({
  isOpen,
  content,
  isSaved,
  onClose,
  onToggleSave,
}: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(33); // Mock progress

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !content) return null;

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className='fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4'>
      <div className='max-w-4xl w-full'>
        {/* Header */}
        <div className='flex justify-between items-start mb-4'>
          <div>
            <h2 className='text-xl font-bold text-white'>{content.title}</h2>
            <p className='text-gray-400 mt-1'>
              {content.duration} • Par {content.author}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-white/10 rounded-lg text-white'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Video player placeholder */}
        <div className='bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden'>
          <div className='text-center'>
            <button
              onClick={togglePlay}
              className='w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/20 transition-colors'
            >
              {isPlaying ? (
                <Pause className='w-10 h-10 text-white' />
              ) : (
                <Play className='w-10 h-10 text-white ml-2' />
              )}
            </button>
            <p className='text-white'>
              {isPlaying ? 'Lecture en cours...' : 'Cliquez pour lire la vidéo'}
            </p>
          </div>

          {/* Video controls */}
          <div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent'>
            <div className='flex items-center gap-4'>
              <button
                onClick={togglePlay}
                className='text-white hover:text-[#1B998B] transition-colors'
              >
                {isPlaying ? (
                  <Pause className='w-5 h-5' />
                ) : (
                  <Play className='w-5 h-5' />
                )}
              </button>

              {/* Progress bar */}
              <div className='flex-1 h-1 bg-white/30 rounded-full cursor-pointer group'>
                <div
                  className='h-full bg-[#1B998B] rounded-full relative'
                  style={{ width: `${progress}%` }}
                >
                  <div className='absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity' />
                </div>
              </div>

              <span className='text-white text-sm whitespace-nowrap'>
                6:12 / 18:00
              </span>

              <button
                onClick={toggleMute}
                className='text-white hover:text-[#1B998B] transition-colors'
              >
                {isMuted ? (
                  <VolumeX className='w-5 h-5' />
                ) : (
                  <Volume2 className='w-5 h-5' />
                )}
              </button>

              <button className='text-white hover:text-[#1B998B] transition-colors'>
                <Maximize className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>

        {/* Video info */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => onToggleSave(content.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isSaved
                  ? 'bg-[#1B998B] text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
              />
              {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
            </button>
            <button className='px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2'>
              <Share2 className='w-4 h-4' />
              Partager
            </button>
          </div>
          {content.views && (
            <span className='text-gray-400 text-sm flex items-center gap-1'>
              <Eye className='w-4 h-4' />
              {content.views.toLocaleString()} vues
            </span>
          )}
        </div>

        {/* Description */}
        <div className='mt-6 p-4 bg-white/5 rounded-xl'>
          <p className='text-gray-300'>{content.description}</p>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerModal;
