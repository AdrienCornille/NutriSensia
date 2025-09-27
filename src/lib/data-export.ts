/**
 * Utilitaires d'export et de portabilité des données conformes au RGPD
 * 
 * Ce module fournit des fonctionnalités pour :
 * - Export des données utilisateur (JSON, CSV, XML)
 * - Conformité RGPD (droit à la portabilité)
 * - Chiffrement et sécurisation des exports
 * - Historique et audit des exports
 * - Import de données pour migration
 */

import { supabase } from '@/lib/supabase';
import type { 
  NutritionistProfile, 
  PatientProfile, 
  UserRole 
} from '@/lib/database-types';

/**
 * Types pour l'export de données
 */
export interface ExportOptions {
  /** Format d'export souhaité */
  format: 'json' | 'csv' | 'xml';
  /** Sections à inclure dans l'export */
  sections: ExportSection[];
  /** Inclure les métadonnées système */
  includeMetadata?: boolean;
  /** Chiffrer l'export */
  encrypt?: boolean;
  /** Mot de passe pour le chiffrement */
  password?: string;
  /** Inclure les fichiers attachés (avatars, etc.) */
  includeFiles?: boolean;
}

export type ExportSection = 
  | 'profile'           // Données de profil de base
  | 'professional'      // Informations professionnelles (nutritionnistes)
  | 'medical'          // Informations médicales (patients)
  | 'preferences'      // Préférences utilisateur
  | 'activity'         // Historique d'activité
  | 'files'           // Fichiers uploadés
  | 'privacy'         // Paramètres de confidentialité
  | 'subscription'    // Informations d'abonnement
  | 'audit';          // Logs d'audit

/**
 * Résultat d'un export
 */
export interface ExportResult {
  /** ID unique de l'export */
  exportId: string;
  /** Timestamp de création */
  createdAt: Date;
  /** Taille du fichier en octets */
  fileSize: number;
  /** URL de téléchargement (temporaire) */
  downloadUrl: string;
  /** Hash de vérification d'intégrité */
  checksum: string;
  /** Date d'expiration du lien */
  expiresAt: Date;
  /** Format de l'export */
  format: string;
  /** Sections incluses */
  sections: ExportSection[];
  /** Chiffré ou non */
  encrypted: boolean;
}

/**
 * Historique d'export pour l'audit
 */
export interface ExportHistoryEntry {
  id: string;
  userId: string;
  exportId: string;
  requestedAt: Date;
  completedAt: Date | null;
  format: string;
  sections: ExportSection[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  fileSize?: number;
  downloadCount: number;
  lastDownloadAt?: Date;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  error?: string;
}

/**
 * Configuration pour l'import de données
 */
export interface ImportOptions {
  /** Format du fichier d'import */
  format: 'json' | 'csv';
  /** Stratégie en cas de conflit */
  conflictStrategy: 'overwrite' | 'merge' | 'skip';
  /** Valider les données avant import */
  validate?: boolean;
  /** Créer une sauvegarde avant import */
  createBackup?: boolean;
}

/**
 * Classe principale pour l'export de données
 */
export class DataExportService {
  private userId: string;
  private userRole: UserRole;

  constructor(userId: string, userRole: UserRole) {
    this.userId = userId;
    this.userRole = userRole;
  }

  /**
   * Exporte toutes les données utilisateur selon les options spécifiées
   */
  async exportUserData(options: ExportOptions): Promise<ExportResult> {
    // Générer un ID unique pour cet export
    const exportId = `export_${this.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Enregistrer la demande d'export dans l'historique
      await this.logExportRequest(exportId, options);

      // Collecter toutes les données demandées
      const exportData = await this.collectUserData(options.sections);

      // Formatter selon le format demandé
      const formattedData = await this.formatData(exportData, options.format, options.includeMetadata);

      // Chiffrer si demandé
      const finalData = options.encrypt && options.password
        ? await this.encryptData(formattedData, options.password)
        : formattedData;

      // Générer le fichier et l'uploader
      const result = await this.createExportFile(exportId, finalData, options);

      // Mettre à jour l'historique
      await this.updateExportStatus(exportId, 'completed', result);

      return result;

    } catch (error) {
      // Enregistrer l'erreur
      await this.updateExportStatus(exportId, 'failed', undefined, error.message);
      throw new Error(`Erreur lors de l'export des données: ${error.message}`);
    }
  }

