import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api.js';
import { STATUS_GROUPS, describeBooking, statusLabel, statusTone } from '../utils/bookingStatus.js';
import { formatINR } from '../utils/date.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'unpaid', label: 'Awaiting payment' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function MyBookingsPage({ onSelectBooking, onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await bookingApi.getBookings({ limit: 100 });
        if (cancelled) return;
        if (res.success && res.data) setBookings(res.data);
        else setError(res.error?.message || 'Could not load your bookings.');
      } catch (err) {
        if (!cancelled) setError('Could not load your bookings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = filter === 'all' ? bookings : bookings.filter((b) => STATUS_GROUPS[filter].includes(b.status));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-on-surface">My bookings</h1>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-md text-sm ${
                filter === f.id ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div role="alert" className="p-3 rounded-md bg-error/20 border border-error/40 text-error text-sm">{error}</div>}

      {loading ? (
        <p className="text-sm text-on-surface-variant py-12 text-center">Loading your bookings</p>
      ) : visible.length === 0 ? (
        <div className="p-10 rounded-lg bg-surface-container-low border border-surface-container-high text-center flex flex-col items-center gap-3">
          <h2 className="text-lg font-bold text-on-surface">No bookings found</h2>
          <p className="text-sm text-on-surface-variant max-w-sm">
            {filter === 'all' ? 'Your bookings will appear here once you book.' : 'No bookings match this filter.'}
          </p>
          {filter === 'all' && (
            <button onClick={() => onNavigate('flights')} className="mt-1 px-5 py-2.5 rounded-md bg-primary-container text-on-primary-container font-bold text-sm">
              Search flights
            </button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((b) => {
            const info = describeBooking(b);
            const pax = b.passengers?.[0];
            return (
              <li key={b._id}>
                <button
                  onClick={() => onSelectBooking(b._id)}
                  className="w-full p-5 rounded-lg bg-surface-container-low border border-surface-container-high hover:border-primary/50 text-left flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <span className="flex items-start gap-4 min-w-0">
                    <span className="w-11 h-11 rounded-md bg-surface-variant flex items-center justify-center shrink-0 text-primary">
                      <span className="material-symbols-outlined">{info.icon}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-tertiary font-bold">{b.bookingReference}</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${statusTone(b.status)}`}>{statusLabel(b.status)}</span>
                      </span>
                      <span className="block text-base font-bold text-on-surface mt-1">{info.title}</span>
                      <span className="block text-sm text-on-surface-variant">
                        {info.route}{pax?.name ? `, ${pax.name}` : ''}{pax?.seatNumber ? `, seat ${pax.seatNumber}` : ''}
                      </span>
                    </span>
                  </span>
                  <span className="md:text-right shrink-0">
                    <span className="block text-xs text-on-surface-variant">Total</span>
                    <span className="block text-lg font-bold text-on-surface">{formatINR(b.pricing?.totalAmount)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
