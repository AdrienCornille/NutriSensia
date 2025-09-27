-- =====================================================
-- Ajout des Fonctions Manquantes - NutriSensia
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour obtenir le profil complet d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS JSON AS $$
DECLARE
    user_role VARCHAR;
    profile_data JSON;
BEGIN
    -- Récupérer le rôle de l'utilisateur
    SELECT role INTO user_role FROM profiles WHERE id = user_id;
    
    IF user_role = 'nutritionist' THEN
        SELECT json_build_object(
            'profile', row_to_json(p),
            'nutritionist', row_to_json(n)
        ) INTO profile_data
        FROM profiles p
        JOIN nutritionists n ON p.id = n.id
        WHERE p.id = user_id;
    ELSIF user_role = 'patient' THEN
        SELECT json_build_object(
            'profile', row_to_json(p),
            'patient', row_to_json(pat)
        ) INTO profile_data
        FROM profiles p
        JOIN patients pat ON p.id = pat.id
        WHERE p.id = user_id;
    ELSE
        SELECT row_to_json(p) INTO profile_data
        FROM profiles p
        WHERE p.id = user_id;
    END IF;
    
    RETURN profile_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer l'âge d'un patient
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Vérification des fonctions créées
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count 
    FROM information_schema.routines 
    WHERE routine_name IN ('get_user_profile', 'calculate_age', 'update_updated_at_column', 'handle_new_user');
    
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '🎉 FONCTIONS AJOUTÉES AVEC SUCCÈS !';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ % fonctions créées:', func_count;
    RAISE NOTICE '   - update_updated_at_column()';
    RAISE NOTICE '   - handle_new_user()';
    RAISE NOTICE '   - get_user_profile(user_id)';
    RAISE NOTICE '   - calculate_age(birth_date)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Toutes les fonctions sont maintenant disponibles !';
    RAISE NOTICE '';
END $$;
