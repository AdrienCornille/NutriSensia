-- Script SQL corrigé pour créer la table des témoignages
-- À exécuter dans Supabase SQL Editor

-- Créer la table testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'nutritionist')),
    location VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    avatar VARCHAR(500), -- URL de l'avatar
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    results TEXT, -- Pour les patients (ex: "Perte de 8kg en 3 mois")
    specialty TEXT, -- Pour les nutritionnistes (ex: "Nutrition sportive")
    is_featured BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur le rôle pour les requêtes filtrées
CREATE INDEX IF NOT EXISTS idx_testimonials_role ON testimonials(role);

-- Créer un index sur is_featured pour les témoignages mis en avant
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);

-- Créer un index sur is_visible pour les témoignages visibles
CREATE INDEX IF NOT EXISTS idx_testimonials_visible ON testimonials(is_visible);

-- Créer un index composé pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_testimonials_visible_featured ON testimonials(is_visible, is_featured);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_testimonials_updated_at 
    BEFORE UPDATE ON testimonials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques témoignages d'exemple
INSERT INTO testimonials (name, role, location, rating, comment, results, date) VALUES
('Marie Dubois', 'patient', 'Genève', 5, 'Grâce à NutriSensia, j''ai enfin trouvé un équilibre alimentaire qui me convient. Ma nutritionniste m''a accompagnée avec bienveillance et professionnalisme.', 'Perte de 8kg en 3 mois', '2024-01-15'),
('Thomas Müller', 'patient', 'Zurich', 5, 'Les consultations en ligne sont très pratiques et les conseils personnalisés m''ont vraiment aidé à améliorer ma digestion et mon énergie.', 'Amélioration digestive significative', '2024-02-03'),
('Dr. Sophie Martin', 'nutritionist', 'Lausanne', 5, 'La plateforme NutriSensia me permet de mieux organiser mes consultations et d''offrir un suivi plus personnalisé à mes patients.', NULL, '2024-01-20'),
('Julie Rochat', 'patient', 'Neuchâtel', 5, 'J''apprécie particulièrement les recettes personnalisées et le suivi entre les consultations. Cela m''aide à rester motivée.', 'Adoption d''habitudes durables', '2024-02-10'),
('Dr. Pierre Favre', 'nutritionist', 'Fribourg', 5, 'Excellent outil pour les professionnels. La gestion des patients et la facturation automatique me font gagner un temps précieux.', NULL, '2024-01-28'),
('Anna Rossi', 'patient', 'Lugano', 5, 'Mon parcours avec NutriSensia a transformé ma relation à l''alimentation. Je recommande vivement cette approche personnalisée.', 'Meilleure relation à l''alimentation', '2024-02-05');

-- Mettre quelques témoignages en avant
UPDATE testimonials 
SET is_featured = TRUE 
WHERE name IN ('Marie Dubois', 'Dr. Sophie Martin', 'Julie Rochat');

-- Ajouter les spécialités pour les nutritionnistes
UPDATE testimonials 
SET specialty = 'Nutrition sportive' 
WHERE name = 'Dr. Sophie Martin';

UPDATE testimonials 
SET specialty = 'Nutrition clinique' 
WHERE name = 'Dr. Pierre Favre';

-- Politique de sécurité RLS (Row Level Security) - Version simplifiée
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture publique des témoignages visibles
CREATE POLICY "Testimonials are viewable by everyone when visible" ON testimonials
    FOR SELECT USING (is_visible = true);

-- Politique pour l'administration - Version simplifiée sans JWT
CREATE POLICY "Testimonials are manageable by authenticated users" ON testimonials
    FOR ALL USING (auth.role() = 'authenticated');

-- Commentaires sur la table
COMMENT ON TABLE testimonials IS 'Table des témoignages clients pour NutriSensia';
COMMENT ON COLUMN testimonials.role IS 'Rôle de la personne: patient ou nutritionist';
COMMENT ON COLUMN testimonials.rating IS 'Note de 1 à 5 étoiles';
COMMENT ON COLUMN testimonials.results IS 'Résultats obtenus (pour les patients)';
COMMENT ON COLUMN testimonials.specialty IS 'Spécialité (pour les nutritionnistes)';
COMMENT ON COLUMN testimonials.is_featured IS 'Témoignage mis en avant sur la page d''accueil';
COMMENT ON COLUMN testimonials.is_visible IS 'Témoignage visible publiquement';
