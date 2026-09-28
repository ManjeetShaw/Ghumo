import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ onNavigate }) {
  const { login, register, token, user, logout } = useAuth();
  const [tab, setTab] = useState('signin'); // 'signin' or 'register'

  // Sign In inputs
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('Voyage2025!Secret');
  const [showSigninPassword, setShowSigninPassword] = useState(false);

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+91 98765 43210');
  const [regEmail, setRegEmail] = useState('jane.doe@voyager.io');
  const [regPassword, setRegPassword] = useState('Nomad#Pacific2025');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCurrency, setRegCurrency] = useState('INR');
  const [regSeat, setRegSeat] = useState('Window');
  const [regBudget, setRegBudget] = useState('Luxury');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(signinEmail, signinPassword);
      if (res.success) {
        setSuccessMsg('Authentication verified. Welcome aboard!');
        setTimeout(() => onNavigate?.('dashboard'), 800);
      } else {
        setErrorMsg(res.error || 'Failed to authenticate');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        preferences: {
          currency: regCurrency,
          seatPreference: regSeat,
          budgetPreference: regBudget
        }
      });
      if (res.success) {
        setSuccessMsg('Account registered and travel profile synced!');
        setTimeout(() => onNavigate?.('dashboard'), 800);
      } else {
        setErrorMsg(res.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleExpressOAuth = async (provider) => {
    setLoading(true);
    // Real endpoint registration/login simulation with backend
    try {
      const res = await login(`jane.${provider.toLowerCase()}@voyager.io`, 'OAuth2026Secure!');
      if (res.success) {
        setSuccessMsg(`Authenticated via ${provider} ID.`);
        setTimeout(() => onNavigate?.('dashboard'), 800);
      }
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-background min-h-screen flex items-center justify-center p-4 lg:p-12 relative overflow-hidden -mt-20 pt-28">
      {/* Background with Dark Teal Emerald Scrim */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center filter brightness-50 contrast-125 scale-105"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDRBDyeMQhAWZhCV5wQZCCyjqhs8W33mKkjlQ4hmNvJzgjTxGiE096qVjUtkrPTAG-oYBLm42jXiCXS-Tv5zALAY7roH7IC9rHWyX5y0i7wFjrMJudIvr6E1eGOw875qP2QgYthPnijHqTHcvTsi-jr0h-QukfeQcHSnMVMz0RTrYcbnVclKEDE6b3M03HDQG-3AUApsi7pt6WlAcolD-Sxt-jOOK1PYuaGdTRputNq7OQ1dHXNQdTD')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface-container-lowest/80 to-surface-dim/60 backdrop-blur-[6px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-center">
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate?.('landing')}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-tertiary-container via-tertiary to-primary-container flex items-center justify-center shadow-lg shadow-tertiary/20 group-hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-surface-container-lowest text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                travel_explore
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-xl text-on-surface tracking-tight font-extrabold">
                Foxico
              </span>
              <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest -mt-1 font-bold">
                Voyage Matrix
              </span>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/60 backdrop-blur-md border border-surface-container-high">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Gateway Secure v4.9
              </span>
            </div>
            <button
              onClick={() => onNavigate?.('landing')}
              className="px-4 py-2 rounded-full bg-surface-variant/40 hover:bg-surface-variant/70 text-on-surface hover:text-primary transition-all duration-200 font-label-md text-xs flex items-center gap-1.5 shadow-sm border border-outline-variant/30 cursor-pointer"
            >
              <span>Explore as Guest</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Main 2-Panel Card */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden bg-surface-container-high/40 backdrop-blur-2xl shadow-2xl border border-surface-container-high/50">
          {/* Left Panel */}
          <div className="lg:col-span-5 relative p-6 lg:p-10 flex flex-col justify-between overflow-hidden bg-surface-container/70 border-b lg:border-b-0 lg:border-r border-surface-container-high/60">
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-tertiary/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/60 w-fit backdrop-blur-md border border-secondary/20">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span className="font-label-sm text-[11px] text-secondary font-bold tracking-wider uppercase">
                  Foxico AI Travel Member
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-md text-xs uppercase tracking-widest text-primary font-bold">
                  Intelligent Voyaging
                </span>
                <h1 className="font-headline-lg text-3xl lg:text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
                  One Key. Unlimited Frontiers.
                </h1>
                <p className="font-body-md text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Your gateway to seamless travel across Flights, High-Speed Rail, Expeditions, and Secluded Stays worldwide with real-time AI itinerary sync.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-surface-variant/40 backdrop-blur-md flex flex-col border border-surface-container-high/40">
                  <span className="font-headline-sm text-lg font-bold text-primary">32k+</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">Satisfied Voyagers</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-variant/40 backdrop-blur-md flex flex-col border border-surface-container-high/40">
                  <span className="font-headline-sm text-lg font-bold text-tertiary">500+</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">Curated Routes</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-variant/40 backdrop-blur-md flex flex-col border border-surface-container-high/40">
                  <span className="font-headline-sm text-lg font-bold text-secondary">0.0s</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">Booking Friction</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-4">
              <div className="relative h-44 rounded-xl overflow-hidden shadow-lg group border border-surface-container-high/40">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSup8SpyUJGo3y5GRp0xcrMUO_OL9MkQ4ZjpgtHDs0ieYJ3uRbPD9lpmBCXCb1drxfaIyyEEPDv9BVSmEufPSl0m6eH7lYTtgCLXBf4zxhTb0hbFD7c2eIkCUqf1snN5j5aPeal2AtsBA7WM5qr4TAjrxqyYcqbkEobCnS2goxUPi5uXkvQSRkjbocNJlvhv8cHl3pxRb5QznFAwLnBtN9SB2wAT6MryxJr1zDyBhp3k4E8w7C25kd')"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-[10px] text-primary uppercase tracking-wider font-semibold">
                      Featured Route of the Week
                    </p>
                    <p className="font-title-md text-sm text-on-surface font-bold">Ubud Sanctuary • Bali</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center text-on-surface shadow-md">
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-on-surface-variant font-counter-display text-[10px] uppercase tracking-widest">
                <span>Security protocol sha-256</span>
                <span>node: ap-south-1</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 p-6 lg:p-10 flex flex-col justify-between bg-surface-container-lowest/60">
            <div>
              {/* Tabs Switcher */}
              <div className="w-full flex items-center justify-between pb-6">
                <div className="flex items-center p-1 rounded-full bg-surface-container-high/80 w-full max-w-xs shadow-inner border border-surface-container-high">
                  <button
                    type="button"
                    onClick={() => { setTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2 rounded-full font-title-md text-xs transition-all duration-200 text-center cursor-pointer ${
                      tab === 'signin'
                        ? 'text-on-primary bg-primary-container shadow-md font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2 rounded-full font-title-md text-xs transition-all duration-200 text-center cursor-pointer ${
                      tab === 'register'
                        ? 'text-on-primary bg-primary-container shadow-md font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-xs border border-surface-container-high">
                  <span className="material-symbols-outlined text-sm text-secondary">encrypted</span>
                  <span>256-bit TLS</span>
                </div>
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-error/20 border border-error/40 text-error text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-lg bg-secondary-container border border-secondary/40 text-on-secondary-container text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form 1: Sign In */}
              {tab === 'signin' && (
                <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-xs text-on-surface font-semibold flex items-center justify-between">
                      <span>Voyager Email</span>
                      <span className="text-on-surface-variant font-body-sm text-[11px]">e.g. jane@example.com</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-xl pointer-events-none">
                        alternate_email
                      </span>
                      <input
                        type="email"
                        required
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-high text-on-surface placeholder:text-outline-variant font-body-md text-sm focus:outline-none focus:bg-surface-variant transition-colors shadow-inner border border-surface-container-high"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-label-md text-xs text-on-surface font-semibold">
                        Master Passphrase
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Demo account: password is "Voyage2025!Secret"')}
                        className="font-label-sm text-[11px] text-primary hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-xl pointer-events-none">
                        lock
                      </span>
                      <input
                        type={showSigninPassword ? 'text' : 'password'}
                        required
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        placeholder="Enter security passphrase"
                        className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface-container-high text-on-surface placeholder:text-outline-variant font-body-md text-sm focus:outline-none focus:bg-surface-variant transition-colors shadow-inner border border-surface-container-high"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSigninPassword(!showSigninPassword)}
                        className="absolute right-3.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showSigninPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-surface-container-high accent-primary cursor-pointer"
                      />
                      <span className="font-body-sm text-xs text-on-surface">Keep terminal active for 30 days</span>
                    </label>
                    <span className="font-label-sm text-[11px] text-secondary font-semibold">Trusted Device</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-title-md text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 hover:shadow-primary/30 transition-all duration-200 group cursor-pointer"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Foxico'}</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </form>
              )}

              {/* Form 2: Create Account */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-xs text-on-surface font-semibold">Full Legal Name</label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-base pointer-events-none">
                          person
                        </span>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-body-md text-xs focus:outline-none focus:bg-surface-variant transition-colors shadow-inner border border-surface-container-high"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-xs text-on-surface font-semibold">Mobile Terminal</label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-base pointer-events-none">
                          call
                        </span>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-body-md text-xs focus:outline-none focus:bg-surface-variant transition-colors shadow-inner border border-surface-container-high"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-xs text-on-surface font-semibold">Voyager Email</label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-base pointer-events-none">
                        mail
                      </span>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="jane.doe@voyager.io"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-body-md text-xs focus:outline-none focus:bg-surface-variant transition-colors shadow-inner border border-surface-container-high"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-xs text-on-surface font-semibold">Create Password</label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-base pointer-events-none">
                        lock
                      </span>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-body-md text-xs focus:outline-none focus:bg-surface-variant transition-colors shadow-inner border border-surface-container-high"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 text-on-surface-variant hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-base">
                          {showRegPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Travel Preferences */}
                  <div className="p-3 rounded-xl bg-surface-container-high flex flex-col gap-2 border border-surface-container-high">
                    <span className="font-label-sm text-[10px] text-primary font-bold uppercase tracking-wider">
                      Default Travel Preferences
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="font-body-sm text-[10px] text-on-surface-variant block mb-1">Currency</label>
                        <select
                          value={regCurrency}
                          onChange={(e) => setRegCurrency(e.target.value)}
                          className="w-full py-1.5 px-2 rounded bg-surface-container text-on-surface font-body-sm text-xs focus:outline-none"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-body-sm text-[10px] text-on-surface-variant block mb-1">Seat Pref</label>
                        <select
                          value={regSeat}
                          onChange={(e) => setRegSeat(e.target.value)}
                          className="w-full py-1.5 px-2 rounded bg-surface-container text-on-surface font-body-sm text-xs focus:outline-none"
                        >
                          <option value="Window">Window</option>
                          <option value="Aisle">Aisle</option>
                          <option value="No Preference">Standard</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-body-sm text-[10px] text-on-surface-variant block mb-1">Budget Tier</label>
                        <select
                          value={regBudget}
                          onChange={(e) => setRegBudget(e.target.value)}
                          className="w-full py-1.5 px-2 rounded bg-surface-container text-on-surface font-body-sm text-xs focus:outline-none"
                        >
                          <option value="Economy">Economy</option>
                          <option value="Mid-Range">Mid-range</option>
                          <option value="Luxury">Luxury</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-title-md text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 hover:shadow-primary/30 transition-all duration-200 group mt-1 cursor-pointer"
                  >
                    <span>{loading ? 'Creating Voyager Profile...' : 'Create Foxico Account'}</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-base">
                      flight_takeoff
                    </span>
                  </button>
                </form>
              )}

              {/* Express Authenticate Divider */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-surface-container-high" />
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                  or express authenticate
                </span>
                <div className="flex-1 h-px bg-surface-container-high" />
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleExpressOAuth('Google')}
                  className="py-2.5 px-4 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-title-md text-xs flex items-center justify-center gap-2 transition-all duration-200 border border-surface-container-high cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" fill="#EA4335" />
                    <path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" fill="#4285F4" />
                    <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" fill="#FBBC05" />
                    <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" fill="#34A853" />
                  </svg>
                  <span>Google ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExpressOAuth('Apple')}
                  className="py-2.5 px-4 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-title-md text-xs flex items-center justify-center gap-2 transition-all duration-200 border border-surface-container-high cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.6-7.79-11.74-14.25-5.99-9.33-10.74-19.8-14.25-31.42-3.51-11.61-5.27-22.68-5.27-33.2 0-14.83 3.82-27.24 11.45-37.23 7.64-9.98 17.2-15.08 28.7-15.3 4.8 0 10.1 1.25 15.89 3.75 5.79 2.5 9.77 3.81 11.95 3.93 1.95 0 6.04-1.4 12.28-4.2 6.24-2.8 11.69-4.06 16.35-3.79 12.74.65 22.84 5.37 30.3 14.16-11.07 6.74-16.49 16.03-16.27 27.87.22 9.35 3.8 17.18 10.75 23.51 6.95 6.32 15.11 9.9 24.47 10.74-2.17 6.53-4.78 13.06-7.83 19.59zM119.22 31.8c0-7.29 2.65-14.07 7.96-20.35 5.3-6.28 11.85-10.45 19.64-12.51.22 1.09.33 2.18.33 3.27 0 7.18-2.84 14.15-8.51 20.91-5.67 6.76-12.29 10.63-19.86 11.61-.22-.98-.33-1.96-.33-2.93z" />
                  </svg>
                  <span>Apple Pass</span>
                </button>
              </div>
            </div>

            {/* Local Auth Storage State Terminal Display */}
            <div className="mt-6 pt-3">
              <div className="p-3 rounded-xl bg-surface-container-high/90 font-counter-display flex flex-col gap-1.5 border border-surface-container-high">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${token ? 'bg-primary-container' : 'bg-secondary'}`} />
                    <span className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
                      {token ? 'Active Authenticated Session (POST /api/auth/login)' : 'Local Auth Storage State'}
                    </span>
                  </div>
                  {token && (
                    <button
                      onClick={logout}
                      className="text-[10px] text-outline hover:text-error transition-colors uppercase font-bold cursor-pointer"
                    >
                      Flush
                    </button>
                  )}
                </div>
                <div className="p-2 rounded bg-surface-container font-mono text-[11px] text-secondary truncate">
                  {token
                    ? `Token: ${token.substring(0, 36)}... • RBAC: ${user?.role || 'USER'} • User: ${user?.email}`
                    : 'Token: null • RBAC: GUEST • Exp: --'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-on-surface-variant font-label-sm text-xs">
          <div className="flex items-center gap-4">
            <span>© 2026 Foxico Inc. All rights reserved.</span>
            <a href="#terms" className="hover:text-primary transition-colors">Terms of Expedition</a>
            <a href="#privacy" className="hover:text-primary transition-colors">Privacy Protocol</a>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-on-surface">Curated Voyages: Kerala • Indonesia • Thailand</span>
          </div>
        </div>
      </div>
    </main>
  );
}
