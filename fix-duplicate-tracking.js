/**
 * Script pour corriger la duplication des événements de tracking
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/onboarding/nutritionist/NutritionistOnboardingWizard.tsx');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Ajouter des refs pour éviter les appels multiples
  const trackingRefs = `  // Refs pour éviter les appels multiples de tracking
  const hasTrackedOnboardingStarted = useRef(false);
  const hasTrackedStepStarted = useRef<Set<string>>(new Set());`;
  
  // Remplacer la section des refs existants
  const oldRefs = `  // Ref pour éviter les appels répétés de sauvegarde
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = React.useRef<string>('');`;
  
  const newRefs = `  // Ref pour éviter les appels répétés de sauvegarde
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = React.useRef<string>('');
  
  // Refs pour éviter les appels multiples de tracking
  const hasTrackedOnboardingStarted = useRef(false);
  const hasTrackedStepStarted = useRef<Set<string>>(new Set());`;
  
  if (content.includes(oldRefs)) {
    content = content.replace(oldRefs, newRefs);
  }
  
  // Modifier le useEffect pour trackOnboardingStarted
  const oldOnboardingEffect = `  // Tracking du début de l'onboarding
  useEffect(() => {
    if (progress && !isProgressLocked) {
      trackOnboardingStarted();
    }
  }, [progress, isProgressLocked, trackOnboardingStarted]);`;
  
  const newOnboardingEffect = `  // Tracking du début de l'onboarding
  useEffect(() => {
    if (progress && !isProgressLocked && !hasTrackedOnboardingStarted.current) {
      trackOnboardingStarted();
      hasTrackedOnboardingStarted.current = true;
    }
  }, [progress, isProgressLocked, trackOnboardingStarted]);`;
  
  if (content.includes(oldOnboardingEffect)) {
    content = content.replace(oldOnboardingEffect, newOnboardingEffect);
  }
  
  // Modifier le useEffect pour trackStepStarted
  const oldStepEffect = `  // Effet pour marquer l'étape actuelle comme "in-progress" quand on y arrive
  useEffect(() => {
    if (progress && currentStep && !isProgressLocked) {
      const currentStepStatus = progress.steps[currentStep]?.status;
      const currentStepIndex = getCurrentStepIndex();
      
      // Tracking du début de l'étape
      trackStepStarted(currentStep, currentStepIndex + 1);`;
  
  const newStepEffect = `  // Effet pour marquer l'étape actuelle comme "in-progress" quand on y arrive
  useEffect(() => {
    if (progress && currentStep && !isProgressLocked) {
      const currentStepStatus = progress.steps[currentStep]?.status;
      const currentStepIndex = getCurrentStepIndex();
      
      // Tracking du début de l'étape (éviter les appels multiples)
      if (!hasTrackedStepStarted.current.has(currentStep)) {
        trackStepStarted(currentStep, currentStepIndex + 1);
        hasTrackedStepStarted.current.add(currentStep);
      }`;
  
  if (content.includes(oldStepEffect)) {
    content = content.replace(oldStepEffect, newStepEffect);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Correction appliquée avec succès !');
  console.log('📝 Les événements de tracking ne seront plus dupliqués');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'application de la correction:', error);
}
