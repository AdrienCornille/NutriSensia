'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronDown,
  Copy,
  Download,
  Check,
  ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ShoppingList, ShoppingCategory } from '@/types/meal-plan';
import { shoppingCategoryConfig } from '@/types/meal-plan';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoppingList: ShoppingList | null;
}

/**
 * Section de catégorie avec items
 */
function CategorySection({
  category,
  items,
  checkedItems,
  onToggleItem,
}: {
  category: ShoppingCategory;
  items: ShoppingList['categories'][0]['items'];
  checkedItems: Set<string>;
  onToggleItem: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = shoppingCategoryConfig[category];
  const checkedCount = items.filter(item => checkedItems.has(item.id)).length;

  return (
    <div className='border border-gray-200 rounded-lg overflow-hidden'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <span className='text-xl'>{config.icon}</span>
          <div className='text-left'>
            <p className='font-medium text-gray-800'>{config.label}</p>
            <p className='text-sm text-gray-500'>
              {checkedCount}/{items.length} article{items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='border-t border-gray-100 divide-y divide-gray-50'>
              {items.map(item => {
                const isChecked = checkedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 ${
                      isChecked ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <button
                      onClick={() => onToggleItem(item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-[#1B998B] border-[#1B998B]'
                          : 'border-gray-300 hover:border-[#1B998B]'
                      }`}
                    >
                      {isChecked && <Check className='w-3 h-3 text-white' />}
                    </button>
                    <div className='flex-1'>
                      <p
                        className={`font-medium ${
                          isChecked
                            ? 'text-gray-400 line-through'
                            : 'text-gray-800'
                        }`}
                      >
                        {item.name}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p
                        className={`font-medium ${
                          isChecked ? 'text-gray-400' : 'text-[#1B998B]'
                        }`}
                      >
                        {item.weeklyQuantity}
                      </p>
                      <p className='text-xs text-gray-400'>
                        {item.occurrences}x / semaine
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ShoppingListModal({
  isOpen,
  onClose,
  shoppingList,
}: ShoppingListModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  const handleToggleItem = (id: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalChecked = useMemo(() => {
    if (!shoppingList) return 0;
    return shoppingList.categories.reduce(
      (acc, cat) =>
        acc + cat.items.filter(item => checkedItems.has(item.id)).length,
      0
    );
  }, [shoppingList, checkedItems]);

  const formatListAsText = (): string => {
    if (!shoppingList) return '';

    let text = `🛒 Liste de courses - Semaine du ${shoppingList.weekStart.getDate()} au ${shoppingList.weekEnd.getDate()} ${shoppingList.weekStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}\n\n`;

    for (const { category, items } of shoppingList.categories) {
      const config = shoppingCategoryConfig[category];
      text += `${config.icon} ${config.label}\n`;
      for (const item of items) {
        const checked = checkedItems.has(item.id) ? '✓' : '○';
        text += `  ${checked} ${item.name} - ${item.weeklyQuantity}\n`;
      }
      text += '\n';
    }

    return text;
  };

  const handleCopyToClipboard = async () => {
    const text = formatListAsText();
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleDownload = () => {
    const text = formatListAsText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `liste-courses-${shoppingList?.weekStart.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCheckedItems(new Set());
    onClose();
  };

  if (!shoppingList) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className='fixed inset-0 bg-black/50 z-40'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
          >
            <div className='bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col'>
              {/* Header */}
              <div className='flex items-center justify-between p-6 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-[#1B998B]/10 rounded-lg flex items-center justify-center'>
                    <ShoppingCart className='w-5 h-5 text-[#1B998B]' />
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold text-gray-800'>
                      Liste de courses
                    </h2>
                    <p className='text-sm text-gray-500'>
                      {shoppingList.totalItems} articles • {totalChecked} cochés
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Content */}
              <div className='flex-1 overflow-y-auto p-6 space-y-3'>
                {shoppingList.categories.map(({ category, items }) => (
                  <CategorySection
                    key={category}
                    category={category}
                    items={items}
                    checkedItems={checkedItems}
                    onToggleItem={handleToggleItem}
                  />
                ))}
              </div>

              {/* Footer with actions */}
              <div className='p-4 border-t border-gray-100 bg-gray-50'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-sm text-gray-500'>
                    Semaine du {shoppingList.weekStart.getDate()} au{' '}
                    {shoppingList.weekEnd.getDate()}{' '}
                    {shoppingList.weekStart.toLocaleDateString('fr-FR', {
                      month: 'long',
                    })}
                  </p>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={handleCopyToClipboard}
                      className='flex items-center gap-2 px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors'
                    >
                      {copySuccess ? (
                        <>
                          <Check className='w-4 h-4 text-[#1B998B]' />
                          <span className='text-[#1B998B]'>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className='w-4 h-4' />
                          Copier
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className='flex items-center gap-2 px-4 py-2 bg-[#1B998B] text-white font-medium rounded-lg hover:bg-[#158578] transition-colors'
                    >
                      <Download className='w-4 h-4' />
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ShoppingListModal;