  /**
   * Collecte toutes les données utilisateur selon les sections demandées
   */
  private async collectUserData(sections: ExportSection[]): Promise<Record<string, any>> {
    const data: Record<string, any> = {};

    // Données de profil de base
    if (sections.includes('profile')) {
      data.profile = await this.getProfileData();
    }

    // Informations professionnelles (nutritionnistes)
    if (sections.includes('professional') && this.userRole === 'nutritionist') {
      data.professional = await this.getProfessionalData();
    }

    // Informations médicales (patients)
    if (sections.includes('medical') && this.userRole === 'patient') {
      data.medical = await this.getMedicalData();
    }

    // Préférences utilisateur
    if (sections.includes('preferences')) {
      data.preferences = await this.getPreferencesData();
    }

    // Historique d'activité
    if (sections.includes('activity')) {
      data.activity = await this.getActivityData();
    }

    // Fichiers uploadés
    if (sections.includes('files')) {
      data.files = await this.getFilesData();
    }

    // Paramètres de confidentialité
    if (sections.includes('privacy')) {
      data.privacy = await this.getPrivacySettings();
    }

    // Informations d'abonnement
    if (sections.includes('subscription')) {
      data.subscription = await this.getSubscriptionData();
    }

    // Logs d'audit
    if (sections.includes('audit')) {
      data.audit = await this.getAuditLogs();
    }

    return data;
  }

  /**
   * Récupère les données de profil de base
   */
  private async getProfileData() {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (error) throw error;
    return this.sanitizeData(profile);
  }

  /**
   * Récupère les données professionnelles (nutritionnistes)
   */
  private async getProfessionalData() {
    const { data: professional, error } = await supabase
      .from('nutritionists')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return professional ? this.sanitizeData(professional) : null;
  }

  /**
   * Récupère les données médicales (patients)
   */
  private async getMedicalData() {
    const { data: medical, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return medical ? this.sanitizeData(medical) : null;
  }

  /**
   * Récupère les préférences utilisateur
   */
  private async getPreferencesData() {
    // Récupérer depuis les tables de préférences si elles existent
    // Pour l'instant, retourner les préférences stockées dans le profil
    const profileData = await this.getProfileData();
    return {
      locale: profileData?.locale,
      timezone: profileData?.timezone,
      notification_preferences: profileData?.notification_preferences || {}
    };
  }

  /**
   * Récupère l'historique d'activité
   */
  private async getActivityData() {
    // Récupérer les logs d'activité, connexions, etc.
    // Pour l'instant, retourner les informations de base
    const profileData = await this.getProfileData();
    return {
      created_at: profileData?.created_at,
      updated_at: profileData?.updated_at,
      last_sign_in_at: profileData?.last_sign_in_at,
      // Ajouter d'autres données d'activité selon les tables disponibles
    };
  }

  /**
   * Récupère les informations sur les fichiers
   */
  private async getFilesData() {
    const files = [];
    
    // Récupérer l'avatar si présent
    const profileData = await this.getProfileData();
    if (profileData?.avatar_url) {
      files.push({
        type: 'avatar',
        url: profileData.avatar_url,
        uploaded_at: profileData.updated_at
      });
    }

    // Récupérer d'autres fichiers depuis Supabase Storage
    const { data: storageFiles, error } = await supabase.storage
      .from('avatars')
      .list(`${this.userId}/`);

    if (!error && storageFiles) {
      storageFiles.forEach(file => {
        files.push({
          type: 'storage',
          name: file.name,
          size: file.metadata?.size,
          uploaded_at: file.created_at,
          path: `${this.userId}/${file.name}`
        });
      });
    }

    return files;
  }

  /**
   * Récupère les paramètres de confidentialité
   */
  private async getPrivacySettings() {
    // Récupérer les paramètres de confidentialité depuis la base
    // Pour l'instant, retourner des valeurs par défaut
    return {
      profile_visibility: 'professionals_only',
      contact_permissions: {
        allow_direct_contact: true,
        allow_appointment_requests: true
      },
      data_sharing: {
        allow_analytics: true,
        allow_research_participation: false
      }
    };
  }

  /**
   * Récupère les informations d'abonnement
   */
  private async getSubscriptionData() {
    const profileData = await this.getProfileData();
    if (this.userRole === 'patient') {
      const medicalData = await this.getMedicalData();
      return {
        subscription_tier: medicalData?.subscription_tier,
        subscription_status: medicalData?.subscription_status,
        subscription_start_date: medicalData?.subscription_start_date,
        subscription_end_date: medicalData?.subscription_end_date,
        package_credits: medicalData?.package_credits
      };
    }
    return null;
  }

  /**
   * Récupère les logs d'audit
   */
  private async getAuditLogs() {
    // Récupérer les logs d'audit depuis une table dédiée
    // Pour l'instant, retourner l'historique d'export
    return await this.getExportHistory();
  }

  /**
   * Sanitise les données en retirant les informations sensibles
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    const sanitized = { ...data };
    
    // Retirer les champs sensibles système
    delete sanitized.password;
    delete sanitized.password_hash;
    delete sanitized.salt;
    delete sanitized.session_token;
    delete sanitized.reset_token;

    return sanitized;
  }

  /**
   * Formate les données selon le format demandé
   */
  private async formatData(
    data: Record<string, any>, 
    format: 'json' | 'csv' | 'xml',
    includeMetadata: boolean = true
  ): Promise<string> {
    // Ajouter les métadonnées si demandé
    if (includeMetadata) {
      data._metadata = {
        export_version: '1.0',
        exported_at: new Date().toISOString(),
        user_id: this.userId,
        user_role: this.userRole,
        gdpr_compliant: true,
        data_retention_policy: 'https://nutrisensia.com/privacy',
        contact_info: 'privacy@nutrisensia.com'
      };
    }

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      
      case 'csv':
        return this.convertToCSV(data);
      
      case 'xml':
        return this.convertToXML(data);
      
      default:
        throw new Error(`Format non supporté: ${format}`);
    }
  }

