import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer style={{ backgroundColor: '#3d5a5c', color: '#ffffff', paddingTop: '60px', paddingBottom: '32px' }}>
      {/* Stats Section */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 16px',
        marginBottom: '60px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f4e87c', marginBottom: '8px' }}>
              10K+
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>Books Available</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f4e87c', marginBottom: '8px' }}>
              5K+
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>Happy Readers</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f4e87c', marginBottom: '8px' }}>
              500+
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>Authors</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f4e87c', marginBottom: '8px' }}>
              50+
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>Publishers</div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '48px',
        marginBottom: '48px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '48px'
        }}>
          {/* About Section */}
          <div>
            <h3 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#f4e87c',
              fontStyle: 'italic',
              marginBottom: '16px'
            }}>
              BOI.
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9, marginBottom: '16px' }}>
              Your trusted online bookstore for discovering, reading, and enjoying books from around the world.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <Facebook style={{ width: '20px', height: '20px' }} />
              </a>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <Twitter style={{ width: '20px', height: '20px' }} />
              </a>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <Instagram style={{ width: '20px', height: '20px' }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#f4e87c', marginBottom: '16px' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'About Us', id: 'home' },
                { label: 'Browse Books', id: 'books' },
                { label: 'Membership', id: 'membership' },
                { label: 'Authors', id: 'books' },
                { label: 'Publishers', id: 'books' }
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: 0,
                      opacity: 0.9,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.9'}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#f4e87c', marginBottom: '16px' }}>
              Customer Service
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Help Center', id: 'feedback' },
                { label: 'Returns', id: 'feedback' },
                { label: 'Shipping Info', id: 'feedback' },
                { label: 'FAQ', id: 'feedback' },
                { label: 'Feedback', id: 'feedback' }
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: 0,
                      opacity: 0.9,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.9'}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#f4e87c', marginBottom: '16px' }}>
              Contact Us
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>support@boi.com</span>
              </li>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>+1 (555) 123-4567</span>
              </li>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'start', gap: '8px' }}>
                <MapPin style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>123 Book Street, Reading City</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '24px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>
          © 2025 BOI Bookstore. All rights reserved. | Privacy Policy | Terms of Service
        </p>
      </div>
    </footer>
  );
};
