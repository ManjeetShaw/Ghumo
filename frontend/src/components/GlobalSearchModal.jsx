import React, { useState } from 'react';
import { aiApi } from '../api.js';
import { formatINR, formatTime } from '../utils/date.js';

const QUICK_PROMPTS = [
  'Flights from Kolkata to Delhi under 6000',
  'Trains from Delhi to Jaipur',
  'Hotels in Udaipur',
  'Buses from Agra to Jaipur',
];

export default function GlobalSearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  async function runSearch(text) {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await aiApi.travelSearch(text);
      if (res.success && res.data) setResults(res.data);
      else setError(res.error?.message || 'Search failed. Please try again.');
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const flights = results?.results?.flights || [];
  const trains = results?.results?.trains || [];
  const hotels = results?.results?.hotels || [];
  const buses = results?.results?.buses || [];
  const nothing = results && !flights.length && !trains.length && !hotels.length && !buses.length;

  const pick = (type, item) => {
    onSelectResult?.(type, item, results?.intent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto p-4 sm:p-6 md:p-16 flex items-start justify-center" role="dialog" aria-modal="true" aria-label="Search">
      <div className="fixed inset-0 bg-surface-dim/80" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-surface-container-low rounded-lg border border-surface-container-high overflow-hidden z-10">
        <form onSubmit={(e) => { e.preventDefault(); runSearch(query); }} className="flex items-center gap-3 p-4 border-b border-surface-container-high bg-surface-container">
          <span className="material-symbols-outlined text-primary text-[22px]">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your trip, for example: trains from Delhi to Jaipur"
            className="w-full bg-transparent text-on-surface text-sm focus:outline-none placeholder:text-on-surface-variant"
            autoFocus
            aria-label="Search"
          />
          <kbd className="hidden sm:inline bg-surface-variant px-2 py-0.5 rounded text-[11px] text-on-surface-variant">Esc</kbd>
        </form>

        <div className="p-3 bg-surface-container-high/40 flex flex-wrap gap-2 text-xs border-b border-surface-container-high">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} type="button" onClick={() => { setQuery(p); runSearch(p); }} className="px-2.5 py-1 rounded-md bg-surface-variant hover:bg-surface-container-highest text-on-surface">
              {p}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-4 flex flex-col gap-4">
          {loading && <p className="text-sm text-on-surface-variant py-6 text-center" role="status">Searching</p>}
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
          {!loading && !results && !error && (
            <p className="text-sm text-on-surface-variant py-4 text-center">Type a request in plain words and press Enter. Text you type here is processed by an AI model to read your request.</p>
          )}
          {nothing && !loading && <p className="text-sm text-on-surface-variant py-4 text-center">Nothing found. Try different words or open a search page from the menu.</p>}

          {flights.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Flights</h3>
              <ul className="flex flex-col gap-1.5">
                {flights.slice(0, 5).map((f) => (
                  <li key={f.id}>
                    <button onClick={() => pick('flights', f)} className="w-full flex items-center justify-between gap-3 p-3 rounded-md bg-surface-container-high/60 hover:bg-surface-variant text-left">
                      <span className="text-sm text-on-surface">{f.airline} {f.flightNumber}<span className="block text-xs text-on-surface-variant">{f.origin} to {f.destination}, {formatTime(f.departureTime)}</span></span>
                      <span className="text-sm font-bold text-on-surface">{formatINR(f.price.baseFare)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {trains.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Trains</h3>
              <ul className="flex flex-col gap-1.5">
                {trains.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <button onClick={() => pick('trains', t)} className="w-full flex items-center justify-between gap-3 p-3 rounded-md bg-surface-container-high/60 hover:bg-surface-variant text-left">
                      <span className="text-sm text-on-surface">{t.trainName} {t.trainNumber}<span className="block text-xs text-on-surface-variant">{t.origin} to {t.destination}, {formatTime(t.departureTime)}</span></span>
                      <span className="text-sm text-primary font-semibold">See classes</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {buses.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Buses</h3>
              <ul className="flex flex-col gap-1.5">
                {buses.slice(0, 5).map((b) => (
                  <li key={b.id}>
                    <button onClick={() => pick('buses', b)} className="w-full flex items-center justify-between gap-3 p-3 rounded-md bg-surface-container-high/60 hover:bg-surface-variant text-left">
                      <span className="text-sm text-on-surface">{b.operator}<span className="block text-xs text-on-surface-variant">{b.originCity} to {b.destinationCity}, {formatTime(b.departureTime)}</span></span>
                      <span className="text-sm font-bold text-on-surface">{formatINR(b.fare)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hotels.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Hotels</h3>
              <ul className="flex flex-col gap-1.5">
                {hotels.slice(0, 5).map((h) => (
                  <li key={h.id}>
                    <button onClick={() => pick('hotels', h)} className="w-full flex items-center justify-between gap-3 p-3 rounded-md bg-surface-container-high/60 hover:bg-surface-variant text-left">
                      <span className="text-sm text-on-surface">{h.name}<span className="block text-xs text-on-surface-variant">{h.city}</span></span>
                      <span className="text-sm font-bold text-on-surface">{formatINR(h.pricePerNight)} <span className="font-normal text-xs text-on-surface-variant">per night</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
