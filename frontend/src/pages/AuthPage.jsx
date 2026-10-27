import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import { SITE } from '../config/site.js';

export default function AuthPage({ notice = '', onSuccess, onNavigate }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const switchTab = (next) => {
    setTab(next);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res =
        tab === 'signin'
          ? await login(email.trim(), password)
          : await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() });
      if (res.success) {
        onSuccess?.();
      } else {
        setErrorMsg(res.error || (tab === 'signin' ? 'Could not sign in' : 'Could not create the account'));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-surface-container-high px-3 py-2.5 rounded-md text-on-surface text-sm border border-outline-variant/40 focus:outline-none focus:border-primary';
  const labelClass = 'text-xs text-on-surface-variant font-semibold block mb-1';

  return (
    <div className="w-full min-h-[calc(100vh-7rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <button onClick={() => onNavigate?.('landing')} className="flex items-center gap-2.5 self-center" aria-label={`${SITE.name} home`}>
          <Logo size={32} />
          <span className="text-2xl font-extrabold text-on-surface">{SITE.name}</span>
        </button>

        <div className="p-6 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-surface-container-high" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'signin'} onClick={() => switchTab('signin')}
              className={`py-2 rounded text-sm ${tab === 'signin' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant'}`}>
              Sign in
            </button>
            <button type="button" role="tab" aria-selected={tab === 'register'} onClick={() => switchTab('register')}
              className={`py-2 rounded text-sm ${tab === 'register' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant'}`}>
              Create account
            </button>
          </div>

          {notice && <div className="p-3 rounded-md bg-surface-variant text-on-surface text-sm">{notice}</div>}
          {errorMsg && <div role="alert" className="p-3 rounded-md bg-error/20 border border-error/40 text-error text-sm">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === 'register' && (
              <>
                <div>
                  <label htmlFor="a-name" className={labelClass}>Full name</label>
                  <input id="a-name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="a-phone" className={labelClass}>Mobile number (optional)</label>
                  <input
                    id="a-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    pattern="(\+91[\s\-]?)?[6-9][0-9]{9}" title="Enter a 10 digit Indian mobile number, with or without +91"
                    placeholder="98XXXXXXXX" className={inputClass}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="a-email" className={labelClass}>Email</label>
              <input id="a-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label htmlFor="a-pass" className={labelClass}>Password</label>
              <div className="relative">
                <input
                  id="a-pass" type={showPassword ? 'text' : 'password'} required minLength={tab === 'register' ? 8 : undefined}
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-16`}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary px-2 py-1">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {tab === 'register' && <p className="text-xs text-on-surface-variant mt-1">At least 8 characters.</p>}
            </div>

            {tab === 'register' && (
              <label className="flex items-start gap-2 text-sm text-on-surface-variant">
                <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
                <span>
                  I agree to the{' '}
                  <button type="button" onClick={() => onNavigate?.('terms')} className="text-primary underline">Terms and Conditions</button>
                  {' '}and the{' '}
                  <button type="button" onClick={() => onNavigate?.('privacy')} className="text-primary underline">Privacy Policy</button>.
                </span>
              </label>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-md bg-primary-container hover:bg-primary text-on-primary-container font-bold text-sm disabled:opacity-60">
              {loading ? 'Please wait' : tab === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
