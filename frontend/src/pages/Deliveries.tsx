import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const Deliveries: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-dark">Active Deliveries</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track your ongoing packages and verify cargo statuses</p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Request a Delivery
        </Button>
      </div>

      {/* Empty state dashboard placeholder */}
      <Card className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-slate-100 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100/50 mb-4">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-display font-semibold text-brand-dark mb-1">
          No active shipments yet
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          When you request a traveler to carry a package or accept to carry a parcel for someone else, it will appear here.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm">
            How Shipping Works
          </Button>
          <Button variant="primary" size="sm">
            Find a Route
          </Button>
        </div>
      </Card>
    </div>
  );
};
