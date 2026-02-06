import { z } from 'zod';

// =====================================================
// SCHÉMAS POUR LES REPAS (MEALS)
// =====================================================

// Type de repas
export const mealTypeEnum = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

// Lieu de repas
export const mealLocationEnum = z.enum(['home', 'work', 'restaurant', 'other']);

// Unité de mesure pour les aliments
export const foodUnitEnum = z.enum(['g', 'ml', 'portion']);

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
export const patientCounterProposalResponseSchema = z.object({
  action: z.enum(['accept', 'decline']),
  reason: z
    .string()
    .max(500, 'Raison trop longue (max 500 caractères)')
    .optional(),
});

export type PatientCounterProposalResponseData = z.infer<
  typeof patientCounterProposalResponseSchema
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
