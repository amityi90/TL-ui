import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatUSD } from '../utils/money';
import ManualPayment from '../payments/ManualPayment';

// ISO 3166-1 alpha-2, which is what the API stores. The field used to be free
// text, so "United States" was being sent where "US" was required.
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IL', name: 'Israel' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' }
];

// Payment UI per provider `mode` returned by /api/payments/start. Only the
// manual provider exists today; a new payment company adds its entry here.
const PAYMENT_COMPONENTS = {
  manual: ManualPayment
};
const DEFAULT_PAYMENT_MODE = 'manual';

// Both now defined once in src/index.css so every form on the site matches.
const inputClass = 'field';
const labelClass = 'label-caps text-faint text-[10px]';

const readError = async (response, fallback) => {
  try {
    const body = await response.json();
    return body?.message || fallback;
  } catch {
    return fallback;
  }
};

function CheckoutForm({ apiUrl, onSuccess }) {
  const { cart, subtotal, clearCart, removeFromCart, updateQuantity } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // An order already created on the server for this exact cart. If the payment
  // step fails, the retry reuses it instead of placing (and reserving stock
  // for) a second order.
  const [placedOrder, setPlacedOrder] = useState(null);
  const cartSignature = useMemo(
    () => cart.map((item) => `${item.id}x${item.quantity}`).join(','),
    [cart]
  );
  useEffect(() => {
    if (placedOrder && placedOrder.cartSignature !== cartSignature) setPlacedOrder(null);
  }, [cartSignature, placedOrder]);

  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US'
  });

  const PaymentStep = PAYMENT_COMPONENTS[DEFAULT_PAYMENT_MODE];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // Every field here is required by the API, so validate them all up front
  // rather than letting the order POST fail.
  const validate = () => {
    const required = [
      ['fullName', 'full name'],
      ['email', 'email address'],
      ['phone', 'phone number'],
      ['address', 'street address'],
      ['city', 'city'],
      ['postalCode', 'postal code'],
      ['country', 'country']
    ];
    const missing = required.filter(([key]) => !shipping[key]?.trim());
    if (missing.length > 0) return `Please enter your ${missing[0][1]}.`;
    if (!/^\S+@\S+\.\S+$/.test(shipping.email)) return 'Please enter a valid email address.';
    return null;
  };

  const postJson = (path, body) =>
    fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isProcessing) return;

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    try {
      // 1. Create the order, unless this cart already has one from a failed
      //    attempt. The server prices it from the database - this is the only
      //    place the total is decided.
      let order = placedOrder;
      if (!order) {
        const orderResponse = await postJson('/api/orders', {
          cartItems: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          shippingAddress: shipping
        });
        if (!orderResponse.ok) {
          throw new Error(await readError(orderResponse, 'We could not create your order.'));
        }
        const created = (await orderResponse.json()).data;
        order = { id: created.id, totalAmount: created.totalAmount, cartSignature };
        setPlacedOrder(order);
      }

      // 2. Start payment for that order with whichever provider the API runs.
      const paymentResponse = await postJson('/api/payments/start', { orderId: order.id });
      if (!paymentResponse.ok) {
        throw new Error(await readError(paymentResponse, 'We could not start the payment.'));
      }
      const payment = (await paymentResponse.json()).data;

      if (payment.mode !== 'manual') {
        // A provider was configured on the API without its storefront component.
        throw new Error('This payment method is not available yet. Please contact us.');
      }

      // 3. Manual: nothing to charge here. The order stands as Payment Pending
      //    and the boutique has been emailed.
      onSuccess({ orderId: order.id, email: shipping.email, total: order.totalAmount });
      setPlacedOrder(null);
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-16 lg:gap-24">
      <div className="flex-1 space-y-16">
        {/* 1. Review Items */}
        <section>
          <h2 className="label-caps text-gold mb-8 border-b border-gold/25 pb-4">
            1. Shopping Bag ({cart.length})
          </h2>
          <div className="space-y-7 max-h-72 overflow-y-auto pr-2 no-scrollbar">
            {cart.map((item) => {
              const atStockLimit =
                typeof item.stockCount === 'number' && item.quantity >= item.stockCount;
              return (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-velvet shrink-0">
                    <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-ivory">{item.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={isProcessing || item.quantity <= 1}
                        aria-label={`One fewer ${item.name}`}
                        className="w-6 h-6 border border-gold/30 text-gold leading-none hover:border-gold transition-colors disabled:opacity-30"
                      >
                        &minus;
                      </button>
                      <span className="label-caps text-faint text-[10px] w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={isProcessing || atStockLimit}
                        aria-label={`One more ${item.name}`}
                        className="w-6 h-6 border border-gold/30 text-gold leading-none hover:border-gold transition-colors disabled:opacity-30"
                      >
                        +
                      </button>
                      {atStockLimit && (
                        <span className="label-caps text-faint text-[9px]">Last {item.stockCount} available</span>
                      )}
                    </div>
                  </div>
                  <p className="label-caps text-gold">{formatUSD(item.price * item.quantity)}</p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    disabled={isProcessing}
                    aria-label={`Remove ${item.name}`}
                    className="text-faint hover:text-gold transition-colors duration-500 disabled:opacity-40"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Shipping Address */}
        <section>
          <h2 className="label-caps text-gold mb-8 border-b border-gold/25 pb-4">
            2. Shipping Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-2">
              <label className={labelClass}>Full Name</label>
              <input type="text" name="fullName" value={shipping.fullName} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="Jane Doe" autoComplete="name" />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" value={shipping.email} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="jane@example.com" autoComplete="email" />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Phone Number</label>
              <input type="tel" name="phone" value={shipping.phone} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="+1 310 555 0123" autoComplete="tel" />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Country</label>
              <select name="country" value={shipping.country} onChange={handleInputChange}
                disabled={isProcessing} className={`${inputClass} appearance-none`} autoComplete="country">
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={labelClass}>Street Address</label>
              <input type="text" name="address" value={shipping.address} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="123 Luxury Lane, Apt 4B" autoComplete="street-address" />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>City</label>
              <input type="text" name="city" value={shipping.city} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="New York" autoComplete="address-level2" />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Postal Code</label>
              <input type="text" name="postalCode" value={shipping.postalCode} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="10001" autoComplete="postal-code" />
            </div>
          </div>
        </section>

        {/* 3. Payment */}
        <section>
          <h2 className="label-caps text-gold mb-8 border-b border-gold/25 pb-4">
            3. Payment
          </h2>
          <PaymentStep />
        </section>
      </div>

      {/* Order Summary */}
      <div className="lg:w-96 shrink-0">
        <div className="bg-panel border border-gold/20 p-10 sticky top-28">
          <h2 className="label-caps text-gold mb-8 border-b border-gold/25 pb-5">
            Order Summary
          </h2>

          <div className="space-y-5 text-sm text-muted mb-10">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatUSD(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-ivory">Complimentary</span>
            </div>
            <div className="flex justify-between font-serif text-gold text-2xl pt-5 border-t border-gold/25 mt-5">
              <span>Total</span>
              <span>{formatUSD(subtotal)}</span>
            </div>
            <p className="text-[11px] text-faint">All prices in US dollars.</p>
          </div>

          {errorMessage && (
            <div className="text-[#c98b6e] text-sm mb-5 border border-[#c98b6e]/35 p-4">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={isProcessing || cart.length === 0}
            className="btn-gold w-full"
          >
            {isProcessing ? 'Placing Order…' : 'Place Order'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-velvet/85 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-10 h-10 border border-gold/25 border-t-gold rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="font-serif font-light text-2xl text-ivory">Placing Your Order…</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

// Lives outside CheckoutForm: clearing the cart empties CartPage, which would
// otherwise unmount the form - and this confirmation with it.
function OrderPlaced({ success, onClose }) {
  return (
    <div className="max-w-lg mx-auto text-center py-28">
      <div className="w-16 h-16 rounded-full border border-gold/40 flex items-center justify-center mx-auto mb-10">
        <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="font-serif font-light text-4xl text-ivory mb-5">Thank You</h2>
      <p className="text-muted mb-3">
        Your order has been received. We will contact you at{' '}
        <span className="text-ivory">{success.email}</span> to arrange payment.
      </p>
      <p className="text-sm text-muted mb-12">
        Order number <span className="text-gold">#{success.orderId}</span>
        {success.total !== undefined && <> &middot; {formatUSD(success.total)}</>}
      </p>
      <button
        onClick={onClose}
        className="label-caps text-gold border-b border-gold/40 hover:border-gold pb-1 transition-colors duration-500"
      >
        Continue Shopping
      </button>
    </div>
  );
}

export default function CartPage({ onClose, apiUrl }) {
  const { cart } = useCart();
  const [success, setSuccess] = useState(null);

  if (success) {
    return <OrderPlaced success={success} onClose={onClose} />;
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="font-serif font-light text-4xl text-ivory mb-5">Your Cart is Empty</h2>
        <p className="text-muted mb-10">Looks like you haven't added any luxury items yet.</p>
        <button
          onClick={onClose}
          className="label-caps text-gold border-b border-gold/40 hover:border-gold pb-1 transition-colors duration-500"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24 relative">
      <h1 className="font-serif font-light text-5xl text-ivory mb-16 text-center md:text-left">Checkout</h1>
      <CheckoutForm apiUrl={apiUrl} onSuccess={setSuccess} />
    </div>
  );
}
