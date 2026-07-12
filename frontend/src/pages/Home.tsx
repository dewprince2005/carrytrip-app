import React, { useState } from 'react';
import { Button } from '../components/Button';
import { RouteCard } from '../components/Card';
import { Input } from '../components/Input';
import { Search, MapPin, Sparkles, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Home: React.FC = () => {
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  // Sample data to preview the RouteCards in action
  const sampleTrips = [
    {
      id: '1',
      origin: 'New York, USA',
      destination: 'London, UK',
      date: 'Jul 18, 2026',
      travelerName: 'Marcus Vance',
      travelerRating: 4.9,
      capacity: '8 kg',
      price: '$45',
      isVerified: true,
    },
    {
      id: '2',
      origin: 'Paris, France',
      destination: 'Berlin, Germany',
      date: 'Jul 22, 2026',
      travelerName: 'Elena Rostova',
      travelerRating: 4.8,
      capacity: '3 kg',
      price: '$20',
      isVerified: true,
    },
    {
      id: '3',
      origin: 'Tokyo, Japan',
      destination: 'San Francisco, USA',
      date: 'Aug 05, 2026',
      travelerName: 'Kenji Sato',
      travelerRating: 5.0,
      capacity: '12 kg',
      price: '$85',
      isVerified: false,
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto py-6 flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-xs font-display font-semibold text-brand-accent animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rethinking parcel shipping globally</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-brand-dark leading-[1.15]">
          Travelers carrying your parcels, <span className="text-brand-primary">connecting journeys.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl">
          A peer-to-peer delivery network matching people traveling somewhere anyway with parcels that need to go there. Safe, eco-friendly, and community-powered.
        </p>
      </section>

      {/* Search Finder Widget */}
      <section className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-xl shadow-slate-100/60 max-w-4xl mx-auto w-full -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 items-end gap-5">
          <div className="md:col-span-5">
            <Input
              label="Sender Location (Origin)"
              placeholder="e.g. Paris, France"
              value={originQuery}
              onChange={(e) => setOriginQuery(e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
          <div className="hidden md:flex md:col-span-1 justify-center items-center h-12 pb-1">
            <Navigation className="w-5 h-5 text-slate-300 rotate-90" />
          </div>
          <div className="md:col-span-4">
            <Input
              label="Recipient Location (Destination)"
              placeholder="e.g. Berlin, Germany"
              value={destQuery}
              onChange={(e) => setDestQuery(e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
          <div className="md:col-span-2">
            <Button className="w-full flex items-center justify-center py-3">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Main Grid: Active Journeys */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-brand-dark">Active Journeys</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real travelers posting upcoming transit routes</p>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleTrips.map((trip) => (
            <RouteCard
              key={trip.id}
              origin={trip.origin}
              destination={trip.destination}
              date={trip.date}
              travelerName={trip.travelerName}
              travelerRating={trip.travelerRating}
              capacity={trip.capacity}
              price={trip.price}
              isVerified={trip.isVerified}
              onSelect={() => alert(`Requested parcel match for journey to ${trip.destination}`)}
            />
          ))}
        </div>
      </section>

      {/* Design System Foundations Preview (Temporary showcase) */}
      <section className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 transition-all duration-300">
        <button
          onClick={() => setIsPlaygroundOpen(!isPlaygroundOpen)}
          className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
        >
          <div>
            <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors flex items-center gap-2">
              <span>Design Tokens & Components System</span>
              <span className="text-[10px] bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded-full font-sans font-normal uppercase tracking-normal">
                Playground
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click to toggle the UI verification playground</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-200/40 flex items-center justify-center text-slate-400 group-hover:bg-slate-200/80 group-hover:text-slate-600 transition-all">
            {isPlaygroundOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {isPlaygroundOpen && (
          <div className="mt-6 pt-6 border-t border-slate-200/50 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
            {/* Colors and Badges */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-brand-dark">Color Palette & Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">Primary / Midnight Teal</Badge>
                <Badge variant="success">Secondary / Sage Trust</Badge>
                <Badge variant="warning">Accent / Path Gold</Badge>
                <Badge variant="neutral">Neutral Base</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-white">
                <div className="bg-brand-dark p-3 rounded-lg text-center shadow-sm">
                  Midnight `#0E1E2B`
                </div>
                <div className="bg-brand-primary p-3 rounded-lg text-center shadow-sm">
                  Voyage `#1D4D6B`
                </div>
                <div className="bg-brand-accent p-3 rounded-lg text-center text-brand-dark shadow-sm">
                  Gold `#D29E3A`
                </div>
                <div className="bg-brand-secondary p-3 rounded-lg text-center shadow-sm">
                  Sage `#769A8E`
                </div>
                <div className="bg-brand-light p-3 rounded-lg border border-slate-200 text-brand-dark text-center shadow-sm">
                  Mist `#F5F8FA`
                </div>
                <div className="bg-brand-text p-3 rounded-lg text-center shadow-sm">
                  Slate `#334155`
                </div>
              </div>
            </div>

            {/* Button states */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-brand-dark">Button Variants</h4>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="primary" size="sm">Primary SM</Button>
                <Button variant="secondary" size="md">Secondary MD</Button>
                <Button variant="accent" size="md">Accent</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="primary" size="sm" isLoading>Processing</Button>
                <Button variant="primary" size="sm" disabled>Disabled State</Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
