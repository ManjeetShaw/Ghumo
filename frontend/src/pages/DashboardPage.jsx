import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingApi } from '../api.js';
import { describeBooking, statusLabel, statusTone } from '../utils/bookingStatus.js';
import { formatINR } from '../utils/date.js';

const SEATS = [
  { value: 'window', label: 'Window' },
  { value: 'aisle', label: 'Aisle' },
  { value: 'no_preference', label: 'No preference' },
];
const MEALS = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non_veg', label: 'Non vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'no_preference', label: 'No preference' },
];
const BUDGETS = [
  { value: 'economy', label: 'Economy' },
  { value: 'mid_range', label: 'Mid range' },
  { value: 'luxury', label: 'Premium' },
];

function Choice({ options, value, onChange, name }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`px-3.5 py-2 rounded-md text-sm border ${
            value === o.value
              ? 'bg-primary-container/20 border-primary text-primary font-semibold'
              : 'bg-surface-container-high border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage({ onNavigate, onSelectBooking }) {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [seatPref, setSeatPref] = useState(user?.preferences?.seatPreference || 'no_preference');
  const [mealPref, setMealPref] = useState(user?.preferences?.mealPreference || 'no_preference');
  const [budgetPref, setBudgetPref] = useState(user?.preferences?.budgetPreference || 'mid_range');
  const [passportNum, setPassportNum] = useState(user?.passportDetails?.passportNumber || '');
  const [passportCountry, setPassportCountry] = useState(user?.passportDetails?.issuingCountry || '');
  const [passportExpiry, setPassportExpiry] = useState(
    user?.passportDetails?.expiryDate ? String(user.passportDetails.expiryDate).slice(0, 10) : ''
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    let cancelled = false;
    bookingApi
      .getBookings({ limit: 5 })
      .then((res) => {
        if (!cancelled && res.success && res.data) setRecentBookings(res.data);
      })
      .catch((err) => console.error('Failed to load bookings:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const passportDetails = { passportNumber: passportNum.trim(), issuingCountry: passportCountry.trim() };
    if (passportExpiry) passportDetails.expiryDate = passportExpiry;

    const res = await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      // The whole preferences object is replaced on save, so currency and language are sent as well.
      preferences: {
        seatPreference: seatPref,
        mealPreference: mealPref,
        budgetPreference: budgetPref,
        currency: 'INR',
        language: 'en',
      },
      passportDetails,
    });
    setSaving(false);
    setMessage(res.success ? { type: 'ok', text: 'Your details were saved.' } : { type: 'error', text: res.error || 'Could not save your details.' });
  };

  const handleSignOut = () => {
    logout();
    onNavigate('landing');
  };

  const inputClass =
    'w-full bg-surface-container-high px-3 py-2.5 rounded-md text-on-surface text-sm border border-outline-variant/40 focus:outline-none focus:border-primary';
  const labelClass = 'text-xs text-on-surface-variant font-semibold block mb-1';
  const card = 'p-5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-4';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface">Your account</h1>
          <p className="text-sm text-on-surface-variant mt-1">{user?.email}</p>
        </div>
        <button onClick={handleSignOut} className="px-4 py-2 rounded-md bg-surface-variant hover:bg-surface-container-highest text-on-surface text-sm font-semibold">
          Sign out
        </button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <section className={card}>
          <h2 className="text-base font-bold text-on-surface">Personal details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="d-name" className={labelClass}>Full name</label>
              <input id="d-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="d-phone" className={labelClass}>Mobile number</label>
              <input id="d-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" className={inputClass} />
            </div>
          </div>
        </section>

        <section className={card}>
          <h2 className="text-base font-bold text-on-surface">Travel preferences</h2>
          <div className="flex flex-col gap-4">
            <div>
              <span className={labelClass}>Seat</span>
              <Choice name="Seat preference" options={SEATS} value={seatPref} onChange={setSeatPref} />
            </div>
            <div>
              <span className={labelClass}>Meal</span>
              <Choice name="Meal preference" options={MEALS} value={mealPref} onChange={setMealPref} />
            </div>
            <div>
              <span className={labelClass}>Budget</span>
              <Choice name="Budget preference" options={BUDGETS} value={budgetPref} onChange={setBudgetPref} />
            </div>
          </div>
        </section>

        <section className={card}>
          <div>
            <h2 className="text-base font-bold text-on-surface">Passport (optional)</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              You do not need a passport for travel within India. Save it only if you want it pre-filled on bookings.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="d-pn" className={labelClass}>Passport number</label>
              <input id="d-pn" value={passportNum} onChange={(e) => setPassportNum(e.target.value)} autoComplete="off" className={inputClass} />
            </div>
            <div>
              <label htmlFor="d-pc" className={labelClass}>Issuing country</label>
              <input id="d-pc" value={passportCountry} onChange={(e) => setPassportCountry(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="d-pe" className={labelClass}>Expiry date</label>
              <input id="d-pe" type="date" value={passportExpiry} onChange={(e) => setPassportExpiry(e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4 flex-wrap">
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-md bg-primary-container hover:bg-primary text-on-primary-container font-bold text-sm disabled:opacity-60">
            {saving ? 'Saving' : 'Save changes'}
          </button>
          {message && (
            <span role="status" className={`text-sm font-semibold ${message.type === 'ok' ? 'text-secondary' : 'text-error'}`}>
              {message.text}
            </span>
          )}
        </div>
      </form>

      <section className={card}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-on-surface">Recent bookings</h2>
          <button onClick={() => onNavigate('bookings')} className="text-sm text-primary font-semibold">View all</button>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-sm text-on-surface-variant">You have no bookings yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-surface-container-high">
            {recentBookings.map((b) => {
              const info = describeBooking(b);
              return (
                <li key={b._id}>
                  <button onClick={() => onSelectBooking(b._id)} className="w-full flex items-center justify-between gap-4 py-3 text-left">
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-primary">{info.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-on-surface truncate">{info.title}</span>
                        <span className="block text-xs text-on-surface-variant truncate">{b.bookingReference} · {info.route}</span>
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-on-surface">{formatINR(b.pricing?.totalAmount)}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${statusTone(b.status)}`}>{statusLabel(b.status)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
