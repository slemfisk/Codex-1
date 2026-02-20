import * as React from 'react';
import { cva } from 'class-variance-authority';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition', {
  variants: {
    variant: {
      default: 'bg-accent text-black hover:opacity-90',
      ghost: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
    }
  },
  defaultVariants: { variant: 'default' }
});

export function Button({ className, variant, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'ghost' }) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('rounded-xl border border-zinc-800 bg-panel p-4', className)} {...props} />;

export const Tabs = TabsPrimitive.Root;
export const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => <TabsPrimitive.List className={cn('flex gap-2 rounded-lg bg-zinc-900 p-2', className)} {...props} />;
export const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => <TabsPrimitive.Trigger className={cn('rounded-md px-3 py-2 text-sm data-[state=active]:bg-accent data-[state=active]:text-black', className)} {...props} />;
export const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => <TabsPrimitive.Content className={cn('mt-4', className)} {...props} />;
