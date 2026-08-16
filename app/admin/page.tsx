'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Users, Sparkles, Mail, TrendingUp, Clock, Lock, Unlock,
  Plus, X, Trash2, Pencil, Check,
} from 'lucide-react';
import {
  getBookings, upsertBooking, removeBooking,
  getServices, upsertService, removeService,
  getArtists, upsertArtist, removeArtist,
  getSubscribers, addSubscriber, removeSubscriber,
  type Booking, type BookingStatus, type ServiceItem, type Artist, type Subscriber, type AccentColor,
} from '../lib/mockStore';

type Tab = 'dashboard' | 'schedule' | 'services' | 'artists' | 'mailing';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={18} /> },
  { id: 'schedule', label: 'Schedule', icon: <Calendar size={18} /> },
  { id: 'services', label: 'Menu Items', icon: <Sparkles size={18} /> },
  { id: 'artists', label: 'Artists', icon: <Users size={18} /> },
  { id: 'mailing', label: 'Mailing List', icon: <Mail size={18} /> },
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  Confirmed: 'bg-emerald-900 text-emerald-300 group-hover:bg-emerald-800',
  'In Progress': 'bg-cyan-900 text-cyan-300 group-hover:bg-cyan-800',
  Pending: 'bg-amber-900 text-amber-300 group-hover:bg-amber-800',
  Cancelled: 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700',
};

export default function AdminDashboard() {
  const [isLocked, setIsLocked] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  const [bookingModal, setBookingModal] = useState<{ open: boolean; editing: Booking | null }>({ open: false, editing: null });
  const [serviceModal, setServiceModal] = useState<{ open: boolean; editing: ServiceItem | null }>({ open: false, editing: null });
  const [artistModal, setArtistModal] = useState<{ open: boolean; editing: Artist | null }>({ open: false, editing: null });
  const [subscriberModal, setSubscriberModal] = useState(false);

  const refresh = () => {
    setBookings(getBookings());
    setServices(getServices());
    setArtists(getArtists());
    setSubscribers(getSubscribers());
  };

  useEffect(() => {
    if (!isLocked) refresh();
  }, [isLocked]);

  const serviceMap = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const bookingsToday = bookings.filter((b) => b.date === today);
    const pending = bookings.filter((b) => b.status === 'Pending').length;
    const revenue = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + (serviceMap.get(b.serviceId)?.price ?? 0), 0);
    return {
      totalBookingsToday: bookingsToday.length,
      pendingConfirmations: pending,
      activeSubscribers: subscribers.length,
      monthlyRevenue: `$${revenue.toLocaleString()}.00`,
    };
  }, [bookings, subscribers, serviceMap, today]);

  const handleUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => setIsLocked(false), 1200);
  };

  // ---------- LOCKED SCREEN ----------
  if (isLocked) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <img src="/images/admin-lock.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 -z-20" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl -z-10"></div>
        <div className="relative z-10 flex flex-col items-center bg-white/10 p-16 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-2xl">
          <div className="w-24 h-24 bg-black border border-white/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(217,70,239,0.5)] transition-all duration-1000">
            {isUnlocking ? (
              <Unlock size={32} className="text-fuchsia-400 animate-bounce" />
            ) : (
              <Lock size={32} className="text-white" />
            )}
          </div>
          <h1 className="font-serif italic text-4xl text-white mb-2 drop-shadow-lg">Aura Studio</h1>
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-300 mb-10">Secure Admin Portal</p>

          <button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="bg-white text-black px-10 py-4 text-xs font-black tracking-[0.2em] uppercase hover:bg-fuchsia-500 hover:text-white hover:scale-110 hover:shadow-[0_0_30px_rgba(217,70,239,0.8)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed w-full rounded-sm"
          >
            {isUnlocking ? 'Authenticating...' : 'Unlock Portal'}
          </button>

          <Link href="/" className="mt-8 text-[10px] text-zinc-400 uppercase tracking-widest hover:text-white transition-colors">← Back to Site</Link>
        </div>
      </div>
    );
  }

  // ---------- UNLOCKED DASHBOARD ----------
  return (
    <div className="h-screen w-full bg-zinc-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-black text-white p-8 flex flex-col justify-between shadow-2xl z-20 border-r border-white/10 shrink-0">
        <div>
          <div className="mb-12">
            <span className="text-[10px] font-black tracking-[0.3em] text-fuchsia-500 uppercase">Management</span>
            <h2 className="font-serif italic text-3xl font-bold text-white mt-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Aura Studio</h2>
          </div>
          <nav className="space-y-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-md text-xs font-bold tracking-widest transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-fuchsia-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.4)] scale-105'
                    : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.icon} <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-8 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            Active: <strong className="text-white font-medium">mgmt@aura.com</strong>
          </div>
          <button onClick={() => setIsLocked(true)} className="text-zinc-500 hover:text-fuchsia-400 transition-colors bg-white/5 p-2 rounded-md" title="Lock Dashboard">
            <Lock size={14} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto bg-zinc-950 relative">
        <div className="absolute top-0 right-0 w-125 h-125fuchsia-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            bookings={bookings}
            serviceMap={serviceMap}
            onNewAppointment={() => setBookingModal({ open: true, editing: null })}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            bookings={bookings}
            serviceMap={serviceMap}
            onAdd={() => setBookingModal({ open: true, editing: null })}
            onEdit={(b) => setBookingModal({ open: true, editing: b })}
            onDelete={(id) => { removeBooking(id); refresh(); }}
            onStatusChange={(b, status) => { upsertBooking({ ...b, status }); refresh(); }}
          />
        )}

        {activeTab === 'services' && (
          <ServicesView
            services={services}
            onAdd={() => setServiceModal({ open: true, editing: null })}
            onEdit={(s) => setServiceModal({ open: true, editing: s })}
            onDelete={(id) => { removeService(id); refresh(); }}
          />
        )}

        {activeTab === 'artists' && (
          <ArtistsView
            artists={artists}
            onAdd={() => setArtistModal({ open: true, editing: null })}
            onEdit={(a) => setArtistModal({ open: true, editing: a })}
            onDelete={(id) => { removeArtist(id); refresh(); }}
          />
        )}

        {activeTab === 'mailing' && (
          <MailingView
            subscribers={subscribers}
            onAdd={() => setSubscriberModal(true)}
            onDelete={(id) => { removeSubscriber(id); refresh(); }}
          />
        )}
      </main>

      {/* ---------- Modals ---------- */}
      {bookingModal.open && (
        <BookingModal
          initial={bookingModal.editing}
          services={services}
          onClose={() => setBookingModal({ open: false, editing: null })}
          onSave={(b) => { upsertBooking(b); refresh(); setBookingModal({ open: false, editing: null }); }}
        />
      )}
      {serviceModal.open && (
        <ServiceModal
          initial={serviceModal.editing}
          onClose={() => setServiceModal({ open: false, editing: null })}
          onSave={(s) => { upsertService(s); refresh(); setServiceModal({ open: false, editing: null }); }}
        />
      )}
      {artistModal.open && (
        <ArtistModal
          initial={artistModal.editing}
          onClose={() => setArtistModal({ open: false, editing: null })}
          onSave={(a) => { upsertArtist(a); refresh(); setArtistModal({ open: false, editing: null }); }}
        />
      )}
      {subscriberModal && (
        <SubscriberModal
          onClose={() => setSubscriberModal(false)}
          onSave={(email) => { addSubscriber(email, 'Admin'); refresh(); setSubscriberModal(false); }}
        />
      )}
    </div>
  );
}

