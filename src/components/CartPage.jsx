import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const CURRENCY = 'usd';

// Stripe expects ISO 3166-1 alpha-2. The field used to be free text, so
// "United States" was being sent where "US" was required.
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

// Stripe renders the payment fields in an iframe, so site CSS cannot reach them.
// This palette is hand-kept in step with the tokens in src/index.css -- without
// it the Payment Element stays a white card sitting on the dark page.
const appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#d4af37',
    colorBackground: '#12121a',
    colorText: '#f2efe9',
    colorTextSecondary: '#a8a49b',
    colorTextPlaceholder: '#6f6b63',
    colorDanger: '#f87171',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSizeBase: '15px',
    spacingUnit: '4px',
    borderRadius: '0px'
  },
  rules: {
    '.Input': {
      backgroundColor: 'transparent',
      border: '0',
      borderBottom: '1px solid #24242f',
      padding: '8px 0',
      boxShadow: 'none'
    },
    '.Input:focus': { borderBottom: '1px solid #d4af37', boxShadow: 'none', outline: 'none' },
    '.Label': {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#6f6b63'
    },
    '.Tab': { backgroundColor: '#12121a', border: '1px solid #24242f', boxShadow: 'none' },
    '.Tab:hover': { color: '#f2efe9' },
    '.Tab--selected': { border: '1px solid #d4af37', color: '#d4af37' }
  }
};

const inputClass =
  'w-full border-b border-hairline focus:border-gold py-2 outline-none transition-colors bg-transparent text-ink placeholder-ink-faint disabled:opacity-50';
const labelClass = 'text-xs text-ink-faint uppercase tracking-wider';

