import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Camera, Package, CreditCard, Crown } from 'lucide-react';

export const ProfilePage = ({ onNavigate }) => {
  const { user, updateProfile, orders, membership, openAuthModal } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '48px 32px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <User style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
              Login Required
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              Please login to view your profile
            </p>
            <button
              onClick={() => openAuthModal('login')}
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
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' }); // Clear message on input change
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });
      
      console.log('Update profile result:', result); // Debug log
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        console.error('Profile update failed:', result); // Debug log
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error); // Debug log
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred while updating profile';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || ''
    });
    setMessage({ type: '', text: '' });
    setIsEditing(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '32px' }}>
          My Profile
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-3">
          {/* Profile Card */}
          <div style={{ gridColumn: '1 / -1' }} className="lg:col-span-2">
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  >
                    <Edit2 style={{ width: '16px', height: '16px' }} />
                    Edit Profile
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        opacity: isSaving ? 0.5 : 1
                      }}
                    >
                      <X style={{ width: '16px', height: '16px' }} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        backgroundColor: '#d4145a',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ffffff',
                        transition: 'background-color 0.2s',
                        opacity: isSaving ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#b01149')}
                      onMouseLeave={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#d4145a')}
                    >
                      <Save style={{ width: '16px', height: '16px' }} />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {/* Success/Error Message */}
              {message.text && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                  color: message.type === 'success' ? '#065f46' : '#991b1b',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {message.text}
                </div>
              )}

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      border: '4px solid #f3f4f6'
                    }}
                  />
                  {isEditing && (
                    <button
                      onClick={() => alert('Avatar upload coming soon!')}
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#d4145a',
                        border: '3px solid #ffffff',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      <Camera style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                    {user.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    {user.email}
                  </p>
                  {user.role === 'admin' && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 12px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      <Crown style={{ width: '14px', height: '14px' }} />
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <User style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
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
                  ) : (
                    <p style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: '#1a1a1a' }}>
                      {user.name}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <Mail style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
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
                  ) : (
                    <p style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: '#1a1a1a' }}>
                      {user.email}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <Phone style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
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
                  ) : (
                    <p style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: user.phone ? '#1a1a1a' : '#9ca3af' }}>
                      {user.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <MapPin style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your address"
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4145a'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  ) : (
                    <p style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: user.address ? '#1a1a1a' : '#9ca3af', lineHeight: '1.5' }}>
                      {user.address || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Membership Card */}
            {membership ? (
              <div style={{
                backgroundColor: 'linear-gradient(135deg, #d4145a 0%, #b01149 100%)',
                background: 'linear-gradient(135deg, #d4145a 0%, #b01149 100%)',
                borderRadius: '12px',
                padding: '24px',
                color: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Crown style={{ width: '24px', height: '24px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Premium Member</h3>
                </div>
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px' }}>
                  {membership?.plan?.name || 'Basic'}  Plan
                </p>
                <button
                  onClick={() => onNavigate('membership')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Manage Membership
                </button>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <Crown style={{ width: '48px', height: '48px', color: '#d4145a', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                  Upgrade to Premium
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  Get unlimited access to all books
                </p>
                <button
                  onClick={() => onNavigate('membership')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#d4145a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b01149'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#d4145a'}
                >
                  View Plans
                </button>
              </div>
            )}

            {/* Stats Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                Account Stats
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <StatItem icon={Package} label="Orders" value={orders.length} />
                <StatItem icon={CreditCard} label="Total Spent" value={`$${orders.reduce((sum, order) => sum + parseFloat(order.total_amount || order.total || 0), 0).toFixed(2)}`} />
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => onNavigate('mybooks')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    textAlign: 'left',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  View My Books
                </button>
                <button
                  onClick={() => onNavigate('books')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    textAlign: 'left',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  Browse Books
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Icon style={{ width: '18px', height: '18px', color: '#6b7280' }} />
      <span style={{ fontSize: '14px', color: '#6b7280' }}>{label}</span>
    </div>
    <span style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>{value}</span>
  </div>
);
