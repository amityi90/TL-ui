import { formatUSD } from '../utils/money';

const deliveryWindow = ({ minDays, maxDays }) => {
  if (!minDays && !maxDays) return null;
  if (!maxDays || minDays === maxDays) return `${minDays || maxDays} business days`;
  return `${minDays}–${maxDays} business days`;
};

// The checkout's delivery step. Renders whatever POST /api/shipping/rates
// returned; it neither knows nor cares which rates engine produced them.
export default function ShippingOptions({
  status,
  rates,
  error,
  addressComplete,
  selectedRateId,
  onSelect,
  onRetry,
  disabled
}) {
  if (!addressComplete) {
    return (
      <p className="text-sm text-muted">Enter your shipping address to see delivery options.</p>
    );
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="w-4 h-4 border border-gold/25 border-t-gold rounded-full animate-spin" />
        Finding delivery options…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <p className="text-[#c98b6e] text-sm">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="label-caps text-gold border-b border-gold/40 hover:border-gold pb-1 transition-colors duration-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="radiogroup" aria-label="Shipping method">
      {rates.map((rate) => {
        const selected = rate.id === selectedRateId;
        const eta = deliveryWindow(rate);
        return (
          <label
            key={rate.id}
            className={`flex items-start gap-5 border p-5 transition-colors duration-500 ${
              disabled ? 'opacity-60' : 'cursor-pointer'
            } ${selected ? 'border-gold bg-gold/5' : 'border-gold/20 hover:border-gold/50'}`}
          >
            <input
              type="radio"
              name="shippingRate"
              value={rate.id}
              checked={selected}
              onChange={() => onSelect(rate.id)}
              disabled={disabled}
              className="mt-1 accent-[#c9a96e]"
            />
            <div className="flex-1">
              <p className="label-caps text-ivory">{rate.carrier}</p>
              <p className="text-sm text-muted mt-1">
                {rate.carrier !== rate.service && rate.service}
                {rate.carrier !== rate.service && rate.service && eta && ' · '}
                {/* Kept whole so a narrow screen never splits "7–14" across lines. */}
                {eta && <span className="whitespace-nowrap">{eta}</span>}
              </p>
              {rate.estDuties !== null && rate.estDuties > 0 && (
                <p className="text-[11px] text-faint mt-2">
                  Est. import duties and taxes ~{formatUSD(rate.estDuties)}, paid by the recipient on delivery.
                </p>
              )}
            </div>
            <p className="label-caps text-gold whitespace-nowrap">
              {rate.amount === 0 ? 'Complimentary' : formatUSD(rate.amount)}
            </p>
          </label>
        );
      })}
    </div>
  );
}
