'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, User, Check, Loader2, Trash2 } from 'lucide-react';
import { addSubscriber, getServices, getArtists, type ServiceItem, type Artist } from './lib/dataStore';
// Every photo below was individually verified (real Pexels photo page checked,
// not just guessed IDs) and is nail/manicure themed.
const IMAGES = {
  // Vibrant Backgrounds
  bgHero: 'https://images.pexels.com/photos/5870539/pexels-photo-5870539.jpeg?auto=compress&cs=tinysrgb&w=1920',
  bgStudio: 'https://images.pexels.com/photos/7755296/pexels-photo-7755296.jpeg?auto=compress&cs=tinysrgb&w=1920',
  bgServices: 'https://images.pexels.com/photos/13068361/pexels-photo-13068361.jpeg?auto=compress&cs=tinysrgb&w=1920',
  bgArtists: 'https://images.pexels.com/photos/34121866/pexels-photo-34121866.jpeg?auto=compress&cs=tinysrgb&w=1920',
  bgCommunity: 'https://images.pexels.com/photos/3997377/pexels-photo-3997377.jpeg?auto=compress&cs=tinysrgb&w=1920',
  bgContact: 'https://images.pexels.com/photos/939835/pexels-photo-939835.jpeg?auto=compress&cs=tinysrgb&w=1920',

  // Content & Card Images
  card1: 'https://images.pexels.com/photos/939835/pexels-photo-939835.jpeg?auto=compress&cs=tinysrgb&w=800',
  card2: 'https://images.pexels.com/photos/3997377/pexels-photo-3997377.jpeg?auto=compress&cs=tinysrgb&w=800',
  card3: 'https://images.pexels.com/photos/5870539/pexels-photo-5870539.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Community Grid Images
  gal1: 'https://images.pexels.com/photos/34121866/pexels-photo-34121866.jpeg?auto=compress&cs=tinysrgb&w=500',
  gal2: 'https://images.pexels.com/photos/8809259/pexels-photo-8809259.jpeg?auto=compress&cs=tinysrgb&w=500',
  gal3: 'https://images.pexels.com/photos/8809259/pexels-photo-8809259.jpeg?auto=compress&cs=tinysrgb&w=500',
  gal4: 'https://images.pexels.com/photos/13068361/pexels-photo-13068361.jpeg?auto=compress&cs=tinysrgb&w=500',
};

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#studio', label: 'The Studio' },
  { href: '#services', label: 'Services' },
  { href: '#artists', label: 'Artists' },
  { href: '#community', label: 'Community' },
  { href: '#contact', label: 'Contact' },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
}

