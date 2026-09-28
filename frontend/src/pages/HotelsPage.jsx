import React, { useState, useEffect } from 'react';
import { searchApi } from '../api.js';

export default function HotelsPage({ onProceedToCheckout }) {
  const [city, setCity] = useState('');
  const [minRating, setMinRating] = useState(4.5);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nights, setNights] = useState(4);

  useEffect(() => {
    fetchHotels();
  }, [city, minRating, maxPrice]);

  async function fetchHotels() {
    setLoading(true);
    try {
      const res = await searchApi.searchHotels({ city, minRating, maxPrice });
      if (res.success && res.data) {
        setHotels(res.data);
      }
    } catch (err) {
      console.error('Failed to search hotels:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleBookHotel = (hotel) => {
    const total = hotel.pricePerNight * nights;
    const base = total;
    const tax = 0;

    onProceedToCheckout?.({
      category: 'HOTEL',
      vendorItemId: hotel.id,
      itemDetails: {
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        roomType: hotel.roomType,
                durationNights: nights
      },
      passengers: [{}],
      pricing: {
        baseFare: base,
        tax: tax,
        platformFee: 0,
        discount: 0,
        totalAmount: total,
        currency: 'INR'
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-tertiary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">hotel</span>
            Curated Global Sanctuaries
          </div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-1">
            Luxury Stays & Heritage Sanctuaries
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Private pool villas in Bali, heritage palaces in Rajasthan, and mist estate pavilions in Kerala.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-surface-container-high">
          <span className="material-symbols-outlined text-[18px] text-tertiary">diamond</span>
          <span className="font-label-sm text-xs text-on-surface font-semibold">5-Star Verified Properties</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl border border-surface-container-high/60 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Destination City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-sm border border-surface-container-high focus:outline-none"
            placeholder="Bali, Munnar, Jaipur..."
          />
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Stay Duration</label>
          <select
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-xs border border-surface-container-high focus:outline-none"
          >
            <option value="2">2 Nights Getaway</option>
            <option value="3">3 Nights Retreat</option>
            <option value="4">4 Nights Sanctuary</option>
            <option value="7">7 Nights Grand Tour</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Max Nightly Rate: ₹{maxPrice}</label>
          <input
            type="range"
            min="5000"
            max="60000"
            step="2000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchHotels}
            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-title-md text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Refresh Stays</span>
          </button>
        </div>
      </div>

      {/* Grid of Luxury Stays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((h) => (
          <div
            key={h.id}
            className="group rounded-2xl overflow-hidden bg-surface-container-low shadow-xl border border-surface-container-high/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:border-primary/40"
          >
            {/* Image Thumbnail */}
            <div className="relative h-60 w-full overflow-hidden bg-surface-variant">
              <div
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url('${h.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-surface-dim/80 backdrop-blur-md text-tertiary font-label-sm text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">stars</span>
                {h.starRating} Star Luxury
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-dim/80 backdrop-blur-md text-white font-title-md text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-tertiary text-[14px]">star</span>
                {h.guestRating} ({h.reviewsCount})
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
              <div>
                <span className="font-label-sm text-[11px] text-secondary font-bold uppercase tracking-wider">
                  {h.city}, {h.country}
                </span>
                <h3 className="font-headline-sm text-xl font-bold text-white mt-1 group-hover:text-primary transition-colors">
                  {h.name}
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1">{h.roomType}</p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {h.amenities?.map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-surface-container-high/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant block">For {nights} Nights:</span>
                  <div className="font-headline-sm text-xl font-bold text-tertiary">
                    ₹{h.pricePerNight * nights}
                  </div>
                  <span className="text-[10px] text-secondary">₹{h.pricePerNight} / night</span>
                </div>

                <button
                  onClick={() => handleBookHotel(h)}
                  className="py-2.5 px-5 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-title-md text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Reserve Villa</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
