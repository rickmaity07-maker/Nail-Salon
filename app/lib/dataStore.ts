/**
 * mockStore.ts
 * -----------------------------------------------------------------------
 * Lightweight localStorage-backed "database" so the admin panel and the
 * public site can share and persist data without a real backend.
 *
 * Every entity has: seed data, get/set helpers, and add/update/remove
 * helpers. All reads/writes guard against SSR (no `window` on the server).
 * -----------------------------------------------------------------------
 */

// ---------- Types ----------------------------------------------------

export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Cancelled';

export interface Booking {
  id: string;
  customer: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  status: BookingStatus;
  notes?: string;
}

export type AccentColor = 'cyan' | 'amber' | 'fuchsia';

export interface ServiceItem {
  id: string;
  code: string; // "01", "02", "03"...
  name: string;
  tier: string;
  price: number;
  description: string;
  accent: AccentColor;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
}

export interface Subscriber {
  id: string;
  email: string;
  joinedAt: string; // ISO date
  source: 'Newsletter' | 'Admin';
}

// ---------- Storage keys ----------------------------------------------

const KEYS = {
  bookings: 'aura_bookings',
  services: 'aura_services',
  artists: 'aura_artists',
  subscribers: 'aura_subscribers',
} as const;

// ---------- Seed data ---------------------------------------------------

const SEED_SERVICES: ServiceItem[] = [
  {
    id: 'svc-1',
    code: '01',
    name: 'Classic Care',
    tier: 'Classic Tier',
    price: 45,
    description: 'A refined essentials manicure — shape, cuticle care, buff, and polish.',
    accent: 'cyan',
  },
  {
    id: 'svc-2',
    code: '02',
    name: 'Gel Sculpt',
    tier: 'Sculpt Tier',
    price: 68,
    description: 'Long-wear gel sculpting with a glass-smooth structured finish.',
    accent: 'amber',
  },
  {
    id: 'svc-3',
    code: '03',
    name: 'Custom Art',
    tier: 'Artisan Tier',
    price: 95,
    description: 'Hand-painted, editorial nail art fully custom to your vision.',
    accent: 'fuchsia',
  },
];

const SEED_ARTISTS: Artist[] = [
  {
    id: 'art-1',
    name: 'Maya Lin',
    role: 'Lead Nail Artist',
    bio: 'Twelve years in editorial and fashion-week nail design.',
    specialties: ['Custom Art', 'Gel Sculpt'],
  },
  {
    id: 'art-2',
    name: 'Sarah Jenkins',
    role: 'Senior Technician',
    bio: 'Specializes in precision shaping and long-wear finishes.',
    specialties: ['Classic Care'],
  },
  {
    id: 'art-3',
    name: 'Chloe Decker',
    role: 'Resident Artist',
    bio: 'Known for intricate hand-painted, gallery-inspired designs.',
    specialties: ['Custom Art'],
  },
];

const SEED_BOOKINGS: Booking[] = [
  { id: 'bk-1', customer: 'Maya Lin', serviceId: 'svc-1', date: todayISO(), time: '10:00 AM', status: 'Confirmed' },
  { id: 'bk-2', customer: 'Sarah Jenkins', serviceId: 'svc-3', date: todayISO(), time: '11:15 AM', status: 'In Progress' },
  { id: 'bk-3', customer: 'Chloe Decker', serviceId: 'svc-2', date: todayISO(), time: '01:30 PM', status: 'Pending' },
  { id: 'bk-4', customer: 'Emma Watson', serviceId: 'svc-1', date: todayISO(), time: '03:00 PM', status: 'Confirmed' },
];