export default function AuraHome() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [showTeam, setShowTeam] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [email, setEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  // Load from mockStore safely
  useEffect(() => {
    try {
      setServices(getServices());
      setArtists(getArtists());
    } catch (error) {
      console.error("Mock store error:", error);
    }
  }, []);

  function addToCart(service: ServiceItem) {
    setCart((prev) => (prev.some((i) => i.id === service.id) ? prev : [...prev, { id: service.id, name: service.name, price: service.price }]));
    setCartOpen(true);
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNewsletterState('error');
      return;
    }
    setNewsletterState('loading');
    setTimeout(() => {
      const { added } = addSubscriber(trimmed, 'Newsletter');
      setNewsletterState(added ? 'success' : 'duplicate');
      setEmail('');
      setTimeout(() => setNewsletterState('idle'), 3000);
    }, 600);
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price, 0);

  return (
    <main className="h-screen w-full overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth bg-zinc-900 text-white font-sans selection:bg-fuchsia-500">

      {/* --- Top Navigation --- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-xl border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="#home" className="font-serif italic text-2xl text-white drop-shadow-md md:hidden">Aura</Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-widest uppercase drop-shadow-md">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-white/90 hover:text-fuchsia-300 hover:scale-110 transition-all duration-300">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4 md:space-x-6">
            <Link href="#contact" className="hidden sm:inline-block bg-white/20 backdrop-blur-md border border-white/40 text-white px-8 py-3 text-xs font-black tracking-widest uppercase hover:bg-white hover:text-black hover:scale-105 transition-all duration-500 rounded-full shadow-lg">
              Reserve
            </Link>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => { setProfileOpen(!profileOpen); setCartOpen(false); setAccountMessage(''); }} className="w-9 h-9 rounded-full bg-fuchsia-500 text-white flex items-center justify-center text-xs font-black hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(217,70,239,0.5)] border border-white/20">
                <User size={16} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-2 z-50">
                  <button
                    onClick={() => setAccountMessage('Sign-in isn\u2019t set up yet \u2014 coming soon.')}
                    className="w-full text-left px-4 py-3 text-xs font-bold tracking-wide text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAccountMessage('Account creation isn\u2019t set up yet \u2014 coming soon.')}
                    className="w-full text-left px-4 py-3 text-xs font-bold tracking-wide text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    Create Account
                  </button>
                  {accountMessage && (
                    <p className="px-4 py-2 text-[11px] text-fuchsia-300 leading-snug">{accountMessage}</p>
                  )}
                  <Link href="/admin" className="block px-4 py-3 text-xs font-bold tracking-wide text-fuchsia-300 hover:bg-white/20 rounded-xl transition-colors">Admin Portal ↗</Link>
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="relative">
              <button onClick={() => { setCartOpen(!cartOpen); setProfileOpen(false); }} className="relative group p-2">
                <ShoppingBag size={22} className="text-white drop-shadow-lg group-hover:-translate-y-1 transition-transform" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-fuchsia-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white/20 shadow-lg">
                    {cart.length}
                  </span>
                )}
              </button>
              {cartOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-5 z-50">
                  <h4 className="text-xs font-black tracking-widest uppercase text-white/70 mb-4 border-b border-white/20 pb-3">Your Selection</h4>
                  {cart.length === 0 ? (
                    <p className="text-xs text-white/80 py-4 text-center">No treatments selected yet.</p>
                  ) : (
                    <>
                      <ul className="space-y-3 mb-4">
                        {cart.map((item) => (
                          <li key={item.id} className="flex items-center justify-between text-sm bg-black/40 rounded-xl px-4 py-3 border border-white/10">
                            <span className="text-white font-medium">{item.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-fuchsia-300 font-bold">${item.price}</span>
                              <button onClick={() => removeFromCart(item.id)} className="text-white/50 hover:text-rose-400 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between text-sm font-bold text-white mb-4 border-t border-white/20 pt-4">
                        <span>Estimated Total</span>
                        <span className="text-fuchsia-300">${cartTotal}</span>
                      </div>
                      <Link href="#contact" onClick={() => setCartOpen(false)} className="block text-center bg-white text-black py-4 text-xs font-black tracking-widest uppercase hover:bg-fuchsia-500 hover:text-white transition-all duration-300 rounded-full shadow-lg">
                        Reserve Now
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden text-white drop-shadow-md">
              {mobileNavOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileNavOpen && (
          <nav className="md:hidden bg-black/60 backdrop-blur-2xl border-t border-white/20 px-6 py-6 flex flex-col space-y-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileNavOpen(false)} className="text-base font-bold tracking-widest uppercase text-white hover:text-fuchsia-400 transition-colors drop-shadow-md">
                {link.label}
              </Link>
            ))}
            <Link href="#contact" onClick={() => setMobileNavOpen(false)} className="bg-white text-black text-center px-8 py-4 text-sm font-black tracking-widest uppercase rounded-full mt-4">
              Reserve
            </Link>
          </nav>
        )}
      </header>

      {/* --- 1. Hero Section --- */}
      <section id="home" className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden">
        <img src={IMAGES.bgHero} alt="Vibrant Aura Studio" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/40 via-purple-900/20 to-black/50"></div>
        <div className="text-center relative z-10 hover:scale-105 transition-transform duration-1000 ease-out p-6">
          <h1 className="font-serif italic text-7xl md:text-9xl font-normal leading-none tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <span className="block text-5xl md:text-6xl font-light not-italic mb-4 text-fuchsia-300 drop-shadow-lg">/</span>
            Aura<br />Nail<br />Studio
          </h1>
        </div>
      </section>

      {/* --- 2. Welcome / Studio Section --- */}
      <section id="studio" className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden pt-20">
        <img src={IMAGES.bgStudio} alt="Studio Colors" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/35"></div>
        
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6 relative z-10">
          <div className="relative h-[60vh] overflow-hidden rounded-3xl shadow-2xl border border-white/30 group hidden md:block">
            <img src={IMAGES.card1} alt="Inside Aura" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/80 via-transparent to-transparent"></div>
            <div className="relative h-full flex items-end p-8">
              <div>
                <span className="font-serif italic text-4xl text-white block mb-2 drop-shadow-lg">Aura Sanctuary</span>
                <p className="text-xs uppercase tracking-widest text-white/90 drop-shadow-md">Elegance in Every Detail</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-10 md:p-14 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <span className="text-xs uppercase tracking-widest text-fuchsia-300 font-black mb-4 block drop-shadow-md">Step Into</span>
            <h2 className="font-serif italic text-5xl md:text-6xl mb-6 text-white drop-shadow-lg">Your Colors</h2>
            <p className="text-sm md:text-base text-white/90 leading-relaxed mb-6 font-medium drop-shadow-sm">
              Experience nail care elevated to an art form. At Aura Nail Studio, your hands are a vibrant extension of your personal style. We blend highly pigmented, non-toxic products with avant-garde design techniques.
            </p>
            <p className="text-sm md:text-base text-white/90 leading-relaxed font-medium drop-shadow-sm">
              Our curated space is designed to be your creative sanctuary. From bright neon polish to intricate custom artistry, we ensure every detail pops perfectly.
            </p>
          </div>
        </div>
      </section>

      {/* --- 3. Services Section --- */}
      <section id="services" className="h-screen w-full snap-start relative flex flex-col justify-center overflow-hidden pt-20">
        <img src={IMAGES.bgServices} alt="Services Menu" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-cyan-950/40"></div>
        
        <div className="max-w-7xl w-full mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <h2 className="font-serif italic text-5xl md:text-6xl text-white drop-shadow-xl">Our Menu</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, i) => {
              const img = i === 0 ? IMAGES.card1 : i === 1 ? IMAGES.card2 : IMAGES.card3;
              return (
                <div key={service.id} className="bg-white/10 backdrop-blur-2xl group overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/30 rounded-3xl flex flex-col h-[40vh] md:h-[50vh]">
                  <div className="p-6 relative z-10 bg-black/40 border-b border-white/20 shrink-0">
                    <span className="font-serif text-2xl italic block mb-1 text-fuchsia-300">{service.code} /</span>
                    <h3 className="font-serif italic text-3xl text-white group-hover:text-fuchsia-200 transition-colors">{service.name}</h3>
                    <p className="text-xs text-white/80 mt-2 font-medium line-clamp-2">{service.description}</p>
                  </div>
                  <div className="relative flex-1 w-full">
                    <img src={img} alt={service.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                    <div className="relative h-full flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-white text-3xl font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">${service.price}</span>
                      <button onClick={() => addToCart(service)} className="bg-white/90 text-black text-[11px] font-black tracking-widest uppercase px-6 py-3 rounded-full hover:bg-fuchsia-500 hover:text-white hover:scale-105 transition-all duration-300 shadow-xl">
                        Select Treatment
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- 4. Artists Section --- */}
      <section id="artists" className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden">
        <img src={IMAGES.bgArtists} alt="Artists" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative max-w-4xl mx-auto bg-white/10 backdrop-blur-2xl p-10 md:p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/30 rounded-3xl z-10 mx-6 transition-all duration-700">
          <span className="text-sm uppercase tracking-widest text-fuchsia-300 font-black mb-4 block drop-shadow-md">The Masters</span>
          <h2 className="font-serif italic text-5xl md:text-6xl mb-6 text-white drop-shadow-lg">Our Artists</h2>

          {!showTeam ? (
            <>
              <p className="text-sm md:text-base text-white/90 leading-relaxed mb-10 font-medium drop-shadow-sm">
                Our team of senior nail technicians and resident artists bring decades of combined experience from the fashion and editorial worlds directly to your fingertips.
              </p>
              <button
                onClick={() => setShowTeam(true)}
                className="inline-block bg-white text-black px-10 py-4 text-xs font-black tracking-widest uppercase hover:bg-fuchsia-500 hover:text-white hover:scale-105 transition-all duration-300 rounded-full shadow-2xl border border-white/50"
              >
                Meet The Team
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 text-left">
                {artists.map((artist) => (
                  <div key={artist.id} className="bg-black/40 border border-white/20 rounded-2xl p-5">
                    <div className="w-11 h-11 rounded-full bg-fuchsia-600 text-white flex items-center justify-center font-bold mb-4">
                      {artist.name[0]}
                    </div>
                    <h3 className="font-serif italic text-xl text-white mb-1">{artist.name}</h3>
                    <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-wide mb-3">{artist.role}</p>
                    <p className="text-xs text-white/80 leading-relaxed mb-3">{artist.bio}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {artist.specialties.map((sp) => (
                        <span key={sp} className="text-[10px] bg-white/10 text-white/80 px-2 py-1 rounded-sm">{sp}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowTeam(false)}
                className="inline-block bg-white/10 text-white px-8 py-3 text-xs font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 rounded-full border border-white/40"
              >
                Back
              </button>
            </>
          )}
        </div>
      </section>

      {/* --- 5. Community Gallery Section --- */}
      <section id="community" className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden pt-20">
        <img src={IMAGES.bgCommunity} alt="Community" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-violet-900/40"></div>
        
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-6 items-center relative z-10">
          <div className="group cursor-default p-10 md:p-16 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <span className="text-xs uppercase tracking-widest text-fuchsia-300 font-black block mb-4 drop-shadow-md">Our Community</span>
            <h2 className="font-serif italic text-6xl md:text-8xl text-white group-hover:scale-105 origin-left transition-transform duration-1000 ease-out drop-shadow-xl">
              @AURA<br />STUDIO
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { img: IMAGES.gal1, label: '#AuraNails' },
              { img: IMAGES.gal2, label: 'Studio Life' },
              { img: IMAGES.gal3, label: 'Gel Art' },
              { img: IMAGES.gal4, label: 'Editorial' },
            ].map((tile) => (
              <div key={tile.label} className="relative h-[20vh] md:h-[30vh] overflow-hidden group rounded-3xl border border-white/40 shadow-xl">
                <img src={tile.img} alt={tile.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                <div className="relative h-full flex items-center justify-center">
                  <span className="text-white font-serif italic text-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm">
                    {tile.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. Footer / Contact Section --- */}
      <section id="contact" className="h-screen w-full snap-start relative flex flex-col justify-center overflow-hidden pt-20">
        <img src={IMAGES.bgContact} alt="Contact" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/45"></div>

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 px-6 p-10 md:p-12 bg-white/10 border border-white/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative z-10">
          <div className="group">
            <h4 className="font-bold tracking-widest uppercase mb-4 text-fuchsia-300 drop-shadow-md">Location</h4>
            <p className="leading-relaxed text-white/90 font-medium">
              1420 Downtown Ave<br />Suite 200<br />Seattle, WA 98101
            </p>
          </div>

          <div className="group">
            <h4 className="font-bold tracking-widest uppercase mb-4 text-cyan-300 drop-shadow-md">Reach Us</h4>
            <p className="leading-relaxed text-white/90 font-medium">
              Ph: (206) 555-0198<br />Email: hello@auranails.com
            </p>
          </div>

          <div className="group">
            <h4 className="font-bold tracking-widest uppercase mb-4 text-amber-300 drop-shadow-md">Studio Hours</h4>
            <p className="leading-relaxed text-white/90 font-medium">
              Tue–Fri: 10:00am–7:00pm<br />Sat: 9:00am–6:00pm<br />Sun–Mon: Closed
            </p>
          </div>

          <div className="group">
            <h4 className="font-bold tracking-widest uppercase mb-4 text-white drop-shadow-md">Join the List</h4>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-4" noValidate>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={newsletterState === 'loading'}
                className="w-full bg-black/40 border border-white/30 px-5 py-4 text-white text-sm focus:outline-none focus:border-fuchsia-400 rounded-xl disabled:opacity-60 placeholder-white/50"
              />
              <button
                type="submit"
                disabled={newsletterState === 'loading'}
                className="bg-white text-black py-4 px-8 text-xs font-black tracking-widest uppercase hover:bg-fuchsia-500 hover:text-white transition-all duration-300 w-full rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
              >
                {newsletterState === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Signing Up...</>
                ) : newsletterState === 'success' ? (
                  <><Check size={16} /> Subscribed!</>
                ) : (
                  'Sign Up'
                )}
              </button>
              {newsletterState === 'error' && <p className="text-[11px] font-bold text-rose-400 drop-shadow-md">Enter a valid email address.</p>}
              {newsletterState === 'duplicate' && <p className="text-[11px] font-bold text-amber-400 drop-shadow-md">You're already on the list.</p>}
            </form>
          </div>
        </div>

        <div className="max-w-7xl w-full mx-auto mt-10 px-6 text-xs font-medium text-white/70 flex flex-col md:flex-row gap-4 justify-between items-center relative z-10">
          <span>© {new Date().getFullYear()} Aura Nail Studio. All rights reserved.</span>
          <Link href="/admin" className="hover:text-fuchsia-300 font-bold tracking-widest uppercase transition-colors bg-black/40 px-6 py-3 rounded-full border border-white/20 backdrop-blur-md shadow-lg">
            Admin Portal ↗
          </Link>
        </div>
      </section>
    </main>
  );
}