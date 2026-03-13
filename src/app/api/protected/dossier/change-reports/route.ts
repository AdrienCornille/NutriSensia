import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { createChangeReportSchema } from '@/lib/api-schemas';

// GET - List patient's own change reports
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const supabase = await createClient();
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'all';

    let query = (supabase as any)
      .from('change_reports')
      .select('*')
      .eq('patient_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: reports, error: reportsError } = await query;

    if (reportsError) {
      console.error('Error fetching patient change reports:', reportsError);
      return apiResponse.serverError('Erreur lors de la récupération');
    }

    return apiResponse.success(reports || []);
  } catch (error) {
    console.error('Unexpected error in patient change-reports GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

// POST - Create a new change report
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth({ requireAuth: true });

    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const body = await req.json();
    const parsed = createChangeReportSchema.safeParse(body);

    if (!parsed.success) {
      console.error('Change report validation failed:', JSON.stringify(parsed.error.issues), 'Body:', JSON.stringify(body));
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    const supabase = await createClient();

    const { data: report, error: insertError } = await (supabase as any)
      .from('change_reports')
      .insert({
        patient_id: auth.user.id,
        ...parsed.data,
      })
      .select('id, change_type, title, status, created_at')
      .single();

    if (insertError) {
      console.error('Error creating change report:', insertError);
      return apiResponse.serverError('Erreur lors de la création du signalement');
    }

    return apiResponse.success(report, 201);
  } catch (error) {
    console.error('Unexpected error in patient change-reports POST:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
