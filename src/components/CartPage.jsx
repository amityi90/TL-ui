import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const cardStyle = {
  style: {
    base: {
      color: "#000",
      fontFamily: '"Times New Roman", Times, serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  }
};

function CheckoutForm({ onClose, apiUrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, subtotal, clearCart, removeFromCart } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successEmail, setSuccessEmail] = useState(null);
  
  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
  };

  const onSuccess = (email) => {
    setSuccessEmail(email);
    setIsProcessing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!shipping.fullName || !shipping.email || !shipping.address) {
      setErrorMessage("Please fill in all shipping details.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Create Payment Intent
      const intentResponse = await fetch(`${apiUrl}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(subtotal * 100), // Convert to cents
          currency: 'usd' 
        })
      });

      if (!intentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await intentResponse.json();

      // 2. Confirm Card Payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: shipping.fullName,
            email: shipping.email,
            address: {
              line1: shipping.address,
              city: shipping.city,
              postal_code: shipping.postalCode,
              country: shipping.country,
            },
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === 'succeeded') {
        // 3. Save Order
        const orderData = {
          cartItems: cart,
          shippingAddress: shipping,
          paymentIntentId: result.paymentIntent.id,
          total: subtotal,
          status: 'paid'
        };

        const orderResponse = await fetch(`${apiUrl}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
          console.error("Order saved failed but payment succeeded", await orderResponse.text());
        }

        clearCart();
        onSuccess(shipping.email);
      }

    } catch (error) {
      console.error("Checkout error:", error);
      setErrorMessage(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (successEmail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-700">
        <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h2 className="text-4xl font-serif mb-4">Thank You</h2>
        <p className="text-gray-500 mb-8 max-w-md">
            Your order has been placed successfully. A confirmation email has been sent to {successEmail}.
        </p>
        <button 
            onClick={onClose}
            className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
            Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-16">
        {/* Left Column: Forms */}
        <div className="flex-1 space-y-12">
            
            {/* 1. Review Items */}
            <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">1. Shopping Bag ({cart.length})</h2>
                <div className="space-y-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                        <div key={item._id} className="flex gap-4 items-center">
                             <div className="w-16 h-20 bg-gray-100 shrink-0">
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-serif">{item.name}</h3>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500">
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
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">2. Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Full Name</label>
                        <input 
                            type="text" 
                            name="fullName"
                            value={shipping.fullName}
                            onChange={handleInputChange}
                            disabled={isProcessing}
                            className="w-full border-b border-gray-300 focus:border-black py-2 outline-none transition-colors bg-transparent placeholder-gray-300"
                            placeholder="Jane Doe"
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            value={shipping.email}
                            onChange={handleInputChange}
                            disabled={isProcessing}
                            className="w-full border-b border-gray-300 focus:border-black py-2 outline-none transition-colors bg-transparent placeholder-gray-300"
                            placeholder="jane@example.com"
                        />
                    </div>
                     <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Street Address</label>
                        <input 
                            type="text" 
                            name="address"
                            value={shipping.address}
                            onChange={handleInputChange}
                            disabled={isProcessing}
                            className="w-full border-b border-gray-300 focus:border-black py-2 outline-none transition-colors bg-transparent placeholder-gray-300"
                            placeholder="123 Luxury Lane, Apt 4B"
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-wider">City</label>
                        <input 
                            type="text" 
                            name="city"
                            value={shipping.city}
                            onChange={handleInputChange}
                            disabled={isProcessing}
                            className="w-full border-b border-gray-300 focus:border-black py-2 outline-none transition-colors bg-transparent placeholder-gray-300"
                            placeholder="New York"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase tracking-wider">Postal Code</label>
                            <input 
                                type="text" 
                                name="postalCode"
                                value={shipping.postalCode}
                                onChange={handleInputChange}
                                disabled={isProcessing}
                                className="w-full border-b border-gray-300 focus:border-black py-2 outline-none transition-colors bg-transparent placeholder-gray-300"
                                placeholder="10001"
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase tracking-wider">Country</label>
                            <input 
                                type="text" 
                                name="country"
                                value={shipping.country}
                                onChange={handleInputChange}
                                disabled={isProcessing}
                                className="w-full border-b border-gray-300 focus:border-black py-2 outline-none transition-colors bg-transparent placeholder-gray-300"
                                placeholder="United States"
                            />
                        </div>
                    </div>
                </div>
            </section>

             {/* 3. Payment Method */}
             <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">3. Payment Details</h2>
                
                <div className="space-y-6 max-w-md">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Card Number</label>
                        <div className="w-full border-b border-gray-300 focus-within:border-black py-2 transition-colors bg-transparent">
                            <CardNumberElement options={cardStyle} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase tracking-wider">Expiry Date</label>
                            <div className="w-full border-b border-gray-300 focus-within:border-black py-2 transition-colors bg-transparent">
                                <CardExpiryElement options={cardStyle} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase tracking-wider">CVC</label>
                            <div className="w-full border-b border-gray-300 focus-within:border-black py-2 transition-colors bg-transparent">
                                <CardCvcElement options={cardStyle} />
                            </div>
                        </div>
                    </div>
                    {errorMessage && (
                        <div className="text-red-500 text-sm mt-2">
                            {errorMessage}
                        </div>
                    )}
                </div>
            </section>
        </div>

        {/* Right Column: Order Summary (Sticky) */}
        <div className="lg:w-96 shrink-0">
          <div className="bg-gray-50 p-8 sticky top-24">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-4">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-gray-600 mb-8">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-black font-medium">Complimentary</span>
              </div>
              <div className="flex justify-between font-medium text-black text-xl pt-4 border-t border-gray-200 mt-4">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
                onClick={handleSubmit}
                disabled={!stripe || isProcessing}
                className="w-full bg-black text-white text-sm uppercase tracking-[0.2em] py-4 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
            >
                {isProcessing ? 'Processing...' : 'Complete Purchase'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
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
                className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-serif">Processing Secure Payment...</h3>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}

export default function CartPage({ onClose, apiUrl }) {
  const { cart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-3xl font-serif mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any luxury items yet.</p>
        <button 
            onClick={onClose}
            className="border-b border-black uppercase tracking-widest text-sm pb-1 hover:opacity-60 transition-opacity"
        >
            Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
      <h1 className="text-4xl font-serif mb-12 text-center md:text-left">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm onClose={onClose} apiUrl={apiUrl} />
      </Elements>
    </div>
  );
}