const SEED_SUBSCRIBERS: Subscriber[] = [
  { id: 'sub-1', email: 'jane.doe@example.com', joinedAt: daysAgoISO(12), source: 'Newsletter' },
  { id: 'sub-2', email: 'alex.kim@example.com', joinedAt: daysAgoISO(5), source: 'Newsletter' },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// ---------- Generic read/write helpers ---------------------------------

function isBrowser() {
  return typeof window !== 'undefined';
}

function readList<T>(key: string, seed: T[]): T[] {
  if (!isBrowser()) return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return seed;
  }
}

function writeList<T>(key: string, list: T[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently
  }
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---------- Services -----------------------------------------------------

export function getServices(): ServiceItem[] {
  return readList(KEYS.services, SEED_SERVICES);
}
export function saveServices(list: ServiceItem[]): void {
  writeList(KEYS.services, list);
}
export function upsertService(service: Omit<ServiceItem, 'id'> & { id?: string }): ServiceItem[] {
  const list = getServices();
  if (service.id) {
    const next = list.map((s) => (s.id === service.id ? { ...(service as ServiceItem) } : s));
    saveServices(next);
    return next;
  }
  const created: ServiceItem = { ...service, id: makeId('svc') };
  const next = [...list, created];
  saveServices(next);
  return next;
}
export function removeService(id: string): ServiceItem[] {
  const next = getServices().filter((s) => s.id !== id);
  saveServices(next);
  return next;
}

// ---------- Artists -------------------------------------------------------

export function getArtists(): Artist[] {
  return readList(KEYS.artists, SEED_ARTISTS);
}
export function saveArtists(list: Artist[]): void {
  writeList(KEYS.artists, list);
}
export function upsertArtist(artist: Omit<Artist, 'id'> & { id?: string }): Artist[] {
  const list = getArtists();
  if (artist.id) {
    const next = list.map((a) => (a.id === artist.id ? { ...(artist as Artist) } : a));
    saveArtists(next);
    return next;
  }
  const created: Artist = { ...artist, id: makeId('art') };
  const next = [...list, created];
  saveArtists(next);
  return next;
}
export function removeArtist(id: string): Artist[] {
  const next = getArtists().filter((a) => a.id !== id);
  saveArtists(next);
  return next;
}

// ---------- Bookings -------------------------------------------------------

export function getBookings(): Booking[] {
  return readList(KEYS.bookings, SEED_BOOKINGS);
}
export function saveBookings(list: Booking[]): void {
  writeList(KEYS.bookings, list);
}
export function upsertBooking(booking: Omit<Booking, 'id'> & { id?: string }): Booking[] {
  const list = getBookings();
  if (booking.id) {
    const next = list.map((b) => (b.id === booking.id ? { ...(booking as Booking) } : b));
    saveBookings(next);
    return next;
  }
  const created: Booking = { ...booking, id: makeId('bk') };
  const next = [created, ...list];
  saveBookings(next);
  return next;
}
export function removeBooking(id: string): Booking[] {
  const next = getBookings().filter((b) => b.id !== id);
  saveBookings(next);
  return next;
}

// ---------- Subscribers -----------------------------------------------------

export function getSubscribers(): Subscriber[] {
  return readList(KEYS.subscribers, SEED_SUBSCRIBERS);
}
export function saveSubscribers(list: Subscriber[]): void {
  writeList(KEYS.subscribers, list);
}
/** Returns { added, list } — added is false if the email is already subscribed. */
export function addSubscriber(email: string, source: Subscriber['source'] = 'Newsletter'): { added: boolean; list: Subscriber[] } {
  const list = getSubscribers();
  const normalized = email.trim().toLowerCase();
  if (list.some((s) => s.email.toLowerCase() === normalized)) {
    return { added: false, list };
  }
  const created: Subscriber = { id: makeId('sub'), email: email.trim(), joinedAt: new Date().toISOString(), source };
  const next = [created, ...list];
  saveSubscribers(next);
  return { added: true, list: next };
}
export function removeSubscriber(id: string): Subscriber[] {
  const next = getSubscribers().filter((s) => s.id !== id);
  saveSubscribers(next);
  return next;
}