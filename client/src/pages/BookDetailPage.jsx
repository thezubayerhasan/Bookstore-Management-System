import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { booksAPI, feedbackAPI } from '../services/api';
import { Star, ShoppingCart, Eye, ArrowLeft, BookOpen, Package, Award, Info, MessageSquare } from 'lucide-react';

export const BookDetailPage = ({ book: initialBook, onNavigate }) => {
  const { addToCart, openEbookPreview, user, openAuthModal } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [book, setBook] = useState(initialBook);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(!initialBook);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  useEffect(() => {
    if (initialBook && initialBook.id) {
      fetchBookDetails(initialBook.id);
      fetchBookFeedback(initialBook.id);
    }
  }, [initialBook]);

  const fetchBookDetails = async (bookId) => {
    try {
      const response = await booksAPI.getById(bookId);
      if (response.success) {
        setBook({
          ...response.data,
          image: response.data.cover_image,
          price: parseFloat(response.data.price)
        });
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookFeedback = async (bookId) => {
    try {
      const response = await feedbackAPI.getBookFeedback(bookId, { limit: 10 });
      if (response.success) {
        setFeedback(response.data.feedback || []);
        
        // Check if current user has already reviewed this book
        if (user) {
          const userReview = response.data.feedback.find(f => f.user_id === (user.userId || user.id));
          setHasUserReviewed(!!userReview);
          if (userReview) {
            setUserRating(userReview.rating);
            setUserComment(userReview.comment || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  if (!book) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '60px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Book not found</p>
          <button
            onClick={() => onNavigate('books')}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              backgroundColor: '#d4145a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    addToCart(book, quantity);
  };

  const handlePreview = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    // Will check membership in the modal component
    openEbookPreview(book);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await feedbackAPI.submit(
        user.userId || user.id,
        book.id,
        userRating,
        userComment.trim()
      );
      
      if (response.success) {
        alert('Review submitted successfully!');
        setHasUserReviewed(true);
        // Refresh book details and feedback
        await fetchBookDetails(book.id);
        await fetchBookFeedback(book.id);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Back Button */}
        <button
          onClick={() => onNavigate('books')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '24px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to Books
        </button>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          '@media (min-width: 768px)': {
            gridTemplateColumns: '400px 1fr'
          }
        }} className="md:grid-cols-2">
          {/* Left Column - Image */}
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              position: 'sticky',
              top: '80px'
            }}>
              <div style={{
                position: 'relative',
                paddingTop: '150%',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
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
              <button
                onClick={handlePreview}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                <Eye style={{ width: '18px', height: '18px' }} />
                Preview Book
              </button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              {/* Title and Author */}
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px', lineHeight: '1.2' }}>
                {book.title}
              </h1>
              <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '16px' }}>
                by {book.author}
              </p>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      style={{
                        width: '20px',
                        height: '20px',
                        fill: i < Math.floor(book.rating) ? '#fbbf24' : 'none',
                        color: '#fbbf24'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>
                  {book.rating}
                </span>
                <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                  (128 reviews)
                </span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#d4145a' }}>
                  ${book.price}
                </span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
                  About this book
                </h3>
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#4b5563' }}>
                  {book.description}
                </p>
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Quantity
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '18px',
                        color: quantity <= 1 ? '#9ca3af' : '#374151',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (quantity > 1) e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 20px', fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        cursor: quantity >= 10 ? 'not-allowed' : 'pointer',
                        fontSize: '18px',
                        color: quantity >= 10 ? '#9ca3af' : '#374151',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (quantity < 10) e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Total: ${(book.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                style={{
                  width: '100%',
                  padding: '16px',
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
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b01149'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d4145a'}
              >
                <ShoppingCart style={{ width: '20px', height: '20px' }} />
                Add to Cart
              </button>
            </div>

            {/* Book Details */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>
                Book Details
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <DetailRow icon={BookOpen} label="ISBN" value={book.isbn} />
                <DetailRow icon={Package} label="Publisher" value={book.publisher} />
                <DetailRow icon={Award} label="Category" value={book.category} />
                <DetailRow icon={Info} label="Pages" value={`${book.pages} pages`} />
                <DetailRow icon={Info} label="Format" value={book.format} />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '32px auto 0', 
          padding: '0 16px' 
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>
              Ratings & Reviews
            </h2>

            {/* Rating Summary */}
            <div style={{
              display: 'flex',
              gap: '32px',
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>
                  {book.rating ? parseFloat(book.rating).toFixed(1) : '0.0'}
                </div>
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      style={{
                        width: '20px',
                        height: '20px',
                        fill: star <= Math.round(book.rating || 0) ? '#fbbf24' : 'none',
                        color: '#fbbf24'
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  {book.reviews_count || 0} {book.reviews_count === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            {/* Write Review Form */}
            {!hasUserReviewed && (
              <div style={{
                marginBottom: '32px',
                padding: '24px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>
                  Write a Review
                </h3>
                
                {user ? (
                  <form onSubmit={handleSubmitReview}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Your Rating
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <Star
                              style={{
                                width: '32px',
                                height: '32px',
                                fill: (hoverRating || userRating) >= star ? '#fbbf24' : 'none',
                                color: '#fbbf24',
                                transition: 'all 0.2s'
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Your Review (Optional)
                      </label>
                      <textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Share your thoughts about this book..."
                        rows="4"
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
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview || userRating === 0}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: isSubmittingReview || userRating === 0 ? '#9ca3af' : '#d4145a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isSubmittingReview || userRating === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <MessageSquare style={{ width: '16px', height: '16px' }} />
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                      Please login to write a review
                    </p>
                    <button
                      onClick={() => openAuthModal('login')}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#d4145a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* User's Existing Review */}
            {hasUserReviewed && (
              <div style={{
                marginBottom: '32px',
                padding: '24px',
                backgroundColor: '#e0f2fe',
                border: '2px solid #0ea5e9',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Star style={{ width: '16px', height: '16px', fill: '#0ea5e9', color: '#0ea5e9' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#075985' }}>
                    Your Review
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      style={{
                        width: '20px',
                        height: '20px',
                        fill: star <= userRating ? '#fbbf24' : 'none',
                        color: '#fbbf24'
                      }}
                    />
                  ))}
                </div>
                {userComment && (
                  <p style={{ color: '#075985', lineHeight: '1.6' }}>
                    {userComment}
                  </p>
                )}
              </div>
            )}

            {/* All Reviews */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>
                Customer Reviews
              </h3>
              
              {feedback.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <MessageSquare style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 16px' }} />
                  <p style={{ color: '#6b7280' }}>No reviews yet. Be the first to review this book!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {feedback.map(review => (
                    <div key={review.id} style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <p style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                            {review.user_name || 'Anonymous'}
                          </p>
                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  fill: star <= review.rating ? '#fbbf24' : 'none',
                                  color: '#fbbf24'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {new Date(review.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      {review.comment && (
                        <p style={{ color: '#374151', lineHeight: '1.6' }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
    <Icon style={{ width: '18px', height: '18px', color: '#d4145a', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>{value}</p>
    </div>
  </div>
);
