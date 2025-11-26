import { ArrowRight } from 'lucide-react';
import React from 'react';

interface SlideArrowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  reverse?: boolean;
}

export default function SlideArrowButton({
  text = 'Get Started',
  reverse = false,
  className = '',
  ...props
}: SlideArrowButtonProps) {
  const buttonClasses = reverse
    ? 'bg-primary text-primary-foreground hover:bg-background hover:text-foreground'
    : 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground';

  const divClasses = reverse
    ? 'bg-transparent w-11 group-hover:bg-background group-hover:w-full'
    : 'bg-transparent w-11 group-hover:bg-primary group-hover:w-full';

  const arrowClasses = reverse
    ? 'text-primary-foreground group-hover:text-foreground'
    : 'text-foreground group-hover:text-white';

  const textClasses = reverse ? 'group-hover:text-foreground' : 'group-hover:text-white';

  return (
    <button
      className={`group relative rounded-full border border-primary p-2 text-xl font-semibold transition-colors ${buttonClasses} ${className}`}
      {...props}
    >
      <div
        className={`absolute left-0 top-0 flex h-full items-center justify-end rounded-full transition-all duration-200 ease-in-out ${divClasses}`}
      >
        <span className={`mr-3 transition-all duration-200 ease-in-out ${arrowClasses}`}>
          <ArrowRight size={20} />
        </span>
      </div>
      <span
        className={`relative left-4 z-10 whitespace-nowrap px-8 font-semibold transition-all duration-200 ease-in-out group-hover:-left-3 ${textClasses}`}
      >
        {text}
      </span>
    </button>
  );
}
