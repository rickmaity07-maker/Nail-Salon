'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, User, Check, Loader2, Trash2 } from 'lucide-react';
import { addSubscriber, getServices, type ServiceItem } from './lib/mockStore';

// Curated background photography per section. Swap any of these for the
// client's real photography later — just replace the URL string.
// Local files under /public/images — see README-CHANGES.md for the download list.
// Swap any of these for the client's real photography later; nothing else needs to change.
const IMAGES = {
  hero: '/images/hero.jpg',
  studio: '/images/studio.jpg',
  services: '/images/services.jpg',
  card1: '/images/card1.jpg',
  card2: '/images/card2.jpg',
  card3: '/images/card3.jpg',
  artists: '/images/artists.jpg',
  community: '/images/community.jpg',
  gal1: '/images/gal1.jpg',
  gal2: '/images/gal2.jpg',
  gal3: '/images/gal3.jpg',
  gal4: '/images/gal4.jpg',
};

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#studio', label: 'The Studio' },
  { href: '#services', label: 'Services' },
  { href: '#artists', label: 'Artists' },
  { href: '#community', label: 'Community' },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
}

export default function AuraHome() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [email, setEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  useEffect(() => {
    setServices(getServices());
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
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!validEmail) {
      setNewsletterState('error');
      return;
    }
    setNewsletterState('loading');
    // Simulated network delay so the state change feels real; the write
    // itself is local (see lib/mockStore.ts).
    setTimeout(() => {
      const { added } = addSubscriber(trimmed, 'Newsletter');
      setNewsletterState(added ? 'success' : 'duplicate');
      setEmail('');
      setTimeout(() => setNewsletterState('idle'), 3000);
    }, 600);
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price, 0);

  return (
    <main className="h-screen w-full overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth bg-black text-white font-sans selection:bg-fuchsia-500">

      {/* --- Top Navigation --- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="#home" className="font-serif italic text-xl text-white md:hidden">Aura</Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-[0.2em] uppercase">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-zinc-300 hover:text-white hover:scale-110 transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4 md:space-x-6">
            <Link
              href="#contact"
              className="hidden sm:inline-block bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-3 text-xs font-black tracking-[0.2em] uppercase hover:bg-white hover:text-black hover:scale-105 transition-all duration-500 rounded-sm"
            >
              Reserve
            </Link>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen((v) => !v); setCartOpen(false); }}
                aria-label="Account menu"
                className="w-8 h-8 rounded-full bg-fuchsia-600 text-white flex items-center justify-center text-[11px] font-black hover:scale-125 transition-all duration-500 shadow-lg"
              >
                <User size={14} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-2 z-50">
                  <button className="w-full text-left px-4 py-3 text-xs font-bold tracking-wide text-zinc-200 hover:bg-white/10 rounded-md transition-colors">
                    Sign In
                  </button>
                  <button className="w-full text-left px-4 py-3 text-xs font-bold tracking-wide text-zinc-200 hover:bg-white/10 rounded-md transition-colors">
                    Create Account
                  </button>
                  <Link href="/admin" className="block px-4 py-3 text-xs font-bold tracking-wide text-fuchsia-400 hover:bg-white/10 rounded-md transition-colors">
                    Admin Portal ↗
                  </Link>
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="relative">
              <button
                onClick={() => { setCartOpen((v) => !v); setProfileOpen(false); }}
                aria-label="View selected treatments"
                className="relative group"
              >
                <ShoppingBag size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-fuchsia-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
              {cartOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-4 z-50">
                  <h4 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-400 mb-3">Selected Treatments</h4>
                  {cart.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-4 text-center">No treatments selected yet. Pick one from the menu below.</p>
                  ) : (
                    <>
                      <ul className="space-y-2 mb-4">
                        {cart.map((item) => (
                          <li key={item.id} className="flex items-center justify-between text-xs bg-white/5 rounded-md px-3 py-2">
                            <span className="text-zinc-200 font-medium">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-zinc-400">${item.price}</span>
                              <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} className="text-zinc-500 hover:text-fuchsia-400 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between text-xs font-bold text-white mb-3 border-t border-white/10 pt-3">
                        <span>Estimated Total</span>
                        <span>${cartTotal}</span>
                      </div>
                      <Link
                        href="#contact"
                        onClick={() => setCartOpen(false)}
                        className="block text-center bg-white text-black py-3 text-[11px] font-black tracking-[0.2em] uppercase hover:bg-fuchsia-500 hover:text-white transition-all duration-300 rounded-sm"
                      >
                        Reserve Now
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="md:hidden text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav panel */}
        {mobileNavOpen && (
          <nav className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 flex flex-col space-y-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-200 hover:text-fuchsia-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#contact"
              onClick={() => setMobileNavOpen(false)}
              className="bg-white text-black text-center px-8 py-3 text-xs font-black tracking-[0.2em] uppercase rounded-sm"
            >
              Reserve
            </Link>
          </nav>
        )}
      </header>

      {/* --- 1. Hero Section --- */}
      <section id="home" className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-20">
          <img src={IMAGES.hero} alt="Aura Nail Studio interior" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-950/95 via-fuchsia-900/80 to-black/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15)_0,transparent_100%)]"></div>
        <div className="text-center relative z-10 hover:scale-110 transition-transform duration-[2000ms] ease-out">
          <h1 className="font-serif italic text-7xl md:text-9xl font-normal leading-none tracking-tighter text-white drop-shadow-[0_0_50px_rgba(217,70,239,0.4)]">
            <span className="block text-5xl md:text-6xl font-light not-italic mb-4 text-fuchsia-400">/</span>
            Aura<br />
            Nail<br />
            Studio
          </h1>
        </div>
      </section>

      {/* --- 2. Welcome / Studio Section --- */}
      <section id="studio" className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 -z-20">
          <img src={IMAGES.studio} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-black/95 via-zinc-900/85 to-cyan-950/85"></div>
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6 relative z-10">
          <div className="relative h-[60vh] overflow-hidden rounded-xl shadow-2xl border border-white/20 group">
            <img src={IMAGES.studio} alt="Inside Aura Nail Studio" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
            <div className="relative h-full flex items-end p-8">
              <div>
                <span className="font-serif italic text-4xl text-white block mb-2">Aura Sanctuary</span>
                <p className="text-xs uppercase tracking-widest text-white/70">Elegance in Every Detail</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-12 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-black mb-4 block">Step Into</span>
            <h2 className="font-serif italic text-5xl md:text-6xl mb-6 text-white">Your Colors</h2>
            <p className="text-sm text-zinc-300 leading-loose mb-4 font-light">
              Experience nail care elevated to an art form. At Aura Nail Studio, your hands are a vibrant extension of your personal style. We blend highly pigmented, non-toxic products with avant-garde design techniques.
            </p>
            <p className="text-sm text-zinc-300 leading-loose font-light">
              Our curated space is designed to be your creative sanctuary. From bright neon polish to intricate custom artistry, we ensure every detail pops perfectly.
            </p>
          </div>
        </div>
      </section>

      {/* --- 3. Services Section --- */}
      <section id="services" className="h-screen w-full snap-start relative flex flex-col justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 -z-20">
          <img src={IMAGES.services} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-zinc-950/95 via-purple-950/85 to-black/95"></div>
        <div className="max-w-7xl w-full mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif italic text-6xl text-white">Our Menu</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.map((service, i) => {
              const accentText = service.accent === 'cyan' ? 'text-cyan-400' : service.accent === 'amber' ? 'text-amber-400' : 'text-fuchsia-400';
              const accentGroupText = service.accent === 'cyan' ? 'group-hover:text-cyan-300' : service.accent === 'amber' ? 'group-hover:text-amber-300' : 'group-hover:text-fuchsia-300';
              const img = i === 0 ? IMAGES.card1 : i === 1 ? IMAGES.card2 : IMAGES.card3;
              return (
                <div
                  key={service.id}
                  className="bg-white/5 backdrop-blur-xl group overflow-hidden shadow-2xl hover:-translate-y-4 transition-all duration-700 border border-white/20 rounded-xl flex flex-col h-[48vh]"
                >
                  <div className="p-6 relative z-10 bg-black/50 border-b border-white/10 shrink-0">
                    <span className={`font-serif text-2xl italic block mb-1 ${accentText}`}>{service.code} /</span>
                    <h3 className={`font-serif italic text-3xl text-white transition-colors ${accentGroupText}`}>{service.name}</h3>
                    <p className="text-xs text-zinc-400 mt-2 font-light leading-relaxed line-clamp-2">{service.description}</p>
                  </div>
                  <div className="relative flex-1 w-full">
                    <img src={img} alt={service.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]" />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500"></div>
                    <div className="relative h-full flex flex-col items-center justify-center gap-4 p-4">
                      <span className="text-white text-2xl font-light">${service.price}</span>
                      <button
                        onClick={() => addToCart(service)}
                        className="bg-white/90 text-black text-[11px] font-black tracking-[0.15em] uppercase px-6 py-3 rounded-sm hover:bg-white hover:scale-105 transition-all duration-300"
                      >
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
        <div className="absolute inset-0 -z-20">
          <img src={IMAGES.artists} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-900/95 via-stone-900/85 to-black/95"></div>
        <div className="relative max-w-3xl mx-auto bg-black/70 backdrop-blur-2xl p-16 md:p-24 text-center shadow-2xl hover:-translate-y-4 transition-all duration-1000 border border-white/20 rounded-2xl z-10">
          <span className="text-sm uppercase tracking-[0.4em] text-fuchsia-400 font-black mb-4 block">The Masters</span>
          <h2 className="font-serif italic text-5xl md:text-6xl mb-8 text-white">Our Artists</h2>
          <p className="text-base text-zinc-300 leading-loose mb-10 font-light">
            Our team of senior nail technicians and resident artists bring decades of combined experience from the fashion and editorial worlds directly to your fingertips.
          </p>
          <Link href="#contact" className="inline-block bg-white text-black px-12 py-4 text-xs font-black tracking-[0.2em] uppercase hover:bg-fuchsia-500 hover:text-white hover:scale-110 transition-all duration-500 rounded-sm">
            Meet The Team
          </Link>
        </div>
      </section>

      {/* --- 5. Community Gallery Section --- */}
      <section id="community" className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 -z-20">
          <img src={IMAGES.community} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-black/95 via-zinc-900/85 to-violet-950/85"></div>
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6 items-center relative z-10">
          <div className="group cursor-default p-12 bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-black block mb-4">
              Our Community
            </span>
            <h2 className="font-serif italic text-6xl md:text-8xl text-white">
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
              <div key={tile.label} className="relative h-[30vh] overflow-hidden group rounded-xl border border-white/20">
                <img src={tile.img} alt={tile.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                <div className="relative h-full flex items-center justify-center">
                  <span className="text-white font-serif italic text-xl drop-shadow-lg">{tile.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. Footer / Contact Section --- */}
      <section id="contact" className="h-screen w-full snap-start relative flex flex-col justify-center overflow-hidden pt-20 bg-black">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-6 p-12 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md relative z-10">
          <div className="group">
            <h4 className="font-bold tracking-[0.2em] uppercase mb-6 text-fuchsia-400">Location</h4>
            <p className="leading-relaxed text-zinc-300">
              1420 Downtown Ave<br />Suite 200<br />Seattle, WA 98101
            </p>
          </div>

          <div className="group">
            <h4 className="font-bold tracking-[0.2em] uppercase mb-6 text-cyan-400">Reach Us</h4>
            <p className="leading-relaxed text-zinc-300">
              Ph: (206) 555-0198<br />Email: hello@auranails.com
            </p>
          </div>

          <div className="group">
            <h4 className="font-bold tracking-[0.2em] uppercase mb-6 text-amber-400">Studio Hours</h4>
            <p className="leading-relaxed text-zinc-300">
              Tue–Fri: 10:00am–7:00pm<br />Sat: 9:00am–6:00pm<br />Sun–Mon: Closed
            </p>
          </div>

          <div className="group">
            <h4 className="font-bold tracking-[0.2em] uppercase mb-6 text-white">Join the List</h4>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-3" noValidate>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={newsletterState === 'loading'}
                className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white text-xs focus:outline-none focus:border-fuchsia-500 rounded-sm disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={newsletterState === 'loading'}
                className="bg-white text-black py-3 px-8 text-[11px] font-black tracking-[0.2em] uppercase hover:bg-fuchsia-500 hover:text-white transition-all duration-300 w-full rounded-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {newsletterState === 'loading' ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Signing Up...
                  </>
                ) : newsletterState === 'success' ? (
                  <>
                    <Check size={13} /> Subscribed!
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
              {newsletterState === 'error' && (
                <p className="text-[11px] text-rose-400">Enter a valid email address.</p>
              )}
              {newsletterState === 'duplicate' && (
                <p className="text-[11px] text-amber-400">You&apos;re already on the list.</p>
              )}
            </form>
          </div>
        </div>

        <div className="max-w-7xl w-full mx-auto mt-12 px-6 text-[11px] text-zinc-500 flex justify-between items-center relative z-10">
          <span>© {new Date().getFullYear()} Aura Nail Studio. All rights reserved.</span>
          <Link href="/admin" className="hover:text-white font-bold tracking-widest uppercase transition-colors bg-white/10 px-4 py-2 rounded-sm border border-white/20 backdrop-blur-sm">Admin Portal ↗</Link>
        </div>
      </section>
    </main>
  );
}