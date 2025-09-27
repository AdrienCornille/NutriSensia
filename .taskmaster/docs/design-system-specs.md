# NutriSensia - Design System Specifications

## 🎨 Color Palette

### Primary Colors
- **Primary Green**: `#2E7D5E` - Couleur principale pour actions, navigation, et identité de marque
- **Primary White**: `#FAFBFC` - Surfaces propres, arrière-plans de cartes, zones de contenu principal
- **Primary Dark**: `#1B4F3F` - Vert foncé pour contrastes élevés, texte sur fonds clairs, éléments de navigation

### Secondary Colors
- **Secondary Green Light**: `#4A9B7B` - États de survol, boutons secondaires, indicateurs de progression
- **Secondary Green Pale**: `#E8F3EF` - États sélectionnés, surbrillances, arrière-plans subtils
- **Sage Green**: `#B8D4C7` - Arrière-plans d'accent, zones d'emphase douce

### Accent Colors
- **Accent Teal**: `#00A693` - États de succès, feedback positif, indicateurs d'accomplissement
- **Accent Mint**: `#7FD1C1` - Éléments interactifs, micro-animations
- **Accent Orange**: `#F4A261` - Alertes de plan alimentaire, avertissements, éléments d'attention

### Functional Colors
- **Success Green**: `#22C55E` - Soumissions de formulaires réussies, objectifs atteints, métriques positives
- **Error Red**: `#EF4444` - Erreurs de formulaire, avertissements, alertes critiques
- **Warning Amber**: `#F59E0B` - États de prudence, approbations en attente, informations manquantes
- **Info Blue**: `#3B82F6` - Messages informatifs, conseils, contenu éducatif

### Neutral Colors
- **Neutral Gray Light**: `#F8F9FA` - Arrière-plan de l'application, séparateurs subtils
- **Neutral Gray Medium**: `#9CA3AF` - Texte secondaire, états désactivés, placeholders
- **Neutral Gray Dark**: `#374151` - Texte principal, titres, contenu du corps
- **Neutral Gray Border**: `#E5E7EB` - Bordures d'entrée, contours de carte, séparateurs subtils

### Background Colors
- **Background Primary**: `#FFFFFF` - Blanc pur pour cartes de contenu et surfaces principales
- **Background Secondary**: `#F8FAFB` - Blanc cassé subtil pour arrière-plan d'application et zones de contenu
- **Background Accent**: `#F0F7F4` - Teinte verte claire pour sections en vedette et surbrillances

## 📝 Typography

### Font Family
- **Primary Font**: Inter (Web principal)
- **Secondary Font**: SF Pro Text (iOS) / Roboto (Android)
- **Fallback Font**: `system-ui, -apple-system, sans-serif`

### Font Weights
- **Regular**: 400 - Texte du corps standard et contenu général
- **Medium**: 500 - Étiquettes de formulaire, éléments de navigation, texte d'emphase
- **Semibold**: 600 - En-têtes de section, titres de carte, métriques importantes
- **Bold**: 700 - Titres de page, en-têtes majeurs, statistiques clés

### Text Styles

#### Headings
- **H1**: 32px/40px, Bold, Letter spacing -0.3px
- **H2**: 28px/36px, Bold, Letter spacing -0.2px
- **H3**: 24px/32px, Semibold, Letter spacing -0.1px
- **H4**: 20px/28px, Semibold, Letter spacing 0px

#### Body Text
- **Body Large**: 18px/28px, Regular, Letter spacing 0px
- **Body**: 16px/24px, Regular, Letter spacing 0px
- **Body Small**: 14px/20px, Regular, Letter spacing 0.1px

