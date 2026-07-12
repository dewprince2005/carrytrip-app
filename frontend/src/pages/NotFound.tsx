import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MoveLeft } from 'lucide-react';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100/50 mb-6">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>
      <h1 className="text-4xl font-display font-extrabold text-brand-dark mb-2">404 - Lost Route</h1>
      <p className="text-sm text-slate-400 max-w-sm mb-8">
        We couldn't find the path you were looking for. The journey might have expired or the location coordinates are incorrect.
      </p>
      <Link to="/">
        <Button variant="primary" className="flex items-center gap-2">
          <MoveLeft className="w-4 h-4" />
          Back to Explore
        </Button>
      </Link>
    </div>
  );
};
