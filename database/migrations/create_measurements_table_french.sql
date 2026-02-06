-- Créer l'enum measurement_type avec les valeurs françaises
DO $$
BEGIN
    -- Supprimer l'ancien type s'il existe
    DROP TYPE IF EXISTS measurement_type CASCADE;

    -- Créer le nouveau type avec les valeurs françaises
    CREATE TYPE measurement_type AS ENUM (
        'poitrine',  -- Tour de poitrine
        'taille',    -- Tour de taille
        'hanches',   -- Tour de hanches
        'cuisse',    -- Tour de cuisse
        'bras',      -- Tour de bras
        'mollet'     -- Tour de mollet
    );
END $$;

-- Créer la table measurements
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    measurement_type measurement_type NOT NULL,
    value_cm DECIMAL(5, 1) NOT NULL CHECK (value_cm > 0 AND value_cm < 500),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_measurement_per_type_per_day UNIQUE(user_id, measurement_type, date)
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_measurements_user ON measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_type_date ON measurements(user_id, measurement_type, date DESC);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON measurements(user_id, date DESC);

-- Activer RLS
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir uniquement leurs propres mesures
CREATE POLICY "Users can view own measurements"
    ON measurements FOR SELECT
    USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent insérer leurs propres mesures
CREATE POLICY "Users can insert own measurements"
    ON measurements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leurs propres mesures
CREATE POLICY "Users can update own measurements"
    ON measurements FOR UPDATE
    USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs propres mesures
CREATE POLICY "Users can delete own measurements"
    ON measurements FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_measurements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_measurements_updated_at_trigger
    BEFORE UPDATE ON measurements
    FOR EACH ROW
    EXECUTE FUNCTION update_measurements_updated_at();

-- Vérifier que l'enum a les bonnes valeurs
SELECT enumlabel
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'measurement_type'
ORDER BY enumsortorder;
