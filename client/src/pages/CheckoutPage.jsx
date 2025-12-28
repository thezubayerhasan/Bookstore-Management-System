import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, CheckCircle, Package, Tag } from 'lucide-react';

export const CheckoutPage = ({ onNavigate }) => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, checkout, user, openAuthModal } = useApp();
  const [step, setStep] = useState('cart'); // cart, payment, success
  const [orderDetails, setOrderDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Payment Form State
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cash'
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setStep('payment');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      console.log('Starting checkout with payment info:', paymentInfo);
      const result = await checkout(paymentInfo);
      console.log('Checkout result:', result);
      
      if (result.success) {
        setOrderDetails(result.order);
        setStep('success');
      } else {
        setError(result.error || 'Checkout failed. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  // Cart View
  if (step === 'cart') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '32px' }}>
            Shopping Cart
          </h1>

          {cart.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <ShoppingBag style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                Your cart is empty
              </h2>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
                Start adding some books to your cart!
              </p>
              <button
                onClick={() => onNavigate('books')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#d4145a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b01149'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#d4145a'}
              >
                Browse Books
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-3">
              {/* Cart Items */}
              <div style={{ gridColumn: '1 / -1' }} className="lg:col-span-2">
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                    Cart Items ({cart.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cart.map(item => (
                      <div key={item.id} style={{
                        display: 'flex',
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: '80px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                            {item.title}
                          </h3>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                            {item.author}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden' }}>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#ffffff',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#374151'
                                }}
                              >
                                <Minus style={{ width: '14px', height: '14px' }} />
                              </button>
                              <span style={{ padding: '0 16px', fontSize: '14px', fontWeight: '600', backgroundColor: '#ffffff' }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#ffffff',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#374151'
                                }}
                              >
                                <Plus style={{ width: '14px', height: '14px' }} />
                              </button>
                            </div>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4145a' }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            padding: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            borderRadius: '6px',
                            transition: 'background-color 0.2s',
                            alignSelf: 'flex-start'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 style={{ width: '18px', height: '18px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  position: 'sticky',
                  top: '80px'
                }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                    Order Summary
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Subtotal</span>
                      <span style={{ fontWeight: '600', color: '#1a1a1a' }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Shipping</span>
                      <span style={{ fontWeight: '600', color: shipping === 0 ? '#10b981' : '#1a1a1a' }}>
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p style={{ fontSize: '12px', color: '#d4145a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag style={{ width: '14px', height: '14px' }} />
                        Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Tax (10%)</span>
                      <span style={{ fontWeight: '600', color: '#1a1a1a' }}>${tax.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '18px' }}>
                    <span style={{ fontWeight: '600', color: '#1a1a1a' }}>Total</span>
                    <span style={{ fontWeight: 'bold', color: '#d4145a' }}>${total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#d4145a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b01149'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#d4145a'}
                  >
                    <CreditCard style={{ width: '20px', height: '20px' }} />
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Payment View
  if (step === 'payment') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '32px' }}>
            Payment Information
          </h1>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              color: '#991b1b',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Payment Form */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <form onSubmit={handlePayment}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    required
                    maxLength="19"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4145a'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={paymentInfo.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4145a'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      required
                      maxLength="5"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4145a'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      required
                      maxLength="3"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4145a'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Billing Address
                  </label>
                  <input
                    type="text"
                    placeholder="123 Main Street"
                    value={paymentInfo.billingAddress}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4145a'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="New York"
                      value={paymentInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4145a'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Zip Code
                    </label>
                    <input
                      type="text"
                      placeholder="10001"
                      value={paymentInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4145a'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      padding: '14px',
                      backgroundColor: isProcessing ? '#9ca3af' : '#d4145a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => !isProcessing && (e.target.style.backgroundColor = '#b01149')}
                    onMouseLeave={(e) => !isProcessing && (e.target.style.backgroundColor = '#d4145a')}
                  >
                    {isProcessing ? 'Processing...' : `Complete Purchase $${total.toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>
                Order Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span style={{ fontWeight: '600', color: '#1a1a1a' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Shipping</span>
                  <span style={{ fontWeight: '600', color: '#1a1a1a' }}>${shipping.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Tax</span>
                  <span style={{ fontWeight: '600', color: '#1a1a1a' }}>${tax.toFixed(2)}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                  <span style={{ fontWeight: '600', color: '#1a1a1a' }}>Total</span>
                  <span style={{ fontWeight: 'bold', color: '#d4145a' }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success View
  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '48px 32px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#d1fae5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <CheckCircle style={{ width: '48px', height: '48px', color: '#10b981' }} />
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '12px' }}>
              Order Successful!
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
              Thank you for your purchase!
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '32px' }}>
              Order ID: {orderDetails?.id}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => onNavigate('mybooks')}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#d4145a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b01149'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#d4145a'}
              >
                <Package style={{ width: '20px', height: '20px' }} />
                View My Books
              </button>
              <button
                onClick={() => onNavigate('home')}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
