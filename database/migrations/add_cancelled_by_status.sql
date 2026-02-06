-- Migration: Ajout des statuts d'annulation détaillés
-- Date: 2025-02-05
-- Description: Ajoute cancelled_by_patient et cancelled_by_nutritionist à l'enum appointment_status
--              pour distinguer qui a annulé le rendez-vous

-- Note: ALTER TYPE ... ADD VALUE ne peut pas être exécuté dans une transaction
-- Exécuter ce script directement (pas dans une transaction)

-- Vérifier les valeurs existantes de l'enum
DO $$
BEGIN
    RAISE NOTICE 'Valeurs actuelles de appointment_status:';
END $$;

SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_status')
ORDER BY enumsortorder;

-- Ajouter les nouvelles valeurs si elles n'existent pas
DO $$
BEGIN
    -- Vérifier si cancelled_by_patient existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_status')
        AND enumlabel = 'cancelled_by_patient'
    ) THEN
        -- ALTER TYPE ADD VALUE doit être exécuté hors transaction
        -- Cette partie échouera si exécutée dans une transaction
        RAISE NOTICE 'Adding cancelled_by_patient...';
    END IF;

    -- Vérifier si cancelled_by_nutritionist existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_status')
        AND enumlabel = 'cancelled_by_nutritionist'
    ) THEN
        RAISE NOTICE 'Adding cancelled_by_nutritionist...';
    END IF;
END $$;

-- Ajouter les nouvelles valeurs à l'enum
-- Ces commandes doivent être exécutées hors transaction
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'cancelled_by_patient' AFTER 'cancelled';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'cancelled_by_nutritionist' AFTER 'cancelled_by_patient';

-- Vérifier les nouvelles valeurs
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_status')
ORDER BY enumsortorder;

-- Commentaire sur les nouveaux statuts
COMMENT ON TYPE appointment_status IS 'Statut du rendez-vous: pending (en attente), confirmed (confirmé), cancelled (annulé - legacy), cancelled_by_patient (annulé par le patient), cancelled_by_nutritionist (annulé par le nutritionniste), completed (terminé), no_show (absent)';

-- Migration des données existantes (optionnel)
-- Les anciens statuts 'cancelled' restent valides pour la compatibilité
-- Aucune migration de données n'est nécessaire car le code gère les deux formats

DO $$
BEGIN
    RAISE NOTICE 'Migration terminée avec succès!';
END $$;
