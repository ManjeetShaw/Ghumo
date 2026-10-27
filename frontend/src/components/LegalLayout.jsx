import React from 'react';
import { SITE } from '../config/site.js';

// Renders a legal document from a list of sections.
// section: { title, paras?: string[], list?: string[], after?: string[] }
export default function LegalLayout({ title, intro, sections }) {
  const missing = [
    !SITE.legalName && 'legal name',
    !SITE.registeredAddress && 'registered address',
    !SITE.supportEmail && 'support email',
    !SITE.grievanceOfficerName && 'Grievance Officer name',
    !SITE.grievanceOfficerEmail && 'Grievance Officer email',
  ].filter(Boolean);

  return (
    <article className="w-full max-w-3xl mx-auto px-4 lg:px-8 py-10 flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-surface-container-high pb-6">
        <h1 className="text-3xl font-extrabold text-on-surface">{title}</h1>
        <p className="text-sm text-on-surface-variant">Last updated: {SITE.legalLastUpdated}</p>
        {intro && <p className="text-sm text-on-surface-variant leading-relaxed mt-2">{intro}</p>}
      </header>

      {sections.map((s, i) => (
        <section key={s.title} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-on-surface">{i + 1}. {s.title}</h2>
          {s.paras?.map((p, k) => (
            <p key={k} className="text-sm text-on-surface-variant leading-relaxed">{p}</p>
          ))}
          {s.list && (
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-on-surface-variant leading-relaxed">
              {s.list.map((item, k) => <li key={k}>{item}</li>)}
            </ul>
          )}
          {s.after?.map((p, k) => (
            <p key={`a${k}`} className="text-sm text-on-surface-variant leading-relaxed">{p}</p>
          ))}
        </section>
      ))}

      <section className="flex flex-col gap-2 p-5 rounded-lg bg-surface-container-low border border-surface-container-high">
        <h2 className="text-base font-bold text-on-surface">Contact and Grievance Officer</h2>
        <dl className="text-sm text-on-surface-variant flex flex-col gap-1">
          {SITE.legalName && <div><dt className="inline font-semibold text-on-surface">Operator: </dt><dd className="inline">{SITE.legalName}</dd></div>}
          {SITE.registeredAddress && <div><dt className="inline font-semibold text-on-surface">Address: </dt><dd className="inline">{SITE.registeredAddress}</dd></div>}
          {SITE.supportEmail && <div><dt className="inline font-semibold text-on-surface">Support: </dt><dd className="inline">{SITE.supportEmail}</dd></div>}
          {SITE.grievanceOfficerName && <div><dt className="inline font-semibold text-on-surface">Grievance Officer: </dt><dd className="inline">{SITE.grievanceOfficerName}</dd></div>}
          {SITE.grievanceOfficerEmail && <div><dt className="inline font-semibold text-on-surface">Grievance email: </dt><dd className="inline">{SITE.grievanceOfficerEmail}</dd></div>}
        </dl>
        {missing.length > 0 && (
          <p className="text-sm text-error mt-1">
            Not configured yet: {missing.join(', ')}. Set these in src/config/site.js before launch.
          </p>
        )}
      </section>
    </article>
  );
}
