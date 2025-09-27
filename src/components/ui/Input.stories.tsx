import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input, StandardInput, SearchInput, Textarea } from './Input';
import { withFormContext, withPadding } from '../../../.storybook/decorators';

const meta: Meta<typeof Input> = {
  title: 'Design System/Components/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: `
## Champs de saisie - Design System NutriSensia

Les champs de saisie permettent aux utilisateurs d'entrer des informations dans l'application.

### Caractéristiques
- **Hauteur standard** : 56dp pour les inputs, 44dp pour la recherche
- **Contraste** : Conforme WCAG 2.1 AA (4.5:1 minimum)
- **Focus visible** : Indicateur de focus avec couleur primaire
- **Validation** : États d'erreur et de succès avec messages
- **Accessibilité** : Labels, descriptions et attributs ARIA

### Variantes
- **Standard** : Champ de saisie standard (56dp)
- **Search** : Champ de recherche avec icônes (44dp)
- **Textarea** : Zone de texte multi-lignes

### États
- **Normal** : État par défaut
- **Focus** : État de focus actif
- **Error** : État d'erreur avec message
- **Success** : État de succès
- **Disabled** : État désactivé
- **Loading** : État de chargement

### Tailles
- **sm** : 48dp de hauteur
- **md** : 56dp de hauteur (par défaut)
- **lg** : 64dp de hauteur
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['standard', 'search', 'textarea'],
      description: 'Variante du champ',
    },
    inputSize: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Taille du champ',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'État désactivé',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'État de chargement',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Champ requis',
    },
    label: {
      control: { type: 'text' },
      description: 'Label du champ',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder',
    },
    helperText: {
      control: { type: 'text' },
      description: "Texte d'aide",
    },
    error: {
      control: { type: 'text' },
      description: "Message d'erreur",
    },
  },
  decorators: [withFormContext],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story de base
export const Default: Story = {
  args: {
    label: 'Nom complet',
    placeholder: 'Entrez votre nom complet',
    variant: 'standard',
    inputSize: 'md',
  },
};

// Story avec toutes les variantes
export const AllVariants: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>Champ Standard</h3>
        <StandardInput
          label='Adresse email'
          placeholder='votre@email.com'
          helperText='Nous ne partagerons jamais votre email'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Champ de Recherche
        </h3>
        <SearchInput
          placeholder='Rechercher des patients...'
          leftIcon={<SearchIcon />}
          rightIcon={<FilterIcon />}
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>Zone de Texte</h3>
        <Textarea
          label='Notes de consultation'
          placeholder='Décrivez les observations et recommandations...'
          rows={4}
          helperText='Maximum 500 caractères'
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Toutes les variantes de champs de saisie disponibles dans le design system.',
      },
    },
  },
};

// Story avec toutes les tailles
export const AllSizes: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Taille Small (48dp)
        </h3>
        <StandardInput label='Nom' placeholder='Votre nom' inputSize='sm' />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Taille Medium (56dp)
        </h3>
        <StandardInput
          label='Prénom'
          placeholder='Votre prénom'
          inputSize='md'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Taille Large (64dp)
        </h3>
        <StandardInput
          label='Email'
          placeholder='votre@email.com'
          inputSize='lg'
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Toutes les tailles de champs disponibles. La taille medium (56dp) est recommandée pour l'accessibilité.",
      },
    },
  },
};

// Story avec états
export const States: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>État normal</h3>
        <StandardInput label='Nom complet' placeholder='Entrez votre nom' />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>État avec erreur</h3>
        <StandardInput
          label='Numéro AVS'
          placeholder='756.9217.0769.85'
          error='Format invalide. Utilisez le format XXX.XXXX.XXXX.XX'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>État avec succès</h3>
        <StandardInput
          label='Email'
          placeholder='votre@email.com'
          value='utilisateur@example.com'
          helperText='Email valide'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>État désactivé</h3>
        <StandardInput
          label="Nom d'utilisateur"
          placeholder="Nom d'utilisateur"
          disabled
          helperText='Ce champ ne peut pas être modifié'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          État de chargement
        </h3>
        <StandardInput
          label='Recherche de patients'
          placeholder='Recherche en cours...'
          loading
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Les différents états des champs de saisie : normal, erreur, succès, désactivé et chargement.',
      },
    },
  },
};

