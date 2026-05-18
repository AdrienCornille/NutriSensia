'use client';

import { useState } from 'react';
import {
  Type,
  Video,
  FileText,
  ImageIcon,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUpdateBlock } from '@/hooks/useCourseBuilder';
import RichTextEditor from '../shared/RichTextEditor';

interface BlockEditorProps {
  courseId: string;
  chapterId: string;
  sectionId: string;
  block: any;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const BLOCK_CONFIG: Record<string, { icon: typeof Type; label: string }> = {
  rich_text: { icon: Type, label: 'Texte riche' },
  video: { icon: Video, label: 'Vidéo' },
  pdf: { icon: FileText, label: 'PDF' },
  image: { icon: ImageIcon, label: 'Image' },
};

const MEDIA_TYPES = ['youtube', 'vimeo', 'external'] as const;

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

// ─── Main BlockEditor ───

export default function BlockEditor({
  courseId,
  chapterId,
  sectionId,
  block,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: BlockEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const updateBlock = useUpdateBlock();

  const [body, setBody] = useState(block.body || '');
  const [mediaUrl, setMediaUrl] = useState(block.media_url || '');
  const [mediaType, setMediaType] = useState(block.media_type || 'youtube');
  const [fileUrl, setFileUrl] = useState(block.file_url || '');

  const config = BLOCK_CONFIG[block.block_type] || BLOCK_CONFIG.rich_text;
  const Icon = config.icon;

  function saveField(data: Record<string, any>) {
    updateBlock.mutate({
      courseId,
      chapterId,
      sectionId,
      blockId: block.id,
      data,
    });
  }

  function renderRichText() {
    return (
      <RichTextEditor
        content={body}
        onSave={html => {
          setBody(html);
          if (html !== (block.body || '')) {
            saveField({ body: html });
          }
        }}
        placeholder='Saisissez le contenu texte ici...'
        minHeight='120px'
      />
    );
  }

  function renderVideo() {
    const embedUrl =
      mediaType === 'youtube'
        ? getYouTubeEmbedUrl(mediaUrl)
        : mediaType === 'vimeo'
          ? getVimeoEmbedUrl(mediaUrl)
          : null;

    return (
      <div className='space-y-3'>
        <div className='flex items-center gap-3'>
          <input
            type='url'
            className='flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none'
            placeholder='URL de la vidéo (YouTube, Vimeo...)'
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
            onBlur={() => {
              if (mediaUrl !== (block.media_url || '')) {
                saveField({ media_url: mediaUrl });
              }
            }}
          />
          <div className='relative'>
            <select
              className='appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none'
              value={mediaType}
              onChange={e => {
                setMediaType(e.target.value);
                saveField({ media_type: e.target.value });
              }}
            >
              {MEDIA_TYPES.map(t => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          </div>
        </div>
        {mediaUrl && embedUrl && (
          <div className='aspect-video w-full overflow-hidden rounded-md border border-gray-200'>
            <iframe
              src={embedUrl}
              className='h-full w-full'
              allowFullScreen
              title='Aperçu vidéo'
            />
          </div>
        )}
        {mediaUrl && !embedUrl && mediaType !== 'external' && (
          <p className='text-xs text-gray-400'>
            URL non reconnue pour l&apos;aperçu.
          </p>
        )}
      </div>
    );
  }

  function renderPdf() {
    return (
      <div className='space-y-3'>
        {block.file_name && (
          <div className='flex items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-2'>
            <FileText className='h-4 w-4 text-primary' />
            <span className='text-sm text-gray-700 truncate'>
              {block.file_name}
            </span>
          </div>
        )}
        <button
          type='button'
          className='rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors'
        >
          Upload PDF
        </button>
        <input
          type='url'
          className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none'
          placeholder='URL du fichier PDF'
          value={fileUrl}
          onChange={e => setFileUrl(e.target.value)}
          onBlur={() => {
            if (fileUrl !== (block.file_url || '')) {
              saveField({ file_url: fileUrl });
            }
          }}
        />
      </div>
    );
  }

  function renderImage() {
    return (
      <div className='space-y-3'>
        {fileUrl && (
          <div className='overflow-hidden rounded-md border border-gray-200'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt='Aperçu'
              className='max-h-48 w-full object-contain bg-white'
            />
          </div>
        )}
        <button
          type='button'
          className='rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors'
        >
          Upload Image
        </button>
        <input
          type='url'
          className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none'
          placeholder="URL de l'image"
          value={fileUrl}
          onChange={e => setFileUrl(e.target.value)}
          onBlur={() => {
            if (fileUrl !== (block.file_url || '')) {
              saveField({ file_url: fileUrl });
            }
          }}
        />
      </div>
    );
  }

  const renderers: Record<string, () => JSX.Element> = {
    rich_text: renderRichText,
    video: renderVideo,
    pdf: renderPdf,
    image: renderImage,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50'
    >
      {/* Header */}
      <div className='flex items-center gap-2 text-sm font-medium text-gray-600 mb-3'>
        <button
          type='button'
          className='touch-none p-0.5 rounded hover:bg-gray-200 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors'
          {...attributes}
          {...listeners}
          title='Glisser pour réorganiser'
        >
          <GripVertical className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            onMoveUp?.();
          }}
          disabled={isFirst}
          className='p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
          title='Monter'
        >
          <ChevronUp className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            onMoveDown?.();
          }}
          disabled={isLast}
          className='p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
          title='Descendre'
        >
          <ChevronDown className='h-4 w-4' />
        </button>
        <Icon className='h-4 w-4' />
        <span>{config.label}</span>
        <div className='flex-1' />
        <button
          type='button'
          onClick={onDelete}
          className='p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors'
          title='Supprimer le bloc'
        >
          <Trash2 className='h-4 w-4' />
        </button>
      </div>

      {/* Content editor */}
      {(renderers[block.block_type] || renderRichText)()}
    </div>
  );
}
