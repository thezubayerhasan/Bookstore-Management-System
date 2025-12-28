import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { membershipAPI } from '../services/api';
import { Check, Crown, Star, Zap, BookOpen, Download, Tag, Sparkles } from 'lucide-react';

export const MembershipPage = ({ onNavigate }) => {
  const { user, membership, subscribeMembership, openAuthModal } = useApp();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await membershipAPI.getPlans();
      if (response.success) {
        const planIcons = {
          'basic': BookOpen,
          'premium': Star,
          'enterprise': Crown
        };
        const planColors = {
          'basic': '#3d5a5c',
          'premium': '#d4145a',
          'enterprise': '#f59e0b'
        };
        setPlans(response.data.map(plan => ({
          ...plan,
          id: plan.type,
          icon: planIcons[plan.type] || BookOpen,
          color: planColors[plan.type] || '#3d5a5c',
          popular: plan.type === 'premium'
        })));
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setSelectedPlan(plan);
  };

  const confirmSubscription = async () => {
    setError('');
    setIsSubscribing(true);

    try {
      const result = await subscribeMembership(selectedPlan);
      
      if (result.success) {
        setSelectedPlan(null);
      } else {
        // Check if error is about one month restriction
        if (result.daysRemaining !== undefined) {
          setError(`You can change your subscription after one month. ${result.daysRemaining} days remaining.`);
        } else {
          setError(result.error || 'Subscription failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #d4145a 0%, #b01149 100%)',
        color: '#ffffff',
        padding: '60px 16px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '20px', marginBottom: '16px' }}>
            <Sparkles style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Premium Membership</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.2' }}>
            Unlock Unlimited Reading
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px' }}>
            Choose a plan that fits your reading lifestyle and get instant access to thousands of books
          </p>
        </div>
      </section>

      {/* Current Membership Status */}
      {membership && (
        <div style={{ maxWidth: '1200px', margin: '-40px auto 32px', padding: '0 16px' }}>
          <div style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '20px 24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Check style={{ width: '24px', height: '24px' }} />
              <div>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>Active Membership</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{membership?.plan?.name || 'Basic'} Plan</p>
              </div>
            </div>
            <button
              onClick={() => alert('Manage subscription feature coming soon!')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              Manage Subscription
            </button>
          </div>
        </div>
      )}

      {/* Plans */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {plans.map(plan => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: plan.popular ? '0 20px 25px -5px rgba(212, 20, 90, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  border: plan.popular ? '2px solid #d4145a' : '2px solid transparent',
                  position: 'relative',
                  transition: 'all 0.3s',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = plan.popular ? 'scale(1.05)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = plan.popular ? '0 20px 25px -5px rgba(212, 20, 90, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#d4145a',
                    color: '#ffffff',
                    padding: '4px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Zap style={{ width: '12px', height: '12px' }} />
                    MOST POPULAR
                  </div>
                )}

                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: `${plan.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Icon style={{ width: '32px', height: '32px', color: plan.color }} />
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>
                  {plan.name}
                </h3>

                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#1a1a1a' }}>
                    ${plan.price}
                  </span>
                  <span style={{ fontSize: '16px', color: '#6b7280' }}>/month</span>
                </div>

                <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  {plan.features.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                      <Check style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={membership?.plan?.id === plan.id}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: membership?.plan?.id === plan.id ? '#e5e7eb' : (plan.popular ? '#d4145a' : plan.color),
                    color: membership?.plan?.id === plan.id ? '#9ca3af' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: membership?.plan?.id === plan.id ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (membership?.plan?.id !== plan.id) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {membership?.plan?.id === plan.id ? 'Current Plan' : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ backgroundColor: '#ffffff', padding: '60px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: '48px' }}>
            Why Choose Our Membership?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            <BenefitCard
              icon={BookOpen}
              title="Vast Library"
              description="Access thousands of books across all genres and categories"
              color="#d4145a"
            />
            <BenefitCard
              icon={Download}
              title="Offline Reading"
              description="Download books and read them anytime, anywhere without internet"
              color="#10b981"
            />
            <BenefitCard
              icon={Tag}
              title="Exclusive Discounts"
              description="Get special discounts on book purchases and merchandise"
              color="#f59e0b"
            />
            <BenefitCard
              icon={Sparkles}
              title="Early Access"
              description="Be the first to read new releases before anyone else"
              color="#8b5cf6"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 16px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: '40px' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FAQItem
            question="Can I cancel my subscription anytime?"
            answer="Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
          />
          <FAQItem
            question="Do you offer a free trial?"
            answer="We offer a 7-day free trial for all new members. You can explore all features before committing to a paid plan."
          />
          <FAQItem
            question="Can I switch between plans?"
            answer="Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
          />
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept all major credit cards, debit cards, and PayPal for your convenience."
          />
        </div>
      </section>

      {/* Subscription Confirmation Modal */}
      {selectedPlan && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
          onClick={() => setSelectedPlan(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '450px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '16px' }}>
              Confirm Subscription
            </h3>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              You're about to subscribe to the <strong style={{ color: '#1a1a1a' }}>{selectedPlan.name} Plan</strong> for ${selectedPlan.price}/month.
            </p>
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                This is a demo. No actual payment will be processed.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSubscription}
                style={{
                  flex: 1,
                  padding: '12px',
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
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BenefitCard = ({ icon: Icon, title, description, color }) => (
  <div style={{
    textAlign: 'center',
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    transition: 'transform 0.3s'
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{
      width: '60px',
      height: '60px',
      backgroundColor: `${color}15`,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px'
    }}>
      <Icon style={{ width: '28px', height: '28px', color: color }} />
    </div>
    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
      {title}
    </h3>
    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
      {description}
    </p>
  </div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      cursor: 'pointer'
    }}
    onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
          {question}
        </h4>
        <span style={{ fontSize: '20px', color: '#6b7280', transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▼
        </span>
      </div>
      {isOpen && (
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px', lineHeight: '1.6' }}>
          {answer}
        </p>
      )}
    </div>
  );
};
