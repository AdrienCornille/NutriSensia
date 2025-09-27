'use client';

import { MFATest } from '@/components/auth/MFATest';
import { MFADiagnosticSimple } from '@/components/auth/MFADiagnosticSimple';
import { MFADiagnosticAdvanced } from '@/components/auth/MFADiagnosticAdvanced';

/**
 * Page de test pour l'authentification à deux facteurs
 * Permet de tester toutes les fonctionnalités 2FA
 */
export default function MFATestPage() {
  return (
          <div className="space-y-8">
        <MFADiagnosticAdvanced />
        <MFADiagnosticSimple />
        <MFATest />
      </div>
  );
}
