import { ArticleContent } from '@/components/blog/ArticlePage';

/**
 * Base de données des articles du blog NutriSensia
 */

export const articles: Record<string, ArticleContent> = {
  // NUTRITION
  'alimentation-equilibree-bases': {
    slug: 'alimentation-equilibree-bases',
    category: 'nutrition',
    title: "Les bases d'une alimentation équilibrée pour une vie saine",
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    publishedAt: '2024-12-10',
    readingTime: 8,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'introduction',
        title: 'Pourquoi une alimentation équilibrée est essentielle',
        content: [
          "Une alimentation équilibrée est la pierre angulaire d'une vie saine. Elle fournit à notre corps tous les nutriments essentiels dont il a besoin pour fonctionner de manière optimale, maintenir un poids santé et prévenir de nombreuses maladies chroniques.",
          "Dans cet article, nous allons explorer les principes fondamentaux d'une alimentation équilibrée et comment les appliquer au quotidien pour améliorer votre santé et votre bien-être.",
        ],
      },
      {
        id: 'macronutriments',
        title: 'Les trois piliers : glucides, protéines et lipides',
        content: [
          'Les macronutriments sont les nutriments dont notre corps a besoin en grande quantité. Ils comprennent les glucides, les protéines et les lipides, chacun jouant un rôle crucial dans notre santé.',
          "Les glucides sont notre principale source d'énergie. Privilégiez les glucides complexes comme les céréales complètes, les légumineuses et les légumes, qui fournissent une énergie durable et sont riches en fibres.",
          'Les protéines sont essentielles pour la construction et la réparation des tissus. Variez vos sources entre protéines animales (viande, poisson, œufs) et végétales (légumineuses, tofu, quinoa).',
          "Les lipides, souvent diabolisés à tort, sont vitaux pour l'absorption des vitamines et la santé cérébrale. Optez pour des graisses de qualité comme l'huile d'olive, les avocats et les noix.",
        ],
      },
      {
        id: 'micronutriments',
        title: "L'importance des vitamines et minéraux",
        content: [
          "Les micronutriments, bien que nécessaires en plus petites quantités, sont tout aussi essentiels à notre santé. Ils comprennent les vitamines et les minéraux qui participent à d'innombrables processus biologiques.",
          "Une alimentation variée et colorée est la meilleure façon d'assurer un apport adéquat en micronutriments. Chaque couleur de fruit ou légume apporte un ensemble unique de vitamines et d'antioxydants.",
          "Les carences en micronutriments peuvent entraîner fatigue, baisse d'immunité et problèmes de santé à long terme. C'est pourquoi la diversité alimentaire est si importante.",
        ],
      },
      {
        id: 'equilibre-assiette',
        title: 'Composer une assiette équilibrée',
        content: [
          "La méthode de l'assiette équilibrée est un outil simple et efficace pour structurer vos repas. Visualisez votre assiette divisée en trois parties.",
          'La moitié de votre assiette devrait être composée de légumes variés, un quart de protéines de qualité, et un quart de glucides complexes comme le riz complet ou les patates douces.',
          "N'oubliez pas d'ajouter une source de bonnes graisses (huile d'olive, avocat) et de rester bien hydraté tout au long de la journée.",
        ],
      },
      {
        id: 'conseils-pratiques',
        title: 'Conseils pratiques pour le quotidien',
        content: [
          "Planifiez vos repas à l'avance pour éviter les choix alimentaires impulsifs et peu sains. Préparez une liste de courses basée sur votre plan de repas.",
          'Cuisinez maison autant que possible. Cela vous permet de contrôler la qualité et la quantité des ingrédients utilisés.',
          'Mangez en pleine conscience, sans distraction, en prenant le temps de savourer chaque bouchée. Cela aide à mieux reconnaître les signaux de satiété.',
          "Hydratez-vous régulièrement. L'eau est essentielle pour tous les processus corporels. Visez 1,5 à 2 litres par jour, davantage si vous êtes actif.",
        ],
      },
      {
        id: 'conclusion',
        title: 'Conclusion : vers un changement durable',
        content: [
          "Adopter une alimentation équilibrée n'est pas une question de régime strict ou de privation, mais plutôt de faire des choix éclairés et durables qui soutiennent votre santé à long terme.",
          'Commencez par de petits changements progressifs. Remplacez les céréales raffinées par des versions complètes, ajoutez plus de légumes à vos repas, ou expérimentez avec de nouvelles recettes saines.',
          "Rappelez-vous que la perfection n'existe pas. L'objectif est de trouver un équilibre qui fonctionne pour vous et votre mode de vie, tout en nourrissant votre corps de manière optimale.",
        ],
      },
    ],
  },

  'alimentation-anti-inflammatoire': {
    slug: 'alimentation-anti-inflammatoire',
    category: 'nutrition',
    title: "L'alimentation anti-inflammatoire : guide complet",
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    publishedAt: '2024-11-28',
    readingTime: 7,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'inflammation',
        title: "Comprendre l'inflammation chronique",
        content: [
          "L'inflammation chronique est un processus silencieux qui peut contribuer au développement de nombreuses maladies, notamment les maladies cardiovasculaires, le diabète de type 2, et certains cancers.",
          "Contrairement à l'inflammation aiguë qui est une réponse normale et bénéfique du corps, l'inflammation chronique persiste dans le temps et peut endommager les tissus sains.",
        ],
      },
      {
        id: 'aliments-anti-inflammatoires',
        title: 'Les aliments à privilégier',
        content: [
          'Les fruits et légumes colorés sont riches en antioxydants et en composés anti-inflammatoires. Les baies, les épinards, le chou frisé et les tomates sont particulièrement bénéfiques.',
          "Les poissons gras comme le saumon, les sardines et le maquereau sont d'excellentes sources d'oméga-3, des acides gras aux puissantes propriétés anti-inflammatoires.",
          'Les épices comme le curcuma, le gingembre et la cannelle contiennent des composés anti-inflammatoires puissants qui peuvent être facilement intégrés à votre cuisine quotidienne.',
        ],
      },
      {
        id: 'aliments-eviter',
        title: 'Les aliments pro-inflammatoires à limiter',
        content: [
          "Les aliments ultra-transformés, riches en sucres raffinés et en graisses trans, favorisent l'inflammation. Limitez les sodas, les pâtisseries industrielles et les plats préparés.",
          "Les huiles végétales raffinées riches en oméga-6 (maïs, tournesol) peuvent déséquilibrer le ratio oméga-6/oméga-3 et promouvoir l'inflammation quand elles sont consommées en excès.",
          "L'alcool et les viandes transformées (charcuterie) doivent être consommés avec modération car ils peuvent exacerber l'inflammation.",
        ],
      },
      {
        id: 'mise-pratique',
        title: 'Mettre en pratique au quotidien',
        content: [
          "Commencez votre journée avec un smoothie anti-inflammatoire à base de baies, d'épinards et de graines de chia. Ajoutez une pincée de curcuma pour un boost supplémentaire.",
          "Intégrez des noix et des graines à vos collations. Les noix, amandes et graines de lin sont d'excellentes sources de graisses anti-inflammatoires.",
          "Préparez vos repas avec de l'huile d'olive extra vierge et des épices fraîches. Ajoutez généreusement des herbes aromatiques comme le basilic et le persil.",
        ],
      },
    ],
  },

  'superaliments-mythes-realites': {
    slug: 'superaliments-mythes-realites',
    category: 'nutrition',
    title: 'Superaliments : entre mythes et réalités',
    image:
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&h=600&fit=crop',
    publishedAt: '2024-11-05',
    readingTime: 9,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'introduction',
        title: 'Que sont les superaliments ?',
        content: [
          'Les superaliments sont des aliments naturels particulièrement riches en nutriments, antioxydants et composés bénéfiques pour la santé. Quinoa, baies de goji, spiruline, graines de chia... ces aliments ont gagné en popularité ces dernières années.',
          "Cependant, le terme 'superaliment' n'a pas de définition scientifique ou réglementaire précise. Il s'agit principalement d'un terme marketing.",
        ],
      },
      {
        id: 'mythes',
        title: 'Les mythes à déconstruire',
        content: [
          "Mythe 1 : Les superaliments peuvent guérir des maladies. En réalité, aucun aliment seul ne peut prévenir ou guérir une maladie. C'est l'ensemble de votre alimentation qui compte.",
          'Mythe 2 : Ils sont indispensables à une alimentation saine. Faux ! De nombreux aliments locaux et peu coûteux offrent des bienfaits similaires.',
          "Mythe 3 : Plus on en consomme, mieux c'est. Comme pour tout, la modération est de mise. Certains superaliments en excès peuvent avoir des effets indésirables.",
        ],
      },
      {
        id: 'realites',
        title: 'Les réalités nutritionnelles',
        content: [
          "Certains 'superaliments' ont effectivement une densité nutritionnelle élevée. Les baies, par exemple, sont riches en antioxydants et en vitamines.",
          'Le quinoa est une excellente source de protéines complètes et de fibres. Les graines de chia apportent des oméga-3 végétaux.',
          "Cependant, des aliments plus communs peuvent offrir des bénéfices similaires : les épinards, les myrtilles locales, les noix et les légumineuses sont tout aussi 'super'.",
        ],
      },
      {
        id: 'conclusion',
        title: 'Une approche équilibrée',
        content: [
          'Plutôt que de rechercher des aliments miracles, concentrez-vous sur une alimentation variée et colorée.',
          'Privilégiez les aliments entiers, locaux et de saison. Ils sont souvent plus frais, moins chers et tout aussi nutritifs que les superaliments exotiques.',
          "Si vous appréciez certains superaliments, intégrez-les à votre alimentation, mais ne négligez pas la diversité et l'équilibre global.",
        ],
      },
    ],
  },

  'proteines-vegetales': {
    slug: 'proteines-vegetales',
    category: 'nutrition',
    title: 'Protéines végétales : le guide complet',
    image:
      'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=600&fit=crop',
    publishedAt: '2024-10-25',
    readingTime: 8,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'introduction',
        title: 'Pourquoi les protéines végétales ?',
        content: [
          'Les protéines végétales gagnent en popularité pour des raisons de santé, environnementales et éthiques. Elles offrent une alternative nutritive aux protéines animales.',
          'Contrairement à une idée reçue, il est tout à fait possible de couvrir ses besoins en protéines avec une alimentation végétale bien planifiée.',
        ],
      },
      {
        id: 'sources',
        title: 'Les meilleures sources de protéines végétales',
        content: [
          "Les légumineuses (lentilles, pois chiches, haricots) sont d'excellentes sources de protéines, riches en fibres et en minéraux.",
          'Le tofu, le tempeh et les autres produits à base de soja offrent des protéines complètes de haute qualité.',
          'Les graines (chia, chanvre, courge) et les noix (amandes, noix de cajou) apportent protéines et graisses saines.',
          "Les céréales complètes comme le quinoa, l'avoine et le sarrasin contribuent également à l'apport protéique.",
        ],
      },
      {
        id: 'complementarite',
        title: 'La complémentarité des protéines',
        content: [
          "La plupart des protéines végétales sont dites 'incomplètes' car elles manquent d'un ou plusieurs acides aminés essentiels.",
          'En combinant différentes sources végétales au cours de la journée (légumineuses + céréales, par exemple), vous obtenez tous les acides aminés nécessaires.',
          "Il n'est pas nécessaire de combiner ces aliments dans un même repas. L'important est la diversité sur la journée.",
        ],
      },
      {
        id: 'conseils-pratiques',
        title: 'Intégrer les protéines végétales au quotidien',
        content: [
          "Ajoutez des légumineuses à vos salades, soupes et plats principaux. Une boîte de pois chiches rincée peut transformer n'importe quel repas.",
          'Préparez des curry de lentilles, des chilis végétariens ou des buddha bowls avec tofu mariné.',
          'Snackez sur des noix et des graines, ajoutez-les à vos smoothies ou saupoudrez-les sur vos yaourts.',
          "Expérimentez avec les alternatives végétales : burgers de haricots noirs, bolognaise de lentilles, 'steaks' de tempeh.",
        ],
      },
    ],
  },

  'omega-3-bienfaits': {
    slug: 'omega-3-bienfaits',
    category: 'nutrition',
    title: 'Les bienfaits des oméga-3 pour la santé',
    image:
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&h=600&fit=crop',
    publishedAt: '2024-10-20',
    readingTime: 7,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'que-sont-omega3',
        title: 'Que sont les oméga-3 ?',
        content: [
          "Les oméga-3 sont des acides gras essentiels que notre corps ne peut pas fabriquer lui-même. Nous devons donc les obtenir par l'alimentation.",
          "Il existe trois principaux types d'oméga-3 : l'ALA (origine végétale), l'EPA et le DHA (surtout d'origine marine).",
        ],
      },
      {
        id: 'bienfaits',
        title: 'Les bienfaits pour la santé',
        content: [
          "Les oméga-3 sont essentiels pour la santé cardiovasculaire. Ils aident à réduire l'inflammation, diminuer les triglycérides et stabiliser le rythme cardiaque.",
          'Ils jouent un rôle crucial dans la santé cérébrale et cognitive. Le DHA est un composant majeur du cerveau et important pour la mémoire et la concentration.',
          "Les oméga-3 ont des propriétés anti-inflammatoires qui peuvent aider dans diverses conditions, de l'arthrite aux maladies inflammatoires intestinales.",
        ],
      },
      {
        id: 'sources',
        title: 'Où trouver les oméga-3 ?',
        content: [
          "Les poissons gras sont les meilleures sources d'EPA et DHA : saumon, maquereau, sardines, anchois, hareng. Visez 2-3 portions par semaine.",
          "Sources végétales d'ALA : graines de lin moulues, graines de chia, noix de Grenoble, huile de colza et de lin.",
          "Les algues et certaines huiles d'algues peuvent fournir du DHA pour les végétariens et végétaliens.",
        ],
      },
      {
        id: 'conseils',
        title: 'Optimiser votre apport en oméga-3',
        content: [
          "Choisissez des poissons sauvages ou issus d'élevages responsables pour minimiser les contaminants.",
          "Conservez les graines de lin moulues et les huiles riches en oméga-3 au réfrigérateur pour éviter l'oxydation.",
          "Équilibrez votre ratio oméga-6/oméga-3 en limitant les huiles riches en oméga-6 (tournesol, maïs) et en privilégiant l'huile d'olive et de colza.",
        ],
      },
    ],
  },

  'sucres-caches': {
    slug: 'sucres-caches',
    category: 'nutrition',
    title: 'Sucres cachés : comment les identifier',
    image:
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop',
    publishedAt: '2024-10-15',
    readingTime: 6,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'probleme-sucres-caches',
        title: 'Le problème des sucres cachés',
        content: [
          'Les sucres ajoutés se cachent dans de nombreux aliments transformés, même ceux qui ne semblent pas sucrés : sauces, pains, charcuteries, plats préparés.',
          "Une consommation excessive de sucres ajoutés est liée à l'obésité, au diabète de type 2, aux maladies cardiovasculaires et à d'autres problèmes de santé.",
          "L'OMS recommande de limiter les sucres libres à moins de 10% de l'apport énergétique total, idéalement moins de 5%.",
        ],
      },
      {
        id: 'noms-sucre',
        title: 'Les nombreux noms du sucre',
        content: [
          'Le sucre se cache sous plus de 60 noms différents sur les étiquettes : sirop de glucose-fructose, dextrose, maltose, saccharose, miel, mélasse.',
          "Méfiez-vous des termes 'naturels' comme sirop d'agave, sirop de riz, jus de fruits concentré - ce sont aussi des sucres ajoutés.",
          "Tout ingrédient se terminant par '-ose' est un sucre : glucose, fructose, lactose, maltose, dextrose.",
        ],
      },
      {
        id: 'sources-courantes',
        title: 'Sources courantes de sucres cachés',
        content: [
          'Les boissons : sodas, jus de fruits, boissons énergisantes, thés glacés, eaux aromatisées. Une canette de soda contient environ 7 morceaux de sucre.',
          "Les produits 'santé' : barres de céréales, yaourts aux fruits, céréales petit-déjeuner, smoothies commerciaux.",
          'Les condiments et sauces : ketchup, sauce barbecue, vinaigrettes, sauces asiatiques. Une cuillère de ketchup = 1 morceau de sucre.',
          "Les aliments 'allégés' en matières grasses compensent souvent avec plus de sucre pour le goût.",
        ],
      },
      {
        id: 'reduire-consommation',
        title: 'Comment réduire votre consommation',
        content: [
          "Lisez les étiquettes ! Regardez la liste d'ingrédients (pas seulement le tableau nutritionnel). Si le sucre apparaît dans les 3 premiers ingrédients, le produit en contient beaucoup.",
          'Préparez vos propres sauces et vinaigrettes. Cuisinez maison autant que possible.',
          "Remplacez les boissons sucrées par de l'eau, du thé non sucré, ou de l'eau infusée avec des fruits.",
          "Réduisez progressivement : diminuez le sucre dans vos recettes, votre café, vos yaourts. Vos papilles s'adapteront.",
        ],
      },
    ],
  },

  'fibres-alimentaires': {
    slug: 'fibres-alimentaires',
    category: 'nutrition',
    title: "L'importance des fibres dans votre alimentation",
    image:
      'https://images.unsplash.com/photo-1507367218428-c9104f878385?w=800&h=600&fit=crop',
    publishedAt: '2024-10-10',
    readingTime: 5,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'que-sont-fibres',
        title: 'Que sont les fibres alimentaires ?',
        content: [
          'Les fibres sont des glucides complexes que notre système digestif ne peut pas décomposer. Elles traversent notre système digestif relativement intactes.',
          "Il existe deux types de fibres : solubles (se dissolvent dans l'eau) et insolubles (ne se dissolvent pas). Les deux sont importantes pour la santé.",
        ],
      },
      {
        id: 'bienfaits',
        title: 'Les bienfaits des fibres',
        content: [
          'Santé digestive : Les fibres favorisent un transit régulier, préviennent la constipation et nourrissent les bonnes bactéries intestinales.',
          "Contrôle du poids : Les aliments riches en fibres sont plus rassasiants et aident à contrôler l'appétit.",
          'Santé cardiovasculaire : Les fibres solubles aident à réduire le cholestérol sanguin.',
          "Régulation de la glycémie : Les fibres ralentissent l'absorption du sucre, évitant les pics glycémiques.",
        ],
      },
      {
        id: 'sources',
        title: 'Où trouver les fibres ?',
        content: [
          'Céréales complètes : pain complet, riz brun, quinoa, avoine, pâtes complètes.',
          'Légumineuses : lentilles, haricots, pois chiches - parmi les meilleures sources.',
          'Fruits et légumes : particulièrement ceux avec la peau, les baies, les pommes, les carottes, le brocoli.',
          'Noix et graines : amandes, graines de chia, graines de lin.',
        ],
      },
      {
        id: 'conseils',
        title: 'Augmenter progressivement',
        content: [
          'La recommandation est de 25-30g de fibres par jour, mais la plupart des gens en consomment beaucoup moins.',
          'Augmentez votre consommation progressivement pour éviter les inconforts digestifs.',
          "Buvez beaucoup d'eau - les fibres ont besoin d'eau pour fonctionner correctement.",
          'Privilégiez les aliments entiers plutôt que les suppléments de fibres.',
        ],
      },
    ],
  },

  'vitamines-essentielles': {
    slug: 'vitamines-essentielles',
    category: 'nutrition',
    title: 'Les vitamines essentielles et où les trouver',
    image:
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&h=600&fit=crop',
    publishedAt: '2024-10-05',
    readingTime: 9,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'vitamines-liposolubles',
        title: 'Les vitamines liposolubles (A, D, E, K)',
        content: [
          "Vitamine A : Essentielle pour la vision, l'immunité et la santé de la peau. Sources : carottes, patates douces, épinards, foie.",
          "Vitamine D : Cruciale pour les os et l'immunité. Sources : exposition au soleil, poissons gras, œufs, lait enrichi.",
          'Vitamine E : Antioxydant puissant. Sources : noix, graines, huiles végétales, épinards.',
          'Vitamine K : Importante pour la coagulation et la santé osseuse. Sources : légumes verts feuillus, brocoli, choux de Bruxelles.',
        ],
      },
      {
        id: 'vitamines-hydrosolubles',
        title: 'Les vitamines hydrosolubles (B et C)',
        content: [
          "Vitamine C : Antioxydant, soutient l'immunité. Sources : agrumes, poivrons, kiwis, fraises, brocoli.",
          "Vitamines B : Famille de 8 vitamines essentielles pour l'énergie, le système nerveux et la formation des cellules.",
          'B12 : Cruciale pour végétariens/végétaliens. Sources : produits animaux, aliments enrichis, suppléments.',
          'Folate (B9) : Essentiel pour les femmes enceintes. Sources : légumes verts, légumineuses, agrumes.',
        ],
      },
      {
        id: 'carences',
        title: 'Prévenir les carences',
        content: [
          'Une alimentation variée et colorée couvre généralement tous les besoins en vitamines.',
          'Certaines populations sont à risque : végétaliens (B12), personnes âgées (D), femmes enceintes (folate).',
          'Les carences se manifestent par fatigue, faiblesse, problèmes de peau, troubles cognitifs.',
        ],
      },
      {
        id: 'optimisation',
        title: "Optimiser l'absorption",
        content: [
          "Les vitamines liposolubles (A, D, E, K) nécessitent des graisses pour être absorbées. Ajoutez un peu d'huile à vos légumes.",
          'La vitamine C aide à absorber le fer. Combinez aliments riches en fer et en vitamine C.',
          "Certains modes de cuisson préservent mieux les vitamines : vapeur, four, cru. L'ébullition prolongée détruit les vitamines.",
        ],
      },
    ],
  },

  'index-glycemique': {
    slug: 'index-glycemique',
    category: 'nutrition',
    title: "Comprendre l'index glycémique des aliments",
    image:
      'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800&h=600&fit=crop',
    publishedAt: '2024-09-30',
    readingTime: 7,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'definition',
        title: "Qu'est-ce que l'index glycémique ?",
        content: [
          "L'index glycémique (IG) mesure la vitesse à laquelle un aliment contenant des glucides augmente la glycémie (taux de sucre dans le sang).",
          'Il est mesuré sur une échelle de 0 à 100. Le glucose pur a un IG de 100.',
          'IG bas (<55), IG moyen (56-69), IG élevé (>70).',
        ],
      },
      {
        id: 'importance',
        title: "Pourquoi c'est important",
        content: [
          'Les aliments à IG élevé provoquent des pics rapides de glycémie suivis de chutes brutales, causant fatigue, fringales et stockage des graisses.',
          'Les aliments à IG bas fournissent une énergie stable et durable, améliorent la satiété et aident à contrôler le poids.',
          'Gérer son IG est particulièrement important pour les diabétiques, mais bénéfique pour tous.',
        ],
      },
      {
        id: 'facteurs',
        title: "Facteurs influençant l'IG",
        content: [
          'Le type de glucide : Les glucides complexes ont généralement un IG plus bas que les sucres simples.',
          "La présence de fibres, protéines et graisses ralentit l'absorption et baisse l'IG.",
          'La transformation : Plus un aliment est raffiné, plus son IG est élevé. Le pain blanc a un IG plus élevé que le pain complet.',
          "La cuisson : La cuisson prolongée peut augmenter l'IG. Les pâtes al dente ont un IG plus bas que très cuites.",
        ],
      },
      {
        id: 'pratique',
        title: 'Application pratique',
        content: [
          'Privilégiez les céréales complètes : pain complet, riz brun, quinoa, avoine.',
          "Combinez toujours les glucides avec des protéines ou des graisses saines pour ralentir l'absorption.",
          'Ajoutez des légumes riches en fibres à vos repas.',
          'Limitez les aliments raffinés et transformés : pain blanc, pâtisseries, sodas, confiseries.',
        ],
      },
    ],
  },

  'mineraux-oligoelements': {
    slug: 'mineraux-oligoelements',
    category: 'nutrition',
    title: 'Minéraux et oligoéléments : rôles et sources',
    image:
      'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&h=600&fit=crop',
    publishedAt: '2024-09-25',
    readingTime: 8,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'macromineraux',
        title: 'Les macrominéraux essentiels',
        content: [
          'Calcium : Essentiel pour les os et les dents, la contraction musculaire. Sources : produits laitiers, légumes verts, sardines avec arêtes, tofu.',
          "Magnésium : Important pour l'énergie, le système nerveux, les muscles. Sources : noix, graines, légumes verts, légumineuses, chocolat noir.",
          "Potassium : Régule la pression artérielle, l'équilibre hydrique. Sources : bananes, patates douces, épinards, avocat, légumineuses.",
          "Fer : Transport de l'oxygène. Sources : viandes rouges, légumineuses, épinards, quinoa. Combiner avec vitamine C pour meilleure absorption.",
        ],
      },
      {
        id: 'oligoelements',
        title: 'Les oligoéléments importants',
        content: [
          'Zinc : Immunité, cicatrisation, fertilité. Sources : huîtres, viandes, légumineuses, noix, graines.',
          'Sélénium : Antioxydant, fonction thyroïdienne. Sources : noix du Brésil, poissons, œufs, céréales complètes.',
          'Iode : Fonction thyroïdienne. Sources : sel iodé, poissons, produits laitiers, algues.',
          'Chrome : Métabolisme du glucose. Sources : brocoli, céréales complètes, viandes maigres.',
        ],
      },
      {
        id: 'carences',
        title: 'Reconnaître et prévenir les carences',
        content: [
          'Les carences se manifestent par fatigue, faiblesse, troubles immunitaires, problèmes de peau, cheveux cassants.',
          'Populations à risque : femmes (fer), végétaliens (fer, zinc), personnes âgées (calcium, vitamine D).',
          "Une alimentation variée prévient généralement les carences. Les suppléments ne sont nécessaires qu'en cas de carence avérée.",
        ],
      },
      {
        id: 'optimisation',
        title: "Optimiser l'absorption",
        content: [
          'Fer : Associer sources végétales avec vitamine C. Éviter thé/café aux repas (inhibent absorption).',
          'Calcium : Ne pas dépasser 500mg par prise (absorption limitée). Espacer calcium et fer.',
          "Zinc : Les phytates des céréales/légumineuses peuvent réduire l'absorption. Trempage et germination aident.",
          "Équilibre : Certains minéraux sont en compétition. Un excès de l'un peut causer carence d'un autre.",
        ],
      },
    ],
  },

  // SANTÉ
  'microbiote-intestinal': {
    slug: 'microbiote-intestinal',
    category: 'sante',
    title: 'Prendre soin de son microbiote intestinal',
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop',
    publishedAt: '2024-12-05',
    readingTime: 10,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'qu-est-ce-microbiote',
        title: "Qu'est-ce que le microbiote intestinal ?",
        content: [
          "Le microbiote intestinal, anciennement appelé flore intestinale, est l'ensemble des micro-organismes qui colonisent notre tube digestif. Il comprend des billions de bactéries, virus, champignons et autres micro-organismes.",
          "Ce monde microscopique pèse environ 2 kg chez l'adulte et contient plus de cellules que notre propre corps. Il joue un rôle crucial dans notre digestion, notre immunité et même notre santé mentale.",
        ],
      },
      {
        id: 'roles-microbiote',
        title: 'Les rôles essentiels du microbiote',
        content: [
          "Le microbiote participe à la digestion et à l'absorption des nutriments. Certaines bactéries décomposent les fibres alimentaires que nous ne pouvons pas digérer seuls, produisant des acides gras bénéfiques.",
          "Il joue un rôle majeur dans notre système immunitaire. Environ 70% de nos cellules immunitaires résident dans l'intestin, et le microbiote aide à les éduquer et à les réguler.",
          "De plus en plus de recherches montrent un lien entre le microbiote et notre santé mentale via l'axe intestin-cerveau. Un microbiote déséquilibré peut influencer notre humeur et notre bien-être psychologique.",
        ],
      },
      {
        id: 'nourrir-microbiote',
        title: 'Comment nourrir votre microbiote',
        content: [
          'Les fibres prébiotiques sont la nourriture favorite des bonnes bactéries. On les trouve dans les légumes, les fruits, les légumineuses et les céréales complètes.',
          'Les aliments fermentés comme le yaourt, le kéfir, la choucroute et le kimchi apportent des probiotiques naturels qui enrichissent la diversité du microbiote.',
          "La diversité alimentaire est clé. Plus vous consommez une variété d'aliments végétaux différents, plus votre microbiote sera riche et résilient.",
        ],
      },
      {
        id: 'habitudes-proteger',
        title: 'Les habitudes qui protègent votre microbiote',
        content: [
          "Limitez les antibiotiques aux cas strictement nécessaires. Bien qu'essentiels pour traiter les infections bactériennes, ils perturbent le microbiote.",
          'Gérez votre stress. Le stress chronique peut altérer la composition du microbiote. Pratiquez des techniques de relaxation comme la méditation ou le yoga.',
          'Dormez suffisamment. Un sommeil de qualité est important pour maintenir un microbiote sain. Visez 7-9 heures de sommeil par nuit.',
          "Évitez les édulcorants artificiels et les émulsifiants présents dans les aliments ultra-transformés, car ils peuvent perturber l'équilibre microbien.",
        ],
      },
    ],
  },

  'systeme-immunitaire-alimentation': {
    slug: 'systeme-immunitaire-alimentation',
    category: 'sante',
    title: "Renforcer son système immunitaire par l'alimentation",
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    publishedAt: '2024-12-01',
    readingTime: 7,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'systeme-immunitaire',
        title: 'Comprendre le système immunitaire',
        content: [
          "Notre système immunitaire est un réseau complexe de cellules, de tissus et d'organes qui travaillent ensemble pour nous protéger contre les infections et les maladies.",
          "Une alimentation adéquate joue un rôle fondamental dans le maintien d'un système immunitaire fort et réactif.",
        ],
      },
      {
        id: 'nutriments-cles',
        title: "Les nutriments clés pour l'immunité",
        content: [
          'La vitamine C est un puissant antioxydant qui soutient la fonction immunitaire. On la trouve en abondance dans les agrumes, les kiwis, les poivrons et les brocolis.',
          "La vitamine D, souvent appelée 'vitamine du soleil', est cruciale pour l'immunité. En hiver, envisagez une supplémentation après consultation avec un professionnel de santé.",
          'Le zinc participe à la production et au fonctionnement des cellules immunitaires. Les sources incluent les fruits de mer, la viande, les légumineuses et les graines de courge.',
          'Les oméga-3 ont des propriétés anti-inflammatoires qui soutiennent une réponse immunitaire équilibrée. Consommez des poissons gras 2-3 fois par semaine.',
        ],
      },
      {
        id: 'aliments-immunite',
        title: 'Les super-aliments pour votre immunité',
        content: [
          "L'ail contient de l'allicine, un composé aux propriétés antimicrobiennes et immuno-stimulantes. Ajoutez-le cru ou légèrement cuit à vos plats.",
          'Le gingembre a des effets anti-inflammatoires et antioxydants. Utilisez-le frais dans vos thés, smoothies ou plats cuisinés.',
          'Les baies sont riches en antioxydants qui protègent les cellules immunitaires du stress oxydatif. Consommez-les fraîches ou surgelées.',
          "Les champignons comme les shiitakés contiennent des bêta-glucanes qui stimulent l'activité immunitaire.",
        ],
      },
      {
        id: 'mode-vie',
        title: 'Mode de vie et immunité',
        content: [
          "Au-delà de l'alimentation, d'autres facteurs influencent votre immunité. Un sommeil de qualité, une activité physique régulière et une bonne gestion du stress sont essentiels.",
          "Restez bien hydraté. L'eau aide à transporter les nutriments vers les cellules et à éliminer les toxines.",
          "Limitez l'alcool et le tabac qui affaiblissent le système immunitaire.",
        ],
      },
    ],
  },

  // BIEN-ÊTRE
  'gerer-stress-alimentation': {
    slug: 'gerer-stress-alimentation',
    category: 'bien-etre',
    title: "Gérer le stress par l'alimentation",
    image:
      'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&h=600&fit=crop',
    publishedAt: '2024-11-20',
    readingTime: 6,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'stress-alimentation',
        title: 'Le lien entre stress et alimentation',
        content: [
          'Le stress chronique affecte notre corps de nombreuses façons, notamment notre appétit, nos choix alimentaires et notre digestion.',
          'En période de stress, nous avons tendance à nous tourner vers des aliments réconfortants riches en sucre et en graisses, ce qui peut créer un cercle vicieux.',
          'Heureusement, certains aliments peuvent aider à réguler notre réponse au stress et soutenir notre système nerveux.',
        ],
      },
      {
        id: 'aliments-anti-stress',
        title: 'Les aliments anti-stress',
        content: [
          'Les aliments riches en magnésium comme les légumes verts, les noix et les graines aident à détendre les muscles et à calmer le système nerveux.',
          "Les glucides complexes augmentent la production de sérotonine, notre neurotransmetteur du bien-être. Privilégiez l'avoine, le quinoa et les patates douces.",
          'Les aliments riches en vitamine B, comme les œufs, le saumon et les légumineuses, soutiennent la santé du système nerveux.',
          "Le chocolat noir (70% de cacao minimum) contient des antioxydants et peut stimuler la production d'endorphines.",
        ],
      },
      {
        id: 'habitudes-alimentaires',
        title: 'Des habitudes alimentaires apaisantes',
        content: [
          "Mangez à heures régulières. Des repas réguliers aident à stabiliser la glycémie et l'humeur.",
          'Prenez le temps de mâcher et de savourer vos aliments. Manger en pleine conscience active le système nerveux parasympathique, favorisant la relaxation.',
          "Évitez l'excès de caféine qui peut exacerber l'anxiété. Limitez-vous à 1-2 tasses de café par jour, de préférence le matin.",
          "Restez hydraté. Même une légère déshydratation peut augmenter les niveaux de cortisol, l'hormone du stress.",
        ],
      },
      {
        id: 'rituels-bien-etre',
        title: 'Créer des rituels bien-être',
        content: [
          'Préparez une tisane relaxante en fin de journée. La camomille, la verveine et la passiflore ont des propriétés calmantes naturelles.',
          'Créez un environnement agréable pour vos repas. Éteignez les écrans, mettez de la musique douce et concentrez-vous sur le moment présent.',
          "Intégrez la respiration consciente avant les repas. Quelques respirations profondes activent le mode 'repos et digestion' de votre corps.",
        ],
      },
    ],
  },

  'sommeil-alimentation': {
    slug: 'sommeil-alimentation',
    category: 'bien-etre',
    title: "Comment l'alimentation influence votre sommeil",
    image:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=600&fit=crop',
    publishedAt: '2024-10-30',
    readingTime: 6,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'sommeil-nutrition',
        title: 'La connexion sommeil-nutrition',
        content: [
          "Notre alimentation a un impact direct sur la qualité de notre sommeil. Certains nutriments favorisent la production de mélatonine, l'hormone du sommeil, tandis que d'autres peuvent perturber notre repos nocturne.",
          'Un sommeil de qualité est également essentiel pour réguler nos hormones de la faim et de la satiété, créant ainsi une relation bidirectionnelle entre sommeil et alimentation.',
        ],
      },
      {
        id: 'aliments-favoriser',
        title: 'Les aliments qui favorisent le sommeil',
        content: [
          'Les aliments riches en tryptophane, un précurseur de la mélatonine, peuvent améliorer la qualité du sommeil. Le tryptophane se trouve dans la dinde, le poulet, les œufs, les noix et les graines.',
          'Les cerises, en particulier les cerises acidulées, sont une source naturelle de mélatonine et peuvent aider à réguler le cycle veille-sommeil.',
          "Les glucides complexes consommés le soir peuvent faciliter l'absorption du tryptophane. Une petite portion de flocons d'avoine ou de pain complet peut être bénéfique.",
          "Le kiwi contient des antioxydants et de la sérotonine qui peuvent améliorer la qualité du sommeil. Des études montrent qu'en consommer 2 avant le coucher peut être bénéfique.",
        ],
      },
      {
        id: 'aliments-eviter',
        title: "Ce qu'il faut éviter le soir",
        content: [
          "La caféine peut rester dans votre système jusqu'à 6 heures. Évitez le café, le thé, le chocolat et certains sodas après 15h.",
          "L'alcool peut vous aider à vous endormir mais perturbe les phases de sommeil profond. Limitez votre consommation, surtout en soirée.",
          'Les repas lourds et gras le soir peuvent causer des inconforts digestifs et perturber le sommeil. Dînez léger et au moins 2-3 heures avant le coucher.',
          "Les aliments épicés peuvent causer des brûlures d'estomac et augmenter la température corporelle, rendant l'endormissement difficile.",
        ],
      },
      {
        id: 'routine-soiree',
        title: 'Créer une routine alimentaire du soir',
        content: [
          'Dînez à heures fixes, idéalement 2-3 heures avant le coucher. Cela donne à votre corps le temps de digérer.',
          "Si vous avez faim avant de dormir, optez pour une collation légère comme une banane avec du beurre d'amande ou un yaourt nature.",
          'Préparez une tisane relaxante. La camomille, la valériane et la passiflore sont réputées pour leurs propriétés apaisantes.',
          'Évitez les écrans pendant que vous mangez votre collation du soir. La lumière bleue peut perturber la production de mélatonine.',
        ],
      },
    ],
  },

  // RECETTES
  'petit-dejeuner-energetique': {
    slug: 'petit-dejeuner-energetique',
    category: 'recettes',
    title: '5 petits-déjeuners énergétiques pour bien commencer la journée',
    image:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=600&fit=crop',
    publishedAt: '2024-11-15',
    readingTime: 5,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'importance-petit-dejeuner',
        title: "L'importance du petit-déjeuner",
        content: [
          "Le petit-déjeuner est souvent considéré comme le repas le plus important de la journée. Il rompt le jeûne nocturne et fournit l'énergie nécessaire pour bien démarrer.",
          'Un petit-déjeuner équilibré devrait combiner des glucides complexes, des protéines et des graisses saines pour une énergie durable.',
        ],
      },
      {
        id: 'overnight-oats',
        title: '1. Overnight oats aux fruits rouges',
        content: [
          "Les overnight oats sont parfaits pour les matins pressés. Préparez-les la veille en mélangeant 60g de flocons d'avoine avec 200ml de lait (végétal ou animal).",
          'Ajoutez une cuillère à soupe de graines de chia, une pincée de cannelle et laissez reposer au réfrigérateur toute la nuit.',
          "Le matin, garnissez de fruits rouges frais, d'amandes effilées et d'un filet de miel. Ce petit-déjeuner apporte fibres, protéines et antioxydants.",
        ],
      },
      {
        id: 'bowl-proteine',
        title: '2. Bowl protéiné aux œufs et avocat',
        content: [
          "Pour un petit-déjeuner salé et rassasiant, préparez un bowl avec une base de quinoa cuit (préparé à l'avance).",
          "Ajoutez 2 œufs mollets ou pochés, la moitié d'un avocat en tranches, une poignée d'épinards frais et des tomates cerises.",
          "Assaisonnez avec du jus de citron, de l'huile d'olive, du sel et du poivre. Ce bowl fournit des protéines de qualité et des graisses saines.",
        ],
      },
      {
        id: 'smoothie-bowl',
        title: '3. Smoothie bowl vert énergisant',
        content: [
          "Mixez une banane congelée, une poignée d'épinards, une demi-pomme, 200ml de lait végétal et une cuillère à soupe de beurre d'amande.",
          'Versez dans un bol et garnissez de granola maison, de kiwi en tranches, de noix de coco râpée et de graines de chia.',
          'Ce smoothie bowl est riche en vitamines, minéraux et fibres, parfait pour démarrer la journée avec vitalité.',
        ],
      },
      {
        id: 'tartines-gourmandes',
        title: '4. Tartines gourmandes aux multiples saveurs',
        content: [
          'Utilisez du pain complet ou au levain comme base. Préparez deux variantes : une sucrée et une salée.',
          "Tartine sucrée : purée d'amande + banane en rondelles + cannelle + graines de lin.",
          'Tartine salée : fromage frais + saumon fumé + avocat + graines de sésame.',
          'Ces tartines combinent glucides complexes, protéines et graisses pour une satiété prolongée.',
        ],
      },
      {
        id: 'parfait-yaourt',
        title: '5. Parfait au yaourt grec',
        content: [
          'Dans un grand verre ou un bol, alternez des couches de yaourt grec nature, de fruits frais (baies, mangue, kiwi), et de granola ou de muesli.',
          'Ajoutez une touche de miel entre les couches pour la douceur. Terminez par quelques noix concassées et des graines de grenade.',
          'Ce parfait est riche en protéines grâce au yaourt grec et apporte une belle variété de textures et de saveurs.',
        ],
      },
    ],
  },

  'bowls-equilibres': {
    slug: 'bowls-equilibres',
    category: 'recettes',
    title: 'Bowls équilibrés : 10 recettes colorées et nutritives',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    publishedAt: '2024-11-08',
    readingTime: 6,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'philosophie-bowls',
        title: 'La philosophie des bowls équilibrés',
        content: [
          'Les bowls sont devenus une tendance culinaire majeure, et pour de bonnes raisons. Ils permettent de combiner facilement tous les groupes alimentaires dans un seul repas visuellement attrayant.',
          "La formule gagnante d'un bowl équilibré : une base de céréales complètes, des protéines de qualité, une abondance de légumes, des graisses saines et une sauce savoureuse.",
        ],
      },
      {
        id: 'bowl-mediterraneen',
        title: 'Bowl méditerranéen au quinoa',
        content: [
          'Base : quinoa cuit. Protéines : pois chiches rôtis au four avec du paprika. Légumes : tomates cerises, concombre, poivrons, olives kalamata.',
          "Ajoutez de la feta émiettée, des feuilles de menthe fraîche et arrosez d'une vinaigrette au citron et à l'huile d'olive.",
          'Ce bowl est inspiré de la cuisine méditerranéenne, reconnue pour ses bienfaits sur la santé cardiovasculaire.',
        ],
      },
      {
        id: 'bowl-asiatique',
        title: 'Bowl asiatique au tofu',
        content: [
          'Base : riz complet ou vermicelles de riz. Protéines : tofu mariné et grillé (sauce soja, gingembre, ail).',
          'Légumes : edamame, carottes râpées, chou rouge, concombre, avocat. Garnissez de graines de sésame et de coriandre fraîche.',
          "Sauce : mélangez de la sauce soja, du vinaigre de riz, du gingembre râpé, une touche de miel et de l'huile de sésame.",
        ],
      },
      {
        id: 'bowl-mexicain',
        title: 'Bowl mexicain aux haricots noirs',
        content: [
          'Base : riz brun ou farro. Protéines : haricots noirs assaisonnés au cumin. Légumes : maïs grillé, poivrons, tomates, avocat.',
          'Ajoutez un peu de fromage râpé, de la salsa fraîche et quelques chips de tortilla écrasées pour le crunchy.',
          'Sauce : crème sure mélangée avec du jus de lime et de la coriandre hachée.',
        ],
      },
      {
        id: 'conseils-preparation',
        title: 'Conseils de préparation et conservation',
        content: [
          'Préparez vos bases de céréales en grande quantité le dimanche pour toute la semaine. Elles se conservent 4-5 jours au réfrigérateur.',
          "Coupez vos légumes à l'avance et conservez-les dans des contenants hermétiques. Certains, comme les carottes et le céleri, se conservent mieux dans l'eau.",
          "Gardez les sauces séparées jusqu'au moment de servir pour éviter que votre bowl ne devienne détrempé.",
          "N'hésitez pas à improviser avec ce que vous avez dans votre frigo. Les bowls sont parfaits pour utiliser les restes.",
        ],
      },
    ],
  },

  // CONSEILS
  'hydratation-importance': {
    slug: 'hydratation-importance',
    category: 'conseils',
    title: "L'importance de l'hydratation pour votre santé",
    image:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    publishedAt: '2024-11-10',
    readingTime: 4,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'pourquoi-hydrater',
        title: "Pourquoi l'hydratation est essentielle",
        content: [
          "L'eau représente environ 60% de notre poids corporel et est impliquée dans pratiquement toutes les fonctions de notre organisme.",
          'Elle régule la température corporelle, transporte les nutriments, élimine les déchets, lubrifie les articulations et maintient le volume sanguin.',
          'Une hydratation adéquate améliore les performances physiques et cognitives, la digestion, et contribue à une peau saine.',
        ],
      },
      {
        id: 'combien-boire',
        title: 'Quelle quantité boire quotidiennement ?',
        content: [
          "Les recommandations générales suggèrent 1,5 à 2 litres d'eau par jour pour un adulte, mais les besoins varient selon l'activité physique, le climat et l'état de santé.",
          'Les personnes actives, en période de chaleur, ou qui allaitent ont des besoins accrus. Écoutez votre corps : la soif est un bon indicateur.',
          "La couleur de l'urine est un indicateur pratique : elle devrait être jaune pâle. Une urine foncée suggère une déshydratation.",
        ],
      },
      {
        id: 'sources-hydratation',
        title: "Les différentes sources d'hydratation",
        content: [
          "L'eau pure reste la meilleure option, mais les tisanes non sucrées, les soupes, et les bouillons contribuent également à l'hydratation.",
          "Les fruits et légumes riches en eau comme le concombre, la pastèque, les fraises et les tomates apportent aussi de l'hydratation.",
          'Attention aux boissons sucrées et à la caféine en excès qui peuvent avoir un léger effet diurétique.',
        ],
      },
      {
        id: 'astuces-hydratation',
        title: 'Astuces pour rester bien hydraté',
        content: [
          "Gardez une bouteille d'eau réutilisable avec vous tout au long de la journée. La voir vous rappellera de boire régulièrement.",
          "Buvez un verre d'eau au réveil pour réhydrater votre corps après la nuit. Ajoutez une rondelle de citron pour un coup de boost.",
          'Créez des rappels sur votre téléphone si vous avez tendance à oublier de boire.',
          "Infusez votre eau avec des fruits frais, des herbes ou du concombre pour varier les plaisirs et rendre l'hydratation plus attractive.",
        ],
      },
    ],
  },

  'lire-etiquettes-alimentaires': {
    slug: 'lire-etiquettes-alimentaires',
    category: 'conseils',
    title: 'Apprendre à lire les étiquettes alimentaires',
    image:
      'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=800&h=600&fit=crop',
    publishedAt: '2024-11-05',
    readingTime: 6,
    author: {
      name: 'Lucie Cornille',
      title: 'Diététicienne-nutritionniste ASCA/RME',
    },
    editor: {
      name: 'Dr. Sophie Martin',
      title: 'Médecin nutritionniste',
    },
    sections: [
      {
        id: 'comprendre-etiquettes',
        title: 'Comprendre les étiquettes nutritionnelles',
        content: [
          'Les étiquettes nutritionnelles fournissent des informations essentielles sur la composition des aliments. Savoir les lire vous permet de faire des choix éclairés.',
          "L'étiquette comprend généralement : la liste des ingrédients, les valeurs nutritionnelles, la portion de référence, et parfois des allégations nutritionnelles.",
        ],
      },
      {
        id: 'liste-ingredients',
        title: 'Décrypter la liste des ingrédients',
        content: [
          'Les ingrédients sont listés par ordre décroissant de poids. Le premier ingrédient est celui présent en plus grande quantité.',
          "Méfiez-vous des listes d'ingrédients trop longues avec de nombreux additifs, conservateurs ou noms compliqués que vous ne reconnaissez pas.",
          'Repérez les sucres cachés : sirop de glucose, dextrose, maltose, sirop de maïs, jus de fruit concentré sont tous des formes de sucre.',
          'Une règle simple : si la liste contient plus de 5 ingrédients que vous ne pourriez pas trouver dans votre cuisine, réfléchissez à deux fois.',
        ],
      },
      {
        id: 'tableau-nutritionnel',
        title: 'Analyser le tableau nutritionnel',
        content: [
          "Regardez d'abord la taille de la portion de référence. Les valeurs nutritionnelles sont souvent données pour 100g, mais la portion réelle consommée peut être différente.",
          'Calories : Comparez par rapport à vos besoins quotidiens (environ 2000 kcal pour un adulte moyen).',
          'Lipides : Privilégiez les produits faibles en graisses saturées et trans. Les graisses insaturées sont plus bénéfiques.',
          'Glucides et sucres : Distinguez les sucres naturellement présents (fruits, lait) des sucres ajoutés. Limitez ces derniers.',
          'Protéines et fibres : Recherchez des produits riches en ces nutriments pour une meilleure satiété.',
        ],
      },
      {
        id: 'pieges-eviter',
        title: 'Les pièges marketing à éviter',
        content: [
          "'Naturel' ne signifie pas nécessairement sain. Le sucre et le beurre sont naturels mais doivent être consommés avec modération.",
          "'Faible en gras' ou 'light' : Ces produits peuvent compenser en ajoutant du sucre ou du sel. Lisez toujours l'étiquette complète.",
          "'Sans sucre ajouté' ne signifie pas sans sucre. Le produit peut contenir des sucres naturels ou des édulcorants.",
          "Les allégations 'riche en protéines' ou 'source de fibres' sont réglementées mais vérifiez les quantités réelles dans le tableau nutritionnel.",
        ],
      },
      {
        id: 'conseils-pratiques',
        title: 'Conseils pratiques pour vos courses',
        content: [
          "Privilégiez les aliments avec une liste d'ingrédients courte et reconnaissable.",
          'Comparez les produits similaires en regardant les valeurs pour 100g, pas seulement par portion.',
          'Utilisez des applications de scan de produits pour vous aider à décoder rapidement les étiquettes (Yuka, Open Food Facts).',
          "Rappelez-vous que le meilleur aliment est souvent celui qui n'a pas besoin d'étiquette : fruits, légumes, légumineuses en vrac.",
        ],
      },
    ],
  },
};

/**
 * Récupère un article par son slug
 */
export function getArticleBySlug(slug: string): ArticleContent | undefined {
  const article = articles[slug];

  if (!article) {
    return undefined;
  }

  // Ajouter les articles similaires (même catégorie, maximum 6)
  const relatedArticles = getRelatedArticles(article.category, slug, 6);

  return {
    ...article,
    relatedArticles,
  };
}

/**
 * Récupère tous les articles d'une catégorie
 */
export function getArticlesByCategory(category: string): ArticleContent[] {
  return Object.values(articles).filter(
    article => article.category === category
  );
}

/**
 * Récupère les articles similaires (même catégorie, en excluant l'article actuel)
 */
export function getRelatedArticles(
  category: string,
  currentSlug: string,
  limit: number = 6
) {
  return Object.values(articles)
    .filter(
      article => article.category === category && article.slug !== currentSlug
    )
    .slice(0, limit)
    .map(article => ({
      slug: article.slug,
      category: article.category,
      title: article.title,
      image: article.image,
      author: article.author.name,
    }));
}

/**
 * Récupère tous les slugs d'articles
 */
export function getAllArticleSlugs(): string[] {
  return Object.keys(articles);
}
