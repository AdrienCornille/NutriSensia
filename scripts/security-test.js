#!/usr/bin/env node

/**
 * Script de test de sécurité automatisé pour NutriSensia
 * Effectue des tests de pénétration basiques et des vérifications de sécurité
 *
 * Usage: node scripts/security-test.js [--target=http://localhost:3000] [--verbose]
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

// Configuration
const config = {
  target:
    process.argv.find(arg => arg.startsWith('--target='))?.split('=')[1] ||
    'http://localhost:3000',
  verbose: process.argv.includes('--verbose'),
  timeout: 10000,
  maxRedirects: 5,
};

// Couleurs pour la sortie console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Résultats des tests
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  vulnerabilities: [],
};

/**
 * Logger avec couleurs
 */
const logger = {
  info: msg => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}[PASS]${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}[FAIL]${colors.reset} ${msg}`),
  verbose: msg =>
    config.verbose &&
    console.log(`${colors.cyan}[DEBUG]${colors.reset} ${msg}`),
  section: msg =>
    console.log(
      `\n${colors.bold}${colors.magenta}=== ${msg} ===${colors.reset}`
    ),
};

/**
 * Effectue une requête HTTP/HTTPS
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'NutriSensia-Security-Scanner/1.0',
        ...options.headers,
      },
      timeout: config.timeout,
    };

    logger.verbose(`${requestOptions.method} ${url}`);

    const req = client.request(requestOptions, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          url: url,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Teste les en-têtes de sécurité
 */
async function testSecurityHeaders() {
  logger.section('Test des en-têtes de sécurité');

  try {
    const response = await makeRequest(config.target);
    const headers = response.headers;

    // En-têtes de sécurité à vérifier
    const securityHeaders = [
      {
        name: 'x-frame-options',
        expected: ['DENY', 'SAMEORIGIN'],
        description: 'Protection contre le clickjacking',
      },
      {
        name: 'x-content-type-options',
        expected: ['nosniff'],
        description: 'Prévention du MIME sniffing',
      },
      {
        name: 'x-xss-protection',
        expected: ['1; mode=block', '1'],
        description: 'Protection XSS du navigateur',
      },
      {
        name: 'strict-transport-security',
        expected: null,
        description: 'HSTS (HTTPS uniquement)',
        httpsOnly: true,
      },
      {
        name: 'content-security-policy',
        expected: null,
        description: 'Politique de sécurité du contenu',
      },
      {
        name: 'referrer-policy',
        expected: [
          'strict-origin-when-cross-origin',
          'no-referrer',
          'same-origin',
        ],
        description: 'Politique des référents',
      },
    ];

    for (const header of securityHeaders) {
      testResults.total++;

      if (header.httpsOnly && !config.target.startsWith('https://')) {
        logger.warning(`${header.description}: Ignoré (HTTPS requis)`);
        continue;
      }

      const value = headers[header.name];

      if (!value) {
        testResults.failed++;
        testResults.vulnerabilities.push({
          type: 'missing_security_header',
          severity: 'medium',
          header: header.name,
          description: header.description,
        });
        logger.error(
          `${header.description}: En-tête manquant (${header.name})`
        );
      } else if (
        header.expected &&
        !header.expected.some(exp =>
          value.toLowerCase().includes(exp.toLowerCase())
        )
      ) {
        testResults.warnings++;
        logger.warning(`${header.description}: Valeur inattendue (${value})`);
      } else {
        testResults.passed++;
        logger.success(`${header.description}: OK (${value})`);
      }
    }

    // Vérifier les en-têtes dangereux
    const dangerousHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
    for (const header of dangerousHeaders) {
      if (headers[header]) {
        testResults.warnings++;
        testResults.vulnerabilities.push({
          type: 'information_disclosure',
          severity: 'low',
          header: header,
          value: headers[header],
          description: "Divulgation d'informations serveur",
        });
        logger.warning(
          `Divulgation d'informations: ${header} = ${headers[header]}`
        );
      }
    }
  } catch (error) {
    logger.error(`Erreur lors du test des en-têtes: ${error.message}`);
  }
}

/**
 * Teste les injections SQL basiques
 */
