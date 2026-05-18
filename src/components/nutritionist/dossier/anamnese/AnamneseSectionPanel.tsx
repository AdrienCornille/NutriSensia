'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Check, X, Plus, Trash2 } from 'lucide-react';
import type { AnamneseSection, AnamneseSectionId } from '@/types/dossier';
import { ANAMNESE_SECTION_LABELS } from '@/types/dossier';
import { SIDEBAR_SECTION_IDS } from './AnamneseSidebar';
import {
  ANAMNESE_SECTION_FIELDS,
  type AnamneseFieldConfig,
  type FieldType,
} from './anamnese-fields-config';
import { DSDropdown, type DSDropdownOption } from '@/components/ui/DSDropdown';

interface AnamneseSectionPanelProps {
  section: AnamneseSection | null;
  sectionId: AnamneseSectionId;
  onUpdateField: (
    sectionId: AnamneseSectionId,
    fieldLabel: string,
    newValue: string
  ) => Promise<void>;
  isSaving?: boolean;
}

// Split label so the trailing portion becomes the italic display accent.
// "Identité & Coordonnées" → ["Identité & ", "Coordonnées"]
function splitTitle(label: string): [string, string] {
  if (label.includes('&')) {
    const idx = label.lastIndexOf('&');
    return [label.slice(0, idx + 2), label.slice(idx + 2)];
  }
  const words = label.split(' ');
  if (words.length === 1) return ['', label];
  const last = words.pop() as string;
  return [words.join(' ') + ' ', last];
}

function isLongValue(value: string): boolean {
  return value.length > 80 || value.includes('\n');
}

type InputKind =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'tel'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'repeater';

