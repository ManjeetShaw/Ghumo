import React, { useState, useEffect } from 'react';
import { searchApi } from '../api.js';
import { PLACES } from '../data/places.js';
import { formatINR } from '../utils/date.js';
import { inputClass, labelClass, primaryButton, PageHeader, ErrorNote, EmptyNote, Loading, FareNote } from '../components/ui.jsx';

function HotelImage({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className="w-full md:w-56 h-40 md:h-auto bg-surface-container-high shrink-0" role="img" aria-label={name} />;
  }
  return <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className="w-full md:w-56 h-40 md:h-auto object-cover shrink-0" />;
}

export default function HotelsPage({ initial, onProceedToCheckout }) {
  const [city, setCity] = useState(initial?.city || 'Delhi');
  const [nights, setNights] = useState(2);
  const [maxPrice, setMaxPrice] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runSearch() {
    setLoading(true);
    setError('');
    try {
      const res = await searchApi.searchHotels({ city: city.trim() });
      if (res.success) setHotels(res.data || []);
      else setError(res.error?.message || 'Could not search hotels.');
    } catch (err) {
      setError('Could not search hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = hotels
    .filter((h) => !maxPrice || (h.pricePerNight || 0) <= Number(maxPrice))
    .sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));

  const handleBook = (hotel, room) => {
    onProceedToCheckout?.({
      category: 'HOTEL',
      vendorItemId: hotel.id,
      itemDetails: {
        name: hotel.name,
        city: hotel.city,
        roomType: room.name,
        durationNights: nights,
      },
      passengers: [{}],
      pricing: { baseFare: room.farePerNight * nights, currency: 'INR' },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader title="Hotels" subtitle="Find a place to stay in an Indian city." />
      <datalist id="hotel-cities">{PLACES.map((p) => <option key={p.city} value={p.city} />)}</datalist>

      <form
        onSubmit={(e) => { e.preventDefault(); runSearch(); }}
        className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label htmlFor="h-city" className={labelClass}>City</label>
          <input id="h-city" list="hotel-cities" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="h-nights" className={labelClass}>Nights</label>
          <select id="h-nights" value={nights} onChange={(e) => setNights(Number(e.target.value))} className={inputClass}>
            {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="h-max" className={labelClass}>Max per night (₹)</label>
          <input id="h-max" type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="No limit" className={inputClass} />
        </div>
        <button type="submit" disabled={loading} className={primaryButton}>Search</button>
      </form>

      <FareNote />
      <ErrorNote>{error}</ErrorNote>

      {loading ? (
        <Loading />
      ) : visible.length === 0 && !error ? (
        <EmptyNote title="No hotels found">Try another city or remove the price limit.</EmptyNote>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((h) => (
            <li key={h.id} className="rounded-lg overflow-hidden bg-surface-container-low border border-surface-container-high flex flex-col md:flex-row">
              <HotelImage src={h.image} name={h.name} />
              <div className="p-5 flex-1 flex flex-col gap-3 min-w-0">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">{h.name}</h2>
                  <p className="text-sm text-on-surface-variant">{[h.address, h.city].filter(Boolean).join(', ')}</p>
                </div>
                {h.amenities?.length > 0 && (
                  <p className="text-xs text-on-surface-variant">{h.amenities.slice(0, 6).join(' · ')}</p>
                )}
                <ul className="flex flex-col gap-2">
                  {(h.roomTypes || []).map((room) => (
                    <li key={room.name} className="p-3 rounded-md bg-surface-container-high/60 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-on-surface">{room.name}</div>
                        <div className="text-xs text-on-surface-variant">{formatINR(room.farePerNight)} per night, {formatINR(room.farePerNight * nights)} for {nights} night{nights > 1 ? 's' : ''}</div>
                      </div>
                      <button onClick={() => handleBook(h, room)} className="px-3 py-1.5 rounded-md bg-primary-container hover:bg-primary text-on-primary-container text-xs font-bold shrink-0">Book</button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
