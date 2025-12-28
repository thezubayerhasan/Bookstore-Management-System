import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart, User, Menu, X, LogOut, BookOpen, Package, CreditCard, MessageSquare, LayoutDashboard } from 'lucide-react';

export const Header = ({ currentPage, onNavigate }) => {
  const { user, isAdmin, logout, cartCount, openAuthModal } = useApp();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'books', label: 'Books' },
    { id: 'membership', label: 'Membership' },
    { id: 'feedback', label: 'Feedback' }
  ];

  const userMenuItems = isAdmin ? [
    { id: 'admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User }
  ] : [
    { id: 'mybooks', label: 'My Books', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    setShowMobileMenu(false);
  };

  const handleUserMenuClick = (pageId) => {
    onNavigate(pageId);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    onNavigate('home');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#3d5a5c',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <span style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#f4e87c',
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif'
            }}>
              BOI.
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'none',
            gap: '32px',
            '@media (min-width: 768px)': { display: 'flex' }
          }} className="hidden md:flex">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  fontSize: '16px',
                  fontWeight: currentPage === link.id ? '600' : '500',
                  color: currentPage === link.id ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => {
                  if (currentPage !== link.id) e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search Icon */}
            <button
              onClick={() => handleNavClick('books')}
              style={{
                padding: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.8)',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
            >
              <Search style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Cart */}
            <button
              onClick={() => handleNavClick('checkout')}
              style={{
                position: 'relative',
                padding: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.8)',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
            >
              <ShoppingCart style={{ width: '24px', height: '24px' }} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  backgroundColor: '#ff8c42',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#ffffff',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%'
                    }}
                  />
                  <span className="hidden md:inline" style={{ fontSize: '14px', fontWeight: '500' }}>
                    {user.name}
                  </span>
                </button>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    minWidth: '200px',
                    overflow: 'hidden',
                    zIndex: 50
                  }}>
                    {userMenuItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleUserMenuClick(item.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Icon style={{ width: '16px', height: '16px' }} />
                          {item.label}
                        </button>
                      );
                    })}
                    <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#dc2626',
                        textAlign: 'left',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut style={{ width: '16px', height: '16px' }} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #ff8c42 0%, #f59e0b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(255, 140, 66, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 140, 66, 0.3)';
                }}
              >
                <User style={{ width: '20px', height: '20px' }} />
                <span className="hidden md:inline">Login</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                display: 'block',
                padding: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4b5563'
              }}
              className="md:hidden"
            >
              {showMobileMenu ? (
                <X style={{ width: '24px', height: '24px' }} />
              ) : (
                <Menu style={{ width: '24px', height: '24px' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <nav style={{
            display: 'block',
            paddingBottom: '16px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px'
          }} className="md:hidden">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  textAlign: 'left',
                  fontSize: '16px',
                  fontWeight: currentPage === link.id ? '600' : '500',
                  color: currentPage === link.id ? '#d4145a' : '#4b5563',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
