import { z } from 'zod';

// =====================================================
// SCHÉMAS POUR LES REPAS (MEALS)
// =====================================================

// Type de repas
export const mealTypeEnum = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

// Lieu de repas
export const mealLocationEnum = z.enum(['home', 'work', 'restaurant', 'other']);

// Unité de mesure pour les aliments
export const foodUnitEnum = z.enum(['g', 'ml', 'c_a_s', 'c_a_c', 'tasse', 'portion', 'piece']);

// Schéma pour un aliment dans un repas
export const mealFoodSchema = z.object({
  food_id: z.string().uuid('ID aliment invalide'),
  quantity: z
    .number()
    .positive('La quantité doit être positive')
    .max(10000, 'Quantité maximum: 10000'),
  unit: foodUnitEnum,
});

// Schéma pour créer un repas
export const createMealSchema = z.object({
  type: mealTypeEnum,
  consumed_at: z.string().datetime('Date/heure invalide'),
  notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
  location: mealLocationEnum.optional(),
  photo_url: z.string().url('URL de photo invalide').optional(),
  foods: z
    .array(mealFoodSchema)
    .min(1, 'Au moins un aliment est requis')
    .max(50, 'Maximum 50 aliments par repas'),
});

// Schéma pour mettre à jour un repas
export const updateMealSchema = z.object({
  type: mealTypeEnum.optional(),
  consumed_at: z.string().datetime('Date/heure invalide').optional(),
  notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional()
    .nullable(),
  location: mealLocationEnum.optional().nullable(),
  photo_url: z.string().url('URL de photo invalide').optional().nullable(),
  foods: z
    .array(mealFoodSchema)
    .min(1, 'Au moins un aliment est requis')
    .max(50, 'Maximum 50 aliments par repas')
    .optional(),
});

// Schéma pour les query params de liste de repas
export const mealsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(),
  type: mealTypeEnum.optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limite invalide')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default('50'),
  offset: z
    .string()
    .regex(/^\d+$/, 'Offset invalide')
    .transform(Number)
    .pipe(z.number().int().min(0))
    .default('0'),
});

// =====================================================
// SCHÉMAS POUR L'HYDRATATION (HYDRATION)
// =====================================================

// Type de boisson
export const beverageTypeEnum = z.enum([
  'water',
  'tea',
  'coffee',
  'juice',
  'other',
]);

// Schéma pour ajouter un log d'hydratation
export const createHydrationLogSchema = z.object({
  amount_ml: z
    .number()
    .positive('La quantité doit être positive')
    .max(5000, 'Quantité maximum: 5000ml (5L)'),
  beverage_type: beverageTypeEnum.default('water'),
  notes: z
    .string()
    .max(200, 'Notes trop longues (max 200 caractères)')
    .optional(),
});

// Schéma pour modifier un log d'hydratation
export const updateHydrationLogSchema = z.object({
  amount_ml: z
    .number()
    .positive('La quantité doit être positive')
    .max(5000, 'Quantité maximum: 5000ml (5L)')
    .optional(),
  beverage_type: beverageTypeEnum.optional(),
  notes: z
    .string()
    .max(200, 'Notes trop longues (max 200 caractères)')
    .optional(),
});

// Schéma pour mettre à jour l'objectif d'hydratation
export const updateHydrationGoalSchema = z.object({
  daily_goal_ml: z
    .number()
    .positive("L'objectif doit être positif")
    .min(500, 'Objectif minimum: 500ml')
    .max(10000, 'Objectif maximum: 10000ml (10L)'),
});

// =====================================================
// SCHÉMAS POUR LE POIDS (WEIGHT)
// =====================================================

// Schéma pour ajouter une entrée de poids
export const createWeightEntrySchema = z.object({
  weight_kg: z
    .number()
    .positive('Le poids doit être positif')
    .min(20, 'Poids minimum: 20kg')
    .max(500, 'Poids maximum: 500kg'),
  measured_at: z.string().datetime('Date/heure invalide').optional(),
  notes: z
    .string()
    .max(200, 'Notes trop longues (max 200 caractères)')
    .optional(),
});

// Schéma pour mettre à jour l'objectif de poids
export const updateWeightGoalSchema = z.object({
  goal_weight_kg: z
    .number()
    .positive('Le poids objectif doit être positif')
    .min(30, 'Poids objectif minimum: 30kg')
    .max(300, 'Poids objectif maximum: 300kg'),
  target_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(),
  weekly_goal_kg: z
    .number()
    .positive("L'objectif hebdomadaire doit être positif")
    .max(2, 'Objectif hebdomadaire maximum: 2kg')
    .optional(),
});

// =====================================================
// SCHÉMAS POUR LES MENSURATIONS (BODY MEASUREMENTS)
// =====================================================

// Type de mesure (aligné avec l'enum PostgreSQL)
export const measurementTypeEnum = z.enum([
  'poitrine',
  'taille',
  'hanches',
  'cuisse',
  'bras',
  'mollet',
]);

// Schéma pour créer une mesure corporelle
export const createMeasurementEntrySchema = z.object({
  measurement_type: measurementTypeEnum,
  value_cm: z
    .number()
    .positive('La valeur doit être positive')
    .min(10, 'Valeur minimum: 10cm')
    .max(500, 'Valeur maximum: 500cm'),
  measured_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
});

// Schéma pour mettre à jour une mesure corporelle
export const updateMeasurementEntrySchema = z.object({
  value_cm: z
    .number()
    .positive('La valeur doit être positive')
    .min(10, 'Valeur minimum: 10cm')
    .max(500, 'Valeur maximum: 500cm')
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
});

export type CreateMeasurementEntryData = z.infer<
  typeof createMeasurementEntrySchema
>;
export type UpdateMeasurementEntryData = z.infer<
  typeof updateMeasurementEntrySchema
>;