function CheckoutForm({ onClose, apiUrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, subtotal, clearCart, removeFromCart } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(null);

  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // Every field here is required by the API, so validate them all rather than
  // letting the order POST fail after the card has already been charged.
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

  const readError = async (response, fallback) => {
    try {
      const body = await response.json();
      return body?.message || fallback;
    } catch {
      return fallback;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || isProcessing) return;

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    try {
      // 1. Validate the card fields before creating anything server-side.
      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message);

      // 2. Create the order. The server prices it from the database - this is
      //    the only place the total is decided.
      const orderResponse = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          shippingAddress: shipping,
          paymentMethod: 'Card'
        })
      });
      if (!orderResponse.ok) {
        throw new Error(await readError(orderResponse, 'We could not create your order.'));
      }
      const order = (await orderResponse.json()).data;

      // 3. Create the intent from that order's own total.
      const intentResponse = await fetch(`${apiUrl}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      });
      if (!intentResponse.ok) {
        throw new Error(await readError(intentResponse, 'We could not start the payment.'));
      }
      const { clientSecret, amount } = (await intentResponse.json()).data;

      // The form mounted with the cart total; if a price changed mid-session
      // the server's figure wins, and Elements has to agree before confirming.
      if (amount !== Math.round(subtotal * 100)) {
        elements.update({ amount });
      }

      // 4. Charge the card. 'if_required' keeps 3D Secure inline as a modal
      //    rather than a redirect, which matters because this app has no router
      //    to come back to.
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.href,
          payment_method_data: {
            billing_details: {
              name: shipping.fullName,
              email: shipping.email,
              phone: shipping.phone,
              address: {
                line1: shipping.address,
                city: shipping.city,
                postal_code: shipping.postalCode,
                country: shipping.country
              }
            }
          }
        },
        redirect: 'if_required'
      });

      if (confirmError) throw new Error(confirmError.message);

      if (paymentIntent?.status !== 'succeeded') {
        // Previously this fell through silently and the spinner span forever.
        throw new Error(
          paymentIntent?.status === 'processing'
            ? 'Your payment is still processing. We will email you once it completes.'
            : `Payment was not completed (${paymentIntent?.status ?? 'unknown status'}).`
        );
      }

      // 5. Tell the server straight away so the confirmation is truthful. The
      //    webhook does this too and is the authority - failing here is not
      //    fatal, the payment is already made.
      try {
        await fetch(`${apiUrl}/api/payments/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        });
      } catch {
        // Webhook will settle it.
      }

      clearCart();
      setSuccess({ orderId: order.id, email: shipping.email });
    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMessage(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-8">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-serif mb-4">Thank You</h2>
        <p className="text-ink-muted mb-2">Your payment was received and your order is confirmed.</p>
        <p className="text-sm text-ink-muted mb-10">
          Order number <span className="font-medium text-gold">#{success.orderId}</span>
        </p>
        <button
          onClick={onClose}
          className="border-b border-gold text-gold uppercase tracking-widest text-sm pb-1 hover:opacity-60 transition-opacity"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-16">
      <div className="flex-1 space-y-12">
        {/* 1. Review Items */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-hairline pb-2">
            1. Shopping Bag ({cart.length})
          </h2>
          <div className="space-y-6 max-h-60 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-16 h-20 bg-surface shrink-0">
                  <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-serif">{item.name}</h3>
                  <p className="text-xs text-ink-muted">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  disabled={isProcessing}
                  className="text-ink-faint hover:text-red-400 disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Shipping Address */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-hairline pb-2">
            2. Shipping Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelClass}>Full Name</label>
              <input type="text" name="fullName" value={shipping.fullName} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="Jane Doe" autoComplete="name" />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" value={shipping.email} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="jane@example.com" autoComplete="email" />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Phone Number</label>
              <input type="tel" name="phone" value={shipping.phone} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="+1 310 555 0123" autoComplete="tel" />
            </div>
            <div className="space-y-1">
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
            <div className="space-y-1">
              <label className={labelClass}>City</label>
              <input type="text" name="city" value={shipping.city} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="New York" autoComplete="address-level2" />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Postal Code</label>
              <input type="text" name="postalCode" value={shipping.postalCode} onChange={handleInputChange}
                disabled={isProcessing} className={inputClass} placeholder="10001" autoComplete="postal-code" />
            </div>
          </div>
        </section>

        {/* 3. Payment */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-hairline pb-2">
            3. Payment Details
          </h2>
          <div className="max-w-md">
            <PaymentElement options={{ layout: 'tabs' }} />
          </div>
        </section>
      </div>

      {/* Order Summary */}
      <div className="lg:w-96 shrink-0">
        <div className="bg-raised/70 backdrop-blur-sm border border-hairline p-8 sticky top-24">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-hairline pb-4">
            Order Summary
          </h2>

          <div className="space-y-4 text-sm text-ink-muted mb-8">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-ink font-medium">Complimentary</span>
            </div>
            <div className="flex justify-between font-medium text-gold text-xl pt-4 border-t border-hairline mt-4">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-300 text-sm mb-4 bg-red-500/10 border border-red-500/30 p-3">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-gold text-void font-medium text-sm uppercase tracking-[0.2em] py-4 hover:bg-gold-soft disabled:bg-gold-dim disabled:text-ink-faint disabled:cursor-not-allowed transition-all duration-300"
          >
            {isProcessing ? 'Processing…' : 'Complete Purchase'}
          </button>
          <p className="text-xs text-center text-ink-faint mt-4 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure SSL Encrypted Transaction
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-hairline border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-serif">Processing Secure Payment…</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default function CartPage({ onClose, apiUrl }) {
  const { cart, subtotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-3xl font-serif mb-4">Your Cart is Empty</h2>
        <p className="text-ink-muted mb-8">Looks like you haven't added any luxury items yet.</p>
        <button
          onClick={onClose}
          className="border-b border-gold text-gold uppercase tracking-widest text-sm pb-1 hover:opacity-60 transition-opacity"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-3xl font-serif mb-4">Checkout Unavailable</h2>
        <p className="text-ink-muted mb-8">
          Payments are not configured. Please try again shortly.
        </p>
        <button
          onClick={onClose}
          className="border-b border-gold text-gold uppercase tracking-widest text-sm pb-1 hover:opacity-60 transition-opacity"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  // Deferred intent creation: the form renders with the cart total, and the
  // PaymentIntent is only created when the customer actually pays.
  const options = {
    mode: 'payment',
    amount: Math.max(50, Math.round(subtotal * 100)),
    currency: CURRENCY,
    appearance
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
      <h1 className="text-4xl font-serif mb-12 text-center md:text-left">Checkout</h1>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm onClose={onClose} apiUrl={apiUrl} />
      </Elements>
    </div>
  );
}
