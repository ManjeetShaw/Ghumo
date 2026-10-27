import React, { useState, useEffect } from 'react';
import { tripApi } from '../api.js';
import { addDaysLocal, formatDate, formatINR } from '../utils/date.js';
import { inputClass, labelClass, primaryButton, secondaryButton, ErrorNote, EmptyNote, PageHeader } from '../components/ui.jsx';

const ITEM_TYPES = [
  { value: 'ACTIVITY', label: 'Activity or sightseeing', icon: 'local_activity' },
  { value: 'RESTAURANT', label: 'Food', icon: 'restaurant' },
  { value: 'CUSTOM', label: 'Transport or other', icon: 'commute' },
];
const TYPE_ICONS = { FLIGHT: 'flight', TRAIN: 'train', BUS: 'directions_bus', HOTEL: 'hotel', ACTIVITY: 'local_activity', RESTAURANT: 'restaurant', CUSTOM: 'commute' };

const STATUS_LABELS = { DRAFT: 'Draft', PLANNED: 'Planned', ACTIVE: 'Ongoing', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

export default function TripDashboardPage({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStart, setNewStart] = useState(addDaysLocal(14));
  const [newEnd, setNewEnd] = useState(addDaysLocal(18));
  const [newBudget, setNewBudget] = useState('');
  const [newCity, setNewCity] = useState('');

  const [showNewItem, setShowNewItem] = useState(false);
  const [itemType, setItemType] = useState('ACTIVITY');
  const [itemTitle, setItemTitle] = useState('');
  const [itemDate, setItemDate] = useState(addDaysLocal(14));
  const [itemTime, setItemTime] = useState('10:00');
  const [itemCost, setItemCost] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [formError, setFormError] = useState('');

  const selectedTrip = trips.find((t) => t._id === selectedId) || null;

  useEffect(() => {
    let cancelled = false;
    tripApi
      .getTrips()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setTrips(res.data);
          if (res.data.length > 0) setSelectedId(res.data[0]._id);
        } else {
          setError(res.error?.message || 'Could not load your trips.');
        }
      })
      .catch(() => !cancelled && setError('Could not load your trips.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const replaceTrip = (updated) => setTrips((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await tripApi.createTrip({
        title: newTitle.trim(),
        description: newDesc.trim(),
        startDate: newStart,
        endDate: newEnd,
        destinations: newCity.trim() ? [{ city: newCity.trim(), country: 'India' }] : [],
        budget: { totalBudget: Number(newBudget) || 0, currency: 'INR' },
      });
      if (res.success && res.data) {
        setTrips((prev) => [res.data, ...prev]);
        setSelectedId(res.data._id);
        setShowNewTrip(false);
        setNewTitle('');
        setNewDesc('');
        setNewCity('');
        setNewBudget('');
      } else {
        setFormError(res.error?.message || 'Could not create the trip.');
      }
    } catch (err) {
      setFormError('Could not create the trip. Please try again.');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;
    setFormError('');
    try {
      const res = await tripApi.addItineraryItem(selectedTrip._id, {
        type: itemType,
        title: itemTitle.trim(),
        date: itemDate,
        startTime: itemTime,
        estimatedCost: Number(itemCost) || 0,
        notes: itemNotes.trim(),
      });
      if (res.success && res.trip) {
        replaceTrip(res.trip);
        setShowNewItem(false);
        setItemTitle('');
        setItemNotes('');
        setItemCost('');
      } else {
        setFormError(res.error?.message || 'Could not add the item.');
      }
    } catch (err) {
      setFormError('Could not add the item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!selectedTrip) return;
    try {
      const res = await tripApi.deleteItineraryItem(selectedTrip._id, itemId);
      if (res.success && res.data?.trip) replaceTrip(res.data.trip);
      else setError(res.error?.message || 'Could not delete the item.');
    } catch (err) {
      setError('Could not delete the item.');
    }
  };

  const modalShell = 'fixed inset-0 z-[60] flex items-center justify-center p-4 bg-surface-dim/80';
  const modalCard = 'w-full max-w-md bg-surface-container-low p-6 rounded-lg border border-surface-container-high flex flex-col gap-4 max-h-[90vh] overflow-y-auto';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="My trips" subtitle="Plan each day and keep track of what it will cost." />
        <div className="flex gap-2">
          <button onClick={() => onNavigate('ai-planner')} className={secondaryButton}>Use trip planner</button>
          <button onClick={() => { setFormError(''); setShowNewTrip(true); }} className={primaryButton}>New trip</button>
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {loading ? (
        <p className="py-12 text-center text-sm text-on-surface-variant" role="status">Loading your trips</p>
      ) : trips.length === 0 ? (
        <EmptyNote title="No trips yet">Create a trip, or let the trip planner draft one for a city you pick.</EmptyNote>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <ul className="lg:col-span-4 flex flex-col gap-3">
            {trips.map((t) => {
              const planned = t.budget?.allocated || 0;
              const total = t.budget?.totalBudget || 0;
              const pct = total > 0 ? Math.min(100, Math.round((planned / total) * 100)) : 0;
              return (
                <li key={t._id}>
                  <button
                    onClick={() => setSelectedId(t._id)}
                    className={`w-full p-4 rounded-lg border text-left flex flex-col gap-2 ${
                      selectedId === t._id ? 'bg-surface-container border-primary' : 'bg-surface-container-low border-surface-container-high hover:bg-surface-container'
                    }`}
                  >
                    <span className="text-xs text-on-surface-variant">
                      {t.destinations?.map((d) => d.city).join(', ') || 'No destination'}{t.startDate ? `, ${formatDate(t.startDate)}` : ''}
                    </span>
                    <span className="text-base font-bold text-on-surface">{t.title}</span>
                    {total > 0 && (
                      <span className="flex flex-col gap-1">
                        <span className="flex justify-between text-xs text-on-surface-variant">
                          <span>Planned cost</span><span>{formatINR(planned)} of {formatINR(total)}</span>
                        </span>
                        <span className="w-full h-1.5 rounded bg-surface-variant overflow-hidden">
                          <span className="block h-full bg-tertiary" style={{ width: `${pct}%` }} />
                        </span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <section className="lg:col-span-8 p-5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-5">
            {selectedTrip && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-surface-container-high pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-on-surface">{selectedTrip.title}</h2>
                      <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant text-[11px] font-semibold">{STATUS_LABELS[selectedTrip.status] || selectedTrip.status}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {[selectedTrip.description, selectedTrip.startDate && `${formatDate(selectedTrip.startDate)} to ${formatDate(selectedTrip.endDate)}`].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <button onClick={() => { setFormError(''); setShowNewItem(true); }} className={secondaryButton}>Add item</button>
                </div>

                {(selectedTrip.itinerary || []).length === 0 ? (
                  <p className="py-10 text-center text-sm text-on-surface-variant">This trip has no items yet.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {selectedTrip.itinerary.map((item) => (
                      <li key={item._id} className="p-4 rounded-md bg-surface-container-high/50 border border-surface-container-high flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-md bg-surface-variant flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-[20px]">{TYPE_ICONS[item.type] || 'event'}</span>
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs text-on-surface-variant">{[item.date && formatDate(item.date), item.startTime].filter(Boolean).join(', ')}</div>
                            <div className="text-sm font-bold text-on-surface">{item.title}</div>
                            {item.notes && <div className="text-xs text-on-surface-variant mt-0.5">{item.notes}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-bold text-on-surface">{formatINR(item.estimatedCost || 0)}</span>
                          <button onClick={() => handleDeleteItem(item._id)} className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error/10" aria-label={`Delete ${item.title}`}>
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {showNewTrip && (
        <div className={modalShell} role="dialog" aria-modal="true" aria-label="New trip">
          <form onSubmit={handleCreateTrip} className={modalCard}>
            <h2 className="text-lg font-bold text-on-surface">New trip</h2>
            <ErrorNote>{formError}</ErrorNote>
            <div><label htmlFor="n-title" className={labelClass}>Title</label><input id="n-title" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="For example Rajasthan in winter" className={inputClass} /></div>
            <div><label htmlFor="n-desc" className={labelClass}>Description (optional)</label><input id="n-desc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="n-start" className={labelClass}>Start date</label><input id="n-start" type="date" required value={newStart} onChange={(e) => setNewStart(e.target.value)} className={inputClass} /></div>
              <div><label htmlFor="n-end" className={labelClass}>End date</label><input id="n-end" type="date" required min={newStart} value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="n-city" className={labelClass}>Main city</label><input id="n-city" value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Jaipur" className={inputClass} /></div>
              <div><label htmlFor="n-budget" className={labelClass}>Budget (₹)</label><input id="n-budget" type="number" min="0" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className={inputClass} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
              <button type="button" onClick={() => setShowNewTrip(false)} className={secondaryButton}>Cancel</button>
              <button type="submit" className={primaryButton}>Create trip</button>
            </div>
          </form>
        </div>
      )}

      {showNewItem && (
        <div className={modalShell} role="dialog" aria-modal="true" aria-label="Add item">
          <form onSubmit={handleAddItem} className={modalCard}>
            <h2 className="text-lg font-bold text-on-surface">Add item</h2>
            <ErrorNote>{formError}</ErrorNote>
            <div>
              <label htmlFor="i-type" className={labelClass}>Type</label>
              <select id="i-type" value={itemType} onChange={(e) => setItemType(e.target.value)} className={inputClass}>
                {ITEM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div><label htmlFor="i-title" className={labelClass}>Title</label><input id="i-title" required value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="For example Amber Fort visit" className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="i-date" className={labelClass}>Date</label><input id="i-date" type="date" required value={itemDate} onChange={(e) => setItemDate(e.target.value)} className={inputClass} /></div>
              <div><label htmlFor="i-time" className={labelClass}>Start time</label><input id="i-time" type="time" value={itemTime} onChange={(e) => setItemTime(e.target.value)} className={inputClass} /></div>
            </div>
            <div><label htmlFor="i-cost" className={labelClass}>Estimated cost (₹)</label><input id="i-cost" type="number" min="0" value={itemCost} onChange={(e) => setItemCost(e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="i-notes" className={labelClass}>Notes (optional)</label><input id="i-notes" value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} className={inputClass} /></div>
            <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
              <button type="button" onClick={() => setShowNewItem(false)} className={secondaryButton}>Cancel</button>
              <button type="submit" className={primaryButton}>Add item</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
