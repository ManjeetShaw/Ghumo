import React, { useState } from 'react';

// Shows /images/destinations/<slug>.jpg. If the file is missing, shows a plain tile instead.
export default function DestinationImage({ slug, name, label, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-end bg-surface-container-high p-3 ${className}`} role="img" aria-label={name}>
        <span className="text-xs text-on-surface-variant">{label}</span>
      </div>
    );
  }

  return (
    <img
      src={`/images/destinations/${slug}.jpg`}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
