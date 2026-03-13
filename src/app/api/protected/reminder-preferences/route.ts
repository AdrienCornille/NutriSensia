import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateReminderPreferencesSchema } from '@/lib/api-schemas';

/**
 * GET /api/protected/reminder-preferences
 * Récupérer les préférences de rappel du patient
 */
export async function GET() {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error);
    }

    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('reminder_preferences')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found (no preferences yet)
      return apiResponse.error(`Erreur DB: ${error.message}`, 500);
    }

    // Return defaults if no preferences exist
    const preferences = data || {
      email_enabled: true,
      email_hours_before: 24,
      push_enabled: true,
      push_hours_before: 1,
      sms_enabled: false,
      sms_hours_before: 2,
    };

    return apiResponse.success(preferences);
  } catch (error) {
    console.error('Error in GET /api/protected/reminder-preferences:', error);
    return apiResponse.error('Erreur serveur', 500);
  }
}

/**
 * PATCH /api/protected/reminder-preferences
 * Mettre à jour les préférences de rappel du patient
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error);
    }

    const body = await req.json();
    const parsed = updateReminderPreferencesSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message);
    }

    const supabase = await createClient();

    // Upsert: create if not exists, update if exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('reminder_preferences')
      .upsert(
        {
          user_id: auth.user.id,
          ...parsed.data,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting reminder preferences:', error);
      return apiResponse.error(`Erreur DB: ${error.message}`, 500);
    }

    return apiResponse.success(data);
  } catch (error) {
    console.error('Error in PATCH /api/protected/reminder-preferences:', error);
    return apiResponse.error('Erreur serveur', 500);
  }
}
