import React from 'react';
import { cn } from '../utils/cn';
import { Calendar, User, Package, ChevronRight } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-slate-100 rounded-2xl p-6 transition-all duration-300',
        hoverEffect && 'hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200/60',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface RouteCardProps extends CardProps {
  origin: string;
  destination: string;
  date: string;
  travelerName: string;
  travelerRating?: number;
  capacity: string;
  price: string;
  isVerified?: boolean;
  onSelect?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  origin,
  destination,
  date,
  travelerName,
  travelerRating = 5.0,
  capacity,
  price,
  isVerified = true,
  onSelect,
  className,
  ...props
}) => {
  return (
    <Card className={cn('flex flex-col gap-5 relative overflow-hidden', className)} {...props}>
      {/* Top Section: Traveler Profile & Status */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10">
            <User className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h4 className="text-sm font-display font-semibold text-brand-dark flex items-center gap-1.5">
              {travelerName}
              {isVerified && (
                <Badge variant="success" size="sm" className="scale-[0.9] origin-left">
                  Verified
                </Badge>
              )}
            </h4>
            <span className="text-xs text-slate-400">★ {travelerRating.toFixed(1)} traveler rating</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-display">Carrier Fee</span>
          <span className="text-lg font-display font-bold text-brand-primary">{price}</span>
        </div>
      </div>

      {/* Middle Section: Origin -> Destination with Custom Route Path (Signature Element) */}
      <div className="flex items-center justify-between py-2 relative">
        <div className="flex-1 min-w-0 pr-4">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
            Origin
          </span>
          <p className="text-base font-display font-bold text-brand-dark truncate">{origin}</p>
        </div>

        {/* The Animated Path Thread Connector */}
        <div className="flex-[1.5] flex items-center justify-center relative px-2 min-w-[100px] h-8">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
            <defs>
              <linearGradient id="route-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1D4D6B" />
                <stop offset="100%" stopColor="#D29E3A" />
              </linearGradient>
            </defs>
            {/* Background path line */}
            <path
              d="M 5,10 C 25,2 75,18 95,10"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Animated foreground path line */}
            <path
              d="M 5,10 C 25,2 75,18 95,10"
              fill="none"
              stroke="url(#route-line-grad)"
              strokeWidth="2"
              className="animate-route-path"
            />
            {/* Origin Node */}
            <circle cx="5" cy="10" r="3" fill="#1D4D6B" className="ring-4 ring-brand-primary/10" />
            {/* Destination Node */}
            <circle cx="95" cy="10" r="3" fill="#D29E3A" className="ring-4 ring-brand-accent/10" />
          </svg>
        </div>

        <div className="flex-1 min-w-0 pl-4 text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">
            Destination
          </span>
          <p className="text-base font-display font-bold text-brand-dark truncate">{destination}</p>
        </div>
      </div>

      {/* Bottom Section: Delivery Metadata & Button */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Package className="w-4 h-4 text-slate-400" />
            <span>Max {capacity}</span>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={onSelect} className="group pr-2.5">
          Request Carry
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </Card>
  );
};
