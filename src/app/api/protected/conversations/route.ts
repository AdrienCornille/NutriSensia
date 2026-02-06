/**
 * API Route: /api/protected/conversations
 * Liste des conversations de l'utilisateur connecté
 *
 * GET - Récupérer les conversations avec preview et unread count
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

/**
 * Create a Supabase admin client (service role) to bypass RLS
 * Used for reading other participant's profile (name, avatar) in conversations
 */
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const auth = await verifyAuth({
      requireAuth: true,
      requiredRoles: ['patient', 'nutritionist'],
    });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    // 2. Parser query params
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '20', 10), 1),
      50
    );
    const offset = Math.max(
      parseInt(searchParams.get('offset') || '0', 10),
      0
    );

    // 3. Clients Supabase
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // 4. Lire le rôle (depuis user_metadata, déjà vérifié par verifyAuth)
    const userRole = auth.user.user_metadata?.role || 'patient';

    // 5. Récupérer les conversations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (userRole === 'patient') {
      query = query.eq('patient_id', auth.user.id);
    } else {
      query = query.eq('nutritionist_id', auth.user.id);
    }

    query = query
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data: conversations, error, count } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return apiResponse.serverError(
        'Erreur lors de la récupération des conversations'
      );
    }

    if (!conversations || conversations.length === 0) {
      // For patients: auto-create conversation if they have an assigned nutritionist
      if (userRole === 'patient' && offset === 0) {
        const created = await autoCreatePatientConversation(
          supabase,
          supabaseAdmin,
          auth.user.id,
          limit,
          offset
        );
        if (created) return created;
      }

      return NextResponse.json(
        { conversations: [], total: 0, limit, offset },
        { status: 200 }
      );
    }

    // 6. Enrichir les conversations avec les profils des autres participants
    // Use admin client to bypass RLS (patients can't SELECT other users' profiles)
    const enriched = await enrichConversations(
      supabaseAdmin || supabase,
      conversations,
      userRole
    );

    return NextResponse.json(
      {
        conversations: enriched,
        total: count || conversations.length,
        limit,
        offset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/protected/conversations:',
      error
    );
    return apiResponse.serverError('Erreur serveur');
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Enrich conversations with the other participant's profile info
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function enrichConversations(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conversations: any[],
  userRole: string
) {
  const otherUserIds = conversations.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (conv: any) =>
      userRole === 'patient' ? conv.nutritionist_id : conv.patient_id
  );

  const { data: otherProfiles } = await client
    .from('profiles')
    .select('id, first_name, last_name, avatar_url')
    .in('id', otherUserIds);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profilesMap: Record<string, any> = {};
  if (otherProfiles) {
    for (const p of otherProfiles) {
      profilesMap[p.id] = p;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return conversations.map((conv: any) => {
    const otherId =
      userRole === 'patient' ? conv.nutritionist_id : conv.patient_id;
    const otherProfile = profilesMap[otherId];

    return {
      ...conv,
      other_user: otherProfile
        ? {
            id: otherProfile.id,
            first_name: otherProfile.first_name,
            last_name: otherProfile.last_name,
            avatar_url: otherProfile.avatar_url,
          }
        : null,
    };
  });
}

/**
 * Auto-create a conversation for a patient who has an assigned nutritionist
 * but no existing conversation yet.
 */
async function autoCreatePatientConversation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  patientUserId: string,
  limit: number,
  offset: number
): Promise<NextResponse | null> {
  try {
    // Find the patient's assigned nutritionist via patient_profiles → nutritionist_profiles
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('nutritionist_id')
      .eq('user_id', patientUserId)
      .not('nutritionist_id', 'is', null)
      .single();

    if (!patientProfile?.nutritionist_id) return null;

    // Get the nutritionist's user_id (auth uid) from nutritionist_profiles
    // nutritionist_profiles has USING(true) RLS so any authenticated user can SELECT
    const { data: nutritionistProfile } = await supabase
      .from('nutritionist_profiles')
      .select('user_id')
      .eq('id', patientProfile.nutritionist_id)
      .single();

    if (!nutritionistProfile?.user_id) return null;

    // Direct INSERT into conversations
    // RLS allows this because patient_id = auth.uid()
    const { data: newConv, error: insertError } = await supabase
      .from('conversations')
      .insert({
        patient_id: patientUserId,
        nutritionist_id: nutritionistProfile.user_id,
      })
      .select('*')
      .single();

    if (insertError) {
      console.warn('Auto-create conversation insert failed:', insertError);
      return null;
    }

    if (!newConv) return null;

    // Create conversation_settings for the current user only
    // (the nutritionist's settings will be created when they access the conversation)
    await supabase
      .from('conversation_settings')
      .insert({ conversation_id: newConv.id, user_id: patientUserId });

    // Fetch the nutritionist's profile info using admin client (bypasses RLS)
    const profileClient = supabaseAdmin || supabase;
    const { data: nutProfile } = await profileClient
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', nutritionistProfile.user_id)
      .single();

    return NextResponse.json(
      {
        conversations: [
          {
            ...newConv,
            other_user: nutProfile
              ? {
                  id: nutProfile.id,
                  first_name: nutProfile.first_name,
                  last_name: nutProfile.last_name,
                  avatar_url: nutProfile.avatar_url,
                }
              : null,
          },
        ],
        total: 1,
        limit,
        offset,
      },
      { status: 200 }
    );
  } catch (autoCreateError) {
    console.warn('Auto-create conversation failed:', autoCreateError);
    return null;
  }
}
