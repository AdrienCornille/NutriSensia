/**
 * Script pour créer un utilisateur administrateur de test
 * 
 * Ce script crée un utilisateur avec le rôle d'administrateur
 * pour tester les pages de démonstration A/B Testing.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('🔧 Création d\'un utilisateur administrateur de test...');

    const testAdminEmail = 'admin@nutrisensia.test';
    const testAdminPassword = 'AdminTest123!';

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testAdminEmail,
      password: testAdminPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur Auth:', authError);
      return;
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id);

    // Créer le profil utilisateur dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: testAdminEmail,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur lors de la création du profil utilisateur:', userError);
      return;
    }

    console.log('✅ Profil utilisateur créé:', userData);

    console.log('\n🎉 Utilisateur administrateur créé avec succès !');
    console.log('📧 Email:', testAdminEmail);
    console.log('🔑 Mot de passe:', testAdminPassword);
    console.log('👤 Rôle: admin');
    console.log('\n🔗 Vous pouvez maintenant vous connecter et accéder aux pages de démonstration A/B Testing');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur administrateur:', error);
  }
}

createAdminUser();
