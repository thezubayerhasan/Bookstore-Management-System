import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { booksAPI } from '../services/api';
import { Search, Filter, Star, ShoppingCart, Eye, X, SlidersHorizontal } from 'lucide-react';

export const BooksPage = ({ onNavigate, initialFilter }) => {
  const { addToCart, openEbookPreview, user, openAuthModal } = useApp();
  
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialFilter?.category || 'All');
  const [sortBy, setSortBy] = useState('rating');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [selectedCategory, sortBy]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        sortBy: sortBy === 'price-low' || sortBy === 'price-high' ? 'price' : sortBy,
        order: sortBy === 'price-low' ? 'ASC' : 'DESC',
        limit: 100
      };

      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      const response = await booksAPI.getAll(params);
      if (response.success) {
        setBooks(response.data.map(book => ({
          ...book,
          image: book.cover_image,
          price: parseFloat(book.price)
        })));
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await booksAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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

  // Filter and sort books
  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = book.price >= priceRange[0] && book.price <= priceRange[1];
      const matchesRating = book.rating >= minRating;
      return matchesSearch && matchesPrice && matchesRating;
    });

  const allCategories = ['All', ...categories];

  const BookCard = ({ book }) => (
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
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>
            Browse Books
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Discover from our collection of {books.length} amazing books
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
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
                placeholder="Search by title or author..."
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

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
              <option value="featured">Featured</option>
              <option value="title">Title (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="rating">Rating (Highest)</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '12px 16px',
                backgroundColor: showFilters ? '#d4145a' : '#ffffff',
                color: showFilters ? '#ffffff' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <SlidersHorizontal style={{ width: '16px', height: '16px' }} />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              {/* Category Filter */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
                  Category
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {allCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: selectedCategory === category ? '#d4145a' : '#f3f4f6',
                        color: selectedCategory === category ? '#ffffff' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Rating Filter */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
                  Minimum Rating
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[0, 3, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: minRating === rating ? '#d4145a' : '#f3f4f6',
                        color: minRating === rating ? '#ffffff' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {rating === 0 ? 'All' : `${rating}+`}
                      {rating > 0 && <Star style={{ width: '12px', height: '12px' }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
          </p>
          {(searchQuery || selectedCategory !== 'All' || priceRange[1] < 100 || minRating > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setPriceRange([0, 100]);
                setMinRating(0);
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} />
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
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
