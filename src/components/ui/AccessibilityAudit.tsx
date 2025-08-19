'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { Button } from './Button';

/**
 * Interface pour les résultats d'audit d'accessibilité
 */
interface AuditResult {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
}

/**
 * Composant d'audit d'accessibilité automatisé
 */
export default function AccessibilityAudit() {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({
    violations: 0,
    passes: 0,
    incomplete: 0,
    inapplicable: 0,
  });

  const runAudit = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Charger axe-core dynamiquement
      const axe = await import('axe-core');

      // Exécuter l'audit
      const auditResults = await axe.run({
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'best-practice'],
        },
        rules: {
          'color-contrast': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'landmark-one-main': { enabled: true },
          'page-has-heading-one': { enabled: true },
          region: { enabled: true },
          'skip-link': { enabled: true },
        },
      });

      // Convertir les résultats d'axe-core vers notre format
      const convertedResults: AuditResult[] = auditResults.violations.map(
        violation => ({
          id: violation.id,
          impact:
            (violation.impact as
              | 'minor'
              | 'moderate'
              | 'serious'
              | 'critical') || 'moderate',
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          tags: violation.tags,
          nodes: violation.nodes.map(node => ({
            html: node.html,
            target: node.target as any as string[],
            failureSummary: node.failureSummary,
          })),
        })
      );

      setResults(convertedResults);
      setSummary({
        violations: auditResults.violations.length,
        passes: auditResults.passes.length,
        incomplete: auditResults.incomplete.length,
        inapplicable: auditResults.inapplicable.length,
      });
    } catch (error) {
      console.error("Erreur lors de l'audit d'accessibilité:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'text-functional-error';
      case 'serious':
        return 'text-functional-warning';
      case 'moderate':
        return 'text-functional-info';
      case 'minor':
        return 'text-neutral-medium';
      default:
        return 'text-neutral-medium';
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'Critique';
      case 'serious':
        return 'Sérieux';
      case 'moderate':
        return 'Modéré';
      case 'minor':
        return 'Mineur';
      default:
        return impact;
    }
  };

  return (
    <div className='space-y-32dp'>
      <div className='text-center'>
        <h2 className='text-h2 text-neutral-dark mb-16dp'>
          Audit d&apos;Accessibilité Automatisé
        </h2>
        <p className='text-body-large text-neutral-medium mb-32dp'>
          Test automatisé de la conformité WCAG 2.1 AA avec axe-core
        </p>
      </div>

      {/* Bouton de lancement */}
      <div className='text-center'>
        <Button
          onClick={runAudit}
          disabled={isRunning}
          loading={isRunning}
          size='lg'
        >
          {isRunning
            ? 'Audit en cours...'
            : 'Lancer l&apos;audit d&apos;accessibilité'}
        </Button>
      </div>

      {/* Résumé */}
      {summary.violations > 0 && (
        <Card>
          <CardHeader>
            <h3 className='text-h3 text-neutral-dark'>
              Résumé de l&apos;audit
            </h3>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-16dp'>
              <div className='text-center'>
                <div className='text-h2 text-functional-error font-bold'>
                  {summary.violations}
                </div>
                <div className='text-caption text-neutral-medium'>
                  Violations
                </div>
              </div>
              <div className='text-center'>
                <div className='text-h2 text-functional-success font-bold'>
                  {summary.passes}
                </div>
                <div className='text-caption text-neutral-medium'>
                  Tests réussis
                </div>
              </div>
              <div className='text-center'>
                <div className='text-h2 text-functional-warning font-bold'>
                  {summary.incomplete}
                </div>
                <div className='text-caption text-neutral-medium'>
                  Tests incomplets
                </div>
              </div>
              <div className='text-center'>
                <div className='text-h2 text-neutral-medium font-bold'>
                  {summary.inapplicable}
                </div>
                <div className='text-caption text-neutral-medium'>
                  Non applicable
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats détaillés */}
      {results.length > 0 && (
        <div className='space-y-16dp'>
          <h3 className='text-h3 text-neutral-dark'>
            Violations détectées ({results.length})
          </h3>

          {results.map((violation, index) => (
            <Card
              key={violation.id}
              className='border-l-4 border-functional-error'
            >
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <h4 className='text-h4 text-neutral-dark'>
                    {violation.description}
                  </h4>
                  <span
                    className={`text-caption font-medium px-8dp py-4dp rounded-4dp bg-neutral-light ${getImpactColor(violation.impact)}`}
                  >
                    {getImpactLabel(violation.impact)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className='space-y-16dp'>
                {/* Description de l'aide */}
                <div>
                  <p className='text-body text-neutral-medium'>
                    {violation.help}
                  </p>
                  <a
                    href={violation.helpUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline text-caption'
                  >
                    En savoir plus →
                  </a>
                </div>

                {/* Tags WCAG */}
                <div>
                  <h5 className='text-label font-medium text-neutral-dark mb-8dp'>
                    Critères WCAG concernés :
                  </h5>
                  <div className='flex flex-wrap gap-8dp'>
                    {violation.tags
                      .filter(tag => tag.startsWith('wcag'))
                      .map(tag => (
                        <span
                          key={tag}
                          className='px-8dp py-4dp bg-primary text-white text-caption rounded-4dp'
                        >
                          {tag.toUpperCase()}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Éléments concernés */}
                <div>
                  <h5 className='text-label font-medium text-neutral-dark mb-8dp'>
                    Éléments concernés ({violation.nodes.length}) :
                  </h5>
                  <div className='space-y-8dp'>
                    {violation.nodes.map((node, nodeIndex) => (
                      <div
                        key={nodeIndex}
                        className='p-12dp bg-neutral-light rounded-8dp'
                      >
                        <div className='text-caption text-neutral-medium mb-4dp'>
                          Sélecteur : {node.target.join(', ')}
                        </div>
                        <div className='text-caption font-mono bg-background-primary p-8dp rounded-4dp overflow-x-auto'>
                          {node.html}
                        </div>
                        {node.failureSummary && (
                          <div className='text-caption text-functional-error mt-4dp'>
                            <strong>Raison :</strong> {node.failureSummary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Aucune violation */}
      {results.length === 0 && summary.violations === 0 && !isRunning && (
        <Card className='border-l-4 border-functional-success'>
          <CardHeader>
            <h3 className='text-h3 text-neutral-dark'>
              ✅ Aucune violation d&apos;accessibilité détectée
            </h3>
          </CardHeader>
          <CardContent>
            <p className='text-body text-neutral-medium'>
              Félicitations ! Votre page respecte les critères
              d&apos;accessibilité WCAG 2.1 AA testés.
            </p>
            <div className='mt-16dp p-16dp bg-functional-success text-white rounded-8dp'>
              <h4 className='text-h4 mb-8dp'>Tests réussis :</h4>
              <ul className='space-y-4dp text-body'>
                <li>• Contraste des couleurs (4.5:1 minimum)</li>
                <li>• Navigation par clavier</li>
                <li>• Structure sémantique</li>
                <li>• Labels et descriptions</li>
                <li>• Ordre de focus logique</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations sur l'audit */}
      <Card>
        <CardHeader>
          <h3 className='text-h3 text-neutral-dark'>À propos de cet audit</h3>
        </CardHeader>
        <CardContent className='space-y-16dp'>
          <div>
            <h4 className='text-h4 text-neutral-dark mb-8dp'>
              Critères testés :
            </h4>
            <ul className='space-y-4dp text-body text-neutral-medium'>
              <li>
                • <strong>WCAG 2.1 AA</strong> - Critères de niveau AA
              </li>
              <li>
                • <strong>Contraste des couleurs</strong> - Minimum 4.5:1 pour
                le texte normal
              </li>
              <li>
                • <strong>Navigation par clavier</strong> - Tous les éléments
                interactifs accessibles
              </li>
              <li>
                • <strong>Structure sémantique</strong> - Utilisation appropriée
                des balises HTML
              </li>
              <li>
                • <strong>Labels et descriptions</strong> - Éléments de
                formulaire correctement étiquetés
              </li>
              <li>
                • <strong>Ordre de focus</strong> - Navigation logique et
                prévisible
              </li>
            </ul>
          </div>

          <div>
            <h4 className='text-h4 text-neutral-dark mb-8dp'>Limitations :</h4>
            <ul className='space-y-4dp text-body text-neutral-medium'>
              <li>
                • Les tests automatisés ne couvrent pas tous les aspects de
                l&apos;accessibilité
              </li>
              <li>
                • Les tests manuels avec des lecteurs d&apos;écran sont
                recommandés
              </li>
              <li>• Certains critères nécessitent une évaluation humaine</li>
              <li>• Les tests de contenu dynamique peuvent être incomplets</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
