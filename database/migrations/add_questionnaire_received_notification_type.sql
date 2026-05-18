-- =====================================================
-- Migration: Add `questionnaire_received` notification type
-- Story: P2.C.3 — patient notification quand un questionnaire est envoyé
-- Date: 2026-05-18
-- =====================================================
-- Context : la table `notification_types` ne contient que `questionnaire_due`
-- (sémantique "rappel"). On a besoin d'un type distinct pour signaler la
-- réception initiale d'un questionnaire envoyé par le nutritionniste, avec
-- un body qui mentionne le titre du template.
--
-- Le template body utilise `{{title}}` qui sera substitué par
-- `create_notification()` à partir de la clé `title` du JSONB `p_data`.
--
-- Idempotent via ON CONFLICT (code).
-- =====================================================

INSERT INTO notification_types (
    code,
    name_fr,
    category,
    title_template_fr,
    body_template_fr,
    icon,
    priority,
    default_channels
) VALUES (
    'questionnaire_received',
    'Nouveau questionnaire',
    'system',
    'Nouveau questionnaire à compléter',
    'Votre nutritionniste vous a envoyé le questionnaire « {{title}} »',
    '📝',
    'normal',
    ARRAY['in_app', 'email']
)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- Vérification post-déploiement :
--   SELECT code, name_fr, title_template_fr
--   FROM notification_types
--   WHERE code = 'questionnaire_received';
-- =====================================================
