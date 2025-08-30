/**
 * Système de sécurité renforcé pour NutriSensia
 * Implémente rate limiting, audit logging, monitoring et protection CSRF
 * Basé sur les meilleures pratiques Node.js et Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
// Pour l'Edge Runtime, on utilise l'API Web Crypto au lieu du module Node.js crypto

// Types pour le système de sécurité
export interface SecurityEvent {
  id?: string;
  event_type:
    | 'login_attempt'
    | 'login_success'
    | 'login_failure'
    | 'logout'
    | 'mfa_attempt'
    | 'mfa_success'
    | 'mfa_failure'
    | 'suspicious_activity'
    | 'rate_limit_exceeded'
    | 'password_reset'
    | 'account_locked';
  user_id?: string;
  ip_address: string;
  user_agent: string;
  metadata?: Record<string, any>;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
}

export interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en millisecondes
  maxAttempts: number; // Nombre max de tentatives
  blockDurationMs: number; // Durée de blocage en millisecondes
}

export interface SecurityConfig {
  rateLimits: {
    login: RateLimitConfig;
    mfa: RateLimitConfig;
    passwordReset: RateLimitConfig;
    api: RateLimitConfig;
  };
  sessionTimeout: number; // Timeout de session en millisecondes
  maxFailedAttempts: number; // Nombre max de tentatives avant blocage de compte
  accountLockoutDuration: number; // Durée de blocage de compte
}

// Configuration de sécurité par défaut
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  rateLimits: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
      blockDurationMs: 30 * 60 * 1000, // 30 minutes
    },
    mfa: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      maxAttempts: 3,
      blockDurationMs: 15 * 60 * 1000, // 15 minutes
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 heure
      maxAttempts: 3,
      blockDurationMs: 60 * 60 * 1000, // 1 heure
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 100,
      blockDurationMs: 15 * 60 * 1000, // 15 minutes
    },
  },
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 heures
  maxFailedAttempts: 10,
  accountLockoutDuration: 60 * 60 * 1000, // 1 heure
};

/**
 * Classe principale pour la gestion de la sécurité
 */
export class SecurityManager {
  private supabase: any;
  private config: SecurityConfig;
  private rateLimitStore: Map<
    string,
    { count: number; firstAttempt: number; blockedUntil?: number }
  > = new Map();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: SecurityConfig = DEFAULT_SECURITY_CONFIG
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = config;

