import React, { useState } from 'react';
import { searchApi } from '../api.js';
import { PLACES, toCode } from '../data/places.js';
import { todayLocal, formatINR } from '../utils/date.js';
import { inputClass, labelClass, primaryButton, secondaryButton, PageHeader, ErrorNote, FareNote } from '../components/ui.jsx';

function minBy(list, pick) {
  const values = list.map(pick).filter((v) => Number.isFinite(v) && v > 0);
  return values.length ? Math.min(...values) : null;
}

function durationText(minutes) {
  if (!minutes) return 'Not available';
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function MultimodalComparePage({ onNavigate }) {
  const [from, setFrom] = useState('Delhi');
  const [to, setTo] = useState('Jaipur');
  const [date, setDate] = useState(todayLocal());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState(null);

  const handleCompare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const flightQ = { origin: toCode(from, 'air'), destination: toCode(to, 'air'), date };
    const trainQ = { origin: toCode(from, 'rail'), destination: toCode(to, 'rail'), date };
    const busQ = { origin: from.trim(), destination: to.trim(), date };
    try {
      const [f, t, b] = await Promise.all([
        searchApi.searchFlights(flightQ),
        searchApi.searchTrains(trainQ),
        searchApi.searchBuses(busQ),
      ]);
      const flights = f.success ? f.data : [];
      const trains = t.success ? t.data : [];
      const buses = b.success ? b.data : [];
      setRows([
        { mode: 'flights', label: 'Flight', icon: 'flight', count: flights.length, fare: minBy(flights, (x) => x.price.baseFare), minutes: minBy(flights, (x) => x.durationMinutes), query: flightQ },
        { mode: 'trains', label: 'Train', icon: 'train', count: trains.length, fare: minBy(trains.flatMap((x) => x.classes), (c) => c.fare), minutes: minBy(trains, (x) => x.durationMinutes), query: trainQ },
        { mode: 'buses', label: 'Bus', icon: 'directions_bus', count: buses.length, fare: minBy(buses, (x) => x.fare), minutes: minBy(buses, (x) => x.durationMinutes), query: busQ },
      ]);
      if (!f.success && !t.success && !b.success) setError('Could not load any results. Please try again.');
    } catch (err) {
      setError('Could not compare right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader title="Compare travel options" subtitle="See the lowest fare and shortest journey for each way of getting there." />
      <datalist id="compare-cities">{PLACES.map((p) => <option key={p.city} value={p.city} />)}</datalist>

      <form onSubmit={handleCompare} className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div><label htmlFor="m-from" className={labelClass}>From</label><input id="m-from" list="compare-cities" required value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="m-to" className={labelClass}>To</label><input id="m-to" list="compare-cities" required value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="m-date" className={labelClass}>Date</label><input id="m-date" type="date" min={todayLocal()} required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></div>
        <button type="submit" disabled={loading} className={primaryButton}>{loading ? 'Comparing' : 'Compare'}</button>
      </form>

      <FareNote />
      <ErrorNote>{error}</ErrorNote>

      {rows && (
        <div className="overflow-x-auto rounded-lg border border-surface-container-high">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-container-high text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-semibold">Mode</th>
                <th className="px-4 py-3 font-semibold">Options</th>
                <th className="px-4 py-3 font-semibold">Lowest base fare</th>
                <th className="px-4 py-3 font-semibold">Shortest journey</th>
                <th className="px-4 py-3"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className="bg-surface-container-low divide-y divide-surface-container-high">
              {rows.map((r) => (
                <tr key={r.mode}>
                  <td className="px-4 py-3 text-on-surface font-semibold"><span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">{r.icon}</span>{r.label}</span></td>
                  <td className="px-4 py-3 text-on-surface">{r.count}</td>
                  <td className="px-4 py-3 text-on-surface">{r.fare ? formatINR(r.fare) : 'Not available'}</td>
                  <td className="px-4 py-3 text-on-surface">{durationText(r.minutes)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onNavigate(r.mode, r.query)} className={secondaryButton} disabled={r.count === 0}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