// Story avec icônes
export const WithIcons: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Champ avec icône à gauche
        </h3>
        <StandardInput
          label='Téléphone'
          placeholder='+41 79 123 45 67'
          leftIcon={<PhoneIcon />}
          helperText='Format suisse recommandé'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Champ avec icône à droite
        </h3>
        <StandardInput
          label='Mot de passe'
          type='password'
          placeholder='Entrez votre mot de passe'
          rightIcon={<EyeIcon />}
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Champ avec icônes des deux côtés
        </h3>
        <StandardInput
          label='Montant'
          placeholder='0.00'
          leftIcon={<CurrencyIcon />}
          rightIcon={<CalculatorIcon />}
          helperText='Montant en CHF'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Recherche avec icônes
        </h3>
        <SearchInput
          placeholder='Rechercher des consultations...'
          leftIcon={<SearchIcon />}
          rightIcon={<CalendarIcon />}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Champs avec icônes à gauche, à droite ou des deux côtés pour améliorer la compréhension.',
      },
    },
  },
};

// Story avec validation
export const Validation: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Validation en temps réel
        </h3>
        <StandardInput
          label='Numéro AVS'
          placeholder='756.9217.0769.85'
          helperText='Format: XXX.XXXX.XXXX.XX'
          error='Numéro AVS invalide. Vérifiez le format.'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>Champ requis</h3>
        <StandardInput
          label='Nom de famille'
          placeholder='Votre nom de famille'
          required
          helperText='Ce champ est obligatoire'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Validation d&apos;email
        </h3>
        <StandardInput
          label='Adresse email'
          type='email'
          placeholder='votre@email.com'
          helperText='Nous vous enverrons un email de confirmation'
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Validation de mot de passe
        </h3>
        <StandardInput
          label='Nouveau mot de passe'
          type='password'
          placeholder='Entrez votre nouveau mot de passe'
          helperText='Minimum 8 caractères, avec majuscule et chiffre'
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Exemples de validation de formulaires avec messages d&apos;erreur et d&apos;aide.',
      },
    },
  },
};

// Story d'accessibilité
export const Accessibility: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h3 className='text-h4 text-neutral-dark mb-8dp'>
          Tests d&apos;accessibilité
        </h3>
        <ul className='text-body text-neutral-medium space-y-4dp'>
          <li>• Utilisez Tab pour naviguer entre les champs</li>
          <li>• Vérifiez que les labels sont associés aux champs</li>
          <li>• Testez avec un lecteur d&apos;écran</li>
          <li>• Vérifiez que les messages d&apos;erreur sont annoncés</li>
        </ul>
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Champ avec aria-describedby
        </h3>
        <StandardInput
          label='Numéro de téléphone'
          placeholder='+41 79 123 45 67'
          aria-describedby='phone-help phone-error'
        />
        <p id='phone-help' className='text-caption text-neutral-medium mt-4dp'>
          Format suisse recommandé
        </p>
        <p
          id='phone-error'
          className='text-caption text-functional-error mt-4dp'
          role='alert'
        >
          Numéro de téléphone invalide
        </p>
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Champ avec aria-required
        </h3>
        <StandardInput
          label="Nom d'utilisateur"
          placeholder="Choisissez un nom d'utilisateur"
          aria-required='true'
          required
        />
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Champ avec aria-invalid
        </h3>
        <StandardInput
          label='Code postal'
          placeholder='1000'
          aria-invalid='true'
          error='Code postal invalide'
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Exemples d&apos;utilisation des attributs ARIA pour améliorer l&apos;accessibilité des champs de saisie.',
      },
    },
  },
};

// Icônes pour les stories
const SearchIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
      clipRule='evenodd'
    />
  </svg>
);

const FilterIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z'
      clipRule='evenodd'
    />
  </svg>
);

const PhoneIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
  </svg>
);

const EyeIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
    <path
      fillRule='evenodd'
      d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
      clipRule='evenodd'
    />
  </svg>
);

const CurrencyIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z'
      clipRule='evenodd'
    />
  </svg>
);

const CalculatorIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4-1a1 1 0 100 2v1a1 1 0 11-2 0v-1a1 1 0 012 0zm2-4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1z'
      clipRule='evenodd'
    />
  </svg>
);

const CalendarIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
      clipRule='evenodd'
    />
  </svg>
);