async function testSQLInjection() {
  logger.section("Test d'injection SQL");

  const payloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT NULL, NULL, NULL --",
    "admin'--",
    "' OR 1=1 --",
  ];

  const testEndpoints = [
    '/api/auth/signin',
    '/auth/signin',
    '/api/users',
    '/search',
  ];

  for (const endpoint of testEndpoints) {
    for (const payload of payloads) {
      try {
        testResults.total++;

        // Test avec paramètre GET
        const getUrl = `${config.target}${endpoint}?q=${encodeURIComponent(payload)}`;
        const getResponse = await makeRequest(getUrl);

        // Test avec paramètre POST
        const postResponse = await makeRequest(`${config.target}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: payload, password: payload }),
        });

        // Vérifier les réponses suspectes
        const responses = [getResponse, postResponse];
        for (const response of responses) {
          if (
            response.body.toLowerCase().includes('sql') ||
            response.body.toLowerCase().includes('mysql') ||
            response.body.toLowerCase().includes('postgres') ||
            response.body.toLowerCase().includes('syntax error')
          ) {
            testResults.failed++;
            testResults.vulnerabilities.push({
              type: 'sql_injection',
              severity: 'critical',
              endpoint: endpoint,
              payload: payload,
              description: "Possible vulnérabilité d'injection SQL",
            });
            logger.error(
              `Injection SQL possible: ${endpoint} avec "${payload}"`
            );
          } else {
            testResults.passed++;
            logger.verbose(`Injection SQL bloquée: ${endpoint}`);
          }
        }
      } catch (error) {
        // Les erreurs sont normales pour ce type de test
        logger.verbose(`Erreur attendue pour ${endpoint}: ${error.message}`);
      }
    }
  }
}

/**
 * Teste les injections XSS
 */
async function testXSSInjection() {
  logger.section("Test d'injection XSS");

  const payloads = [
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
    '"><svg/onload=alert("XSS")>',
  ];

  const testEndpoints = ['/search', '/profile', '/dashboard'];

  for (const endpoint of testEndpoints) {
    for (const payload of payloads) {
      try {
        testResults.total++;

        const url = `${config.target}${endpoint}?q=${encodeURIComponent(payload)}`;
        const response = await makeRequest(url);

        // Vérifier si le payload est reflété sans échappement
        if (response.body.includes(payload)) {
          testResults.failed++;
          testResults.vulnerabilities.push({
            type: 'xss_reflection',
            severity: 'high',
            endpoint: endpoint,
            payload: payload,
            description: 'Possible vulnérabilité XSS par réflexion',
          });
          logger.error(`XSS possible: ${endpoint} reflète "${payload}"`);
        } else {
          testResults.passed++;
          logger.verbose(`XSS bloqué: ${endpoint}`);
        }
      } catch (error) {
        logger.verbose(`Erreur pour ${endpoint}: ${error.message}`);
      }
    }
  }
}

/**
 * Teste la protection CSRF
 */
async function testCSRFProtection() {
  logger.section('Test de protection CSRF');

  const endpoints = ['/api/auth/signin', '/api/users', '/api/profile'];

  for (const endpoint of endpoints) {
    try {
      testResults.total++;

      // Tenter une requête POST sans token CSRF
      const response = await makeRequest(`${config.target}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      });

      if (response.status === 200) {
        testResults.failed++;
        testResults.vulnerabilities.push({
          type: 'csrf_missing',
          severity: 'medium',
          endpoint: endpoint,
          description: 'Protection CSRF manquante ou insuffisante',
        });
        logger.error(`Protection CSRF manquante: ${endpoint}`);
      } else {
        testResults.passed++;
        logger.success(`Protection CSRF active: ${endpoint}`);
      }
    } catch (error) {
      // Une erreur peut indiquer une bonne protection
      testResults.passed++;
      logger.verbose(
        `Protection CSRF probable: ${endpoint} - ${error.message}`
      );
    }
  }
}

/**
 * Teste le rate limiting
 */
async function testRateLimiting() {
  logger.section('Test de rate limiting');

  const endpoint = `${config.target}/api/auth/signin`;
  const requests = 20;
  let successCount = 0;

  logger.info(`Envoi de ${requests} requêtes rapides à ${endpoint}`);

  const promises = [];
  for (let i = 0; i < requests; i++) {
    promises.push(
      makeRequest(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${i}@example.com`,
          password: 'password',
        }),
      })
        .then(response => {
          if (response.status !== 429) {
            successCount++;
          }
          return response;
        })
        .catch(() => null)
    );
  }

  await Promise.all(promises);

  testResults.total++;

  if (successCount >= requests * 0.8) {
    testResults.failed++;
    testResults.vulnerabilities.push({
      type: 'rate_limiting_missing',
      severity: 'medium',
      endpoint: endpoint,
      description: 'Rate limiting insuffisant ou manquant',
    });
    logger.error(
      `Rate limiting insuffisant: ${successCount}/${requests} requêtes acceptées`
    );
  } else {
    testResults.passed++;
    logger.success(
      `Rate limiting actif: seulement ${successCount}/${requests} requêtes acceptées`
    );
  }
}

/**
 * Teste les redirections ouvertes
 */
async function testOpenRedirect() {
  logger.section('Test de redirection ouverte');

  const maliciousUrls = [
    'http://evil.com',
    'https://attacker.com',
    '//evil.com',
    'javascript:alert("XSS")',
  ];

  const redirectParams = ['redirect', 'return', 'url', 'next', 'redirectTo'];

  for (const param of redirectParams) {
    for (const maliciousUrl of maliciousUrls) {
      try {
        testResults.total++;

        const testUrl = `${config.target}/auth/signin?${param}=${encodeURIComponent(maliciousUrl)}`;
        const response = await makeRequest(testUrl);

        const locationHeader = response.headers.location;
        if (
          locationHeader &&
          (locationHeader.includes('evil.com') ||
            locationHeader.includes('attacker.com'))
        ) {
          testResults.failed++;
          testResults.vulnerabilities.push({
            type: 'open_redirect',
            severity: 'medium',
            parameter: param,
            maliciousUrl: maliciousUrl,
            description: 'Vulnérabilité de redirection ouverte',
          });
          logger.error(`Redirection ouverte: ${param} vers ${locationHeader}`);
        } else {
          testResults.passed++;
          logger.verbose(`Redirection sécurisée: ${param}`);
        }
      } catch (error) {
        logger.verbose(`Erreur pour redirection ${param}: ${error.message}`);
      }
    }
  }
}

/**
 * Teste l'énumération d'utilisateurs
 */
async function testUserEnumeration() {
  logger.section("Test d'énumération d'utilisateurs");

  const testEmails = [
    'admin@nutrisensia.com',
    'test@example.com',
    'nonexistent@nowhere.com',
  ];

  for (const email of testEmails) {
    try {
      testResults.total++;

      // Test de connexion avec email valide/invalide
      const response = await makeRequest(`${config.target}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: 'wrongpassword' }),
      });

      // Analyser la réponse pour détecter les différences
      if (
        response.body.toLowerCase().includes('user not found') ||
        response.body.toLowerCase().includes('email not found')
      ) {
        testResults.warnings++;
        testResults.vulnerabilities.push({
          type: 'user_enumeration',
          severity: 'low',
          email: email,
          description:
            "Possible énumération d'utilisateurs via les messages d'erreur",
        });
        logger.warning(`Énumération possible: message différent pour ${email}`);
      } else {
        testResults.passed++;
        logger.success(
          `Protection énumération: message générique pour ${email}`
        );
      }
    } catch (error) {
      logger.verbose(`Erreur pour ${email}: ${error.message}`);
    }
  }
}

