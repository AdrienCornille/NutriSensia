#!/usr/bin/env node
/**
 * Script d'import de la base Ciqual (ANSES) vers le format Supabase `foods`.
 *
 * Fichiers source (XML Ciqual 2025-11-03) :
 *   - alim_2025_11_03.xml      (3 484 aliments)
 *   - alim_grp_2025_11_03.xml  (138 groupes)
 *   - const_2025_11_03.xml     (74 constituants)
 *   - compo_2025_11_03.xml     (257 816 compositions - 66 MB)
 *
 * Sortie :
 *   - database/seed_ciqual_foods.sql       (INSERT pour table `foods`)
 *   - database/seed_ciqual_categories.sql  (INSERT pour table `food_categories`)
 *
 * Usage :
 *   node scripts/import-ciqual.mjs /path/to/ciqual/directory
 */

import { readFileSync, writeFileSync, createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { join, resolve } from 'node:path';

// ─── Configuration ───────────────────────────────────────────────────────────

const CIQUAL_DIR = process.argv[2] || '/Users/adriencornille/Downloads/2025_11_03';
const OUTPUT_DIR = resolve(process.argv[3] || join(import.meta.dirname, '..', 'database'));

// Mapping: Ciqual const_code → colonne `foods` dans Supabase
const NUTRIENT_MAP = {
  // Macronutriments
  328:   'calories',        // Energie kcal/100g
  25000: 'proteins',        // Protéines (N x facteur Jones) g/100g
  31000: 'carbohydrates',   // Glucides g/100g
  32000: 'sugars',          // Sucres g/100g
  34100: 'fiber',           // Fibres alimentaires g/100g
  40000: 'fat',             // Lipides g/100g
  40302: 'saturated_fat',   // AG saturés g/100g
  75100: 'cholesterol',     // Cholestérol mg/100g
  10110: 'sodium',          // Sodium mg/100g
  10190: 'potassium',       // Potassium mg/100g

  // Vitamines
  51104: 'vitamin_a',       // Vitamine A (éq. rétinol) µg/100g
  55100: 'vitamin_c',       // Vitamine C mg/100g
  52100: 'vitamin_d',       // Vitamine D µg/100g
  53100: 'vitamin_e',       // Vitamine E mg/100g
  54101: 'vitamin_k',       // Vitamine K1 µg/100g
  56100: 'vitamin_b1',      // Thiamine mg/100g
  56200: 'vitamin_b2',      // Riboflavine mg/100g
  56310: 'vitamin_b3',      // Niacine mg/100g
  56500: 'vitamin_b6',      // Vitamine B6 mg/100g
  56700: 'vitamin_b9',      // Folates µg/100g
  56600: 'vitamin_b12',     // Vitamine B12 µg/100g

  // Minéraux
  10200: 'calcium',         // Calcium mg/100g
  10260: 'iron',            // Fer mg/100g
  10120: 'magnesium',       // Magnésium mg/100g
  10150: 'phosphorus',      // Phosphore mg/100g
  10300: 'zinc',            // Zinc mg/100g
};

// Mapping: Ciqual alim_grp_code → slug food_categories NutriSensia
// Basé sur les 11 groupes Ciqual réels
const GROUP_TO_CATEGORY = {
  '01': 'prepared',        // Entrées et plats composés
  '02': 'vegetables',      // Fruits, légumes, légumineuses et oléagineux (default → vegetables)
  '03': 'grains',          // Produits céréaliers
  '04': 'proteins',        // Viandes, œufs, poissons
  '05': 'dairy',           // Produits laitiers
  '06': 'beverages',       // Eaux et autres boissons
  '07': 'sweets',          // Produits sucrés
  '08': 'sweets',          // Glaces et sorbets
  '09': 'fats-oils',       // Matières grasses
  '10': 'condiments',      // Aides culinaires et ingrédients divers
  '11': 'prepared',        // Aliments infantiles
};

// Mapping spécial au niveau sous-groupe pour le groupe 02 (mixte)
const SUBGROUP_TO_CATEGORY = {
  '0201': 'vegetables',    // Légumes
  '0202': 'vegetables',    // Pommes de terre et tubercules
  '0203': 'vegetables',    // Légumineuses
  '0204': 'fruits',        // Fruits
  '0205': 'proteins',      // Fruits à coque et graines oléagineuses (noix, amandes, etc.)
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extrait la valeur texte entre <tag> et </tag> */
function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}>\\s*(.*?)\\s*</${tag}>`, 's');
  const m = xml.match(re);
  return m ? m[1].trim() : null;
}

/** Vérifie si un tag a l'attribut missing */
function isMissing(xml, tag) {
  const re = new RegExp(`<${tag}\\s+missing=`);
  return re.test(xml);
}

/** Parse une valeur numérique Ciqual (gère les virgules françaises et les traces) */
function parseNum(val) {
  if (!val || val === '-' || val === 'traces' || val === '<') return null;
  // Certaines valeurs Ciqual sont "< 0.5" → on prend la moitié
  if (val.startsWith('<')) {
    const num = parseFloat(val.replace('<', '').replace(',', '.').trim());
    return isNaN(num) ? null : num / 2;
  }
  const num = parseFloat(val.replace(',', '.').trim());
  return isNaN(num) ? null : num;
}

/** Échappe une string pour SQL */
function sqlEsc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

/** Formate un nombre pour SQL */
function sqlNum(val) {
  if (val === null || val === undefined) return 'NULL';
  return val.toString();
}

// ─── Parsers XML ─────────────────────────────────────────────────────────────

/** Parse le fichier alim (aliments) */
function parseAliments(filePath) {
  console.log('  Parsing aliments...');
  const xml = readFileSync(filePath, 'utf-8');
  const aliments = new Map();

  const entries = xml.match(/<ALIM>[\s\S]*?<\/ALIM>/g) || [];
  for (const entry of entries) {
    const code = extractTag(entry, 'alim_code');
    const nom_fr = extractTag(entry, 'alim_nom_fr');
    const nom_en = extractTag(entry, 'alim_nom_eng');
    const grp = extractTag(entry, 'alim_grp_code');
    const ssgrp = extractTag(entry, 'alim_ssgrp_code');
    const ssssgrp = extractTag(entry, 'alim_ssssgrp_code');

    aliments.set(code, {
      code,
      name_fr: nom_fr,
      name_en: nom_en || null,
      grp_code: grp,
      ssgrp_code: ssgrp,
      ssssgrp_code: ssssgrp,
      nutrients: {},
    });
  }

  console.log(`    → ${aliments.size} aliments parsés`);
  return aliments;
}

/** Parse le fichier groupes */
function parseGroupes(filePath) {
  console.log('  Parsing groupes...');
  const xml = readFileSync(filePath, 'utf-8');
  const groupes = new Map();

  const entries = xml.match(/<ALIM_GRP>[\s\S]*?<\/ALIM_GRP>/g) || [];
  for (const entry of entries) {
    const grp_code = extractTag(entry, 'alim_grp_code');
    const grp_fr = extractTag(entry, 'alim_grp_nom_fr');
    const grp_en = extractTag(entry, 'alim_grp_nom_eng');
    const ssgrp_code = extractTag(entry, 'alim_ssgrp_code');
    const ssgrp_fr = extractTag(entry, 'alim_ssgrp_nom_fr');
    const ssgrp_en = extractTag(entry, 'alim_ssgrp_nom_eng');
    const ssssgrp_code = extractTag(entry, 'alim_ssssgrp_code');
    const ssssgrp_fr = extractTag(entry, 'alim_ssssgrp_nom_fr');
    const ssssgrp_en = extractTag(entry, 'alim_ssssgrp_nom_eng');

    // Stocker le groupe principal
    if (!groupes.has(grp_code)) {
      groupes.set(grp_code, {
        code: grp_code,
        name_fr: grp_fr,
        name_en: grp_en,
        subgroups: new Map(),
      });
    }

    // Stocker le sous-groupe
    const grp = groupes.get(grp_code);
    if (ssgrp_code && !grp.subgroups.has(ssgrp_code)) {
      grp.subgroups.set(ssgrp_code, {
        code: ssgrp_code,
        name_fr: ssgrp_fr,
        name_en: ssgrp_en,
      });
    }
  }

  console.log(`    → ${groupes.size} groupes, ${[...groupes.values()].reduce((s, g) => s + g.subgroups.size, 0)} sous-groupes`);
  return groupes;
}

/** Parse le fichier constituants */
function parseConstituants(filePath) {
  console.log('  Parsing constituants...');
  const xml = readFileSync(filePath, 'utf-8');
  const constituants = new Map();

  const entries = xml.match(/<CONST>[\s\S]*?<\/CONST>/g) || [];
  for (const entry of entries) {
    const code = extractTag(entry, 'const_code');
    const nom_fr = extractTag(entry, 'const_nom_fr');
    const nom_en = extractTag(entry, 'const_nom_eng');
    constituants.set(code, { code, name_fr: nom_fr, name_en: nom_en });
  }

  console.log(`    → ${constituants.size} constituants parsés`);
  return constituants;
}

/**
 * Parse le fichier compositions en streaming (66 MB).
 * Pour chaque <COMPO>, extrait alim_code + const_code + teneur
 * et peuple directement la Map des aliments.
 */
async function parseCompositions(filePath, aliments) {
  console.log('  Parsing compositions (streaming 66 MB)...');

  const nutrientCodes = new Set(Object.keys(NUTRIENT_MAP).map(String));
  let count = 0;
  let matched = 0;

  // Lire le fichier en streaming ligne par ligne
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });

  let currentBlock = '';
  let inCompo = false;

  for await (const line of rl) {
    const trimmed = line.trim();

    if (trimmed.includes('<COMPO>')) {
      inCompo = true;
      currentBlock = trimmed;
      continue;
    }

    if (inCompo) {
      currentBlock += ' ' + trimmed;

      if (trimmed.includes('</COMPO>')) {
        inCompo = false;
        count++;

        // Extraire les valeurs
        const alimCode = extractTag(currentBlock, 'alim_code');
        const constCode = extractTag(currentBlock, 'const_code');
        const teneur = extractTag(currentBlock, 'teneur');

        // Ne garder que les nutriments qu'on mappe
        if (nutrientCodes.has(constCode)) {
          const aliment = aliments.get(alimCode);
          if (aliment) {
            const colName = NUTRIENT_MAP[parseInt(constCode)];
            const value = parseNum(teneur);
            if (colName && value !== null) {
              aliment.nutrients[colName] = value;
              matched++;
            }
          }
        }

        currentBlock = '';

        // Progress
        if (count % 50000 === 0) {
          console.log(`    ... ${count} compositions traitées (${matched} valeurs mappées)`);
        }
      }
    }
  }

  console.log(`    → ${count} compositions traitées, ${matched} valeurs mappées sur ${nutrientCodes.size} nutriments`);
}

// ─── Génération SQL ──────────────────────────────────────────────────────────

function generateCategoriesSQL(groupes) {
  console.log('  Génération du SQL catégories...');

  const lines = [];
  lines.push('-- =============================================================================');
  lines.push('-- Seed Ciqual: Sous-catégories alimentaires (enfants des catégories existantes)');
  lines.push('-- Source: ANSES Ciqual 2025-11-03');
  lines.push(`-- Généré le: ${new Date().toISOString()}`);
  lines.push('-- =============================================================================');
  lines.push('');
  lines.push('-- Les catégories parentes (fruits, vegetables, grains, proteins, dairy, etc.)');
  lines.push('-- sont déjà créées par la migration 04_foods_database.sql.');
  lines.push('-- Ce script ajoute les sous-catégories Ciqual comme enfants.');
  lines.push('');
  lines.push('INSERT INTO food_categories (slug, name_fr, name_en, parent_id, sort_order, is_active)');
  lines.push('VALUES');

  const values = [];
  let sortOrder = 100;

  for (const [grpCode, grp] of groupes) {
    const defaultParent = GROUP_TO_CATEGORY[grpCode];
    if (!defaultParent) continue;

    for (const [ssgrpCode, ssgrp] of grp.subgroups) {
      if (ssgrp.name_fr === '-') continue;
      // Utiliser le mapping spécial sous-groupe si disponible, sinon le parent par défaut
      const parentSlug = SUBGROUP_TO_CATEGORY[ssgrpCode] || defaultParent;
      const slug = `ciqual-${ssgrpCode}`;
      values.push(
        `  (${sqlEsc(slug)}, ${sqlEsc(ssgrp.name_fr)}, ${sqlEsc(ssgrp.name_en)}, ` +
        `(SELECT id FROM food_categories WHERE slug = ${sqlEsc(parentSlug)} LIMIT 1), ` +
        `${sortOrder++}, true)`
      );
    }
  }

  lines.push(values.join(',\n'));
  lines.push('ON CONFLICT (slug) DO UPDATE SET');
  lines.push('  name_fr = EXCLUDED.name_fr,');
  lines.push('  name_en = EXCLUDED.name_en,');
  lines.push('  parent_id = EXCLUDED.parent_id;');
  lines.push('');

  return lines.join('\n');
}

function generateFoodsSQL(aliments, groupes) {
  console.log('  Génération du SQL aliments...');

  // Colonnes nutritionnelles ordonnées
  const nutrientColumns = [
    'calories', 'proteins', 'carbohydrates', 'sugars', 'fiber',
    'fat', 'saturated_fat', 'cholesterol', 'sodium', 'potassium',
    'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
    'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b6', 'vitamin_b9', 'vitamin_b12',
    'calcium', 'iron', 'magnesium', 'phosphorus', 'zinc',
  ];

  const columns = [
    'external_id', 'name_fr', 'name_en', 'category_id',
    ...nutrientColumns,
    'data_source', 'data_quality', 'is_active',
  ];

  const lines = [];
  lines.push('-- =============================================================================');
  lines.push('-- Seed Ciqual: Base alimentaire française (ANSES)');
  lines.push(`-- ${aliments.size} aliments avec données nutritionnelles complètes`);
  lines.push('-- Source: ANSES Ciqual 2025-11-03');
  lines.push(`-- Généré le: ${new Date().toISOString()}`);
  lines.push('-- =============================================================================');
  lines.push('');
  lines.push('-- Index unique nécessaire pour ON CONFLICT (upsert)');
  lines.push('CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_external_id ON foods(external_id) WHERE external_id IS NOT NULL;');
  lines.push('');

  // Insérer par batches de 500 pour éviter les requêtes SQL trop longues
  const BATCH_SIZE = 500;
  const alimentsList = [...aliments.values()];
  let totalWithCalories = 0;

  for (let i = 0; i < alimentsList.length; i += BATCH_SIZE) {
    const batch = alimentsList.slice(i, i + BATCH_SIZE);

    lines.push(`-- Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(alimentsList.length / BATCH_SIZE)}`);
    lines.push(`INSERT INTO foods (${columns.join(', ')})`);
    lines.push('VALUES');

    const values = [];
    for (const alim of batch) {
      // Déterminer la sous-catégorie Ciqual (avec mapping spécial pour groupe 02)
      const categorySlug = alim.ssgrp_code ? `ciqual-${alim.ssgrp_code}` : null;
      const parentSlug = SUBGROUP_TO_CATEGORY[alim.ssgrp_code] || GROUP_TO_CATEGORY[alim.grp_code] || null;

      // Sous-requête pour trouver la catégorie
      const categorySubquery = categorySlug
        ? `(SELECT id FROM food_categories WHERE slug = ${sqlEsc(categorySlug)} LIMIT 1)`
        : parentSlug
          ? `(SELECT id FROM food_categories WHERE slug = ${sqlEsc(parentSlug)} LIMIT 1)`
          : 'NULL';

      // Valeurs nutritionnelles
      const nutrientValues = nutrientColumns.map(col => sqlNum(alim.nutrients[col] ?? null));

      if (alim.nutrients.calories) totalWithCalories++;

      values.push(
        `  (${sqlEsc(`ciqual-${alim.code}`)}, ${sqlEsc(alim.name_fr)}, ${sqlEsc(alim.name_en)}, ${categorySubquery}, ` +
        `${nutrientValues.join(', ')}, ` +
        `'ciqual', 'high', true)`
      );
    }

    lines.push(values.join(',\n'));
    lines.push('ON CONFLICT (external_id) DO UPDATE SET');
    lines.push('  name_fr = EXCLUDED.name_fr,');
    lines.push('  name_en = EXCLUDED.name_en,');
    lines.push('  category_id = EXCLUDED.category_id,');
    for (const col of nutrientColumns) {
      lines.push(`  ${col} = EXCLUDED.${col},`);
    }
    lines.push('  data_source = EXCLUDED.data_source,');
    lines.push('  data_quality = EXCLUDED.data_quality,');
    lines.push('  updated_at = NOW();');
    lines.push('');
  }

  console.log(`    → ${totalWithCalories}/${aliments.size} aliments avec données caloriques`);
  return lines.join('\n');
}

// ─── Statistiques ────────────────────────────────────────────────────────────

function printStats(aliments) {
  console.log('\n📊 Statistiques de l\'import:');

  const nutrientColumns = Object.values(NUTRIENT_MAP);
  const coverage = {};
  for (const col of nutrientColumns) {
    coverage[col] = 0;
  }

  let total = 0;
  for (const alim of aliments.values()) {
    total++;
    for (const col of nutrientColumns) {
      if (alim.nutrients[col] !== undefined) coverage[col]++;
    }
  }

  console.log(`\n  Total aliments: ${total}`);
  console.log('\n  Couverture par nutriment:');
  const sorted = Object.entries(coverage).sort((a, b) => b[1] - a[1]);
  for (const [col, count] of sorted) {
    const pct = ((count / total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / total * 30));
    console.log(`    ${col.padEnd(18)} ${count.toString().padStart(5)}/${total} (${pct.padStart(5)}%) ${bar}`);
  }
}

/** Découpe le SQL foods en fichiers séparés par batch (pour Supabase SQL Editor) */
function splitSQLBatches(sql) {
  const batches = [];
  // L'index unique doit être dans chaque fichier (idempotent)
  const indexLine = 'CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_external_id ON foods(external_id) WHERE external_id IS NOT NULL;\n';

  // Découper sur les commentaires "-- Batch N/M"
  const parts = sql.split(/(?=-- Batch \d+\/\d+)/);

  for (const part of parts) {
    if (!part.startsWith('-- Batch')) continue;
    batches.push(indexLine + '\n' + part.trim() + '\n');
  }

  return batches;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🍽️  Import Ciqual → Supabase NutriSensia');
  console.log(`   Source: ${CIQUAL_DIR}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log('');

  // 1. Parser les fichiers XML
  console.log('📖 Parsing des fichiers XML...');
  const aliments = parseAliments(join(CIQUAL_DIR, 'alim_2025_11_03.xml'));
  const groupes = parseGroupes(join(CIQUAL_DIR, 'alim_grp_2025_11_03.xml'));
  const constituants = parseConstituants(join(CIQUAL_DIR, 'const_2025_11_03.xml'));
  await parseCompositions(join(CIQUAL_DIR, 'compo_2025_11_03.xml'), aliments);

  // 2. Afficher les stats
  printStats(aliments);

  // 3. Générer les fichiers SQL
  console.log('\n📝 Génération des fichiers SQL...');
  const catSQL = generateCategoriesSQL(groupes);
  const foodsSQL = generateFoodsSQL(aliments, groupes);

  const catPath = join(OUTPUT_DIR, 'seed_ciqual_categories.sql');
  const foodsPath = join(OUTPUT_DIR, 'seed_ciqual_foods.sql');

  writeFileSync(catPath, catSQL, 'utf-8');
  writeFileSync(foodsPath, foodsSQL, 'utf-8');

  // Découper aussi en fichiers individuels par batch (pour Supabase SQL Editor)
  const foodsBatches = splitSQLBatches(foodsSQL);
  const batchPaths = [];
  for (let i = 0; i < foodsBatches.length; i++) {
    const batchPath = join(OUTPUT_DIR, `seed_ciqual_foods_part${i + 1}.sql`);
    writeFileSync(batchPath, foodsBatches[i], 'utf-8');
    batchPaths.push(batchPath);
  }

  console.log(`\n✅ Fichiers générés:`);
  console.log(`   ${catPath}`);
  console.log(`   ${foodsPath} (fichier complet)`);
  for (const bp of batchPaths) {
    const size = (readFileSync(bp).length / 1024).toFixed(1);
    console.log(`   ${bp} (${size} KB)`);
  }

  // Taille des fichiers
  const catSize = (readFileSync(catPath).length / 1024).toFixed(1);
  const foodsSize = (readFileSync(foodsPath).length / (1024 * 1024)).toFixed(2);
  console.log(`\n   Total catégories: ${catSize} KB`);
  console.log(`   Total aliments:   ${foodsSize} MB (${foodsBatches.length} parties)`);

  console.log('\n📋 Prochaine étape:');
  console.log('   1. Vérifier que les catégories parentes existent (migration 04_foods_database.sql)');
  console.log('   2. Exécuter: psql $SUPABASE_DB_URL -f database/seed_ciqual_categories.sql');
  console.log('   3. Exécuter: psql $SUPABASE_DB_URL -f database/seed_ciqual_foods.sql');
  console.log('   Ou via Supabase Dashboard > SQL Editor');
}

main().catch(console.error);
