import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api.js';

export default function MyBookingsPage({ onSelectBooking, onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await bookingApi.getBookings({ status: filterStatus });
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            Voyage Manifest Archive
          </div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-1">
            My Bookings & Digital Boarding Passes
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Access verified boarding passes, e-tickets, and live journey manifests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['', 'CONFIRMED', 'INITIATED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {st || 'All Bookings'}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant gap-3">
            <span className="material-symbols-outlined text-[32px] animate-spin text-primary">sync</span>
            <span className="text-xs">Loading booking manifests...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 rounded-2xl bg-surface-container-low border border-surface-container-high text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">confirmation_number</span>
            <h3 className="font-headline-sm text-lg font-bold text-white">No Bookings Found</h3>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-sm">
              You haven't initiated any voyages under this filter. Explore our curated destinations to book your next trip.
            </p>
            <button
              onClick={() => onNavigate?.('landing')}
              className="mt-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary-container font-bold text-xs cursor-pointer shadow-md"
            >
              Explore Destinations
            </button>
          </div>
        ) : (
          bookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div
                key={b._id}
                onClick={() => onSelectBooking?.(b._id)}
                className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-lg hover:border-primary/40 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isConfirmed ? 'bg-secondary-container text-secondary' : isCancelled ? 'bg-error/20 text-error' : 'bg-surface-variant text-tertiary'
                  }`}>
                    <span className="material-symbols-outlined text-[24px]">
                      {b.category === 'TRAIN' ? 'train' : b.category === 'BUS' ? 'directions_bus' : b.category === 'HOTEL' ? 'hotel' : 'flight'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-tertiary font-bold">{b.bookingReference}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isConfirmed ? 'bg-secondary-container text-secondary' : isCancelled ? 'bg-error/20 text-error' : 'bg-surface-variant text-primary'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <h3 className="font-title-md text-base font-bold text-white mt-1">
                      {b.itemDetails?.airline || b.itemDetails?.trainName || b.itemDetails?.operator || b.itemDetails?.name || 'Voyage Service'}
                    </h3>

                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      {b.itemDetails?.origin} → {b.itemDetails?.destination || b.itemDetails?.city} • Passenger: {b.passengers?.[0]?.name} (Seat {b.passengers?.[0]?.seatNumber})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-surface-container-high/40 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Fare Paid</span>
                    <span className="font-headline-sm text-lg font-bold text-white">
                      ₹{b.pricing?.totalAmount}
                    </span>
                  </div>

                  <button className="flex items-center gap-1 px-4 py-2 rounded-full bg-surface-variant hover:bg-surface-container-highest text-white text-xs font-bold transition-all border border-outline-variant/30">
                    <span>View Pass</span>
                    <span className="material-symbols-outlined text-[16px]">qr_code</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
