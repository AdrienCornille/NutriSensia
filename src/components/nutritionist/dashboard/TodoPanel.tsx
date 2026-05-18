'use client';

import React, { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';

type TodoFilter = 'all' | 'relances' | 'cr' | 'docs';
type TodoSection = 'overdue' | 'today' | 'later';
type TodoTypeKind = 'pat' | 'cr' | 'doc';

interface TodoItem {
  id: string;
  text_fr: React.ReactNode;
  text_en: React.ReactNode;
  note_fr: string;
  note_en: string;
  type: TodoTypeKind;
  typeLabel_fr: string;
  typeLabel_en: string;
  section: TodoSection;
  filter: Exclude<TodoFilter, 'all'>;
  done?: boolean;
}

const MOCK_TODOS: TodoItem[] = [
  {
    id: 't1',
    text_fr: (
      <>
        Relancer <b>Émilie Roussel</b>
      </>
    ),
    text_en: (
      <>
        Follow up with <b>Émilie Roussel</b>
      </>
    ),
    note_fr: '« Je reprends bientôt » du 6 mai · sans réponse depuis 8 jours.',
    note_en: '“I’ll be back soon” from May 6 · no reply in 8 days.',
    type: 'pat',
    typeLabel_fr: 'Relance',
    typeLabel_en: 'Follow-up',
    section: 'overdue',
    filter: 'relances',
  },
  {
    id: 't2',
    text_fr: (
      <>
        Valider bilan thyroïde · <b>Inès Bouhadi</b>
      </>
    ),
    text_en: (
      <>
        Validate thyroid panel · <b>Inès Bouhadi</b>
      </>
    ),
    note_fr: 'Plateau depuis 3 semaines — utile avant la séance de lundi.',
    note_en: 'Plateau for 3 weeks — useful before Monday’s session.',
    type: 'doc',
    typeLabel_fr: 'Bilan',
    typeLabel_en: 'Lab',
    section: 'overdue',
    filter: 'docs',
  },
  {
    id: 't3',
    text_fr: (
      <>
        Plan alim. · <b>Thomas Caron</b>
      </>
    ),
    text_en: (
      <>
        Meal plan · <b>Thomas Caron</b>
      </>
    ),
    note_fr: 'Sportif endurance · à finaliser avant 14h.',
    note_en: 'Endurance athlete · to finalize before 2pm.',
    type: 'pat',
    typeLabel_fr: 'Prép. RDV',
    typeLabel_en: 'Prep',
    section: 'today',
    filter: 'relances',
  },
  {
    id: 't4',
    text_fr: (
      <>
        Compte-rendu · <b>Sarah Lefèvre</b>
      </>
    ),
    text_en: (
      <>
        Report · <b>Sarah Lefèvre</b>
      </>
    ),
    note_fr: "Bilan d'entrée — à envoyer après la séance de 10h30.",
    note_en: 'Intake report — to send after the 10:30 session.',
    type: 'cr',
    typeLabel_fr: 'CR',
    typeLabel_en: 'Report',
    section: 'today',
    filter: 'cr',
  },
  {
    id: 't5',
    text_fr: (
      <>
        Compte-rendu · <b>Camille Bertin</b>
      </>
    ),
    text_en: (
      <>
        Report · <b>Camille Bertin</b>
      </>
    ),
    note_fr: 'Envoyé à 09:48.',
    note_en: 'Sent at 09:48.',
    type: 'cr',
    typeLabel_fr: 'CR',
    typeLabel_en: 'Report',
    section: 'today',
    filter: 'cr',
    done: true,
  },
  {
    id: 't6',
    text_fr: (
      <>
        Décider du suivi · <b>Hélène Pasquier</b>
      </>
    ),
    text_en: (
      <>
        Decide follow-up · <b>Hélène Pasquier</b>
      </>
    ),
    note_fr: 'Fin de cycle 6 mois — proposer espacement ou clôture.',
    note_en: 'End of 6-month cycle — propose spacing or close.',
    type: 'pat',
    typeLabel_fr: 'Décision',
    typeLabel_en: 'Decision',
    section: 'later',
    filter: 'relances',
  },
  {
    id: 't7',
    text_fr: (
      <>
        Publier article <em>« Hormones &amp; assiette »</em>
      </>
    ),
    text_en: (
      <>
        Publish article <em>“Hormones &amp; plate”</em>
      </>
    ),
    note_fr: 'Brouillon prêt · relire les notes de Léa.',
    note_en: 'Draft ready · review Léa’s notes.',
    type: 'doc',
    typeLabel_fr: 'Contenu',
    typeLabel_en: 'Content',
    section: 'later',
    filter: 'docs',
  },
  {
    id: 't8',
    text_fr: (
      <>
        Facture mai · <b>Hélène Pasquier</b>
      </>
    ),
    text_en: (
      <>
        May invoice · <b>Hélène Pasquier</b>
      </>
    ),
    note_fr: 'Échéance lundi 19.',
    note_en: 'Due Monday 19.',
    type: 'doc',
    typeLabel_fr: 'Compta.',
    typeLabel_en: 'Billing',
    section: 'later',
    filter: 'docs',
  },
];

export function TodoPanel() {
  const locale = useLocale();
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_TODOS.filter(t => t.done).map(t => [t.id, true]))
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return MOCK_TODOS;
    return MOCK_TODOS.filter(t => t.filter === filter);
  }, [filter]);

  const counts = useMemo(() => {
    return {
      all: MOCK_TODOS.length,
      relances: MOCK_TODOS.filter(t => t.filter === 'relances').length,
      cr: MOCK_TODOS.filter(t => t.filter === 'cr').length,
      docs: MOCK_TODOS.filter(t => t.filter === 'docs').length,
    };
  }, []);

  const grouped = useMemo(() => {
    return {
      overdue: filtered.filter(t => t.section === 'overdue'),
      today: filtered.filter(t => t.section === 'today'),
      later: filtered.filter(t => t.section === 'later'),
    };
  }, [filtered]);

  const toggle = (id: string) =>
    setDoneMap(prev => ({ ...prev, [id]: !prev[id] }));

  const t = locale === 'en' ? labels.en : labels.fr;

  const renderItem = (item: TodoItem) => {
    const done = !!doneMap[item.id];
    const text = locale === 'en' ? item.text_en : item.text_fr;
    const note = locale === 'en' ? item.note_en : item.note_fr;
    const typeLabel = locale === 'en' ? item.typeLabel_en : item.typeLabel_fr;
    return (
      <div key={item.id} className={`dp-todo ${done ? 'is-done' : ''}`}>
        <span
          className='dp-todo-check'
          role='checkbox'
          aria-checked={done}
          tabIndex={0}
          onClick={() => toggle(item.id)}
          onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              toggle(item.id);
            }
          }}
        />
        <div className='dp-todo-body'>
          <div className='dp-todo-text'>{text}</div>
          <div className='dp-todo-note'>{note}</div>
        </div>
        <div className='dp-todo-meta'>
          <span className={`dp-todo-type is-${item.type}`}>{typeLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <article className='dp-panel'>
      <header className='dp-panel-head'>
        <div>
          <span className='dp-eyebrow'>
            {t.eyebrow} · {counts.all} {t.tasks}
          </span>
          <h3>
            {t.titlePrefix} <em>{t.titleItalic}</em>
          </h3>
        </div>
        <a href='#' className='dp-link'>
          {t.seeAll}
        </a>
      </header>

      <div className='dp-todo-filters'>
        <button
          type='button'
          className={`dp-todo-filter ${filter === 'all' ? 'is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t.filterAll}
          <span className='dp-todo-count'>{counts.all}</span>
        </button>
        <button
          type='button'
          className={`dp-todo-filter ${filter === 'relances' ? 'is-active' : ''}`}
          onClick={() => setFilter('relances')}
        >
          {t.filterRelances}
          <span className='dp-todo-count'>{counts.relances}</span>
        </button>
        <button
          type='button'
          className={`dp-todo-filter ${filter === 'cr' ? 'is-active' : ''}`}
          onClick={() => setFilter('cr')}
        >
          {t.filterCR}
          <span className='dp-todo-count'>{counts.cr}</span>
        </button>
        <button
          type='button'
          className={`dp-todo-filter ${filter === 'docs' ? 'is-active' : ''}`}
          onClick={() => setFilter('docs')}
        >
          {t.filterDocs}
          <span className='dp-todo-count'>{counts.docs}</span>
        </button>
      </div>

      {grouped.overdue.length > 0 && (
        <div className='dp-todo-section is-overdue'>
          <div className='dp-todo-section-head'>{t.sectionOverdue}</div>
          {grouped.overdue.map(renderItem)}
        </div>
      )}

      {grouped.today.length > 0 && (
        <div className='dp-todo-section is-today'>
          <div className='dp-todo-section-head'>{t.sectionToday}</div>
          {grouped.today.map(renderItem)}
        </div>
      )}

      {grouped.later.length > 0 && (
        <div className='dp-todo-section is-later'>
          <div className='dp-todo-section-head'>{t.sectionLater}</div>
          {grouped.later.map(renderItem)}
        </div>
      )}

      <button type='button' className='dp-todo-add'>
        <b>+</b> {t.addPlaceholder}
      </button>
    </article>
  );
}

const labels = {
  fr: {
    eyebrow: 'À faire',
    tasks: 'tâches',
    titlePrefix: 'Avant de',
    titleItalic: 'partir',
    seeAll: 'Tout voir →',
    filterAll: 'Tout',
    filterRelances: 'Relances',
    filterCR: 'Comptes-rendus',
    filterDocs: 'Docs',
    sectionOverdue: 'En retard · J-2',
    sectionToday: "Aujourd'hui",
    sectionLater: 'Cette semaine',
    addPlaceholder: 'Ajouter une tâche, une note, une relance…',
  },
  en: {
    eyebrow: 'To do',
    tasks: 'tasks',
    titlePrefix: 'Before you',
    titleItalic: 'leave',
    seeAll: 'See all →',
    filterAll: 'All',
    filterRelances: 'Follow-ups',
    filterCR: 'Reports',
    filterDocs: 'Docs',
    sectionOverdue: 'Overdue · D-2',
    sectionToday: 'Today',
    sectionLater: 'This week',
    addPlaceholder: 'Add a task, a note, a follow-up…',
  },
};

export default TodoPanel;
