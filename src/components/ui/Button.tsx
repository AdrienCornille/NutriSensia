import * as React from 'react';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Variantes de style pour le Button (shadcn compatible)
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline:
          'border border-primary text-primary hover:bg-primary hover:text-white',
        secondary: 'bg-secondary text-text hover:bg-secondary-dark',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        primary:
          'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
        accent: 'bg-accent text-white hover:bg-accent-dark focus:ring-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        md: 'px-6 py-3',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Interface étendue pour supporter à la fois l'API existante et shadcn
interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

/**
 * Composant Button pour le Design System 2025
 *
 * Ce composant applique automatiquement les styles, couleurs et animations
 * selon les spécifications du design system.
 * Compatible avec shadcn/ui et l'API existante.
 *
 * @param children - Contenu du bouton
 * @param variant - Style du bouton (primary, secondary, accent, outline, ghost, link, default, destructive)
 * @param size - Taille du bouton (sm, md, lg, icon, default)
 * @param fullWidth - Bouton en pleine largeur
 * @param loading - État de chargement
 * @param asChild - Si true, délègue le rendu à l'enfant (pour shadcn compat)
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant,
      size,
      fullWidth = false,
      loading = false,
      asChild = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && 'w-full',
          loading && 'cursor-wait'
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className='animate-spin -ml-1 mr-2 h-4 w-4'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// Export les variantes pour utilisation externe si nécessaire
export { buttonVariants };

/**
 * Composant ButtonGroup pour grouper des boutons
 */
export function ButtonGroup({
  children,
  className = '',
  orientation = 'horizontal',
}: {
  children: ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <div
      className={cn(
        'flex',
        orientation === 'vertical'
          ? 'flex-col space-y-2'
          : 'flex-row space-x-2',
        className
      )}
    >
      {children}
    </div>
  );
}
