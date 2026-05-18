'use client';

import React, { useState } from 'react';
import {
  Plus,
  GripVertical,
  Trash2,
  FileText,
  Video,
  BookOpen,
  Headphones,
  ChevronDown,
  ChevronUp,
  Search,
  Link as LinkIcon,
  Edit3,
  Loader2,
} from 'lucide-react';
import {
  useCourseSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useReorderSections,
  CourseSection,
} from '@/hooks/useCourseSections';
import { useNutritionistContents } from '@/hooks/useNutritionistContent';
import { ContentType, CONTENT_TYPE_LABELS } from '@/types/educational-content';

interface CourseEditorProps {
  courseId: string;
}

const TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  article: <FileText className='w-4 h-4' />,
  video: <Video className='w-4 h-4' />,
  guide: <BookOpen className='w-4 h-4' />,
  podcast: <Headphones className='w-4 h-4' />,
  course: <BookOpen className='w-4 h-4' />,
};

export function CourseEditor({ courseId }: CourseEditorProps) {
  const { data: sections, isLoading } = useCourseSections(courseId);
  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();
  const reorderMutation = useReorderSections();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showContentPicker, setShowContentPicker] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingBody, setEditingBody] = useState('');
  const [search, setSearch] = useState('');

  const { data: searchResults } = useNutritionistContents({
    status: 'published',
    search: search || undefined,
    limit: 10,
  });

  const handleAddOriginal = () => {
    const title = window.prompt('Titre de la section :');
    if (!title?.trim()) return;
    createMutation.mutate({
      courseId,
      data: { title: title.trim(), section_type: 'original' },
    });
    setShowAddMenu(false);
  };

  const handleAddReference = (contentId: string, contentTitle: string) => {
    createMutation.mutate({
      courseId,
      data: {
        title: contentTitle,
        section_type: 'reference',
        referenced_content_id: contentId,
      },
    });
    setShowContentPicker(false);
    setSearch('');
  };

  const handleDelete = (sectionId: string) => {
    if (window.confirm('Supprimer cette section ?')) {
      deleteMutation.mutate({ courseId, sectionId });
    }
  };

  const handleMoveUp = (index: number) => {
    if (!sections || index <= 0) return;
    const ids = sections.map(s => s.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorderMutation.mutate({ courseId, sectionIds: ids });
  };

  const handleMoveDown = (index: number) => {
    if (!sections || index >= sections.length - 1) return;
    const ids = sections.map(s => s.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderMutation.mutate({ courseId, sectionIds: ids });
  };

  const handleStartEdit = (section: CourseSection) => {
    setEditingSectionId(section.id);
    setEditingTitle(section.title);
    setEditingBody(section.body || '');
  };

  const handleSaveEdit = () => {
    if (!editingSectionId) return;
    updateMutation.mutate(
      {
        courseId,
        sectionId: editingSectionId,
        data: { title: editingTitle, body: editingBody },
      },
      { onSuccess: () => setEditingSectionId(null) }
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-gray-900'>
          Sections du cours ({(sections || []).length})
        </h3>
      </div>

      {/* Sections list */}
      {(sections || []).length === 0 ? (
        <div className='text-center py-8 border-2 border-dashed border-gray-200 rounded-xl'>
          <BookOpen className='w-10 h-10 text-gray-300 mx-auto mb-2' />
          <p className='text-sm text-gray-500'>Aucune section</p>
          <p className='text-xs text-gray-400 mt-1'>
            Ajoutez des sections pour structurer votre cours
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {(sections || []).map((section, index) => (
            <div
              key={section.id}
              className='border border-gray-200 rounded-lg overflow-hidden'
            >
              <div className='flex items-center gap-3 px-4 py-3 bg-gray-50'>
                {/* Reorder */}
                <div className='flex flex-col'>
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className='text-gray-400 hover:text-gray-600 disabled:opacity-30'
                  >
                    <ChevronUp className='w-3.5 h-3.5' />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === (sections || []).length - 1}
                    className='text-gray-400 hover:text-gray-600 disabled:opacity-30'
                  >
                    <ChevronDown className='w-3.5 h-3.5' />
                  </button>
                </div>

                {/* Section number */}
                <span className='w-6 h-6 rounded-full bg-[#1B998B]/10 text-[#1B998B] text-xs font-semibold flex items-center justify-center'>
                  {index + 1}
                </span>

                {/* Info */}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {section.title}
                  </p>
                  <p className='text-xs text-gray-400'>
                    {section.section_type === 'reference' ? (
                      <span className='flex items-center gap-1'>
                        <LinkIcon className='w-3 h-3' />
                        {section.referenced_content?.title || 'Contenu lié'}
                        {' · '}
                        {CONTENT_TYPE_LABELS[
                          (section.referenced_content?.type as ContentType) ||
                            'article'
                        ] || ''}
                      </span>
                    ) : (
                      'Contenu original'
                    )}
                  </p>
                </div>

                {/* Actions */}
                {section.section_type === 'original' && (
                  <button
                    onClick={() => handleStartEdit(section)}
                    className='p-1.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600'
                  >
                    <Edit3 className='w-4 h-4' />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(section.id)}
                  className='p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>

              {/* Inline editor for original sections */}
              {editingSectionId === section.id && (
                <div className='p-4 border-t border-gray-200 space-y-3'>
                  <input
                    type='text'
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
                    placeholder='Titre de la section'
                  />
                  <textarea
                    value={editingBody}
                    onChange={e => setEditingBody(e.target.value)}
                    rows={6}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
                    placeholder='Contenu de la section (HTML ou texte)'
                  />
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={() => setEditingSectionId(null)}
                      className='px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50'
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={updateMutation.isPending}
                      className='px-3 py-1.5 text-sm bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50'
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add section */}
      <div className='relative'>
        <button
          onClick={() => {
            setShowAddMenu(!showAddMenu);
            setShowContentPicker(false);
          }}
          className='flex items-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1B998B] hover:text-[#1B998B] transition-colors justify-center'
        >
          <Plus className='w-4 h-4' />
          Ajouter une section
        </button>

        {showAddMenu && !showContentPicker && (
          <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1'>
            <button
              onClick={handleAddOriginal}
              className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50'
            >
              <Edit3 className='w-4 h-4 text-[#1B998B]' />
              <div>
                <p className='font-medium'>Contenu original</p>
                <p className='text-xs text-gray-400'>
                  Rédiger un nouveau texte
                </p>
              </div>
            </button>
            <button
              onClick={() => setShowContentPicker(true)}
              className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50'
            >
              <LinkIcon className='w-4 h-4 text-purple-600' />
              <div>
                <p className='font-medium'>Contenu existant</p>
                <p className='text-xs text-gray-400'>
                  Insérer un article, vidéo ou guide publié
                </p>
              </div>
            </button>
          </div>
        )}

        {showContentPicker && (
          <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Rechercher un contenu publié...'
                className='w-full pl-9 pr-4 py-2.5 text-sm border-b border-gray-200 focus:outline-none rounded-t-lg'
                autoFocus
              />
            </div>
            <div className='max-h-60 overflow-y-auto'>
              {(searchResults?.contents || [])
                .filter(c => c.type !== 'course')
                .map(content => (
                  <button
                    key={content.id}
                    onClick={() =>
                      handleAddReference(content.id, content.title)
                    }
                    className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left'
                  >
                    <span className='text-gray-400'>
                      {TYPE_ICONS[content.type]}
                    </span>
                    <div className='flex-1 min-w-0'>
                      <p className='truncate'>{content.title}</p>
                      <p className='text-xs text-gray-400'>
                        {CONTENT_TYPE_LABELS[content.type]}
                      </p>
                    </div>
                  </button>
                ))}
              {(searchResults?.contents || []).filter(c => c.type !== 'course')
                .length === 0 && (
                <p className='px-4 py-6 text-sm text-gray-400 text-center'>
                  Aucun contenu publié trouvé
                </p>
              )}
            </div>
            <div className='border-t border-gray-200 px-4 py-2'>
              <button
                onClick={() => {
                  setShowContentPicker(false);
                  setShowAddMenu(false);
                }}
                className='text-xs text-gray-500 hover:text-gray-700'
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
