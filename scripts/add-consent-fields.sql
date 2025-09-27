-- =====================================================
-- Ajout des champs de consentement à la table nutritionists
-- Script de migration pour enregistrer les consentements légaux (RGPD)
-- =====================================================

-- Ajout des colonnes de consentement avec horodatage
ALTER TABLE nutritionists 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMP WITH TIME ZONE;

-- Commentaires pour la documentation
COMMENT ON COLUMN nutritionists.terms_accepted IS 'Acceptation des conditions d''utilisation (obligatoire)';
COMMENT ON COLUMN nutritionists.terms_accepted_at IS 'Horodatage de l''acceptation des conditions d''utilisation';
COMMENT ON COLUMN nutritionists.privacy_policy_accepted IS 'Acceptation de la politique de confidentialité (obligatoire)';
COMMENT ON COLUMN nutritionists.privacy_policy_accepted_at IS 'Horodatage de l''acceptation de la politique de confidentialité';
COMMENT ON COLUMN nutritionists.marketing_consent IS 'Consentement pour les communications marketing (optionnel)';
COMMENT ON COLUMN nutritionists.marketing_consent_at IS 'Horodatage du consentement marketing';

-- Index pour optimiser les requêtes de conformité RGPD
CREATE INDEX IF NOT EXISTS idx_nutritionists_terms_accepted ON nutritionists(terms_accepted, terms_accepted_at);
CREATE INDEX IF NOT EXISTS idx_nutritionists_privacy_accepted ON nutritionists(privacy_policy_accepted, privacy_policy_accepted_at);
CREATE INDEX IF NOT EXISTS idx_nutritionists_marketing_consent ON nutritionists(marketing_consent, marketing_consent_at);

-- Mise à jour du trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application du trigger si il n'existe pas déjà
DROP TRIGGER IF EXISTS update_nutritionists_updated_at ON nutritionists;
CREATE TRIGGER update_nutritionists_updated_at
    BEFORE UPDATE ON nutritionists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vérification de la structure mise à jour
DO $$
BEGIN
    -- Vérifier que les colonnes ont été ajoutées
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nutritionists' 
        AND column_name IN ('terms_accepted', 'privacy_policy_accepted', 'marketing_consent')
    ) THEN
        RAISE NOTICE 'Migration réussie : Champs de consentement ajoutés à la table nutritionists';
    ELSE
        RAISE EXCEPTION 'Migration échouée : Impossible d''ajouter les champs de consentement';
    END IF;
END
$$;
