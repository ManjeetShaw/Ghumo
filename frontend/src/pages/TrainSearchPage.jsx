import React, { useState, useEffect } from 'react';
import { searchApi } from '../api.js';
import { PLACES, toCode } from '../data/places.js';
import { todayLocal, formatTime, formatINR } from '../utils/date.js';
import { inputClass, labelClass, primaryButton, PageHeader, ErrorNote, EmptyNote, Loading, FareNote } from '../components/ui.jsx';

export default function TrainSearchPage({ initial, onProceedToCheckout }) {
  const [origin, setOrigin] = useState(initial?.origin || 'NDLS');
  const [destination, setDestination] = useState(initial?.destination || 'AGC');
  const [date, setDate] = useState(initial?.date || todayLocal());
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runSearch() {
    setLoading(true);
    setError('');
    try {
      const res = await searchApi.searchTrains({ origin: toCode(origin, 'rail'), destination: toCode(destination, 'rail'), date });
      if (res.success) setTrains(res.data || []);
      else setError(res.error?.message || 'Could not search trains.');
    } catch (err) {
      setError('Could not search trains. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = (t, cls) => {
    onProceedToCheckout?.({
      category: 'TRAIN',
      vendorItemId: t.id,
      itemDetails: {
        trainName: t.trainName,
        trainNumber: t.trainNumber,
        origin: t.origin,
        destination: t.destination,
        originCity: t.originCity,
        destinationCity: t.destinationCity,
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        classCode: cls.code,
        className: cls.name,
      },
      passengers: [{}],
      pricing: { baseFare: cls.fare, currency: 'INR' },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader title="Trains" subtitle="Search Indian Railways trains. You can type a city or a station code." />
      <datalist id="rail-cities">{PLACES.filter((p) => p.rail).map((p) => <option key={p.city} value={p.city} />)}</datalist>

      <form
        onSubmit={(e) => { e.preventDefault(); runSearch(); }}
        className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label htmlFor="t-from" className={labelClass}>From</label>
          <input id="t-from" list="rail-cities" value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="t-to" className={labelClass}>To</label>
          <input id="t-to" list="rail-cities" value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="t-date" className={labelClass}>Date</label>
          <input id="t-date" type="date" min={todayLocal()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
        </div>
        <button type="submit" disabled={loading} className={primaryButton}>Search</button>
      </form>

      <FareNote />
      <ErrorNote>{error}</ErrorNote>

      {loading ? (
        <Loading />
      ) : trains.length === 0 && !error ? (
        <EmptyNote title="No trains found">Check the station codes and the date, then search again.</EmptyNote>
      ) : (
        <ul className="flex flex-col gap-3">
          {trains.map((t) => (
            <li key={t.id} className="p-5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm font-bold text-on-surface">{t.trainName} <span className="font-mono font-normal text-on-surface-variant">{t.trainNumber}</span></div>
                  <div className="mt-2 flex items-center gap-4 flex-wrap">
                    <div>
                      <div className="text-lg font-bold text-on-surface">{formatTime(t.departureTime)}</div>
                      <div className="text-xs text-on-surface-variant">{t.originCity || t.origin} ({t.origin})</div>
                    </div>
                    <div className="text-xs text-on-surface-variant">{t.duration}</div>
                    <div>
                      <div className="text-lg font-bold text-on-surface">{formatTime(t.arrivalTime)}</div>
                      <div className="text-xs text-on-surface-variant">{t.destinationCity || t.destination} ({t.destination})</div>
                    </div>
                  </div>
                </div>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {t.classes.map((c) => (
                  <li key={c.code} className="p-3 rounded-md bg-surface-container-high/60 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-on-surface">{c.name} <span className="text-on-surface-variant font-normal">({c.code})</span></div>
                      <div className="text-xs text-on-surface-variant">{c.status || ''}{c.availableBerths !== undefined ? `${c.status ? ', ' : ''}${c.availableBerths} available` : ''}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-on-surface">{formatINR(c.fare)}</div>
                      <button onClick={() => handleBook(t, c)} className="mt-1 px-3 py-1 rounded-md bg-primary-container hover:bg-primary text-on-primary-container text-xs font-bold">Book</button>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
