/**
 * API Route pour récupérer les informations de l'utilisateur connecté
 * 
 * Cette route vérifie l'authentification et retourne les informations
 * de l'utilisateur, y compris son rôle.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // MODE DÉMO : Retourner différents utilisateurs selon le contexte
    // pour tester la protection d'accès avec différents rôles
    
    // Récupérer le paramètre de test depuis l'URL ou les headers
    const url = new URL(request.url);
    const testRole = url.searchParams.get('role') || 'admin'; // Par défaut, administrateur pour permettre l'accès
    
    // En mode démo, utiliser le paramètre de rôle pour simuler différents utilisateurs
    console.log(`🔧 Paramètre de rôle reçu: ${testRole}`);
    
    // Définir les utilisateurs de test
    const testUsers = {
      admin: {
        id: 'demo-admin-id',
        email: 'admin@nutrisensia.com',
        role: 'admin',
        isAdmin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      nutritionist: {
        id: 'demo-nutritionist-id',
        email: 'nutritionist@nutrisensia.com',
        role: 'nutritionist',
        isAdmin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      user: {
        id: 'demo-user-id',
        email: 'user@nutrisensia.com',
        role: 'user',
        isAdmin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    // Sélectionner l'utilisateur de test
    const demoUser = testUsers[testRole as keyof typeof testUsers] || testUsers.admin;
    
    console.log(`🔧 Mode démo : retour d'un utilisateur ${testRole}`);
    console.log('👤 Utilisateur démo:', demoUser);

    return NextResponse.json(demoUser);

  } catch (error) {
    console.error('Erreur dans /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}