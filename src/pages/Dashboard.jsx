import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { 
  Send, 
  DollarSign, 
  MapPin, 
  Plus, 
  Search, 
  Navigation, 
  Clock, 
  CheckCircle, 
  Lock, 
  ShieldAlert, 
  Star, 
  Sparkles, 
  User, 
  Phone, 
  ArrowRight,
  RefreshCw,
  LogOut,
  Calendar,
  Layers,
  Settings,
  Users,
  Compass,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const MapBoundsFitter = ({ originCoords, destCoords, liveLocation }) => {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (originCoords) points.push(originCoords);
    if (destCoords) points.push(destCoords);
    if (liveLocation) points.push(liveLocation);
    
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (points.length === 1) {
      map.flyTo(points[0], 12);
    }
  }, [map, originCoords, destCoords, liveLocation]);
  return null;
};

const TrackingMap = ({ bookingId, origin = '', destination = '', status }) => {
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [etaText, setEtaText] = useState('Calculating...');

  // Step 1: Geocode Origin and Destination
  useEffect(() => {
    const geocode = async (city, setter) => {
      if (!city) return;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (err) {
        console.error("Geocoding error", err);
      }
    };
    geocode(origin, setOriginCoords);
    geocode(destination, setDestCoords);
  }, [origin, destination]);

  // Step 2: Subscribe to Realtime locations table
  useEffect(() => {
    if (!bookingId || status === 'delivered') return;

    // Fetch initial latest location
    const fetchLatest = async () => {
      const { data } = await supabase.from('locations').select('*').eq('booking_id', bookingId).maybeSingle();
      if (data) handleNewLocation(data);
    };
    fetchLatest();

    // Subscribe
    const channel = supabase.channel(`public:locations:booking_id=eq.${bookingId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations', filter: `booking_id=eq.${bookingId}` }, 
        (payload) => handleNewLocation(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [bookingId, status]);

  const handleNewLocation = (loc) => {
    setLiveLocation([loc.latitude, loc.longitude]);
    const updatedTime = new Date(loc.updated_at).getTime();
    const now = Date.now();
    setIsStale(now - updatedTime > 60000); // 60s
  };

  // Step 3: Calculate ETA
  useEffect(() => {
    if (liveLocation && destCoords) {
      const [lat1, lon1] = liveLocation;
      const [lat2, lon2] = destCoords;
      const R = 6371; 
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c; 
      
      const speed = 40; 
      const hours = d / speed;
      const mins = Math.round(hours * 60);
      if (mins < 1) setEtaText('Arriving soon');
      else if (mins > 60) setEtaText(`${Math.floor(mins/60)}h ${mins%60}m`);
      else setEtaText(`${mins}m`);
    }
  }, [liveLocation, destCoords]);

  // Stepper logic
  const steps = ['Pending', 'In Transit', 'Delivered'];
  const currentStepIndex = status === 'pending' || status === 'paid' || status === 'accepted' ? 0 : status === 'in_transit' ? 1 : 2;

  return (
    <div style={{ margin: 'var(--space-4) 0', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Stepper Header */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {steps.map((step, idx) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', opacity: currentStepIndex >= idx ? 1 : 0.4 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: currentStepIndex >= idx ? 'var(--primary)' : 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, marginLeft: '6px' }}>{step}</span>
              {idx < 2 && <div style={{ width: '30px', height: '2px', backgroundColor: 'var(--text-muted)', margin: '0 8px' }} />}
            </div>
          ))}
        </div>
        
        {status === 'in_transit' && liveLocation && (
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isStale ? 'var(--warning)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Navigation size={12} /> {isStale ? 'Last known location' : 'Live ETA: ' + etaText}
          </div>
        )}
      </div>

      {/* Leaflet Map */}
      <div style={{ width: '100%', height: '250px', backgroundColor: '#e5e7eb' }}>
        {(originCoords || destCoords) ? (
          <MapContainer 
            center={originCoords || destCoords} 
            zoom={5} 
            zoomControl={false}
            style={{ width: '100%', height: '100%', zIndex: 0 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {originCoords && <Marker position={originCoords} opacity={0.6} />}
            {destCoords && <Marker position={destCoords} opacity={0.6} />}
            {liveLocation && status === 'in_transit' && (
              <Marker position={liveLocation} zIndexOffset={1000} />
            )}
            
            <MapBoundsFitter originCoords={originCoords} destCoords={destCoords} liveLocation={liveLocation} />
          </MapContainer>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading route map...</div>
        )}
      </div>
    </div>
  );
};


// Google Map Visualizer Removed

// =========================================================================
// LOCATION AUTOCOMPLETE INPUT COMPONENT
// =========================================================================
const LocationInput = ({ value, onChange, placeholder, icon }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchLocations = async (query) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'Carrytrip-App/1.0'
        }
      });
      const data = await response.json();
      // Only extract the most relevant part of the display name (e.g. city, state) or just use the full string
      const uniqueNames = Array.from(new Set(data.map(item => item.display_name)));
      setSuggestions(uniqueNames);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showSuggestions && value && !suggestions.includes(value)) {
        fetchLocations(value);
      }
    }, 600); // 600ms debounce
    return () => clearTimeout(timeoutId);
  }, [value, showSuggestions]);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const selectSuggestion = (city) => {
    onChange(city);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        {icon}
        <input 
          type="text" 
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value && value.length >= 3) {
              setShowSuggestions(true);
              fetchLocations(value);
            }
          }}
          className="form-input" 
          style={{ paddingLeft: icon ? 'var(--space-10)' : undefined }}
          required
        />
        {loading && (
          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
            <RefreshCw size={14} className="spinner" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          marginTop: '4px',
          maxHeight: '220px',
          overflowY: 'auto',
          animation: 'fadeIn 120ms ease-out'
        }}>
          {suggestions.map((city, idx) => (
            <div 
              key={idx}
              onClick={() => selectSuggestion(city)}
              style={{
                padding: '10px var(--space-4)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                transition: 'background-color 0.15s',
                lineHeight: '1.4'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <MapPin size={12} style={{ display: 'inline-block', marginRight: '6px', color: 'var(--primary)', opacity: 0.7 }} />
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Dashboard = () => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('find_travelers'); // find_travelers | my_shipments | post_route | my_deliveries | profile_settings | admin_panel
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Profile Edit fields
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileRoles, setProfileRoles] = useState([]);

  // Senders state
  const [routes, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState({ origin: '', destination: '' });
  const [myShipments, setMyShipments] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [newParcel, setNewParcel] = useState({ title: '', weight: '', pickupAddress: '', deliveryAddress: '', notes: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);

  // Carriers state
  const [newRoute, setNewRoute] = useState({ origin: '', destination: '', travelDate: '', travelTime: '', transportMode: 'train', maxWeight: '', pricePerKg: 5, notes: '' });
  const [myRoutes, setMyRoutes] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});

  // Payment mock state
  const [paymentForm, setPaymentForm] = useState({ cardNumber: '', expiry: '', cvv: '', cardholder: '' });

  // Admin Panel states
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [adminRoutes, setAdminRoutes] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);

  // Sync profile details when loaded
  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || '');
      setProfilePhone(profile.phone || '');
      setProfileRoles(profile.roles || []);
    }
  }, [profile]);

  // Set default tab based on role: carriers go to post_route, senders go to find_travelers
  useEffect(() => {
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab);
      window.history.replaceState({}, document.title);
    } else if (profile) {
      const roles = profile.roles || [];
      if (roles.includes('carrier') && !roles.includes('sender')) {
        setActiveTab('post_route');
      }
    }
  }, [location.state, profile]);

  // Init Data based on selected tab
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  // Geolocation watch ID ref
  const watchIdRef = useRef(null);

  // Live Carrier Geolocation Tracking
  useEffect(() => {
    if (!user) return;
    
    const activeDeliveries = myDeliveries.filter(b => b.status === 'in_transit');
    
    if (activeDeliveries.length > 0) {
      if (!watchIdRef.current) {
        if ("geolocation" in navigator) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Upsert location for each active booking
              for (const booking of activeDeliveries) {
                await supabase.from('locations').upsert({
                  booking_id: booking.id,
                  carrier_id: user.id,
                  latitude,
                  longitude,
                  updated_at: new Date().toISOString()
                }, { onConflict: 'booking_id' });
              }
            },
            (error) => {
              console.error("Geolocation error:", error.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        }
      }
    } else {
      // Clear watch if no active deliveries
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      // Cleanup on unmount
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
  }, [myDeliveries, user]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (activeTab === 'find_travelers') {
        await fetchAvailableRoutes();
      } else if (activeTab === 'my_shipments' || activeTab === 'sender_history') {
        await fetchMyShipments();
      } else if (activeTab === 'post_route') {
        await fetchMyRoutes();
      } else if (activeTab === 'my_deliveries') {
        await fetchMyDeliveries();
      } else if (activeTab === 'carrier_analytics') {
        await Promise.all([fetchMyDeliveries(), fetchMyRoutes()]);
      } else if (activeTab === 'admin_panel') {
        await fetchAdminData();
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- API FETCH FUNCTIONS ---

  const fetchAvailableRoutes = async () => {
    const { data, error } = await supabase
      .from('routes')
      .select('*, carrier:profiles!carrier_id(name, rating_avg, rating_count)')
      .order('travel_date', { ascending: true });

    if (error) throw error;
    setRoutes(data || []);
  };

  const fetchMyShipments = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, carrier:profiles!carrier_id(name, phone)')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setMyShipments(data || []);
  };

  const fetchMyRoutes = async () => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('carrier_id', user.id)
      .order('travel_date', { ascending: true });

    if (error) throw error;
    setMyRoutes(data || []);
  };

  const fetchMyDeliveries = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, sender:profiles!sender_id(name, phone)')
      .eq('carrier_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setMyDeliveries(data || []);
  };

  const fetchAdminData = async () => {
    const [pRes, rRes, bRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('routes').select('*, carrier:profiles!carrier_id(name)').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*, sender:profiles!sender_id(name), carrier:profiles!carrier_id(name)').order('created_at', { ascending: false })
    ]);

    if (pRes.error) throw pRes.error;
    if (rRes.error) throw rRes.error;
    if (bRes.error) throw bRes.error;

    setAdminProfiles(pRes.data || []);
    setAdminRoutes(rRes.data || []);
    setAdminBookings(bRes.data || []);
  };

  // --- ACTIONS ---

  const handleLogout = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setErrorMessage(`Logout failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      // Only update name and phone — roles are fixed and managed by admin only
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileName || user?.user_metadata?.full_name || 'User',
          phone: profilePhone,
          roles: profileRoles, // preserve existing roles or empty
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      setSuccessMessage('Profile updated successfully!');
      await refreshProfile();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (newRole) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile?.name || user?.user_metadata?.full_name || 'User',
          phone: profile?.phone || '',
          roles: [newRole],
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      setSuccessMessage(`Account role updated to ${newRole}!`);
      await refreshProfile();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCarry = async (e) => {
    e.preventDefault();
    if (!selectedRoute) return;
    setLoading(true);
    setErrorMessage('');

    // ── PLATFORM FEE: 10% of carrier base price ──────────────────────────────
    const PLATFORM_FEE_PCT = 0.10;

    try {
      const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const weightNum = parseFloat(newParcel.weight);
      const basePrice = isNaN(weightNum) ? 0 : weightNum * selectedRoute.price_per_kg;
      const platformFee = basePrice * PLATFORM_FEE_PCT;
      const totalPrice = (basePrice + platformFee).toFixed(2); // sender pays this

      // Save exact pickup and delivery locations inside notes column as a formatted detail list
      const formattedNotes = `Exact Pickup Address:\n${newParcel.pickupAddress}\n\nExact Delivery Address:\n${newParcel.deliveryAddress}\n\nSpecial Instructions / Notes:\n${newParcel.notes || 'None'}`;

      const { error } = await supabase
        .from('bookings')
        .insert({
          sender_id: user.id,
          route_id: selectedRoute.id,
          carrier_id: selectedRoute.carrier_id,
          title: newParcel.title,
          weight: isNaN(weightNum) ? 0.0 : weightNum,
          origin: selectedRoute.origin,
          destination: selectedRoute.destination,
          price: totalPrice,   // total paid by sender (base + platform fee)
          status: 'pending',
          pickup_otp: pickupOtp,
          delivery_otp: deliveryOtp,
          notes: formattedNotes
        });

      if (error) throw error;

      setSuccessMessage('Delivery requested successfully with detailed routing address specifications!');
      setNewParcel({ title: '', weight: '', pickupAddress: '', deliveryAddress: '', notes: '' });
      setShowRequestModal(false);
      setActiveTab('my_shipments');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Encode extra fields (time, mode, max weight) into the notes column
      const modeLabel = { train: '🚆 Train', bus: '🚌 Bus', flight: '✈️ Flight', car: '🚗 Car/Bike' };
      const routeMeta = `[JOURNEY_META]\nDeparture Time: ${newRoute.travelTime || 'Not specified'}\nMode: ${modeLabel[newRoute.transportMode] || newRoute.transportMode}\nMax Weight: ${newRoute.maxWeight ? newRoute.maxWeight + ' kg' : 'Not specified'}\n\nAdditional Notes:\n${newRoute.notes || 'None'}`;

      const { error } = await supabase
        .from('routes')
        .insert({
          carrier_id: user.id,
          origin: newRoute.origin,
          destination: newRoute.destination,
          travel_date: newRoute.travelDate,
          price_per_kg: parseFloat(newRoute.pricePerKg),
          notes: routeMeta
        });

      if (error) throw error;

      setSuccessMessage('Journey listed! Senders can now find and book you.');
      setNewRoute({ origin: '', destination: '', travelDate: '', travelTime: '', transportMode: 'train', maxWeight: '', pricePerKg: 5, notes: '' });
      await fetchMyRoutes();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: parse journey meta from notes field
  const parseRouteMeta = (notes) => {
    if (!notes || !notes.includes('[JOURNEY_META]')) return { time: null, mode: null, maxWeight: null, extra: notes };
    const lines = notes.split('\n');
    const time = lines.find(l => l.startsWith('Departure Time:'))?.replace('Departure Time:', '').trim();
    const mode = lines.find(l => l.startsWith('Mode:'))?.replace('Mode:', '').trim();
    const maxWeight = lines.find(l => l.startsWith('Max Weight:'))?.replace('Max Weight:', '').trim();
    const extraIdx = lines.findIndex(l => l.startsWith('Additional Notes:'));
    const extra = extraIdx >= 0 ? lines.slice(extraIdx + 1).join('\n').trim() : '';
    return { time, mode, maxWeight, extra };
  };

  const handleAcceptRequest = async (bookingId) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'accepted' })
        .eq('id', bookingId);

      if (error) throw error;
      setSuccessMessage('Request accepted! Awaiting sender payment.');
      await fetchMyDeliveries();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (bookingId) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      setSuccessMessage('Request declined.');
      await fetchMyDeliveries();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (e) => {
    if (e) e.preventDefault();
    if (!selectedBookingForPayment) return;
    
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 2. Calculate Total Amount
      const PLATFORM_FEE_PCT = 0.10;
      const totalAmount = parseFloat(selectedBookingForPayment.price);

      // 3. Create Order via Edge Function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-order', {
        body: { 
          amount: totalAmount, 
          receipt: `rcpt_${selectedBookingForPayment.id.slice(0,8)}` 
        }
      });

      if (orderError) throw orderError;
      if (orderData.error) throw new Error(orderData.error);

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Carrytrip Escrow",
        description: `Escrow payment for ${selectedBookingForPayment.title}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 5. Verify signature via Edge Function on success
            setLoading(true);
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify-signature', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: selectedBookingForPayment.id
              }
            });

            if (verifyError) throw verifyError;
            if (verifyData.error) throw new Error(verifyData.error);

            setSuccessMessage('Payment secured in Escrow! Share Pickup OTP with carrier.');
            setShowPaymentModal(false);
            setSelectedBookingForPayment(null);
            await fetchMyShipments();
          } catch (verifyErr) {
            console.error(verifyErr);
            setErrorMessage(`Payment verification failed: ${verifyErr.message}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: profile?.name || user?.user_metadata?.full_name || '',
          email: user?.email || '',
          contact: profile?.phone || ''
        },
        theme: {
          color: "#0f766e"
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        setErrorMessage(`Payment failed: ${response.error.description}`);
      });

      paymentObject.open();

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (booking, type) => {
    const enteredOtp = otpInputs[booking.id]?.value;
    const uploadedFile = otpInputs[booking.id]?.file;

    if (!enteredOtp) {
      setErrorMessage('Please enter the OTP first.');
      return;
    }

    if (type === 'delivery' && !uploadedFile) {
      setErrorMessage('Please upload a proof of delivery photo to release escrow funds.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const expectedOtp = type === 'pickup' ? booking.pickup_otp : booking.delivery_otp;
      if (enteredOtp !== expectedOtp) {
        throw new Error('Invalid OTP! Verify code details with sender/receiver.');
      }

      let photoUrl = null;
      if (type === 'delivery' && uploadedFile) {
        const fileExt = uploadedFile.name.split('.').pop();
        const fileName = `${booking.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proof_of_delivery')
          .upload(fileName, uploadedFile);
        
        if (uploadError) throw new Error('Failed to upload proof of delivery photo: ' + uploadError.message);
        
        const { data: publicUrlData } = supabase.storage
          .from('proof_of_delivery')
          .getPublicUrl(fileName);
          
        photoUrl = publicUrlData.publicUrl;
      }

      const nextStatus = type === 'pickup' ? 'in_transit' : 'delivered';
      const nextPaymentStatus = type === 'delivery' ? 'released' : booking.payment_status;

      const updateData = { status: nextStatus };
      if (photoUrl) updateData.proof_of_delivery_photo_url = photoUrl;
      if (nextPaymentStatus) updateData.payment_status = nextPaymentStatus;

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id);

      if (error) throw error;
      
      if (nextStatus === 'in_transit') {
        setSuccessMessage('Pickup OTP verified successfully! Job is in transit.');
      } else {
        setSuccessMessage('Delivery drop-off OTP and Photo verified! Escrow funds released to your wallet.');
      }
      
      setOtpInputs(prev => {
        const next = {...prev};
        delete next[booking.id];
        return next;
      });
      await fetchMyDeliveries();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'var(--warning-glow)', color: 'var(--warning)', label: 'Pending Approval' },
      accepted: { bg: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', label: 'Awaiting Payment' },
      paid: { bg: 'rgba(6, 182, 212, 0.1)', color: '#0891b2', label: 'Escrow Secured' },
      in_transit: { bg: 'var(--secondary-glow)', color: 'var(--secondary)', label: 'In Transit' },
      delivered: { bg: 'var(--success-glow)', color: 'var(--success)', label: 'Delivered' },
      cancelled: { bg: 'var(--danger-glow)', color: 'var(--danger)', label: 'Cancelled' }
    };
    const s = styles[status] || { bg: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', label: status };
    return (
      <span style={{ 
        display: 'inline-block', 
        padding: '2px 8px', 
        borderRadius: 'var(--radius-sm)', 
        backgroundColor: s.bg, 
        color: s.color, 
        fontSize: '0.75rem', 
        fontWeight: 600 
      }}>
        {s.label}
      </span>
    );
  };

  const getEscrowBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending': return null; 
      case 'held': return <span style={{ marginLeft: '8px', display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--warning-glow)', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 600 }}><Lock size={12} style={{marginRight: '4px'}}/> Escrow Locked</span>;
      case 'released': return <span style={{ marginLeft: '8px', display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-glow)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}><CheckCircle size={12} style={{marginRight: '4px'}}/> Funds Released</span>;
      default: return null;
    }
  };

  const filteredRoutes = (routes || []).filter(r => {
    const originText = r.origin || '';
    const destText = r.destination || '';
    const matchOrigin = originText.toLowerCase().includes((searchQuery.origin || '').toLowerCase());
    const matchDest = destText.toLowerCase().includes((searchQuery.destination || '').toLowerCase());
    return matchOrigin && matchDest;
  });

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100dvh', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
      
      {/* ========================================================================= */}
      {/* LEFT SIDEBAR NAVIGATION                                                    */}
      {/* ========================================================================= */}
      <aside style={{ 
        width: '260px', 
        minWidth: '260px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-surface)', 
        borderRight: '1px solid var(--border-color)', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto'
      }}>
        {/* Brand Logo Header */}
        <div style={{ padding: 'var(--space-6) var(--space-5)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile_settings')}>Carrytrip</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Peer-to-Peer Logistics</div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ padding: 'var(--space-4) var(--space-2)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          
          {((profileRoles || []).includes('sender') || (profileRoles || []).length === 0) && (
            <>
              <div style={{ padding: '0 var(--space-3) var(--space-1)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SENDER CHANNELS</div>
              <button 
                onClick={() => navigate('/search')} 
                className={`btn sidebar-btn-3d btn-3d btn-outline`}
                style={{ justifyContent: 'flex-start', padding: '10px var(--space-3)', fontSize: '0.9rem', border: 'none', background: 'transparent' }}
              >
                <Compass size={18} /> Find Travelers
              </button>
              <button 
                onClick={() => setActiveTab('my_shipments')} 
                className={`btn sidebar-btn-3d btn-3d ${activeTab === 'my_shipments' ? 'btn-primary active' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start', padding: '10px var(--space-3)', fontSize: '0.9rem', border: 'none', background: activeTab === 'my_shipments' ? undefined : 'transparent' }}
              >
                <Send size={18} /> My Sent Parcels
              </button>
              <button 
                onClick={() => setActiveTab('sender_history')} 
                className={`btn sidebar-btn-3d btn-3d ${activeTab === 'sender_history' ? 'btn-primary active' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start', padding: '10px var(--space-3)', fontSize: '0.9rem', border: 'none', background: activeTab === 'sender_history' ? undefined : 'transparent', marginBottom: 'var(--space-4)' }}
              >
                <Clock size={18} /> Parcel History
              </button>
            </>
          )}

          {((profileRoles || []).includes('carrier') || (profileRoles || []).length === 0) && (
            <>
              <div style={{ padding: '0 var(--space-3) var(--space-1)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CARRIER CHANNELS</div>
              <button 
                onClick={() => setActiveTab('post_route')} 
                className={`btn sidebar-btn-3d btn-3d ${activeTab === 'post_route' ? 'btn-secondary active' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start', padding: '10px var(--space-3)', fontSize: '0.9rem', border: 'none', background: activeTab === 'post_route' ? undefined : 'transparent', color: activeTab === 'post_route' ? '#ffffff' : 'var(--text-primary)' }}
              >
                <Navigation size={18} /> List a Journey
              </button>
              <button 
                onClick={() => setActiveTab('my_deliveries')} 
                className={`btn sidebar-btn-3d btn-3d ${activeTab === 'my_deliveries' ? 'btn-secondary active' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start', padding: '10px var(--space-3)', fontSize: '0.9rem', border: 'none', background: activeTab === 'my_deliveries' ? undefined : 'transparent', color: activeTab === 'my_deliveries' ? '#ffffff' : 'var(--text-primary)' }}
              >
                <Briefcase size={18} /> Delivery Jobs
              </button>
              <button 
                onClick={() => setActiveTab('carrier_analytics')} 
                className={`btn sidebar-btn-3d btn-3d ${activeTab === 'carrier_analytics' ? 'btn-secondary active' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start', padding: '10px var(--space-3)', fontSize: '0.9rem', border: 'none', background: activeTab === 'carrier_analytics' ? undefined : 'transparent', color: activeTab === 'carrier_analytics' ? '#ffffff' : 'var(--text-primary)', marginBottom: 'var(--space-4)' }}
              >
                <DollarSign size={18} /> Earnings & Analytics
              </button>
            </>
          )}

          <div style={{ padding: '0 var(--space-3) var(--space-1)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>ACCOUNT</div>
          <button 
            onClick={() => setActiveTab('profile_settings')} 
            className={`btn sidebar-btn-3d btn-3d ${activeTab === 'profile_settings' ? 'btn-primary active' : 'btn-outline'}`}
            style={{ justifyContent: 'flex-start', padding: '10px var(--space-3)', fontSize: '0.9rem', border: 'none', background: activeTab === 'profile_settings' ? undefined : 'transparent' }}
          >
            <Settings size={18} /> Profile & Roles
          </button>

          {/* Conditional Admin Tab */}
          {(profileRoles || []).includes('admin') && (
            <>
              <div style={{ padding: 'var(--space-2) var(--space-3) var(--space-1)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger)', letterSpacing: '0.05em' }}>CONTROL PANEL</div>
              <button 
                onClick={() => setActiveTab('admin_panel')} 
                className={`btn sidebar-btn-3d btn-3d ${activeTab === 'admin_panel' ? 'active' : ''}`}
                style={{ 
                  justifyContent: 'flex-start', 
                  padding: '10px var(--space-3)', 
                  fontSize: '0.9rem', 
                  border: 'none', 
                  backgroundColor: activeTab === 'admin_panel' ? 'var(--danger-glow)' : 'transparent',
                  color: 'var(--danger)'
                }}
              >
                <Layers size={18} /> Admin Console
              </button>
            </>
          )}
        </nav>

        {/* Footer info & Logout */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div className="avatar">
              {(profile?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flexGrow: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name || 'Loading...'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline btn-3d" style={{ fontSize: '0.85rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* RIGHT SIDE MAIN CONTAINER                                                 */}
      {/* ========================================================================= */}
      <div style={{ flexGrow: 1, minWidth: 0, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Main Content Dashboard */}
        <main style={{ padding: 'var(--space-8) var(--space-6)', flexGrow: 1, perspective: '1000px', minHeight: 0 }}>
          
          {/* Notification Messages */}
          {errorMessage && (
            <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
            </div>
          )}
          {successMessage && (
            <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
            </div>
          )}

          {/* Render Active View Tab inside 3D Entrance transition div key-bound to force remount */}
          <div key={activeTab} className="tab-entrance-3d">

            {/* TAB A: FIND TRAVELERS */}
            {activeTab === 'find_travelers' && (
              <div>
                <h2 className="section-title">Find Travel Routes</h2>
                <p className="subtitle">Search and request commuters who are moving on routes matching your delivery needs.</p>
                
                {/* Search fields with Autocomplete suggestions */}
                <div className="card-3d" style={{ marginBottom: 'var(--space-6)', display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 'var(--space-4)', alignItems: 'center', backgroundColor: 'var(--bg-surface)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Leaving From</label>
                    <LocationInput 
                      placeholder="e.g. Delhi, Connaught Place" 
                      value={searchQuery.origin}
                      onChange={(val) => setSearchQuery({...searchQuery, origin: val})}
                      icon={<MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)', zIndex: 5 }} />}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Going To</label>
                    <LocationInput 
                      placeholder="e.g. Mumbai, Bandra West" 
                      value={searchQuery.destination}
                      onChange={(val) => setSearchQuery({...searchQuery, destination: val})}
                      icon={<MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)', zIndex: 5 }} />}
                    />
                  </div>
                  <button 
                    onClick={fetchAvailableRoutes} 
                    className="btn btn-outline btn-3d" 
                    style={{ height: '46px', marginTop: '22px' }}
                    disabled={loading}
                  >
                    {loading ? <RefreshCw className="spinner" size={16} /> : <Search size={18} />}
                  </button>
                </div>

                {/* Matching routes results */}
                <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Travelers Route Catalog</h3>
                {filteredRoutes.length === 0 ? (
                  <div className="card-3d" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--bg-surface)' }}>
                    <Clock size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No listed carrier travel routes found at the moment.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {filteredRoutes.map((route) => (
                      <div key={route.id} className="card-3d card-3d-stacked" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', backgroundColor: 'var(--bg-surface)', padding: 'var(--space-6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                          <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>ROUTING</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 600, fontSize: '0.95rem' }}>
                                {route.origin} <ArrowRight size={14} style={{ color: 'var(--primary)' }} /> {route.destination}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>TRAVEL DATE</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-secondary)' }}><Calendar size={14} /> {route.travel_date}</div>
                            </div>
                            <div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>CARRYING COST</div>
                              <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{route.price_per_kg} / kg</div>
                            </div>
                            <div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>TRAVELER</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-secondary)' }}>
                                <User size={14} /> {route.carrier?.name || 'Traveler'}
                                <span style={{ fontSize: '0.8rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', marginLeft: '6px' }}>
                                  <Star size={12} fill="currentColor" /> {route.carrier?.rating_avg || '5.0'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {route.carrier_id === user.id ? (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Your own listed journey</span>
                          ) : (
                            <button 
                              onClick={() => { setSelectedRoute(route); setShowRequestModal(true); }}
                              className="btn btn-primary btn-3d" 
                              style={{ width: 'auto', padding: 'var(--space-2) var(--space-4)', fontSize: '0.9rem' }}
                            >
                              Send Carry Request
                            </button>
                          )}
                        </div>
                        {/* Route map for traveler paths */}
                        <TrackingMap origin={route.origin} destination={route.destination} status="pending" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB B: MY SHIPMENTS */}
            {activeTab === 'my_shipments' && (
              <div>
                <h2 className="section-title">My Sent Shipments</h2>
                <p className="subtitle">Track parcel bookings you requested from travelers, make payments, and access hand-over verification codes.</p>
                
                {myShipments.length === 0 ? (
                  <div className="card-3d" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--bg-surface)' }}>
                    <Send size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>You haven't requested any package shipments yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {myShipments.map((booking) => (
                      <div key={booking.id} className="card-3d card-3d-stacked" style={{ borderLeft: `4px solid ${booking.status === 'delivered' ? 'var(--success)' : 'var(--primary)'}`, backgroundColor: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                          <div>
                            <h4 className="card-title" style={{ margin: 0 }}>{booking.title}</h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Transit City Path: {booking.origin} to {booking.destination}
                            </div>
                          </div>
                          <div>{getStatusBadge(booking.status)}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', fontSize: '0.9rem', color: 'var(--text-secondary)', padding: 'var(--space-3) 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                          <div><strong>Weight:</strong> {booking.weight} kg</div>
                          <div><strong>Matched Traveler:</strong> {booking.carrier?.name || 'Unassigned'}</div>
                          <div><strong>Escrow Price:</strong> <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{booking.price}</span></div>
                        </div>

                        {/* Exact Pickup / Delivery Addresses display */}
                        {booking.notes && (
                          <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>DELIVERY SPECIFICATIONS & DIRECTIONS</div>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              {booking.notes}
                            </pre>
                          </div>
                        )}

                        {/* Simple Route SVG progress bar */}
                        <TrackingMap bookingId={booking.id} origin={booking.origin} destination={booking.destination} status={booking.status} />

                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                          <div>
                            {(booking.status === 'paid' || booking.status === 'in_transit') && (
                              <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PICKUP OTP</div>
                                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{booking.pickup_otp}</div>
                                </div>
                                {booking.status === 'in_transit' && (
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DELIVERY OTP (Provide at destination)</div>
                                    <div style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px', fontSize: '1.1rem', color: 'var(--secondary)' }}>{booking.delivery_otp}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            {booking.status === 'accepted' && (
                              <button 
                                onClick={() => { setSelectedBookingForPayment(booking); setShowPaymentModal(true); }}
                                className="btn btn-secondary btn-3d" 
                                style={{ width: 'auto', padding: 'var(--space-2) var(--space-6)', fontSize: '0.875rem', color: '#ffffff' }}
                              >
                                Secure Escrow Payment
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB C: LIST JOURNEY ROUTE */}
            {activeTab === 'post_route' && (
              <div>
                <h2 className="section-title">List a Journey</h2>
                <p className="subtitle">Post your travel route so senders can find and hire you to carry their parcels along your way.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>

                  {/* ── FORM ── */}
                  <div className="card-3d" style={{ height: 'fit-content', backgroundColor: 'var(--bg-surface)' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
                      <Navigation size={20} style={{ color: 'var(--primary)' }} /> Journey Details
                    </h3>
                    <form onSubmit={handlePostRoute}>

                      {/* Route */}
                      <div className="form-group">
                        <label className="form-label">📍 Departing From</label>
                        <LocationInput
                          placeholder="e.g. Delhi, Indira Gandhi Airport (DEL)"
                          value={newRoute.origin}
                          onChange={(val) => setNewRoute({...newRoute, origin: val})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">🏁 Arriving At</label>
                        <LocationInput
                          placeholder="e.g. Mumbai, CST Railway Station"
                          value={newRoute.destination}
                          onChange={(val) => setNewRoute({...newRoute, destination: val})}
                        />
                      </div>

                      {/* Date + Time row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                          <label className="form-label">📅 Travel Date</label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={newRoute.travelDate}
                            onChange={(e) => setNewRoute({...newRoute, travelDate: e.target.value})}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">🕐 Departure Time</label>
                          <input
                            type="time"
                            value={newRoute.travelTime}
                            onChange={(e) => setNewRoute({...newRoute, travelTime: e.target.value})}
                            className="form-input"
                          />
                        </div>
                      </div>

                      {/* Mode of Transport */}
                      <div className="form-group">
                        <label className="form-label">🚌 Mode of Transport</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {[
                            { value: 'train', label: '🚆 Train' },
                            { value: 'bus', label: '🚌 Bus' },
                            { value: 'flight', label: '✈️ Flight' },
                            { value: 'car', label: '🚗 Car' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setNewRoute({...newRoute, transportMode: opt.value})}
                              style={{
                                padding: '8px 4px',
                                borderRadius: '10px',
                                border: `2px solid ${newRoute.transportMode === opt.value ? 'var(--primary)' : 'var(--border-color)'}`,
                                background: newRoute.transportMode === opt.value ? 'var(--primary-glow)' : 'var(--bg-main)',
                                color: newRoute.transportMode === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: newRoute.transportMode === opt.value ? 700 : 400,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>


                      {/* ══════════════════════════════════ */}
                      {/* SMART PRICING PANEL                */}
                      {/* ══════════════════════════════════ */}
                      {(() => {
                        const pricingRules = {
                          train:  { min: 10, max: 60,  suggested: 25, economy: 15, standard: 25, express: 45, label: '🚆 Train' },
                          bus:    { min: 8,  max: 40,  suggested: 18, economy: 10, standard: 18, express: 30, label: '🚌 Bus' },
                          flight: { min: 40, max: 200, suggested: 80, economy: 50, standard: 80, express: 140, label: '✈️ Flight' },
                          car:    { min: 15, max: 80,  suggested: 35, economy: 20, standard: 35, express: 60, label: '🚗 Car/Bike' },
                        };
                        const rules = pricingRules[newRoute.transportMode] || pricingRules.train;
                        const price = parseFloat(newRoute.pricePerKg) || rules.suggested;
                        const maxW = parseFloat(newRoute.maxWeight) || 5;
                        const maxEarning = (price * maxW).toFixed(0);
                        const pct = Math.round(((price - rules.min) / (rules.max - rules.min)) * 100);
                        const tier = price <= rules.economy + 3 ? 'economy' : price <= rules.standard + 5 ? 'standard' : 'express';
                        const tierColors = { economy: '#10b981', standard: '#4f46e5', express: '#f59e0b' };
                        const tierLabels = { economy: '🟢 Economy — Attract more senders', standard: '🔵 Standard — Balanced & popular', express: '🟡 Express — Premium fast service' };
                        const isOutOfRange = price < rules.min || price > rules.max;

                        return (
                          <div className="form-group" style={{ marginTop: '4px' }}>
                            <label className="form-label">💰 Pricing & Capacity</label>

                            {/* Mode pricing info banner */}
                            <div style={{
                              background: 'rgba(79,70,229,0.06)',
                              border: '1px solid rgba(79,70,229,0.18)',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              marginBottom: '12px',
                              fontSize: '0.78rem',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '6px',
                            }}>
                              <span>📊 {rules.label} price range</span>
                              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{rules.min} – ₹{rules.max} per kg</span>
                            </div>

                            {/* Quick Preset Tiers */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                              {[
                                { key: 'economy', label: '🟢 Economy', val: rules.economy },
                                { key: 'standard', label: '🔵 Standard', val: rules.standard },
                                { key: 'express', label: '🟡 Express', val: rules.express },
                              ].map(t => (
                                <button
                                  key={t.key}
                                  type="button"
                                  onClick={() => setNewRoute({...newRoute, pricePerKg: t.val})}
                                  style={{
                                    padding: '8px 6px',
                                    borderRadius: '10px',
                                    border: `2px solid ${tier === t.key ? tierColors[t.key] : 'var(--border-color)'}`,
                                    background: tier === t.key ? `${tierColors[t.key]}18` : 'var(--bg-main)',
                                    color: tier === t.key ? tierColors[t.key] : 'var(--text-secondary)',
                                    fontWeight: tier === t.key ? 700 : 400,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {t.label}<br/>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>₹{t.val}/kg</span>
                                </button>
                              ))}
                            </div>

                            {/* Slider */}
                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                <span>₹{rules.min} min</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isOutOfRange ? 'var(--danger)' : 'var(--primary)' }}>₹{price}/kg</span>
                                <span>₹{rules.max} max</span>
                              </div>
                              <input
                                type="range"
                                min={rules.min}
                                max={rules.max}
                                step="1"
                                value={Math.min(Math.max(price, rules.min), rules.max)}
                                onChange={(e) => setNewRoute({...newRoute, pricePerKg: e.target.value})}
                                style={{ width: '100%', accentColor: isOutOfRange ? 'var(--danger)' : tierColors[tier] }}
                              />
                            </div>

                            {/* Or type manually */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Custom Price (₹/kg)</label>
                                <input
                                  type="number"
                                  min={rules.min}
                                  max={rules.max}
                                  required
                                  value={newRoute.pricePerKg}
                                  onChange={(e) => setNewRoute({...newRoute, pricePerKg: e.target.value})}
                                  className="form-input"
                                  style={{ borderColor: isOutOfRange ? 'var(--danger)' : undefined }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>⚖️ Max Weight (kg)</label>
                                <input
                                  type="number"
                                  min="0.5"
                                  max="100"
                                  step="0.5"
                                  value={newRoute.maxWeight}
                                  onChange={(e) => setNewRoute({...newRoute, maxWeight: e.target.value})}
                                  className="form-input"
                                  placeholder="e.g. 5"
                                />
                              </div>
                            </div>

                            {/* Out of range warning */}
                            {isOutOfRange && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--danger)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px' }}>
                                ⚠️ Price must be between ₹{rules.min} and ₹{rules.max}/kg for {rules.label} travel.
                              </div>
                            )}

                            {/* Tier label */}
                            {!isOutOfRange && (
                              <div style={{ fontSize: '0.75rem', color: tierColors[tier], marginBottom: '10px', fontWeight: 600 }}>
                                {tierLabels[tier]}
                              </div>
                            )}

                            {/* Live Earnings Calculator */}
                            <div style={{
                              background: 'rgba(16,185,129,0.06)',
                              border: '1px solid rgba(16,185,129,0.18)',
                              borderRadius: '10px',
                              padding: '12px 14px',
                            }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>📈 Earnings Preview</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {[1, 3, maxW].map(w => (
                                  <div key={w} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{w} kg</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>₹{(price * w).toFixed(0)}</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                                Max capacity {maxW}kg → up to <strong style={{ color: '#10b981' }}>₹{maxEarning}</strong> per trip
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Notes */}
                      <div className="form-group" style={{ marginTop: '16px' }}>
                        <label className="form-label">📝 Restrictions / Notes</label>
                        <textarea
                          rows="2"
                          placeholder="e.g. No liquids. Fragile items OK. Luggage space limited."
                          value={newRoute.notes}
                          onChange={(e) => setNewRoute({...newRoute, notes: e.target.value})}
                          className="form-input"
                          style={{ resize: 'none' }}
                        />
                      </div>

                      <button type="submit" className="btn btn-secondary btn-3d" style={{ color: '#ffffff', width: '100%', marginTop: '4px' }} disabled={loading}>
                        {loading ? <RefreshCw className="spinner" size={16} /> : <><Navigation size={16} /> List My Journey</>}
                      </button>
                    </form>
                  </div>


                  {/* ── MY LISTED JOURNEYS ── */}
                  <div>
                    <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 'var(--space-4)' }}>My Listed Journeys</h3>
                    {myRoutes.length === 0 ? (
                      <div className="card-3d" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)' }}>
                        <Navigation size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                        <div>No journeys listed yet.</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>Fill the form to post your first route.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {myRoutes.map((route) => {
                          const meta = parseRouteMeta(route.notes);
                          return (
                            <div key={route.id} className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                              {/* Route header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {(route.origin || '').split(',')[0]} <ArrowRight size={14} /> {(route.destination || '').split(',')[0]}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    <span>📅 {route.travel_date}</span>
                                    {meta.time && meta.time !== 'Not specified' && <span>🕐 {meta.time}</span>}
                                    {meta.mode && <span>{meta.mode}</span>}
                                  </div>
                                </div>
                                <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--success-glow)', color: 'var(--success)', padding: '3px 10px', borderRadius: '999px', fontWeight: 600, whiteSpace: 'nowrap' }}>Active</span>
                              </div>

                              {/* Stats row */}
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '999px', background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', border: '1px solid rgba(79,70,229,0.2)', fontWeight: 600 }}>
                                  ₹{route.price_per_kg}/kg
                                </span>
                                {meta.maxWeight && meta.maxWeight !== 'Not specified' && (
                                  <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '999px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', fontWeight: 600 }}>
                                    Max {meta.maxWeight}
                                  </span>
                                )}
                              </div>

                              {meta.extra && meta.extra !== 'None' && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px', borderLeft: '3px solid var(--border-color)' }}>
                                  {meta.extra}
                                </div>
                              )}

                              <TrackingMap origin={route.origin} destination={route.destination} status="pending" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB D: CARRIER WORK JOBS */}
            {activeTab === 'my_deliveries' && (
              <div>
                <h2 className="section-title">Delivery Job Board</h2>
                <p className="subtitle">Manage incoming parcel carry offers and active transit codes.</p>
                
                <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Pending Offers</h3>
                {myDeliveries.filter(b => b.status === 'pending').length === 0 ? (
                  <div className="card-3d" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)', backgroundColor: 'var(--bg-surface)' }}>
                    No pending package requests listed at the moment.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                    {myDeliveries.filter(b => b.status === 'pending').map((booking) => (
                      <div key={booking.id} className="card-3d card-3d-stacked" style={{ borderLeft: '4px solid var(--warning)', backgroundColor: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 className="card-title">{booking.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Path: {booking.origin} to {booking.destination}
                            </p>
                          </div>
                          <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                            ₹{booking.price}
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', margin: '15px 0', color: 'var(--text-secondary)' }}>
                          <div><strong>Sender:</strong> {booking.sender?.name || 'User'}</div>
                          <div><strong>Weight:</strong> {booking.weight} kg</div>
                        </div>

                        {/* Address specs details */}
                        {booking.notes && (
                          <div style={{ margin: '12px 0', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>DELIVERY SPECIFICATIONS & DIRECTIONS</div>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {booking.notes}
                            </pre>
                          </div>
                        )}

                        {/* Tracking Map */}
                        <TrackingMap origin={booking.origin} destination={booking.destination} status={booking.status} />

                        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                          <button 
                            onClick={() => handleAcceptRequest(booking.id)} 
                            className="btn btn-secondary btn-3d" 
                            style={{ flex: 1, color: '#ffffff' }}
                            disabled={loading}
                          >
                            Accept Offer
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(booking.id)} 
                            className="btn btn-outline btn-3d" 
                            style={{ flex: 1 }}
                            disabled={loading}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Active Escrow Deliveries</h3>
                {myDeliveries.filter(b => b.status !== 'pending').length === 0 ? (
                  <div className="card-3d" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--bg-surface)' }}>
                    <Lock size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No active delivery jobs currently.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {myDeliveries.filter(b => b.status !== 'pending').map((booking) => (
                      <div key={booking.id} className="card-3d card-3d-stacked" style={{ borderLeft: `4px solid ${booking.status === 'delivered' ? 'var(--success)' : 'var(--secondary)'}`, backgroundColor: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div>
                            <h4 className="card-title" style={{ margin: 0 }}>{booking.title}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Route: {booking.origin} to {booking.destination}</span>
                          </div>
                          <div>
                            {getStatusBadge(booking.status)}
                            {getEscrowBadge(booking.payment_status)}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '10px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                          <div><strong>Weight:</strong> {booking.weight} kg</div>
                          <div><strong>Sender Contact:</strong> {booking.sender?.phone || 'No phone'}</div>
                          <div><strong>Total Payout:</strong> <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{booking.price}</span></div>
                        </div>

                        {/* Display pickup and delivery addresses */}
                        {booking.notes && (
                          <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>DELIVERY SPECIFICATIONS & DIRECTIONS</div>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {booking.notes}
                            </pre>
                          </div>
                        )}

                        {/* Tracking route map */}
                        <TrackingMap bookingId={booking.id} origin={booking.origin} destination={booking.destination} status={booking.status} />

                        {/* OTP Verification Forms */}
                        <div style={{ marginTop: '15px' }}>
                          {booking.status === 'paid' && (
                            <div>
                              <label className="form-label">Verify Hand-Over Pickup OTP</label>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                  type="text" 
                                  maxLength="4" 
                                  placeholder="Enter 4-digit code" 
                                  value={otpInputs[booking.id]?.value || ''}
                                  onChange={(e) => setOtpInputs({ ...otpInputs, [booking.id]: { type: 'pickup', value: e.target.value } })}
                                  className="form-input" 
                                  style={{ maxWidth: '200px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }} 
                                />
                                <button 
                                  onClick={() => handleVerifyOtp(booking, 'pickup')}
                                  className="btn btn-secondary btn-3d" 
                                  style={{ width: 'auto', color: '#ffffff' }}
                                  disabled={loading}
                                >
                                  Confirm Pickup
                                </button>
                              </div>
                            </div>
                          )}

                          {booking.status === 'in_transit' && (
                            <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <label className="form-label" style={{ color: 'var(--secondary)', marginBottom: '12px' }}>Verify Drop-off Delivery OTP & Upload Proof</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input 
                                  type="text" 
                                  maxLength="4" 
                                  placeholder="Enter 4-digit OTP" 
                                  value={otpInputs[booking.id]?.value || ''}
                                  onChange={(e) => setOtpInputs({ ...otpInputs, [booking.id]: { ...otpInputs[booking.id], type: 'delivery', value: e.target.value } })}
                                  className="form-input" 
                                  style={{ maxWidth: '200px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }} 
                                />
                                <div>
                                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Proof of Delivery Photo (Required)</label>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        setOtpInputs({ ...otpInputs, [booking.id]: { ...otpInputs[booking.id], type: 'delivery', file: e.target.files[0] } });
                                      }
                                    }}
                                    className="form-input" 
                                    style={{ maxWidth: '300px' }} 
                                  />
                                </div>
                                <button 
                                  onClick={() => handleVerifyOtp(booking, 'delivery')}
                                  className="btn btn-secondary btn-3d" 
                                  style={{ width: 'fit-content', color: '#ffffff' }}
                                  disabled={loading}
                                >
                                  {loading ? <RefreshCw className="spinner" size={16} /> : 'Confirm Drop-off & Release Funds'}
                                </button>
                              </div>
                            </div>
                          )}

                          {booking.status === 'delivered' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>
                              <CheckCircle size={18} /> Delivery verified. Escrow funds released to your wallet.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NEW TAB: SENDER HISTORY */}
            {activeTab === 'sender_history' && (
              <div>
                <h2 className="section-title">Parcel History</h2>
                <p className="subtitle">View your past completed or cancelled shipments.</p>
                {myShipments.filter(b => b.status === 'delivered' || b.status === 'cancelled').length === 0 ? (
                  <div className="card-3d" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--bg-surface)' }}>
                    <Clock size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>You don't have any past shipments in history.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {myShipments.filter(b => b.status === 'delivered' || b.status === 'cancelled').map((booking) => (
                      <div key={booking.id} className="card-3d card-3d-stacked" style={{ borderLeft: `4px solid ${booking.status === 'delivered' ? 'var(--success)' : 'var(--danger)'}`, backgroundColor: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                          <div>
                            <h4 className="card-title" style={{ margin: 0 }}>{booking.title}</h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Transit: {booking.origin} to {booking.destination}
                            </div>
                          </div>
                          <div>{getStatusBadge(booking.status)}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', fontSize: '0.9rem', color: 'var(--text-secondary)', padding: 'var(--space-3) 0', borderTop: '1px solid var(--border-color)', marginTop: 'var(--space-3)' }}>
                          <div><strong>Weight:</strong> {booking.weight} kg</div>
                          <div><strong>Cost:</strong> ₹{booking.price}</div>
                          <div><strong>Carrier:</strong> {booking.carrier?.name || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NEW TAB: CARRIER ANALYTICS */}
            {activeTab === 'carrier_analytics' && (
              <div>
                <h2 className="section-title">Earnings & Analytics</h2>
                <p className="subtitle">Track your delivery performance and generated revenue.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '4px solid var(--success)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL EARNINGS</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px', color: 'var(--success)' }}>
                      ₹{myDeliveries.filter(b => b.status === 'delivered').reduce((acc, curr) => acc + parseFloat(curr.price || 0), 0).toFixed(0)}
                    </div>
                  </div>
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '4px solid var(--secondary)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DELIVERED PARCELS</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>
                      {myDeliveries.filter(b => b.status === 'delivered').length}
                    </div>
                  </div>
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '4px solid var(--info)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ACTIVE ROUTES</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>
                      {myRoutes.length}
                    </div>
                  </div>
                </div>
                
                <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Recent Earnings</h3>
                {myDeliveries.filter(b => b.status === 'delivered').length === 0 ? (
                  <div className="card-3d" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--bg-surface)' }}>
                    <DollarSign size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>No completed deliveries yet to show earnings.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {myDeliveries.filter(b => b.status === 'delivered').map((booking) => (
                      <div key={booking.id} className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem' }}>{booking.title}</h4>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(booking.created_at).toLocaleDateString()} • {booking.origin} ➔ {booking.destination}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.1rem' }}>+ ₹{booking.price}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB E: PROFILE SETTINGS */}
            {activeTab === 'profile_settings' && (
              <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                  <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Account Settings</h2>
                  <p className="subtitle" style={{ fontSize: '1rem' }}>Manage your personal information and account preferences.</p>
                </div>

                {/* Account Role Display */}
                <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={20} style={{ color: 'var(--primary)' }} /> Account Role
                  </h3>
                  
                  {(!profileRoles || profileRoles.length === 0) ? (
                    <div style={{ padding: 'var(--space-6)', backgroundColor: 'rgba(245,158,11,0.05)', borderRadius: 'var(--radius-lg)', border: '1px dashed #f59e0b', textAlign: 'center' }}>
                      <AlertCircle size={32} style={{ color: '#f59e0b', margin: '0 auto var(--space-3)' }} />
                      <h4 style={{ color: '#f59e0b', fontSize: '1.1rem', marginBottom: '8px' }}>Action Required: Select Your Role</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-5)' }}>
                        You haven't selected an account role yet. Please choose whether you want to send packages or carry them. This defines your primary dashboard experience.
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => handleUpdateRole('sender')}
                          disabled={loading}
                          className="btn btn-primary btn-3d" 
                          style={{ minWidth: '160px' }}
                        >
                          <Send size={16} /> I am a Sender
                        </button>
                        <button 
                          onClick={() => handleUpdateRole('carrier')}
                          disabled={loading}
                          className="btn btn-secondary btn-3d" 
                          style={{ minWidth: '160px', color: 'white' }}
                        >
                          <Briefcase size={16} /> I am a Carrier
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                          👤
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{profile?.name || 'User'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {profileRoles.includes('sender') && (
                          <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, background: 'rgba(79,70,229,0.15)', color: 'var(--primary)', border: '1px solid rgba(79,70,229,0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Send size={14} /> Sender
                          </span>
                        )}
                        {profileRoles.includes('carrier') && (
                          <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Navigation size={14} /> Carrier
                          </span>
                        )}
                        {profileRoles.includes('admin') && (
                          <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldAlert size={14} /> Admin
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {profileRoles?.length > 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'var(--space-4)', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                      ℹ️ Your role was assigned at signup and dictates your dashboard layout. It can only be changed by an administrator.
                    </p>
                  )}
                </div>

                {/* Editable profile fields */}
                <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', padding: 'var(--space-6)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={20} style={{ color: 'var(--primary)' }} /> Personal Details
                  </h3>
                  <form onSubmit={handleUpdateProfile}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                          <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input 
                            type="text" 
                            required 
                            value={profileName} 
                            onChange={(e) => setProfileName(e.target.value)}
                            className="form-input" 
                            style={{ paddingLeft: '42px' }}
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Phone Number</label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input 
                            type="text" 
                            value={profilePhone || ''} 
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="form-input"
                            placeholder="+91 XXXXX XXXXX"
                            style={{ paddingLeft: '42px' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary btn-3d" disabled={loading} style={{ padding: '12px 30px', fontSize: '1rem' }}>
                        {loading ? <RefreshCw className="spinner" size={18} /> : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB F: ADMIN PANEL */}
            {activeTab === 'admin_panel' && (
              <div>
                <h2 className="section-title" style={{ color: 'var(--danger)' }}>Admin Control Panel</h2>
                <p className="subtitle">Overview of system profiles, active travel paths, and financial escrow allocations.</p>

                {/* Stat metrics cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '4px solid var(--primary)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL USERS</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>{adminProfiles.length}</div>
                  </div>
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '4px solid var(--secondary)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ACTIVE ROUTES</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>{adminRoutes.length}</div>
                  </div>
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '4px solid var(--info)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ACTIVE BOOKINGS</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>{adminBookings.filter(b => b.status !== 'cancelled').length}</div>
                  </div>
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '4px solid var(--success)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ESCROW POOL</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px', color: 'var(--success)' }}>
                      ₹{adminBookings.filter(b => b.status === 'paid' || b.status === 'in_transit').reduce((acc, curr) => acc + parseFloat(curr.price || 0), 0).toFixed(0)}
                    </div>
                  </div>
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PLATFORM REVENUE</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px', color: '#f59e0b' }}>
                      ₹{(adminBookings
                        .filter(b => b.status !== 'cancelled')
                        .reduce((acc, curr) => {
                          const total = parseFloat(curr.price || 0);
                          const commission = total - (total / 1.10); // 10% fee from total
                          return acc + commission;
                        }, 0)
                      ).toFixed(0)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>10% of all bookings</div>
                  </div>
                </div>


                {/* Data Tables */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                  
                  {/* Profiles table */}
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', overflowX: 'auto' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}><Users size={18} /> User Directory</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                          <th style={{ padding: '10px' }}>Name</th>
                          <th style={{ padding: '10px' }}>Phone</th>
                          <th style={{ padding: '10px' }}>Roles</th>
                          <th style={{ padding: '10px' }}>Rating</th>
                          <th style={{ padding: '10px' }}>User ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminProfiles.map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px', fontWeight: 600 }}>{p.name}</td>
                            <td style={{ padding: '10px' }}>{p.phone || 'N/A'}</td>
                            <td style={{ padding: '10px' }}>
                              {p.roles?.map(r => (
                                <span key={r} style={{ margin: '0 2px', padding: '1px 5px', fontSize: '0.7rem', borderRadius: '4px', backgroundColor: r === 'admin' ? 'var(--danger-glow)' : 'var(--bg-main)', color: r === 'admin' ? 'var(--danger)' : 'var(--text-secondary)' }}>{r}</span>
                              ))}
                            </td>
                            <td style={{ padding: '10px', color: 'var(--warning)' }}>★ {p.rating_avg} ({p.rating_count})</td>
                            <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Active Bookings/Parcels table */}
                  <div className="card-3d" style={{ backgroundColor: 'var(--bg-surface)', overflowX: 'auto' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}><Layers size={18} /> Parcel Registry</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                          <th style={{ padding: '10px' }}>Parcel Name</th>
                          <th style={{ padding: '10px' }}>Sender</th>
                          <th style={{ padding: '10px' }}>Carrier</th>
                          <th style={{ padding: '10px' }}>Route</th>
                          <th style={{ padding: '10px' }}>Escrow Cost</th>
                          <th style={{ padding: '10px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminBookings.map(b => (
                          <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px', fontWeight: 600 }}>{b.title}</td>
                            <td style={{ padding: '10px' }}>{b.sender?.name || 'N/A'}</td>
                            <td style={{ padding: '10px' }}>{b.carrier?.name || 'Unassigned'}</td>
                            <td style={{ padding: '10px', fontSize: '0.75rem' }}>{b.origin} to {b.destination}</td>
                            <td style={{ padding: '10px', color: 'var(--success)', fontWeight: 600 }}>₹{b.price}</td>
                            <td style={{ padding: '10px' }}>{getStatusBadge(b.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            )}

          </div>

        </main>
      </div>

      {/* ========================================================================= */}
      {/* REQUEST PARCEL MODAL                                                      */}
      {/* ========================================================================= */}
      {showRequestModal && selectedRoute && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card-3d" style={{ maxWidth: '460px', width: '100%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="card-title">Book Courier Journey</h3>
            <p className="subtitle" style={{ fontSize: '0.85rem' }}>
              Carrier traveler: <strong>{selectedRoute.carrier?.name}</strong> routing from <strong>{selectedRoute.origin}</strong> to <strong>{selectedRoute.destination}</strong>.
            </p>
            <form onSubmit={handleRequestCarry}>
              <div className="form-group">
                <label className="form-label">Parcel Name / Description</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Laptop, Bag, Documents" 
                  value={newParcel.title}
                  onChange={(e) => setNewParcel({...newParcel, title: e.target.value})}
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Parcel Weight (kg)</label>
                <input 
                  type="number" 
                  min="0.1" 
                  step="0.1" 
                  required 
                  placeholder="e.g. 1.5" 
                  value={newParcel.weight}
                  onChange={(e) => setNewParcel({...newParcel, weight: e.target.value})}
                  className="form-input" 
                />
              </div>

              {/* Exact Pickup Address Input */}
              <div className="form-group">
                <label className="form-label">Exact Pickup Address (within {selectedRoute.origin.split(',')[0]})</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Connaught Place, Block C, House 24" 
                  value={newParcel.pickupAddress}
                  onChange={(e) => setNewParcel({...newParcel, pickupAddress: e.target.value})}
                  className="form-input" 
                />
              </div>

              {/* Exact Delivery Address Input */}
              <div className="form-group">
                <label className="form-label">Exact Delivery Address (within {selectedRoute.destination.split(',')[0]})</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Bandra West, Hill Road, Building 10" 
                  value={newParcel.deliveryAddress}
                  onChange={(e) => setNewParcel({...newParcel, deliveryAddress: e.target.value})}
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Special Delivery Notes</label>
                <textarea 
                  rows="2" 
                  placeholder="e.g. Fragile package, handle with care" 
                  value={newParcel.notes}
                  onChange={(e) => setNewParcel({...newParcel, notes: e.target.value})}
                  className="form-input" 
                  style={{ resize: 'none' }}
                />
              </div>
              {newParcel.weight && (() => {
                const PLATFORM_FEE_PCT = 0.10;
                const weightNum = parseFloat(newParcel.weight) || 0;
                const base = weightNum * selectedRoute.price_per_kg;
                const fee = base * PLATFORM_FEE_PCT;
                const total = base + fee;
                return (
                  <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>🧳 Carrier charge ({weightNum}kg × ₹{selectedRoute.price_per_kg})</span>
                      <span>₹{base.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>🏷️ Carrytrip platform fee (10%)</span>
                      <span>₹{fee.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontWeight: 700, fontSize: '1rem' }}>
                      <span>💳 Total you pay</span>
                      <span style={{ color: 'var(--success)' }}>₹{total.toFixed(2)}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Carrier receives ₹{base.toFixed(2)} · Platform earns ₹{fee.toFixed(2)}
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary btn-3d" style={{ flex: 1 }} disabled={loading}>
                  Book Transit
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowRequestModal(false); setSelectedRoute(null); }} 
                  className="btn btn-outline btn-3d" 
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOCK ESCROW PAYMENT MODAL                                                 */}
      {/* ========================================================================= */}
      {showPaymentModal && selectedBookingForPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card-3d" style={{ maxWidth: '440px', width: '100%', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--success-glow)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Lock size={22} />
              </div>
              <h3 className="card-title" style={{ margin: 0 }}>Secure Escrow Payment</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Funds will be safely locked in Carrytrip Escrow.
              </p>
            </div>
            {/* Price breakdown */}
            {(() => {
              const PLATFORM_FEE_PCT = 0.10;
              const total = parseFloat(selectedBookingForPayment.price) || 0;
              const base = (total / 1.10).toFixed(2);
              const fee = (total - parseFloat(base)).toFixed(2);
              const carrierReceives = base;
              return (
                <div style={{ background: 'var(--bg-main)', borderRadius: '10px', padding: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>PAYMENT BREAKDOWN</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>🧳 Delivery service ({selectedBookingForPayment.title})</span>
                    <span>₹{base}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>🏷️ Carrytrip platform fee (10%)</span>
                    <span>₹{fee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontWeight: 700, fontSize: '1rem' }}>
                    <span>💳 Total</span>
                    <span style={{ color: 'var(--success)' }}>₹{total.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', padding: '6px 8px', background: 'rgba(16,185,129,0.06)', borderRadius: '6px' }}>
                    🔒 Carrier receives ₹{carrierReceives} after successful delivery
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', color: 'var(--success)', fontSize: '0.75rem' }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>Escrow Guarantee: Funds are only released to the carrier after you provide the Delivery OTP upon receipt.</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleRazorpayPayment} 
                className="btn btn-success btn-primary btn-3d" 
                style={{ flex: 1 }} 
                disabled={loading}
              >
                {loading ? <RefreshCw className="spinner" size={16} /> : `Pay ₹${selectedBookingForPayment.price} securely`}
              </button>
              <button 
                type="button" 
                onClick={() => { setShowPaymentModal(false); setSelectedBookingForPayment(null); }} 
                className="btn btn-outline btn-3d" 
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Dashboard crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: 'red', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h2>Dashboard Crashed</h2>
          <p>{this.state.error?.message}</p>
          <p>{this.state.error?.stack}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DashboardWithBoundary = () => (
  <DashboardErrorBoundary>
    <Dashboard />
  </DashboardErrorBoundary>
);

export default DashboardWithBoundary;
