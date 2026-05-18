'use client';

import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
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
  Trash2,
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
} from 'lucide-react';

// ─── Constants ───

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
                  ... {rows}x{cols} au total
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

                el.style.maxHeight = `${maxHeight}px`;

                const menuHeight = Math.min(el.scrollHeight, maxHeight);
                const spaceBelow = window.innerHeight - rect.bottom - padding;
                const spaceRight = window.innerWidth - rect.left - padding;

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

// ─── Toolbar ───

function EditorToolbar({
  editor,
  compact = false,
}: {
  editor: ReturnType<typeof useEditor>;
  compact?: boolean;
}) {
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
    compact
      ? `w-7 h-7 flex items-center justify-center rounded transition-colors ${
          active ? 'bg-[#1B998B] text-white' : 'text-gray-500 hover:bg-gray-100'
        }`
      : `p-1.5 rounded transition-colors ${
          active ? 'bg-[#1B998B] text-white' : 'text-gray-500 hover:bg-gray-100'
        }`;

  const disabledBtnClass = compact
    ? 'w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors'
    : 'p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors';

  const iconSize = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const separator = compact ? (
    <div className='w-px h-5 bg-gray-300 mx-0.5' />
  ) : (
    <div className='w-px h-5 bg-gray-300 mx-1' />
  );

  return (
    <>
      <div
        className={`flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-${compact ? 'white' : 'gray-50'} ${compact ? 'px-2 py-1.5 rounded-t-lg' : 'px-3 py-2'}`}
      >
        {/* ── Texte ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive('bold'))}
          title='Gras (Ctrl+B)'
        >
          <Bold className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive('italic'))}
          title='Italique (Ctrl+I)'
        >
          <Italic className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive('underline'))}
          title='Souligné (Ctrl+U)'
        >
          <UnderlineIcon className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass(editor.isActive('strike'))}
          title='Barré'
        >
          <Strikethrough className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={btnClass(editor.isActive('highlight'))}
          title='Surligner'
        >
          <Highlighter className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={btnClass(editor.isActive('code'))}
          title='Code inline'
        >
          <Code className={iconSize} />
        </button>

        {/* Couleur du texte */}
        <div className='relative'>
          <button
            type='button'
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={
              compact
                ? 'w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 transition-colors'
                : 'p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors'
            }
            title='Couleur du texte'
          >
            <Type className={iconSize} />
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
          <Pilcrow className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={btnClass(editor.isActive('heading', { level: 1 }))}
          title='Titre 1'
        >
          <Heading1 className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          title='Titre 2'
        >
          <Heading2 className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={btnClass(editor.isActive('heading', { level: 3 }))}
          title='Titre 3'
        >
          <Heading3 className={iconSize} />
        </button>

        {separator}

        {/* ── Listes & blocs ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive('bulletList'))}
          title='Liste à puces'
        >
          <List className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
          title='Liste numérotée'
        >
          <ListOrdered className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive('blockquote'))}
          title='Citation'
        >
          <Quote className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={btnClass(editor.isActive('codeBlock'))}
          title='Bloc de code'
        >
          <Code className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={disabledBtnClass}
          title='Ligne horizontale'
        >
          <Minus className={iconSize} />
        </button>

        {separator}

        {/* ── Alignement ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={btnClass(editor.isActive({ textAlign: 'left' }))}
          title='Aligner à gauche'
        >
          <AlignLeft className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={btnClass(editor.isActive({ textAlign: 'center' }))}
          title='Centrer'
        >
          <AlignCenter className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={btnClass(editor.isActive({ textAlign: 'right' }))}
          title='Aligner à droite'
        >
          <AlignRight className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={btnClass(editor.isActive({ textAlign: 'justify' }))}
          title='Justifier'
        >
          <AlignJustify className={iconSize} />
        </button>

        {separator}

        {/* ── Exposant / Indice ── */}
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={btnClass(editor.isActive('subscript'))}
          title='Indice'
        >
          <SubscriptIcon className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={btnClass(editor.isActive('superscript'))}
          title='Exposant'
        >
          <SuperscriptIcon className={iconSize} />
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
            <Unlink className={iconSize} />
          ) : (
            <LinkIcon className={iconSize} />
          )}
        </button>
        <button
          type='button'
          onClick={() => setShowImageModal(true)}
          className={disabledBtnClass}
          title='Insérer une image'
        >
          <ImageIcon className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => setShowYoutubeModal(true)}
          className={disabledBtnClass}
          title='Intégrer une vidéo YouTube'
        >
          <YoutubeIcon className={iconSize} />
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
            <TableIcon className={iconSize} />
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
          <Undo className={iconSize} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={disabledBtnClass}
          title='Refaire (Ctrl+Shift+Z)'
        >
          <Redo className={iconSize} />
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
          <RemoveFormatting className={iconSize} />
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
          editor.commands.setYoutubeVideo({
            src: url,
            width: 640,
            height: 360,
          })
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

// ─── Shared Extensions Builder ───

function buildExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
    }),
    Placeholder.configure({ placeholder }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Subscript,
    Superscript,
    Youtube.configure({ controls: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ];
}

// ─── Main Component ───

export interface RichTextEditorProps {
  content: string;
  onSave: (html: string) => void;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  compact?: boolean;
}

export default function RichTextEditor({
  content,
  onSave,
  onChange,
  placeholder = 'Saisissez le contenu ici...',
  minHeight = '120px',
  compact = false,
}: RichTextEditorProps) {
  const hasChangedRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildExtensions(placeholder),
    content: content || '',
    onUpdate: ({ editor: ed }) => {
      hasChangedRef.current = true;
      onChange?.(ed.getHTML());
    },
    onBlur: ({ editor: ed }) => {
      if (hasChangedRef.current) {
        onSave(ed.getHTML());
        hasChangedRef.current = false;
      }
    },
  });

  if (!editor) return null;

  return (
    <div className='border border-gray-300 rounded-lg overflow-hidden'>
      <EditorToolbar editor={editor} compact={compact} />
      <EditorContent
        editor={editor}
        className={`px-3 py-2 prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0`}
        style={{ minHeight }}
      />
    </div>
  );
}
