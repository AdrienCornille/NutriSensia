/**
 * Script pour créer un compte administrateur
 * Usage: node scripts/create-admin-account.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables d'environnement manquantes:");
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminAccount() {
  const email = 'admin@nutrisensia.com';
  const password = 'Admin123!';
  const fullName = 'Administrateur NutriSensia';

  try {
    console.log('🔄 Création du compte administrateur...');

    // Créer l'utilisateur avec le rôle admin
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Confirmer automatiquement l'email
        user_metadata: {
          role: 'admin',
          full_name: fullName,
          created_by: 'script',
          created_at: new Date().toISOString(),
        },
      });

    if (authError) {
      console.error(
        "❌ Erreur lors de la création de l'utilisateur:",
        authError.message
      );
      return;
    }

    console.log('✅ Utilisateur créé avec succès!');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('👤 ID utilisateur:', authData.user.id);

    // Créer le profil dans la table profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.warn(
        '⚠️  Erreur lors de la création du profil:',
        profileError.message
      );
      console.log(
        "   L'utilisateur a été créé mais le profil pourrait être manquant."
      );
    } else {
      console.log('✅ Profil créé avec succès!');
    }

    console.log('\n🎉 Compte administrateur créé avec succès!');
    console.log('\n📋 Informations de connexion:');
    console.log('   URL: http://localhost:3000/auth/signin');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);
    console.log('\n🔗 Vous pouvez maintenant accéder à:');
    console.log('   - http://localhost:3000/admin/analytics/onboarding');
    console.log(
      '   - http://localhost:3000/debug-auth-status (pour diagnostiquer)'
    );
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Vérifier si un compte admin existe déjà
async function checkExistingAdmin() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('role', 'admin')
      .limit(1);

    if (error) {
      console.warn(
        '⚠️  Impossible de vérifier les comptes existants:',
        error.message
      );
      return false;
    }

    if (data && data.length > 0) {
      console.log('ℹ️  Un compte admin existe déjà:');
      console.log(`   Email: ${data[0].email}`);
      console.log(`   Nom: ${data[0].full_name}`);
      return true;
    }

    return false;
  } catch (error) {
    console.warn('⚠️  Erreur lors de la vérification:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Script de création de compte administrateur NutriSensia\n');

  // Vérifier si un admin existe déjà
  const adminExists = await checkExistingAdmin();

  if (adminExists) {
    console.log(
      '\n❓ Un compte admin existe déjà. Voulez-vous continuer quand même?'
    );
    console.log('   (Appuyez sur Ctrl+C pour annuler)');

    // Attendre 5 secondes
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  await createAdminAccount();
}

// Exécuter le script
main().catch(console.error);