// Map AnamneseFieldConfig type to the input control kind rendered in edit mode.
function inputKindFor(
  cfg: AnamneseFieldConfig | undefined,
  value: string
): InputKind {
  if (!cfg) return isLongValue(value) ? 'textarea' : 'text';
  switch (cfg.type) {
    case 'select':
      return 'select';
    case 'multiselect':
      return 'multiselect';
    case 'boolean':
      return 'boolean';
    case 'medications':
    case 'supplements':
    case 'drinks_alcohol':
    case 'drinks_sugary':
    case 'drinks_hot':
    case 'sports':
      return 'repeater';
    case 'textarea':
      return 'textarea';
    case 'date':
      return 'date';
    case 'phone':
      return 'tel';
    case 'number':
    case 'scale':
      return 'number';
    default:
      return isLongValue(value) ? 'textarea' : 'text';
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  Phone fields — split into a country-code indicatif + a local number.
//  Storage convention: "<indicatif> <local digits>" e.g. "+41 0791234567".
//  Read-mode display reformats the local part: a leading 0 becomes "(0)"
//  (the trunk prefix, optional in international dialling) and the rest is
//  grouped 2 digits at a time.
// ─────────────────────────────────────────────────────────────────────────

const COUNTRY_CODES: { value: string; label: string }[] = [
  { value: '+41', label: '🇨🇭 Suisse (+41)' },
  { value: '+33', label: '🇫🇷 France (+33)' },
  { value: '+32', label: '🇧🇪 Belgique (+32)' },
  { value: '+352', label: '🇱🇺 Luxembourg (+352)' },
  { value: '+377', label: '🇲🇨 Monaco (+377)' },
  { value: '+49', label: '🇩🇪 Allemagne (+49)' },
  { value: '+39', label: '🇮🇹 Italie (+39)' },
  { value: '+34', label: '🇪🇸 Espagne (+34)' },
  { value: '+351', label: '🇵🇹 Portugal (+351)' },
  { value: '+31', label: '🇳🇱 Pays-Bas (+31)' },
  { value: '+44', label: '🇬🇧 Royaume-Uni (+44)' },
  { value: '+1', label: '🇺🇸 États-Unis / Canada (+1)' },
];

const DEFAULT_INDICATIF = '+41';

function parsePhone(value: string): { indicatif: string; local: string } {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return { indicatif: DEFAULT_INDICATIF, local: '' };
  const m = trimmed.match(/^(\+\d{1,4})\b\s*(.*)$/);
  if (m) {
    return {
      indicatif: m[1],
      local: m[2].replace(/\D/g, ''),
    };
  }
  return {
    indicatif: DEFAULT_INDICATIF,
    local: trimmed.replace(/\D/g, ''),
  };
}

function serializePhone(indicatif: string, local: string): string {
  const cleanLocal = (local ?? '').replace(/\D/g, '');
  if (!cleanLocal) return '';
  if (!indicatif) return cleanLocal;
  return `${indicatif} ${cleanLocal}`;
}

function formatLocalDigits(digits: string): string {
  if (!digits) return '';
  if (!digits.startsWith('0')) {
    return digits.match(/.{1,2}/g)?.join(' ') ?? digits;
  }
  // Trunk-prefix 0 gets parenthesised, then the first digit attaches to
  // the parens and the rest groups in pairs: "0612345678" → "(0)6 12 34 56 78".
  const after = digits.slice(1);
  if (!after) return '(0)';
  const first = after.charAt(0);
  const rest = after.slice(1);
  if (!rest) return `(0)${first}`;
  const groups = rest.match(/.{1,2}/g) ?? [];
  return `(0)${first} ${groups.join(' ')}`;
}

function formatPhoneForDisplay(value: string): string {
  const { indicatif, local } = parsePhone(value);
  const formattedLocal = formatLocalDigits(local);
  if (!formattedLocal)
    return indicatif === DEFAULT_INDICATIF && !value ? '' : indicatif;
  if (!indicatif) return formattedLocal;
  return `${indicatif} ${formattedLocal}`;
}

// ─────────────────────────────────────────────────────────────────────────
//  Repeater types — fields stored as a JSON array of small records. The BE
//  expects e.g. [{ nom, dosage, frequence }, …] for medications/drinks/etc.
//  Each repeater type declares its own column shape so the edit UI matches
//  the metier (sports has duration instead of dosage).
// ─────────────────────────────────────────────────────────────────────────

interface RepeaterColumn {
  key: string;
  label: string;
  placeholder?: string;
}

const REPEATER_SCHEMAS: Partial<Record<FieldType, RepeaterColumn[]>> = {
  medications: [
    { key: 'nom', label: 'Médicament', placeholder: 'ex: Doliprane' },
    { key: 'dosage', label: 'Dosage', placeholder: 'ex: 500 mg' },
    { key: 'frequence', label: 'Fréquence', placeholder: 'ex: 1x/jour' },
  ],
  supplements: [
    { key: 'nom', label: 'Complément', placeholder: 'ex: Vitamine D' },
    { key: 'dosage', label: 'Dosage', placeholder: 'ex: 1000 UI' },
    { key: 'frequence', label: 'Fréquence', placeholder: 'ex: matin' },
  ],
  drinks_alcohol: [
    { key: 'nom', label: 'Boisson', placeholder: 'ex: Vin rouge' },
    { key: 'dosage', label: 'Quantité', placeholder: 'ex: 1 verre' },
    { key: 'frequence', label: 'Fréquence', placeholder: 'ex: 1x/semaine' },
  ],
  drinks_sugary: [
    { key: 'nom', label: 'Boisson', placeholder: 'ex: Coca' },
    { key: 'dosage', label: 'Quantité', placeholder: 'ex: 33 cl' },
    { key: 'frequence', label: 'Fréquence', placeholder: 'ex: 2x/jour' },
  ],
  drinks_hot: [
    { key: 'nom', label: 'Boisson', placeholder: 'ex: Café' },
    { key: 'dosage', label: 'Quantité', placeholder: 'ex: 1 tasse' },
    { key: 'frequence', label: 'Fréquence', placeholder: 'ex: 3x/jour' },
  ],
  sports: [
    { key: 'nom', label: 'Activité', placeholder: 'ex: Course à pied' },
    { key: 'frequence', label: 'Fréquence', placeholder: 'ex: 3x/semaine' },
    { key: 'duree', label: 'Durée', placeholder: 'ex: 45 min' },
  ],
};

function isRepeaterType(t: FieldType): boolean {
  return REPEATER_SCHEMAS[t] !== undefined;
}

type RepeaterItem = Record<string, string>;

function parseRepeater(value: string): RepeaterItem[] {
  if (!value || value.trim().length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(it => it && typeof it === 'object')
      .map(it => {
        const out: RepeaterItem = {};
        for (const [k, v] of Object.entries(it)) {
          if (v == null) continue;
          out[k] = String(v);
        }
        return out;
      });
  } catch {
    return [];
  }
}

function serializeRepeater(items: RepeaterItem[]): string {
  if (items.length === 0) return '';
  // Note: we intentionally do NOT filter empty rows here. Filtering during
  // editing made "Add a row" a no-op because the freshly added empty row
  // would be stripped on the same tick, yielding setDraft(currentString) →
  // no re-render. The empty-row cleanup is done at commit() time instead.
  return JSON.stringify(items);
}

// Drop fully-empty rows before persisting — applied only at commit time so
// the live editing state can hold placeholder rows the user is filling.
function cleanRepeaterItems(items: RepeaterItem[]): RepeaterItem[] {
  return items.filter(it =>
    Object.values(it).some(v => v && v.trim().length > 0)
  );
}

// Pretty-print a repeater value for read mode: "Vin rouge · 5 verres · 1x/sem"
// per item, items joined by newlines so the field-v `pre-wrap` whitespace
// renders each entry on its own line.
function formatRepeaterForDisplay(value: string, type: FieldType): string {
  const schema = REPEATER_SCHEMAS[type];
  if (!schema) return value;
  const items = parseRepeater(value);
  if (items.length === 0) return value;
  return items
    .map(item =>
      schema
        .map(col => item[col.key])
        .filter(v => v && v.trim().length > 0)
        .join(' · ')
    )
    .filter(line => line.length > 0)
    .join('\n');
}

function emptyValue(value: string | undefined | null): string {
  return value && value.trim().length > 0 ? value : '—';
}

// Suffix the unit to a label when set: "Taille" → "Taille (cm)"
function labelWithUnit(cfg: AnamneseFieldConfig): string {
  return cfg.unit ? `${cfg.label} (${cfg.unit})` : cfg.label;
}

// Append the unit after the displayed value in read mode, unless the user
// already typed it in. "180" + cm → "180 cm" ; "180 cm" stays as is.
function valueWithUnit(cfg: AnamneseFieldConfig, value: string): string {
  if (!cfg.unit) return value;
  const trimmed = value.trim();
  if (trimmed.length === 0) return value;
  const lowerVal = trimmed.toLowerCase();
  const lowerUnit = cfg.unit.toLowerCase();
  if (lowerVal.endsWith(lowerUnit)) return trimmed;
  return `${trimmed} ${cfg.unit}`;
}

// Format a stored date (ISO YYYY-MM-DD from <input type="date">) for the
// French/European read mode display. Returns the raw value untouched when it
// doesn't match the ISO shape so non-date strings pass through unaffected.
function formatDateForDisplay(value: string): string {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return value;
  const date = new Date(trimmed.slice(0, 10) + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR');
}

// Parse a multiselect value stored as a comma-separated string. Recognises
// the "Autre : <custom>" trailing convention so we can surface the custom
// text in a dedicated input on re-load.
//
// Examples
// ────────
// "Option1, Option2"               → { selected: {Option1, Option2}, otherText: "" }
// "Option1, Autre"                 → { selected: {Option1, Autre},  otherText: "" }
// "Option1, Autre : pacsé"         → { selected: {Option1, Autre},  otherText: "pacsé" }
// "Autre : valeur, avec virgules"  → { selected: {Autre},           otherText: "valeur, avec virgules" }
function parseMultiselect(value: string): {
  selected: Set<string>;
  otherText: string;
} {
  // The "Autre :" marker terminates the comma-list — everything after is the
  // custom value verbatim (commas in the custom text are preserved).
  const autreMatch = value.match(/(^|,)\s*Autre\s*:\s*(.*)$/);
  if (autreMatch) {
    const before = value.slice(0, value.indexOf(autreMatch[0]));
    const parts = before
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return {
      selected: new Set([...parts, 'Autre']),
      otherText: autreMatch[2].trim(),
    };
  }
  const parts = value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return { selected: new Set(parts), otherText: '' };
}

function serializeMultiselect(
  selected: Set<string>,
  otherText: string
): string {
  const items: string[] = [];
  let hasAutre = false;
  for (const s of selected) {
    if (s === 'Autre') {
      hasAutre = true;
    } else {
      items.push(s);
    }
  }
  if (hasAutre) {
    const trimmed = otherText.trim();
    items.push(trimmed ? `Autre : ${trimmed}` : 'Autre');
  }
  return items.join(', ');
}

// ─────────────────────────────────────────────────────────────────────────
//  DS v2 checkbox — replaces the native checkbox with a hard-bordered ink
//  square that flips to a peps-filled tick when checked. Used by multiselect
//  fields.
// ─────────────────────────────────────────────────────────────────────────

interface DSCheckboxProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

function DSCheckbox({
  label,
  checked,
  disabled = false,
  onToggle,
}: DSCheckboxProps) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px',
        borderRadius: 8,
        cursor: disabled ? 'wait' : 'pointer',
        background: checked ? 'var(--ns-peps-soft)' : 'transparent',
        border: '1.5px solid',
        borderColor: checked ? 'var(--ns-peps-deep)' : 'transparent',
        fontFamily: 'var(--ns-font-sans)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--ns-ink)',
        userSelect: 'none',
        transition: '120ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <input
        type='checkbox'
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          border: 0,
        }}
      />
      <span
        aria-hidden='true'
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: '1.5px solid var(--ns-ink)',
          background: checked ? 'var(--ns-peps)' : 'var(--ns-cream-50)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {checked && (
          <Check
            className='w-3 h-3'
            strokeWidth={3}
            style={{ color: 'var(--ns-ink)' }}
          />
        )}
      </span>
      {label}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  Inline-editable field row
