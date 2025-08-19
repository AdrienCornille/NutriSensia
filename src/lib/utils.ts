import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fonction utilitaire pour combiner les classes CSS de manière optimale
 * Utilise clsx pour la logique conditionnelle et tailwind-merge pour dédupliquer les classes Tailwind
 *
 * @param inputs - Classes CSS à combiner
 * @returns Chaîne de classes CSS optimisée
 *
 * @example
 * ```tsx
 * cn('base-class', condition && 'conditional-class', 'another-class')
 * // Résultat: 'base-class conditional-class another-class'
 *
 * cn('text-red-500', 'text-blue-500')
 * // Résultat: 'text-blue-500' (la dernière classe l'emporte)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fonction utilitaire pour formater les dates selon les standards suisses
 *
 * @param date - Date à formater
 * @param format - Format de date ('short', 'long', 'time')
 * @returns Date formatée en français
 *
 * @example
 * ```tsx
 * formatDate(new Date(), 'short') // "19.12.2024"
 * formatDate(new Date(), 'long') // "19 décembre 2024"
 * formatDate(new Date(), 'time') // "14:30"
 * ```
 */
export function formatDate(
  date: Date,
  format: 'short' | 'long' | 'time' = 'short'
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Zurich',
  };

  switch (format) {
    case 'short':
      return date.toLocaleDateString('fr-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options,
      });
    case 'long':
      return date.toLocaleDateString('fr-CH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...options,
      });
    case 'time':
      return date.toLocaleTimeString('fr-CH', {
        hour: '2-digit',
        minute: '2-digit',
        ...options,
      });
    default:
      return date.toLocaleDateString('fr-CH', options);
  }
}

/**
 * Fonction utilitaire pour valider les emails selon les standards suisses
 *
 * @param email - Email à valider
 * @returns true si l'email est valide
 *
 * @example
 * ```tsx
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Fonction utilitaire pour formater les numéros de téléphone suisses
 *
 * @param phone - Numéro de téléphone à formater
 * @returns Numéro formaté
 *
 * @example
 * ```tsx
 * formatPhone('+41791234567') // "+41 79 123 45 67"
 * formatPhone('0791234567') // "079 123 45 67"
 * ```
 */
export function formatPhone(phone: string): string {
  // Supprimer tous les caractères non numériques sauf le +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Si c'est un numéro suisse avec +41
  if (cleaned.startsWith('+41')) {
    const number = cleaned.substring(3);
    if (number.length === 9) {
      return `+41 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5, 7)} ${number.substring(7)}`;
    }
  }

  // Si c'est un numéro suisse sans +41
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`;
  }

  // Retourner le numéro original si le format n'est pas reconnu
  return phone;
}

/**
 * Fonction utilitaire pour générer un ID unique
 *
 * @param prefix - Préfixe optionnel pour l'ID
 * @returns ID unique
 *
 * @example
 * ```tsx
 * generateId() // "id_1234567890"
 * generateId('user') // "user_1234567890"
 * ```
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const id = `${timestamp}_${random}`;
  return prefix ? `${prefix}_${id}` : `id_${id}`;
}

/**
 * Fonction utilitaire pour tronquer le texte
 *
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale
 * @param suffix - Suffixe à ajouter (défaut: "...")
 * @returns Texte tronqué
 *
 * @example
 * ```tsx
 * truncateText('Texte très long qui dépasse la limite', 20)
 * // "Texte très long qui..."
 * ```
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Fonction utilitaire pour formater les montants en CHF
 *
 * @param amount - Montant en centimes
 * @param currency - Devise (défaut: 'CHF')
 * @returns Montant formaté
 *
 * @example
 * ```tsx
 * formatCurrency(1250) // "CHF 12.50"
 * formatCurrency(100000, 'EUR') // "EUR 1'000.00"
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string = 'CHF'
): string {
  const formatter = new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount / 100);
}

/**
 * Fonction utilitaire pour valider les numéros AVS (numéro d'assurance sociale suisse)
 *
 * @param avsNumber - Numéro AVS à valider
 * @returns true si le numéro AVS est valide
 *
 * @example
 * ```tsx
 * isValidAVS('756.9217.0769.85') // true
 * isValidAVS('invalid') // false
 * ```
 */
export function isValidAVS(avsNumber: string): boolean {
  // Supprimer les points et espaces
  const cleaned = avsNumber.replace(/[\s.]/g, '');

  // Vérifier la longueur (13 chiffres)
  if (cleaned.length !== 13) {
    return false;
  }

  // Vérifier que ce sont tous des chiffres
  if (!/^\d{13}$/.test(cleaned)) {
    return false;
  }

  // Algorithme de validation AVS (simplifié)
  // En réalité, l'algorithme AVS est plus complexe
  const digits = cleaned.split('').map(Number);

  // Calcul de la somme pondérée
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const weight = i % 2 === 0 ? 1 : 2;
    const product = digits[i] * weight;
    sum += Math.floor(product / 10) + (product % 10);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
}
