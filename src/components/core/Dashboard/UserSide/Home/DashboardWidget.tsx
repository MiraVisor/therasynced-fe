'use client';

import { ArrowRight, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';

interface DashboardWidgetProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  href,
  onClick,
  className = '',
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  const isClickable = !!(href || onClick);
  const cardClassName = isClickable
    ? `border border-gray-200  cursor-pointer group ${className}`
    : `border border-gray-200  ${className}`;

  return (
    <Card className={cardClassName} onClick={isClickable ? handleClick : undefined}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3 relative">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-poppins font-bold text-gray-900">
              {value}
            </div>
            <div className="text-sm font-inter font-medium text-gray-600">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs font-inter text-gray-500">{subtitle}</div>
            )}
          </div>

          {/* Arrow icon for clickable widgets */}
          {(href || onClick) && (
            <div className="absolute top-2 right-2">
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;
