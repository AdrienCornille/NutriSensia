import { describe, it, expect } from 'vitest';
import {
  commonProfileSchema,
  nutritionistProfileSchema,
  patientProfileSchema,
  completeNutritionistProfileSchema,
  completePatientProfileSchema,
  profileUpdateSchema,
  consultationRatesSchema,
  practiceAddressSchema,
  emergencyContactSchema,
  packageCreditsSchema,
} from './schemas';

describe('Schémas de validation des profils utilisateurs', () => {
  describe('commonProfileSchema', () => {
    it('devrait valider un profil commun valide', () => {
      const validProfile = {
        first_name: 'Jean',
        last_name: 'Dupont',
        phone: '+41791234567',
        avatar_url: 'https://example.com/avatar.jpg',
        locale: 'fr-CH',
        timezone: 'Europe/Zurich',
      };

      const result = commonProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un prénom trop court', () => {
      const invalidProfile = {
        first_name: 'J',
        last_name: 'Dupont',
      };

      const result = commonProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'au moins 2 caractères'
        );
      }
    });

    it('devrait rejeter un numéro de téléphone invalide', () => {
      const invalidProfile = {
        first_name: 'Jean',
        last_name: 'Dupont',
        phone: '12345',
      };

      const result = commonProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Numéro de téléphone suisse invalide'
        );
      }
    });

    it('devrait transformer un numéro de téléphone suisse en format international', () => {
      const profile = {
        first_name: 'Jean',
        last_name: 'Dupont',
        phone: '0791234567',
      };

      const result = commonProfileSchema.parse(profile);
      expect(result.phone).toBe('+41791234567');
    });
  });

  describe('nutritionistProfileSchema', () => {
    it('devrait valider un profil de nutritionniste valide', () => {
      const validNutritionist = {
        asca_number: 'AB123456',
        specializations: ['Nutrition sportive', 'Diabète'],
        bio: "Nutritionniste diplômée avec plus de 10 ans d'expérience dans le domaine de la nutrition sportive et de la gestion du diabète.",
        consultation_rates: {
          initial: 15000,
          follow_up: 10000,
          express: 5000,
        },
        practice_address: {
          street: 'Rue de la Paix 123',
          postal_code: '1200',
          city: 'Genève',
          canton: 'GE',
          country: 'CH',
        },
        verified: true,
        is_active: true,
        max_patients: 100,
      };

      const result = nutritionistProfileSchema.safeParse(validNutritionist);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter un profil sans numéro d'identification professionnelle", () => {
      const invalidNutritionist = {
        specializations: ['Nutrition sportive'],
        bio: "Nutritionniste diplômée avec plus de 10 ans d'expérience dans le domaine de la nutrition sportive et de la gestion du diabète.",
      };

      const result = nutritionistProfileSchema.safeParse(invalidNutritionist);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Au moins un numéro d'identification professionnelle"
        );
      }
    });

    it('devrait rejeter des tarifs de consultation invalides', () => {
      const invalidNutritionist = {
        asca_number: 'AB123456',
        consultation_rates: {
          initial: 5000,
          follow_up: 15000, // Plus élevé que initial
          express: 5000,
        },
      };

      const result = nutritionistProfileSchema.safeParse(invalidNutritionist);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Le tarif initial doit être supérieur ou égal au tarif de suivi'
        );
      }
    });
  });

  describe('patientProfileSchema', () => {
    it('devrait valider un profil de patient valide', () => {
      const validPatient = {
        date_of_birth: '1990-05-15',
        gender: 'female',
        emergency_contact: {
          name: 'Marie Dupont',
          phone: '+41791234568',
          relationship: 'Épouse',
        },
        height: 165,
        initial_weight: 70,
        target_weight: 65,
        activity_level: 'moderate',
        allergies: ['Gluten', 'Lactose'],
        dietary_restrictions: ['Végétarien'],
        medical_conditions: ['Hypertension'],
        medications: ['Médicament A'],
        subscription_tier: 2,
        subscription_status: 'active',
        package_credits: {
          consultations_remaining: 5,
          meal_plans_remaining: 3,
          support_priority: 'priority',
        },
      };

      const result = patientProfileSchema.safeParse(validPatient);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un poids cible sans poids initial', () => {
      const invalidPatient = {
        target_weight: 65,
      };

      const result = patientProfileSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Un poids initial doit être spécifié'
        );
      }
    });

    it('devrait rejeter un poids cible identique au poids initial', () => {
      const invalidPatient = {
        initial_weight: 70,
        target_weight: 70,
      };

      const result = patientProfileSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Le poids cible doit être différent du poids initial'
        );
      }
    });

    it('devrait rejeter une date de naissance invalide', () => {
      const invalidPatient = {
        date_of_birth: '2020-05-15', // Trop jeune
      };

      const result = patientProfileSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "L'âge doit être compris entre 13 et 120 ans"
        );
      }
    });
  });

  describe('completeNutritionistProfileSchema', () => {
    it('devrait valider un profil complet de nutritionniste', () => {
      const completeNutritionist = {
        first_name: 'Sophie',
        last_name: 'Martin',
        phone: '+41791234569',
        avatar_url: 'https://example.com/sophie.jpg',
        locale: 'fr-CH',
        timezone: 'Europe/Zurich',
        asca_number: 'CD789012',
        specializations: ['Nutrition clinique', 'Troubles alimentaires'],
        bio: 'Nutritionniste spécialisée dans les troubles alimentaires avec une approche holistique.',
        consultation_rates: {
          initial: 20000,
          follow_up: 12000,
          express: 6000,
        },
        practice_address: {
          street: 'Avenue des Alpes 45',
          postal_code: '8001',
          city: 'Zurich',
          canton: 'ZH',
          country: 'CH',
        },
        verified: true,
        is_active: true,
        max_patients: 75,
      };

      const result =
        completeNutritionistProfileSchema.safeParse(completeNutritionist);
      expect(result.success).toBe(true);
    });
  });

  describe('completePatientProfileSchema', () => {
    it('devrait valider un profil complet de patient', () => {
      const completePatient = {
        first_name: 'Pierre',
        last_name: 'Bernard',
        phone: '+41791234570',
        avatar_url: 'https://example.com/pierre.jpg',
        locale: 'fr-CH',
        timezone: 'Europe/Zurich',
        date_of_birth: '1985-08-20',
        gender: 'male',
        emergency_contact: {
          name: 'Lucie Bernard',
          phone: '+41791234571',
          relationship: 'Sœur',
        },
        height: 180,
        initial_weight: 85,
        target_weight: 78,
        activity_level: 'active',
        allergies: ['Arachides'],
        dietary_restrictions: ['Sans gluten'],
        medical_conditions: ['Asthme'],
        medications: ['Ventoline'],
        subscription_tier: 3,
        subscription_status: 'active',
        package_credits: {
          consultations_remaining: 8,
          meal_plans_remaining: 5,
          support_priority: 'premium',
        },
      };

      const result = completePatientProfileSchema.safeParse(completePatient);
      expect(result.success).toBe(true);
    });
  });

  describe('profileUpdateSchema', () => {
    it('devrait valider une mise à jour partielle de profil', () => {
      const updateData = {
        first_name: 'Nouveau Prénom',
        phone: '+41791234572',
        bio: 'Nouvelle bio mise à jour avec plus de 50 caractères pour satisfaire les exigences de validation.',
      };

      const result = profileUpdateSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('devrait accepter un objet vide pour une mise à jour', () => {
      const result = profileUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('consultationRatesSchema', () => {
    it('devrait valider des tarifs de consultation valides', () => {
      const validRates = {
        initial: 15000,
        follow_up: 10000,
        express: 5000,
      };

      const result = consultationRatesSchema.safeParse(validRates);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter des tarifs avec des valeurs négatives', () => {
      const invalidRates = {
        initial: -1000,
        follow_up: 10000,
        express: 5000,
      };

      const result = consultationRatesSchema.safeParse(invalidRates);
      expect(result.success).toBe(false);
    });
  });

  describe('practiceAddressSchema', () => {
    it('devrait valider une adresse de cabinet valide', () => {
      const validAddress = {
        street: 'Rue du Commerce 123',
        postal_code: '1000',
        city: 'Lausanne',
        canton: 'VD',
        country: 'CH',
      };

      const result = practiceAddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un code postal invalide', () => {
      const invalidAddress = {
        street: 'Rue du Commerce 123',
        postal_code: '0000', // Code postal commençant par 0
        city: 'Lausanne',
        canton: 'VD',
        country: 'CH',
      };

      const result = practiceAddressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Code postal suisse invalide'
        );
      }
    });
  });

  describe('emergencyContactSchema', () => {
    it("devrait valider un contact d'urgence valide", () => {
      const validContact = {
        name: 'Jean Dupont',
        phone: '+41791234573',
        relationship: 'Père',
      };

      const result = emergencyContactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });
  });

  describe('packageCreditsSchema', () => {
    it('devrait valider des crédits de package valides', () => {
      const validCredits = {
        consultations_remaining: 10,
        meal_plans_remaining: 5,
        support_priority: 'standard',
      };

      const result = packageCreditsSchema.safeParse(validCredits);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter des crédits négatifs', () => {
      const invalidCredits = {
        consultations_remaining: -1,
        meal_plans_remaining: 5,
        support_priority: 'standard',
      };

      const result = packageCreditsSchema.safeParse(invalidCredits);
      expect(result.success).toBe(false);
    });
  });
});
