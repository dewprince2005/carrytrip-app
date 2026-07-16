import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Star, User, DollarSign, ArrowRight, Package } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const RouteResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const originQuery = searchParams.get('origin') || '';
  const destinationQuery = searchParams.get('destination') || '';
  const dateQuery = searchParams.get('date') || '';
  const timeQuery = searchParams.get('time') || '';

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, [dateQuery]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('routes')
        .select('*, carrier:profiles!carrier_id(name, rating_avg, rating_count, avatar_url)')
        .order('travel_date', { ascending: true });

      if (dateQuery) {
        query = query.gte('travel_date', dateQuery);
      } else {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('travel_date', today);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setRoutes(data || []);
      filterRoutes(data || []);
    } catch (err) {
      console.error("Error fetching routes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterRoutes = (allRoutes) => {
    // Basic text matching logic for MVP since we don't have PostGIS geometry types
    // We check if any major city name from the search query exists in the route's origin/destination
    const extractCity = (str) => {
      if (!str) return '';
      const parts = str.split(',');
      // Try to get the city (usually before the state/country)
      return parts.length > 1 ? parts[0].trim().toLowerCase() : str.trim().toLowerCase();
    };

    const searchOriginCity = extractCity(originQuery);
    const searchDestCity = extractCity(destinationQuery);

    const matches = allRoutes.filter(route => {
      const routeOrigin = (route.origin || '').toLowerCase();
      const routeDest = (route.destination || '').toLowerCase();

      // If user provided an origin query, it must match
      const originMatch = !searchOriginCity || routeOrigin.includes(searchOriginCity) || searchOriginCity.includes(extractCity(route.origin));
      // If user provided a dest query, it must match
      const destMatch = !searchDestCity || routeDest.includes(searchDestCity) || searchDestCity.includes(extractCity(route.destination));

      return originMatch && destMatch;
    });

    setFilteredRoutes(matches);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', paddingBottom: 'var(--space-12)' }}>
      {/* Premium Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-surface)', 
        padding: 'var(--space-6) var(--space-4) var(--space-4)', 
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Available Carriers</h1>
        </div>

        {/* Search Summary Pill */}
        <div style={{ 
          backgroundColor: 'var(--bg-hover)', 
          borderRadius: 'var(--radius-lg)', 
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.9rem', fontWeight: 600 }}>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40%' }}>{originQuery.split(',')[0] || 'Anywhere'}</span>
            <ArrowRight size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40%' }}>{destinationQuery.split(',')[0] || 'Anywhere'}</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {dateQuery || 'Any Date'}</span>
            {timeQuery && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {timeQuery}</span>}
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div style={{ padding: 'var(--space-4)', maxWidth: '600px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div style={{ 
            backgroundColor: 'var(--bg-surface)', 
            borderRadius: 'var(--radius-xl)', 
            padding: 'var(--space-8)', 
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            marginTop: 'var(--space-4)'
          }}>
            <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>No carriers found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-6)' }}>
              We couldn't find any carriers matching this exact route and date.
            </p>
            <button 
              onClick={() => navigate('/search')}
              className="btn btn-outline"
              style={{ width: '100%' }}
            >
              Modify Search
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', paddingLeft: 'var(--space-2)' }}>
              {filteredRoutes.length} carrier{filteredRoutes.length > 1 ? 's' : ''} available
            </p>
            
            {filteredRoutes.map((route) => (
              <div key={route.id} style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                border: '1px solid var(--border-color)'
              }}>
                {/* Header: Carrier Info & Price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-hover)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700 
                    }}>
                      {route.carrier?.name ? route.carrier.name[0].toUpperCase() : <User size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{route.carrier?.name || 'Carrier'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Star size={12} fill="var(--warning)" color="var(--warning)" />
                        <span style={{ fontWeight: 600 }}>{route.carrier?.rating_avg || '5.0'}</span>
                        <span>({route.carrier?.rating_count || 0} deliveries)</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>₹{route.price_per_kg}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>per kg</div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>

                {/* Route Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-primary)' }}></div>
                      <div style={{ width: '2px', height: '24px', backgroundColor: 'var(--border-color)', margin: '2px 0' }}></div>
                      <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Origin</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{route.origin}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Destination</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{route.destination}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <div style={{ backgroundColor: 'var(--bg-hover)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {route.travel_date}
                    </div>
                    {route.travel_time && (
                      <div style={{ backgroundColor: 'var(--bg-hover)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {route.travel_time}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Request Space
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteResults;
