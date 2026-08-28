import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { CreditCard, Truck, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { userService, orderService } from '../services/userService';
import { EmptyState } from '../components/common/SharedUI';

const FREE_SHIPPING_THRESHOLD = 1499;
const SHIPPING_FLAT_RATE = 99;

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const emptyAddress = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India',
};

const Checkout = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);

  const items = cart.items || [];
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT_RATE;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (def) setSelectedAddressId(def._id);
      else setShowNewAddress(true);
    }
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { addresses: updated } = await userService.addAddress(newAddress);
      setAddresses(updated);
      setSelectedAddressId(updated[updated.length - 1]._id);
      setShowNewAddress(false);
      setNewAddress(emptyAddress);
      await refetchUser();
      toast.success('Address saved.');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not save address.');
    }
  };

  const getShippingAddress = () => {
    const addr = addresses.find((a) => a._id === selectedAddressId);
    if (!addr) return null;
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country } = addr;
    return { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country };
  };

  const buildOrderItems = () =>
    items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      variant: item.variant,
    }));

  const handlePlaceOrder = async () => {
    const shippingAddress = getShippingAddress();
    if (!shippingAddress) {
      toast.error('Please select or add a shipping address.');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === 'cod') {
        await orderService.placeOrder({
          items: buildOrderItems(),
          shippingAddress,
          paymentMethod: 'cod',
        });
        await clearCart();
        toast.success('Order placed successfully! 🎉');
        navigate('/account/orders');
        return;
      }

      // Razorpay flow
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Could not load payment gateway. Please try again.');
        setPlacing(false);
        return;
      }

      const { order: rzpOrder, key } = await orderService.createRazorpayOrder(total);

      const options = {
        key,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Crochet Nest',
        description: 'Handmade crochet order',
        order_id: rzpOrder.id,
        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: user?.contactNumber,
        },
        theme: { color: '#D8A7B1' },
        handler: async (response) => {
          try {
            await orderService.placeOrder({
              items: buildOrderItems(),
              shippingAddress,
              paymentMethod: 'razorpay',
              razorpayPaymentDetails: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            });
            await clearCart();
            toast.success('Payment successful! Order placed 🎉');
            navigate('/account/orders');
          } catch (err) {
            toast.error(err.friendlyMessage || 'Order could not be completed after payment.');
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not place order.');
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="section-padding">
        <EmptyState icon="🛍️" title="Your cart is empty" description="Add items to your cart before checking out." />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Checkout | Crochet Nest</title></Helmet>

      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl mb-10">Checkout</h1>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            <div className="space-y-8">
              {/* Address */}
              <div>
                <h2 className="font-label font-semibold text-lg text-brown-deep mb-4">Shipping Address</h2>
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr._id}
                      onClick={() => { setSelectedAddressId(addr._id); setShowNewAddress(false); }}
                      className={`w-full text-left p-4 rounded-2xl border transition-colors flex items-start gap-3 ${
                        selectedAddressId === addr._id && !showNewAddress ? 'border-rose bg-rose/5' : 'border-beige-dark hover:border-rose/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedAddressId === addr._id && !showNewAddress ? 'border-rose bg-rose' : 'border-beige-dark'}`}>
                        {selectedAddressId === addr._id && !showNewAddress && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="font-label font-medium text-brown-deep">{addr.fullName} <span className="text-brown-light font-normal">· {addr.phone}</span></p>
                        <p className="text-sm text-brown-light mt-0.5">
                          {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}{addr.city}, {addr.state} {addr.postalCode}
                        </p>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => setShowNewAddress((s) => !s)}
                    className="w-full flex items-center gap-2 p-4 rounded-2xl border border-dashed border-beige-dark text-brown-light hover:border-rose hover:text-rose transition-colors"
                  >
                    <Plus size={18} /> Add a new address
                  </button>

                  {showNewAddress && (
                    <form onSubmit={handleAddAddress} className="card-cozy p-5 grid sm:grid-cols-2 gap-3">
                      <input required placeholder="Full Name" value={newAddress.fullName} onChange={(e) => setNewAddress((a) => ({ ...a, fullName: e.target.value }))} className="input-cozy" />
                      <input required placeholder="Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))} className="input-cozy" />
                      <input required placeholder="Address Line 1" value={newAddress.addressLine1} onChange={(e) => setNewAddress((a) => ({ ...a, addressLine1: e.target.value }))} className="input-cozy sm:col-span-2" />
                      <input placeholder="Address Line 2 (optional)" value={newAddress.addressLine2} onChange={(e) => setNewAddress((a) => ({ ...a, addressLine2: e.target.value }))} className="input-cozy sm:col-span-2" />
                      <input required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))} className="input-cozy" />
                      <input required placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress((a) => ({ ...a, state: e.target.value }))} className="input-cozy" />
                      <input required placeholder="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress((a) => ({ ...a, postalCode: e.target.value }))} className="input-cozy" />
                      <input required placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress((a) => ({ ...a, country: e.target.value }))} className="input-cozy" />
                      <button type="submit" className="btn-primary sm:col-span-2 justify-center">Save Address</button>
                    </form>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div>
                <h2 className="font-label font-semibold text-lg text-brown-deep mb-4">Payment Method</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${paymentMethod === 'razorpay' ? 'border-rose bg-rose/5' : 'border-beige-dark hover:border-rose/50'}`}
                  >
                    <CreditCard size={20} className="text-rose-dark" />
                    <div className="text-left">
                      <p className="font-label font-medium text-brown-deep text-sm">Pay Online</p>
                      <p className="text-xs text-brown-light">Card, UPI, Netbanking via Razorpay</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${paymentMethod === 'cod' ? 'border-rose bg-rose/5' : 'border-beige-dark hover:border-rose/50'}`}
                  >
                    <Truck size={20} className="text-rose-dark" />
                    <div className="text-left">
                      <p className="font-label font-medium text-brown-deep text-sm">Cash on Delivery</p>
                      <p className="text-xs text-brown-light">Pay when your order arrives</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card-cozy p-6 h-fit sticky top-24">
              <h2 className="font-label font-semibold text-lg text-brown-deep mb-5">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-5 pr-1">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-deep flex-shrink-0">
                      {item.product?.images?.[0]?.url && (
                        <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-brown-deep line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-brown-light">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-brown-deep">₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5 border-t border-beige pt-4 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-brown-light">Subtotal</span><span className="text-brown-deep font-medium">₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-brown-light">Shipping</span><span className="text-brown-deep font-medium">{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                <div className="flex justify-between"><span className="text-brown-light">Tax</span><span className="text-brown-deep font-medium">₹{tax.toLocaleString('en-IN')}</span></div>
              </div>
              <div className="flex justify-between font-label font-semibold text-lg text-brown-deep border-t border-beige pt-4 mb-6">
                <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full justify-center disabled:opacity-50">
                {placing ? 'Placing Order…' : `Place Order · ₹${total.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
