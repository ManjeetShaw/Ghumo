import React, { useState, useEffect } from 'react';
import { searchApi } from '../api.js';
import { PLACES } from '../data/places.js';
import { todayLocal, formatTime, formatINR } from '../utils/date.js';
import { inputClass, labelClass, primaryButton, PageHeader, ErrorNote, EmptyNote, Loading, FareNote } from '../components/ui.jsx';

export default function BusSearchPage({ initial, onProceedToCheckout }) {
  const [origin, setOrigin] = useState(initial?.origin || 'Agra');
  const [destination, setDestination] = useState(initial?.destination || 'Jaipur');
  const [date, setDate] = useState(initial?.date || todayLocal());
  const [sortBy, setSortBy] = useState('price');
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runSearch() {
    setLoading(true);
    setError('');
    try {
      const res = await searchApi.searchBuses({ origin: origin.trim(), destination: destination.trim(), date });
      if (res.success) setBuses(res.data || []);
      else setError(res.error?.message || 'Could not search buses.');
    } catch (err) {
      setError('Could not search buses. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = [...buses].sort((a, b) => {
    if (sortBy === 'duration') return (a.durationMinutes || 0) - (b.durationMinutes || 0);
    if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime);
    return (a.fare || 0) - (b.fare || 0);
  });

  const handleBook = (b) => {
    onProceedToCheckout?.({
      category: 'BUS',
      vendorItemId: b.id,
      itemDetails: {
        operator: b.operator,
        busType: b.busType,
        origin: b.origin,
        destination: b.destination,
        originCity: b.originCity,
        destinationCity: b.destinationCity,
        departureTime: b.departureTime,
        arrivalTime: b.arrivalTime,
      },
      passengers: [{}],
      pricing: { baseFare: b.fare, currency: 'INR' },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader title="Buses" subtitle="Search intercity buses by city name." />
      <datalist id="bus-cities">{PLACES.map((p) => <option key={p.city} value={p.city} />)}</datalist>

      <form
        onSubmit={(e) => { e.preventDefault(); runSearch(); }}
        className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label htmlFor="b-from" className={labelClass}>From</label>
          <input id="b-from" list="bus-cities" value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="b-to" className={labelClass}>To</label>
          <input id="b-to" list="bus-cities" value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="b-date" className={labelClass}>Date</label>
          <input id="b-date" type="date" min={todayLocal()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
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
        <EmptyNote title="No buses found">Check the city names and the date, then search again.</EmptyNote>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((b) => (
            <li key={b.id} className="p-5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-on-surface">{b.operator}</div>
                <div className="text-xs text-on-surface-variant">{b.busType}</div>
                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  <div>
                    <div className="text-lg font-bold text-on-surface">{formatTime(b.departureTime)}</div>
                    <div className="text-xs text-on-surface-variant">{b.originCity || b.origin}</div>
                  </div>
                  <div className="text-xs text-on-surface-variant">{b.duration}</div>
                  <div>
                    <div className="text-lg font-bold text-on-surface">{formatTime(b.arrivalTime)}</div>
                    <div className="text-xs text-on-surface-variant">{b.destinationCity || b.destination}</div>
                  </div>
                </div>
                {(b.boardingPoints?.length > 0 || b.droppingPoints?.length > 0) && (
                  <div className="text-xs text-on-surface-variant mt-2">
                    {b.boardingPoints?.[0] && <span>Boarding: {b.boardingPoints[0]}</span>}
                    {b.boardingPoints?.[0] && b.droppingPoints?.[0] && <span> · </span>}
                    {b.droppingPoints?.[0] && <span>Dropping: {b.droppingPoints[0]}</span>}
                  </div>
                )}
              </div>
              <div className="md:text-right shrink-0">
                <div className="text-xs text-on-surface-variant">Base fare</div>
                <div className="text-xl font-extrabold text-on-surface">{formatINR(b.fare)}</div>
                {b.seatsAvailable !== undefined && <div className="text-xs text-on-surface-variant">{b.seatsAvailable} seats left</div>}
                <button onClick={() => handleBook(b)} className={`${primaryButton} mt-2`}>Book</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
