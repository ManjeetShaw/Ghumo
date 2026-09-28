import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingApi } from '../api.js';

export default function DashboardPage({ onNavigate, onSelectBooking }) {
  const { user, updateProfile, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState('preferences'); // 'preferences', 'documents', 'payments', 'loyalty'

  // Preferences state
  const [seatPref, setSeatPref] = useState(user?.preferences?.seatPreference || 'Window');
  const [mealPref, setMealPref] = useState(user?.preferences?.mealPreference || 'Vegetarian');
  const [budgetPref, setBudgetPref] = useState(user?.preferences?.budgetPreference || 'Luxury');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'INR');
  const [language, setLanguage] = useState(user?.preferences?.language || 'en');

  // Passport state
  const [passportNum, setPassportNum] = useState(user?.passportDetails?.passportNumber || '');
  const [passportCountry, setPassportCountry] = useState(user?.passportDetails?.issuingCountry || 'India');
  const [passportExpiry, setPassportExpiry] = useState(user?.passportDetails?.expiryDate || '2030-12-31');

  // Sync state
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Bookings list for carousel
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await bookingApi.getBookings();
        if (res.success && res.data) {
          setRecentBookings(res.data);
        }
      } catch (err) {
        console.error('Failed to load user bookings:', err);
      }
    }
    fetchBookings();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        preferences: {
          seatPreference: seatPref,
          mealPreference: mealPref,
          budgetPreference: budgetPref,
          currency,
          language
        },
        passportDetails: {
          passportNumber: passportNum,
          issuingCountry: passportCountry,
          expiryDate: passportExpiry
        }
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const scrollCarousel = (direction) => {
    const rail = document.getElementById('bookings-carousel-rail');
    if (rail) {
      rail.scrollBy({ left: 360 * direction, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col w-full relative -mt-20">
      {/* Immersive Hero Scrim Bleeding Under Translucent Header */}
      <div className="relative w-full overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7OJJxEL2ai1DcyvECyny2Z1bl89hFrFdnneCa4DwUom8Q9_a85ZDLed74hposCaS-iMiQFYk_DRRerD1CL2L_a2F2XLL_k-cWJC-Xpf4pxMsd1l3MGDMq5E6lhbI2Qjd7EHX3NhfP1x96IR-d4dTD2v_u41oK9_dvynLQ3DyKLz38H37kXT2RBiCS0TwdCvKakBb76JFjyoWfVDaubGGJFtiHCQO_NK1hlNyV9zbtHR0oxFt1mpwm')"
          }}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-dim/80 via-surface-dim/75 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-surface-dim/60 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 w-full px-6 lg:px-12 pt-32 pb-8 flex flex-col gap-6">
          {/* Top Breadcrumb & Status */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-xs">
              <button
                onClick={() => onNavigate?.('landing')}
                className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                Dashboard
              </button>
              <span className="text-outline-variant font-counter-display">/</span>
              <span className="text-secondary font-semibold">Voyager Identity & Engine Settings</span>
            </div>

            <div className="flex items-center gap-2 bg-surface-container-high/70 backdrop-blur-xl px-4 py-1.5 rounded-full shadow-md border border-surface-container-high">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-sm text-xs text-on-surface tracking-wider uppercase font-semibold">
                Foxico Cloud Sync: Active
              </span>
              <span className="font-counter-display text-xs text-tertiary font-bold">v2.4</span>
            </div>
          </div>

          {/* Identity Profile Card */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-low/75 backdrop-blur-2xl shadow-xl p-6 lg:p-8 border border-surface-container-high/60">
            {/* Ambient Radial Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -top-16 w-60 h-60 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Identity */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-xl bg-surface-variant border-2 border-primary/40">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzrMVEImN0HrmcGiTCzLpzxB_bDWwS0E-2MpQNIklTg2guq87NVEXczngCT1A7zClykQFxSaGOY7w2Ta5cP4k7QcdbX2MzCLCiZ8ivrlFSZJ0xAPzi0RILt54PQ79dFEHiBsD-GZy9PJFeOPGqYWlupDeVlIyGIYsUCawG6dF1Pa5c8tJ9xcFl2BGxghkK5-g9zT41x_iyMg-FJLl3FTUbOun8WQMwpJ3OKT9NaAQ6xQfYuAgXt5Wr"
                      alt={user?.name || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-on-primary shadow-lg hover:bg-primary-container transition-all cursor-pointer"
                    title="Update portrait"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-headline-lg text-3xl sm:text-4xl text-on-surface tracking-tight font-bold">
                      {user?.name || ""}
                    </h1>
                    <span className="font-title-md text-base text-secondary font-medium">(Anney)</span>
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-surface-variant text-tertiary font-label-sm text-xs shadow-sm border border-tertiary/20">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        stars
                      </span>
                      Explorer Elite
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-on-surface-variant font-body-md text-xs sm:text-sm mt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                      {user?.email || ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">phone_iphone</span>
                      {user?.phone || "+91 98765 43210"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-tertiary">calendar_month</span>
                      Member since Sep 2026
                    </span>
                  </div>

                  {/* API Indicator */}
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded bg-surface-container-lowest/80 text-on-surface-variant font-counter-display text-[10px] w-fit border border-surface-container-high">
                    <span className="text-secondary font-bold">AUTH</span>
                    <span className="text-outline-variant">GET /api/auth/me</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="text-on-surface">UID: {user?._id}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Workstation Container */}
      <div className="w-full px-6 lg:px-12 pb-16 flex flex-col gap-8">
        {/* Interactive Profile Sub-Navigation Bar */}
        <div className="w-full overflow-x-auto pb-2 -mt-2 no-scrollbar">
          <div className="flex items-center gap-2 min-w-max p-1.5 rounded-full bg-surface-container-low/90 backdrop-blur-xl shadow-lg border border-surface-container-high">
            {[
              { id: 'preferences', label: 'Personal Details & Preferences', icon: 'tune' },
              { id: 'documents', label: 'Passport & Documents', icon: 'badge' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-label-md text-xs transition-all cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-primary-container text-on-primary-container shadow-md font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Preferences & Passport Form */}
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 8 Cols */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Seat Arrangement */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl shadow-lg border border-surface-container-high/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">airline_seat_recline_extra</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-lg text-on-surface font-bold">Seat Arrangement</h3>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      Applied automatically across Flight 6E & Rail Vande Bharat reservations
                    </p>
                  </div>
                </div>
                <span className="font-counter-display text-[11px] text-primary uppercase font-bold tracking-wider">
                  MANDATORY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {[
                  { value: 'Window', title: 'Window', desc: 'Panoramic scenic views' },
                  { value: 'Aisle', title: 'Aisle', desc: 'Quick cabin movement' },
                  { value: 'No Preference', title: 'No Preference', desc: 'System auto-assigns' }
                ].map((s) => {
                  const isSelected = seatPref === s.value;
                  return (
                    <div
                      key={s.value}
                      onClick={() => setSeatPref(s.value)}
                      className={`relative flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-primary-container/20 border-primary text-on-surface shadow-sm'
                          : 'bg-surface-container-high/60 border-transparent hover:bg-surface-container-highest text-on-surface'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                        }`}
                      >
                        {isSelected && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-title-md text-sm font-semibold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {s.title}
                        </span>
                        <span className="font-body-sm text-xs text-on-surface-variant">{s.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meal & Dietary Profiles */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl shadow-lg border border-surface-container-high/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg text-on-surface font-bold">Meal & Dietary Profiles</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Customized catering tailored to your intercity voyages
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { value: 'Vegetarian', label: 'Vegetarian', sub: 'Lacto/Ovo', icon: 'eco' },
                  { value: 'Non-Veg', label: 'Non-Veg', sub: 'Poultry/Fish', icon: 'set_meal' },
                  { value: 'Vegan', label: 'Vegan', sub: '100% Plant', icon: 'psychiatry' },
                  { value: 'No Preference', label: 'Standard', sub: "Chef's Choice", icon: 'done_all' }
                ].map((m) => {
                  const isSelected = mealPref === m.value;
                  return (
                    <div
                      key={m.value}
                      onClick={() => setMealPref(m.value)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl text-center cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-primary-container/20 border-primary shadow-sm'
                          : 'bg-surface-container-high/60 border-transparent hover:bg-surface-container-highest'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[26px] mb-1 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {m.icon}
                      </span>
                      <span className="font-label-md text-xs font-semibold text-on-surface">{m.label}</span>
                      <span className={`font-body-sm text-[10px] mt-0.5 ${isSelected ? 'text-secondary' : 'text-on-surface-variant'}`}>
                        {m.sub}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Default Voyage Tier */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl shadow-lg border border-surface-container-high/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg text-on-surface font-bold">Default Voyage Tier</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Target threshold when autonomous AI builds travel options
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {[
                  { value: 'Economy', title: 'Economy', desc: 'Cost optimized, essential transit routes', icon: 'savings' },
                  { value: 'Mid-Range', title: 'Mid-Range', desc: 'Premium economy & 4-star boutique lodgings', icon: 'hotel_class' },
                  { value: 'Luxury', title: 'Luxury', desc: '5-star heritage properties, first-class cabins', icon: 'stars', recommended: true }
                ].map((b) => {
                  const isSelected = budgetPref === b.value;
                  return (
                    <div
                      key={b.value}
                      onClick={() => setBudgetPref(b.value)}
                      className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden border ${
                        isSelected
                          ? 'bg-primary-container/20 border-primary shadow-sm'
                          : 'bg-surface-container-high/60 border-transparent hover:bg-surface-container-highest'
                      }`}
                    >
                      {b.recommended && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-[10px] font-bold shadow-sm">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            diamond
                          </span>
                          RECOMMENDED
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-title-md text-sm font-semibold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {b.title}
                        </span>
                        <span className={`material-symbols-outlined text-[20px] ${b.recommended ? 'text-tertiary' : 'text-outline-variant'}`}>
                          {b.icon}
                        </span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">{b.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regional Localization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl shadow-lg border border-surface-container-high/60">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">currency_exchange</span>
                  Default Display Currency
                </label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-surface-container-high text-on-surface font-title-md text-sm px-4 py-2.5 rounded-xl appearance-none cursor-pointer focus:bg-surface-variant outline-none border border-surface-container-high"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - United States Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
                <span className="font-body-sm text-[11px] text-on-surface-variant">Fares and ticket fees dynamically normalized</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">translate</span>
                  Autonomous AI Interface Language
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-surface-container-high text-on-surface font-title-md text-sm px-4 py-2.5 rounded-xl appearance-none cursor-pointer focus:bg-surface-variant outline-none border border-surface-container-high"
                  >
                    <option value="en">English (en) - Global Default</option>
                    <option value="hi">Hindi (hi) - हिंदी</option>
                    <option value="fr">French (fr) - Français</option>
                    <option value="ja">Japanese (ja) - 日本語</option>
                    <option value="de">German (de) - Deutsch</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
                <span className="font-body-sm text-[11px] text-on-surface-variant">Voice concierge & itinerary briefs match this locale</span>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Passport Vault, Verification & Automated Sync */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Passport Vault */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl shadow-lg border border-surface-container-high/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
                  <h3 className="font-headline-sm text-lg text-on-surface font-bold">Passport Credentials</h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Verified
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Encrypted with 256-bit vault security for fast-track border manifest clearance.
              </p>

              <div className="flex flex-col gap-3 pt-1">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Passport Number
                  </label>
                  <div className="flex items-center bg-surface-container-high px-4 py-2.5 rounded-xl border border-surface-container-high">
                    <input
                      type="text"
                      value={passportNum}
                      onChange={(e) => setPassportNum(e.target.value)}
                      className="font-title-md text-sm text-on-surface font-bold tracking-widest flex-1 bg-transparent focus:outline-none"
                    />
                    <span className="material-symbols-outlined text-secondary text-[20px]">lock</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Issuing Country
                  </label>
                  <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2.5 rounded-xl border border-surface-container-high">
                    <span className="w-5 h-3.5 rounded-xs bg-tertiary flex items-center justify-center text-[9px] font-bold text-on-tertiary">
                      IN
                    </span>
                    <input
                      type="text"
                      value={passportCountry}
                      onChange={(e) => setPassportCountry(e.target.value)}
                      className="font-title-md text-sm text-on-surface font-semibold flex-1 bg-transparent focus:outline-none"
                    />
                    <span className="font-body-sm text-xs text-on-surface-variant">IND</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Expiry Date
                  </label>
                  <div className="flex items-center bg-surface-container-high px-4 py-2.5 rounded-xl border border-surface-container-high">
                    <input
                      type="text"
                      value={passportExpiry}
                      onChange={(e) => setPassportExpiry(e.target.value)}
                      className="font-title-md text-sm text-on-surface flex-1 bg-transparent focus:outline-none"
                    />
                    <span className="font-label-sm text-[10px] text-secondary font-bold">5.8 YRS REMAINING</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Biometric Scanner Ready: Attach high-res document PDF or Passport JPEG.')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface-variant text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-xs cursor-pointer border border-outline-variant/30 mt-1"
              >
                <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                Scan New Travel Document
              </button>
            </div>

            {/* Automated Synchronization Panel */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface-container-high/60 backdrop-blur-xl shadow-lg border border-surface-container-high">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-tertiary text-[22px]">sync_saved_locally</span>
                <div>
                  <h4 className="font-title-md text-sm text-on-surface font-bold">Automated Synchronization</h4>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Changes are automatically propagated through the Foxico Multimodal Transit Engine via{' '}
                    <code className="text-secondary font-counter-display text-[11px]">PATCH /api/users/profile</code>.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-title-md text-sm font-bold transition-all shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                    <span>Updating /api/users/profile...</span>
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>

              {showToast && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary-container text-on-secondary-container shadow-md border border-secondary/30 transition-all">
                  <span className="material-symbols-outlined text-[18px] text-secondary">cloud_done</span>
                  <span className="font-body-sm text-xs font-semibold">Preferences synced to /api/users/profile</span>
                </div>
              )}
            </div>

            {/* AI Trip Intelligence Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-container to-surface-variant/40 shadow-lg flex flex-col gap-2 border border-primary/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                <span className="font-label-sm text-[11px] text-primary tracking-wider uppercase font-bold">
                  AI Trip Intelligence
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                Based on your Window Seat + Luxury profile, we found an elevated panoramic carriage on the upcoming Vande Bharat departure.
              </p>
              <button
                type="button"
                onClick={() => onNavigate?.('trains')}
                className="font-label-md text-xs text-tertiary hover:underline flex items-center gap-1 mt-1 text-left cursor-pointer font-semibold"
              >
                Preview suggested itinerary
                <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
              </button>
            </div>
          </div>
        </form>

        {/* Active Journeys & Recent Itineraries Section */}
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-headline-md text-2xl text-on-surface tracking-tight font-bold">
                Active Journeys & Recent Itineraries
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Live multimodal reservations synchronized to your profile
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel(-1)}
                className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors shadow-sm cursor-pointer border border-surface-container-high"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={() => scrollCarousel(1)}
                className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors shadow-sm cursor-pointer border border-surface-container-high"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Carousel Rail */}
          <div
            id="bookings-carousel-rail"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
          >
            {recentBookings.length === 0 && (
              <div className="col-span-full p-8 rounded-2xl bg-surface-container-low border border-surface-container-high/60 text-center text-sm text-on-surface-variant">
                No reservations yet. Book a flight, train, bus or stay and it will appear here.
              </div>
            )}
            {recentBookings.slice(0, 6).map((b) => (
              <div
                key={b._id}
                onClick={() => onSelectBooking?.(b._id)}
                className="group relative rounded-2xl overflow-hidden bg-surface-container-low shadow-lg flex flex-col justify-between transition-all hover:-translate-y-1 border border-surface-container-high/60 cursor-pointer p-5 gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-tertiary font-bold">{b.bookingReference}</span>
                  <span className="text-[10px] font-bold uppercase text-secondary">{b.status}</span>
                </div>
                <div className="font-title-md text-sm font-bold text-on-surface">
                  {b.itemDetails?.airline || b.itemDetails?.trainName || b.itemDetails?.operator || b.itemDetails?.name || b.category}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {b.itemDetails?.origin} {b.itemDetails?.destination ? '→ ' + b.itemDetails.destination : b.itemDetails?.city || ''}
                </div>
                <span className="font-title-md text-sm font-bold text-tertiary">₹{b.pricing?.totalAmount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
