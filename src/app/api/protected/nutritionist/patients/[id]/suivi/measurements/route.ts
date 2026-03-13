import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
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
    if (!patientProfileId) {
      return apiResponse.error('ID patient requis', 400);
    }

    const supabase = await createClient();

    // Get nutritionist profile
    const { data: nutritionistProfile } = await (supabase as any)
      .from('nutritionist_profiles')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (!nutritionistProfile) {
      return apiResponse.error('Profil nutritionniste introuvable', 404);
    }

    // Verify patient belongs to nutritionist
    const { data: patient } = await (supabase as any)
      .from('patient_profiles')
      .select('id, user_id')
      .eq('id', patientProfileId)
      .eq('nutritionist_id', nutritionistProfile.id)
      .single();

    if (!patient) {
      return apiResponse.notFound('Patient introuvable');
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const measurementType = searchParams.get('measurement_type');

    // Fetch measurements
    let measurementsQuery = (supabase as any)
      .from('measurements')
      .select('id, measurement_type, value_cm, date, notes')
      .eq('patient_id', patient.user_id)
      .order('date', { ascending: false });

    if (measurementType) {
      measurementsQuery = measurementsQuery.eq(
        'measurement_type',
        measurementType
      );
    }
    if (startDate) {
      measurementsQuery = measurementsQuery.gte('date', startDate);
    }
    if (endDate) {
      measurementsQuery = measurementsQuery.lte('date', endDate);
    }

    const { data: measurements, error: measurementsError } =
      await measurementsQuery;

    if (measurementsError) {
      console.error('Error fetching measurements:', measurementsError);
      return apiResponse.serverError(
        'Erreur lors de la recuperation des mensurations'
      );
    }

    // Compute statistics
    const measurementsList = measurements || [];
    const typesSet = new Set(
      measurementsList.map(
        (m: { measurement_type: string }) => m.measurement_type
      )
    );

    const statistics = {
      measurements_count: measurementsList.length,
      types_measured: typesSet.size,
    };

    return apiResponse.success({
      measurements: measurementsList,
      statistics,
    });
  } catch (error) {
    console.error('Unexpected error in measurements GET:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
