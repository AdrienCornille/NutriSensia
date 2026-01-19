'use client';

import React, { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlanMealType, ModificationRequestFormData } from '@/types/meal-plan';
import { mealTypeConfig } from '@/types/meal-plan';

interface ModificationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModificationRequestFormData) => void;
}

const mealOptions: { value: PlanMealType | ''; label: string }[] = [
  { value: '', label: 'Sélectionner un repas (optionnel)' },
  { value: 'petit-dejeuner', label: mealTypeConfig['petit-dejeuner'].label },
  { value: 'dejeuner', label: mealTypeConfig['dejeuner'].label },
  { value: 'collation', label: mealTypeConfig['collation'].label },
  { value: 'diner', label: mealTypeConfig['diner'].label },
];

export function ModificationRequestModal({
  isOpen,
  onClose,
  onSubmit,
}: ModificationRequestModalProps) {
  const [selectedMeal, setSelectedMeal] = useState<PlanMealType | ''>('');
  const [food, setFood] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Vérifie si le formulaire contient des données
  const hasFormData = selectedMeal !== '' || food.trim() !== '' || reason.trim() !== '';

  // Reset le formulaire à son état initial
  const resetForm = () => {
    setSelectedMeal('');
    setFood('');
    setReason('');
    setShowCancelConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);

    // Simuler un délai d'envoi
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSubmit({
      meal: selectedMeal || undefined,
      food: food.trim() || undefined,
      reason: reason.trim(),
    });

    // Reset form
    resetForm();
    setIsSubmitting(false);
    onClose();
  };

  const handleCancelClick = () => {
    if (isSubmitting) return;

    if (hasFormData) {
      // Afficher la confirmation si des données sont présentes
      setShowCancelConfirm(true);
    } else {
      // Fermer directement si aucune donnée
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    resetForm();
    onClose();
  };

  const handleBackdropClick = () => {
    if (isSubmitting) return;

    if (hasFormData) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden relative">
              {/* Confirmation overlay */}
              <AnimatePresence>
                {showCancelConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center p-6 rounded-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Annuler la demande ?</h3>
                          <p className="text-sm text-gray-500">Les informations saisies seront perdues.</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowCancelConfirm(false)}
                          className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Continuer
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmCancel}
                          className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Demander une modification
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Votre nutritionniste sera notifié de votre demande
                  </p>
                </div>
                <button
                  onClick={handleCancelClick}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Meal selector */}
                <div>
                  <label
                    htmlFor="meal"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Repas concerné
                  </label>
                  <select
                    id="meal"
                    value={selectedMeal}
                    onChange={(e) => setSelectedMeal(e.target.value as PlanMealType | '')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors"
                  >
                    {mealOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Food input */}
                <div>
                  <label
                    htmlFor="food"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Aliment concerné (optionnel)
                  </label>
                  <input
                    id="food"
                    type="text"
                    value={food}
                    onChange={(e) => setFood(e.target.value)}
                    placeholder="Ex: Riz basmati complet"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors"
                  />
                </div>

                {/* Reason textarea */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Motif de la demande <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Décrivez votre demande de modification..."
                    rows={4}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B] transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Soyez précis pour aider votre nutritionniste à comprendre votre besoin.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!reason.trim() || isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1B998B] text-white font-medium rounded-lg hover:bg-[#158578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer la demande
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ModificationRequestModal;