  /**
   * Convertit les données en format CSV
   */
  private convertToCSV(data: Record<string, any>): string {
    const csvLines: string[] = [];
    
    // En-tête CSV
    csvLines.push('Section,Field,Value,Type');
    
    // Parcourir récursivement les données
    const flattenData = (obj: any, prefix: string = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flattenData(value, fullKey);
        } else {
          const csvValue = Array.isArray(value) 
            ? `"${value.join(', ')}"` 
            : `"${String(value || '').replace(/"/g, '""')}"`;
          
          csvLines.push(`"${prefix || 'root'}","${key}",${csvValue},"${typeof value}"`);
        }
      });
    };

    flattenData(data);
    return csvLines.join('\n');
  }

  /**
   * Convertit les données en format XML
   */
  private convertToXML(data: Record<string, any>): string {
    const xmlLines: string[] = [];
    xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlLines.push('<user_data>');
    
    const convertToXMLRecursive = (obj: any, depth: number = 1) => {
      const indent = '  '.repeat(depth);
      
      Object.entries(obj).forEach(([key, value]) => {
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          xmlLines.push(`${indent}<${safeKey}>`);
          convertToXMLRecursive(value, depth + 1);
          xmlLines.push(`${indent}</${safeKey}>`);
        } else if (Array.isArray(value)) {
          xmlLines.push(`${indent}<${safeKey}>`);
          value.forEach((item, index) => {
            xmlLines.push(`${indent}  <item index="${index}">${this.escapeXML(String(item))}</item>`);
          });
          xmlLines.push(`${indent}</${safeKey}>`);
        } else {
          xmlLines.push(`${indent}<${safeKey}>${this.escapeXML(String(value || ''))}</${safeKey}>`);
        }
      });
    };

    convertToXMLRecursive(data);
    xmlLines.push('</user_data>');
    return xmlLines.join('\n');
  }

  /**
   * Échappe les caractères spéciaux XML
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Chiffre les données avec un mot de passe
   */
  private async encryptData(data: string, password: string): Promise<string> {
    // Implémentation basique du chiffrement
    // En production, utiliser une vraie bibliothèque de chiffrement
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    // Retourner IV + données chiffrées en base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Crée le fichier d'export et retourne les informations
   */
  private async createExportFile(
    exportId: string, 
    data: string, 
    options: ExportOptions
  ): Promise<ExportResult> {
    // Calculer la taille et le checksum
    const fileSize = new Blob([data]).size;
    const checksum = await this.calculateChecksum(data);
    
    // Générer le nom de fichier
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = options.format;
    const fileName = `nutrisensia_export_${this.userId}_${timestamp}.${extension}`;
    
    // Upload vers Supabase Storage
    const { data: uploadData, error } = await supabase.storage
      .from('exports')
      .upload(`${this.userId}/${exportId}/${fileName}`, data, {
        contentType: this.getContentType(options.format),
        metadata: {
          exportId,
          userId: this.userId,
          sections: options.sections.join(','),
          encrypted: options.encrypt?.toString() || 'false'
        }
      });

    if (error) throw error;

    // Générer une URL de téléchargement signée (valide 7 jours)
    const expiresIn = 7 * 24 * 60 * 60; // 7 jours en secondes
    const { data: signedUrl } = await supabase.storage
      .from('exports')
      .createSignedUrl(`${this.userId}/${exportId}/${fileName}`, expiresIn);

    return {
      exportId,
      createdAt: new Date(),
      fileSize,
      downloadUrl: signedUrl?.signedUrl || '',
      checksum,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      format: options.format,
      sections: options.sections,
      encrypted: options.encrypt || false
    };
  }

  /**
   * Calcule un checksum SHA-256 des données
   */
  private async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Retourne le type MIME selon le format
   */
  private getContentType(format: string): string {
    switch (format) {
      case 'json': return 'application/json';
      case 'csv': return 'text/csv';
      case 'xml': return 'application/xml';
      default: return 'application/octet-stream';
    }
  }

  /**
   * Enregistre une demande d'export dans l'historique
   */
  private async logExportRequest(exportId: string, options: ExportOptions) {
    // En production, enregistrer dans une table d'audit dédiée
    console.log(`Export request logged: ${exportId}`, {
      userId: this.userId,
      format: options.format,
      sections: options.sections,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Met à jour le statut d'un export
   */
  private async updateExportStatus(
    exportId: string, 
    status: string, 
    result?: ExportResult,
    error?: string
  ) {
    // En production, mettre à jour la table d'audit
    console.log(`Export status updated: ${exportId}`, {
      status,
      result: result ? 'success' : 'error',
      error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Récupère l'historique des exports pour cet utilisateur
   */
  async getExportHistory(): Promise<ExportHistoryEntry[]> {
    // En production, récupérer depuis une table d'historique
    // Pour l'instant, retourner un exemple
    return [
      {
        id: '1',
        userId: this.userId,
        exportId: 'export_example_1',
        requestedAt: new Date(Date.now() - 86400000), // Il y a 1 jour
        completedAt: new Date(Date.now() - 86400000 + 30000), // 30 secondes après
        format: 'json',
        sections: ['profile', 'preferences'],
        status: 'completed',
        fileSize: 2048,
        downloadCount: 1,
        lastDownloadAt: new Date(Date.now() - 86400000 + 60000),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        expiresAt: new Date(Date.now() + 6 * 86400000) // Dans 6 jours
      }
    ];
  }

  /**
   * Supprime les exports expirés
   */
  async cleanupExpiredExports(): Promise<number> {
    // En production, supprimer les fichiers expirés du stockage
    // et nettoyer la base de données
    console.log('Cleanup expired exports for user:', this.userId);
    return 0;
  }
}

/**
 * Fonctions utilitaires pour l'import de données
 */
export class DataImportService {
  private userId: string;
  private userRole: UserRole;

  constructor(userId: string, userRole: UserRole) {
    this.userId = userId;
    this.userRole = userRole;
  }

  /**
   * Importe des données depuis un fichier d'export
   */
  async importUserData(fileContent: string, options: ImportOptions): Promise<void> {
    try {
      // Créer une sauvegarde si demandé
      if (options.createBackup) {
        const exportService = new DataExportService(this.userId, this.userRole);
        await exportService.exportUserData({
          format: 'json',
          sections: ['profile', 'professional', 'medical', 'preferences'],
          includeMetadata: true
        });
      }

      // Parser les données selon le format
      const importData = this.parseImportData(fileContent, options.format);

      // Valider les données si demandé
      if (options.validate) {
        await this.validateImportData(importData);
      }

      // Importer les données selon la stratégie de conflit
      await this.processImportData(importData, options.conflictStrategy);

    } catch (error) {
      throw new Error(`Erreur lors de l'import: ${error.message}`);
    }
  }

  /**
   * Parse les données d'import selon le format
   */
  private parseImportData(content: string, format: 'json' | 'csv'): any {
    switch (format) {
      case 'json':
        return JSON.parse(content);
      case 'csv':
        // Implémentation basique du parsing CSV
        // En production, utiliser une vraie bibliothèque CSV
        throw new Error('Import CSV pas encore implémenté');
      default:
        throw new Error(`Format d'import non supporté: ${format}`);
    }
  }

  /**
   * Valide les données d'import
   */
  private async validateImportData(data: any): Promise<void> {
    // Vérifier la structure et les types
    if (!data || typeof data !== 'object') {
      throw new Error('Données d\'import invalides');
    }

    // Vérifier la compatibilité avec le rôle utilisateur
    if (this.userRole === 'nutritionist' && !data.professional) {
      console.warn('Données professionnelles manquantes pour un nutritionniste');
    }

    if (this.userRole === 'patient' && !data.medical) {
      console.warn('Données médicales manquantes pour un patient');
    }
  }

  /**
   * Traite l'import selon la stratégie de conflit
   */
  private async processImportData(data: any, strategy: 'overwrite' | 'merge' | 'skip'): Promise<void> {
    // Récupérer les données actuelles
    const exportService = new DataExportService(this.userId, this.userRole);
    const currentData = await exportService.collectUserData(['profile', 'professional', 'medical', 'preferences']);

    // Appliquer la stratégie
    switch (strategy) {
      case 'overwrite':
        await this.overwriteData(data);
        break;
      case 'merge':
        await this.mergeData(currentData, data);
        break;
      case 'skip':
        await this.skipConflictingData(currentData, data);
        break;
    }
  }

  private async overwriteData(data: any): Promise<void> {
    // Remplacer toutes les données
    if (data.profile) {
      await this.updateProfile(data.profile);
    }
    // Ajouter d'autres sections selon les besoins
  }

  private async mergeData(current: any, imported: any): Promise<void> {
    // Fusionner les données intelligemment
    const merged = { ...current, ...imported };
    await this.overwriteData(merged);
  }

  private async skipConflictingData(current: any, imported: any): Promise<void> {
    // Importer seulement les nouvelles données
    const toImport = { ...imported };
    
    // Retirer les données qui existent déjà
    Object.keys(current).forEach(key => {
      if (current[key] && toImport[key]) {
        delete toImport[key];
      }
    });

    await this.overwriteData(toImport);
  }

  private async updateProfile(profileData: any): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', this.userId);

    if (error) throw error;
  }
}

/**
 * Fonctions utilitaires publiques
 */
export const dataExportUtils = {
  /**
   * Crée une instance du service d'export pour un utilisateur
   */
  createExportService: (userId: string, userRole: UserRole) => 
    new DataExportService(userId, userRole),

  /**
   * Crée une instance du service d'import pour un utilisateur
   */
  createImportService: (userId: string, userRole: UserRole) => 
    new DataImportService(userId, userRole),

  /**
   * Valide les options d'export
   */
  validateExportOptions: (options: ExportOptions): string[] => {
    const errors: string[] = [];

    if (!options.format || !['json', 'csv', 'xml'].includes(options.format)) {
      errors.push('Format d\'export invalide');
    }

    if (!options.sections || options.sections.length === 0) {
      errors.push('Au moins une section doit être sélectionnée');
    }

    if (options.encrypt && !options.password) {
      errors.push('Mot de passe requis pour le chiffrement');
    }

    return errors;
  },

  /**
   * Retourne les sections disponibles selon le rôle
   */
  getAvailableSections: (userRole: UserRole): ExportSection[] => {
    const commonSections: ExportSection[] = ['profile', 'preferences', 'activity', 'files', 'privacy'];
    
    if (userRole === 'nutritionist') {
      return [...commonSections, 'professional', 'audit'];
    } else if (userRole === 'patient') {
      return [...commonSections, 'medical', 'subscription'];
    }
    
    return commonSections;
  }
};



