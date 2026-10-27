import React, { useState } from 'react';
import { PLACES, toCode } from '../data/places.js';
import { DESTINATIONS } from '../data/destinations.js';
import DestinationImage from '../components/DestinationImage.jsx';
import { todayLocal } from '../utils/date.js';

const TABS = [
  { id: 'flights', label: 'Flights', icon: 'flight' },
  { id: 'trains', label: 'Trains', icon: 'train' },
  { id: 'buses', label: 'Buses', icon: 'directions_bus' },
  { id: 'hotels', label: 'Hotels', icon: 'hotel' },
];

const POPULAR_ROUTES = [
  { mode: 'flights', from: 'Kolkata', to: 'Delhi' },
  { mode: 'flights', from: 'Mumbai', to: 'Bengaluru' },
  { mode: 'trains', from: 'Delhi', to: 'Jaipur' },
  { mode: 'trains', from: 'Mumbai', to: 'Goa' },
  { mode: 'trains', from: 'Kolkata', to: 'Patna' },
  { mode: 'buses', from: 'Agra', to: 'Jaipur' },
];

const STEPS = [
  { icon: 'search', title: 'Search', text: 'Enter where you are going and the date.' },
  { icon: 'badge', title: 'Add traveller details', text: 'Enter names as they appear on the traveller\'s ID.' },
  { icon: 'payments', title: 'Pay with Razorpay', text: 'Use any method Razorpay offers at checkout.' },
  { icon: 'confirmation_number', title: 'Get your ticket', text: 'Your booking and ticket stay in My Bookings.' },
];

function buildParams(mode, from, to, date) {
  if (mode === 'flights') return { origin: toCode(from, 'air'), destination: toCode(to, 'air'), date };
  if (mode === 'trains') return { origin: toCode(from, 'rail'), destination: toCode(to, 'rail'), date };
  if (mode === 'buses') return { origin: from.trim(), destination: to.trim(), date };
  return { city: to.trim() };
}

export default function LandingPage({ onSearch }) {
  const [mode, setMode] = useState('flights');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(todayLocal());

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(mode, buildParams(mode, from, to, date));
  };

  const inputClass =
    'w-full bg-surface-container-high px-3 py-2.5 rounded-md text-on-surface text-sm border border-outline-variant/40 focus:outline-none focus:border-primary';
  const labelClass = 'text-xs text-on-surface-variant font-semibold block mb-1';

  return (
    <div className="flex flex-col w-full">
      <datalist id="indian-cities">
        {PLACES.map((p) => <option key={p.city} value={p.city} />)}
      </datalist>

      {/* Hero */}
      <section className="w-full bg-surface-container-lowest border-b border-surface-container-high">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 flex flex-col gap-4">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-on-surface leading-tight">
              Book flights, trains, buses and hotels across India
            </h1>
            <p className="text-base text-on-surface-variant leading-relaxed max-w-xl">
              Search all four in one place, compare fares, and pay through Razorpay using UPI, cards, net banking or wallets where available.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-6 p-5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-1 p-1 rounded-md bg-surface-container-high" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === t.id}
                  onClick={() => setMode(t.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded text-sm ${
                    mode === t.id ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            {mode === 'hotels' ? (
              <div>
                <label htmlFor="s-city" className={labelClass}>City</label>
                <input id="s-city" list="indian-cities" value={to} onChange={(e) => setTo(e.target.value)} placeholder="For example Jaipur" className={inputClass} required />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="s-from" className={labelClass}>From</label>
                  <input id="s-from" list="indian-cities" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Kolkata" className={inputClass} required />
                </div>
                <div>
                  <label htmlFor="s-to" className={labelClass}>To</label>
                  <input id="s-to" list="indian-cities" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Delhi" className={inputClass} required />
                </div>
                <div>
                  <label htmlFor="s-date" className={labelClass}>Date</label>
                  <input id="s-date" type="date" min={todayLocal()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
                </div>
              </div>
            )}

            <button type="submit" className="w-full py-3 rounded-md bg-primary-container hover:bg-primary text-on-primary-container font-bold text-sm">
              Search {TABS.find((t) => t.id === mode).label.toLowerCase()}
            </button>
          </form>
        </div>
      </section>

      {/* Popular routes */}
      <section className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-10 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-on-surface">Popular routes</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_ROUTES.map((r) => {
            const tab = TABS.find((t) => t.id === r.mode);
            return (
              <button
                key={`${r.mode}-${r.from}-${r.to}`}
                onClick={() => onSearch(r.mode, buildParams(r.mode, r.from, r.to, todayLocal()))}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-sm text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">{tab.icon}</span>
                <span>{r.from} to {r.to}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Destinations */}
      <section className="max-w-7xl mx-auto w-full px-4 lg:px-8 pb-12 flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Places to visit in India</h2>
          <p className="text-sm text-on-surface-variant mt-1">Pick a place to find stays or get there.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DESTINATIONS.filter((d) => d.photo).map((d) => (
            <article key={d.slug} className="rounded-lg overflow-hidden bg-surface-container-low border border-surface-container-high flex flex-col">
              <DestinationImage slug={d.slug} name={`${d.name}, ${d.state}`} label={d.state} className="w-full h-44" />
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{d.name}</h3>
                  <p className="text-xs text-on-surface-variant">{d.state}</p>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed flex-1">{d.text}</p>
                <p className="text-xs text-on-surface-variant"><span className="font-semibold text-on-surface">Best time: </span>{d.best}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onSearch('hotels', { city: d.hotelCity || d.name })}
                    className="flex-1 py-2 rounded-md bg-surface-variant hover:bg-surface-container-highest text-on-surface text-sm font-semibold"
                  >
                    Find hotels
                  </button>
                  {d.air && (
                    <button
                      onClick={() => onSearch('flights', { destination: d.air, date: todayLocal() })}
                      className="flex-1 py-2 rounded-md bg-primary-container hover:bg-primary text-on-primary-container text-sm font-semibold"
                    >
                      Find flights
                    </button>
                  )}
                </div>
                {d.credit && <p className="text-[11px] text-on-surface-variant">Photo: {d.credit}, Unsplash</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full bg-surface-container-lowest border-t border-surface-container-high">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-on-surface">How booking works</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-2 p-4 rounded-lg bg-surface-container-low border border-surface-container-high">
                <span className="material-symbols-outlined text-primary text-[24px]">{s.icon}</span>
                <h3 className="text-sm font-bold text-on-surface">{i + 1}. {s.title}</h3>
                <p className="text-sm text-on-surface-variant">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