// @deprecated - Ancien schéma (noms anglais, pas aligné avec DB)
// Utilisez createMeasurementEntrySchema à la place
export const createBodyMeasurementsSchema = z.object({
  chest_cm: z
    .number()
    .positive('La mesure doit être positive')
    .max(300, 'Mesure maximum: 300cm')
    .optional(),
  waist_cm: z
    .number()
    .positive('La mesure doit être positive')
    .max(300, 'Mesure maximum: 300cm')
    .optional(),
  hips_cm: z
    .number()
    .positive('La mesure doit être positive')
    .max(300, 'Mesure maximum: 300cm')
    .optional(),
  thigh_cm: z
    .number()
    .positive('La mesure doit être positive')
    .max(150, 'Mesure maximum: 150cm')
    .optional(),
  arm_cm: z
    .number()
    .positive('La mesure doit être positive')
    .max(100, 'Mesure maximum: 100cm')
    .optional(),
  measured_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(),
});

// =====================================================
// SCHÉMAS POUR LE BIEN-ÊTRE (WELLNESS)
// =====================================================

// Humeur
export const moodEnum = z.enum([
  'very_bad',
  'bad',
  'neutral',
  'good',
  'excellent',
]);

// Niveau d'énergie
export const energyLevelSchema = z
  .number()
  .int("Le niveau d'énergie doit être un entier")
  .min(1, "Niveau d'énergie minimum: 1")
  .max(5, "Niveau d'énergie maximum: 5");

// Tags digestion
export const digestionTagEnum = z.enum([
  'normal',
  'bloating',
  'constipation',
  'diarrhea',
  'nausea',
  'heartburn',
]);

// Schéma pour ajouter un log de bien-être
export const createWellnessLogSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  energy_level: energyLevelSchema,
  sleep_hours: z
    .number()
    .min(0, 'Heures de sommeil minimum: 0')
    .max(24, 'Heures de sommeil maximum: 24'),
  mood: moodEnum,
  digestion_tags: z.array(digestionTagEnum).max(5, 'Maximum 5 tags').optional(),
  notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
});

// =====================================================
// SCHÉMAS POUR LE BIEN-ÊTRE - API WELLBEING (Module 2.4)
// =====================================================

// Enums DB (format base de données pour wellbeing_logs)
export const moodAPIEnum = z.enum([
  'very_good',
  'good',
  'neutral',
  'bad',
  'very_bad',
]);
export const digestionQualityAPIEnum = z.enum([
  'poor',
  'average',
  'good',
  'excellent',
]);

// Schéma pour créer un log de bien-être (POST /api/protected/wellbeing)
export const createWellbeingLogSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(), // Défaut = today
  energy_level: z
    .number()
    .int("Le niveau d'énergie doit être un entier")
    .min(1, "Niveau d'énergie minimum: 1")
    .max(10, "Niveau d'énergie maximum: 10"),
  sleep_hours: z
    .number()
    .positive('Les heures de sommeil doivent être positives')
    .max(24, 'Heures de sommeil maximum: 24')
    .optional(),
  sleep_quality: z
    .number()
    .int('La qualité de sommeil doit être un entier')
    .min(1, 'Qualité de sommeil minimum: 1')
    .max(10, 'Qualité de sommeil maximum: 10')
    .optional(),
  mood: moodAPIEnum.optional(),
  digestion: digestionQualityAPIEnum.optional(),
  symptoms: z.array(z.string()).optional(),
  notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
});

