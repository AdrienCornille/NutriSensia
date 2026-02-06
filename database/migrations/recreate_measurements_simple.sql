-- Migration simple : supprimer et recréer la table measurements avec le bon enum

-- 1. Supprimer la table si elle existe (attention: perte de données!)
DROP TABLE IF EXISTS measurements CASCADE;

-- 2. Supprimer l'ancien type enum
DROP TYPE IF EXISTS measurement_type CASCADE;

-- 3. Créer le nouveau type enum avec les valeurs françaises
CREATE TYPE measurement_type AS ENUM (
    'poitrine',
    'taille',
    'hanches',
    'cuisse',
    'bras',
    'mollet'
);

-- 4. Créer la table measurements
CREATE TABLE measurements (
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

-- 5. Créer les index
CREATE INDEX idx_measurements_user ON measurements(user_id);
CREATE INDEX idx_measurements_type_date ON measurements(user_id, measurement_type, date DESC);
CREATE INDEX idx_measurements_date ON measurements(user_id, date DESC);

-- 6. Activer RLS
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- 7. Créer les policies RLS
CREATE POLICY "Users can view own measurements"
    ON measurements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements"
    ON measurements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
    ON measurements FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements"
    ON measurements FOR DELETE
    USING (auth.uid() = user_id);

-- 8. Créer le trigger pour updated_at
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

-- 9. Vérifier le résultat
SELECT
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'measurements'
ORDER BY ordinal_position;

-- 10. Vérifier les valeurs de l'enum
SELECT enumlabel
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'measurement_type'
ORDER BY enumsortorder;
