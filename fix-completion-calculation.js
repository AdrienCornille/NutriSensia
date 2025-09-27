/**
 * Script pour corriger le calcul de l'étape completion
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/api/analytics/onboarding/metrics/route.ts');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer la logique de calcul pour l'étape completion dans le cas dashboard
  const oldLogic = `            // Compter les sessions qui ont complété cette étape
            let sessionsCompleted;
            if (stepName === 'completion') {
              // Pour l'étape finale "completion", utiliser l'événement onboarding_completed
              sessionsCompleted = funnelData.filter(e => 
                e.event_type === 'onboarding_completed'
              ).length;
            } else {
              // Pour les autres étapes, utiliser step_completed
              sessionsCompleted = funnelData.filter(e => 
                e.step_number === stepNumber && e.event_type === 'step_completed'
              ).length;
            }`;
  
  const newLogic = `            // Compter les sessions qui ont complété cette étape
            let sessionsCompleted;
            if (stepName === 'completion') {
              // Pour l'étape finale "completion", compter les sessions uniques qui ont complété l'onboarding
              const completedSessions = new Set(
                funnelData
                  .filter(e => e.event_type === 'onboarding_completed')
                  .map(e => e.session_id)
              );
              sessionsCompleted = completedSessions.size;
            } else {
              // Pour les autres étapes, utiliser step_completed
              sessionsCompleted = funnelData.filter(e => 
                e.step_number === stepNumber && e.event_type === 'step_completed'
              ).length;
            }`;
  
  if (content.includes(oldLogic)) {
    content = content.replace(oldLogic, newLogic);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Correction appliquée avec succès !');
    console.log('📊 L\'étape completion comptera maintenant les sessions uniques');
  } else {
    console.log('⚠️ Logique non trouvée, le patch a peut-être déjà été appliqué');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de l\'application du patch:', error);
}