// Schéma pour mettre à jour un log de bien-être (PATCH /api/protected/wellbeing/[id])
export const updateWellbeingLogSchema = z
  .object({
    energy_level: z
      .number()
      .int("Le niveau d'énergie doit être un entier")
      .min(1, "Niveau d'énergie minimum: 1")
      .max(10, "Niveau d'énergie maximum: 10")
      .optional(),
    sleep_hours: z
      .number()
      .positive('Les heures de sommeil doivent être positives')
      .max(24, 'Heures de sommeil maximum: 24')
      .optional(),
    sleep_quality: z
      .number()
      .int('La qualité de sommeil doit être un entier')
      .min(1, 'Qualité de sommeil minimum: 1')
      .max(10, 'Qualité de sommeil maximum: 10')
      .optional(),
    mood: moodAPIEnum.optional(),
    digestion: digestionQualityAPIEnum.optional(),
    symptoms: z.array(z.string()).optional(),
    notes: z
      .string()
      .max(500, 'Notes trop longues (max 500 caractères)')
      .optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

// =====================================================
// SCHÉMAS POUR L'ACTIVITÉ PHYSIQUE (ACTIVITY)
// =====================================================

// Type d'activité
export const activityTypeEnum = z.enum([
  'walking',
  'running',
  'cycling',
  'swimming',
  'gym',
  'yoga',
  'pilates',
  'sports',
  'dancing',
  'hiking',
  'other',
]);

// Intensité (aligné avec l'enum PostgreSQL activity_intensity)
export const intensityEnum = z.enum([
  'light',
  'moderate',
  'vigorous',
  'very_vigorous',
]);

// Schéma pour ajouter une activité
export const createActivityLogSchema = z.object({
  activity_type: activityTypeEnum,
  duration_minutes: z
    .number()
    .int('La durée doit être un entier')
    .positive('La durée doit être positive')
    .max(600, 'Durée maximum: 600 minutes (10h)'),
  intensity: intensityEnum,
  calories_burned: z
    .number()
    .int('Les calories doivent être un entier')
    .positive('Les calories doivent être positives')
    .max(5000, 'Calories maximum: 5000')
    .optional(),
  notes: z
    .string()
    .max(300, 'Notes trop longues (max 300 caractères)')
    .optional(),
  performed_at: z.string().datetime('Date/heure invalide').optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(),
});

// Schéma pour modifier une activité
export const updateActivityLogSchema = z
  .object({
    activity_type: activityTypeEnum.optional(),
    duration_minutes: z
      .number()
      .int('La durée doit être un entier')
      .positive('La durée doit être positive')
      .max(600, 'Durée maximum: 600 minutes (10h)')
      .optional(),
    intensity: intensityEnum.optional(),
    calories_burned: z
      .number()
      .int('Les calories doivent être un entier')
      .positive('Les calories doivent être positives')
      .max(5000, 'Calories maximum: 5000')
      .optional()
      .nullable(),
    notes: z
      .string()
      .max(300, 'Notes trop longues (max 300 caractères)')
      .optional()
      .nullable(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
      .optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

// =====================================================
// SCHÉMAS POUR LES OBJECTIFS (OBJECTIVES)
// =====================================================

// Catégorie d'objectif
export const objectiveCategoryEnum = z.enum([
  'nutrition',
  'hydration',
  'activity',
  'recipes',
  'tracking',
  'custom',
]);

// Rôle du créateur de l'objectif
export const objectiveRoleEnum = z.enum(['nutritionist', 'system', 'user']);

// Schéma pour un objectif individuel
export const objectiveItemSchema = z.object({
  id: z.string().optional(), // Généré côté serveur si non fourni
  category: objectiveCategoryEnum,
  label: z.string().min(3, 'Label trop court').max(100, 'Label trop long'),
  description: z.string().max(300, 'Description trop longue').optional(),
  target: z.number().positive('La cible doit être positive'),
  unit: z.string().min(1, 'Unité requise').max(20, 'Unité trop longue'),
  definedBy: z.object({
    name: z.string().min(2, 'Nom trop court'),
    initials: z
      .string()
      .min(1, 'Initiales requises')
      .max(3, 'Initiales trop longues'),
    role: objectiveRoleEnum,
  }),
});

// Schéma pour créer des objectifs hebdomadaires
export const createWeeklyObjectivesSchema = z.object({
  week_start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  objectives: z
    .array(objectiveItemSchema)
    .min(1, 'Au moins un objectif requis')
    .max(10, 'Maximum 10 objectifs par semaine'),
});

// Schéma pour mettre à jour un objectif
export const updateObjectiveSchema = z.object({
  objective_id: z.string().min(1, 'ID objectif requis'),
  current: z.number().min(0, 'La valeur actuelle doit être >= 0').optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.string().datetime('Date/heure invalide').optional().nullable(),
});

// =====================================================
// SCHÉMAS POUR LES RENDEZ-VOUS (APPOINTMENTS)
// =====================================================

// Mode de consultation
export const consultationModeEnum = z.enum(['visio', 'cabinet', 'phone']);

// Statut de rendez-vous (doit correspondre à l'enum appointment_status dans la DB)
export const appointmentStatusEnum = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
]);

// Schéma pour créer un rendez-vous
export const createAppointmentSchema = z.object({
  // nutritionist_id est optionnel - si non fourni, utilise le nutritionniste assigné au patient
  nutritionist_id: z.string().uuid('ID nutritionniste invalide').optional(),
  consultation_type_id: z.string().uuid('ID type de consultation invalide'),
  scheduled_at: z.string().datetime('Date/heure invalide'),
  mode: consultationModeEnum,
  patient_notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
});

// Schéma pour modifier un rendez-vous
export const updateAppointmentSchema = z.object({
  scheduled_at: z.string().datetime('Date/heure invalide').optional(),
  mode: consultationModeEnum.optional(),
  patient_notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
});

// Schéma pour modifier un rendez-vous (côté nutritionniste)
export const nutritionistUpdateAppointmentSchema = z.object({
  scheduled_at: z.string().datetime('Date/heure invalide').optional(),
  mode: consultationModeEnum.optional(),
  nutritionist_notes: z
    .string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional(),
  message: z
    .string()
    .max(500, 'Message trop long (max 500 caractères)')
    .optional(),
});

export type NutritionistUpdateAppointmentData = z.infer<
  typeof nutritionistUpdateAppointmentSchema
>;

// =====================================================
// SCHÉMAS POUR LA RÉPONSE NUTRITIONNISTE AUX DEMANDES DE RDV
// =====================================================

// Réponse nutritionniste à une demande de rendez-vous
export const nutritionistAppointmentResponseSchema = z.discriminatedUnion(
  'action',
  [
    z.object({ action: z.literal('accept') }),
    z.object({
      action: z.literal('decline'),
      reason: z
        .string()
        .min(5, 'Veuillez indiquer une raison (min 5 caractères)')
        .max(500, 'Raison trop longue (max 500 caractères)'),
    }),
    z.object({
      action: z.literal('propose_new_time'),
      proposed_at: z.string().datetime('Date/heure proposée invalide'),
      message: z
        .string()
        .max(500, 'Message trop long (max 500 caractères)')
        .optional(),
    }),
  ]
);

export type NutritionistAppointmentResponseData = z.infer<
  typeof nutritionistAppointmentResponseSchema
>;

// Réponse patient à une contre-proposition du nutritionniste
export const patientCounterProposalResponseSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('accept'),
  }),
  z.object({
    action: z.literal('decline'),
    reason: z
      .string()
      .max(500, 'Raison trop longue (max 500 caractères)')
      .optional(),
  }),
  z.object({
    action: z.literal('counter_propose'),
    proposed_at: z.string().min(1, 'Date proposée requise'),
    message: z
      .string()
      .max(500, 'Message trop long (max 500 caractères)')
      .optional(),
  }),
]);

export type PatientCounterProposalResponseData = z.infer<
  typeof patientCounterProposalResponseSchema
>;

// Marquage du statut post-RDV (AGENDA-N-011) — 2 actions: Effectué / Absence
export const postAppointmentStatusSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('completed'),
    notes: z
      .string()
      .max(500, 'Notes trop longues (max 500 caractères)')
      .optional(),
  }),
  z.object({
    action: z.literal('no_show'),
    notes: z
      .string()
      .max(500, 'Notes trop longues (max 500 caractères)')
      .optional(),
    send_message: z.boolean().optional().default(false),
    message_content: z
      .string()
      .max(1000, 'Message trop long (max 1000 caractères)')
      .optional(),
  }),
]);

export type PostAppointmentStatusData = z.infer<
  typeof postAppointmentStatusSchema
>;

// =====================================================
// SCHÉMAS POUR LA MESSAGERIE (MESSAGING)
// =====================================================

// Schéma pour envoyer un message
export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Le message ne peut pas être vide')
    .max(5000, 'Message trop long (max 5000 caractères)'),
});

// Query params pour les messages (pagination cursor-based)
export const messagesQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default('50'),
  before_id: z.string().uuid('ID de message invalide').optional(),
});

// Query params pour les conversations
export const conversationsQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .default('20'),
  offset: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0))
    .default('0'),
});

