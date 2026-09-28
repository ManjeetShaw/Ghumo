import React, { useState, useEffect } from 'react';
import { aiApi } from '../api.js';

export default function GlobalSearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else openModal();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const openModal = () => {
    // will be controlled by parent
  };

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await aiApi.travelSearch(query);
      if (res.success && res.data) {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
      <div className="fixed inset-0 bg-surface-dim/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-surface-container-low rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden z-10">
        {/* Input Bar */}
        <form onSubmit={handleSearch} className="relative flex items-center p-4 border-b border-surface-container-high/60 bg-surface-container">
          <span className="material-symbols-outlined text-primary text-[24px] mr-3">
            travel_explore
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flights, trains, villas, or ask AI (e.g. 'Flights to Bali under 40000')..."
            className="w-full bg-transparent text-white font-title-md text-[15px] focus:outline-none placeholder:text-outline-variant"
            autoFocus
          />
          {loading ? (
            <span className="material-symbols-outlined text-primary text-[20px] animate-spin">
              refresh
            </span>
          ) : (
            <kbd className="hidden sm:inline bg-surface-variant px-2 py-0.5 rounded text-[11px] font-counter-display text-on-surface-variant">
              ESC
            </kbd>
          )}
        </form>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-surface-container-high/40 flex flex-wrap gap-2 text-xs border-b border-surface-container-high/30">
          <span className="text-on-surface-variant font-medium py-1">Quick prompts:</span>
          {[
            'Direct flights Delhi to Bali',
            'Vande Bharat trains to Kasaragod',
            'Luxury villa Ubud private pool',
            'KSRTC sleeper bus to Kochi'
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(prompt);
                aiApi.travelSearch(prompt).then(res => {
                  if (res.success && res.data) setResults(res.data);
                });
              }}
              className="px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-surface-variant text-secondary text-xs transition-colors cursor-pointer"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 flex flex-col gap-4">
          {results ? (
            <div>
              {results.intent && (
                <div className="p-3 rounded-xl bg-primary-container/20 border border-primary/30 mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    auto_awesome
                  </span>
                  <div className="text-xs">
                    <span className="font-bold text-primary">AI Parsed Intent: </span>
                    <span className="text-on-surface">
                      Routing from {results.intent.origin} to {results.intent.destination} ({results.intent.category})
                    </span>
                  </div>
                </div>
              )}

              {/* Flights Section */}
              {results.results?.flights?.length > 0 && (
                <div className="mb-4">
                  <div className="font-label-sm uppercase text-secondary font-bold mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">flight</span>
                    Matching Flights
                  </div>
                  <div className="flex flex-col gap-2">
                    {results.results.flights.slice(0, 2).map(f => (
                      <div
                        key={f.id}
                        onClick={() => {
                          onSelectResult?.('flights', f);
                          onClose();
                        }}
                        className="p-3 rounded-lg bg-surface-container-high/60 hover:bg-surface-variant cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white text-sm">{f.airline} • {f.flightNumber}</div>
                          <div className="text-xs text-on-surface-variant">{f.origin} → {f.destination} • {f.duration}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-tertiary">₹{f.price.total}</div>
                          <span className="text-[11px] text-secondary">Book →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trains Section */}
              {results.results?.trains?.length > 0 && (
                <div className="mb-4">
                  <div className="font-label-sm uppercase text-primary font-bold mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">train</span>
                    Matching Trains
                  </div>
                  <div className="flex flex-col gap-2">
                    {results.results.trains.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectResult?.('trains', t);
                          onClose();
                        }}
                        className="p-3 rounded-lg bg-surface-container-high/60 hover:bg-surface-variant cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white text-sm">{t.trainName} ({t.trainNumber})</div>
                          <div className="text-xs text-on-surface-variant">{t.origin} → {t.destination} • {t.duration}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-tertiary">From ₹{t.classes[0]?.fare}</div>
                          <span className="text-[11px] text-secondary">View Berths →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels Section */}
              {results.results?.hotels?.length > 0 && (
                <div>
                  <div className="font-label-sm uppercase text-tertiary font-bold mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">hotel</span>
                    Luxury Stays
                  </div>
                  <div className="flex flex-col gap-2">
                    {results.results.hotels.slice(0, 2).map(h => (
                      <div
                        key={h.id}
                        onClick={() => {
                          onSelectResult?.('hotels', h);
                          onClose();
                        }}
                        className="p-3 rounded-lg bg-surface-container-high/60 hover:bg-surface-variant cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white text-sm">{h.name}</div>
                          <div className="text-xs text-on-surface-variant">{h.city} • ★ {h.guestRating}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-tertiary">₹{h.pricePerNight} / nt</div>
                          <span className="text-[11px] text-secondary">Reserve →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-outline-variant mb-2">
                travel_explore
              </span>
              <p className="font-body-md text-sm">Type any destination, transport mode, or travel requirement</p>
              <p className="font-body-sm text-xs mt-1 text-outline">Press Enter to dispatch real-time query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
