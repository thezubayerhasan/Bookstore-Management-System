import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { adminAPI, booksAPI } from '../services/api';
import { LayoutDashboard, BookOpen, Users, ShoppingBag, DollarSign, TrendingUp, Package, Star, Edit, Trash2, Plus, X } from 'lucide-react';

export const AdminDashboard = ({ onNavigate }) => {
  const { user, openAuthModal, orders } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    price: '',
    coverImage: '',
    publishYear: '',
    pages: '',
    language: 'English',
    publisher: '',
    isbn: '',
    stockQuantity: 0,
    isFeatured: false,
    isBestseller: false
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const dashResponse = await adminAPI.getDashboard();
      if (dashResponse.success) {
        setDashboardData(dashResponse.data);
      }

      // Fetch all users
      const usersResponse = await adminAPI.getAllUsers();
      if (usersResponse.success) {
        setUsers(usersResponse.data);
      }

      // Fetch all books
      const booksResponse = await booksAPI.getAll({ limit: 1000 });
      if (booksResponse.success) {
        setBooks(booksResponse.data.map(book => ({
          ...book,
          image: book.cover_image,
          price: parseFloat(book.price)
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    try {
      const response = await adminAPI.addBook(bookForm);
      if (response.success) {
        alert('Book added successfully!');
        setShowAddBookModal(false);
        resetBookForm();
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert(error.response?.data?.message || 'Error adding book');
    }
  };

  const handleEditBook = async () => {
    try {
      const response = await adminAPI.updateBook(selectedBook.id, bookForm);
      if (response.success) {
        alert('Book updated successfully!');
        setShowEditBookModal(false);
        setSelectedBook(null);
        resetBookForm();
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating book:', error);
      alert(error.response?.data?.message || 'Error updating book');
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      return;
    }
    
    try {
      const response = await adminAPI.deleteBook(bookId);
      if (response.success) {
        alert(response.message || 'Book deleted successfully!');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert(error.response?.data?.message || 'Error deleting book');
    }
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description || '',
      price: book.price,
      coverImage: book.cover_image || book.image,
      publishYear: book.publish_year || '',
      pages: book.pages || '',
      language: book.language || 'English',
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      stockQuantity: book.stock_quantity || 0,
      isFeatured: book.is_featured || false,
      isBestseller: book.is_bestseller || false
    });
    setShowEditBookModal(true);
  };

  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      category: '',
      description: '',
      price: '',
      coverImage: '',
      publishYear: '',
      pages: '',
      language: 'English',
      publisher: '',
      isbn: '',
      stockQuantity: 0,
      isFeatured: false,
      isBestseller: false
    });
  };

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
            <LayoutDashboard style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
              Login Required
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              Please login as admin to access the dashboard
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

  if (user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '48px 32px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <LayoutDashboard style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
              Access Denied
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              You don't have permission to access the admin dashboard
            </p>
            <button
              onClick={() => onNavigate('home')}
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
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats from dashboard data
  const totalRevenue = parseFloat(dashboardData?.overview?.totalRevenue) || 0;
  const totalOrders = parseInt(dashboardData?.overview?.totalOrderItems) || 0;
  const totalUsers = parseInt(dashboardData?.overview?.totalUsers) || 0;
  const totalBooks = parseInt(dashboardData?.overview?.totalBooks) || 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingBag }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Manage your bookstore from one place
          </p>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '32px', borderBottom: '2px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #d4145a' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    color: activeTab === tab.id ? '#d4145a' : '#6b7280',
                    marginBottom: '-2px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} color="#10b981" />
              <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders} color="#d4145a" />
              <StatCard icon={Users} label="Total Users" value={totalUsers} color="#3b82f6" />
              <StatCard icon={BookOpen} label="Total Books" value={totalBooks} color="#f59e0b" />
            </div>

            {/* Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-2">
              {/* Recent Orders */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                  Recent Orders
                </h3>
                {!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                    No orders yet
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {dashboardData.recentOrders.map(order => (
                      <div key={order.id} style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                            Order #{order.id} - {order.user_name}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          {order.books && (
                            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                              Books: {order.books}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '16px', fontWeight: '600', color: '#d4145a', display: 'block', marginBottom: '4px' }}>
                            ${parseFloat(order.total_amount).toFixed(2)}
                          </span>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '500', 
                            color: order.status === 'completed' ? '#10b981' : '#f59e0b',
                            padding: '2px 8px',
                            backgroundColor: order.status === 'completed' ? '#d1fae5' : '#fef3c7',
                            borderRadius: '4px'
                          }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Books */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                  Top Rated Books
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {books.sort((a, b) => b.rating - a.rating).slice(0, 5).map(book => (
                    <div key={book.id} style={{
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                          {book.title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {book.author}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star style={{ width: '14px', height: '14px', fill: '#fbbf24', color: '#fbbf24' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                          {book.rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>
                Manage Books ({books.length})
              </h2>
              <button
                onClick={() => setShowAddBookModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#d4145a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b01149'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#d4145a'}
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                Add Book
              </button>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Book</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Price</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Rating</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(book => (
                      <tr key={book.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={book.image} alt={book.title} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{book.title}</p>
                              <p style={{ fontSize: '12px', color: '#6b7280' }}>{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{book.category}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>${book.price}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star style={{ width: '14px', height: '14px', fill: '#fbbf24', color: '#fbbf24' }} />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{book.rating}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => openEditModal(book)}
                              style={{
                                padding: '6px',
                                backgroundColor: '#f3f4f6',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: '#3b82f6'
                              }}
                              title="Edit book"
                            >
                              <Edit style={{ width: '16px', height: '16px' }} />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id, book.title)}
                              style={{
                                padding: '6px',
                                backgroundColor: '#fee2e2',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: '#ef4444'
                              }}
                              title="Delete book"
                            >
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>
              Manage Users ({users.length})
            </h2>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>User</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Joined</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{u.name}</p>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            backgroundColor: u.role === 'admin' ? '#fef3c7' : '#dbeafe',
                            color: u.role === 'admin' ? '#92400e' : '#1e40af',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                          {new Date(u.created_at || u.joined).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                          {u.orders || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>
              All Orders ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '60px 20px',
                textAlign: 'center',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <Package style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
                <p style={{ fontSize: '18px', color: '#6b7280' }}>No orders yet</p>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Order ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Items</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                            {order.id}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                            ${order.total.toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              backgroundColor: '#d1fae5',
                              color: '#065f46',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {showAddBookModal && (
        <BookFormModal
          title="Add New Book"
          bookForm={bookForm}
          setBookForm={setBookForm}
          onSubmit={handleAddBook}
          onClose={() => {
            setShowAddBookModal(false);
            resetBookForm();
          }}
        />
      )}

      {/* Edit Book Modal */}
      {showEditBookModal && (
        <BookFormModal
          title="Edit Book"
          bookForm={bookForm}
          setBookForm={setBookForm}
          onSubmit={handleEditBook}
          onClose={() => {
            setShowEditBookModal(false);
            setSelectedBook(null);
            resetBookForm();
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  }}>
    <div style={{
      width: '56px',
      height: '56px',
      backgroundColor: `${color}15`,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon style={{ width: '28px', height: '28px', color: color }} />
    </div>
    <div>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a' }}>{value}</p>
    </div>
  </div>
);

const BookFormModal = ({ title, bookForm, setBookForm, onSubmit, onClose }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: '20px 0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              borderRadius: '6px'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={bookForm.title}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Author */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Author *
            </label>
            <input
              type="text"
              name="author"
              value={bookForm.author}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Category *
            </label>
            <select
              name="category"
              value={bookForm.category}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="">Select category</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Biography">Biography</option>
              <option value="History">History</option>
              <option value="Self-Help">Self-Help</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Price ($) *
            </label>
            <input
              type="number"
              name="price"
              value={bookForm.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Cover Image URL
            </label>
            <input
              type="text"
              name="coverImage"
              value={bookForm.coverImage}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              name="description"
              value={bookForm.description}
              onChange={handleChange}
              rows="3"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Row with Publisher, ISBN, Language */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={bookForm.publisher}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                value={bookForm.isbn}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Language
              </label>
              <input
                type="text"
                name="language"
                value={bookForm.language}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Row with Publish Year, Pages, Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Publish Year
              </label>
              <input
                type="number"
                name="publishYear"
                value={bookForm.publishYear}
                onChange={handleChange}
                min="1000"
                max={new Date().getFullYear() + 1}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Pages
              </label>
              <input
                type="number"
                name="pages"
                value={bookForm.pages}
                onChange={handleChange}
                min="1"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={bookForm.stockQuantity}
                onChange={handleChange}
                min="0"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isFeatured"
                checked={bookForm.isFeatured}
                onChange={handleChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Featured</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isBestseller"
                checked={bookForm.isBestseller}
                onChange={handleChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Bestseller</span>
            </label>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
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
            >
              {title === 'Add New Book' ? 'Add Book' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
