'use client';

import React, { useState } from 'react';
import {
  useCreateMeal,
  useTodayMeals,
  useMeal,
  useUpdateMeal,
  useDeleteMeal,
  useDailySummary,
  useMealsCheck,
} from '@/hooks/useMeals';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function TestApiPage() {
  const [testFoodId, setTestFoodId] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('breakfast');

  // État pour l'édition
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState(100);
  const [editMealType, setEditMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('breakfast');

  // Hook pour créer un repas
  const createMeal = useCreateMeal();

  // Hook pour récupérer les repas d'aujourd'hui
  const { data: todayMeals, isLoading, error, refetch } = useTodayMeals();

  // Hooks pour le résumé quotidien et la vérification des repas
  const { data: dailySummary } = useDailySummary();
  const { data: mealsCheck } = useMealsCheck();

  // Hooks pour éditer et supprimer
  const deleteMeal = useDeleteMeal();
  const updateMeal = useUpdateMeal(editingMealId || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testFoodId.trim()) {
      alert("Veuillez entrer un ID d'aliment");
      return;
    }

    try {
      const now = new Date();
      const mealData = {
        type: mealType,
        consumed_at: now.toISOString(),
        notes: `Test repas API - ${new Date().toLocaleString('fr-CH')}`,
        location: 'home' as const,
        foods: [
          {
            food_id: testFoodId,
            quantity: quantity,
            unit: 'g' as const,
          },
        ],
      };

      await createMeal.mutateAsync(mealData);
      alert('✅ Repas créé avec succès !');
      refetch(); // Recharger les repas
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleDelete = async (mealId: string) => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      return;
    }

    try {
      await deleteMeal.mutateAsync(mealId);
      alert('✅ Repas supprimé avec succès !');
      refetch();
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleEdit = (meal: any) => {
    setEditingMealId(meal.id);
    setEditMealType(meal.type);
    setEditQuantity(100); // Valeur par défaut
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMealId) return;

    try {
      const now = new Date();
      const updateData = {
        type: editMealType,
        consumed_at: now.toISOString(),
        notes: `Repas modifié - ${new Date().toLocaleString('fr-CH')}`,
      };

      await updateMeal.mutateAsync(updateData);
      alert('✅ Repas modifié avec succès !');
      setEditingMealId(null);
      refetch();
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const cancelEdit = () => {
    setEditingMealId(null);
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <DashboardHeader />

      <div className='max-w-4xl mx-auto p-6'>
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            🧪 Test API - Créer un repas
          </h1>
          <p className='text-gray-600 mb-6'>
            Cette page permet de tester l'API de création de repas directement
          </p>

          {/* Formulaire de test */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Type de repas */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Type de repas
              </label>
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value as any)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
              >
                <option value='breakfast'>Petit-déjeuner</option>
                <option value='lunch'>Déjeuner</option>
                <option value='dinner'>Dîner</option>
                <option value='snack'>Collation</option>
              </select>
            </div>

            {/* ID de l'aliment */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                ID de l'aliment (UUID)
              </label>
              <input
                type='text'
                value={testFoodId}
                onChange={e => setTestFoodId(e.target.value)}
                placeholder='ex: 123e4567-e89b-12d3-a456-426614174000'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
              />
              <p className='text-xs text-gray-500 mt-1'>
                💡 Astuce: Copiez un UUID depuis votre base de données (table{' '}
                <code className='bg-gray-100 px-1 rounded'>foods</code>)
              </p>
            </div>

            {/* Quantité */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Quantité (grammes)
              </label>
              <input
                type='number'
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                min='1'
                max='10000'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
              />
            </div>

            {/* Bouton submit */}
            <button
              type='submit'
              disabled={createMeal.isPending}
              className='w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
            >
              {createMeal.isPending
                ? '⏳ Création en cours...'
                : '✅ Créer le repas'}
            </button>
          </form>

          {/* Message de succès */}
          {createMeal.isSuccess && (
            <div className='mt-4 p-4 bg-green-50 border border-green-200 rounded-md'>
              <p className='text-green-800 font-medium'>
                ✅ Repas créé avec succès !
              </p>
              <pre className='mt-2 text-xs bg-white p-2 rounded overflow-auto'>
                {JSON.stringify(createMeal.data, null, 2)}
              </pre>
            </div>
          )}

          {/* Message d'erreur */}
          {createMeal.isError && (
            <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-red-800 font-medium'>
                ❌ Erreur: {createMeal.error.message}
              </p>
            </div>
          )}
        </div>

        {/* Liste des repas d'aujourd'hui */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-bold text-gray-900'>
              📅 Repas d'aujourd'hui
            </h2>
            <button
              onClick={() => refetch()}
              className='text-sm text-primary hover:text-primary-dark font-medium'
            >
              🔄 Actualiser
            </button>
          </div>

          {isLoading && <p className='text-gray-600'>⏳ Chargement...</p>}

          {error && (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-red-800'>❌ Erreur: {error.message}</p>
            </div>
          )}

          {todayMeals && (
            <>
              <p className='text-sm text-gray-600 mb-4'>
                {todayMeals.total} repas trouvé{todayMeals.total > 1 ? 's' : ''}
              </p>

              {todayMeals.meals.length === 0 ? (
                <p className='text-gray-500 italic'>
                  Aucun repas enregistré aujourd'hui
                </p>
              ) : (
                <div className='space-y-3'>
                  {todayMeals.meals.map(meal => (
                    <div
                      key={meal.id}
                      className='p-4 border border-gray-200 rounded-md hover:border-primary transition-colors'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <div>
                          <h3 className='font-medium text-gray-900 capitalize'>
                            {meal.type === 'breakfast' && '🌅 Petit-déjeuner'}
                            {meal.type === 'lunch' && '🍽️ Déjeuner'}
                            {meal.type === 'dinner' && '🌙 Dîner'}
                            {meal.type === 'snack' && '🥤 Collation'}
                          </h3>
                          <p className='text-sm text-gray-500'>
                            {new Date(meal.consumed_at).toLocaleTimeString(
                              'fr-CH',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-lg font-bold text-primary'>
                            {meal.total_calories} kcal
                          </p>
                          <p className='text-xs text-gray-500'>
                            {meal.food_count} aliment
                            {meal.food_count > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className='mt-2 flex gap-4 text-sm text-gray-600'>
                        <span>
                          🥩 {meal.total_protein.toFixed(1)}g protéines
                        </span>
                        <span>🍞 {meal.total_carbs.toFixed(1)}g glucides</span>
                        <span>🥑 {meal.total_fat.toFixed(1)}g lipides</span>
                      </div>

                      {meal.location && (
                        <p className='mt-2 text-xs text-gray-500'>
                          📍 {meal.location === 'home' && 'Maison'}
                          {meal.location === 'work' && 'Travail'}
                          {meal.location === 'restaurant' && 'Restaurant'}
                        </p>
                      )}

                      {/* Boutons d'action */}
                      <div className='mt-3 pt-3 border-t border-gray-200 flex gap-2'>
                        <button
                          onClick={() => handleEdit(meal)}
                          className='flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium'
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(meal.id)}
                          disabled={deleteMeal.isPending}
                          className='flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          {deleteMeal.isPending ? '⏳' : '🗑️'} Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de modification */}
        {editingMealId && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg shadow-xl p-6 max-w-md w-full'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>
                ✏️ Modifier le repas
              </h2>

              <form onSubmit={handleUpdateSubmit} className='space-y-4'>
                {/* Type de repas */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Type de repas
                  </label>
                  <select
                    value={editMealType}
                    onChange={e => setEditMealType(e.target.value as any)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                  >
                    <option value='breakfast'>Petit-déjeuner</option>
                    <option value='lunch'>Déjeuner</option>
                    <option value='dinner'>Dîner</option>
                    <option value='snack'>Collation</option>
                  </select>
                </div>

                <p className='text-sm text-gray-600'>
                  💡 Note: Cette démo permet uniquement de modifier le type et
                  l'heure du repas.
                </p>

                {/* Boutons */}
                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={cancelEdit}
                    className='flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium'
                  >
                    Annuler
                  </button>
                  <button
                    type='submit'
                    disabled={updateMeal.isPending}
                    className='flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {updateMeal.isPending
                      ? '⏳ Modification...'
                      : '✅ Modifier'}
                  </button>
                </div>

                {/* Message d'erreur */}
                {updateMeal.isError && (
                  <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
                    <p className='text-red-800 text-sm'>
                      ❌ {updateMeal.error.message}
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Résumé nutritionnel quotidien */}
        <div className='mt-6 bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            📊 Résumé nutritionnel quotidien
          </h2>

          {dailySummary ? (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='p-4 bg-blue-50 rounded-lg'>
                <p className='text-sm text-blue-600 font-medium mb-1'>
                  Calories
                </p>
                <p className='text-2xl font-bold text-blue-900'>
                  {dailySummary.total_calories}
                </p>
                <p className='text-xs text-blue-700'>
                  / {dailySummary.calorie_goal} kcal
                </p>
                <p className='text-xs text-blue-600 mt-1'>
                  Reste: {dailySummary.calorie_remaining} kcal
                </p>
              </div>

              <div className='p-4 bg-green-50 rounded-lg'>
                <p className='text-sm text-green-600 font-medium mb-1'>
                  Protéines
                </p>
                <p className='text-2xl font-bold text-green-900'>
                  {dailySummary.total_protein}g
                </p>
                <p className='text-xs text-green-700'>
                  / {dailySummary.protein_goal}g
                </p>
              </div>

              <div className='p-4 bg-yellow-50 rounded-lg'>
                <p className='text-sm text-yellow-600 font-medium mb-1'>
                  Glucides
                </p>
                <p className='text-2xl font-bold text-yellow-900'>
                  {dailySummary.total_carbs}g
                </p>
                <p className='text-xs text-yellow-700'>
                  / {dailySummary.carbs_goal}g
                </p>
              </div>

              <div className='p-4 bg-purple-50 rounded-lg'>
                <p className='text-sm text-purple-600 font-medium mb-1'>
                  Lipides
                </p>
                <p className='text-2xl font-bold text-purple-900'>
                  {dailySummary.total_fat}g
                </p>
                <p className='text-xs text-purple-700'>
                  / {dailySummary.fat_goal}g
                </p>
              </div>
            </div>
          ) : (
            <p className='text-gray-500'>⏳ Chargement du résumé...</p>
          )}

          {dailySummary && (
            <div className='mt-4 grid grid-cols-4 gap-2 text-center'>
              <div className='p-2 bg-orange-50 rounded'>
                <p className='text-xs text-orange-600'>Petit-déj</p>
                <p className='font-bold text-orange-900'>
                  {dailySummary.breakfast_calories} kcal
                </p>
              </div>
              <div className='p-2 bg-green-50 rounded'>
                <p className='text-xs text-green-600'>Déjeuner</p>
                <p className='font-bold text-green-900'>
                  {dailySummary.lunch_calories} kcal
                </p>
              </div>
              <div className='p-2 bg-blue-50 rounded'>
                <p className='text-xs text-blue-600'>Dîner</p>
                <p className='font-bold text-blue-900'>
                  {dailySummary.dinner_calories} kcal
                </p>
              </div>
              <div className='p-2 bg-purple-50 rounded'>
                <p className='text-xs text-purple-600'>Collations</p>
                <p className='font-bold text-purple-900'>
                  {dailySummary.snack_calories} kcal
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Vérification des repas du jour */}
        <div className='mt-6 bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            ✅ Vérification des repas du jour
          </h2>

          {mealsCheck ? (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              <div
                className={`p-4 rounded-lg border-2 ${mealsCheck.breakfast ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <p className='text-sm font-medium mb-1'>
                  {mealsCheck.breakfast ? '✅' : '⬜'} Petit-déjeuner
                </p>
                <p
                  className={`text-xs ${mealsCheck.breakfast ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {mealsCheck.breakfast ? 'Complété' : 'Non saisi'}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border-2 ${mealsCheck.lunch ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <p className='text-sm font-medium mb-1'>
                  {mealsCheck.lunch ? '✅' : '⬜'} Déjeuner
                </p>
                <p
                  className={`text-xs ${mealsCheck.lunch ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {mealsCheck.lunch ? 'Complété' : 'Non saisi'}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border-2 ${mealsCheck.dinner ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <p className='text-sm font-medium mb-1'>
                  {mealsCheck.dinner ? '✅' : '⬜'} Dîner
                </p>
                <p
                  className={`text-xs ${mealsCheck.dinner ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {mealsCheck.dinner ? 'Complété' : 'Non saisi'}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border-2 ${mealsCheck.snack ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <p className='text-sm font-medium mb-1'>
                  {mealsCheck.snack ? '✅' : '⬜'} Collation
                </p>
                <p
                  className={`text-xs ${mealsCheck.snack ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {mealsCheck.snack ? 'Complété' : 'Non saisi'}
                </p>
              </div>
            </div>
          ) : (
            <p className='text-gray-500'>⏳ Chargement de la vérification...</p>
          )}
        </div>

        {/* Instructions SQL */}
        <div className='mt-6 bg-blue-50 border border-blue-200 rounded-md p-6'>
          <h3 className='font-medium text-blue-900 mb-2'>
            💡 Comment obtenir un food_id ?
          </h3>
          <p className='text-sm text-blue-800 mb-3'>
            Exécutez cette requête SQL dans votre base de données Supabase :
          </p>
          <pre className='bg-white p-3 rounded text-xs overflow-auto'>
            {`-- Voir les aliments disponibles
SELECT id, name_fr, brand, calories, proteins, carbohydrates, fat
FROM foods
LIMIT 10;

-- Si aucun aliment, en insérer quelques-uns
INSERT INTO foods (name_fr, brand, calories, proteins, carbohydrates, fat, fiber)
VALUES
  ('Flocons d''avoine', 'Migros Bio', 389, 13.2, 66.3, 6.9, 10.6),
  ('Banane', NULL, 89, 1.1, 22.8, 0.3, 2.6),
  ('Poulet (blanc)', NULL, 165, 31.0, 0, 3.6, 0)
RETURNING id, name_fr;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
