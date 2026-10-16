// Payment step for the API's 'manual' provider: nothing is charged online. The
// order is placed as Payment Pending and the boutique contacts the customer.
//
// When a payment company is added, its component lives next to this one and
// CartPage picks it by the `mode` the API returns from /api/payments/start.
export default function ManualPayment() {
  return (
    <div className="max-w-md border border-gold/20 p-6 space-y-3">
      <p className="label-caps text-gold">Pay on confirmation</p>
      <p className="text-sm text-muted leading-relaxed">
        No payment is taken online. Once you place your order, our team will contact you by email or
        phone to arrange payment before your piece is prepared and shipped.
      </p>
    </div>
  );
}
