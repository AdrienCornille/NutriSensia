/**
 * Mock data pour la page Recettes
 */

import type { Recipe, ShoppingList, RecipeCategory } from '@/types/recipes';

// ==================== RECIPES DATA ====================

export const mockRecipes: Recipe[] = [
  // Petit-déjeuner
  {
    id: 'rec-001',
    title: 'Bowl de smoothie açaï',
    image:
      'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
    category: 'petit-dejeuner',
    time: '15 min',
    difficulty: 'Facile',
    calories: 320,
    protein: 8,
    carbs: 52,
    fat: 12,
    rating: 4.8,
    reviews: 124,
    isFavorite: true,
    isRecommended: true,
    tags: ['Végétarien', 'Riche en fibres', 'Sans gluten', 'Antioxydants'],
    ingredients: [
      { name: 'Açaï en poudre', quantity: '2 c. à soupe' },
      { name: 'Banane congelée', quantity: '1' },
      { name: 'Myrtilles', quantity: '100g' },
      { name: "Lait d'amande", quantity: '150ml' },
      { name: 'Granola', quantity: '30g' },
      { name: 'Graines de chia', quantity: '1 c. à soupe' },
      { name: 'Miel', quantity: '1 c. à café' },
    ],
    steps: [
      "Mixer l'açaï, la banane congelée, les myrtilles et le lait d'amande jusqu'à obtenir une texture épaisse.",
      'Verser dans un bol.',
      'Garnir avec le granola, les graines de chia et un filet de miel.',
      'Ajouter quelques fruits frais si désiré.',
    ],
    tips: "Pour une texture plus épaisse, utilisez moins de lait. Vous pouvez remplacer l'açaï par des myrtilles si nécessaire.",
  },
  {
    id: 'rec-002',
    title: 'Pancakes protéinés',
    image:
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    category: 'petit-dejeuner',
    time: '20 min',
    difficulty: 'Facile',
    calories: 380,
    protein: 24,
    carbs: 42,
    fat: 10,
    rating: 4.6,
    reviews: 89,
    isFavorite: false,
    isRecommended: true,
    tags: ['Riche en protéines', 'Végétarien', 'Post-entraînement'],
    ingredients: [
      { name: "Flocons d'avoine", quantity: '80g' },
      { name: "Blanc d'œuf", quantity: '3' },
      { name: 'Banane mûre', quantity: '1' },
      { name: 'Protéine en poudre vanille', quantity: '30g' },
      { name: 'Lait', quantity: '50ml' },
      { name: 'Levure chimique', quantity: '1 c. à café' },
    ],
    steps: [
      "Mixer tous les ingrédients jusqu'à obtenir une pâte lisse.",
      'Chauffer une poêle antiadhésive à feu moyen.',
      'Verser des petites louches de pâte et cuire 2-3 min de chaque côté.',
      "Servir avec des fruits frais et un filet de sirop d'érable.",
    ],
    tips: 'Laissez reposer la pâte 5 minutes pour des pancakes plus moelleux.',
  },
  {
    id: 'rec-003',
    title: 'Overnight oats mangue-coco',
    image:
      'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop',
    category: 'petit-dejeuner',
    time: '5 min',
    difficulty: 'Facile',
    calories: 290,
    protein: 9,
    carbs: 48,
    fat: 8,
    rating: 4.7,
    reviews: 156,
    isFavorite: true,
    isRecommended: false,
    tags: ['Végétarien', 'Sans cuisson', "Préparation à l'avance"],
    ingredients: [
      { name: "Flocons d'avoine", quantity: '50g' },
      { name: 'Lait de coco', quantity: '150ml' },
      { name: 'Yaourt grec', quantity: '50g' },
      { name: 'Mangue fraîche', quantity: '100g' },
      { name: 'Noix de coco râpée', quantity: '1 c. à soupe' },
      { name: 'Graines de chia', quantity: '1 c. à soupe' },
    ],
    steps: [
      "Dans un bocal, mélanger les flocons d'avoine, le lait de coco, le yaourt et les graines de chia.",
      'Réfrigérer toute la nuit (minimum 4h).',
      'Au moment de servir, ajouter la mangue coupée en dés.',
      'Saupoudrer de noix de coco râpée.',
    ],
    tips: 'Préparez plusieurs bocaux le dimanche pour la semaine !',
  },

  // Déjeuner
  {
    id: 'rec-004',
    title: 'Buddha bowl quinoa & légumes',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    category: 'dejeuner',
    time: '30 min',
    difficulty: 'Facile',
    calories: 450,
    protein: 18,
    carbs: 55,
    fat: 16,
    rating: 4.9,
    reviews: 203,
    isFavorite: true,
    isRecommended: true,
    tags: ['Végétarien', 'Végan', 'Riche en fibres', 'Sans gluten'],
    ingredients: [
      { name: 'Quinoa', quantity: '100g' },
      { name: 'Pois chiches', quantity: '150g' },
      { name: 'Avocat', quantity: '1/2' },
      { name: 'Carottes râpées', quantity: '100g' },
      { name: 'Chou rouge', quantity: '80g' },
      { name: 'Edamames', quantity: '50g' },
      { name: 'Sauce tahini', quantity: '2 c. à soupe' },
    ],
    steps: [
      'Cuire le quinoa selon les instructions du paquet.',
      "Rôtir les pois chiches au four à 200°C pendant 20 min avec un filet d'huile d'olive.",
      'Disposer tous les ingrédients dans un bol.',
      'Arroser de sauce tahini et servir.',
    ],
    tips: 'Variez les légumes selon la saison pour plus de diversité nutritionnelle.',
  },
  {
    id: 'rec-005',
    title: 'Salade méditerranéenne',
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    category: 'dejeuner',
    time: '15 min',
    difficulty: 'Facile',
    calories: 380,
    protein: 14,
    carbs: 28,
    fat: 24,
    rating: 4.5,
    reviews: 167,
    isFavorite: false,
    isRecommended: true,
    tags: ['Végétarien', 'Sans gluten', 'Pauvre en sel', 'Oméga-3'],
    ingredients: [
      { name: 'Tomates cerises', quantity: '200g' },
      { name: 'Concombre', quantity: '1' },
      { name: 'Feta', quantity: '100g' },
      { name: 'Olives noires', quantity: '50g' },
      { name: 'Oignon rouge', quantity: '1/2' },
      { name: "Huile d'olive", quantity: '3 c. à soupe' },
      { name: 'Origan', quantity: '1 c. à café' },
    ],
    steps: [
      'Couper les tomates en deux, le concombre en rondelles.',
      "Émincer finement l'oignon rouge.",
      'Disposer tous les légumes dans un saladier.',
      'Ajouter la feta émiettée et les olives.',
      "Assaisonner avec l'huile d'olive et l'origan.",
    ],
    tips: 'Ajoutez du pain pita grillé pour un repas plus complet.',
  },
  {
    id: 'rec-006',
    title: 'Wrap poulet avocat',
    image:
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
    category: 'dejeuner',
    time: '20 min',
    difficulty: 'Facile',
    calories: 520,
    protein: 32,
    carbs: 38,
    fat: 26,
    rating: 4.7,
    reviews: 145,
    isFavorite: false,
    isRecommended: false,
    tags: ['Riche en protéines', 'Rapide', 'À emporter'],
    ingredients: [
      { name: 'Tortilla complète', quantity: '2' },
      { name: 'Blanc de poulet', quantity: '200g' },
      { name: 'Avocat', quantity: '1' },
      { name: 'Tomate', quantity: '1' },
      { name: 'Laitue', quantity: '4 feuilles' },
      { name: 'Yaourt grec', quantity: '2 c. à soupe' },
      { name: 'Jus de citron', quantity: '1 c. à soupe' },
    ],
    steps: [
      'Griller le poulet et le couper en lamelles.',
      "Écraser l'avocat avec le jus de citron.",
      "Étaler le yaourt et l'avocat sur les tortillas.",
      'Ajouter le poulet, la tomate et la laitue.',
      'Rouler fermement et couper en deux.',
    ],
    tips: 'Emballez dans du papier aluminium pour un lunch à emporter.',
  },

  // Dîner
  {
    id: 'rec-007',
    title: 'Saumon grillé aux légumes',
    image:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    category: 'diner',
    time: '25 min',
    difficulty: 'Moyen',
    calories: 480,
    protein: 38,
    carbs: 22,
    fat: 28,
    rating: 4.8,
    reviews: 189,
    isFavorite: true,
    isRecommended: true,
    tags: [
      'Riche en protéines',
      'Oméga-3',
      'Sans gluten',
      'Pauvre en glucides',
    ],
    ingredients: [
      { name: 'Pavé de saumon', quantity: '200g' },
      { name: 'Brocoli', quantity: '200g' },
      { name: 'Asperges', quantity: '150g' },
      { name: 'Ail', quantity: '2 gousses' },
      { name: "Huile d'olive", quantity: '2 c. à soupe' },
      { name: 'Citron', quantity: '1' },
      { name: 'Aneth frais', quantity: '2 c. à soupe' },
    ],
    steps: [
      'Préchauffer le four à 200°C.',
      "Disposer les légumes sur une plaque et arroser d'huile d'olive.",
      "Assaisonner le saumon avec le jus de citron, l'ail et l'aneth.",
      'Enfourner les légumes 10 min, puis ajouter le saumon.',
      "Cuire encore 12-15 min jusqu'à ce que le saumon soit cuit.",
    ],
    tips: 'Le saumon est cuit quand il se défait facilement à la fourchette.',
  },
  {
    id: 'rec-008',
    title: 'Curry de lentilles',
    image:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    category: 'diner',
    time: '35 min',
    difficulty: 'Moyen',
    calories: 420,
    protein: 22,
    carbs: 58,
    fat: 12,
    rating: 4.6,
    reviews: 134,
    isFavorite: false,
    isRecommended: true,
    tags: ['Végétarien', 'Végan', 'Riche en protéines', 'Riche en fibres'],
    ingredients: [
      { name: 'Lentilles corail', quantity: '200g' },
      { name: 'Lait de coco', quantity: '200ml' },
      { name: 'Tomates concassées', quantity: '400g' },
      { name: 'Oignon', quantity: '1' },
      { name: 'Ail', quantity: '2 gousses' },
      { name: 'Curry en poudre', quantity: '2 c. à soupe' },
      { name: 'Épinards frais', quantity: '100g' },
    ],
    steps: [
      "Faire revenir l'oignon et l'ail dans une casserole.",
      'Ajouter le curry et cuire 1 min.',
      'Incorporer les lentilles, les tomates et le lait de coco.',
      "Laisser mijoter 25 min jusqu'à ce que les lentilles soient tendres.",
      'Ajouter les épinards en fin de cuisson.',
    ],
    tips: 'Servir avec du riz basmati et de la coriandre fraîche.',
  },
  {
    id: 'rec-009',
    title: 'Poulet rôti au citron',
    image:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    category: 'diner',
    time: '45 min',
    difficulty: 'Moyen',
    calories: 390,
    protein: 42,
    carbs: 15,
    fat: 18,
    rating: 4.7,
    reviews: 112,
    isFavorite: false,
    isRecommended: false,
    tags: ['Riche en protéines', 'Sans gluten', 'Pauvre en glucides'],
    ingredients: [
      { name: 'Cuisses de poulet', quantity: '4' },
      { name: 'Citrons', quantity: '2' },
      { name: 'Romarin frais', quantity: '3 branches' },
      { name: 'Ail', quantity: '4 gousses' },
      { name: 'Pommes de terre grenaille', quantity: '400g' },
      { name: "Huile d'olive", quantity: '3 c. à soupe' },
    ],
    steps: [
      'Préchauffer le four à 200°C.',
      'Disposer le poulet et les pommes de terre dans un plat.',
      "Ajouter le citron coupé, l'ail et le romarin.",
      "Arroser d'huile d'olive et assaisonner.",
      'Rôtir 40-45 min en retournant à mi-cuisson.',
    ],
    tips: "Le poulet est cuit quand le jus qui s'en écoule est clair.",
  },

  // Collations
  {
    id: 'rec-010',
    title: 'Energy balls dattes-cacao',
    image:
      'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop',
    category: 'collation',
    time: '10 min',
    difficulty: 'Facile',
    calories: 120,
    protein: 4,
    carbs: 18,
    fat: 5,
    rating: 4.9,
    reviews: 234,
    isFavorite: true,
    isRecommended: true,
    tags: ['Végétarien', 'Végan', 'Sans cuisson', 'Énergie naturelle'],
    ingredients: [
      { name: 'Dattes Medjool', quantity: '150g' },
      { name: 'Amandes', quantity: '50g' },
      { name: 'Cacao en poudre', quantity: '2 c. à soupe' },
      { name: 'Noix de coco râpée', quantity: '2 c. à soupe' },
      { name: "Beurre d'amande", quantity: '1 c. à soupe' },
    ],
    steps: [
      'Mixer les amandes en poudre grossière.',
      'Ajouter les dattes dénoyautées et mixer.',
      "Incorporer le cacao et le beurre d'amande.",
      "Former des boules de la taille d'une noix.",
      'Rouler dans la noix de coco râpée.',
    ],
    tips: 'Se conservent 2 semaines au réfrigérateur.',
  },
  {
    id: 'rec-011',
    title: 'Houmous maison',
    image:
      'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop',
    category: 'collation',
    time: '10 min',
    difficulty: 'Facile',
    calories: 180,
    protein: 8,
    carbs: 20,
    fat: 8,
    rating: 4.6,
    reviews: 98,
    isFavorite: false,
    isRecommended: false,
    tags: ['Végétarien', 'Végan', 'Riche en protéines', 'Sans gluten'],
    ingredients: [
      { name: 'Pois chiches cuits', quantity: '400g' },
      { name: 'Tahini', quantity: '3 c. à soupe' },
      { name: 'Jus de citron', quantity: '3 c. à soupe' },
      { name: 'Ail', quantity: '1 gousse' },
      { name: "Huile d'olive", quantity: '2 c. à soupe' },
      { name: 'Cumin', quantity: '1 c. à café' },
    ],
    steps: [
      "Mixer les pois chiches avec leur liquide jusqu'à consistance lisse.",
      "Ajouter le tahini, le citron, l'ail et le cumin.",
      "Mixer jusqu'à obtenir une texture crémeuse.",
      "Servir avec un filet d'huile d'olive et du paprika.",
    ],
    tips: 'Pour un houmous plus lisse, retirez la peau des pois chiches.',
  },

  // Desserts
  {
    id: 'rec-012',
    title: 'Mousse au chocolat avocat',
    image:
      'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400&h=300&fit=crop',
    category: 'dessert',
    time: '10 min',
    difficulty: 'Facile',
    calories: 220,
    protein: 4,
    carbs: 24,
    fat: 14,
    rating: 4.5,
    reviews: 87,
    isFavorite: false,
    isRecommended: true,
    tags: ['Végétarien', 'Végan', 'Sans lactose', 'Sans sucre ajouté'],
    ingredients: [
      { name: 'Avocat mûr', quantity: '2' },
      { name: 'Cacao en poudre', quantity: '4 c. à soupe' },
      { name: "Sirop d'érable", quantity: '3 c. à soupe' },
      { name: 'Extrait de vanille', quantity: '1 c. à café' },
      { name: "Lait d'amande", quantity: '50ml' },
    ],
    steps: [
      'Couper les avocats en morceaux.',
      "Mixer tous les ingrédients jusqu'à obtenir une texture lisse.",
      'Réfrigérer au moins 30 min avant de servir.',
      'Garnir de copeaux de chocolat ou de fruits rouges.',
    ],
    tips: 'Utilisez des avocats très mûrs pour une texture crémeuse.',
  },
  {
    id: 'rec-013',
    title: 'Crumble aux pommes léger',
    image:
      'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400&h=300&fit=crop',
    category: 'dessert',
    time: '40 min',
    difficulty: 'Moyen',
    calories: 280,
    protein: 5,
    carbs: 42,
    fat: 10,
    rating: 4.8,
    reviews: 156,
    isFavorite: true,
    isRecommended: false,
    tags: ['Végétarien', 'Fibres', 'Faible en sucre'],
    ingredients: [
      { name: 'Pommes', quantity: '4' },
      { name: "Flocons d'avoine", quantity: '100g' },
      { name: 'Farine complète', quantity: '50g' },
      { name: 'Beurre froid', quantity: '50g' },
      { name: 'Sucre de coco', quantity: '50g' },
      { name: 'Cannelle', quantity: '1 c. à café' },
    ],
    steps: [
      'Préchauffer le four à 180°C.',
      'Couper les pommes en morceaux et les disposer dans un plat.',
      'Mélanger les flocons, la farine, le sucre et la cannelle.',
      'Incorporer le beurre du bout des doigts pour obtenir un sable.',
      'Répartir sur les pommes et enfourner 30-35 min.',
    ],
    tips: 'Servir tiède avec une boule de glace vanille.',
  },

  // Boissons
  {
    id: 'rec-014',
    title: 'Smoothie vert détox',
    image:
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop',
    category: 'boisson',
    time: '5 min',
    difficulty: 'Facile',
    calories: 180,
    protein: 5,
    carbs: 32,
    fat: 4,
    rating: 4.4,
    reviews: 178,
    isFavorite: false,
    isRecommended: true,
    tags: ['Végétarien', 'Végan', 'Détox', 'Riche en vitamines'],
    ingredients: [
      { name: 'Épinards frais', quantity: '50g' },
      { name: 'Banane', quantity: '1' },
      { name: 'Pomme verte', quantity: '1' },
      { name: 'Gingembre frais', quantity: '1 cm' },
      { name: 'Jus de citron', quantity: '1/2' },
      { name: 'Eau de coco', quantity: '200ml' },
    ],
    steps: [
      'Mettre tous les ingrédients dans un blender.',
      "Mixer jusqu'à obtenir une consistance lisse.",
      'Ajouter des glaçons si désiré.',
      'Servir immédiatement.',
    ],
    tips: 'Ajoutez une cuillère de spiruline pour plus de nutriments.',
  },
  {
    id: 'rec-015',
    title: 'Golden milk anti-inflammatoire',
    image:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop',
    category: 'boisson',
    time: '10 min',
    difficulty: 'Facile',
    calories: 120,
    protein: 4,
    carbs: 12,
    fat: 6,
    rating: 4.7,
    reviews: 89,
    isFavorite: true,
    isRecommended: true,
    tags: ['Végétarien', 'Sans lactose', 'Anti-inflammatoire', 'Relaxant'],
    ingredients: [
      { name: "Lait d'amande", quantity: '250ml' },
      { name: 'Curcuma en poudre', quantity: '1 c. à café' },
      { name: 'Gingembre en poudre', quantity: '1/2 c. à café' },
      { name: 'Cannelle', quantity: '1/4 c. à café' },
      { name: 'Poivre noir', quantity: '1 pincée' },
      { name: 'Miel', quantity: '1 c. à café' },
    ],
    steps: [
      'Chauffer le lait dans une casserole à feu doux.',
      'Ajouter le curcuma, le gingembre, la cannelle et le poivre.',
      'Fouetter pour bien mélanger.',
      'Chauffer 5 min sans faire bouillir.',
      'Sucrer avec le miel et servir chaud.',
    ],
    tips: "Le poivre noir aide à l'absorption du curcuma.",
  },
];

