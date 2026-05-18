'use client';

import React from 'react';
import {
  ArrowLeft,
  Clock,
  ListChecks,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useQuestionnaireTemplates } from '@/hooks/useQuestionnaireTemplates';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type QuestionnaireTemplate,
  type QuestionnaireCategory,
} from '@/types/questionnaire-templates';

interface QuestionnaireTemplatePickerProps {
  onPick: (template: QuestionnaireTemplate) => void;
  onCancel: () => void;
}

export function QuestionnaireTemplatePicker({
  onPick,
  onCancel,
}: QuestionnaireTemplatePickerProps) {
  const { data: templates, isLoading, error } = useQuestionnaireTemplates();

  const byCategory: Record<QuestionnaireCategory, QuestionnaireTemplate[]> = {
    regular_followup: [],
    around_consultation: [],
    deep_dive: [],
  };
  for (const t of templates ?? []) byCategory[t.category].push(t);

  return (
    <>
      <button
        type='button'
        className='fp-tpl-back'
        onClick={onCancel}
        aria-label='Revenir au formulaire vierge'
      >
        <ArrowLeft className='w-3.5 h-3.5' />
        Repartir d&apos;un questionnaire vierge
      </button>

      {isLoading && (
        <div className='fp-tpl-loading'>Chargement des templates…</div>
      )}

      {error && (
        <div className='fp-tpl-error'>
          {error instanceof Error ? error.message : 'Erreur de chargement'}
        </div>
      )}

      {!isLoading && !error && templates && templates.length === 0 && (
        <div className='fp-tpl-empty'>
          Aucun template disponible pour le moment.
        </div>
      )}

      {!isLoading &&
        !error &&
        templates &&
        templates.length > 0 &&
        CATEGORY_ORDER.map(cat => {
          const items = byCategory[cat];
          if (items.length === 0) return null;
          return (
            <section key={cat} className='fp-tpl-section'>
              <div className='fp-tpl-section-head'>
                <span className='fp-tpl-section-label'>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className='fp-tpl-section-count'>{items.length}</span>
              </div>
              <div className='fp-tpl-grid'>
                {items.map(t => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onPick={() => onPick(t)}
                  />
                ))}
              </div>
            </section>
          );
        })}
    </>
  );
}

function TemplateCard({
  template,
  onPick,
}: {
  template: QuestionnaireTemplate;
  onPick: () => void;
}) {
  const questionCount = template.current_version.questions.length;
  return (
    <button type='button' className='fp-tpl-card' onClick={onPick}>
      <h4 className='fp-tpl-card-title'>{template.title}</h4>
      {template.description && (
        <p className='fp-tpl-card-desc'>{template.description}</p>
      )}
      <div className='fp-tpl-card-meta'>
        <span className='fp-tpl-badge'>
          <ListChecks className='w-3 h-3' aria-hidden='true' />
          {questionCount} question{questionCount > 1 ? 's' : ''}
        </span>
        {template.estimated_minutes != null && (
          <span className='fp-tpl-badge'>
            <Clock className='w-3 h-3' aria-hidden='true' />~
            {template.estimated_minutes} min
          </span>
        )}
        {template.is_sensitive && (
          <span className='fp-tpl-badge is-warn'>
            <AlertTriangle className='w-3 h-3' aria-hidden='true' />
            Sensible
          </span>
        )}
        {template.is_clinical_screening && (
          <span className='fp-tpl-badge is-clinical'>
            <Lock className='w-3 h-3' aria-hidden='true' />
            Dépistage
          </span>
        )}
        {!template.is_system && <span className='fp-tpl-badge'>Personnel</span>}
      </div>
    </button>
  );
}
