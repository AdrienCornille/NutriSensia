// Composants UI pour le Design System 2025
// Export de tous les composants selon les spécifications

// Animations et scroll
export {
  ScrollAnimation,
  StaggerAnimation,
  StaggerItem,
  AnimatedCard,
  useHoverAnimation,
} from './ScrollAnimation';
export { SectionScrollbar } from './SectionScrollbar';
export { SmoothScrollProvider } from './SmoothScrollProvider';
export { WaveDivider, WaveDividerPresets } from './WaveDivider';

// Accordion (shadcn)
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion';

// Layout et structure
export { Section, Container, Grid } from './Section';

// Boutons
export { Button, ButtonGroup, buttonVariants } from './Button';

// Bento Grid (shadcn)
export { BentoGrid, BentoCard } from './bento-grid';

// Cartes
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from './Card';

// Typographie
export {
  H1,
  H2,
  H3,
  H4,
  P,
  PLarge,
  PSmall,
  AccentText,
  Label,
  Caption,
  Lead,
  Blockquote,
} from './Typography';

// Input et champs de formulaire
export { Input } from './Input';
export type { InputProps, InputVariant, InputSize } from './Input';
