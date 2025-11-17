'use client';

import * as SwitchPrimitives from '@radix-ui/react-switch';
import { Check, X } from 'lucide-react';
import * as React from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const StatusSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  const tooltipClass = props.checked
    ? 'text-md bg-transparent border border-red-500 text-red-700'
    : 'text-md bg-transparent border border-green-500 text-green-700';

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <SwitchPrimitives.Root
              ref={ref}
              className={cn(
                'peer relative inline-flex h-8 w-20 cursor-pointer items-center rounded-full transition-all',
                'data-[state=checked]:bg-[#4CAF50] data-[state=unchecked]:bg-[#E57373]',
                'shadow-lg border border-white/40',
                className,
              )}
              {...props}
            >
              <SwitchPrimitives.Thumb
                className={cn(
                  'pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-white transition-all shadow-xl',
                  'data-[state=checked]:translate-x-[3.0rem]',
                  'data-[state=unchecked]:translate-x-1',
                )}
              />

              {/* Check icon */}
              <Check
                className={cn(
                  'absolute left-2 h-5 w-5 text-white transition-opacity',
                  props.checked ? 'opacity-100' : 'opacity-0',
                )}
                strokeWidth={3}
              />

              {/* X icon */}
              <X
                className={cn(
                  'absolute right-2 h-5 w-5 text-white transition-opacity',
                  props.checked ? 'opacity-0' : 'opacity-100',
                )}
                strokeWidth={3}
              />
            </SwitchPrimitives.Root>
          </span>
        </TooltipTrigger>
        {/* <TooltipContent className={tooltipClass} side="right">
          <p>{props.checked ? 'Deactivate' : 'Activate'}</p>
        </TooltipContent> */}
      </Tooltip>
    </TooltipProvider>
  );
});

StatusSwitch.displayName = 'StatusSwitch';

export { StatusSwitch };