// =====================================================
// SCHÉMAS POUR LES CONSULTATIONS (EPIC 4)
// =====================================================

// Création d'un compte-rendu de consultation
export const createConsultationSchema = z.object({
  appointment_id: z.string().uuid('ID rendez-vous invalide').nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)').optional(),
  duration_minutes: z.number().int().min(5, 'Durée minimum 5 min').max(480, 'Durée maximum 8h').optional(),
  consultation_type: z.string().max(50, 'Type trop long').optional(),
  mode: consultationModeEnum,
  summary: z.string().min(10, 'Le résumé doit faire au moins 10 caractères').max(5000, 'Résumé trop long (max 5000 caractères)'),
  key_points: z.array(z.string().max(500, 'Point clé trop long')).max(20, 'Maximum 20 points clés').optional(),
  next_steps: z.string().max(2000, 'Prochaines étapes trop longues').optional(),
  private_notes: z.string().max(2000, 'Notes privées trop longues').optional(),
  attached_document_ids: z.array(z.string().uuid('ID document invalide')).max(10, 'Maximum 10 documents').optional(),
  status: z.enum(['draft', 'final']).default('final'),
});

export type CreateConsultationData = z.infer<typeof createConsultationSchema>;

// Modification d'un compte-rendu
export const updateConsultationSchema = z.object({
  summary: z.string().min(10, 'Le résumé doit faire au moins 10 caractères').max(5000, 'Résumé trop long').optional(),
  key_points: z.array(z.string().max(500)).max(20).optional(),
  next_steps: z.string().max(2000).optional(),
  private_notes: z.string().max(2000).optional(),
  attached_document_ids: z.array(z.string().uuid()).max(10).optional(),
  consultation_type: z.string().max(50).optional(),
  duration_minutes: z.number().int().min(5).max(480).optional(),
  mode: consultationModeEnum.optional(),
  status: z.enum(['draft', 'final']).optional(),
});

export type UpdateConsultationData = z.infer<typeof updateConsultationSchema>;

// =====================================================
// SCHEMAS POUR LES PLANS ALIMENTAIRES NUTRITIONNISTE (PLAN-N-001)
// =====================================================

export const mealPlanStatusEnum = z.enum([
  'draft',
  'active',
  'paused',
  'completed',
  'archived',
]);

export const nutritionalTargetsSchema = z.object({
  calories: z.number().int().min(500, 'Minimum 500 kcal').max(10000, 'Maximum 10000 kcal'),
  protein: z.number().min(0).max(500, 'Maximum 500g'),
  carbs: z.number().min(0).max(1000, 'Maximum 1000g'),
  fat: z.number().min(0).max(500, 'Maximum 500g'),
  fiber: z.number().min(0).max(100, 'Maximum 100g').nullable().optional(),
  sodium: z.number().min(0).max(10000, 'Maximum 10000mg').nullable().optional(),
});

export const planMealTypeEnum = z.enum(['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack']);

export const createMealPlanNutriSchema = z.object({
  name: z.string().min(3, 'Nom requis (min 3 caractères)').max(200, 'Nom trop long (max 200)'),
  objective: z.string().max(200, 'Objectif trop long (max 200)').optional(),
  description: z.string().max(2000, 'Description trop longue').optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  nutritional_targets: nutritionalTargetsSchema.optional(),
  notes: z.string().max(2000, 'Notes trop longues').optional(),
  meal_types: z.array(planMealTypeEnum).min(1, 'Sélectionnez au moins un type de repas').optional(),
}).refine(
  data => new Date(data.end_date) > new Date(data.start_date),
  { message: 'La date de fin doit être après la date de début', path: ['end_date'] }
);

export const updateMealPlanNutriSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  objective: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: mealPlanStatusEnum.optional(),
  is_template: z.boolean().optional(),
  nutritional_targets: nutritionalTargetsSchema.optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  meal_types: z.array(planMealTypeEnum).min(1).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être fourni pour la mise à jour',
});

export type CreateMealPlanNutriData = z.infer<typeof createMealPlanNutriSchema>;
export type UpdateMealPlanNutriData = z.infer<typeof updateMealPlanNutriSchema>;
export type MealPlanStatus = z.infer<typeof mealPlanStatusEnum>;
export type NutritionalTargetsData = z.infer<typeof nutritionalTargetsSchema>;

// =====================================================
// SCHEMA POUR PLAN-N-005: Templates / Duplication
// =====================================================

export const duplicateFromTemplateSchema = z.object({
  template_plan_id: z.string().uuid('ID du template invalide'),
  name: z.string().min(3, 'Nom requis (min 3 caractères)').max(200, 'Nom trop long'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
}).refine(
  data => new Date(data.end_date) > new Date(data.start_date),
  { message: 'La date de fin doit être après la date de début', path: ['end_date'] }
);

export type DuplicateFromTemplateData = z.infer<typeof duplicateFromTemplateSchema>;

// =====================================================
// SCHEMAS POUR LES JOURS & REPAS DU PLAN (PLAN-N-002)
// =====================================================

export const createPlanMealSchema = z.object({
  day_id: z.string().uuid('ID du jour invalide'),
  meal_type: planMealTypeEnum,
  title: z.string().max(200, 'Titre trop long').optional(),
  suggested_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:mm').optional(),
  notes: z.string().max(2000).optional(),
});

export const updatePlanMealSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  suggested_time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  display_order: z.number().int().min(0).optional(),
});

export const updatePlanDaySchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
});

export type CreatePlanMealData = z.infer<typeof createPlanMealSchema>;
export type UpdatePlanMealData = z.infer<typeof updatePlanMealSchema>;
export type UpdatePlanDayData = z.infer<typeof updatePlanDaySchema>;

// =====================================================
// SCHEMAS POUR LES ALIMENTS DU PLAN (PLAN-N-003)
// =====================================================

export const addPlanFoodSchema = z.object({
  food_id: z.string().uuid('ID aliment invalide').optional(),
  custom_name: z.string().max(200, 'Nom trop long').optional(),
  quantity: z.number().positive('La quantité doit être positive').max(10000, 'Maximum 10000'),
  unit: foodUnitEnum.default('g'),
}).refine(data => data.food_id || data.custom_name, {
  message: 'Un aliment ou un nom personnalisé est requis',
});

