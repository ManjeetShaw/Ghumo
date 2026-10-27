import React, { useState, useEffect } from 'react';
import { searchApi } from '../api.js';
import { PLACES, toCode } from '../data/places.js';
import { todayLocal, formatTime, formatINR } from '../utils/date.js';
import { inputClass, labelClass, primaryButton, PageHeader, ErrorNote, EmptyNote, Loading, FareNote } from '../components/ui.jsx';

function stopsLabel(n) {
  if (!n) return 'Non-stop';
  return `${n} stop${n > 1 ? 's' : ''}`;
}

export default function FlightSearchPage({ initial, onProceedToCheckout }) {
  const [origin, setOrigin] = useState(initial?.origin || 'CCU');
  const [destination, setDestination] = useState(initial?.destination || 'DEL');
  const [date, setDate] = useState(initial?.date || todayLocal());
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('price');

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runSearch() {
    setLoading(true);
    setError('');
    try {
      const res = await searchApi.searchFlights({ origin: toCode(origin, 'air'), destination: toCode(destination, 'air'), date });
      if (res.success) setFlights(res.data || []);
      else setError(res.error?.message || 'Could not search flights.');
    } catch (err) {
      setError('Could not search flights. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // Runs once on arrival with the values passed in, or the defaults.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = flights
    .filter((f) => !maxPrice || f.price.baseFare <= Number(maxPrice))
    .sort((a, b) => {
      if (sortBy === 'duration') return (a.durationMinutes || 0) - (b.durationMinutes || 0);
      if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime);
      return (a.price.baseFare || 0) - (b.price.baseFare || 0);
    });

  const handleBook = (f) => {
    onProceedToCheckout?.({
      category: 'FLIGHT',
      vendorItemId: f.id,
      itemDetails: {
        airline: f.airline,
        flightNumber: f.flightNumber,
        origin: f.origin,
        destination: f.destination,
        originCity: f.originCity,
        destinationCity: f.destinationCity,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        cabinClass: f.cabinClass,
      },
      passengers: [{}],
      pricing: { baseFare: f.price.baseFare, currency: 'INR' },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader title="Flights" subtitle="Search flights between Indian airports." />
      <datalist id="air-cities">{PLACES.map((p) => <option key={p.city} value={p.city} />)}</datalist>

      <form
        onSubmit={(e) => { e.preventDefault(); runSearch(); }}
        className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label htmlFor="f-from" className={labelClass}>From</label>
          <input id="f-from" list="air-cities" value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="f-to" className={labelClass}>To</label>
          <input id="f-to" list="air-cities" value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="f-date" className={labelClass}>Date</label>
          <input id="f-date" type="date" min={todayLocal()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="f-max" className={labelClass}>Max base fare (₹)</label>
          <input id="f-max" type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="No limit" className={inputClass} />
        </div>
        <button type="submit" disabled={loading} className={primaryButton}>Search</button>
      </form>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <FareNote />
        <label className="flex items-center gap-2 text-sm text-on-surface-variant">
          Sort by
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-surface-container-high px-2 py-1.5 rounded-md text-on-surface text-sm border border-outline-variant/40">
            <option value="price">Lowest fare</option>
            <option value="duration">Shortest</option>
            <option value="departure">Earliest</option>
          </select>
        </label>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {loading ? (
        <Loading />
      ) : visible.length === 0 && !error ? (
        <EmptyNote title="No flights found">Try another date, change the cities or remove the fare limit.</EmptyNote>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((f) => (
            <li key={f.id} className="p-5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-on-surface">{f.airline} <span className="font-mono font-normal text-on-surface-variant">{f.flightNumber}</span></div>
                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  <div>
                    <div className="text-lg font-bold text-on-surface">{formatTime(f.departureTime)}</div>
                    <div className="text-xs text-on-surface-variant">{f.originCity || f.origin} ({f.origin})</div>
                  </div>
                  <div className="text-xs text-on-surface-variant text-center">
                    <div>{f.duration}</div>
                    <div>{stopsLabel(f.stops)}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-on-surface">{formatTime(f.arrivalTime)}</div>
                    <div className="text-xs text-on-surface-variant">{f.destinationCity || f.destination} ({f.destination})</div>
                  </div>
                </div>
                <div className="text-xs text-on-surface-variant mt-2">
                  {[f.cabinClass, f.baggageAllowance].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="md:text-right shrink-0">
                <div className="text-xs text-on-surface-variant">Base fare</div>
                <div className="text-xl font-extrabold text-on-surface">{formatINR(f.price.baseFare)}</div>
                <button onClick={() => handleBook(f)} className={`${primaryButton} mt-2`}>Book</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
