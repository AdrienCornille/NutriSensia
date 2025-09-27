/**
 * Composant d'input optimisé pour la saisie de prix
 * Résout les problèmes UX de sélection/remplacement de texte
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Input } from './Input';

interface PriceInputProps {
  /** Valeur en centimes */
  value: number;
  /** Callback de changement avec valeur en centimes */
  onChange: (centimes: number) => void;
  /** Valeur minimale en CHF */
  min?: number;
  /** Valeur maximale en CHF */
  max?: number;
  /** Classe CSS personnalisée */
  className?: string;
  /** Désactivé */
  disabled?: boolean;
  /** Placeholder */
  placeholder?: string;
  /** Devise à afficher */
  currency?: string;
  /** Nombre de décimales */
  decimals?: number;
}

/**
 * Convertit les centimes en CHF
 */
const centimesToChf = (centimes: number): number => {
  return Math.round(centimes) / 100;
};

/**
 * Convertit les CHF en centimes
 */
const chfToCentimes = (chf: number): number => {
  return Math.round(chf * 100);
};

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 1000,
  className = '',
  disabled = false,
  placeholder,
  currency = 'CHF',
  decimals = 2,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  // Synchroniser la valeur d'affichage
  useEffect(() => {
    if (!isTyping) {
      const chfValue = centimesToChf(value);
      setDisplayValue(chfValue.toFixed(decimals));
    }
  }, [value, decimals, isTyping]);

  /**
   * Gérer le focus - sélectionner tout le texte
   */
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Petit délai pour s'assurer que la sélection fonctionne
    setTimeout(() => {
      e.target.select();
    }, 10);
  };

  /**
   * Gérer la perte de focus - valider et formater
   */
  const handleBlur = () => {
    setIsTyping(false);
    const chfValue = parseFloat(displayValue) || 0;
    const clampedValue = Math.min(Math.max(chfValue, min), max);
    const centimes = chfToCentimes(clampedValue);
    
    // Mettre à jour la valeur si elle a changé
    if (centimes !== value) {
      onChange(centimes);
    }
    
    // Reformater l'affichage
    setDisplayValue(clampedValue.toFixed(decimals));
  };

  /**
   * Gérer les changements de saisie
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    const inputValue = e.target.value;
    
    // Permettre la saisie temporaire (même invalide)
    setDisplayValue(inputValue);
    
    // Si c'est un nombre valide, mettre à jour immédiatement
    const chfValue = parseFloat(inputValue);
    if (!isNaN(chfValue) && chfValue >= min && chfValue <= max) {
      const centimes = chfToCentimes(chfValue);
      onChange(centimes);
    }
  };

  /**
   * Gérer les touches spéciales
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    
    // Si l'utilisateur tape un chiffre et tout est sélectionné, remplacer
    if (
      e.key >= '0' && e.key <= '9' && 
      input.selectionStart === 0 && 
      input.selectionEnd === input.value.length
    ) {
      e.preventDefault();
      setIsTyping(true);
      setDisplayValue(e.key);
      
      const chfValue = parseFloat(e.key);
      if (!isNaN(chfValue)) {
        const centimes = chfToCentimes(chfValue);
        onChange(centimes);
      }
      return;
    }

    // Touches spéciales autorisées
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Permettre Ctrl+A, Ctrl+C, Ctrl+V, etc.
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Point décimal
    if (e.key === '.' || e.key === ',') {
      if (displayValue.includes('.')) {
        e.preventDefault();
      }
      return;
    }

    // Bloquer les caractères non numériques
    if (!allowedKeys.includes(e.key) && !(e.key >= '0' && e.key <= '9')) {
      e.preventDefault();
    }
  };

  /**
   * Gérer le double-clic - sélectionner tout
   */
  const handleDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text" // Utiliser text pour plus de contrôle
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-gray-500 text-sm">{currency}</span>
      </div>
    </div>
  );
};

export default PriceInput;