export const updatePlanFoodSchema = z.object({
  quantity: z.number().positive().max(10000).optional(),
  unit: foodUnitEnum.optional(),
  display_order: z.number().int().min(0).optional(),
});

export const reorderPlanFoodsSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    display_order: z.number().int().min(0),
  })).min(1).max(100),
});

export type AddPlanFoodData = z.infer<typeof addPlanFoodSchema>;
export type UpdatePlanFoodData = z.infer<typeof updatePlanFoodSchema>;
export type ReorderPlanFoodsData = z.infer<typeof reorderPlanFoodsSchema>;

// =====================================================
// SCHEMAS POUR LES DEMANDES DE MODIFICATION (PLAN-N-007)
// =====================================================

export const respondModificationRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  response: z.string().max(2000, 'Réponse trop longue').optional(),
});

export type RespondModificationRequestData = z.infer<typeof respondModificationRequestSchema>;

// =====================================================
// SCHEMA POUR L'ENVOI DE LISTE DE COURSES (PLAN-N-009)
// =====================================================

export const sendShoppingListSchema = z.object({
  message: z
    .string()
    .min(1, 'Le message ne peut pas être vide')
    .max(5000, 'Message trop long (max 5000 caractères)'),
});

export type SendShoppingListData = z.infer<typeof sendShoppingListSchema>;

// =====================================================
// SCHEMA POUR LA COPIE DE JOUR (Multi-semaines UX)
// =====================================================

export const copyDayMealsSchema = z.object({
  source_day_id: z.string().uuid('ID du jour source invalide'),
  target_day_ids: z.array(z.string().uuid('ID du jour cible invalide')).min(1, 'Au moins un jour cible requis').max(27, 'Maximum 27 jours cibles'),
});

export type CopyDayMealsData = z.infer<typeof copyDayMealsSchema>;

// =====================================================
// SCHEMAS POUR LES STATISTIQUES DE CONSULTATIONS (CONSULT-007)
// =====================================================

export const consultationStatsQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Format invalide (YYYY-MM)')
    .optional(),
});

// =====================================================
// TYPES TYPESCRIPT DÉRIVÉS DES SCHÉMAS
// =====================================================

// Types pour les repas
export type MealType = z.infer<typeof mealTypeEnum>;
export type MealLocation = z.infer<typeof mealLocationEnum>;
export type FoodUnit = z.infer<typeof foodUnitEnum>;
export type MealFood = z.infer<typeof mealFoodSchema>;
export type CreateMealData = z.infer<typeof createMealSchema>;
export type UpdateMealData = z.infer<typeof updateMealSchema>;
export type MealsQueryParams = z.infer<typeof mealsQuerySchema>;

// Types pour l'hydratation
export type BeverageType = z.infer<typeof beverageTypeEnum>;
export type CreateHydrationLogData = z.infer<typeof createHydrationLogSchema>;
export type UpdateHydrationLogData = z.infer<typeof updateHydrationLogSchema>;
export type UpdateHydrationGoalData = z.infer<typeof updateHydrationGoalSchema>;

// Types pour le poids
export type CreateWeightEntryData = z.infer<typeof createWeightEntrySchema>;
export type UpdateWeightGoalData = z.infer<typeof updateWeightGoalSchema>;

// Types pour les mensurations
export type CreateBodyMeasurementsData = z.infer<
  typeof createBodyMeasurementsSchema
>;

// Types pour le bien-être (ancien)
export type Mood = z.infer<typeof moodEnum>;
export type DigestionTag = z.infer<typeof digestionTagEnum>;
export type CreateWellnessLogData = z.infer<typeof createWellnessLogSchema>;

// Types pour le bien-être (API wellbeing - Module 2.4)
export type MoodAPI = z.infer<typeof moodAPIEnum>;
export type DigestionQualityAPI = z.infer<typeof digestionQualityAPIEnum>;
export type CreateWellbeingLogData = z.infer<typeof createWellbeingLogSchema>;
export type UpdateWellbeingLogData = z.infer<typeof updateWellbeingLogSchema>;

// Types pour l'activité
export type ActivityType = z.infer<typeof activityTypeEnum>;
export type Intensity = z.infer<typeof intensityEnum>;
export type CreateActivityLogData = z.infer<typeof createActivityLogSchema>;
export type UpdateActivityLogData = z.infer<typeof updateActivityLogSchema>;

// Types pour les objectifs
export type ObjectiveCategory = z.infer<typeof objectiveCategoryEnum>;
export type ObjectiveRole = z.infer<typeof objectiveRoleEnum>;
export type ObjectiveItem = z.infer<typeof objectiveItemSchema>;
export type CreateWeeklyObjectivesData = z.infer<
  typeof createWeeklyObjectivesSchema
>;
export type UpdateObjectiveData = z.infer<typeof updateObjectiveSchema>;

// Types pour les rendez-vous
export type ConsultationMode = z.infer<typeof consultationModeEnum>;
export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;
export type CreateAppointmentData = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentData = z.infer<typeof updateAppointmentSchema>;

// Types pour la messagerie
export type CreateMessageData = z.infer<typeof createMessageSchema>;
export type MessagesQueryParams = z.infer<typeof messagesQuerySchema>;
export type ConversationsQueryParams = z.infer<typeof conversationsQuerySchema>;

// =====================================================
// SCHÉMAS POUR LES DISPONIBILITÉS NUTRITIONNISTE
// =====================================================

// Type de disponibilité
export const availabilityTypeEnum = z.enum([
  'recurring',
  'exception',
  'blocked',
]);