// =========================================================================
// Views
// =========================================================================

function DashboardView({
  stats, bookings, serviceMap, onNewAppointment,
}: {
  stats: { totalBookingsToday: number; pendingConfirmations: number; activeSubscribers: number; monthlyRevenue: string };
  bookings: Booking[];
  serviceMap: Map<string, ServiceItem>;
  onNewAppointment: () => void;
}) {
  const queue = [...bookings].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 8);

  return (
    <>
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif italic text-white drop-shadow-md">Studio Performance</h1>
          <p className="text-xs text-zinc-400 mt-2 font-medium tracking-wide">Live booking queue and daily traffic overview</p>
        </div>
        <button
          onClick={onNewAppointment}
          className="bg-white text-black text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-fuchsia-500 hover:text-white hover:shadow-[0_10px_30px_rgba(217,70,239,0.3)] hover:-translate-y-1 transition-all duration-500 rounded-sm flex items-center gap-2"
        >
          <Plus size={14} /> New Appointment
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <StatCard label="Bookings Today" value={stats.totalBookingsToday} />
        <StatCard label="Pending Action" value={stats.pendingConfirmations} valueClassName="text-amber-400" />
        <StatCard label="Subscribers" value={stats.activeSubscribers} />
        <StatCard label="Revenue (est.)" value={stats.monthlyRevenue} valueClassName="text-emerald-400" />
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-md">
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/40">
          <h3 className="font-bold text-sm text-white tracking-wide">Today&apos;s Active Queue</h3>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Live</span>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {queue.length === 0 && (
            <p className="p-8 text-xs text-zinc-500 text-center">No bookings yet. Add one with &quot;New Appointment&quot;.</p>
          )}
          {queue.map((booking, i) => (
            <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all duration-300 group">
              <div className="flex items-center space-x-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${i % 2 === 0 ? 'bg-fuchsia-900 text-fuchsia-200' : 'bg-cyan-900 text-cyan-200'}`}>
                  {booking.customer[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">{booking.customer}</h4>
                  <p className="text-xs text-zinc-400 font-medium tracking-wide">{serviceMap.get(booking.serviceId)?.name ?? 'Unknown service'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-12">
                <div className="flex items-center space-x-2 text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
                  <Clock size={14} />
                  <span>{booking.time}</span>
                </div>
                <span className={`text-[10px] font-black px-4 py-2 rounded-sm uppercase tracking-widesttransition-all duration-300 ${STATUS_STYLES[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, valueClassName = 'text-white' }: { label: string; value: string | number; valueClassName?: string }) {
  return (
    <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:bg-white/10 hover:-translate-y-2 transition-all duration-500 backdrop-blur-md">
      <div className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{label}</div>
      <div className={`text-5xl font-light ${valueClassName}`}>{value}</div>
    </div>
  );
}

function ScheduleView({
  bookings, serviceMap, onAdd, onEdit, onDelete, onStatusChange,
}: {
  bookings: Booking[];
  serviceMap: Map<string, ServiceItem>;
  onAdd: () => void;
  onEdit: (b: Booking) => void;
  onDelete: (id: string) => void;
  onStatusChange: (b: Booking, status: BookingStatus) => void;
}) {
  const sorted = [...bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <>
      <ViewHeader title="Schedule" subtitle="Every booking, editable in place" actionLabel="New Appointment" onAction={onAdd} />
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-md divide-y divide-white/5">
        {sorted.length === 0 && <p className="p-8 text-xs text-zinc-500 text-center">No bookings yet.</p>}
        {sorted.map((b) => (
          <div key={b.id} className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-bold text-sm text-white mb-1">{b.customer}</h4>
              <p className="text-xs text-zinc-400">{serviceMap.get(b.serviceId)?.name ?? 'Unknown service'} · {b.date} · {b.time}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={b.status}
                onChange={(e) => onStatusChange(b, e.target.value as BookingStatus)}
                className={`text-[10px] font-black px-3 py-2 rounded-sm uppercase tracking-widest bg-zinc-900 border border-white/10 ${STATUS_STYLES[b.status]}`}
              >
                {(['Pending', 'Confirmed', 'In Progress', 'Cancelled'] as BookingStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <IconButton onClick={() => onEdit(b)} label="Edit booking"><Pencil size={14} /></IconButton>
              <IconButton onClick={() => onDelete(b.id)} label="Delete booking"><Trash2 size={14} /></IconButton>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ServicesView({
  services, onAdd, onEdit, onDelete,
}: {
  services: ServiceItem[];
  onAdd: () => void;
  onEdit: (s: ServiceItem) => void;
  onDelete: (id: string) => void;
}) {
  const accentText: Record<AccentColor, string> = { cyan: 'text-cyan-400', amber: 'text-amber-400', fuchsia: 'text-fuchsia-400' };
  return (
    <>
      <ViewHeader title="Menu Items" subtitle="Treatments shown on the public site" actionLabel="Add Service" onAction={onAdd} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((s) => (
          <div key={s.id} className="bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <span className={`font-serif text-xl italic block mb-1 ${accentText[s.accent]}`}>{s.code} /</span>
              <h3 className="font-serif italic text-2xl text-white mb-2">{s.name}</h3>
              <p className="text-xs text-zinc-400 mb-3">{s.tier}</p>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">{s.description}</p>
              <p className="text-lg font-light text-white">${s.price}</p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <IconButton onClick={() => onEdit(s)} label="Edit service"><Pencil size={14} /></IconButton>
              <IconButton onClick={() => onDelete(s.id)} label="Delete service"><Trash2 size={14} /></IconButton>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ArtistsView({
  artists, onAdd, onEdit, onDelete,
}: {
  artists: Artist[];
  onAdd: () => void;
  onEdit: (a: Artist) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <ViewHeader title="Artists" subtitle="Your team, front and center" actionLabel="Add Artist" onAction={onAdd} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {artists.map((a) => (
          <div key={a.id} className="bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-fuchsia-900 text-fuchsia-200 flex items-center justify-center font-bold mb-4">
                {a.name[0]}
              </div>
              <h3 className="font-serif italic text-2xl text-white mb-1">{a.name}</h3>
              <p className="text-xs text-cyan-400 font-bold uppercase tracking-wide mb-3">{a.role}</p>
              <p className="text-xs text-zinc-300 leading-relaxed mb-3">{a.bio}</p>
              <div className="flex flex-wrap gap-2">
                {a.specialties.map((sp) => (
                  <span key={sp} className="text-[10px] bg-white/10 text-zinc-300 px-2 py-1 rounded-sm">{sp}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <IconButton onClick={() => onEdit(a)} label="Edit artist"><Pencil size={14} /></IconButton>
              <IconButton onClick={() => onDelete(a.id)} label="Delete artist"><Trash2 size={14} /></IconButton>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MailingView({
  subscribers, onAdd, onDelete,
}: {
  subscribers: Subscriber[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const sorted = [...subscribers].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
  return (
    <>
      <ViewHeader title="Mailing List" subtitle="Includes sign-ups from the homepage newsletter form" actionLabel="Add Subscriber" onAction={onAdd} />
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-md divide-y divide-white/5">
        {sorted.length === 0 && <p className="p-8 text-xs text-zinc-500 text-center">No subscribers yet.</p>}
        {sorted.map((s) => (
          <div key={s.id} className="p-6 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-white mb-1">{s.email}</h4>
              <p className="text-xs text-zinc-400">Joined {new Date(s.joinedAt).toLocaleDateString()} · {s.source}</p>
            </div>
            <IconButton onClick={() => onDelete(s.id)} label="Remove subscriber"><Trash2 size={14} /></IconButton>
          </div>
        ))}
      </div>
    </>
  );
}

function ViewHeader({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel: string; onAction: () => void }) {
  return (
    <header className="flex justify-between items-center mb-10 flex-wrap gap-4">
      <div>
        <h1 className="text-4xl font-serif italic text-white drop-shadow-md">{title}</h1>
        <p className="text-xs text-zinc-400 mt-2 font-medium tracking-wide">{subtitle}</p>
      </div>
      <button
        onClick={onAction}
        className="bg-white text-black text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-fuchsia-500 hover:text-white hover:-translate-y-1 transition-all duration-500 rounded-sm flex items-center gap-2"
      >
        <Plus size={14} /> {actionLabel}
      </button>
    </header>
  );
}

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="text-zinc-400 hover:text-fuchsia-400 bg-white/5 hover:bg-white/10 p-2 rounded-md transition-colors">
      {children}
    </button>
  );
}

// =========================================================================
// Modals
// =========================================================================

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-zinc-950">
          <h3 className="font-serif italic text-2xl text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-2">{children}</label>;
}

const inputClass = 'w-full bg-black/50 border border-white/20 px-4 py-3 text-white text-sm focus:outline-none focus:border-fuchsia-500 rounded-sm';

function BookingModal({
  initial, services, onClose, onSave,
}: {
  initial: Booking | null;
  services: ServiceItem[];
  onClose: () => void;
  onSave: (b: Omit<Booking, 'id'> & { id?: string }) => void;
}) {
  const [customer, setCustomer] = useState(initial?.customer ?? '');
  const [serviceId, setServiceId] = useState(initial?.serviceId ?? services[0]?.id ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(initial?.time ?? '10:00 AM');
  const [status, setStatus] = useState<BookingStatus>(initial?.status ?? 'Pending');

  const canSave = customer.trim().length > 0 && serviceId && time.trim().length > 0;

  return (
    <ModalShell title={initial ? 'Edit Appointment' : 'New Appointment'} onClose={onClose}>
      <div>
        <FieldLabel>Customer Name</FieldLabel>
        <input className={inputClass} value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Jane Doe" />
      </div>
      <div>
        <FieldLabel>Service</FieldLabel>
        <select className={inputClass} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.code} / {s.name} — ${s.price}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Date</FieldLabel>
          <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Time</FieldLabel>
          <input className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} placeholder="10:00 AM" />
        </div>
      </div>
      <div>
        <FieldLabel>Status</FieldLabel>
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
          {(['Pending', 'Confirmed', 'In Progress', 'Cancelled'] as BookingStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <button
        disabled={!canSave}
        onClick={() => onSave({ id: initial?.id, customer: customer.trim(), serviceId, date, time: time.trim(), status })}
        className="w-full bg-white text-black py-3 text-xs font-black tracking-[0.2em] uppercase rounded-sm hover:bg-fuchsia-500 hover:text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
      >
        <Check size={14} /> {initial ? 'Save Changes' : 'Create Appointment'}
      </button>
    </ModalShell>
  );
}

function ServiceModal({
  initial, onClose, onSave,
}: {
  initial: ServiceItem | null;
  onClose: () => void;
  onSave: (s: Omit<ServiceItem, 'id'> & { id?: string }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [tier, setTier] = useState(initial?.tier ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [accent, setAccent] = useState<AccentColor>(initial?.accent ?? 'fuchsia');

  const priceNum = Number(price);
  const canSave = name.trim().length > 0 && code.trim().length > 0 && !Number.isNaN(priceNum) && priceNum > 0;

  return (
    <ModalShell title={initial ? 'Edit Service' : 'Add Service'} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Code</FieldLabel>
          <input className={inputClass} value={code} onChange={(e) => setCode(e.target.value)} placeholder="04" />
        </div>
        <div>
          <FieldLabel>Price (USD)</FieldLabel>
          <input type="number" min="0" className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="65" />
        </div>
      </div>
      <div>
        <FieldLabel>Name</FieldLabel>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Chrome Finish" />
      </div>
      <div>
        <FieldLabel>Tier Label</FieldLabel>
        <input className={inputClass} value={tier} onChange={(e) => setTier(e.target.value)} placeholder="Signature Tier" />
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description shown on the menu card." />
      </div>
      <div>
        <FieldLabel>Accent Color</FieldLabel>
        <select className={inputClass} value={accent} onChange={(e) => setAccent(e.target.value as AccentColor)}>
          <option value="cyan">Cyan</option>
          <option value="amber">Amber</option>
          <option value="fuchsia">Fuchsia</option>
        </select>
      </div>
      <button
        disabled={!canSave}
        onClick={() => onSave({ id: initial?.id, name: name.trim(), code: code.trim(), tier: tier.trim(), price: priceNum, description: description.trim(), accent })}
        className="w-full bg-white text-black py-3 text-xs font-black tracking-[0.2em] uppercase rounded-sm hover:bg-fuchsia-500 hover:text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
      >
        <Check size={14} /> {initial ? 'Save Changes' : 'Add Service'}
      </button>
    </ModalShell>
  );
}

function ArtistModal({
  initial, onClose, onSave,
}: {
  initial: Artist | null;
  onClose: () => void;
  onSave: (a: Omit<Artist, 'id'> & { id?: string }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [specialties, setSpecialties] = useState(initial?.specialties.join(', ') ?? '');

  const canSave = name.trim().length > 0 && role.trim().length > 0;

  return (
    <ModalShell title={initial ? 'Edit Artist' : 'Add Artist'} onClose={onClose}>
      <div>
        <FieldLabel>Name</FieldLabel>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Ray" />
      </div>
      <div>
        <FieldLabel>Role</FieldLabel>
        <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Technician" />
      </div>
      <div>
        <FieldLabel>Bio</FieldLabel>
        <textarea className={inputClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio shown on the site." />
      </div>
      <div>
        <FieldLabel>Specialties (comma-separated)</FieldLabel>
        <input className={inputClass} value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Custom Art, Gel Sculpt" />
      </div>
      <button
        disabled={!canSave}
        onClick={() => onSave({
          id: initial?.id,
          name: name.trim(),
          role: role.trim(),
          bio: bio.trim(),
          specialties: specialties.split(',').map((s) => s.trim()).filter(Boolean),
        })}
        className="w-full bg-white text-black py-3 text-xs font-black tracking-[0.2em] uppercase rounded-sm hover:bg-fuchsia-500 hover:text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
      >
        <Check size={14} /> {initial ? 'Save Changes' : 'Add Artist'}
      </button>
    </ModalShell>
  );
}

function SubscriberModal({ onClose, onSave }: { onClose: () => void; onSave: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <ModalShell title="Add Subscriber" onClose={onClose}>
      <div>
        <FieldLabel>Email Address</FieldLabel>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
      </div>
      <button
        disabled={!valid}
        onClick={() => onSave(email.trim())}
        className="w-full bg-white text-black py-3 text-xs font-black tracking-[0.2em] uppercase rounded-sm hover:bg-fuchsia-500 hover:text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
      >
        <Check size={14} /> Add Subscriber
      </button>
    </ModalShell>
  );
}