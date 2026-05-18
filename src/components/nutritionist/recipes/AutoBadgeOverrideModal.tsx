'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2 } from 'lucide-react';
import {
  NUTRITION_TAGS,
  DIET_AUTO_TAGS,
  ALLERGEN_AUTO_TAGS,
  AUTO_TAG_LABELS,
  TAG_GROUP_MAP,
} from '@/lib/recipe-auto-tags';

// ==================== TYPES ====================

interface AutoBadgeOverrideModalProps {
  isOpen: boolean;
  recipeId: string;
  currentAutoTags: { tag_group: string; tag_value: string }[];
  onClose: () => void;
  onSaved: () => void;
}

// ==================== GROUP DEFINITIONS ====================

interface TagGroupDef {
  key: string;
  label: string;
  color: string;
  mode: 'radio' | 'multi';
  values: string[];
}

// Groups that are auto-calculated and NOT editable by the nutritionist
const AUTO_ONLY_GROUPS = new Set(['calories', 'time']);

const TAG_GROUPS: TagGroupDef[] = [
  {
    key: 'nutrition',
    label: 'Profil nutritionnel',
    color: TAG_GROUP_MAP.nutrition.color,
    mode: 'multi',
    values: Object.keys(NUTRITION_TAGS),
  },
  {
    key: 'diet',
    label: 'Régime alimentaire',
    color: TAG_GROUP_MAP.diet.color,
    mode: 'multi',
    values: Object.keys(DIET_AUTO_TAGS).filter(k => !k.endsWith('-uncertain')),
  },
  {
    key: 'allergen',
    label: 'Allergènes',
    color: TAG_GROUP_MAP.allergen.color,
    mode: 'multi',
    values: Object.keys(ALLERGEN_AUTO_TAGS).filter(
      k => !k.endsWith('-uncertain')
    ),
  },
];

// ==================== COMPONENT ====================

export function AutoBadgeOverrideModal({
  isOpen,
  recipeId,
  currentAutoTags,
  onClose,
  onSaved,
}: AutoBadgeOverrideModalProps) {
  const [selectedTags, setSelectedTags] = useState<
    { tag_group: string; tag_value: string }[]
  >(() =>
    currentAutoTags
      // Only keep editable groups (diet, allergen) — not auto-calculated ones
      .filter(t => !AUTO_ONLY_GROUPS.has(t.tag_group))
      // Convert -uncertain variants to their confirmed version
      .map(t => ({
        tag_group: t.tag_group,
        tag_value: t.tag_value.replace(/-uncertain$/, ''),
      }))
      // Deduplicate
      .filter(
        (t, i, arr) =>
          arr.findIndex(
            a => a.tag_group === t.tag_group && a.tag_value === t.tag_value
          ) === i
      )
  );
  const [isSaving, setIsSaving] = useState(false);

  const selectedSet = useMemo(
    () => new Set(selectedTags.map(t => `${t.tag_group}:${t.tag_value}`)),
    [selectedTags]
  );

  const handleToggle = (group: TagGroupDef, value: string) => {
    const key = `${group.key}:${value}`;
    const isActive = selectedSet.has(key);

    if (group.mode === 'radio') {
      // Remove all tags from this group, then add the new one (unless deselecting)
      const without = selectedTags.filter(t => t.tag_group !== group.key);
      if (isActive) {
        setSelectedTags(without);
      } else {
        setSelectedTags([
          ...without,
          { tag_group: group.key, tag_value: value },
        ]);
      }
    } else {
      // Multi-select toggle
      if (isActive) {
        setSelectedTags(
          selectedTags.filter(
            t => !(t.tag_group === group.key && t.tag_value === value)
          )
        );
      } else {
        setSelectedTags([
          ...selectedTags,
          { tag_group: group.key, tag_value: value },
        ]);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Preserve auto-calculated tags (calories, time, nutrition) — only override diet + allergen
      const autoCalculatedTags = currentAutoTags.filter(t =>
        AUTO_ONLY_GROUPS.has(t.tag_group)
      );
      const finalTags = [...autoCalculatedTags, ...selectedTags];

      const res = await fetch(
        `/api/protected/nutritionist/recipes/${recipeId}/auto-tags`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ auto_tags: finalTags }),
        }
      );
      if (res.ok) {
        onSaved();
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className='bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col'
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center'>
                  <Zap className='w-5 h-5 text-amber-500' />
                </div>
                <div>
                  <h2 className='text-base font-semibold text-gray-900'>
                    Corriger les badges automatiques
                  </h2>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Désélectionnez les badges incorrects ou ajoutez ceux qui
                    manquent.
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='p-1.5 hover:bg-gray-100 rounded-full transition-colors'
              >
                <X className='w-5 h-5 text-gray-400' />
              </button>
            </div>

            {/* Body */}
            <div className='flex-1 overflow-y-auto px-6 py-5 space-y-6'>
              {TAG_GROUPS.map(group => (
                <div key={group.key}>
                  <div className='flex items-center gap-2 mb-2.5'>
                    <span className='text-sm font-medium text-gray-700'>
                      {group.label}
                    </span>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {group.values.map(value => {
                      const isActive = selectedSet.has(`${group.key}:${value}`);
                      const label = AUTO_TAG_LABELS[value] || value;

                      return (
                        <button
                          key={value}
                          type='button'
                          onClick={() => handleToggle(group, value)}
                          className='px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150'
                          style={
                            isActive
                              ? {
                                  backgroundColor: `${group.color}15`,
                                  color: group.color,
                                  borderColor: `${group.color}40`,
                                }
                              : {
                                  backgroundColor: '#F9FAFB',
                                  color: '#9CA3AF',
                                  borderColor: '#E5E7EB',
                                }
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Info box about auto-calculated badges */}
              <div className='bg-blue-50/60 border border-blue-100 rounded-lg px-4 py-3'>
                <p className='text-xs text-blue-700'>
                  Les badges <strong>Calories</strong> et <strong>Temps</strong>{' '}
                  sont calculés automatiquement à partir des ingrédients et des
                  temps de préparation enregistrés pour la recette. Ils ne
                  peuvent pas être modifiés manuellement.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className='px-6 py-4 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
              >
                Annuler
              </button>
              <button
                type='button'
                onClick={handleSave}
                disabled={isSaving}
                className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1B998B] hover:bg-[#158578] rounded-lg transition-colors disabled:opacity-50'
              >
                {isSaving && <Loader2 className='w-4 h-4 animate-spin' />}
                Enregistrer les corrections
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
