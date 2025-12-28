import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { booksAPI } from '../services/api';
import { Star, ShoppingCart, Eye, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Footer } from '../components/Footer';

export const HomePage = ({ onNavigate }) => {
  const { addToCart, openEbookPreview, user, openAuthModal } = useApp();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured books
        const featuredResponse = await booksAPI.getAll({ 
          featured: true, 
          limit: 6,
          sortBy: 'rating',
          order: 'DESC'
        });
        if (featuredResponse.success) {
          setFeaturedBooks(featuredResponse.data.map(book => ({
            ...book,
            image: book.cover_image,
            price: parseFloat(book.price)
          })));
        }

        // Fetch new arrivals
        const newResponse = await booksAPI.getAll({ 
          limit: 6,
          sortBy: 'created_at',
          order: 'DESC'
        });
        if (newResponse.success) {
          setNewArrivals(newResponse.data.map(book => ({
            ...book,
            image: book.cover_image,
            price: parseFloat(book.price)
          })));
        }

        // Fetch categories
        const categoriesResponse = await booksAPI.getCategories();
        if (categoriesResponse.success) {
          const categoryIcons = {
            'Fiction': '📚',
            'Science Fiction': '🚀',
            'Self-Help': '💡',
            'Business': '💼',
            'Biography': '👤',
            'History': '🏛️',
            'Mystery': '🔍',
            'Romance': '❤️',
            'Science': '🔬',
            'Technology': '💻',
            'Philosophy': '🤔',
            'Poetry': '✍️',
            'Classic': '📜',
            'Fantasy': '🐉',
            'Thriller': '😱',
            'Horror': '👻'
          };
          
          const colors = ['#d4145a', '#ff8c42', '#3d5a5c', '#f4e87c'];
          
          setCategories(categoriesResponse.data.map((cat, index) => ({
            id: index + 1,
            name: cat.category,
            icon: categoryIcons[cat.category] || '📖',
            count: cat.count,
            color: colors[index % colors.length]
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (book) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    addToCart(book);
  };

  const handlePreview = (book) => {
    openEbookPreview(book);
  };

  const BookCard = ({ book, showNewBadge = false }) => (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s',
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
    }}
    onClick={() => onNavigate('bookdetail', book)}
    >
      <div style={{ position: 'relative', paddingTop: '150%', backgroundColor: '#f3f4f6' }}>
        <img
          src={book.image}
          alt={book.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {showNewBadge && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#d4145a',
            color: '#ffffff',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles style={{ width: '14px', height: '14px' }} />
            NEW
          </div>
        )}
      </div>
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px', lineHeight: '1.4' }}>
          {book.title}
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
          {book.author}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          <Star style={{ width: '16px', height: '16px', fill: '#fbbf24', color: '#fbbf24' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{book.rating}</span>
          <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>({book.category})</span>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#d4145a' }}>
              ${book.price}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(book);
              }}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              <Eye style={{ width: '16px', height: '16px' }} />
              Preview
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(book);
              }}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#d4145a',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b01149'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d4145a'}
            >
              <ShoppingCart style={{ width: '16px', height: '16px' }} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTopColor: '#d4145a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      ) : (
        <>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #d4145a 0%, #b01149 100%)',
        color: '#ffffff',
        padding: '80px 16px 100px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.2' }}>
            Discover Your Next Great Read
          </h1>
          <p style={{ fontSize: '20px', marginBottom: '40px', opacity: 0.95, maxWidth: '800px', margin: '0 auto 40px' }}>
            Explore thousands of books, from bestsellers to hidden gems. Read online, download, or get them delivered to your doorstep.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('books')}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #ff8c42 0%, #f59e0b 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 140, 66, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.3)';
              }}
            >
              Browse Books
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </button>
            <button
              onClick={() => onNavigate('membership')}
              style={{
                padding: '14px 32px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Try Free for 30 Days
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 16px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '32px', textAlign: 'center' }}>
            Browse by Category
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '16px'
          }}>
            {categories.map(category => (
              <div
                key={category.id}
                onClick={() => onNavigate('books', { category: category.name })}
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '24px 16px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = category.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{category.icon}</div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                  {category.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  {category.count} books
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section style={{ padding: '60px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <TrendingUp style={{ width: '28px', height: '28px', color: '#d4145a' }} />
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>
              Featured Books
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {featuredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section style={{ padding: '60px 16px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <Sparkles style={{ width: '28px', height: '28px', color: '#d4145a' }} />
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>
              New Arrivals
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {newArrivals.map(book => (
              <BookCard key={book.id} book={book} showNewBadge />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '60px 16px',
        background: 'linear-gradient(135deg, #3d5a5c 0%, #2a4244 100%)',
        color: '#ffffff'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
            Join Our Premium Membership
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>
            Get unlimited access to our entire collection and exclusive benefits
          </p>
          <button
            onClick={() => onNavigate('membership')}
            style={{
              padding: '14px 32px',
              backgroundColor: '#ffffff',
              color: '#3d5a5c',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
        </>
      )}
    </div>
  );
};
