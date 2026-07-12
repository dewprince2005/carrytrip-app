import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Shield, Navigation } from 'lucide-react';
import { Button } from '../components/Button';

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-display font-medium transition-colors duration-200 ${
      isActive ? 'text-brand-primary' : 'text-slate-500 hover:text-brand-dark'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-brand-light">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                  <Navigation className="w-5 h-5 fill-current rotate-45 -translate-x-[1px] translate-y-[1px]" />
                </div>
                <span className="text-lg font-display font-extrabold tracking-tight text-brand-dark">
                  Carry<span className="text-brand-accent">trip</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <NavLink to="/" className={activeLinkStyle}>
                Explore Trips
              </NavLink>
              <NavLink to="/find-routes" className={activeLinkStyle}>
                Deliveries
              </NavLink>
              <NavLink to="/about" className={activeLinkStyle}>
                How It Works
              </NavLink>
            </nav>

            {/* CTA / Quick Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
              <Button variant="primary" size="sm">
                Share a Journey
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-500 hover:text-brand-dark focus:outline-none p-1.5"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-100 bg-white/95 px-4 pt-2 pb-4 space-y-3">
            <nav className="flex flex-col space-y-2.5">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-brand-primary/5 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                Explore Trips
              </NavLink>
              <NavLink
                to="/find-routes"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-brand-primary/5 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                Deliveries
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-brand-primary/5 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                How It Works
              </NavLink>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button variant="outline" size="sm" className="w-full">
                Log In
              </Button>
              <Button variant="primary" size="sm" className="w-full">
                Share a Journey
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-slate-400 border-t border-slate-900 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800/60 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/30">
                <Navigation className="w-4 h-4 rotate-45 -translate-x-[1px] translate-y-[1.5px] fill-current" />
              </div>
              <span className="text-md font-display font-extrabold tracking-tight text-white">
                Carry<span className="text-brand-accent">trip</span>
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/about" className="hover:text-white transition-colors">
                How it Works
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                Safety & Trust
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Sustainability
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Carrytrip. Peer-to-peer travel matching network.</p>
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-brand-secondary" />
              <span>Secure, trusted, and eco-friendly deliveries.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