    // Note: setInterval n'est pas supporté dans l'Edge Runtime
    // Le nettoyage se fera automatiquement lors des vérifications de rate limit
  }

  /**
   * Génère un nonce cryptographiquement sécurisé pour CSP
   * Compatible avec l'Edge Runtime
   */
  static generateNonce(): string {
    // Utiliser crypto.randomUUID() qui est disponible dans l'Edge Runtime
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return btoa(crypto.randomUUID()).replace(/[/+=]/g, '').substring(0, 16);
    }
    // Fallback pour les environnements sans crypto.randomUUID
    return btoa(Math.random().toString(36) + Date.now().toString(36))
      .replace(/[/+=]/g, '')
      .substring(0, 16);
  }

  /**
   * Génère un token CSRF sécurisé
   * Compatible avec l'Edge Runtime
   */
  static generateCSRFToken(): string {
    // Utiliser l'API Web Crypto disponible dans l'Edge Runtime
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
        ''
      );
    }
    // Fallback moins sécurisé mais compatible
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
    ).join('');
  }

  /**
   * Vérifie le token CSRF
   * Compatible avec l'Edge Runtime
   */
  static verifyCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false;

    try {
      // Comparaison simple mais sécurisée pour l'Edge Runtime
      if (token.length !== sessionToken.length) return false;

      let result = 0;
      for (let i = 0; i < token.length; i++) {
        result |= token.charCodeAt(i) ^ sessionToken.charCodeAt(i);
      }
      return result === 0;
    } catch {
      return false;
    }
  }

  /**
   * Extrait l'adresse IP réelle de la requête
   */
  static extractClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfIP = req.headers.get('cf-connecting-ip');

    if (cfIP) return cfIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();

    return req.ip || 'unknown';
  }

  /**
   * Détecte les activités suspectes basées sur des patterns
   */
  static detectSuspiciousActivity(
    req: NextRequest,
    userAgent?: string
  ): {
    isSuspicious: boolean;
    reasons: string[];
    severity: SecurityEvent['severity'];
  } {
    const reasons: string[] = [];
    let severity: SecurityEvent['severity'] = 'low';

    const ua = userAgent || req.headers.get('user-agent') || '';
    const ip = this.extractClientIP(req);

    // Détection de bots malveillants
    const suspiciousBots = [
      'sqlmap',
      'nmap',
      'masscan',
      'nikto',
      'dirb',
      'gobuster',
    ];
    if (suspiciousBots.some(bot => ua.toLowerCase().includes(bot))) {
      reasons.push('Suspicious bot detected in User-Agent');
      severity = 'high';
    }

    // Détection d'User-Agent suspects
    if (
      !ua ||
      ua.length < 10 ||
      ua.includes('python-requests') ||
      ua.includes('curl/')
    ) {
      reasons.push('Suspicious or missing User-Agent');
      severity = severity === 'high' ? 'high' : 'medium';
    }

    // Détection d'IPs privées ou localhost en production
    if (
      process.env.NODE_ENV === 'production' &&
      (ip.startsWith('127.') ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip === 'unknown')
    ) {
      reasons.push('Request from private/localhost IP in production');
      severity = 'medium';
    }

    // Détection de patterns d'injection
    const pathname = req.nextUrl.pathname;
    const searchParams = req.nextUrl.search;
    const injectionPatterns = [
      /union.*select/i,
      /script.*alert/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /<script/i,
      /eval\(/i,
      /document\.cookie/i,
    ];

    if (
      injectionPatterns.some(pattern => pattern.test(pathname + searchParams))
    ) {
      reasons.push('Potential injection attempt detected');
      severity = 'critical';
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
      severity,
    };
  }

  /**
   * Vérifie le rate limiting pour une clé donnée
   */
  checkRateLimit(
    key: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remainingAttempts: number;
    resetTime: number;
    blockedUntil?: number;
  } {
    const now = Date.now();

    // Nettoyer automatiquement les entrées expirées à chaque vérification
    this.cleanupRateLimitStore();

    const entry = this.rateLimitStore.get(key);

    if (!entry) {
      // Première tentative
      this.rateLimitStore.set(key, {
        count: 1,
        firstAttempt: now,
      });
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
        resetTime: now + config.windowMs,
      };
    }

    // Vérifier si l'utilisateur est actuellement bloqué
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: entry.blockedUntil,
        blockedUntil: entry.blockedUntil,
      };
    }

    // Réinitialiser si la fenêtre de temps est expirée
    if (now - entry.firstAttempt > config.windowMs) {
      this.rateLimitStore.set(key, {
        count: 1,
        firstAttempt: now,
      });
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
        resetTime: now + config.windowMs,
      };
    }

    // Incrémenter le compteur
    entry.count++;

    if (entry.count > config.maxAttempts) {
      // Bloquer l'utilisateur
      entry.blockedUntil = now + config.blockDurationMs;
      this.rateLimitStore.set(key, entry);

      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: entry.blockedUntil,
        blockedUntil: entry.blockedUntil,
      };
    }

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - entry.count,
      resetTime: entry.firstAttempt + config.windowMs,
    };
  }

  /**
   * Nettoie le cache de rate limiting des entrées expirées
   */
  private cleanupRateLimitStore(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitStore.entries()) {
      // Supprimer les entrées expirées (plus anciennes que 24h)
      if (now - entry.firstAttempt > 24 * 60 * 60 * 1000) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Enregistre un événement de sécurité dans la base de données
   */
  async logSecurityEvent(
    event: Omit<SecurityEvent, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        timestamp: new Date().toISOString(),
      };

      // Mode développement : log uniquement dans la console pour éviter les erreurs DB
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Security Event:', {
          type: securityEvent.event_type,
          severity: securityEvent.severity,
          ip: securityEvent.ip_address,
          user: securityEvent.user_id || 'anonymous',
          metadata: securityEvent.metadata,
        });
        return;
      }

      // En production : essayer d'enregistrer dans Supabase
      const { error } = await this.supabase
        .from('security_events')
        .insert(securityEvent);

      if (error) {
        console.error(
          "Erreur lors de l'enregistrement de l'événement de sécurité:",
          error
        );
        // Fallback: log dans la console en cas d'erreur DB
        console.warn('Security Event (fallback):', securityEvent);
      }

      // Alertes pour les événements critiques
      if (event.severity === 'critical' || event.severity === 'high') {
        await this.sendSecurityAlert(securityEvent);
      }
    } catch (error) {
      console.error('Erreur critique lors du logging de sécurité:', error);
    }
  }

  /**
   * Envoie une alerte de sécurité (email, Slack, etc.)
   */
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // TODO: Implémenter l'envoi d'alertes (email, Slack, etc.)
    console.warn('🚨 ALERTE DE SÉCURITÉ:', {
      type: event.event_type,
      severity: event.severity,
      ip: event.ip_address,
      user: event.user_id,
      time: event.timestamp,
      details: event.metadata,
    });

    // En production, envoyer des vraies alertes
    if (process.env.NODE_ENV === 'production') {
      // Exemple d'intégration Slack/Discord/Email
      // await this.sendSlackAlert(event)
      // await this.sendEmailAlert(event)
    }
  }

  /**
   * Vérifie la force d'un mot de passe
   */
  static validatePasswordStrength(password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Le mot de passe doit contenir au moins 8 caractères');

    if (password.length >= 12) score += 1;

    if (/[a-z]/.test(password)) score += 1;
    else
      feedback.push(
        'Le mot de passe doit contenir au moins une lettre minuscule'
      );

    if (/[A-Z]/.test(password)) score += 1;
    else
      feedback.push(
        'Le mot de passe doit contenir au moins une lettre majuscule'
      );

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Le mot de passe doit contenir au moins un chiffre');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else
      feedback.push(
        'Le mot de passe doit contenir au moins un caractère spécial'
      );

    // Vérifier contre les mots de passe communs
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push('Ce mot de passe est trop commun');
    }

    return {
      isStrong: score >= 4,
      score,
      feedback,
    };
  }

  /**
   * Hache un mot de passe de manière sécurisée (pour les logs, pas pour l'auth)
   * Compatible avec l'Edge Runtime
   */
  static async hashForLogging(input: string): Promise<string> {
    const salt = process.env.SECURITY_SALT || 'default-salt';
    const data = new TextEncoder().encode(input + salt);

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Utiliser l'API Web Crypto SubtleCrypto
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = new Uint8Array(hashBuffer);
      return Array.from(hashArray, byte => byte.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 16);
    }

    // Fallback simple pour les environnements sans crypto.subtle
    let hash = 0;
    const str = input + salt;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0').substring(0, 16);
  }

  /**
   * Vérifie l'intégrité d'une session
   */
  async verifySessionIntegrity(
    sessionToken: string,
    userAgent: string,
    ip: string
  ): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    try {
      // Décoder le JWT sans vérification de signature pour extraire les claims
      const payload = JSON.parse(atob(sessionToken.split('.')[1]));

      // Vérifier l'expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return { valid: false, reason: 'Session expirée' };
      }

      // Vérifier l'émetteur
      if (payload.iss !== 'supabase') {
        return { valid: false, reason: 'Émetteur de session invalide' };
      }

      // Vérifier l'audience
      if (!payload.aud || !['authenticated', 'anon'].includes(payload.aud)) {
        return { valid: false, reason: 'Audience de session invalide' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Format de session invalide' };
    }
  }
}

