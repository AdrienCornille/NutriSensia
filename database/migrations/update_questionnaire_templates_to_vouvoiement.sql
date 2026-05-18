-- =====================================================
-- Migration: Passe tous les libellés de questions templates au vouvoiement
-- Story: QUEST-TPL-002
-- Date: 2026-05-17
-- =====================================================
-- À exécuter UNIQUEMENT si la migration add_questionnaire_templates.sql a
-- déjà été déployée (sinon les seeds, désormais mis à jour, créent déjà
-- les questions au vouvoiement à la création).
--
-- Idempotent : peut être ré-exécuté sans effet de bord (UPDATE sur
-- des libellés déjà au vouvoiement reste un no-op fonctionnel).
-- =====================================================

-- ---------------------------------------------------------------------------
-- Libellés de questions : un seul UPDATE via CTE (template_key, question_key)
-- ---------------------------------------------------------------------------
WITH updates(template_key, question_key, new_label) AS (
    VALUES
        -- T1. Bien-être hebdomadaire
        ('weekly_wellbeing', 'energy',
            'Comment évaluez-vous votre énergie cette semaine ?'),
        ('weekly_wellbeing', 'mood',
            'Et votre humeur générale cette semaine ?'),
        ('weekly_wellbeing', 'sleep',
            'Comment était votre sommeil ces 7 derniers jours ?'),
        ('weekly_wellbeing', 'plan_difficulty',
            'Avez-vous rencontré des difficultés avec votre plan alimentaire cette semaine ?'),

        -- T2. Suivi mensuel approfondi
        ('monthly_followup', 'progress',
            'Comment évaluez-vous votre progression vers vos objectifs ce mois-ci ?'),
        ('monthly_followup', 'successes',
            'Quels succès, même petits, retenez-vous de ce mois ?'),
        ('monthly_followup', 'obstacles',
            'Quels obstacles avez-vous rencontrés ce mois-ci ?'),
        ('monthly_followup', 'activity_level',
            'Votre niveau d''activité physique sur le mois'),
        ('monthly_followup', 'active_days_per_week',
            'En moyenne, combien de jours/semaine avez-vous été actif ce mois-ci ?'),
        ('monthly_followup', 'food_relationship',
            'Comment décririez-vous votre relation à la nourriture ce mois-ci ?'),
        ('monthly_followup', 'next_consult_topics',
            'Avez-vous des questions à aborder lors de la prochaine consultation ?'),
        ('monthly_followup', 'next_month_focus',
            'Sur quoi aimeriez-vous vous concentrer le mois prochain ?'),

        -- T3. Adhésion plan alimentaire
        ('plan_adherence', 'adherence_percent',
            'Sur les 2 dernières semaines, à quel point avez-vous pu suivre le plan ?'),
        ('plan_adherence', 'favorite_meals',
            'Quels repas du plan avez-vous le plus appréciés ?'),
        ('plan_adherence', 'main_blockers',
            'Quel est votre principal frein à l''adhésion ?'),
        ('plan_adherence', 'prep_time',
            'Le temps de préparation vous convient-il ?'),
        ('plan_adherence', 'taste_match',
            'Le plan correspond-il à vos goûts ?'),
        ('plan_adherence', 'wants_adjustment',
            'Souhaitez-vous un ajustement ?'),

        -- T4. Préparation consultation
        ('consultation_prep', 'focus_topics',
            'Sur quels sujets voulez-vous mettre l''accent lors de la consultation ?'),
        ('consultation_prep', 'overall_feeling',
            'Votre ressenti général depuis la dernière consultation'),
        ('consultation_prep', 'changes_to_report',
            'Avez-vous des changements à signaler depuis la dernière fois ?'),
        ('consultation_prep', 'main_question',
            'Quelle est votre question principale pour cette consultation ?'),

        -- T5. Feedback post-consultation
        ('consultation_feedback', 'usefulness',
            'Comment évaluez-vous cette consultation ?'),
        ('consultation_feedback', 'understanding',
            'Avez-vous bien compris les recommandations ?'),
        ('consultation_feedback', 'priority_action',
            'Quelle action allez-vous mettre en place en priorité ?'),

        -- T6. Habitudes alimentaires détaillées
        ('eating_habits_detail', 'breakfast',
            'Prenez-vous un petit-déjeuner ?'),
        ('eating_habits_detail', 'distracted_eating',
            'Mangez-vous en faisant autre chose (TV, téléphone, travail) ?'),
        ('eating_habits_detail', 'eating_speed',
            'À quelle vitesse mangez-vous ?'),
        ('eating_habits_detail', 'satiety_feeling',
            'Vous sentez-vous rassasié(e) en fin de repas ?'),
        ('eating_habits_detail', 'eating_outside_meals',
            'Mangez-vous en dehors des repas ?'),

        -- T7. SCOFF screening (libellés cliniques validés FR)
        ('scoff_screening', 'scoff_sick',
            'Vous faites-vous parfois vomir parce que vous vous sentez mal d''avoir trop mangé ?'),
        ('scoff_screening', 'scoff_control',
            'Craignez-vous d''avoir perdu le contrôle des quantités que vous mangez ?'),
        ('scoff_screening', 'scoff_one_stone',
            'Avez-vous récemment perdu plus de 6 kg en moins de 3 mois ?'),
        ('scoff_screening', 'scoff_fat',
            'Pensez-vous être trop gros(se) alors que d''autres vous trouvent mince ?'),
        ('scoff_screening', 'scoff_food',
            'Diriez-vous que la nourriture domine votre vie ?'),
        ('scoff_screening', 'wants_to_talk',
            'Souhaitez-vous en parler avec votre nutritionniste ?'),

        -- T8. Symptômes digestifs
        ('digestive_symptoms', 'food_triggers',
            'Avez-vous identifié des aliments déclencheurs cette semaine ?'),
        ('digestive_symptoms', 'alarm_signs',
            'Signes d''alarme — avez-vous remarqué l''un de ces éléments ?')
)
UPDATE questionnaire_questions q
SET label = u.new_label
FROM updates u
JOIN questionnaire_templates t ON t.key = u.template_key
JOIN questionnaire_template_versions v ON v.template_id = t.id
WHERE q.template_version_id = v.id
  AND q.key = u.question_key;

-- ---------------------------------------------------------------------------
-- Help text — un seul cas à passer au vouvoiement
-- ---------------------------------------------------------------------------
UPDATE questionnaire_questions q
SET help_text = 'Cochez tous les éléments qui s''appliquent. "Aucun" si rien.'
FROM questionnaire_templates t
JOIN questionnaire_template_versions v ON v.template_id = t.id
WHERE q.template_version_id = v.id
  AND t.key = 'digestive_symptoms'
  AND q.key = 'alarm_signs';

-- =====================================================
-- Vérification post-déploiement
-- =====================================================
-- Doit retourner 0 (plus aucune occurrence de "tu " / "as-tu" / "es-tu"…)
--
--   SELECT COUNT(*) FROM questionnaire_questions
--   WHERE label ~* '\m(tu|t''|toi|ton|ta|tes|te)\M'
--      OR label ~* '\b(as-tu|es-tu|veux-tu|peux-tu|sens-tu|sais-tu)\b';
-- =====================================================