// ─────────────────────────────────────────────────────────────────────────

interface FieldRowProps {
  cfg: AnamneseFieldConfig;
  currentValue: string;
  isEditing: boolean;
  isSaving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmit: (newValue: string) => Promise<void>;
}

function FieldRow({
  cfg,
  currentValue,
  isEditing,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onSubmit,
}: FieldRowProps) {
  const [draft, setDraft] = useState(currentValue);
  const inputRef = useRef<
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | HTMLButtonElement
    | null
  >(null);
  // Keep a stable reference to the latest cancel handler so the document
  // keydown effect doesn't re-attach on every parent render (the parent passes
  // a fresh arrow function each time).
  const onCancelEditRef = useRef(onCancelEdit);
  useEffect(() => {
    onCancelEditRef.current = onCancelEdit;
  });

  const kind = inputKindFor(cfg, currentValue);
  const long =
    kind === 'textarea' || kind === 'multiselect' || kind === 'repeater';
  const fullWidth = long || !cfg.halfWidth;
  const isEmpty = !currentValue || currentValue.trim().length === 0;
  const displayLabel = labelWithUnit(cfg);

  // ─── Edit-mode lifecycle ───────────────────────────────────────────────
  // Initialize draft + focus the input + attach the document-level Escape
  // listener, all only when *entering* edit mode. We intentionally do NOT
  // depend on `currentValue` here so a successful save that updates the
  // upstream value mid-flight does not stomp the user's draft or re-focus.
  useEffect(() => {
    if (!isEditing) return;
    setDraft(currentValue);
    const focusTimer = setTimeout(() => {
      try {
        inputRef.current?.focus();
      } catch {
        // ignore: focusing detached/native widgets can throw in some browsers
      }
    }, 0);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancelEditRef.current();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const baseClass = [
    'fp-anam-field',
    fullWidth ? 'is-full' : '',
    isEditing ? 'is-editing' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Single typography stack shared by the read-mode value AND the inline
  // input/textarea/select so clicking a field doesn't shift fonts or sizes.
  const fieldFont: React.CSSProperties = {
    fontFamily: 'var(--ns-font-sans)',
    fontSize: 14,
    fontWeight: 600,
    fontStyle: 'normal',
    color: 'var(--ns-ink)',
    lineHeight: 1.4,
  };
  const inputStyle: React.CSSProperties = {
    ...fieldFont,
    marginTop: 4,
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 10px',
    border: '1.5px solid var(--ns-ink-4)',
    borderRadius: 8,
    background: 'var(--ns-cream-50)',
    resize: kind === 'textarea' ? 'vertical' : undefined,
    minHeight: kind === 'textarea' ? 90 : undefined,
  };

  async function commit(valueOverride?: string) {
    let finalValue = valueOverride !== undefined ? valueOverride : draft;
    // Strip fully-empty repeater rows just before persisting so the user
    // can keep blank placeholder lines during editing without polluting
    // the stored array.
    if (kind === 'repeater') {
      const cleaned = cleanRepeaterItems(parseRepeater(finalValue));
      finalValue = cleaned.length === 0 ? '' : JSON.stringify(cleaned);
    }
    if (finalValue === currentValue) {
      onCancelEdit();
      return;
    }
    try {
      await onSubmit(finalValue);
    } catch (err) {
      // The mutation hook surfaces user-facing errors via toast; we just log
      // here so an unhandled rejection doesn't bubble up as a generic
      // `[object Event]` runtime error.
      // eslint-disable-next-line no-console
      console.error('[AnamneseSectionPanel] field save failed', err);
    }
  }

  // Fire-and-forget wrapper used by click handlers — explicitly discards the
  // promise so React's onClick (which expects void) doesn't see an unhandled
  // rejection.
  function fireCommit(valueOverride?: string) {
    void commit(valueOverride);
  }

  function handleKeyDown(
    e: React.KeyboardEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | HTMLButtonElement
    >
  ) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancelEdit();
      return;
    }
    // Enter saves on single-line inputs / selects. On textarea, Cmd/Ctrl+Enter
    // is required so the user can still insert newlines normally.
    if (e.key === 'Enter' && (kind !== 'textarea' || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      fireCommit();
    }
  }

  // ─── Render the typed control for the current edit kind ─────────────────
  function renderEditControl() {
    if (kind === 'select') {
      const rawOptions = cfg.options ?? [];
      // Surface a custom value entered via `allowOther` as a first option so
      // it stays selectable and visible in the listbox.
      const customOption: DSDropdownOption[] =
        cfg.allowOther && draft && !rawOptions.includes(draft)
          ? [{ value: draft, label: `${draft} (personnalisé)` }]
          : [];
      const ddOptions: DSDropdownOption[] = [
        ...customOption,
        ...rawOptions.map(opt => ({ value: opt, label: opt })),
      ];
      return (
        <DSDropdown
          value={draft}
          options={ddOptions}
          onChange={v => setDraft(v)}
          disabled={isSaving}
          inputStyle={inputStyle}
          triggerRef={el => {
            inputRef.current = el;
          }}
          placeholder={cfg.placeholder || '— Choisir —'}
          onTriggerKeyDown={handleKeyDown}
        />
      );
    }

    if (kind === 'boolean') {
      return (
        <DSDropdown
          value={draft}
          options={[
            { value: 'Oui', label: 'Oui' },
            { value: 'Non', label: 'Non' },
          ]}
          onChange={v => setDraft(v)}
          disabled={isSaving}
          inputStyle={inputStyle}
          triggerRef={el => {
            inputRef.current = el;
          }}
          placeholder='— Non renseigné —'
          onTriggerKeyDown={handleKeyDown}
        />
      );
    }

    if (kind === 'multiselect') {
      const options = cfg.options ?? [];
      const { selected, otherText } = parseMultiselect(draft);
      const isAutreChecked = selected.has('Autre');
      // Show a free-text input when "Autre" is in the list of options AND
      // it's currently checked. Storage format: `…, Autre : <custom text>`.
      const showOtherInput = options.includes('Autre') && isAutreChecked;

      function toggle(opt: string) {
        const next = new Set(selected);
        if (next.has(opt)) next.delete(opt);
        else next.add(opt);
        // Drop the custom text when "Autre" is unchecked so it doesn't
        // resurface invisibly on the next toggle.
        const nextOtherText = next.has('Autre') ? otherText : '';
        setDraft(serializeMultiselect(next, nextOtherText));
      }

      function updateOtherText(text: string) {
        const next = new Set(selected);
        // Typing in the "Autre" field implies ticking it.
        if (text.trim().length > 0) next.add('Autre');
        setDraft(serializeMultiselect(next, text));
      }

      return (
        <div
          style={{
            marginTop: 4,
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              width: '100%',
              boxSizing: 'border-box',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 6,
              padding: 10,
              border: '1.5px solid var(--ns-ink-4)',
              borderRadius: 8,
              background: 'var(--ns-cream-50)',
            }}
          >
            {options.length === 0 ? (
              <span
                style={{
                  fontFamily: 'var(--ns-font-serif)',
                  fontStyle: 'italic',
                  fontSize: 13,
                  color: 'var(--ns-ink-3)',
                  fontWeight: 400,
                }}
              >
                Aucune option configurée.
              </span>
            ) : (
              options.map(opt => {
                const checked = selected.has(opt);
                return (
                  <DSCheckbox
                    key={opt}
                    label={opt}
                    checked={checked}
                    disabled={isSaving}
                    onToggle={() => toggle(opt)}
                  />
                );
              })
            )}
          </div>

          {showOtherInput && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'var(--ns-peps-soft)',
                border: '1.5px solid var(--ns-peps-deep)',
                borderRadius: 8,
              }}
            >
              <label
                htmlFor={`${cfg.key}-other`}
                style={{
                  fontFamily: 'var(--ns-font-sans)',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ns-ink-3)',
                  flexShrink: 0,
                }}
              >
                Préciser
              </label>
              <input
                id={`${cfg.key}-other`}
                type='text'
                value={otherText}
                onChange={e => updateOtherText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Texte libre…'
                disabled={isSaving}
                style={{
                  flex: 1,
                  ...fieldFont,
                  padding: '6px 10px',
                  border: '1.5px solid var(--ns-ink-4)',
                  borderRadius: 6,
                  background: 'var(--ns-cream-50)',
                }}
              />
            </div>
          )}
        </div>
      );
    }

    if (kind === 'repeater') {
      const schema = REPEATER_SCHEMAS[cfg.type] ?? [];
      const items = parseRepeater(draft);

      function applyItems(next: RepeaterItem[]) {
        setDraft(serializeRepeater(next));
      }
      function updateCell(idx: number, colKey: string, val: string) {
        applyItems(
          items.map((it, i) => (i === idx ? { ...it, [colKey]: val } : it))
        );
      }
      function addItem() {
        const empty: RepeaterItem = Object.fromEntries(
          schema.map(col => [col.key, ''])
        );
        applyItems([...items, empty]);
      }
      function removeItem(idx: number) {
        applyItems(items.filter((_, i) => i !== idx));
      }

      const cellStyle: React.CSSProperties = {
        ...fieldFont,
        padding: '7px 10px',
        border: '1.5px solid var(--ns-ink-4)',
        borderRadius: 6,
        background: 'var(--ns-cream-50)',
        width: '100%',
        boxSizing: 'border-box',
      };

      return (
        <div
          style={{
            marginTop: 4,
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 10,
            border: '1.5px solid var(--ns-ink-4)',
            borderRadius: 8,
            background: 'var(--ns-cream-50)',
          }}
        >
          {items.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--ns-font-serif)',
                fontStyle: 'italic',
                fontSize: 13,
                color: 'var(--ns-ink-3)',
                margin: 0,
                padding: '8px 4px',
              }}
            >
              Aucune entrée — utiliser « + Ajouter » ci-dessous.
            </p>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${schema.length}, minmax(0, 1fr)) auto`,
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                {schema.map((col, colIdx) => (
                  <input
                    key={col.key}
                    ref={el => {
                      // Focus the very first cell on edit-mode entry.
                      if (idx === 0 && colIdx === 0) inputRef.current = el;
                    }}
                    type='text'
                    value={item[col.key] ?? ''}
                    onChange={e => updateCell(idx, col.key, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={col.placeholder ?? col.label}
                    aria-label={`${col.label} (ligne ${idx + 1})`}
                    disabled={isSaving}
                    style={cellStyle}
                  />
                ))}
                <button
                  type='button'
                  className='fp-btn fp-btn-icon'
                  onClick={() => removeItem(idx)}
                  disabled={isSaving}
                  aria-label={`Supprimer la ligne ${idx + 1}`}
                  style={{ width: 28, height: 28 }}
                >
                  <Trash2
                    className='w-3 h-3'
                    style={{ color: 'var(--ns-coral)' }}
                  />
                </button>
              </div>
            ))
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginTop: items.length > 0 ? 4 : 0,
              paddingTop: items.length > 0 ? 8 : 0,
              borderTop:
                items.length > 0 ? '1px dashed var(--ns-ink-4)' : 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--ns-font-sans)',
                fontSize: 11,
                color: 'var(--ns-ink-3)',
                fontWeight: 600,
              }}
            >
              {schema.map(c => c.label).join(' · ')}
            </span>
            <button
              type='button'
              className='fp-form-add-point'
              onClick={addItem}
              disabled={isSaving}
            >
              <Plus className='w-3 h-3' />
              Ajouter une ligne
            </button>
          </div>
        </div>
      );
    }

    if (kind === 'textarea') {
      return (
        <textarea
          ref={el => {
            inputRef.current = el;
          }}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={cfg.placeholder}
          rows={4}
          style={inputStyle}
          disabled={isSaving}
        />
      );
    }

    if (kind === 'tel') {
      const { indicatif, local } = parsePhone(draft);
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, max-content) 1fr',
            gap: 8,
            marginTop: 4,
            alignItems: 'start',
          }}
        >
          <DSDropdown
            value={indicatif}
            options={COUNTRY_CODES}
            onChange={v => setDraft(serializePhone(v, local))}
            disabled={isSaving}
            inputStyle={{ ...inputStyle, marginTop: 0 }}
            wrapperStyle={{ marginTop: 0 }}
            triggerRef={() => {}}
            placeholder='Indicatif'
            onTriggerKeyDown={handleKeyDown}
          />
          <input
            ref={el => {
              inputRef.current = el;
            }}
            type='tel'
            inputMode='tel'
            value={local}
            onChange={e => setDraft(serializePhone(indicatif, e.target.value))}
            onKeyDown={handleKeyDown}
            placeholder={cfg.placeholder ?? '0612345678'}
            aria-label='Numéro de téléphone'
            style={{ ...inputStyle, marginTop: 0 }}
            disabled={isSaving}
          />
        </div>
      );
    }

    // text · date · number
    return (
      <div style={{ position: 'relative', marginTop: 4 }}>
        <input
          ref={el => {
            inputRef.current = el;
          }}
          type={kind}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={cfg.placeholder}
          min={kind === 'number' && cfg.type === 'scale' ? 0 : cfg.min}
          max={
            kind === 'number' && cfg.type === 'scale'
              ? (cfg.scaleMax ?? 10)
              : cfg.max
          }
          style={{
            ...inputStyle,
            marginTop: 0,
            paddingRight: cfg.unit ? 44 : 10,
          }}
          disabled={isSaving}
        />
        {cfg.unit && (
          <span
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'var(--ns-font-sans)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ns-ink-3)',
              pointerEvents: 'none',
            }}
          >
            {cfg.unit}
          </span>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={baseClass} style={{ background: 'var(--ns-cream-50)' }}>
        <label>{displayLabel}</label>
        {renderEditControl()}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 6,
            marginTop: 6,
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: 'var(--ns-font-serif)',
              fontStyle: 'italic',
              fontSize: 11,
              color: 'var(--ns-ink-3)',
            }}
          >
            {kind === 'multiselect'
              ? 'Cocher les options · Échap pour annuler'
              : kind === 'repeater'
                ? 'Remplir les lignes · Échap pour annuler'
                : kind === 'textarea'
                  ? 'Cmd/Ctrl+Entrée pour valider · Échap pour annuler'
                  : 'Entrée pour valider · Échap pour annuler'}
          </span>
          <button
            type='button'
            className='fp-btn fp-btn-icon'
            onClick={onCancelEdit}
            disabled={isSaving}
            aria-label='Annuler'
            style={{ width: 28, height: 28 }}
          >
            <X className='w-3 h-3' />
          </button>
          <button
            type='button'
            className='fp-btn fp-btn-icon'
            onClick={() => fireCommit()}
            disabled={isSaving}
            aria-label='Valider'
            style={{
              width: 28,
              height: 28,
              background: 'var(--ns-peps)',
              borderColor: 'var(--ns-ink)',
            }}
          >
            {isSaving ? (
              <Loader2 className='w-3 h-3 animate-spin' />
            ) : (
              <Check className='w-3 h-3' />
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── Read mode ──────────────────────────────────────────────────────────
  return (
    <button
      type='button'
      className={baseClass}
      onClick={onStartEdit}
      style={{
        textAlign: 'left',
        cursor: 'pointer',
        font: 'inherit',
      }}
      title='Cliquer pour éditer'
    >
      <label style={{ pointerEvents: 'none' }}>{displayLabel}</label>
      <div
        className={`fp-anam-field-v ${isEmpty ? 'is-muted' : ''}`}
        style={{
          ...fieldFont,
          color: isEmpty ? 'var(--ns-ink-3)' : 'var(--ns-ink)',
          fontStyle: isEmpty ? 'italic' : 'normal',
          fontWeight: isEmpty ? 500 : 600,
          whiteSpace: long ? 'pre-wrap' : 'normal',
          pointerEvents: 'none',
        }}
      >
        {isEmpty
          ? emptyValue(currentValue)
          : cfg.type === 'date'
            ? formatDateForDisplay(currentValue)
            : cfg.type === 'phone'
              ? formatPhoneForDisplay(currentValue)
              : isRepeaterType(cfg.type)
                ? formatRepeaterForDisplay(currentValue, cfg.type)
                : valueWithUnit(cfg, currentValue)}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  Section panel — orchestrates the typed field rows + section nav
// ─────────────────────────────────────────────────────────────────────────

export function AnamneseSectionPanel({
  section,
  sectionId,
  onUpdateField,
  isSaving = false,
}: AnamneseSectionPanelProps) {
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const fieldConfigs: AnamneseFieldConfig[] =
    ANAMNESE_SECTION_FIELDS[sectionId] ?? [];

  const valuesByLabel = new Map<string, string>();
  for (const f of section?.fields ?? []) {
    valuesByLabel.set(f.label, f.value);
  }

  // Compute simple `dependsOn` visibility — hide fields whose dependency
  // isn't satisfied by the current saved data.
  const visibleConfigs = fieldConfigs.filter(cfg => {
    if (!cfg.dependsOn) return true;
    const depValue = valuesByLabel.get(cfg.dependsOn.field);
    return depValue === cfg.dependsOn.value;
  });

  const filledCount = visibleConfigs.filter(cfg => {
    const v = valuesByLabel.get(cfg.label);
    return v && v.trim().length > 0;
  }).length;
  const expectedTotal = visibleConfigs.length;

  const fullLabel = ANAMNESE_SECTION_LABELS[sectionId] || 'Section';
  const [titleStart, titleEm] = splitTitle(fullLabel);

  const currentIndex = SIDEBAR_SECTION_IDS.indexOf(sectionId);

  const sub =
    expectedTotal > 0
      ? `${filledCount} champ${filledCount > 1 ? 's' : ''} renseigné${filledCount > 1 ? 's' : ''} sur ${expectedTotal} — cliquer sur un champ pour l'éditer.`
      : 'Cliquer sur un champ pour l’éditer.';

  // Group rendering: walk through visibleConfigs and emit a group eyebrow
  // each time `groupLabel` changes.
  let lastGroup: string | undefined;

  async function handleFieldSubmit(label: string, newValue: string) {
    try {
      await onUpdateField(sectionId, label, newValue);
      setEditingLabel(null);
    } catch {
      // The mutation hook surfaces the error; keep edit mode open so the
      // nutritionist can retry.
    }
  }

  return (
    <article className='fp-anam-section'>
      <div className='fp-anam-section-head'>
        <div>
          <span className='fp-anam-section-id'>
            Section {String(currentIndex + 1).padStart(2, '0')} · {fullLabel}
          </span>
          <h3 className='fp-anam-section-title'>
            {titleStart}
            {titleEm && <em>{titleEm}</em>}
          </h3>
          <p className='fp-anam-section-sub'>{sub}</p>
        </div>
      </div>

      {visibleConfigs.length === 0 ? (
        <div className='fp-cr-empty'>
          Aucun champ configuré pour cette section.
        </div>
      ) : (
        <div className='fp-anam-fields'>
          {visibleConfigs.map(cfg => {
            const groupEyebrow =
              cfg.groupLabel && cfg.groupLabel !== lastGroup ? (
                <div key={`group-${cfg.groupLabel}`} className='fp-anam-group'>
                  {cfg.groupLabel}
                </div>
              ) : null;
            lastGroup = cfg.groupLabel;
            const currentValue = valuesByLabel.get(cfg.label) ?? '';
            const isEditing = editingLabel === cfg.label;
            return (
              <React.Fragment key={cfg.key}>
                {groupEyebrow}
                <FieldRow
                  cfg={cfg}
                  currentValue={currentValue}
                  isEditing={isEditing}
                  isSaving={isEditing && isSaving}
                  onStartEdit={() => setEditingLabel(cfg.label)}
                  onCancelEdit={() => setEditingLabel(null)}
                  onSubmit={newValue => handleFieldSubmit(cfg.label, newValue)}
                />
              </React.Fragment>
            );
          })}
        </div>
      )}
    </article>
  );
}
