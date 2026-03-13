'use client';

import React, { useState } from 'react';
import { X, Loader2, ShoppingCart, Printer, Send, Check } from 'lucide-react';
import {
  usePlanShoppingList,
  useSendShoppingList,
  type ShoppingListData,
} from '@/hooks/useNutritionistMealPlans';

// ============================================================================
// Types
// ============================================================================

interface ShoppingListModalProps {
  patientId: string;
  planId: string;
  planName: string;
  isPublished: boolean;
  onClose: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

function formatShoppingListMessage(
  data: ShoppingListData,
  planName: string
): string {
  const lines: string[] = [];
  lines.push(`Liste de courses - ${planName}`);
  lines.push('');

  for (const category of data.categories) {
    const items = data.items.filter((i) => i.category === category);
    lines.push(`${category}`);
    for (const item of items) {
      lines.push(`  - ${item.name} : ${item.total_quantity} ${item.unit}`);
    }
    lines.push('');
  }

  lines.push(`${data.items.length} article${data.items.length > 1 ? 's' : ''} au total`);
  return lines.join('\n');
}

// ============================================================================
// Component
// ============================================================================

export function ShoppingListModal({
  patientId,
  planId,
  planName,
  isPublished,
  onClose,
}: ShoppingListModalProps) {
  const { data, isLoading } = usePlanShoppingList(patientId, planId, true);
  const sendMutation = useSendShoppingList(patientId, planId);
  const [sent, setSent] = useState(false);

  // Close on Escape
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handlePrint() {
    window.print();
  }

  function handleSendToPatient() {
    if (!data || data.items.length === 0) return;

    const message = formatShoppingListMessage(data, planName);
    sendMutation.mutate(
      { message },
      {
        onSuccess: () => {
          setSent(true);
        },
      }
    );
  }

  const hasItems = data && data.items.length > 0;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='p-5 border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                <ShoppingCart className='w-5 h-5 text-[#1B998B]' />
                Liste de courses
              </h3>
              <p className='text-xs text-gray-500 mt-0.5'>{planName}</p>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={handlePrint}
                className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
                title='Imprimer'
              >
                <Printer className='w-4 h-4' />
              </button>
              <button
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-4 min-h-0'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
              <span className='ml-2 text-sm text-gray-500'>
                Génération de la liste...
              </span>
            </div>
          ) : !hasItems ? (
            <div className='text-center py-8'>
              <ShoppingCart className='w-8 h-8 text-gray-300 mx-auto mb-2' />
              <p className='text-sm text-gray-500'>
                Aucun aliment dans ce plan
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                Ajoutez des aliments au plan pour générer la liste de courses
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {data.categories.map((category) => {
                const items = data.items.filter(
                  (i) => i.category === category
                );
                return (
                  <div key={category}>
                    <h4 className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
                      {category}
                    </h4>
                    <div className='space-y-1'>
                      {items.map((item, i) => (
                        <div
                          key={`${item.food_id || item.name}-${i}`}
                          className='flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg'
                        >
                          <span className='text-sm text-gray-800'>
                            {item.name}
                          </span>
                          <span className='text-sm font-medium text-gray-600 shrink-0 ml-3'>
                            {item.total_quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className='pt-3 border-t border-gray-100'>
                <p className='text-xs text-gray-400 text-center'>
                  {data.items.length} article
                  {data.items.length > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-gray-100 flex items-center justify-between'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors'
          >
            Fermer
          </button>

          <div className='flex items-center gap-2'>
            {sendMutation.isError && (
              <p className='text-xs text-red-500'>
                {sendMutation.error?.message || "Erreur lors de l'envoi"}
              </p>
            )}

            {hasItems && (
              <div className='relative group'>
                <button
                  onClick={handleSendToPatient}
                  disabled={!isPublished || sendMutation.isPending || sent}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sent
                      ? 'bg-emerald-50 text-emerald-700'
                      : isPublished
                        ? 'bg-[#1B998B] text-white hover:bg-[#147569] disabled:opacity-50'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {sendMutation.isPending ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Envoi...
                    </>
                  ) : sent ? (
                    <>
                      <Check className='w-4 h-4' />
                      Envoyée au patient
                    </>
                  ) : (
                    <>
                      <Send className='w-4 h-4' />
                      Envoyer au patient
                    </>
                  )}
                </button>
                {!isPublished && !sent && (
                  <span className='absolute bottom-full right-0 mb-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                    Publiez le plan pour envoyer la liste
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