// Schéma pour créer une disponibilité
export const createAvailabilitySchema = z
  .object({
    availability_type: availabilityTypeEnum,
    day_of_week: z
      .number()
      .int('Le jour doit être un entier')
      .min(0, 'Jour minimum: 0 (dimanche)')
      .max(6, 'Jour maximum: 6 (samedi)')
      .optional(),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Format de temps invalide (HH:mm)'),
    end_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Format de temps invalide (HH:mm)'),
    specific_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
      .optional(),
    visio_available: z.boolean().default(true),
    cabinet_available: z.boolean().default(true),
    valid_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
      .optional(),
    valid_until: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
      .optional(),
    consultation_type_id: z
      .string()
      .uuid('ID type de consultation invalide')
      .optional(),
    notes: z
      .string()
      .max(500, 'Notes trop longues (max 500 caractères)')
      .optional(),
  })
  .refine(
    data => {
      // Si type = recurring, day_of_week est requis
      if (data.availability_type === 'recurring') {
        return data.day_of_week !== undefined && data.day_of_week !== null;
      }
      return true;
    },
    {
      message: 'day_of_week est requis pour les disponibilités récurrentes',
      path: ['day_of_week'],
    }
  )
  .refine(
    data => {
      // Si type = exception ou blocked, specific_date est requis
      if (
        data.availability_type === 'exception' ||
        data.availability_type === 'blocked'
      ) {
        return data.specific_date !== undefined && data.specific_date !== null;
      }
      return true;
    },
    {
      message: 'specific_date est requis pour les exceptions et blocages',
      path: ['specific_date'],
    }
  )
  .refine(
    data => {
      // Vérifier que end_time > start_time
      const [startH, startM] = data.start_time.split(':').map(Number);
      const [endH, endM] = data.end_time.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return endMinutes > startMinutes;
    },
    {
      message: "L'heure de fin doit être après l'heure de début",
      path: ['end_time'],
    }
  );

// Schéma pour mettre à jour une disponibilité
export const updateAvailabilitySchema = z
  .object({
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Format de temps invalide (HH:mm)')
      .optional(),
    end_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Format de temps invalide (HH:mm)')
      .optional(),
    visio_available: z.boolean().optional(),
    cabinet_available: z.boolean().optional(),
    consultation_type_id: z
      .string()
      .uuid('ID type de consultation invalide')
      .optional()
      .nullable(),
    valid_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
      .optional()
      .nullable(),
    valid_until: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
      .optional()
      .nullable(),
    notes: z
      .string()
      .max(500, 'Notes trop longues (max 500 caractères)')
      .optional()
      .nullable(),
    is_active: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

// Types pour les disponibilités
export type AvailabilityType = z.infer<typeof availabilityTypeEnum>;
export type CreateAvailabilityData = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityData = z.infer<typeof updateAvailabilitySchema>;

// ============================================================================
// SCHEMAS: CONSULTATION TYPES (par nutritionniste)
// ============================================================================

/**
 * Schéma de validation pour la création d'un type de consultation
 */
export const createConsultationTypeSchema = z.object({
  code: z
    .string()
    .min(2, 'Code requis (min 2 caractères)')
    .max(50, 'Code trop long (max 50 caractères)')
    .regex(
      /^[a-z0-9_]+$/,
      'Code invalide (lettres minuscules, chiffres et _ uniquement)'
    ),
  name_fr: z
    .string()
    .min(3, 'Nom requis (min 3 caractères)')
    .max(100, 'Nom trop long (max 100 caractères)'),
  description_fr: z
    .string()
    .max(500, 'Description trop longue (max 500 caractères)')
    .optional()
    .nullable(),
  default_duration: z
    .number()
    .int('La durée doit être un nombre entier')
    .min(15, 'Durée minimum 15 minutes')
    .max(180, 'Durée maximum 180 minutes'),
  default_price: z
    .number()
    .min(0, 'Le prix ne peut pas être négatif')
    .max(1000, 'Prix maximum 1000 CHF'),
  visio_available: z.boolean().default(true),
  cabinet_available: z.boolean().default(true),
});

/**
 * Schéma de validation pour la mise à jour d'un type de consultation
 */
export const updateConsultationTypeSchema = z
  .object({
    code: z
      .string()
      .min(2, 'Code requis (min 2 caractères)')
      .max(50, 'Code trop long (max 50 caractères)')
      .regex(
        /^[a-z0-9_]+$/,
        'Code invalide (lettres minuscules, chiffres et _ uniquement)'
      )
      .optional(),
    name_fr: z
      .string()
      .min(3, 'Nom requis (min 3 caractères)')
      .max(100, 'Nom trop long (max 100 caractères)')
      .optional(),
    description_fr: z
      .string()
      .max(500, 'Description trop longue (max 500 caractères)')
      .optional()
      .nullable(),
    default_duration: z
      .number()
      .int('La durée doit être un nombre entier')
      .min(15, 'Durée minimum 15 minutes')
      .max(180, 'Durée maximum 180 minutes')
      .optional(),
    default_price: z
      .number()
      .min(0, 'Le prix ne peut pas être négatif')
      .max(1000, 'Prix maximum 1000 CHF')
      .optional(),
    visio_available: z.boolean().optional(),
    cabinet_available: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().min(0).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

// Types pour les types de consultation
export type CreateConsultationTypeData = z.infer<
  typeof createConsultationTypeSchema
>;
export type UpdateConsultationTypeData = z.infer<
  typeof updateConsultationTypeSchema
>;

// =====================================================
// SCHÉMAS POUR LA GESTION DES PATIENTS (NUTRITIONNISTE)
// =====================================================

export const patientStatusFilterEnum = z.enum([
  'all',
  'active',
  'pending',
  'inactive',
]);

export const patientSortEnum = z.enum([
  'name_asc',
  'name_desc',
  'date_asc',
  'date_desc',
]);

export const nutritionistPatientsQuerySchema = z.object({
  search: z.string().max(100, 'Recherche trop longue').optional(),
  status: patientStatusFilterEnum.default('all'),
  sort: patientSortEnum.default('name_asc'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limite invalide')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default('50'),
  offset: z
    .string()
    .regex(/^\d+$/, 'Offset invalide')
    .transform(Number)
    .pipe(z.number().int().min(0))
    .default('0'),
});

// Types pour la gestion des patients
export type PatientStatusFilter = z.infer<typeof patientStatusFilterEnum>;
export type PatientSort = z.infer<typeof patientSortEnum>;
export type NutritionistPatientsQueryParams = z.infer<
  typeof nutritionistPatientsQuerySchema
>;

// Schema pour la mise à jour des notes internes d'un patient (legacy - champ unique)
export const patientNotesUpdateSchema = z.object({
  notes_internal: z.string().max(5000, 'Notes trop longues (max 5000 caractères)').optional(),
});

// Schema pour la mise à jour du statut d'un patient
export const updatePatientStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'pending']),
  status_reason: z.string().max(500, 'Raison trop longue (max 500 caractères)').optional(),
});

export type UpdatePatientStatusData = z.infer<typeof updatePatientStatusSchema>;

// Schemas pour les notes internes individuelles (PAT-006)
export const createPatientNoteSchema = z.object({
  content: z.string().min(1, 'La note ne peut pas être vide').max(5000, 'Note trop longue (max 5000 caractères)'),
});

export type CreatePatientNoteData = z.infer<typeof createPatientNoteSchema>;

export const updatePatientNoteSchema = z.object({
  content: z.string().min(1, 'La note ne peut pas être vide').max(5000, 'Note trop longue (max 5000 caractères)'),
});

export type UpdatePatientNoteData = z.infer<typeof updatePatientNoteSchema>;

// ==================== DOSSIER SCHEMAS (Epic 3) ====================

// -- Anamnese --

export const anamneseSectionIdEnum = z.enum([
  'identite',
  'morphologie',
  'historique',
  'sante',
  'sante_bilan',
  'habitudes',
  'consommation',
  'lifestyle',
  'motivation',
  'psycho_comportemental',
]);

export const anamneseFieldSchema = z.object({
  label: z.string().min(1, 'Label requis'),
  value: z.string(),
});

export const upsertAnamneseSectionSchema = z.object({
  section_id: anamneseSectionIdEnum,
  section_label: z.string().min(1, 'Label de section requis'),
  section_icon: z.string().default(''),
  field_data: z
    .record(z.string(), z.string())
    .refine(data => Object.keys(data).length > 0, 'Au moins un champ requis'),
  display_order: z.number().int().min(0).default(0),
});

export const updateAnamneseStatusSchema = z.object({
  status: z.enum(['draft', 'pending', 'completed', 'archived']),
});

export const createAnamneseSchema = z.object({
  prefill_from_version: z.number().int().min(1).optional(),
});

// -- Change Reports --

export const changeReportsQuerySchema = z.object({
  status: z.enum(['pending', 'reviewed', 'integrated', 'all']).default('all'),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .default('20'),
});

export const reviewChangeReportSchema = z.object({
  status: z.enum(['reviewed', 'integrated']),
  reviewer_notes: z.string().max(1000).optional(),
});

export const createChangeReportSchema = z.object({
  change_type: z.enum(['health', 'medication', 'allergy', 'lifestyle', 'other']),
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().min(5, 'La description doit contenir au moins 5 caractères').max(2000),
  anamnesis_section_id: z.string().max(50).default('general'),
  old_value: z.string().max(500).optional(),
  new_value: z.string().max(500).optional(),
});

// -- Questionnaires --

export const questionnaireQuestionSchema = z.object({
  question: z.string().min(1, 'Question requise'),
  type: z.enum(['text', 'scale', 'choice', 'boolean', 'number']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
});

export const createQuestionnaireSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200),
  questionnaire_type: z.string().min(1, 'Type requis'),
  due_date: z.string().datetime().optional(),
  questions: z.array(questionnaireQuestionSchema).min(1, 'Au moins une question requise'),
  consultation_id: z.string().uuid().optional(),
});

