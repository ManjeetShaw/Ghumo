import React, { useState } from 'react';
import { bookingApi } from '../api.js';
import { canCancel, describeBooking, isCancelled, statusLabel, statusTone } from '../utils/bookingStatus.js';
import { formatDate, formatINR, formatTime } from '../utils/date.js';

function Row({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="text-on-surface font-semibold text-right">{value}</dd>
    </div>
  );
}

export default function TicketConfirmationPage({ booking, onBackToBookings }) {
  const [current, setCurrent] = useState(booking);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  if (!current) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-sm text-on-surface-variant">
        No booking selected.{' '}
        <button onClick={onBackToBookings} className="text-primary underline">Go to My bookings</button>
      </div>
    );
  }

  const info = describeBooking(current);
  const d = current.itemDetails || {};
  const p = current.pricing || {};
  const cancelled = isCancelled(current.status);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking? Refund eligibility depends on the provider\'s cancellation rules.')) return;
    setCancelling(true);
    setMessage(null);
    try {
      const res = await bookingApi.cancelBooking(current._id, 'Cancelled by customer');
      if (res.success && res.data) {
        setCurrent(res.data);
        setMessage({ type: 'ok', text: 'Your cancellation was recorded. Refund status will show here and in My bookings.' });
      } else {
        setMessage({ type: 'error', text: res.error?.message || 'Could not cancel this booking.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not cancel this booking. Please try again.' });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <button onClick={onBackToBookings} className="flex items-center gap-1 text-sm text-primary font-semibold">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          My bookings
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-surface-variant hover:bg-surface-container-highest text-on-surface text-sm font-semibold">
          <span className="material-symbols-outlined text-[18px]">print</span>
          Print
        </button>
      </div>

      {message && (
        <div role="status" className={`p-3 rounded-md text-sm ${message.type === 'ok' ? 'bg-secondary-container text-secondary' : 'bg-error/20 border border-error/40 text-error'}`}>
          {message.text}
        </div>
      )}

      <section className="rounded-lg bg-surface-container-low border border-surface-container-high overflow-hidden">
        <div className="p-6 flex items-start justify-between gap-4 border-b border-dashed border-outline-variant/50 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-md bg-surface-variant flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">{info.icon}</span>
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-on-surface">{info.title}</h1>
              <p className="text-sm text-on-surface-variant">{info.route}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-on-surface-variant block">Booking reference</span>
            <span className="font-mono text-lg font-bold text-tertiary tracking-wider">{current.bookingReference}</span>
            <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${statusTone(current.status)}`}>{statusLabel(current.status)}</span>
          </div>
        </div>

        <dl className="p-6 flex flex-col gap-2.5">
          <Row label="Departure" value={d.departureTime ? `${formatDate(d.departureTime)}, ${formatTime(d.departureTime)}` : ''} />
          <Row label="Arrival" value={d.arrivalTime ? `${formatDate(d.arrivalTime)}, ${formatTime(d.arrivalTime)}` : ''} />
          <Row label="Class or coach" value={d.cabinClass || d.coach || d.roomType || d.busType} />
          <Row label="Provider reference (PNR)" value={current.providerBookingRef} />
        </dl>

        <div className="px-6 pb-6">
          <h2 className="text-sm font-bold text-on-surface mb-2">Travellers</h2>
          <ul className="flex flex-col gap-1.5">
            {(current.passengers || []).map((pax, i) => (
              <li key={i} className="flex items-center justify-between text-sm p-3 rounded-md bg-surface-container-high/60">
                <span className="text-on-surface font-semibold">{pax.name || 'Traveller'}{pax.age ? `, ${pax.age}` : ''}</span>
                <span className="text-on-surface-variant font-mono">{pax.seatNumber ? `Seat ${pax.seatNumber}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 pb-6">
          <h2 className="text-sm font-bold text-on-surface mb-2">Fare</h2>
          <dl className="flex flex-col gap-1.5">
            <Row label="Base fare" value={formatINR(p.baseFare)} />
            <Row label="Taxes" value={formatINR(p.taxes ?? p.tax)} />
            <Row label="Service fee" value={formatINR(p.serviceFee ?? p.platformFee)} />
            {(p.discountAmount ?? p.discount) > 0 && <Row label="Discount" value={`-${formatINR(p.discountAmount ?? p.discount)}`} />}
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-surface-container-high text-base">
              <dt className="font-bold text-on-surface">Total</dt>
              <dd className="font-extrabold text-on-surface">{formatINR(p.totalAmount)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {canCancel(current.status) && !cancelled && (
        <div className="print:hidden">
          <button onClick={handleCancel} disabled={cancelling} className="px-5 py-2.5 rounded-md border border-error/50 text-error hover:bg-error/10 text-sm font-semibold disabled:opacity-60">
            {cancelling ? 'Cancelling' : 'Cancel booking'}
          </button>
        </div>
      )}
    </div>
  );
}