#### Special Text
- **Caption**: 12px/16px, Medium, Letter spacing 0.3px
- **Button Text**: 16px/24px, Medium, Letter spacing 0.2px
- **Link Text**: 16px/24px, Medium, Letter spacing 0px, Primary Green (#2E7D5E)
- **Label Text**: 14px/20px, Medium, Letter spacing 0.1px

## 🧩 Component Styling

### Buttons
- **Primary Button**: Background Primary Green, Text White, Height 48dp, Corner Radius 8dp
- **Secondary Button**: Border 1.5dp Primary Green, Text Primary Green, Background Transparent, Height 48dp
- **Ghost Button**: Text Primary Green, Background None, Height 44dp
- **Destructive Button**: Background Error Red, Text White, Height 48dp

### Cards
- **Primary Card**: Background White, Shadow Y-offset 2dp, Blur 12dp, Corner Radius 12dp, Padding 20dp
- **Dashboard Card**: Background Background Primary, Shadow Y-offset 1dp, Blur 8dp, Corner Radius 16dp, Padding 24dp
- **Nutrition Card**: Background Background Accent, Corner Radius 12dp, Padding 16dp

### Input Fields
- **Standard Input**: Height 56dp, Corner Radius 8dp, Border 1.5dp Neutral Gray Border, Active Border 2dp Primary Green
- **Search Input**: Height 44dp, Corner Radius 22dp, Background Background Secondary, Border None
- **Textarea**: Min Height 96dp, Corner Radius 8dp, Padding 16dp, Resize Vertical uniquement

### Navigation
- **Sidebar Navigation**: Background Primary White, Width 240dp, Item Height 44dp
- **Tab Navigation**: Height 48dp, Active State Primary Green avec bordure inférieure 2dp

### Icons
- **Primary Icons**: 24dp x 24dp
- **Small Icons**: 20dp x 20dp
- **Navigation Icons**: 28dp x 28dp
- **Feature Icons**: 32dp x 32dp

## 📏 Spacing System
- **2dp** - Espacement micro (entre éléments étroitement liés)
- **4dp** - Espacement minimal (relations icône-texte)
- **8dp** - Petit espacement (padding interne des composants)
- **12dp** - Espacement compact (espacement des champs de formulaire)
- **16dp** - Espacement standard (marges et padding par défaut)
- **24dp** - Espacement moyen (séparation de section)
- **32dp** - Grand espacement (blocs de contenu majeurs)
- **48dp** - Très grand espacement (séparation de niveau page)
- **64dp** - Espacement maximum (ruptures de section majeures)

## 🎬 Motion & Animation

### Transitions Standards
- **Duration**: 200ms
- **Easing**: ease-out
- **Usage**: États de survol, changements de focus, feedback UI simple

### Transitions d'Emphase
- **Duration**: 300ms
- **Easing**: cubic-bezier(0.4, 0.0, 0.2, 1)
- **Usage**: Clics de bouton, soumissions de formulaire, changements d'état importants

### Microinteractions
- **Duration**: 150ms
- **Easing**: ease-in-out
- **Usage**: Petit feedback comme basculements de checkbox et changements d'icône

### Transitions de Page
- **Duration**: 350ms
- **Easing**: cubic-bezier(0.25, 0.46, 0.45, 0.94)
- **Usage**: Navigation entre sections majeures

### États de Chargement
- **Duration**: 1200ms
- **Easing**: linear
- **Usage**: Animations continues pour indicateurs de progression et spinners de chargement

## ♿ Accessibility & Contrast

### Ratios de Contraste de Texte
- **Texte Principal**: 4.5:1 minimum (conforme WCAG AA)
- **Texte Secondaire**: 3:1 minimum pour grand texte
- **Éléments Interactifs**: 4.5:1 minimum

### États de Focus
- **Focus Ring**: 2dp Primary Green (#2E7D5E) avec 20% d'opacité
- **Focus Offset**: 2dp du bord de l'élément
- **Navigation Clavier**: Hiérarchie visuelle claire avec ordre de tabulation logique

### Cibles Tactiles
- **Taille Minimum**: 44dp x 44dp pour tous éléments interactifs
- **Taille Recommandée**: 48dp x 48dp pour actions principales
- **Espacement**: Minimum 8dp entre cibles tactiles adjacentes

## 🇨🇭 Contexte Santé Suisse

### Considérations Culturelles
- **Support Linguistique**: Français primaire avec allemand/italien secondaire
- **Intégration Assurance**: Style clair et professionnel pour documentation de remboursement
- **Confidentialité des Données**: Indicateurs de sécurité subtils et signaux de confiance
- **Ton Professionnel**: Esthétique propre et appropriée médicalement sans être stérile

### Fonctionnalités Spécifiques Nutritionniste
- **Visualisation de Progression**: Progressions de couleurs douces et encourageantes
- **Planification de Repas**: Palette de couleurs conviviale pour l'appétit
- **Outils de Communication**: Design d'interaction professionnel mais chaleureux
- **Mobile-First**: Optimisé pour scénarios d'utilisation quotidienne des patients

## 📱 États des Fonctionnalités (MVP)

### Phase 1 : Authentification & Navigation (Semaines 1-4)
- **Login/Signup Flow**: Form Layout single column, 16dp spacing
- **2FA Modal**: Overlay avec code input 6 digits, auto-submit
- **Role-Based Navigation**: Sidebar 240dp, Bottom Nav 72dp

### Phase 2 : Gestion Patients (Semaines 5-8)
- **Patient List View**: Card Layout responsive, 48dp avatar
- **Patient Profile Screen**: Header 96dp avatar, Tab Navigation 5 tabs
- **Create/Edit Patient Form**: Multi-step 3 étapes avec progress indicator

### Phase 3 : Consultations (Semaines 9-12)
- **Calendar View**: Week Layout 7 colonnes, créneaux 30min
- **Booking Interface**: Available Slots Grid, Consultation Types pricing
- **Consultation Detail View**: Header, Notes Section, Invoice Generation

### Phase 4 : Plans Alimentaires (Semaines 13-16)
- **Plan Builder**: Template Library, Drag & Drop Interface
- **Patient Meal Plan View**: Daily Overview, Progress Tracking
- **Food Logging**: Search Interface, Photo Capture, Portion Selection

### Phase 5 : Facturation (Semaines 17-20)
- **Invoice Generation**: Swiss Template, ASCA/RME credentials
- **Payment Processing**: Stripe Integration, Subscription Tiers
- **Patient Receipt View**: Professional Layout, Insurance Badge

### Communication Hub (Phase 6)
- **Message Thread**: Bubble Design, Media Integration, Status Indicators
- **Chat Access Management**: Active State, Expired State, Upgrade Flow

### États d'Erreur Critiques (Toutes Phases)
- **Network Issues**: Offline Banner, Slow Connection, API Timeout
- **Validation Errors**: Form Errors, Swiss Data Validation, Medical Data
- **Permission States**: Camera Access, Notification Permissions

### États Mobiles Spécifiques
- **Touch Interactions**: Minimum Target 44dp, Swipe Gestures, Pull-to-Refresh
- **Mobile Navigation**: Bottom Navigation 72dp, Hamburger Menu 280dp, Floating Actions

## 🎯 Priorités d'Implémentation

### MVP Critical (Must-Have)
- Authentification + navigation de base
- Patient CRUD + profils
- Consultation booking simple
- Facturation Swiss-compliant
- États d'erreur essentiels

### Enhanced UX (Should-Have)
- Plans alimentaires + food database
- Communication hub
- États de loading avancés
- Mobile optimizations
- Animations + micro-interactions

### Polish (Nice-to-Have)
- Advanced analytics
- Offline functionality
- Advanced error recovery
- Accessibility enhancements
- Performance optimizations
