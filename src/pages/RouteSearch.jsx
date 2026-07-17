import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, ArrowDownUp, MapPin, Calendar, Clock, Search, Navigation } from 'lucide-react';

// Fix Leaflet default icon path issues in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically fit bounds of the route or markers
const MapBoundsFitter = ({ originCoords, destCoords, routeCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (originCoords && destCoords) {
      const bounds = L.latLngBounds([originCoords, destCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (originCoords) {
      map.flyTo(originCoords, 14);
    } else if (destCoords) {
      map.flyTo(destCoords, 14);
    }
  }, [map, originCoords, destCoords, routeCoords]);
  return null;
};

// Autocomplete Input Component using Nominatim
const NominatimInput = ({ placeholder, value, onChange, onSelectPlace }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  useEffect(() => {
    const fetchPlaces = async () => {
      if (value.trim().length < 3 || !showSuggestions) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Nominatim fetch error:", err);
      }
    };

    const timer = setTimeout(fetchPlaces, 500); // Debounce
    return () => clearTimeout(timer);
  }, [value, showSuggestions]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input 
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => {
          if (value.length >= 3) setShowSuggestions(true);
        }}
        style={{ 
          width: '100%', 
          border: 'none', 
          padding: '8px 0', 
          fontSize: '1rem', 
          fontWeight: 500, 
          outline: 'none',
          backgroundColor: 'transparent',
          borderBottom: placeholder.includes("from") ? '1px solid var(--border-color)' : 'none'
        }} 
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="custom-autocomplete-dropdown">
          {suggestions.map((place, idx) => (
            <div 
              key={idx} 
              className="custom-autocomplete-item"
              onClick={() => {
                onSelectPlace(place);
                setShowSuggestions(false);
              }}
            >
              <MapPin size={12} style={{ display: 'inline-block', marginRight: '6px', color: 'var(--primary)', opacity: 0.7 }} />
              {place.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RouteSearch = () => {
  const navigate = useNavigate();

  // Form State
  const [originText, setOriginText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  // Fetch route from OSRM
  useEffect(() => {
    const fetchRoute = async () => {
      if (!originCoords || !destCoords) return;
      try {
        // OSRM expects lon,lat
        const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          // GeoJSON coordinates are [lon, lat], Leaflet needs [lat, lon]
          const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoords(latLngs);
          
          // Format distance and duration
          const distKm = (route.distance / 1000).toFixed(1);
          setDistance(`${distKm} km`);
          
          const durMin = Math.round(route.duration / 60);
          const durText = durMin > 60 ? `${Math.floor(durMin/60)} h ${durMin%60} min` : `${durMin} min`;
          setDuration(durText);
        }
      } catch (err) {
        console.error("OSRM route error:", err);
      }
    };

    fetchRoute();
  }, [originCoords, destCoords]);

  const handleOriginSelect = (place) => {
    setOriginText(place.display_name);
    setOriginCoords([parseFloat(place.lat), parseFloat(place.lon)]);
  };

  const handleDestSelect = (place) => {
    setDestinationText(place.display_name);
    setDestCoords([parseFloat(place.lat), parseFloat(place.lon)]);
  };

  const swapLocations = () => {
    const tempText = originText;
    const tempCoords = originCoords;
    
    setOriginText(destinationText);
    setOriginCoords(destCoords);
    
    setDestinationText(tempText);
    setDestCoords(tempCoords);
  };

  const handleSearch = () => {
    if (!originText || !destinationText || !date) {
      alert("Please fill in the origin, destination, and date.");
      return;
    }
    navigate(`/results?origin=${encodeURIComponent(originText)}&destination=${encodeURIComponent(destinationText)}&date=${date}&time=${time}`);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
      
      {/* Background Map (Leaflet) */}
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        zoomControl={false}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {originCoords && <Marker position={originCoords} />}
        {destCoords && <Marker position={destCoords} />}
        {routeCoords.length > 0 && (
          <Polyline 
            positions={routeCoords} 
            color="var(--primary)" 
            weight={4} 
            opacity={0.8} 
          />
        )}

        <MapBoundsFitter originCoords={originCoords} destCoords={destCoords} routeCoords={routeCoords} />
      </MapContainer>

      {/* Top Overlay: Origin / Destination Inputs */}
      <div style={{ 
        position: 'absolute', 
        top: '16px', 
        left: '16px', 
        right: '16px', 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--bg-surface)', 
            border: 'none', 
            boxShadow: 'var(--shadow-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </button>

        {/* Input Card */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-4)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          {/* Timeline Dots */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', alignSelf: 'stretch', padding: '10px 0' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-primary)' }}></div>
            <div style={{ width: '2px', flexGrow: 1, backgroundColor: 'var(--border-color)' }}></div>
            <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary)' }}></div>
          </div>

          {/* Inputs */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <NominatimInput 
              placeholder="Where from?" 
              value={originText} 
              onChange={setOriginText} 
              onSelectPlace={handleOriginSelect} 
            />
            <NominatimInput 
              placeholder="Where to?" 
              value={destinationText} 
              onChange={setDestinationText} 
              onSelectPlace={handleDestSelect} 
            />
          </div>

          {/* Swap Button */}
          <button 
            onClick={swapLocations}
            style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--bg-hover)', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowDownUp size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Overlay: Date/Time and Submit */}
      <div style={{ 
        position: 'absolute', 
        bottom: '16px', 
        left: '16px', 
        right: '16px', 
        zIndex: 10,
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {routeCoords.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span><Navigation size={14} style={{ display: 'inline', marginRight: '4px' }} /> {distance}</span>
            <span><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> {duration}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Pickup Date</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 10px 8px 34px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-input)'
                }} 
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Time (Optional)</label>
            <div style={{ position: 'relative' }}>
              <Clock size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 10px 8px 34px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-input)'
                }} 
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSearch}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <Search size={18} /> Find Carriers
        </button>
      </div>

    </div>
  );
};

export default RouteSearch;
