import React from 'react';

export const inputClass =
  'w-full bg-surface-container-high px-3 py-2.5 rounded-md text-on-surface text-sm border border-outline-variant/40 focus:outline-none focus:border-primary';
export const labelClass = 'text-xs text-on-surface-variant font-semibold block mb-1';
export const primaryButton =
  'px-5 py-2.5 rounded-md bg-primary-container hover:bg-primary text-on-primary-container font-bold text-sm disabled:opacity-60';
export const secondaryButton =
  'px-4 py-2 rounded-md bg-surface-variant hover:bg-surface-container-highest text-on-surface text-sm font-semibold';

export function PageHeader({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-extrabold text-on-surface">{title}</h1>
      {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
    </div>
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="p-3 rounded-md bg-error/20 border border-error/40 text-error text-sm">
      {children}
    </div>
  );
}

export function EmptyNote({ title, children }) {
  return (
    <div className="p-10 rounded-lg bg-surface-container-low border border-surface-container-high text-center flex flex-col items-center gap-2">
      <h2 className="text-lg font-bold text-on-surface">{title}</h2>
      {children && <p className="text-sm text-on-surface-variant max-w-md">{children}</p>}
    </div>
  );
}

export function Loading({ label = 'Searching' }) {
  return <p className="py-12 text-center text-sm text-on-surface-variant" role="status">{label}</p>;
}

// Taxes and our fee are added at checkout, so search results show the base fare only.
export function FareNote() {
  return <p className="text-xs text-on-surface-variant">Taxes and service fee are added at checkout.</p>;
}
