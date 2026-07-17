import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Send, DollarSign, MapPin, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const Home = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error logging out:', err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Navbar */}
      <header className="main-header">
        <div className="navbar">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Carrytrip
          </div>
          <nav>
            <ul className="nav-links">
              <li><a href="#features" className="nav-link">Features</a></li>
              <li><a href="#how-it-works" className="nav-link">How it Works</a></li>
              <li><a href="#safety" className="nav-link">Safety</a></li>
            </ul>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', position: 'relative' }}>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="btn btn-primary" 
                  style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.875rem', width: 'auto' }}
                >
                  Dashboard
                </Link>
                {/* User Dropdown Menu */}
                <div 
                  className="user-profile-menu" 
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={(e) => {
                    const menu = e.currentTarget.querySelector('.dropdown-content');
                    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                  }}
                  onMouseLeave={(e) => {
                    const menu = e.currentTarget.querySelector('.dropdown-content');
                    if (menu) menu.style.display = 'none';
                  }}
                >
                  <div className="avatar" style={{ border: '2px solid var(--primary)', transition: '0.2s' }}>
                    {(profile?.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  
                  <div className="dropdown-content" style={{
                    display: 'none',
                    position: 'absolute',
                    right: 0,
                    top: '120%',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-xl)',
                    minWidth: '220px',
                    zIndex: 100,
                    padding: '8px',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{profile?.name || 'User'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    </div>
                    
                    <div 
                      onClick={() => navigate('/dashboard', { state: { defaultTab: 'profile_settings' } })}
                      style={{ padding: '10px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Sparkles size={16} /> Profile & Settings
                    </div>
                    
                    <div 
                      onClick={() => navigate('/dashboard')}
                      style={{ padding: '10px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <MapPin size={16} /> My Dashboard
                    </div>

                    <div 
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleLogout();
                      }}
                      style={{ padding: '10px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', marginTop: '4px', borderTop: '1px solid var(--border-color)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <CheckCircle2 size={16} /> Logout
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="btn btn-outline" 
                  style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.875rem', width: 'auto' }}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="btn btn-primary" 
                  style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.875rem', width: 'auto' }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: 'var(--space-16) 0 var(--space-12)',
        background: 'radial-gradient(circle at top, rgba(0, 242, 254, 0.12) 0%, transparent 65%)',
        textAlign: 'center'
      }}>
        <div className="app-container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', backgroundColor: 'var(--primary-glow)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-6)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
            <Sparkles size={16} />
            Peer-to-Peer Shipping Revolution
          </div>
          <h1 className="display-title" style={{ fontSize: '3.5rem', lineHeight: '1.1', maxWidth: '800px', margin: '0 auto var(--space-4)' }}>
            Delivery matching for travelers and senders.
          </h1>
          <p className="subtitle" style={{ fontSize: '1.25rem', maxWidth: '640px', margin: '0 auto var(--space-8)' }}>
            Commuters and long-distance travelers carry packages for you on routes they're already taking. Faster, cheaper, and greener than traditional logistics.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '500px', margin: '0 auto' }}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: 'var(--space-4) var(--space-8)' }}>
                Go to App Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary" style={{ padding: 'var(--space-4) var(--space-8)', flex: 1, minWidth: '200px' }}>
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ padding: 'var(--space-4) var(--space-8)', flex: 1, minWidth: '200px' }}>
                  Learn More
                </Link>
              </>
            )}
          </div>

          {/* Hero Animated Map Scene — Full Width, High Visibility */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            marginTop: '56px',
          }}>
            {/* Ambient glow */}
            <div style={{
              position: 'absolute',
              top: '40%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '70%', height: '60%',
              background: 'radial-gradient(ellipse, rgba(79,70,229,0.35) 0%, rgba(217,119,6,0.12) 50%, transparent 80%)',
              filter: 'blur(60px)',
              zIndex: 0, pointerEvents: 'none',
            }} />

            <div style={{
              position: 'relative', zIndex: 1,
              borderRadius: '20px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              background: '#08080f',
            }}>
              <svg viewBox="0 0 1200 560" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
                <defs>
                  <pattern id="hGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(79,70,229,0.07)" strokeWidth="1"/>
                  </pattern>
                  <radialGradient id="hDestGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="hOriginGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="hRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5"/>
                    <stop offset="50%" stopColor="#7c3aed"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                  <radialGradient id="hRiderGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="softglow">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <clipPath id="hClip">
                    <rect width="1200" height="560" rx="20"/>
                  </clipPath>
                  {/* The main route path — courier follows this */}
                  <path id="hRoutePath" d="M 160,420 C 240,420 280,300 380,270 C 480,240 560,340 660,300 C 760,260 840,200 1040,220" fill="none"/>
                  <linearGradient id="hBottomFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="55%" stopColor="transparent"/>
                    <stop offset="100%" stopColor="#08080f"/>
                  </linearGradient>
                </defs>

                {/* ── BACKGROUND ── */}
                <rect width="1200" height="560" fill="#08080f" clipPath="url(#hClip)"/>
                <rect width="1200" height="560" fill="url(#hGrid)" clipPath="url(#hClip)"/>

                {/* ── CITY BUILDINGS (top zone) ── */}
                {[
                  [30,40,90,60],[140,20,110,80],[270,30,80,70],[370,15,130,85],[520,25,100,75],[640,10,120,90],[780,20,90,80],[890,30,100,70],[1010,15,110,85],[1130,25,60,75],
                  [30,120,70,50],[120,130,90,40],[230,115,110,55],[360,125,80,45],[460,118,100,52],[580,122,85,48],[690,115,120,55],[830,120,90,50],[950,118,100,52],[1080,122,100,48],
                ].map(([x, y, w, h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} rx="4"
                    fill={i % 4 === 0 ? 'rgba(79,70,229,0.09)' : i % 3 === 0 ? 'rgba(25,25,50,0.95)' : 'rgba(15,15,30,0.98)'}
                    stroke="rgba(79,70,229,0.1)" strokeWidth="1"
                  />
                ))}
                {/* Window lights in buildings */}
                {[
                  [50,55,8,6],[70,55,8,6],[50,70,8,6],[70,70,8,6],
                  [160,35,10,8],[185,35,10,8],[160,55,10,8],
                  [395,30,12,8],[420,30,12,8],[395,55,12,8],[420,55,12,8],[395,80,12,8],
                  [660,25,10,7],[690,25,10,7],[660,50,10,7],[690,50,10,7],[660,75,10,7],
                  [800,35,10,7],[830,35,10,7],[800,55,10,7],
                ].map(([x,y,w,h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} rx="2"
                    fill={i % 3 === 0 ? 'rgba(245,158,11,0.6)' : 'rgba(99,102,241,0.5)'}
                    opacity={Math.random() > 0.5 ? 1 : 0.4}
                  />
                ))}

                {/* ── ROADS (horizontal) ── */}
                {[190, 290, 390, 470].map((y, i) => (
                  <g key={i}>
                    <line x1="0" y1={y} x2="1200" y2={y} stroke="rgba(255,255,255,0.035)" strokeWidth="28"/>
                    <line x1="0" y1={y} x2="1200" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="20 15"/>
                  </g>
                ))}
                {/* ── ROADS (vertical) ── */}
                {[130, 320, 500, 700, 880, 1070].map((x, i) => (
                  <g key={i}>
                    <line x1={x} y1="0" x2={x} y2="560" stroke="rgba(255,255,255,0.035)" strokeWidth="28"/>
                    <line x1={x} y1="0" x2={x} y2="560" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="20 15"/>
                  </g>
                ))}

                {/* ── MID CITY BLOCKS ── */}
                {[
                  [50,200,70,60],[160,205,100,55],[290,198,90,58],[415,202,110,54],[545,200,80,58],[650,205,105,52],[785,200,85,55],[900,203,100,53],[1040,198,120,58],
                  [50,310,85,55],[155,315,95,50],[270,308,100,55],[390,312,90,52],[500,310,105,55],[630,315,80,50],[740,308,110,55],[880,312,90,52],[1010,310,130,55],
                ].map(([x, y, w, h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} rx="4"
                    fill={i % 5 === 0 ? 'rgba(79,70,229,0.06)' : 'rgba(18,18,35,0.95)'}
                    stroke="rgba(79,70,229,0.08)" strokeWidth="1"
                  />
                ))}

                {/* ── ORIGIN GLOW PULSE ── */}
                <ellipse cx="160" cy="420" rx="55" ry="32" fill="url(#hOriginGlow)" opacity="0.8">
                  <animate attributeName="rx" values="55;75;55" dur="2.2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite"/>
                </ellipse>

                {/* ── DESTINATION GLOW PULSE ── */}
                <ellipse cx="1040" cy="220" rx="55" ry="32" fill="url(#hDestGlow)" opacity="0.8">
                  <animate attributeName="rx" values="55;78;55" dur="2.6s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2.6s" repeatCount="indefinite"/>
                </ellipse>

                {/* ── ROUTE: thick glow trail ── */}
                <path d="M 160,420 C 240,420 280,300 380,270 C 480,240 560,340 660,300 C 760,260 840,200 1040,220"
                  fill="none" stroke="rgba(79,70,229,0.15)" strokeWidth="30" strokeLinecap="round"/>
                <path d="M 160,420 C 240,420 280,300 380,270 C 480,240 560,340 660,300 C 760,260 840,200 1040,220"
                  fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="18" strokeLinecap="round"/>

                {/* ── ROUTE: main glowing line ── */}
                <path d="M 160,420 C 240,420 280,300 380,270 C 480,240 560,340 660,300 C 760,260 840,200 1040,220"
                  fill="none" stroke="url(#hRouteGrad)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="1400" strokeDashoffset="1400" filter="url(#glow)">
                  <animate attributeName="stroke-dashoffset" values="1400;0" dur="2.8s" fill="freeze" begin="0.3s" calcMode="spline" keySplines="0.4 0 0.2 1"/>
                </path>

                {/* ── ROUTE: animated flowing dots ── */}
                <path d="M 160,420 C 240,420 280,300 380,270 C 480,240 560,340 660,300 C 760,260 840,200 1040,220"
                  fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeDasharray="10 28" strokeLinecap="round">
                  <animate attributeName="stroke-dashoffset" values="0;-76" dur="1.4s" repeatCount="indefinite"/>
                </path>

                {/* ── ORIGIN PIN ── */}
                <g transform="translate(160, 405)">
                  {/* Ripple rings */}
                  <circle r="20" fill="none" stroke="#4f46e5" strokeWidth="2" opacity="0.5">
                    <animate attributeName="r" values="14;30;14" dur="2.2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite"/>
                  </circle>
                  <circle r="14" fill="#4f46e5" opacity="0.25"/>
                  <circle r="10" fill="#4f46e5" filter="url(#glow)"/>
                  <circle r="5" fill="white"/>
                  {/* Label */}
                  <rect x="16" y="-18" width="110" height="34" rx="8" fill="rgba(79,70,229,0.95)"/>
                  <text x="71" y="-3" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="system-ui, sans-serif">📦 Mumbai</text>
                  <text x="71" y="11" textAnchor="middle" fill="rgba(200,200,255,0.85)" fontSize="10" fontFamily="system-ui, sans-serif">Origin</text>
                </g>

                {/* ── DESTINATION PIN ── */}
                <g transform="translate(1040, 205)">
                  <circle r="20" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.5">
                    <animate attributeName="r" values="14;32;14" dur="2.6s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite"/>
                  </circle>
                  <circle r="14" fill="#10b981" opacity="0.25"/>
                  <circle r="10" fill="#10b981" filter="url(#glow)"/>
                  <circle r="5" fill="white"/>
                  {/* Label */}
                  <rect x="-126" y="-18" width="110" height="34" rx="8" fill="rgba(16,185,129,0.95)"/>
                  <text x="-71" y="-3" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="system-ui, sans-serif">🏁 Delhi</text>
                  <text x="-71" y="11" textAnchor="middle" fill="rgba(180,255,220,0.85)" fontSize="10" fontFamily="system-ui, sans-serif">Destination</text>
                </g>

                {/* ════════════════════════════════════════ */}
                {/* ══  ANIMATED COURIER CHARACTER  ══════  */}
                {/* ════════════════════════════════════════ */}
                <g>
                  <animateMotion dur="5.5s" repeatCount="indefinite" begin="0.5s" calcMode="spline" keySplines="0.42 0 0.58 1" rotate="auto">
                    <mpath href="#hRoutePath"/>
                  </animateMotion>

                  {/* Ground shadow */}
                  <ellipse cx="0" cy="52" rx="28" ry="9" fill="rgba(0,0,0,0.5)"/>

                  {/* Halo glow */}
                  <ellipse cx="0" cy="20" rx="55" ry="35" fill="url(#hRiderGlow)" opacity="0.45"/>

                  {/* ── LEGS ── */}
                  {/* Left leg */}
                  <line x1="-9" y1="18" x2="-16" y2="44" stroke="#1e1b4b" strokeWidth="10" strokeLinecap="round">
                    <animate attributeName="x2" values="-16;-8;-16" dur="0.55s" repeatCount="indefinite"/>
                    <animate attributeName="y2" values="44;38;44" dur="0.55s" repeatCount="indefinite"/>
                  </line>
                  {/* Right leg */}
                  <line x1="9" y1="18" x2="16" y2="44" stroke="#1e1b4b" strokeWidth="10" strokeLinecap="round">
                    <animate attributeName="x2" values="16;8;16" dur="0.55s" repeatCount="indefinite" begin="0.27s"/>
                    <animate attributeName="y2" values="44;38;44" dur="0.55s" repeatCount="indefinite" begin="0.27s"/>
                  </line>
                  {/* Left shoe */}
                  <ellipse cx="-14" cy="45" rx="10" ry="5" fill="#312e81">
                    <animate attributeName="cx" values="-14;-8;-14" dur="0.55s" repeatCount="indefinite"/>
                  </ellipse>
                  {/* Right shoe */}
                  <ellipse cx="14" cy="45" rx="10" ry="5" fill="#312e81">
                    <animate attributeName="cx" values="14;8;14" dur="0.55s" repeatCount="indefinite" begin="0.27s"/>
                  </ellipse>

                  {/* ── TORSO ── */}
                  <rect x="-14" y="-16" width="28" height="36" rx="8" fill="#f59e0b"/>
                  {/* Jacket detail */}
                  <line x1="0" y1="-16" x2="0" y2="20" stroke="rgba(0,0,0,0.15)" strokeWidth="2"/>
                  <rect x="-7" y="-8" width="6" height="8" rx="2" fill="rgba(255,255,255,0.2)"/>
                  {/* Belt */}
                  <rect x="-14" y="14" width="28" height="5" rx="2" fill="rgba(0,0,0,0.2)"/>

                  {/* ── LEFT ARM + PACKAGE ── */}
                  <line x1="-14" y1="-8" x2="-34" y2="6" stroke="#fde68a" strokeWidth="8" strokeLinecap="round"/>
                  {/* Package */}
                  <rect x="-52" y="-4" width="24" height="20" rx="4" fill="#d97706"/>
                  <rect x="-52" y="-4" width="24" height="20" rx="4" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
                  {/* Package cross straps */}
                  <line x1="-40" y1="-4" x2="-40" y2="16" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
                  <line x1="-52" y1="6" x2="-28" y2="6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
                  {/* Package label dot */}
                  <rect x="-47" y="-1" width="7" height="5" rx="1" fill="rgba(255,255,255,0.5)"/>

                  {/* ── RIGHT ARM (swinging) ── */}
                  <line x1="14" y1="-8" x2="30" y2="8" stroke="#fde68a" strokeWidth="8" strokeLinecap="round">
                    <animate attributeName="x2" values="30;22;30" dur="0.55s" repeatCount="indefinite"/>
                    <animate attributeName="y2" values="8;16;8" dur="0.55s" repeatCount="indefinite"/>
                  </line>

                  {/* ── HEAD ── */}
                  <circle cx="0" cy="-28" r="17" fill="#fde68a"/>
                  {/* Eyes */}
                  <circle cx="-6" cy="-30" r="3" fill="#78350f"/>
                  <circle cx="6" cy="-30" r="3" fill="#78350f"/>
                  {/* Eye shine */}
                  <circle cx="-5" cy="-31" r="1.2" fill="white"/>
                  <circle cx="7" cy="-31" r="1.2" fill="white"/>
                  {/* Smile */}
                  <path d="M -6,-22 Q 0,-17 6,-22" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round"/>

                  {/* ── HELMET ── */}
                  <path d="M -17,-36 Q -17,-52 0,-55 Q 17,-52 17,-36 Z" fill="#4f46e5" filter="url(#glow)"/>
                  {/* Helmet visor */}
                  <path d="M -14,-36 Q -14,-30 0,-30 Q 14,-30 14,-36" fill="rgba(99,102,241,0.4)" stroke="rgba(160,160,255,0.3)" strokeWidth="1"/>
                  {/* Helmet stripe */}
                  <rect x="-3" y="-54" width="6" height="18" rx="2" fill="rgba(255,255,255,0.25)"/>
                </g>

                {/* ════════════════ */}
                {/* FLOATING UI CARDS */}
                {/* ════════════════ */}

                {/* CARD 1: Live Tracking (top-left) */}
                <g opacity="0">
                  <animate attributeName="opacity" values="0;1" dur="0.7s" fill="freeze" begin="1.2s"/>
                  <rect x="28" y="28" width="270" height="115" rx="16" fill="rgba(0,0,0,0.5)" transform="translate(3,5)"/>
                  <rect x="28" y="28" width="270" height="115" rx="16" fill="rgba(10,10,25,0.95)" stroke="rgba(79,70,229,0.4)" strokeWidth="1.5"/>
                  {/* Live dot */}
                  <circle cx="52" cy="54" r="7" fill="#10b981" filter="url(#glow)">
                    <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
                  </circle>
                  <text x="68" y="59" fill="#10b981" fontSize="13" fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="0.05em">● LIVE TRACKING</text>
                  <text x="44" y="86" fill="white" fontSize="18" fontWeight="800" fontFamily="system-ui, sans-serif">Package in Transit</text>
                  <text x="44" y="108" fill="rgba(148,163,184,1)" fontSize="13" fontFamily="system-ui, sans-serif">ETA: 2h 15min  •  342 km away</text>
                  {/* Progress bar track */}
                  <rect x="44" y="126" width="238" height="7" rx="4" fill="rgba(255,255,255,0.08)"/>
                  <rect x="44" y="126" width="130" height="7" rx="4" fill="url(#hRouteGrad)" filter="url(#glow)">
                    <animate attributeName="width" values="0;130" dur="1.8s" fill="freeze" begin="1.5s"/>
                  </rect>
                </g>

                {/* CARD 2: Carrier Info (bottom-right) */}
                <g opacity="0">
                  <animate attributeName="opacity" values="0;1" dur="0.7s" fill="freeze" begin="1.8s"/>
                  <rect x="890" y="340" width="282" height="120" rx="16" fill="rgba(0,0,0,0.5)" transform="translate(3,5)"/>
                  <rect x="890" y="340" width="282" height="120" rx="16" fill="rgba(10,10,25,0.95)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"/>
                  {/* Avatar */}
                  <circle cx="922" cy="378" r="22" fill="rgba(79,70,229,0.25)" stroke="rgba(79,70,229,0.7)" strokeWidth="2"/>
                  <circle cx="922" cy="374" r="10" fill="#fde68a"/>
                  <path d="M906,390 Q922,385 938,390" fill="rgba(79,70,229,0.6)"/>
                  {/* Name & rating */}
                  <text x="952" y="368" fill="white" fontSize="16" fontWeight="800" fontFamily="system-ui, sans-serif">Rahul K.</text>
                  <text x="952" y="388" fill="rgba(148,163,184,1)" fontSize="13" fontFamily="system-ui, sans-serif">⭐ 4.9  •  312 trips</text>
                  <line x1="906" y1="400" x2="1158" y2="400" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                  <text x="906" y="422" fill="rgba(148,163,184,0.8)" fontSize="13" fontFamily="system-ui, sans-serif">Carrying your package now</text>
                  {/* Status badge */}
                  <rect x="1076" y="408" width="96" height="26" rx="8" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5"/>
                  <text x="1124" y="426" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif">IN TRANSIT</text>
                </g>

                {/* CARD 3: Escrow Price (bottom-center) */}
                <g opacity="0">
                  <animate attributeName="opacity" values="0;1" dur="0.7s" fill="freeze" begin="2.4s"/>
                  <rect x="450" y="448" width="300" height="90" rx="16" fill="rgba(0,0,0,0.5)" transform="translate(3,5)"/>
                  <rect x="450" y="448" width="300" height="90" rx="16" fill="rgba(10,10,25,0.95)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
                  <text x="474" y="476" fill="rgba(148,163,184,0.9)" fontSize="13" fontFamily="system-ui, sans-serif">Escrow Amount Secured</text>
                  <text x="474" y="514" fill="#f59e0b" fontSize="28" fontWeight="900" fontFamily="system-ui, sans-serif" filter="url(#glow)">₹ 420.00</text>
                  <text x="620" y="514" fill="rgba(148,163,184,0.5)" fontSize="12" fontFamily="system-ui, sans-serif">locked</text>
                  <rect x="676" y="493" width="58" height="28" rx="8" fill="rgba(79,70,229,0.2)" stroke="rgba(79,70,229,0.5)" strokeWidth="1.5"/>
                  <text x="705" y="512" textAnchor="middle" fill="#818cf8" fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif">PAID</text>
                </g>

                {/* Bottom fade overlay */}
                <rect width="1200" height="560" fill="url(#hBottomFade)" clipPath="url(#hClip)"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Quick Cards */}
      <section id="features" style={{ padding: 'var(--space-12) 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 className="section-title">Designed for modern transit</h2>
            <p className="subtitle" style={{ maxWidth: '580px', margin: '0 auto' }}>Two roles, one seamless marketplace. Choose how you want to participate.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', relative: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center' }}>
                <Send size={24} />
              </div>
              <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Send Parcels</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Need something delivered to another city? Find a carrier who is traveling there today. Match, book, pay securely, and monitor delivery status in real-time.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Up to 50% cheaper rates</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Same-day intercity shipping</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Secure escrow payments</li>
              </ul>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={24} />
              </div>
              <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Earn as Carrier</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Going on a road trip, commute, or train ride? Post your route, accept parcel delivery requests along your way, and offset your travel expenses effortlessly.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Turn empty trunk space into cash</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Choose your parcels and rates</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Flexible routes and schedules</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" style={{ padding: 'var(--space-12) 0', backgroundColor: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-color)' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 className="section-title">How Carrytrip works</h2>
            <p className="subtitle" style={{ maxWidth: '580px', margin: '0 auto' }}>Simple, transparent, and direct peer-to-peer coordination.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: 'var(--space-2)' }}>01</div>
              <h4 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Post / Search</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Carriers list routes they are taking. Senders search routes matching their package origin and destination.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--secondary)', marginBottom: 'var(--space-2)' }}>02</div>
              <h4 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Match & Lock</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Sender requests carrier. Carrier reviews parcel size/details and accepts. Payment is held in secure escrow.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: 'var(--space-2)' }}>03</div>
              <h4 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>OTP Handshake</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Parcels are locked with dynamic OTPs. Verification is required at pickup and doorstep drop-off.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--success)', marginBottom: 'var(--space-2)' }}>04</div>
              <h4 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Released Funds</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Upon delivery validation, the system releases escrow payments directly to the carrier's balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" style={{ padding: 'var(--space-12) 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="app-container">
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-10)', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%)', border: '1px solid var(--border-hover)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <Shield size={32} style={{ color: 'var(--primary)' }} />
              <h2 className="section-title" style={{ margin: 0 }}>Built with security at the core</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>
              Safety is our highest priority. Carrytrip incorporates double-handshake OTP authentication, full tracking during transits, and sandbox payment integrations (Stripe/Razorpay escrow models) to ensure items are safe and carriers are paid reliably.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              <div>
                <h5 style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Secure Escrow</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Money stays safe until delivery verification.</p>
              </div>
              <div>
                <h5 style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Dual-OTP handshake</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>OTP validation at both pickup and doorstep drop-off.</p>
              </div>
              <div>
                <h5 style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Live Location Updates</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Track coordinates in real-time on our interactive map.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: 'var(--space-8) 0', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>© {new Date().getFullYear()} Carrytrip. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-muted)' }}>Terms</a>
            <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-muted)' }}>Privacy</a>
            <a href="#help" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-muted)' }}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
