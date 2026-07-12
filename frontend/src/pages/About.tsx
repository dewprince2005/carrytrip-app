import React from 'react';
import { Shield, Sparkles, Navigation, HeartHandshake } from 'lucide-react';
import { Card } from '../components/Card';

export const About: React.FC = () => {
  const steps = [
    {
      icon: <Navigation className="w-5 h-5 text-brand-primary" />,
      title: '1. Share Your Route',
      description:
        'Travelers publish their origin, destination, dates of travel, and how much luggage space they can spare.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-brand-accent" />,
      title: '2. Match & Align',
      description:
        'Senders browse routes, find travelers moving their way, and request a parcel match by sharing weight and dimensions.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-brand-secondary" />,
      title: '3. Handover & Delivery',
      description:
        'Meet at safe, public locations to verify contents, hand over the package, and carry out secure transport.',
    },
  ];

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto">
      {/* Intro header */}
      <section className="text-center flex flex-col gap-4">
        <h1 className="text-3xl font-display font-extrabold text-brand-dark">How Carrytrip Works</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          We connect local senders needing affordable shipping with travelers who have extra luggage space and want to offset travel costs.
        </p>
      </section>

      {/* Steps list */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => (
          <Card key={idx} className="flex flex-col gap-4 bg-white border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100/50">
              {step.icon}
            </div>
            <h3 className="text-sm font-display font-bold text-brand-dark">{step.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
          </Card>
        ))}
      </section>

      {/* Safety & trust banner */}
      <section className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start">
        <div className="p-3 rounded-xl bg-white border border-brand-primary/10 text-brand-primary shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h4 className="text-sm font-display font-bold text-brand-dark">Built on Security and Trust</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            All travelers pass safety verification checks, parcel contents are inspected prior to sealing, and payments are protected by automated escrow releases upon successful delivery.
          </p>
        </div>
      </section>
    </div>
  );
};
