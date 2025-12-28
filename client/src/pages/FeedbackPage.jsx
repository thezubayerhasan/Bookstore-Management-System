import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { feedbackAPI } from '../services/api';
import { MessageSquare, Star, Send, CheckCircle, ThumbsUp, Filter } from 'lucide-react';

export const FeedbackPage = () => {
  const { user, openAuthModal } = useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'service', label: 'Customer Service' },
    { value: 'selection', label: 'Book Selection' },
    { value: 'website', label: 'Website Experience' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'complaint', label: 'Complaint' }
  ];

  useEffect(() => {
    fetchRecentFeedback();
  }, []);

  const fetchRecentFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getRecent(20);
      if (response.success) {
        setFeedbackList(response.data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!message.trim()) {
      alert('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      // Pass null for bookId since this is general feedback
      const response = await feedbackAPI.submit(user.userId || user.id, null, rating, message);
      
      if (response.success) {
        setSubmitted(true);
        setRating(0);
        setMessage('');
        setCategory('general');
        await fetchRecentFeedback();
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFeedback = filterCategory === 'all' 
    ? feedbackList 
    : feedbackList.filter(f => f.category === filterCategory);

  const averageRating = feedbackList.length > 0 
    ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <section style={{
        background: 'linear-gradient(135deg, #3d5a5c 0%, #2a4244 100%)',
        color: '#ffffff',
        padding: '60px 16px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <MessageSquare style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.2' }}>
            We Value Your Feedback
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            Help us improve by sharing your thoughts and experiences
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="lg:grid-cols-3">
          <div style={{ gridColumn: '1 / -1' }} className="lg:col-span-2">
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>
                Share Your Experience
              </h2>

              {submitted ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '12px'
                }}>
                  <CheckCircle style={{ width: '64px', height: '64px', color: '#10b981', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                    Thank You!
                  </h3>
                  <p style={{ fontSize: '16px', color: '#059669' }}>
                    Your feedback has been submitted successfully
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                      Rate Your Experience
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
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
                              fill: (hoverRating || rating) >= star ? '#fbbf24' : 'none',
                              color: '#fbbf24'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Your Feedback
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows="6"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: isSubmitting ? '#9ca3af' : '#d4145a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>

            {/* Recent Feedback Section */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              marginTop: '32px'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>
                Recent Feedback
              </h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#6b7280' }}>Loading feedback...</p>
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <MessageSquare style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 16px' }} />
                  <p style={{ color: '#6b7280' }}>No feedback yet. Be the first to share!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredFeedback.map(item => (
                    <div key={item.id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <p style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                            {item.user_name || 'Anonymous'}
                          </p>
                          {item.book_title && (
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>
                              Book: {item.book_title}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              style={{
                                width: '16px',
                                height: '16px',
                                fill: star <= item.rating ? '#fbbf24' : 'none',
                                color: '#fbbf24'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '8px' }}>
                        {item.comment}
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(item.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
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
