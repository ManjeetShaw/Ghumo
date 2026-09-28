import React, { useState, useEffect } from 'react';
import { tripApi } from '../api.js';

export default function TripDashboardPage({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // New Trip modal state
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStart, setNewStart] = useState('2026-11-10');
  const [newEnd, setNewEnd] = useState('2026-11-15');
  const [newBudget, setNewBudget] = useState(45000);
  const [newCity, setNewCity] = useState('Jaipur');

  // New Itinerary Item modal state
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [itemType, setItemType] = useState('ACTIVITY');
  const [itemTitle, setItemTitle] = useState('');
  const [itemDate, setItemDate] = useState('2026-11-11');
  const [itemTime, setItemTime] = useState('10:00 AM');
  const [itemCost, setItemCost] = useState(1500);
  const [itemNotes, setItemNotes] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    setLoading(true);
    try {
      const res = await tripApi.getTrips();
      if (res.success && res.data) {
        setTrips(res.data);
        if (res.data.length > 0 && !selectedTrip) {
          setSelectedTrip(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      const res = await tripApi.createTrip({
        title: newTitle,
        description: newDesc,
        startDate: newStart,
        endDate: newEnd,
        destinations: [{ city: newCity, country: 'India' }],
        budget: { totalBudget: Number(newBudget), spent: 0, currency: 'INR' }
      });
      if (res.success && res.data) {
        setTrips(prev => [res.data, ...prev]);
        setSelectedTrip(res.data);
        setShowNewTripModal(false);
        setNewTitle('');
        setNewDesc('');
      }
    } catch (err) {
      console.error('Create trip error:', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;
    try {
      const res = await tripApi.addItineraryItem(selectedTrip._id, {
        type: itemType,
        title: itemTitle,
        date: itemDate,
        startTime: itemTime,
        estimatedCost: Number(itemCost),
        notes: itemNotes
      });
      if (res.success && res.data) {
        const updatedItin = [...(selectedTrip.itinerary || []), res.data];
        const updatedTrip = {
          ...selectedTrip,
          itinerary: updatedItin,
          budget: {
            ...selectedTrip.budget,
            spent: (selectedTrip.budget.spent || 0) + Number(itemCost)
          }
        };
        setSelectedTrip(updatedTrip);
        setTrips(prev => prev.map(t => t._id === updatedTrip._id ? updatedTrip : t));
        setShowNewItemModal(false);
        setItemTitle('');
        setItemNotes('');
      }
    } catch (err) {
      console.error('Add item error:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!selectedTrip) return;
    try {
      await tripApi.deleteItineraryItem(selectedTrip._id, itemId);
      const updatedItin = selectedTrip.itinerary.filter(i => i._id !== itemId);
      const updatedTrip = {
        ...selectedTrip,
        itinerary: updatedItin
      };
      setSelectedTrip(updatedTrip);
      setTrips(prev => prev.map(t => t._id === updatedTrip._id ? updatedTrip : t));
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
            Autonomous Voyager Itinerary Vault
          </div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-1">
            Trip & Itinerary Management
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Synchronized timeline of activities, transport reservations, and budget tracking.
          </p>
        </div>

        <button
          onClick={() => setShowNewTripModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-container hover:bg-primary text-on-primary-container font-title-md text-xs font-bold shadow-lg transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Create New Trip</span>
        </button>
      </div>

      {/* Main Grid: Trips List (4 cols) & Selected Trip Itinerary (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Trips Cards */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="font-headline-sm text-lg font-bold text-white flex items-center justify-between">
            <span>Your Trips ({trips.length})</span>
            {loading && <span className="material-symbols-outlined text-primary animate-spin text-base">refresh</span>}
          </h2>

          {trips.map((t) => {
            const isSelected = selectedTrip?._id === t._id;
            const spent = t.budget?.spent || 0;
            const total = t.budget?.totalBudget || 45000;
            const pct = Math.min(100, Math.round((spent / total) * 100));

            return (
              <div
                key={t._id}
                onClick={() => setSelectedTrip(t)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                  isSelected
                    ? 'bg-surface-container/90 border-primary shadow-xl ring-1 ring-primary/40'
                    : 'bg-surface-container-low/70 border-surface-container-high hover:bg-surface-container/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[10px] text-tertiary font-bold uppercase tracking-wider">
                    {t.destinations?.map(d => d.city).join(', ') || 'Voyage'}
                  </span>
                  <span className="font-mono text-xs text-secondary">{t.startDate}</span>
                </div>

                <div>
                  <h3 className="font-title-md text-base font-bold text-white">{t.title}</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1 mt-0.5">{t.description}</p>
                </div>

                {/* Budget Tracker Progress */}
                <div className="pt-2 border-t border-surface-container-high/40 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>Budget Utilized:</span>
                    <span className="font-mono font-bold text-white">₹{spent} / ₹{total}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-tertiary to-primary-container rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Trip Itinerary Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {selectedTrip ? (
            <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xl flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-container-high/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-2xl font-bold text-white">{selectedTrip.title}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary text-[11px] font-bold">
                      Active
                    </span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                    {selectedTrip.description} • {selectedTrip.startDate} to {selectedTrip.endDate}
                  </p>
                </div>

                <button
                  onClick={() => setShowNewItemModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-variant hover:bg-surface-container-highest text-white text-xs font-bold transition-all cursor-pointer border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Add Itinerary Item</span>
                </button>
              </div>

              {/* Timeline Items */}
              <div className="flex flex-col gap-4">
                {selectedTrip.itinerary?.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline-variant mb-2">
                      event_note
                    </span>
                    <p className="font-body-md text-sm">No items in this itinerary yet.</p>
                    <p className="font-body-sm text-xs mt-1">Click "Add Itinerary Item" or ask the AI Concierge to generate plans.</p>
                  </div>
                ) : (
                  selectedTrip.itinerary?.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 rounded-xl bg-surface-container-high/50 border border-surface-container-high flex items-start justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[20px]">
                            {item.type === 'DINING' ? 'restaurant' : item.type === 'TRANSIT' ? 'commute' : 'local_activity'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-secondary font-bold">{item.startTime}</span>
                            <span className="text-outline-variant">•</span>
                            <span className="text-xs text-on-surface-variant">{item.date}</span>
                          </div>
                          <h4 className="font-title-md text-sm font-bold text-white mt-0.5">{item.title}</h4>
                          {item.notes && <p className="font-body-sm text-xs text-on-surface-variant mt-1">{item.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-mono font-bold text-sm text-tertiary">
                          ₹{item.estimatedCost}
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error/20 text-outline hover:text-error transition-all cursor-pointer"
                          title="Delete item"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-on-surface-variant">
              Select or create a trip to view its itinerary timeline.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Trip */}
      {showNewTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-dim/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-container-low p-6 rounded-2xl border border-surface-container-high shadow-2xl flex flex-col gap-4">
            <h3 className="font-headline-sm text-lg font-bold text-white">Create New Voyage</h3>
            <form onSubmit={handleCreateTrip} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-on-surface-variant block mb-1 font-bold">Trip Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Winter in Bali"
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-bold">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Rainforest sanctuaries & ocean diving"
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-on-surface-variant block mb-1 font-bold">Start Date</label>
                  <input
                    type="date"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1 font-bold">End Date</label>
                  <input
                    type="date"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-on-surface-variant block mb-1 font-bold">Primary City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1 font-bold">Budget (₹)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setShowNewTripModal(false)}
                  className="px-4 py-2 rounded-full bg-surface-variant text-on-surface text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container text-xs font-bold cursor-pointer"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Itinerary Item */}
      {showNewItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-dim/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-container-low p-6 rounded-2xl border border-surface-container-high shadow-2xl flex flex-col gap-4">
            <h3 className="font-headline-sm text-lg font-bold text-white">Add Itinerary Item</h3>
            <form onSubmit={handleAddItem} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-on-surface-variant block mb-1 font-bold">Item Type</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                >
                  <option value="ACTIVITY">Activity / Heritage Tour</option>
                  <option value="DINING">Dining & Culinary</option>
                  <option value="TRANSIT">Transit & Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-bold">Title</label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="e.g. Scuba diving in Nusa Penida"
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-on-surface-variant block mb-1 font-bold">Date</label>
                  <input
                    type="date"
                    value={itemDate}
                    onChange={(e) => setItemDate(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1 font-bold">Start Time</label>
                  <input
                    type="text"
                    value={itemTime}
                    onChange={(e) => setItemTime(e.target.value)}
                    className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-bold">Estimated Cost (₹)</label>
                <input
                  type="number"
                  value={itemCost}
                  onChange={(e) => setItemCost(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1 font-bold">Notes</label>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="e.g. Pre-book to avoid queue"
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="px-4 py-2 rounded-full bg-surface-variant text-on-surface text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container text-xs font-bold cursor-pointer"
                >
                  Add to Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