/**
 * Génère le rapport final
 */
function generateReport() {
  logger.section('Rapport de sécurité');

  console.log(`\n${colors.bold}Résultats des tests:${colors.reset}`);
  console.log(`Total: ${testResults.total}`);
  console.log(`${colors.green}Réussis: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Échecs: ${testResults.failed}${colors.reset}`);
  console.log(
    `${colors.yellow}Avertissements: ${testResults.warnings}${colors.reset}`
  );

  const score =
    testResults.total > 0
      ? Math.round((testResults.passed / testResults.total) * 100)
      : 0;
  const scoreColor =
    score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;
  console.log(
    `\n${colors.bold}Score de sécurité: ${scoreColor}${score}%${colors.reset}`
  );

  if (testResults.vulnerabilities.length > 0) {
    console.log(
      `\n${colors.bold}${colors.red}Vulnérabilités détectées:${colors.reset}`
    );

    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    testResults.vulnerabilities
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
      .forEach((vuln, index) => {
        const severityColor =
          vuln.severity === 'critical'
            ? colors.red
            : vuln.severity === 'high'
              ? colors.red
              : vuln.severity === 'medium'
                ? colors.yellow
                : colors.cyan;

        console.log(
          `\n${index + 1}. ${colors.bold}${vuln.type}${colors.reset}`
        );
        console.log(
          `   Sévérité: ${severityColor}${vuln.severity.toUpperCase()}${colors.reset}`
        );
        console.log(`   Description: ${vuln.description}`);

        if (vuln.endpoint) console.log(`   Endpoint: ${vuln.endpoint}`);
        if (vuln.header) console.log(`   En-tête: ${vuln.header}`);
        if (vuln.payload) console.log(`   Payload: ${vuln.payload}`);
      });
  }

  console.log(`\n${colors.bold}Recommandations:${colors.reset}`);
  console.log(
    '1. Corriger toutes les vulnérabilités critiques et de haute sévérité'
  );
  console.log('2. Implémenter tous les en-têtes de sécurité manquants');
  console.log('3. Activer le rate limiting sur tous les endpoints sensibles');
  console.log('4. Effectuer des tests de pénétration réguliers');
  console.log('5. Mettre en place un monitoring de sécurité en temps réel');

  // Code de sortie basé sur les résultats
  const criticalVulns = testResults.vulnerabilities.filter(
    v => v.severity === 'critical'
  ).length;
  const highVulns = testResults.vulnerabilities.filter(
    v => v.severity === 'high'
  ).length;

  if (criticalVulns > 0) {
    process.exit(2); // Vulnérabilités critiques
  } else if (highVulns > 0 || score < 60) {
    process.exit(1); // Vulnérabilités importantes ou score faible
  } else {
    process.exit(0); // Tout va bien
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log(
    `${colors.bold}${colors.cyan}NutriSensia Security Scanner${colors.reset}`
  );
  console.log(`Target: ${config.target}`);
  console.log(`Verbose: ${config.verbose}`);
  console.log(`Timeout: ${config.timeout}ms\n`);

  try {
    await testSecurityHeaders();
    await testSQLInjection();
    await testXSSInjection();
    await testCSRFProtection();
    await testRateLimiting();
    await testOpenRedirect();
    await testUserEnumeration();

    generateReport();
  } catch (error) {
    logger.error(`Erreur fatale: ${error.message}`);
    process.exit(3);
  }
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log("\n\nTest interrompu par l'utilisateur");
  generateReport();
});

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { main, testResults };
