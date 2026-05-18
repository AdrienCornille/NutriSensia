'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Youtube from '@tiptap/extension-youtube';
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from '@tiptap/extension-table';
import {
  Save,
  Send,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  X,
  Plus,
  Upload,
  Trash2,
  Loader2,
  AlertCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Code,
  Minus,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Youtube as YoutubeIcon,
  Type,
  Pilcrow,
  RemoveFormatting,
  Table as TableIcon,
  TableCellsMerge,
  TableCellsSplit,
  Rows3,
  Columns3,
  Palette,
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
  Clock,
  Check,
  Calendar,
  FileText,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  EducationalContent,
  ContentType,
  ContentCategory,
  CONTENT_TYPE_LABELS,
  CONTENT_CATEGORY_LABELS,
} from '@/types/educational-content';
import { CustomDropdown, DropdownOption } from '@/components/ui/CustomDropdown';
import { CourseBuilder as CourseBuilderComponent } from '@/components/nutritionist/content/course/CourseBuilder';
import CoursePreview from '@/components/nutritionist/content/course/CoursePreview';
import { CreateCategoryModal } from '@/components/nutritionist/content/CreateCategoryModal';

export interface CustomCategoryOption {
  id: string;
  name: string;
  color: string | null;
}

interface ContentFormProps {
  content?: EducationalContent | null;
  initialType?: ContentType;
  onSave: (data: ContentFormData) => void;
  onPublish: (data: ContentFormData) => void;
  onUnpublish?: () => void;
  onSchedule?: (data: ContentFormData, scheduledAt: string) => void;
  onAutoSave?: (data: ContentFormData) => void;
  onBack: () => void;
  isSaving: boolean;
  customCategories?: CustomCategoryOption[];
  onCreateCategory?: (name: string, color?: string) => void;
}

export interface ContentFormData {
  type: ContentType;
  category: ContentCategory;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  key_points: string[];
  media_url?: string;
  media_type?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  page_count?: number;
  scheduled_publish_at?: string;
  notify_patients?: boolean;
}

// ─── Modal d'insertion de lien ───
function LinkModal({
  isOpen,
  onClose,
  onConfirm,
  initialUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl || '');

  React.useEffect(() => {
    if (isOpen) setUrl(initialUrl || '');
  }, [isOpen, initialUrl]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Insérer un lien
          </h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-5 h-5 text-gray-400' />
          </button>
        </div>
        <input
          type='url'
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder='https://example.com'
          className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter' && url.trim()) {
              onConfirm(url.trim());
              onClose();
            }
          }}
        />
        <div className='flex justify-end gap-2 mt-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={() => {
              if (url.trim()) {
                onConfirm(url.trim());
                onClose();
              }
            }}
            disabled={!url.trim()}
            className='px-4 py-2 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
          >
            Insérer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal d'insertion d'image ───
function ImageModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, alt: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setUrl('');
      setAlt('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Insérer une image
          </h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-5 h-5 text-gray-400' />
          </button>
        </div>
        <div className='space-y-3'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              URL de l&apos;image
            </label>
            <input
              type='url'
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder='https://example.com/image.jpg'
              className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
              autoFocus
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Texte alternatif (optionnel)
            </label>
            <input
              type='text'
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder="Description de l'image"
              className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
            />
          </div>
        </div>
        <div className='flex justify-end gap-2 mt-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={() => {
              if (url.trim()) {
                onConfirm(url.trim(), alt.trim());
                onClose();
              }
            }}
            disabled={!url.trim()}
            className='px-4 py-2 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
          >
            Insérer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal d'insertion YouTube ───
function YoutubeModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}) {
  const [url, setUrl] = useState('');

  React.useEffect(() => {
    if (isOpen) setUrl('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Intégrer une vidéo YouTube
          </h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-5 h-5 text-gray-400' />
          </button>
        </div>
        <input
          type='url'
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder='https://youtube.com/watch?v=...'
          className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter' && url.trim()) {
              onConfirm(url.trim());
              onClose();
            }
          }}
        />
        <div className='flex justify-end gap-2 mt-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={() => {
              if (url.trim()) {
                onConfirm(url.trim());
                onClose();
              }
            }}
            disabled={!url.trim()}
            className='px-4 py-2 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
          >
            Intégrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal d'insertion de tableau ───
const TABLE_BG_COLORS = [
  { label: 'Aucun', value: '' },
  { label: 'Gris clair', value: '#F3F4F6' },
  { label: 'Vert clair', value: '#ECFDF5' },
  { label: 'Bleu clair', value: '#EFF6FF' },
  { label: 'Jaune clair', value: '#FEFCE8' },
  { label: 'Rose clair', value: '#FFF1F2' },
  { label: 'Violet clair', value: '#F5F3FF' },
  { label: 'Teal clair', value: '#E6FAF7' },
];

const TABLE_BORDER_STYLES = [
  { label: 'Standard', value: 'solid' },
  { label: 'Pointillé', value: 'dotted' },
  { label: 'Tirets', value: 'dashed' },
  { label: 'Aucune', value: 'none' },
];

function TableModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: {
    rows: number;
    cols: number;
    withHeader: boolean;
    bgColor: string;
    borderStyle: string;
  }) => void;
}) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);
  const [bgColor, setBgColor] = useState('');
  const [borderStyle, setBorderStyle] = useState('solid');

  React.useEffect(() => {
    if (isOpen) {
      setRows(3);
      setCols(3);
      setWithHeader(true);
      setBgColor('');
      setBorderStyle('solid');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'>
        <div className='flex items-center justify-between mb-5'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Insérer un tableau
          </h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-5 h-5 text-gray-400' />
          </button>
        </div>

        <div className='space-y-4'>
          {/* Dimensions */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Lignes
              </label>
              <input
                type='number'
                min={1}
                max={20}
                value={rows}
                onChange={e =>
                  setRows(Math.max(1, Math.min(20, +e.target.value)))
                }
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Colonnes
              </label>
              <input
                type='number'
                min={1}
                max={10}
                value={cols}
                onChange={e =>
                  setCols(Math.max(1, Math.min(10, +e.target.value)))
                }
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
              />
            </div>
          </div>

          {/* Aperçu visuel */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Aperçu
            </label>
            <div className='border border-gray-200 rounded-lg p-3 overflow-x-auto'>
              <table
                className='w-full text-xs'
                style={{ borderCollapse: 'collapse' }}
              >
                <tbody>
                  {Array.from({ length: Math.min(rows, 6) }).map((_, r) => (
                    <tr key={r}>
                      {Array.from({ length: Math.min(cols, 6) }).map((_, c) => (
                        <td
                          key={c}
                          className='px-2 py-1.5 text-center text-gray-400'
                          style={{
                            border: `1px ${borderStyle} #D1D5DB`,
                            backgroundColor:
                              withHeader && r === 0
                                ? '#E5E7EB'
                                : bgColor || 'transparent',
                          }}
                        >
                          {withHeader && r === 0
                            ? `En-tête ${c + 1}`
                            : `${r + 1}.${c + 1}`}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(rows > 6 || cols > 6) && (
                <p className='text-xs text-gray-400 mt-1 text-center'>
                  ... {rows}×{cols} au total
                </p>
              )}
            </div>
          </div>

          {/* En-tête */}
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={withHeader}
              onChange={e => setWithHeader(e.target.checked)}
              className='w-4 h-4 rounded border-gray-300 text-[#1B998B] focus:ring-[#1B998B]'
            />
            <span className='text-sm text-gray-700'>
              Première ligne en en-tête
            </span>
          </label>

          {/* Couleur de fond */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Couleur de fond des cellules
            </label>
            <div className='flex flex-wrap gap-2'>
              {TABLE_BG_COLORS.map(c => (
                <button
                  key={c.value}
                  type='button'
                  onClick={() => setBgColor(c.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    bgColor === c.value
                      ? 'border-[#1B998B] scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    backgroundColor: c.value || '#FFFFFF',
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Style de bordure */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Style de bordure
            </label>
            <div className='flex gap-2'>
              {TABLE_BORDER_STYLES.map(s => (
                <button
                  key={s.value}
                  type='button'
                  onClick={() => setBorderStyle(s.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                    borderStyle === s.value
                      ? 'border-[#1B998B] bg-[#1B998B]/5 text-[#1B998B] font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-6'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm({ rows, cols, withHeader, bgColor, borderStyle });
              onClose();
            }}
            className='px-4 py-2 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors'
          >
            Insérer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sous-menu table (quand le curseur est dans un tableau) ───
function TableContextMenu({
  editor,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu au clic en dehors
  React.useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className='relative' ref={menuRef}>
      <button
        type='button'
        onClick={() => setShowMenu(!showMenu)}
        className='p-1.5 rounded bg-[#1B998B] text-white transition-colors'
        title='Options du tableau'
      >
        <TableIcon className='w-4 h-4' />
      </button>
      {showMenu && (
        <div
          className='fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-52 overflow-y-auto'
          style={{ top: 'auto', left: 'auto' }}
          ref={el => {
            if (el) {
              const btn = el.previousElementSibling as HTMLElement;
              if (btn) {
                const rect = btn.getBoundingClientRect();
                const menuWidth = el.offsetWidth;
                const padding = 8;
                const maxHeight = window.innerHeight - padding * 2;

                // Contraindre la hauteur max à l'écran
                el.style.maxHeight = `${maxHeight}px`;

                const menuHeight = Math.min(el.scrollHeight, maxHeight);
                const spaceBelow = window.innerHeight - rect.bottom - padding;
                const spaceRight = window.innerWidth - rect.left - padding;

                // Positionner en bas si possible, sinon en haut, sinon coller en haut de l'écran
                if (spaceBelow >= menuHeight) {
                  el.style.top = `${rect.bottom + 4}px`;
                } else if (rect.top - padding >= menuHeight) {
                  el.style.top = `${rect.top - menuHeight - 4}px`;
                } else {
                  el.style.top = `${padding}px`;
                }

                el.style.left =
                  spaceRight >= menuWidth
                    ? `${rect.left}px`
                    : `${rect.right - menuWidth}px`;
              }
            }
          }}
        >
          <button
            type='button'
            onClick={() => {
              editor.chain().focus().addColumnAfter().run();
              setShowMenu(false);
            }}
            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
          >
            <Columns3 className='w-4 h-4' />
            Ajouter une colonne
          </button>
          <button
            type='button'
            onClick={() => {
              editor.chain().focus().addRowAfter().run();
              setShowMenu(false);
            }}
            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
          >
            <Rows3 className='w-4 h-4' />
            Ajouter une ligne
          </button>
          <div className='h-px bg-gray-100 my-1' />
          <button
            type='button'
            onClick={() => {
              editor.chain().focus().deleteColumn().run();
              setShowMenu(false);
            }}
            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50'
          >
            <Columns3 className='w-4 h-4' />
            Supprimer la colonne
          </button>
          <button
            type='button'
            onClick={() => {
              editor.chain().focus().deleteRow().run();
              setShowMenu(false);
            }}
            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50'
          >
            <Rows3 className='w-4 h-4' />
            Supprimer la ligne
          </button>
          <div className='h-px bg-gray-100 my-1' />
          <button
            type='button'
            onClick={() => {
              editor.chain().focus().mergeCells().run();
              setShowMenu(false);
            }}
            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
          >
            <TableCellsMerge className='w-4 h-4' />
            Fusionner les cellules
          </button>
          <button
            type='button'
            onClick={() => {
              editor.chain().focus().splitCell().run();
              setShowMenu(false);
            }}
            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
          >
            <TableCellsSplit className='w-4 h-4' />
            Séparer la cellule
          </button>
          <button
            type='button'
            onClick={() => {
              editor.chain().focus().toggleHeaderRow().run();
              setShowMenu(false);
            }}
            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
          >
            <Rows3 className='w-4 h-4' />
            Basculer en-tête
          </button>
          <div className='h-px bg-gray-100 my-1' />
          {/* Positionnement du tableau */}
          <div className='px-3 py-2'>
            <p className='text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1'>
              <AlignCenter className='w-3.5 h-3.5' />
              Position du tableau
            </p>
            <div className='flex gap-1'>
              {(
                [
                  { value: 'left', icon: AlignLeft, label: 'Gauche' },
                  { value: 'center', icon: AlignCenter, label: 'Centré' },
                  { value: 'right', icon: AlignRight, label: 'Droite' },
                ] as const
              ).map(opt => (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => {
                    const tableEl = editor.view.dom.querySelector('table');
                    if (tableEl) {
                      if (opt.value === 'center') {
                        tableEl.style.marginLeft = 'auto';
                        tableEl.style.marginRight = 'auto';
                      } else if (opt.value === 'right') {
                        tableEl.style.marginLeft = 'auto';
                        tableEl.style.marginRight = '0';
                      } else {
                        tableEl.style.marginLeft = '0';
                        tableEl.style.marginRight = 'auto';
                      }
                    }
                    setShowMenu(false);
                  }}
                  className='flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md border border-gray-200 text-gray-600 hover:border-[#1B998B] hover:bg-[#1B998B]/5 transition-all'
                  title={opt.label}
                >
                  <opt.icon className='w-3.5 h-3.5' />
                </button>
              ))}
            </div>
          </div>
          {/* Largeur du tableau */}
          <div className='px-3 py-2'>
            <p className='text-xs font-medium text-gray-500 mb-1.5'>
              Largeur du tableau
            </p>
            <div className='flex gap-1'>
              {[
                { value: '50%', label: '50%' },
                { value: '75%', label: '75%' },
                { value: '100%', label: '100%' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => {
                    const tableEl = editor.view.dom.querySelector('table');
                    if (tableEl) {
                      tableEl.style.width = opt.value;
                    }
                    setShowMenu(false);
                  }}
                  className='flex-1 px-2 py-1.5 text-xs rounded-md border border-gray-200 text-gray-600 hover:border-[#1B998B] hover:bg-[#1B998B]/5 transition-all'
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className='h-px bg-gray-100 my-1' />
          {/* Couleur de fond de cellule */}
          <div className='px-3 py-2'>
            <p className='text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1'>
              <Palette className='w-3.5 h-3.5' />
              Fond de la cellule
            </p>
            <div className='flex flex-wrap gap-1'>
              {TABLE_BG_COLORS.map(c => (
                <button
                  key={c.value}
                  type='button'
                  onClick={() => {
                    if (c.value) {
                      editor
                        .chain()
                        .focus()
                        .setCellAttribute('backgroundColor', c.value)
                        .run();
                    } else {
                      editor
                        .chain()
                        .focus()
                        .setCellAttribute('backgroundColor', '')
                        .run();
                    }
                    setShowMenu(false);
                  }}
                  className='w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform'
                  style={{ backgroundColor: c.value || '#FFFFFF' }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          {/* Style de bordure du tableau */}
          <div className='px-3 py-2'>
            <p className='text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1'>
              <Minus className='w-3.5 h-3.5' />
              Bordures du tableau
            </p>
            <div className='flex flex-wrap gap-1'>
              {TABLE_BORDER_STYLES.map(s => (
                <button
                  key={s.value}
                  type='button'
                  onClick={() => {
                    const tableEl = editor.view.dom.querySelector('table');
                    if (tableEl) {
                      const cells = tableEl.querySelectorAll('td, th');
                      cells.forEach(cell => {
                        (cell as HTMLElement).style.borderStyle = s.value;
                        if (s.value === 'none') {
                          (cell as HTMLElement).style.borderWidth = '0';
                        } else {
                          (cell as HTMLElement).style.borderWidth = '1px';
                        }
                      });
                    }
                    setShowMenu(false);
                  }}
                  className='flex-1 px-2 py-1.5 text-xs rounded-md border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all'
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className='h-px bg-gray-100 my-1' />
          <button
            type='button'
            onClick={() => {
              editor.chain().focus().deleteTable().run();
              setShowMenu(false);
            }}
            className='flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50'
          >
            <Trash2 className='w-4 h-4' />
            Supprimer le tableau
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sélecteur de couleur ───
const TEXT_COLORS = [
  { label: 'Noir', value: '#000000' },
  { label: 'Gris foncé', value: '#4B5563' },
  { label: 'Gris', value: '#9CA3AF' },
  { label: 'Rouge', value: '#DC2626' },
  { label: 'Orange', value: '#EA580C' },
  { label: 'Jaune', value: '#CA8A04' },
  { label: 'Vert', value: '#16A34A' },
  { label: 'Teal', value: '#1B998B' },
  { label: 'Bleu', value: '#2563EB' },
  { label: 'Violet', value: '#7C3AED' },
  { label: 'Rose', value: '#DB2777' },
];

// ─── Toolbar ───
function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  // Force re-render on editor state changes so active buttons update
  const [, setTick] = useState(0);
  React.useEffect(() => {
    if (!editor) return;
    const handler = () => setTick(n => n + 1);
    editor.on('transaction', handler);
    return () => {
      editor.off('transaction', handler);
    };
  }, [editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active ? 'bg-[#1B998B] text-white' : 'text-gray-500 hover:bg-gray-100'
    }`;

  const disabledBtnClass =
    'p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors';

  const separator = <div className='w-px h-5 bg-gray-300 mx-1' />;

  return (
    <>
      <div className='flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-3 py-2 bg-gray-50'>
        {/* ── Texte ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive('bold'))}
          title='Gras (Ctrl+B)'
        >
          <Bold className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive('italic'))}
          title='Italique (Ctrl+I)'
        >
          <Italic className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive('underline'))}
          title='Souligné (Ctrl+U)'
        >
          <UnderlineIcon className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass(editor.isActive('strike'))}
          title='Barré'
        >
          <Strikethrough className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={btnClass(editor.isActive('highlight'))}
          title='Surligner'
        >
          <Highlighter className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={btnClass(editor.isActive('code'))}
          title='Code inline'
        >
          <Code className='w-4 h-4' />
        </button>

        {/* Couleur du texte */}
        <div className='relative'>
          <button
            type='button'
            onClick={() => setShowColorPicker(!showColorPicker)}
            className='p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors'
            title='Couleur du texte'
          >
            <Type className='w-4 h-4' />
          </button>
          {showColorPicker && (
            <div className='absolute top-full left-0 mt-1 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-4 gap-1'>
              {TEXT_COLORS.map(c => (
                <button
                  key={c.value}
                  type='button'
                  onClick={() => {
                    editor.chain().focus().setColor(c.value).run();
                    setShowColorPicker(false);
                  }}
                  className='w-7 h-7 rounded-md border border-gray-200 hover:scale-110 transition-transform'
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
              <button
                type='button'
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className='w-7 h-7 rounded-md border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-xs text-gray-400'
                title='Réinitialiser'
              >
                <RemoveFormatting className='w-3.5 h-3.5' />
              </button>
            </div>
          )}
        </div>

        {separator}

        {/* ── Paragraphe & Titres ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btnClass(
            editor.isActive('paragraph') && !editor.isActive('heading')
          )}
          title='Paragraphe'
        >
          <Pilcrow className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={btnClass(editor.isActive('heading', { level: 1 }))}
          title='Titre 1'
        >
          <Heading1 className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          title='Titre 2'
        >
          <Heading2 className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={btnClass(editor.isActive('heading', { level: 3 }))}
          title='Titre 3'
        >
          <Heading3 className='w-4 h-4' />
        </button>

        {separator}

        {/* ── Listes & blocs ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive('bulletList'))}
          title='Liste à puces'
        >
          <List className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
          title='Liste numérotée'
        >
          <ListOrdered className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive('blockquote'))}
          title='Citation'
        >
          <Quote className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={btnClass(editor.isActive('codeBlock'))}
          title='Bloc de code'
        >
          <Code className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={disabledBtnClass}
          title='Ligne horizontale'
        >
          <Minus className='w-4 h-4' />
        </button>

        {separator}

        {/* ── Alignement ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={btnClass(editor.isActive({ textAlign: 'left' }))}
          title='Aligner à gauche'
        >
          <AlignLeft className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={btnClass(editor.isActive({ textAlign: 'center' }))}
          title='Centrer'
        >
          <AlignCenter className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={btnClass(editor.isActive({ textAlign: 'right' }))}
          title='Aligner à droite'
        >
          <AlignRight className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={btnClass(editor.isActive({ textAlign: 'justify' }))}
          title='Justifier'
        >
          <AlignJustify className='w-4 h-4' />
        </button>

        {separator}

        {/* ── Exposant / Indice ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={btnClass(editor.isActive('subscript'))}
          title='Indice'
        >
          <SubscriptIcon className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={btnClass(editor.isActive('superscript'))}
          title='Exposant'
        >
          <SuperscriptIcon className='w-4 h-4' />
        </button>

        {separator}

        {/* ── Insertions ── */}
        <button
          type='button'
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkModal(true);
            }
          }}
          className={btnClass(editor.isActive('link'))}
          title={
            editor.isActive('link') ? 'Retirer le lien' : 'Insérer un lien'
          }
        >
          {editor.isActive('link') ? (
            <Unlink className='w-4 h-4' />
          ) : (
            <LinkIcon className='w-4 h-4' />
          )}
        </button>
        <button
          type='button'
          onClick={() => setShowImageModal(true)}
          className={disabledBtnClass}
          title='Insérer une image'
        >
          <ImageIcon className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => setShowYoutubeModal(true)}
          className={disabledBtnClass}
          title='Intégrer une vidéo YouTube'
        >
          <YoutubeIcon className='w-4 h-4' />
        </button>

        {/* Tableau : bouton insertion ou sous-menu contextuel */}
        {editor.isActive('table') ? (
          <TableContextMenu editor={editor} />
        ) : (
          <button
            type='button'
            onClick={() => setShowTableModal(true)}
            className={disabledBtnClass}
            title='Insérer un tableau'
          >
            <TableIcon className='w-4 h-4' />
          </button>
        )}

        {separator}

        {/* ── Historique ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={disabledBtnClass}
          title='Annuler (Ctrl+Z)'
        >
          <Undo className='w-4 h-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={disabledBtnClass}
          title='Refaire (Ctrl+Shift+Z)'
        >
          <Redo className='w-4 h-4' />
        </button>

        {separator}

        {/* ── Nettoyer le formatage ── */}
        <button
          type='button'
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          className={disabledBtnClass}
          title='Supprimer le formatage'
        >
          <RemoveFormatting className='w-4 h-4' />
        </button>
      </div>

      {/* Modaux */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onConfirm={url =>
          editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
        }
        initialUrl={editor.getAttributes('link').href}
      />
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onConfirm={(url, alt) =>
          editor.chain().focus().setImage({ src: url, alt }).run()
        }
      />
      <YoutubeModal
        isOpen={showYoutubeModal}
        onClose={() => setShowYoutubeModal(false)}
        onConfirm={url =>
          editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 })
        }
      />
      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onConfirm={({ rows, cols, withHeader }) => {
          editor
            .chain()
            .focus()
            .insertTable({
              rows: withHeader ? rows + 1 : rows,
              cols,
              withHeaderRow: withHeader,
            })
            .run();
        }}
      />
    </>
  );
}

// ─── Calcul temps de lecture ───
function estimateReadingTimeFromHtml(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function formatReadingTime(minutes: number): string {
  if (minutes <= 1) return '1 min de lecture';
  return `${minutes} min de lecture`;
}

export function ContentForm({
  content,
  initialType,
  onSave,
  onPublish,
  onUnpublish,
  onSchedule,
  onAutoSave,
  onBack,
  isSaving,
  customCategories = [],
  onCreateCategory,
}: ContentFormProps) {
  const isEditing = !!content;

  const [type, setType] = useState<ContentType>(
    content?.type || initialType || 'article'
  );
  const [category, setCategory] = useState<string>(
    content?.customCategoryId
      ? `custom:${content.customCategoryId}`
      : content?.category || ''
  );
  const [title, setTitle] = useState(content?.title || '');
  const [summary, setSummary] = useState(content?.summary || '');
  const [tags, setTags] = useState<string[]>(content?.tags || []);
  const [keyPoints, setKeyPoints] = useState<string[]>(
    content?.keyPoints || []
  );
  const [tagInput, setTagInput] = useState('');
  const [keyPointInput, setKeyPointInput] = useState('');
  const [mediaUrl, setMediaUrl] = useState(content?.mediaUrl || '');
  const [mediaType, setMediaType] = useState(content?.mediaType || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(content?.thumbnailUrl || '');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Preview mode ───
  const [isPreview, setIsPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  );

  // ─── Scheduled publication ───
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(
    content?.scheduledPublishAt
      ? new Date(content.scheduledPublishAt).toISOString().slice(0, 16)
      : ''
  );
  const [notifyPatients, setNotifyPatients] = useState(false);

  // ─── Course creation flow (2 steps) ───
  const [courseStep, setCourseStep] = useState<'metadata' | 'builder'>(
    isEditing && content?.type === 'course' ? 'builder' : 'metadata'
  );
  const [courseId, setCourseId] = useState<string | null>(content?.id || null);
  const [showCoursePreview, setShowCoursePreview] = useState(false);
  const isCourse = type === 'course';

  // ─── Duration for video/podcast ───
  const [durationMinutes, setDurationMinutes] = useState(
    content?.durationSeconds ? Math.floor(content.durationSeconds / 60) : 0
  );

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // ─── Auto-detect video platform from URL ───
  useEffect(() => {
    if (type !== 'video' || !mediaUrl) return;
    if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
      setMediaType('youtube');
      // Extract YouTube thumbnail
      const videoId =
        mediaUrl.match(/(?:v=|\/)([\w-]{11})/)?.[1] ||
        mediaUrl.match(/youtu\.be\/([\w-]{11})/)?.[1];
      if (videoId && !thumbnailUrl) {
        setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      }
    } else if (mediaUrl.includes('vimeo.com')) {
      setMediaType('vimeo');
    }
  }, [mediaUrl, type, thumbnailUrl]);

  // ─── PDF upload ───
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState(
    content?.mediaUrl ? 'PDF existant' : ''
  );
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Seuls les fichiers PDF sont acceptés.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Fichier trop volumineux (max 20 Mo).');
      return;
    }

    setIsUploadingPdf(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        '/api/protected/nutritionist/content/upload-pdf',
        { method: 'POST', credentials: 'include', body: formData }
      );

      const data = await res.json();
      if (res.ok && data.data?.url) {
        setMediaUrl(data.data.url);
        setMediaType('pdf');
        setPdfFileName(file.name);
        // Auto-set file size for the form data
      } else {
        setUploadError(data.error || "Erreur lors de l'upload du PDF.");
      }
    } catch {
      setUploadError('Impossible de contacter le serveur.');
    } finally {
      setIsUploadingPdf(false);
    }
  }, []);

  // ─── Auto-save ───
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved'
  >('idle');
  const lastSavedRef = useRef<string>('');
  const isDirtyRef = useRef(false);

  const handleThumbnailUpload = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Format non supporté. Utilisez JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image trop volumineuse (maximum 2 Mo).');
      return;
    }

    setIsUploadingThumbnail(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        '/api/protected/nutritionist/content/upload-thumbnail',
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok && data.data?.url) {
        setThumbnailUrl(data.data.url);
        triggerAutoSave('thumbnail');
      } else {
        setUploadError(data.error || "Erreur lors de l'upload de l'image.");
      }
    } catch {
      setUploadError(
        'Impossible de contacter le serveur. Vérifiez votre connexion.'
      );
    } finally {
      setIsUploadingThumbnail(false);
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#1B998B] underline' },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({
        placeholder: 'Commencez à rédiger votre contenu...',
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Subscript,
      Superscript,
      Youtube.configure({ controls: true }),
      Table.configure({ resizable: true }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            tableAlign: {
              default: 'left',
              parseHTML: (element: HTMLElement) => {
                if (
                  element.style.marginLeft === 'auto' &&
                  element.style.marginRight === 'auto'
                )
                  return 'center';
                if (element.style.marginLeft === 'auto') return 'right';
                return 'left';
              },
              renderHTML: (attributes: Record<string, unknown>) => {
                const align = attributes.tableAlign as string;
                const width = (attributes.tableWidth as string) || '100%';
                if (align === 'center')
                  return {
                    style: `width: ${width}; margin-left: auto; margin-right: auto`,
                  };
                if (align === 'right')
                  return {
                    style: `width: ${width}; margin-left: auto; margin-right: 0`,
                  };
                return { style: `width: ${width}` };
              },
            },
            tableWidth: {
              default: '100%',
              parseHTML: (element: HTMLElement) =>
                element.style.width || '100%',
              renderHTML: () => ({}), // handled by tableAlign renderHTML
            },
          };
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {},
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element: HTMLElement) =>
                element.style.backgroundColor || null,
              renderHTML: (attributes: Record<string, unknown>) => {
                if (!attributes.backgroundColor) return {};
                return {
                  style: `background-color: ${attributes.backgroundColor}`,
                };
              },
            },
          };
        },
      }),
      TableCell.configure({
        HTMLAttributes: {},
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element: HTMLElement) =>
                element.style.backgroundColor || null,
              renderHTML: (attributes: Record<string, unknown>) => {
                if (!attributes.backgroundColor) return {};
                return {
                  style: `background-color: ${attributes.backgroundColor}`,
                };
              },
            },
          };
        },
      }),
    ],
    content: content?.body || '',
    onUpdate: () => {
      triggerAutoSave('content');
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none px-4 py-3 min-h-[400px] focus:outline-none',
      },
    },
  });

  // ─── Live reading time ───
  const readingTime = useMemo(() => {
    if (type !== 'article') return null;
    const html = editor?.getHTML() || '';
    if (!html || html === '<p></p>') return null;
    return estimateReadingTimeFromHtml(html);
  }, [type, editor?.getHTML()]);

  const getFormData = useCallback((): ContentFormData => {
    const isCustomCategory =
      typeof category === 'string' && category.startsWith('custom:');
    const resolvedCategory = isCustomCategory ? 'other' : category || 'other';
    const customCategoryId = isCustomCategory
      ? category.replace('custom:', '')
      : null;

    return {
      type,
      category: resolvedCategory as ContentCategory,
      title,
      summary,
      body: editor?.getHTML() || '',
      tags,
      key_points: keyPoints,
      ...(customCategoryId
        ? { custom_category_id: customCategoryId }
        : { custom_category_id: null }),
      ...(type !== 'article' && mediaUrl
        ? { media_url: mediaUrl, media_type: mediaType }
        : {}),
      ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
      ...(durationMinutes > 0
        ? { duration_seconds: durationMinutes * 60 }
        : {}),
      ...(notifyPatients ? { notify_patients: true } : {}),
    };
  }, [
    type,
    category,
    title,
    summary,
    editor,
    tags,
    keyPoints,
    mediaUrl,
    mediaType,
    thumbnailUrl,
    notifyPatients,
  ]);

  // ─── Debounced auto-save (2s after last change) ───
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const onAutoSaveRef = useRef(onAutoSave);
  const getFormDataRef = useRef(getFormData);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const savedFieldTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastChangedFieldRef = useRef<string | null>(null);
  useEffect(() => {
    onAutoSaveRef.current = onAutoSave;
  }, [onAutoSave]);
  useEffect(() => {
    getFormDataRef.current = getFormData;
  }, [getFormData]);

  const triggerAutoSave = useCallback(
    (fieldName?: string) => {
      if (!isEditing) return;
      if (fieldName) lastChangedFieldRef.current = fieldName;
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        if (!onAutoSaveRef.current) return;
        const currentData = JSON.stringify(getFormDataRef.current());
        if (currentData !== lastSavedRef.current) {
          lastSavedRef.current = currentData;
          setSavingField(lastChangedFieldRef.current);
          onAutoSaveRef.current(getFormDataRef.current());
          setTimeout(() => {
            setSavingField(null);
            setSavedField(lastChangedFieldRef.current);
            if (savedFieldTimerRef.current)
              clearTimeout(savedFieldTimerRef.current);
            savedFieldTimerRef.current = setTimeout(() => {
              setSavedField(null);
            }, 2000);
          }, 500);
        }
      }, 2000);
    },
    [isEditing]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (savedFieldTimerRef.current) clearTimeout(savedFieldTimerRef.current);
    };
  }, []);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleAddKeyPoint = () => {
    const point = keyPointInput.trim();
    if (point) {
      setKeyPoints([...keyPoints, point]);
      setKeyPointInput('');
    }
  };

  const isArticle = type === 'article';

  return (
    <div className='h-full flex flex-col bg-white'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 h-[93px] flex-shrink-0 border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <h1 className='text-lg font-semibold text-gray-900'>
            {(() => {
              const labels: Record<string, { edit: string; create: string }> = {
                article: {
                  edit: "Édition de l'article",
                  create: 'Nouvel article',
                },
                video: {
                  edit: 'Édition de la vidéo',
                  create: 'Nouvelle vidéo',
                },
                guide: { edit: 'Édition du guide', create: 'Nouveau guide' },
                podcast: {
                  edit: 'Édition du podcast',
                  create: 'Nouveau podcast',
                },
                course: { edit: 'Édition du cours', create: 'Nouveau cours' },
              };
              return (
                labels[type]?.[isEditing ? 'edit' : 'create'] ||
                (isEditing ? 'Édition du contenu' : 'Nouveau contenu')
              );
            })()}
          </h1>
          {/* Reading time */}
          {readingTime && (
            <span className='flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full'>
              <Clock className='w-3.5 h-3.5' />
              {formatReadingTime(readingTime)}
            </span>
          )}
          {/* Auto-save indicator */}
        </div>
        <div className='flex items-center gap-2'>
          {/* Preview toggle (hidden for courses) */}
          {!isCourse && (
            <>
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  isPreview
                    ? 'bg-[#1B998B]/10 border-[#1B998B] text-[#1B998B]'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={isPreview ? "Retour à l'édition" : 'Aperçu'}
              >
                {isPreview ? (
                  <EyeOff className='w-4 h-4' />
                ) : (
                  <Eye className='w-4 h-4' />
                )}
                {isPreview ? 'Éditer' : 'Aperçu'}
              </button>
              {/* Device toggle (only in preview mode) */}
              {isPreview && (
                <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden'>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 transition-colors ${
                      previewDevice === 'desktop'
                        ? 'bg-[#1B998B] text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title='Aperçu desktop'
                  >
                    <Monitor className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 transition-colors ${
                      previewDevice === 'mobile'
                        ? 'bg-[#1B998B] text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title='Aperçu mobile'
                  >
                    <Smartphone className='w-4 h-4' />
                  </button>
                </div>
              )}
            </>
          )}
          {!isCourse && <div className='w-px h-6 bg-gray-200' />}
          {/* ─── Course flow: step-based buttons ─── */}
          {isCourse ? (
            <>
              <button
                onClick={onBack}
                className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors'
              >
                Retour
              </button>
              {courseStep === 'metadata' ? (
                <button
                  onClick={async () => {
                    const formData = getFormData();
                    if (courseId) {
                      await onSave(formData);
                      setCourseStep('builder');
                    } else {
                      const result = await onSave(formData);
                      if (
                        result &&
                        typeof result === 'object' &&
                        'id' in result
                      ) {
                        setCourseId((result as { id: string }).id);
                      }
                      setCourseStep('builder');
                    }
                  }}
                  disabled={isSaving || !title.trim()}
                  className='flex items-center gap-2 px-5 py-2 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
                >
                  {isSaving ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <ArrowRight className='w-4 h-4' />
                  )}
                  Suivant
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowCoursePreview(true)}
                    className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    <Eye className='w-4 h-4' />
                    Aperçu
                  </button>
                  {content?.status === 'published' ? (
                    <button
                      onClick={() => setShowUnpublishModal(true)}
                      disabled={isSaving}
                      className='flex items-center gap-2 px-4 py-2 text-sm font-medium border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors'
                    >
                      <RotateCcw className='w-4 h-4' />
                      Remettre en brouillon
                    </button>
                  ) : (
                    <>
                      {onSchedule && (
                        <button
                          onClick={() => setShowScheduleModal(true)}
                          disabled={isSaving || !title.trim()}
                          className='flex items-center gap-2 px-4 py-2 text-sm font-medium border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 transition-colors'
                        >
                          <Calendar className='w-4 h-4' />
                          Planifier
                        </button>
                      )}
                      <button
                        onClick={() => setShowPublishModal(true)}
                        disabled={isSaving || !title.trim()}
                        className='flex items-center gap-2 px-5 py-2 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
                      >
                        <Send className='w-4 h-4' />
                        Publier
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {/* ─── Standard flow (non-course) ─── */}
              <button
                onClick={onBack}
                className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors'
              >
                Retour
              </button>
              {content?.status === 'published' ? (
                <button
                  onClick={() => setShowUnpublishModal(true)}
                  disabled={isSaving}
                  className='flex items-center gap-2 px-4 py-2 text-sm font-medium border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors'
                >
                  <RotateCcw className='w-4 h-4' />
                  Remettre en brouillon
                </button>
              ) : (
                <>
                  {onSchedule && (
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      disabled={isSaving || !title.trim()}
                      className='flex items-center gap-2 px-4 py-2 text-sm border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 transition-colors'
                    >
                      <Calendar className='w-4 h-4' />
                      Planifier
                    </button>
                  )}
                  <button
                    onClick={() => setShowPublishModal(true)}
                    disabled={isSaving || !title.trim()}
                    className='flex items-center gap-2 px-4 py-2 text-sm bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
                  >
                    <Send className='w-4 h-4' />
                    Publier
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview mode */}
      {isPreview ? (
        <div className='flex-1 overflow-y-auto bg-gray-100'>
          <div
            className={`mx-auto py-8 px-6 transition-all ${
              previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-3xl'
            }`}
          >
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
              {/* Thumbnail */}
              {thumbnailUrl && (
                <div className='aspect-video w-full overflow-hidden'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className='w-full h-full object-cover'
                  />
                </div>
              )}
              <div className='px-6 py-6'>
                {/* Category + reading time */}
                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-xs font-medium text-[#1B998B] bg-[#1B998B]/10 px-2.5 py-1 rounded-full'>
                    {category.startsWith('custom:')
                      ? customCategories.find(
                          c => `custom:${c.id}` === category
                        )?.name || 'Personnalisée'
                      : CONTENT_CATEGORY_LABELS[category as ContentCategory] ||
                        category}
                  </span>
                  {readingTime && (
                    <span className='text-xs text-gray-400 flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      {formatReadingTime(readingTime)}
                    </span>
                  )}
                </div>
                {/* Title */}
                <h1
                  className={`font-bold text-gray-900 mb-3 ${
                    previewDevice === 'mobile' ? 'text-xl' : 'text-2xl'
                  }`}
                >
                  {title || 'Titre du contenu'}
                </h1>
                {/* Summary */}
                {summary && (
                  <p className='text-gray-500 text-sm mb-6 leading-relaxed'>
                    {summary}
                  </p>
                )}
                {/* Key points */}
                {keyPoints.length > 0 && (
                  <div className='bg-[#1B998B]/5 rounded-xl p-4 mb-6'>
                    <h3 className='text-sm font-semibold text-[#1B998B] mb-2'>
                      Points clés
                    </h3>
                    <ul className='space-y-1.5'>
                      {keyPoints.map((point, i) => (
                        <li
                          key={i}
                          className='flex items-start gap-2 text-sm text-gray-700'
                        >
                          <Check className='w-4 h-4 text-[#1B998B] flex-shrink-0 mt-0.5' />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Body */}
                <div
                  className='prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
                />
                {/* Tags */}
                {tags.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100'>
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className='text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full'
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Form body */
        <div
          className={`flex-1 ${isCourse && courseStep === 'builder' ? 'overflow-hidden' : 'overflow-y-auto'}`}
        >
          {/* ─── Course step 2: CourseBuilder ─── */}
          {isCourse && courseStep === 'builder' && courseId && (
            <div className='w-full h-full'>
              <CourseBuilderComponent
                courseId={courseId}
                courseTitle={title}
                courseSummary={summary}
                courseThumbnailUrl={thumbnailUrl}
                onCourseTitleChange={setTitle}
                onCourseSummaryChange={setSummary}
                onThumbnailUpload={handleThumbnailUpload}
                onThumbnailRemove={() => setThumbnailUrl('')}
                isUploadingThumbnail={isUploadingThumbnail}
                onMetadataAutoSave={onAutoSave ? triggerAutoSave : undefined}
              />
            </div>
          )}

          {/* ─── Metadata form (step 1 for courses, always for others) ─── */}
          {(!isCourse || courseStep === 'metadata') && (
            <div className='max-w-4xl mx-auto px-6 py-6 space-y-6'>
              {/* Title */}
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <label className='text-sm font-medium text-gray-700'>
                    Titre
                  </label>
                  {savingField === 'title' && (
                    <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
                  )}
                  {savedField === 'title' && (
                    <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                      <Check className='w-3 h-3' />
                      Enregistré
                    </span>
                  )}
                </div>
                <input
                  type='text'
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    triggerAutoSave('title');
                  }}
                  placeholder='Titre du contenu'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                  maxLength={200}
                />
              </div>

              {/* Summary */}
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <label className='text-sm font-medium text-gray-700'>
                    Résumé
                  </label>
                  {savingField === 'summary' && (
                    <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
                  )}
                  {savedField === 'summary' && (
                    <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                      <Check className='w-3 h-3' />
                      Enregistré
                    </span>
                  )}
                </div>
                <textarea
                  value={summary}
                  onChange={e => {
                    setSummary(e.target.value);
                    triggerAutoSave('summary');
                  }}
                  placeholder='Court résumé du contenu (visible dans la liste)'
                  rows={2}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                  maxLength={500}
                />
              </div>

              {/* Category */}
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <label className='text-sm font-medium text-gray-700'>
                    Catégorie
                  </label>
                  {savingField === 'category' && (
                    <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
                  )}
                  {savedField === 'category' && (
                    <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                      <Check className='w-3 h-3' />
                      Enregistré
                    </span>
                  )}
                </div>
                <CustomDropdown
                  value={category}
                  options={[
                    ...Object.entries(CONTENT_CATEGORY_LABELS)
                      .filter(([key]) => key !== 'other')
                      .map(([value, label]) => ({ value, label })),
                    ...(customCategories.length > 0
                      ? [
                          {
                            value: '__divider__',
                            label: '── Personnalisées ──',
                          },
                          ...customCategories.map(c => ({
                            value: `custom:${c.id}`,
                            label: c.name,
                          })),
                        ]
                      : []),
                    ...(onCreateCategory
                      ? [
                          {
                            value: '__create__',
                            label: '+ Ajouter une catégorie',
                            variant: 'action' as const,
                          },
                        ]
                      : []),
                  ]}
                  placeholder='Choisir une catégorie…'
                  onChange={v => {
                    if (v === '__create__') {
                      setShowCategoryModal(true);
                    } else {
                      setCategory(v as ContentCategory);
                      triggerAutoSave('category');
                    }
                  }}
                  allowReset={false}
                />
              </div>

              {/* Thumbnail upload */}
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <label className='text-sm font-medium text-gray-700'>
                    Vignette
                  </label>
                  {savingField === 'thumbnail' && (
                    <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
                  )}
                  {savedField === 'thumbnail' && (
                    <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                      <Check className='w-3 h-3' />
                      Enregistré
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/jpeg,image/png,image/webp'
                  className='hidden'
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleThumbnailUpload(file);
                    e.target.value = '';
                  }}
                />
                {thumbnailUrl ? (
                  <div className='space-y-3'>
                    <div className='relative w-full max-w-lg aspect-video rounded-lg border border-gray-200 overflow-hidden'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl}
                        alt='Vignette'
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='flex items-center gap-3'>
                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingThumbnail}
                        className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        <Upload className='w-4 h-4' />
                        Changer
                      </button>
                      <button
                        type='button'
                        onClick={() => setThumbnailUrl('')}
                        className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors'
                      >
                        <Trash2 className='w-4 h-4' />
                        Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingThumbnail}
                    className='flex items-center justify-center gap-3 w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1B998B] hover:bg-[#1B998B]/5 transition-colors cursor-pointer'
                  >
                    {isUploadingThumbnail ? (
                      <>
                        <Loader2 className='w-5 h-5 text-[#1B998B] animate-spin' />
                        <span className='text-sm text-gray-500'>
                          Upload en cours...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className='w-5 h-5 text-gray-400' />
                        <div className='text-left'>
                          <p className='text-sm font-medium text-gray-700'>
                            Cliquez pour ajouter une vignette
                          </p>
                          <p className='text-xs text-gray-400'>
                            JPEG, PNG ou WebP — max 2 MB — format 16:9
                            recommandé
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Media URL (for video/guide/podcast - not course) */}
              {!isArticle && type !== 'course' && (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <div className='flex items-center justify-between mb-1'>
                        <label className='text-sm font-medium text-gray-700'>
                          Type de média
                        </label>
                        {savingField === 'media' && (
                          <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
                        )}
                        {savedField === 'media' && (
                          <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                            <Check className='w-3 h-3' />
                            Enregistré
                          </span>
                        )}
                      </div>
                      <CustomDropdown
                        value={mediaType}
                        options={
                          type === 'video'
                            ? [
                                { value: 'youtube', label: 'YouTube' },
                                { value: 'vimeo', label: 'Vimeo' },
                                { value: 'external', label: 'Lien externe' },
                              ]
                            : type === 'guide'
                              ? [
                                  { value: 'pdf', label: 'Upload PDF' },
                                  { value: 'external', label: 'Lien externe' },
                                ]
                              : type === 'podcast'
                                ? [
                                    { value: 'spotify', label: 'Spotify' },
                                    { value: 'apple', label: 'Apple Podcasts' },
                                    {
                                      value: 'external',
                                      label: 'Lien externe',
                                    },
                                  ]
                                : []
                        }
                        placeholder='Sélectionnez...'
                        onChange={v => {
                          setMediaType(v);
                          triggerAutoSave('media');
                        }}
                        allowReset={false}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        URL du média
                      </label>
                      <input
                        type='url'
                        value={mediaUrl}
                        onChange={e => {
                          setMediaUrl(e.target.value);
                          triggerAutoSave('media');
                        }}
                        placeholder={
                          type === 'video'
                            ? 'https://youtube.com/...'
                            : type === 'podcast'
                              ? 'https://open.spotify.com/...'
                              : 'URL du document'
                        }
                        className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                      />
                    </div>
                  </div>
                  {/* Duration input for video/podcast */}
                  {(type === 'video' || type === 'podcast') && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Durée (minutes)
                      </label>
                      <input
                        type='number'
                        min={0}
                        max={600}
                        value={durationMinutes || ''}
                        onChange={e =>
                          setDurationMinutes(Math.max(0, +e.target.value))
                        }
                        placeholder='ex: 15'
                        className='w-32 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
                      />
                    </div>
                  )}
                  {/* YouTube preview */}
                  {type === 'video' && mediaType === 'youtube' && mediaUrl && (
                    <div className='mt-3'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Aperçu
                      </label>
                      <div className='aspect-video max-w-lg rounded-lg overflow-hidden border border-gray-200'>
                        <iframe
                          src={`https://www.youtube.com/embed/${
                            mediaUrl.match(/(?:v=|\/)([\w-]{11})/)?.[1] ||
                            mediaUrl.match(/youtu\.be\/([\w-]{11})/)?.[1] ||
                            ''
                          }`}
                          className='w-full h-full'
                          allowFullScreen
                          title='Aperçu vidéo'
                        />
                      </div>
                    </div>
                  )}
                  {/* PDF upload zone for guides */}
                  {type === 'guide' && mediaType === 'pdf' && (
                    <div>
                      <input
                        ref={pdfInputRef}
                        type='file'
                        accept='application/pdf'
                        className='hidden'
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handlePdfUpload(file);
                          e.target.value = '';
                        }}
                      />
                      {mediaUrl && pdfFileName ? (
                        <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200'>
                          <FileText className='w-5 h-5 text-green-600' />
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900 truncate'>
                              {pdfFileName}
                            </p>
                            <p className='text-xs text-gray-500'>PDF uploadé</p>
                          </div>
                          <button
                            type='button'
                            onClick={() => pdfInputRef.current?.click()}
                            disabled={isUploadingPdf}
                            className='text-sm text-[#1B998B] hover:underline'
                          >
                            Changer
                          </button>
                        </div>
                      ) : (
                        <button
                          type='button'
                          onClick={() => pdfInputRef.current?.click()}
                          disabled={isUploadingPdf}
                          className='flex items-center justify-center gap-3 w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1B998B] hover:bg-[#1B998B]/5 transition-colors cursor-pointer'
                        >
                          {isUploadingPdf ? (
                            <>
                              <Loader2 className='w-5 h-5 text-[#1B998B] animate-spin' />
                              <span className='text-sm text-gray-500'>
                                Upload en cours...
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className='w-5 h-5 text-gray-400' />
                              <div className='text-left'>
                                <p className='text-sm font-medium text-gray-700'>
                                  Cliquez pour uploader un PDF
                                </p>
                                <p className='text-xs text-gray-400'>
                                  Maximum 20 Mo
                                </p>
                              </div>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Rich text editor (for articles, optional for others - not course) */}
              {type !== 'course' && (
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='text-sm font-medium text-gray-700'>
                      {isArticle
                        ? "Contenu de l'article"
                        : 'Description (optionnel)'}
                    </label>
                    {savingField === 'content' && (
                      <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
                    )}
                    {savedField === 'content' && (
                      <span className='flex items-center gap-1 text-xs text-[#1B998B]'>
                        <Check className='w-3 h-3' />
                        Enregistré
                      </span>
                    )}
                  </div>
                  <div className='border border-gray-300 rounded-lg overflow-hidden'>
                    <EditorToolbar editor={editor} />
                    <EditorContent editor={editor} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmation de publication */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
            onClick={() => setShowPublishModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-5'>
                <h3 className='text-base font-semibold text-gray-900'>
                  Publier le contenu
                </h3>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  <X className='w-5 h-5 text-gray-400' />
                </button>
              </div>

              <p className='text-sm text-gray-500 mb-5'>
                Le contenu sera immédiatement visible par vos patients.
              </p>

              <div className='mb-6'>
                <label className='flex items-center gap-3 cursor-pointer group'>
                  <button
                    type='button'
                    role='checkbox'
                    aria-checked={notifyPatients}
                    onClick={() => setNotifyPatients(!notifyPatients)}
                    className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                      notifyPatients
                        ? 'bg-[#1B998B] border-[#1B998B]'
                        : 'border-gray-300 group-hover:border-[#1B998B]/50'
                    }`}
                  >
                    {notifyPatients && (
                      <svg
                        className='w-3 h-3 text-white'
                        viewBox='0 0 12 12'
                        fill='none'
                      >
                        <path
                          d='M2 6l3 3 5-5'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    )}
                  </button>
                  <span className='text-sm text-gray-600'>
                    Notifier mes patients lors de la publication
                  </span>
                </label>
              </div>

              <div className='flex justify-end gap-2'>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className='px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    onPublish(getFormData());
                    setShowPublishModal(false);
                  }}
                  disabled={isSaving}
                  className='flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
                >
                  <Send className='w-4 h-4' />
                  Publier maintenant
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de remise en brouillon */}
      <AnimatePresence>
        {showUnpublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
            onClick={() => setShowUnpublishModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-base font-semibold text-gray-900'>
                  Remettre en brouillon
                </h3>
                <button
                  onClick={() => setShowUnpublishModal(false)}
                  className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  <X className='w-5 h-5 text-gray-400' />
                </button>
              </div>

              <div className='p-4 bg-orange-50 border border-orange-200 rounded-xl mb-5'>
                <p className='text-sm text-orange-800 font-medium mb-1'>
                  Attention
                </p>
                <p className='text-sm text-orange-700'>
                  En remettant ce contenu en brouillon, il ne sera plus
                  accessible à vos patients. Ils ne pourront plus le consulter
                  tant qu&apos;il ne sera pas republié.
                </p>
              </div>

              <div className='flex justify-end gap-2'>
                <button
                  onClick={() => setShowUnpublishModal(false)}
                  className='px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    onUnpublish?.();
                    setShowUnpublishModal(false);
                  }}
                  disabled={isSaving}
                  className='flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors'
                >
                  <RotateCcw className='w-4 h-4' />
                  Remettre en brouillon
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal planification */}
      {showScheduleModal &&
        (() => {
          const parsedDate = scheduledDate ? new Date(scheduledDate) : null;
          const calMonth = parsedDate
            ? new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1)
            : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const schedHour = parsedDate
            ? String(parsedDate.getHours()).padStart(2, '0')
            : '09';
          const schedMinute = parsedDate
            ? String(parsedDate.getMinutes()).padStart(2, '0')
            : '00';

          const daysInMonthCount = new Date(
            calMonth.getFullYear(),
            calMonth.getMonth() + 1,
            0
          ).getDate();
          const firstDow = new Date(
            calMonth.getFullYear(),
            calMonth.getMonth(),
            1
          ).getDay();
          const startOffset = firstDow === 0 ? 6 : firstDow - 1;

          const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
          const monthNames = [
            'Janvier',
            'Février',
            'Mars',
            'Avril',
            'Mai',
            'Juin',
            'Juillet',
            'Août',
            'Septembre',
            'Octobre',
            'Novembre',
            'Décembre',
          ];

          const isSelected = (day: number) => {
            if (!parsedDate) return false;
            return (
              parsedDate.getFullYear() === calMonth.getFullYear() &&
              parsedDate.getMonth() === calMonth.getMonth() &&
              parsedDate.getDate() === day
            );
          };

          const isToday = (day: number) => {
            const d = new Date();
            return (
              d.getFullYear() === calMonth.getFullYear() &&
              d.getMonth() === calMonth.getMonth() &&
              d.getDate() === day
            );
          };

          const isPast = (day: number) => {
            const d = new Date(
              calMonth.getFullYear(),
              calMonth.getMonth(),
              day
            );
            d.setHours(0, 0, 0, 0);
            return d < today;
          };

          const selectDay = (day: number) => {
            const h = schedHour;
            const m = schedMinute;
            const d = new Date(
              calMonth.getFullYear(),
              calMonth.getMonth(),
              day,
              parseInt(h),
              parseInt(m)
            );
            setScheduledDate(d.toISOString().slice(0, 16));
          };

          const changeMonth = (dir: number) => {
            const newMonth = new Date(
              calMonth.getFullYear(),
              calMonth.getMonth() + dir,
              1
            );
            // Update scheduledDate to keep selected day if possible, or just update month
            if (parsedDate) {
              const newDay = Math.min(
                parsedDate.getDate(),
                new Date(
                  newMonth.getFullYear(),
                  newMonth.getMonth() + 1,
                  0
                ).getDate()
              );
              const d = new Date(
                newMonth.getFullYear(),
                newMonth.getMonth(),
                newDay,
                parsedDate.getHours(),
                parsedDate.getMinutes()
              );
              setScheduledDate(d.toISOString().slice(0, 16));
            } else {
              const d = new Date(
                newMonth.getFullYear(),
                newMonth.getMonth(),
                1,
                9,
                0
              );
              setScheduledDate(d.toISOString().slice(0, 16));
            }
          };

          const updateTime = (h: string, m: string) => {
            if (parsedDate) {
              const d = new Date(
                parsedDate.getFullYear(),
                parsedDate.getMonth(),
                parsedDate.getDate(),
                parseInt(h),
                parseInt(m)
              );
              setScheduledDate(d.toISOString().slice(0, 16));
            }
          };

          return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
              <div className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'>
                <div className='flex items-center justify-between mb-5'>
                  <h3 className='text-base font-semibold text-gray-900'>
                    Planifier la publication
                  </h3>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    <X className='w-5 h-5 text-gray-400' />
                  </button>
                </div>

                {/* Calendar */}
                <div className='mb-5'>
                  {/* Month navigation */}
                  <div className='flex items-center justify-between mb-3'>
                    <button
                      onClick={() => changeMonth(-1)}
                      className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors'
                    >
                      <ChevronLeft className='w-4 h-4' />
                    </button>
                    <span className='text-sm font-medium text-gray-700'>
                      {monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}
                    </span>
                    <button
                      onClick={() => changeMonth(1)}
                      className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors'
                    >
                      <ChevronRight className='w-4 h-4' />
                    </button>
                  </div>

                  {/* Week day headers */}
                  <div className='grid grid-cols-7 gap-1 mb-1'>
                    {weekDays.map(d => (
                      <div
                        key={d}
                        className='text-center text-xs font-medium text-gray-400 py-1'
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div className='grid grid-cols-7 gap-1'>
                    {Array.from({ length: startOffset }).map((_, i) => (
                      <div key={`e-${i}`} className='aspect-square' />
                    ))}
                    {Array.from({ length: daysInMonthCount }).map((_, i) => {
                      const day = i + 1;
                      const past = isPast(day);
                      const sel = isSelected(day);
                      const tod = isToday(day);
                      return (
                        <button
                          key={day}
                          type='button'
                          disabled={past}
                          onClick={() => selectDay(day)}
                          className={`aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                            past
                              ? 'text-gray-200 cursor-not-allowed'
                              : sel
                                ? 'bg-[#1B998B] text-white shadow-sm'
                                : tod
                                  ? 'bg-[#1B998B]/10 text-[#1B998B] font-bold hover:bg-[#1B998B]/20'
                                  : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time picker */}
                <div className='mb-5'>
                  <label className='block text-xs font-medium text-gray-600 mb-2'>
                    Heure de publication
                  </label>
                  <div className='flex items-center gap-2'>
                    <CustomDropdown
                      value={schedHour}
                      onChange={v => updateTime(v, schedMinute)}
                      options={Array.from({ length: 24 }).map((_, h) => ({
                        value: String(h).padStart(2, '0'),
                        label: `${String(h).padStart(2, '0')}h`,
                      }))}
                      placeholder='Heure'
                      allowReset={false}
                      className='flex-1'
                    />
                    <span className='text-gray-400 font-medium'>:</span>
                    <CustomDropdown
                      value={schedMinute}
                      onChange={v => updateTime(schedHour, v)}
                      options={['00', '15', '30', '45'].map(m => ({
                        value: m,
                        label: `${m} min`,
                      }))}
                      placeholder='Minutes'
                      allowReset={false}
                      className='flex-1'
                    />
                  </div>
                </div>

                {/* Notify patients */}
                <div className='mb-6'>
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <button
                      type='button'
                      role='checkbox'
                      aria-checked={notifyPatients}
                      onClick={() => setNotifyPatients(!notifyPatients)}
                      className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                        notifyPatients
                          ? 'bg-[#1B998B] border-[#1B998B]'
                          : 'border-gray-300 group-hover:border-[#1B998B]/50'
                      }`}
                    >
                      {notifyPatients && (
                        <svg
                          className='w-3 h-3 text-white'
                          viewBox='0 0 12 12'
                          fill='none'
                        >
                          <path
                            d='M2 6l3 3 5-5'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      )}
                    </button>
                    <span className='text-sm text-gray-600'>
                      Notifier mes patients lors de la publication
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className='flex justify-end gap-2'>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className='px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      if (scheduledDate && onSchedule) {
                        onSchedule(
                          getFormData(),
                          new Date(scheduledDate).toISOString()
                        );
                        setShowScheduleModal(false);
                      }
                    }}
                    disabled={!scheduledDate}
                    className='flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
                  >
                    <Calendar className='w-4 h-4' />
                    Planifier
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Modal d'erreur upload */}
      {uploadError && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='w-5 h-5 text-red-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Erreur d&apos;upload
              </h3>
            </div>
            <p className='text-sm text-gray-600 mb-6'>{uploadError}</p>
            <div className='flex justify-end'>
              <button
                type='button'
                onClick={() => setUploadError(null)}
                className='px-4 py-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] transition-colors text-sm font-medium'
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create category modal */}
      <CreateCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCreate={name => {
          if (onCreateCategory) onCreateCategory(name);
          setShowCategoryModal(false);
        }}
      />

      {/* Course preview modal */}
      {showCoursePreview && courseId && (
        <CoursePreview
          courseId={courseId}
          onClose={() => setShowCoursePreview(false)}
        />
      )}
    </div>
  );
}
