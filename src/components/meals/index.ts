/**
 * Meal Logging Components
 *
 * Export all components for the meal logging feature
 */

// Step Indicator
export { StepIndicator, StepIndicatorExtended } from './StepIndicator';

// Step 1: Meal Type Selection
export { MealTypeSelector } from './MealTypeSelector';

// Step 2: Food Search and Selection
export {
  FoodSearchBar,
  FoodSearchResults,
  RecentFavoritesFoods,
} from './FoodSearchBar';
export { PortionModal } from './PortionModal';
export { FoodList } from './FoodList';
export { NutritionProgress } from './NutritionProgress';

// Step 3: Photo, Notes, Context
export { MealPhotoUpload } from './MealPhotoUpload';
export { MealNotes } from './MealNotes';
export { MealContextTags } from './MealContextTags';
export { MealSummary } from './MealSummary';
