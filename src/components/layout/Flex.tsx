import React from 'react';
import { cn } from '@/lib/utils';

export interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  directionSm?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  directionMd?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  directionLg?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  directionXl?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gapX?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gapY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant Flex responsive avec alignement et distribution flexibles
 *
 * @param direction - Direction du flex (row, col, etc.)
 * @param align - Alignement des éléments (start, center, end, etc.)
 * @param justify - Distribution des éléments (start, center, between, etc.)
 * @param wrap - Gestion du wrapping (nowrap, wrap, wrap-reverse)
 * @param gap - Espacement entre les éléments
 */
export function Flex({
  children,
  className,
  direction = 'row',
  directionSm,
  directionMd,
  directionLg,
  directionXl,
  align,
  justify,
  wrap,
  gap = 'none',
  gapX,
  gapY,
  as: Component = 'div',
  ...props
}: FlexProps) {
  const getDirectionClass = (breakpoint: string, dir?: string) => {
    if (!dir) return '';
    return `${breakpoint}:flex-${dir}`;
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-8dp',
    md: 'gap-16dp',
    lg: 'gap-24dp',
    xl: 'gap-32dp',
  };

  const gapXClasses = {
    none: 'gap-x-0',
    sm: 'gap-x-8dp',
    md: 'gap-x-16dp',
    lg: 'gap-x-24dp',
    xl: 'gap-x-32dp',
  };

  const gapYClasses = {
    none: 'gap-y-0',
    sm: 'gap-y-8dp',
    md: 'gap-y-16dp',
    lg: 'gap-y-24dp',
    xl: 'gap-y-32dp',
  };

  const flexClasses = [
    'flex',
    `flex-${direction}`,
    getDirectionClass('sm', directionSm),
    getDirectionClass('md', directionMd),
    getDirectionClass('lg', directionLg),
    getDirectionClass('xl', directionXl),
    align && alignClasses[align],
    justify && justifyClasses[justify],
    wrap && wrapClasses[wrap],
    gapX ? gapXClasses[gapX] : gapClasses[gap],
    gapY && gapYClasses[gapY],
  ].filter(Boolean);

  return (
    <Component className={cn(flexClasses, className)} {...props}>
      {children}
    </Component>
  );
}

export interface FlexItemProps {
  children: React.ReactNode;
  className?: string;
  grow?: boolean;
  shrink?: boolean;
  basis?: 'auto' | '0' | 'full' | '1/2' | '1/3' | '1/4' | '1/5' | '1/6';
  order?:
    | 'first'
    | 'last'
    | 'none'
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant FlexItem pour contrôler le comportement des éléments flex
 */
export function FlexItem({
  children,
  className,
  grow = false,
  shrink = true,
  basis = 'auto',
  order,
  as: Component = 'div',
  ...props
}: FlexItemProps) {
  const basisClasses = {
    auto: 'flex-basis-auto',
    '0': 'flex-basis-0',
    full: 'flex-basis-full',
    '1/2': 'flex-basis-1/2',
    '1/3': 'flex-basis-1/3',
    '1/4': 'flex-basis-1/4',
    '1/5': 'flex-basis-1/5',
    '1/6': 'flex-basis-1/6',
  };

  const orderClasses = {
    first: 'order-first',
    last: 'order-last',
    none: 'order-none',
  };

  const flexItemClasses = [
    grow ? 'flex-grow' : 'flex-grow-0',
    shrink ? 'flex-shrink' : 'flex-shrink-0',
    basisClasses[basis],
    order &&
      (typeof order === 'number' ? `order-${order}` : orderClasses[order]),
  ].filter(Boolean);

  return (
    <Component className={cn(flexItemClasses, className)} {...props}>
      {children}
    </Component>
  );
}

export default Flex;
