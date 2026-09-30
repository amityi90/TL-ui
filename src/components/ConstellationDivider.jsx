// Section divider: a thin gold line threaded through a few stars. Shared so the
// motif stays identical everywhere it appears rather than being redrawn per page.
export default function ConstellationDivider({ className = '' }) {
  return (
    <div className={`flex justify-center ${className}`} aria-hidden="true">
      <svg width="240" height="24" viewBox="0 0 240 24" fill="none">
        <g stroke="#c9a96e" strokeWidth="1">
          {/* The outer segments fade out so the motif does not end in hard stops. */}
          <line x1="0" y1="12" x2="52" y2="12" strokeOpacity="0.12" />
          <line x1="52" y1="12" x2="96" y2="6" strokeOpacity="0.45" />
          <line x1="96" y1="6" x2="140" y2="16" strokeOpacity="0.45" />
          <line x1="140" y1="16" x2="188" y2="9" strokeOpacity="0.45" />
          <line x1="188" y1="9" x2="240" y2="12" strokeOpacity="0.12" />
        </g>
        <g fill="#c9a96e">
          <circle cx="52" cy="12" r="1.4" fillOpacity="0.7" />
          <circle cx="96" cy="6" r="2" />
          <circle cx="140" cy="16" r="1.4" fillOpacity="0.7" />
          <circle cx="188" cy="9" r="1.4" fillOpacity="0.7" />
        </g>
      </svg>
    </div>
  );
}
