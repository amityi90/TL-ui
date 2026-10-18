import { useEffect, useState } from 'react';

// Couriers need a state / province for these destinations.
export const STATE_REQUIRED = new Set(['US', 'CA', 'MX', 'AU']);

const DEBOUNCE_MS = 600;

const isAddressComplete = (address) =>
  ['address', 'city', 'postalCode', 'country'].every((key) => address[key]?.trim()) &&
  (!STATE_REQUIRED.has(address.country) || address.state?.trim());

const IDLE = { status: 'idle', quoteId: null, rates: [], error: '' };

/**
 * Shipping options for the current cart and address, from POST
 * /api/shipping/rates. Re-quotes whenever the destination or the cart changes,
 * because a quote is only valid for the exact address and cart it was issued
 * for. Which rates engine sits behind the API is invisible from here.
 */
export function useShippingRates({ apiUrl, cart, address }) {
  const [quote, setQuote] = useState(IDLE);
  const [selectedRateId, setSelectedRateId] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const complete = isAddressComplete(address);
  const cartKey = cart.map((item) => `${item.id}x${item.quantity}`).join(',');
  // Only the fields that change the price. Editing the name or phone must not
  // throw away the customer's choice.
  const destinationKey = JSON.stringify([
    address.address,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ]);

  useEffect(() => {
    setSelectedRateId(null);
    if (!complete || cart.length === 0) {
      setQuote(IDLE);
      return undefined;
    }

    setQuote({ ...IDLE, status: 'loading' });
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${apiUrl}/api/shipping/rates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
            shippingAddress: address
          }),
          signal: controller.signal
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.message || 'We could not load delivery options.');
        }
        const { quoteId, rates } = body.data;
        setQuote({ status: 'ready', quoteId, rates, error: '' });
        // Nothing to choose between, so do not make the customer click.
        if (rates.length === 1) setSelectedRateId(rates[0].id);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setQuote({ ...IDLE, status: 'error', error: error.message });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // destinationKey and cartKey stand in for `address` and `cart`, so that
    // only price-relevant edits trigger a new quote.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, complete, destinationKey, cartKey, attempt]);

  const selectedRate = quote.rates.find((rate) => rate.id === selectedRateId) || null;

  return {
    ...quote,
    addressComplete: complete,
    selectedRate,
    selectRate: setSelectedRateId,
    // Fetches a fresh quote, e.g. after the server reports the old one expired.
    refresh: () => setAttempt((n) => n + 1)
  };
}