// -- Documents --

export const documentCategoryEnum = z.enum(['Analyses', 'Plans', 'Ressources', 'Autre']);

export const createDocumentMetadataSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  category: documentCategoryEnum,
  description: z.string().max(500).optional(),
  consultation_id: z.string().uuid().optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: documentCategoryEnum.optional(),
  description: z.string().max(500).optional(),
});

// -- Objectives --

export const createObjectiveSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200),
  description: z.string().max(1000).optional(),
  category: z.string().min(1, 'Catégorie requise'),
  target_value: z.string().optional(),
  target_unit: z.string().optional(),
  start_value: z.string().optional(),
  start_date: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
  priority: z.number().int().min(1).max(5).default(3),
});

export const updateObjectiveStatusSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  target_value: z.string().optional(),
  deadline: z.string().datetime().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
});

export const objectiveProgressLogSchema = z.object({
  progress: z.number().min(0).max(100),
  value: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// -- Patient Modification Requests (Plan Alimentaire) --

export const createPatientModificationRequestSchema = z.object({
  request_type: z.enum(['substitution', 'quantity', 'meal_time', 'allergy', 'preference', 'other']),
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200, 'Titre trop long (max 200 caractères)'),
  description: z.string().min(5, 'La description doit contenir au moins 5 caractères').max(2000, 'Description trop longue (max 2000 caractères)'),
  suggested_alternative: z.string().max(500, 'Suggestion trop longue (max 500 caractères)').optional(),
});

export type CreatePatientModificationRequestData = z.infer<typeof createPatientModificationRequestSchema>;

// -- Export --

export const exportDossierQuerySchema = z.object({
  sections: z
    .string()
    .transform(s => s.split(','))
    .pipe(z.array(z.string()))
    .optional(),
});

// =====================================================
// SCHEMAS POUR LE SUIVI PATIENT - NUTRITIONNISTE (EPIC 8)
// =====================================================

// SUIVI-007: Type de feedback sur un repas
export const mealFeedbackTypeEnum = z.enum([
  'general',
  'positive',
  'warning',
  'suggestion',
]);

// SUIVI-007: Création de feedback sur un repas
export const createMealFeedbackSchema = z.object({
  comment: z
    .string()
    .min(1, 'Le commentaire est requis')
    .max(2000, 'Commentaire trop long (max 2000 caractères)'),
  feedback_type: mealFeedbackTypeEnum.default('general'),
});

export type MealFeedbackType = z.infer<typeof mealFeedbackTypeEnum>;
export type CreateMealFeedbackData = z.infer<typeof createMealFeedbackSchema>;

// =====================================================
// SCHEMAS POUR LES PROFILS NUTRITIONNELS (Phase 2.5)
// =====================================================

export const bmrFormulaEnum = z.enum([
  'mifflin_st_jeor',
  'harris_benedict_revised',
  'harris_benedict_original',
  'katch_mcardle',
]);

export const profileGoalEnum = z.enum(['lose', 'maintain', 'gain']);

export const specialCaseEnum = z.enum([
  'none',
  'pregnancy_t1',
  'pregnancy_t2',
  'pregnancy_t3',
  'breastfeeding',
  'athlete',
  'senior',
  'adolescent',
]);

export const profileStatusEnum = z.enum(['draft', 'active', 'archived']);

export const activityLevelEnum = z.enum([
  'sedentary',
  'lightlyActive',
  'moderatelyActive',
  'veryActive',
  'athlete',
]);

// Micro-nutriment targets (optionnel, mode basique ou avancé)
export const microTargetsSchema = z.object({
  fiber_g: z.number().min(0).max(100).optional(),
  sodium_mg: z.number().min(0).max(10000).optional(),
  calcium_mg: z.number().min(0).max(5000).optional(),
  iron_mg: z.number().min(0).max(100).optional(),
  magnesium_mg: z.number().min(0).max(2000).optional(),
  phosphorus_mg: z.number().min(0).max(5000).optional(),
  potassium_mg: z.number().min(0).max(10000).optional(),
  zinc_mg: z.number().min(0).max(100).optional(),
  vitamin_a_ug: z.number().min(0).max(10000).optional(),
  vitamin_b1_mg: z.number().min(0).max(100).optional(),
  vitamin_b2_mg: z.number().min(0).max(100).optional(),
  vitamin_b3_mg: z.number().min(0).max(500).optional(),
  vitamin_b6_mg: z.number().min(0).max(100).optional(),
  vitamin_b9_ug: z.number().min(0).max(2000).optional(),
  vitamin_b12_ug: z.number().min(0).max(100).optional(),
  vitamin_c_mg: z.number().min(0).max(5000).optional(),
  vitamin_d_ug: z.number().min(0).max(200).optional(),
  vitamin_e_mg: z.number().min(0).max(1000).optional(),
  vitamin_k_ug: z.number().min(0).max(500).optional(),
  cholesterol_mg: z.number().min(0).max(1000).optional(),
}).optional().nullable();

// Création d'un profil nutritionnel
export const createNutritionalProfileSchema = z.object({
  name: z.string().min(3, 'Nom requis (min 3 caractères)').max(200, 'Nom trop long (max 200)'),
  status: profileStatusEnum.optional().default('draft'),
  weight_kg: z.number().min(30, 'Poids minimum : 30 kg').max(300, 'Poids maximum : 300 kg'),
  height_cm: z.number().min(100, 'Taille minimum : 100 cm').max(250, 'Taille maximum : 250 cm'),
  age: z.number().int().min(13, 'Âge minimum : 13 ans').max(120, 'Âge maximum : 120 ans'),
  gender: z.enum(['male', 'female']),
  body_fat_pct: z.number().min(1).max(60).optional().nullable(),
  bmr_formula: bmrFormulaEnum.default('mifflin_st_jeor'),
  activity_level: activityLevelEnum.default('moderatelyActive'),
  goal: profileGoalEnum.default('maintain'),
  goal_adjustment_kcal: z.number().int().min(-1000).max(1000).optional().default(0),
  special_case: specialCaseEnum.optional().default('none'),
  special_case_adjustment_kcal: z.number().int().min(-1000).max(1000).optional().nullable(),
  macro_template: z.string().max(50).optional().nullable(),
  protein_pct: z.number().min(5, 'Protéines : minimum 5%').max(60, 'Protéines : maximum 60%'),
  carbs_pct: z.number().min(0, 'Glucides : minimum 0%').max(80, 'Glucides : maximum 80%'),
  fat_pct: z.number().min(10, 'Lipides : minimum 10%').max(80, 'Lipides : maximum 80%'),
  micro_targets: microTargetsSchema,
  notes: z.string().max(2000, 'Notes trop longues').optional().nullable(),
  private_notes: z.string().max(2000, 'Notes privées trop longues').optional().nullable(),
}).refine(
  data => data.bmr_formula !== 'katch_mcardle' || (data.body_fat_pct != null && data.body_fat_pct > 0),
  { message: 'Le taux de masse grasse est requis pour la formule Katch-McArdle', path: ['body_fat_pct'] }
).refine(
  data => Math.abs(data.protein_pct + data.carbs_pct + data.fat_pct - 100) <= 1,
  { message: 'La somme des macronutriments doit être égale à 100%', path: ['protein_pct'] }
);

// Mise à jour d'un profil nutritionnel (partiel)
export const updateNutritionalProfileSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  status: profileStatusEnum.optional(),
  weight_kg: z.number().min(30).max(300).optional(),
  height_cm: z.number().min(100).max(250).optional(),
  age: z.number().int().min(13).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  body_fat_pct: z.number().min(1).max(60).optional().nullable(),
  bmr_formula: bmrFormulaEnum.optional(),
  activity_level: activityLevelEnum.optional(),
  goal: profileGoalEnum.optional(),
  goal_adjustment_kcal: z.number().int().min(-1000).max(1000).optional(),
  special_case: specialCaseEnum.optional(),
  special_case_adjustment_kcal: z.number().int().min(-1000).max(1000).optional().nullable(),
  macro_template: z.string().max(50).optional().nullable(),
  protein_pct: z.number().min(5).max(60).optional(),
  carbs_pct: z.number().min(0).max(80).optional(),
  fat_pct: z.number().min(10).max(80).optional(),
  micro_targets: microTargetsSchema,
  notes: z.string().max(2000).optional().nullable(),
  private_notes: z.string().max(2000).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être fourni pour la mise à jour',
});

export type BmrFormulaType = z.infer<typeof bmrFormulaEnum>;
export type ProfileGoalType = z.infer<typeof profileGoalEnum>;
export type SpecialCaseType = z.infer<typeof specialCaseEnum>;
export type ProfileStatusType = z.infer<typeof profileStatusEnum>;
export type ActivityLevelType = z.infer<typeof activityLevelEnum>;
export type CreateNutritionalProfileData = z.infer<typeof createNutritionalProfileSchema>;
export type UpdateNutritionalProfileData = z.infer<typeof updateNutritionalProfileSchema>;