/**
 * Instance globale du gestionnaire de sécurité
 */
let securityManager: SecurityManager | null = null;

export function getSecurityManager(): SecurityManager {
  if (!securityManager) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    securityManager = new SecurityManager(supabaseUrl, supabaseKey);
  }
  return securityManager;
}

/**
 * Middleware de sécurité pour les routes API
 */
export function securityMiddleware(config?: Partial<SecurityConfig>) {
  const finalConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  const manager = getSecurityManager();

  return async (req: NextRequest) => {
    const ip = SecurityManager.extractClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const pathname = req.nextUrl.pathname;

    // Vérifier l'activité suspecte
    const suspiciousCheck = SecurityManager.detectSuspiciousActivity(
      req,
      userAgent
    );
    if (suspiciousCheck.isSuspicious) {
      await manager.logSecurityEvent({
        event_type: 'suspicious_activity',
        ip_address: ip,
        user_agent: userAgent,
        severity: suspiciousCheck.severity,
        metadata: {
          reasons: suspiciousCheck.reasons,
          pathname,
          method: req.method,
        },
      });

      // Bloquer les activités critiques
      if (suspiciousCheck.severity === 'critical') {
        return new Response(JSON.stringify({ error: 'Accès refusé' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Vérifier le rate limiting pour les API
    const rateLimitKey = `api:${ip}`;
    const rateLimit = manager.checkRateLimit(
      rateLimitKey,
      finalConfig.rateLimits.api
    );

    if (!rateLimit.allowed) {
      await manager.logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        ip_address: ip,
        user_agent: userAgent,
        severity: 'medium',
        metadata: {
          pathname,
          method: req.method,
          blockedUntil: rateLimit.blockedUntil,
        },
      });

      return new Response(
        JSON.stringify({
          error: 'Trop de requêtes',
          resetTime: rateLimit.resetTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(
              (rateLimit.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    return null; // Continuer le traitement
  };
}
