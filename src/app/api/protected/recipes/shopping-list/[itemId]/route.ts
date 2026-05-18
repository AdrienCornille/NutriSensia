import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuth, apiResponse } from '@/lib/api-auth';
import { updateShoppingListItemSchema } from '@/lib/api-schemas';

/**
 * PATCH /api/protected/recipes/shopping-list/[itemId]
 * Update a shopping list item (toggle checked, edit quantity)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { itemId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    const body = await req.json();
    const parsed = updateShoppingListItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.error(parsed.error.issues[0].message, 400);
    }

    // Verify ownership via shopping list
    const { data: item } = await s
      .from('shopping_list_items')
      .select('id, shopping_list_id, shopping_lists(patient_id)')
      .eq('id', itemId)
      .single();

    if (!item || item.shopping_lists?.patient_id !== auth.user.id) {
      return apiResponse.error('Item introuvable', 404);
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.is_checked !== undefined) {
      updateData.is_checked = parsed.data.is_checked;
      updateData.checked_at = parsed.data.is_checked
        ? new Date().toISOString()
        : null;
    }
    if (parsed.data.quantity !== undefined)
      updateData.quantity = parsed.data.quantity;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

    const { data: updated, error } = await s
      .from('shopping_list_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      return apiResponse.serverError("Erreur lors de la mise à jour de l'item");
    }

    return apiResponse.success(updated);
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}

/**
 * DELETE /api/protected/recipes/shopping-list/[itemId]
 * Remove an item from the shopping list
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const auth = await verifyAuth({ requireAuth: true });
    if (auth.error || !auth.user) {
      return apiResponse.unauthorized(auth.error || 'Authentification requise');
    }

    const { itemId } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any;

    // Verify ownership
    const { data: item } = await s
      .from('shopping_list_items')
      .select('id, shopping_lists(patient_id)')
      .eq('id', itemId)
      .single();

    if (!item || item.shopping_lists?.patient_id !== auth.user.id) {
      return apiResponse.error('Item introuvable', 404);
    }

    await s.from('shopping_list_items').delete().eq('id', itemId);

    return apiResponse.success({ deleted: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return apiResponse.serverError('Erreur serveur');
  }
}