// ==================== SHOPPING LIST DATA ====================

export const mockShoppingList: ShoppingList = {
  weekRange: '20 - 26 janvier 2025',
  categories: [
    {
      category: 'Fruits & Légumes',
      items: [
        {
          id: 'shop-001',
          name: 'Bananes',
          quantity: '6',
          checked: true,
          category: 'Fruits & Légumes',
        },
        {
          id: 'shop-002',
          name: 'Avocats',
          quantity: '3',
          checked: false,
          category: 'Fruits & Légumes',
        },
        {
          id: 'shop-003',
          name: 'Épinards frais',
          quantity: '200g',
          checked: false,
          category: 'Fruits & Légumes',
        },
        {
          id: 'shop-004',
          name: 'Brocoli',
          quantity: '2',
          checked: true,
          category: 'Fruits & Légumes',
        },
        {
          id: 'shop-005',
          name: 'Tomates cerises',
          quantity: '500g',
          checked: false,
          category: 'Fruits & Légumes',
        },
        {
          id: 'shop-006',
          name: 'Citrons',
          quantity: '4',
          checked: false,
          category: 'Fruits & Légumes',
        },
      ],
    },
    {
      category: 'Protéines',
      items: [
        {
          id: 'shop-007',
          name: 'Pavés de saumon',
          quantity: '4',
          checked: false,
          category: 'Protéines',
        },
        {
          id: 'shop-008',
          name: 'Blanc de poulet',
          quantity: '500g',
          checked: true,
          category: 'Protéines',
        },
        {
          id: 'shop-009',
          name: 'Œufs bio',
          quantity: '12',
          checked: false,
          category: 'Protéines',
        },
      ],
    },
    {
      category: 'Épicerie',
      items: [
        {
          id: 'shop-010',
          name: 'Quinoa',
          quantity: '500g',
          checked: false,
          category: 'Épicerie',
        },
        {
          id: 'shop-011',
          name: 'Lentilles corail',
          quantity: '400g',
          checked: false,
          category: 'Épicerie',
        },
        {
          id: 'shop-012',
          name: "Flocons d'avoine",
          quantity: '500g',
          checked: true,
          category: 'Épicerie',
        },
        {
          id: 'shop-013',
          name: 'Pois chiches',
          quantity: '2 boîtes',
          checked: false,
          category: 'Épicerie',
        },
      ],
    },
    {
      category: 'Produits laitiers',
      items: [
        {
          id: 'shop-014',
          name: 'Yaourt grec',
          quantity: '4',
          checked: false,
          category: 'Produits laitiers',
        },
        {
          id: 'shop-015',
          name: "Lait d'amande",
          quantity: '1L',
          checked: false,
          category: 'Produits laitiers',
        },
        {
          id: 'shop-016',
          name: 'Feta',
          quantity: '200g',
          checked: false,
          category: 'Produits laitiers',
        },
      ],
    },
  ],
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Récupère toutes les recettes
 */
export function getRecipes(): Recipe[] {
  return mockRecipes;
}

/**
 * Récupère une recette par son ID
 */
export function getRecipeById(id: string): Recipe | undefined {
  return mockRecipes.find(recipe => recipe.id === id);
}

/**
 * Récupère les recettes par catégorie
 */
export function getRecipesByCategory(category: RecipeCategory): Recipe[] {
  return mockRecipes.filter(recipe => recipe.category === category);
}

/**
 * Récupère les recettes favorites
 */
export function getFavoriteRecipes(): Recipe[] {
  return mockRecipes.filter(recipe => recipe.isFavorite);
}

/**
 * Récupère les recettes recommandées
 */
export function getRecommendedRecipes(): Recipe[] {
  return mockRecipes.filter(recipe => recipe.isRecommended);
}

/**
 * Récupère la liste de courses
 */
export function getShoppingList(): ShoppingList {
  return mockShoppingList;
}

/**
 * Compte le nombre de recettes par catégorie
 */
export function getRecipeCountByCategory(): Record<RecipeCategory, number> {
  const counts: Record<RecipeCategory, number> = {
    'petit-dejeuner': 0,
    dejeuner: 0,
    diner: 0,
    collation: 0,
    dessert: 0,
    boisson: 0,
  };

  mockRecipes.forEach(recipe => {
    counts[recipe.category]++;
  });

  return counts;
}

/**
 * Récupère les recettes populaires (rating >= 4.7)
 */
export function getPopularRecipes(): Recipe[] {
  return mockRecipes
    .filter(recipe => recipe.rating >= 4.7)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
}

/**
 * Recherche des recettes par terme
 */
export function searchRecipes(query: string): Recipe[] {
  const lowerQuery = query.toLowerCase();
  return mockRecipes.filter(
    recipe =>
      recipe.title.toLowerCase().includes(lowerQuery) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      recipe.ingredients?.some(ing =>
        ing.name.toLowerCase().includes(lowerQuery)
      )
  );
}
