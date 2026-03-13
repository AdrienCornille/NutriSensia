/**
 * API Route: /api/protected/nutritionist/patients/[id]/nutritional-profiles/prefill
 * Retourne les donnees connues du patient pour pre-remplir le formulaire de profil nutritionnel
 *
 * GET - Agrege les donnees depuis patient_profiles, anamnese (morphologie/identite/lifestyle), et poids recent
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

// ============================================================================
// Helpers
// ============================================================================

async function resolveNutritionistId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('nutritionist_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

async function verifyPatientAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  patientProfileId: string,
  nutritionistId: string
): Promise<{ userId: string } | null> {
  const { data } = await supabase
    .from('patient_profiles')
    .select('user_id')
    .eq('id', patientProfileId)
    .eq('nutritionist_id', nutritionistId)
    .single();
  return data ? { userId: data.user_id } : null;
}

/**
 * Map French activity level text to the calculator enum values
 */
function mapActivityLevel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase().trim();
  const mapping: Record<string, string> = {
    'sédentaire': 'sedentary',
    'sedentaire': 'sedentary',
    'légèrement actif': 'lightlyActive',
    'legerement actif': 'lightlyActive',
    'modéré': 'lightlyActive',
    'modere': 'lightlyActive',
    'modérément actif': 'moderatelyActive',
    'moderement actif': 'moderatelyActive',
    'actif': 'moderatelyActive',
    'très actif': 'veryActive',
    'tres actif': 'veryActive',
    'athlète': 'athlete',
    'athlete': 'athlete',
  };
  return mapping[normalized] || null;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number | null {
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate ideal weight using three complementary formulas:
 * - Lorentz: gender-aware (different coefficients for male/female)
 * - Devine: gender-aware (clinical reference, used in pharmacology)
 * - Creff: age + morphology-aware (normal build), not gender-specific by design
 */
function calculateIdealWeights(
  heightCm: number,
  gender: 'male' | 'female',
  age: number
): { lorentz: number; devine: number; creff: number } {
  // Lorentz formula (gender-aware)
  const lorentz =
    gender === 'male'
      ? heightCm - 100 - (heightCm - 150) / 4
      : heightCm - 100 - (heightCm - 150) / 2.5;

  // Devine formula (gender-aware, clinical standard)
  // Male: 50 + 0.9 × (height_cm - 152.4)
  // Female: 45.5 + 0.9 × (height_cm - 152.4)
  const devine =
    gender === 'male'
      ? 50 + 0.9 * (heightCm - 152.4)
      : 45.5 + 0.9 * (heightCm - 152.4);

  // Creff formula (normal morphology, age-aware, not gender-specific by design)
  const creff = (heightCm - 100 + age / 10) * 0.9;

  return {
    lorentz: Math.round(lorentz * 10) / 10,
    devine: Math.round(devine * 10) / 10,
    creff: Math.round(creff * 10) / 10,
  };
}

// ============================================================================
// GET - Prefill data
// ============================================================================

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRole: 'nutritionist',
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { id: patientProfileId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const nutritionistId = await resolveNutritionistId(s, auth.user.id);
    if (!nutritionistId) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    const patientAccess = await verifyPatientAccess(
      s,
      patientProfileId,
      nutritionistId
    );
    if (!patientAccess) {
      return apiResponse.error('Patient introuvable ou acces non autorise', 403);
    }

    const patientUserId = patientAccess.userId;

    // --- Fetch data from multiple sources in parallel ---

    const [
      patientProfileResult,
      latestWeightResult,
      anamnesisResult,
    ] = await Promise.all([
      // 1. Patient profile
      s
        .from('patient_profiles')
        .select('date_of_birth, initial_weight, initial_height, gender, activity_level')
        .eq('user_id', patientUserId)
        .single(),

      // 2. Latest weight entry
      s
        .from('weight_entries')
        .select('weight_kg, date')
        .eq('patient_id', patientUserId)
        .order('date', { ascending: false })
        .limit(1),

      // 3. Current anamnesis with morphologie, identite, lifestyle sections
      s.rpc('get_current_anamnesis_v2', { p_patient_id: patientUserId }),
    ]);

    // --- Build prefill result ---

    const prefill: Record<string, unknown> = {};
    const sources: Record<string, string> = {};

    // From patient_profiles
    const pp = patientProfileResult.data;
    if (pp) {
      if (pp.initial_height) {
        prefill.height_cm = Number(pp.initial_height);
        sources.height_cm = 'patient_profiles';
      }
      if (pp.initial_weight) {
        prefill.weight_kg = Number(pp.initial_weight);
        sources.weight_kg = 'patient_profiles';
      }
      if (pp.gender) {
        prefill.gender = pp.gender;
        sources.gender = 'patient_profiles';
      }
      if (pp.date_of_birth) {
        const age = calculateAge(pp.date_of_birth);
        if (age && age >= 13 && age <= 120) {
          prefill.age = age;
          sources.age = 'patient_profiles';
        }
      }
      if (pp.activity_level) {
        const mapped = mapActivityLevel(pp.activity_level);
        if (mapped) {
          prefill.activity_level = mapped;
          sources.activity_level = 'patient_profiles';
        }
      }
    }

    // From latest weight entry (more recent than initial_weight)
    const latestWeight = latestWeightResult.data?.[0];
    if (latestWeight?.weight_kg) {
      prefill.weight_kg = Number(latestWeight.weight_kg);
      sources.weight_kg = 'weight_entries';
    }

    // From anamnesis data
    // get_current_anamnesis_v2 uses RETURNS TABLE, so Supabase may return an array or object
    const rawAnamnesis = anamnesisResult.data;
    const anamnesis = Array.isArray(rawAnamnesis) ? rawAnamnesis[0] : rawAnamnesis;
    if (anamnesis && typeof anamnesis === 'object') {
      // Morphologie section
      const morpho = anamnesis.morphologie;
      if (morpho && typeof morpho === 'object') {
        if (morpho.taille && !prefill.height_cm) {
          prefill.height_cm = Number(morpho.taille);
          sources.height_cm = 'anamnese_morphologie';
        }
        if (morpho.masse_grasse) {
          prefill.body_fat_pct = Number(morpho.masse_grasse);
          sources.body_fat_pct = 'anamnese_morphologie';
        }
        if (morpho.poids_initial && !prefill.weight_kg) {
          prefill.weight_kg = Number(morpho.poids_initial);
          sources.weight_kg = 'anamnese_morphologie';
        }
      }

      // Identite section
      const identite = anamnesis.identite;
      if (identite && typeof identite === 'object') {
        if (identite.date_naissance && !prefill.age) {
          const age = calculateAge(String(identite.date_naissance));
          if (age && age >= 13 && age <= 120) {
            prefill.age = age;
            sources.age = 'anamnese_identite';
          }
        }
        if (identite.genre && !prefill.gender) {
          const g = String(identite.genre).toLowerCase();
          if (g === 'homme' || g === 'male' || g === 'masculin') {
            prefill.gender = 'male';
            sources.gender = 'anamnese_identite';
          } else if (g === 'femme' || g === 'female' || g === 'féminin' || g === 'feminin') {
            prefill.gender = 'female';
            sources.gender = 'anamnese_identite';
          }
        }
      }

      // Lifestyle section
      const lifestyle = anamnesis.lifestyle;
      if (lifestyle && typeof lifestyle === 'object') {
        if (lifestyle.activite_pro && !prefill.activity_level) {
          const mapped = mapActivityLevel(String(lifestyle.activite_pro));
          if (mapped) {
            prefill.activity_level = mapped;
            sources.activity_level = 'anamnese_lifestyle';
          }
        }
      }

      // Motivation section — goal inference
      const motivation = anamnesis.motivation;
      if (motivation && typeof motivation === 'object') {
        // 1. From objectif_principal (multiselect array)
        const objectifs: string[] = Array.isArray(motivation.objectif_principal)
          ? motivation.objectif_principal.map((o: unknown) => String(o).toLowerCase())
          : [];

        if (objectifs.some(o => o.includes('perte de poids'))) {
          prefill.goal = 'lose';
          sources.goal = 'anamnese_motivation';
        } else if (objectifs.some(o => o.includes('prise de masse'))) {
          prefill.goal = 'gain';
          sources.goal = 'anamnese_motivation';
        }

        // 2. From objectif_poids (target weight) vs current weight — refine if no
        //    explicit goal was found from objectif_principal
        if (!prefill.goal && motivation.objectif_poids && prefill.weight_kg) {
          const target = Number(motivation.objectif_poids);
          const current = Number(prefill.weight_kg);
          if (target && current) {
            const diff = target - current;
            if (diff < -2) {
              prefill.goal = 'lose';
              sources.goal = 'anamnese_motivation';
            } else if (diff > 2) {
              prefill.goal = 'gain';
              sources.goal = 'anamnese_motivation';
            } else {
              prefill.goal = 'maintain';
              sources.goal = 'anamnese_motivation';
            }
          }
        }
      }
    }

    // --- Build reference weights for the info panel ---
    const referenceWeights: Record<string, unknown> = {};

    // Target weight from anamnesis motivation
    const anamnesisMotivation = anamnesis?.motivation;
    if (anamnesisMotivation?.objectif_poids) {
      referenceWeights.target_weight_kg = Number(anamnesisMotivation.objectif_poids);
    }
    // Poids forme from anamnesis historique
    const anamnesisHistorique = anamnesis?.historique;
    if (anamnesisHistorique?.poids_forme) {
      referenceWeights.comfort_weight_kg = Number(anamnesisHistorique.poids_forme);
    }

    // Calculated ideal weights (need height, gender, age)
    const h = Number(prefill.height_cm);
    const g = prefill.gender as 'male' | 'female' | undefined;
    const a = Number(prefill.age);
    if (h && g && a) {
      const ideal = calculateIdealWeights(h, g, a);
      referenceWeights.ideal_lorentz_kg = ideal.lorentz;
      referenceWeights.ideal_devine_kg = ideal.devine;
      referenceWeights.ideal_creff_kg = ideal.creff;
    }

    return apiResponse.success({ prefill, sources, referenceWeights });
  } catch (error) {
    console.error('Unexpected error in nutritional profiles prefill GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
