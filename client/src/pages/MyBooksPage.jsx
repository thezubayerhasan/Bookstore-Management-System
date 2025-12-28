import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Download, Eye, Search, Calendar, Filter } from 'lucide-react';

export const MyBooksPage = ({ onNavigate }) => {
  const { myBooks, openEbookPreview, user, openAuthModal, loading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, recent, oldest

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
            <BookOpen style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
              Login Required
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              Please login to view your purchased books
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

  const filteredBooks = myBooks
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (filterBy === 'recent') {
        return new Date(b.purchased_at || b.purchaseDate) - new Date(a.purchased_at || a.purchaseDate);
      } else if (filterBy === 'oldest') {
        return new Date(a.purchased_at || a.purchaseDate) - new Date(b.purchased_at || b.purchaseDate);
      }
      return 0;
    });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>
            My Books
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Your personal library of {myBooks.length} {myBooks.length === 1 ? 'book' : 'books'}
          </p>
        </div>

        {myBooks.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <BookOpen style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
              No books yet
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              Start building your library by purchasing books
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
          <>
            {/* Search and Filter */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', position: 'relative' }}>
                <Search style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#9ca3af'
                }} />
                <input
                  type="text"
                  placeholder="Search your books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d4145a'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                style={{
                  padding: '12px 36px 12px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center'
                }}
              >
                <option value="all">All Books</option>
                <option value="recent">Recently Purchased</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Books Grid */}
            {filteredBooks.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {filteredBooks.map(book => (
                  <div
                    key={book.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', padding: '16px' }}>
                      <img
                        src={book.cover_image || book.image}
                        alt={book.title}
                        style={{
                          width: '100px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px', lineHeight: '1.4' }}>
                          {book.title}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                          {book.author}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: '#9ca3af',
                          marginBottom: '12px'
                        }}>
                          <Calendar style={{ width: '14px', height: '14px' }} />
                          Purchased: {formatDate(book.purchased_at || book.purchaseDate)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEbookPreview(book);
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#d4145a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b01149'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d4145a'}
                          >
                            <Eye style={{ width: '14px', height: '14px' }} />
                            Read
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Download feature coming soon!');
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          >
                            <Download style={{ width: '14px', height: '14px' }} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#ffffff',
                borderRadius: '12px'
              }}>
                <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>
                  No books found
                </p>
                <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                  Try adjusting your search query
                </p>
              </div>
            )}
          </>
        )}

        {/* Reading Stats */}
        {myBooks.length > 0 && (
          <div style={{
            marginTop: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <BookOpen style={{ width: '32px', height: '32px', color: '#d4145a', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' }}>
                {myBooks.length}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Books Owned</p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <Calendar style={{ width: '32px', height: '32px', color: '#10b981', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' }}>
                {new Set(myBooks.map(b => b.author)).size}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Authors</p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <Download style={{ width: '32px', height: '32px', color: '#f59e0b', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' }}>
                {new Set(myBooks.map(b => b.category)).size}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Categories</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
