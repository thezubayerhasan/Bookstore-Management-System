import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, ordersAPI, userBooksAPI, membershipAPI } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // User State
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Orders State
  const [orders, setOrders] = useState([]);

  // My Books State
  const [myBooks, setMyBooks] = useState([]);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Ebook Preview State
  const [showEbookPreview, setShowEbookPreview] = useState(false);
  const [previewBook, setPreviewBook] = useState(null);

  // Membership State
  const [membership, setMembership] = useState(null);

  // Load user from localStorage and verify token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Parse saved user data
          const userData = JSON.parse(savedUser);
          
          // Verify token with backend
          const response = await authAPI.verify();
          if (response.success) {
            const verifiedUser = response.data;
            
            // Update user data with verified information
            setUser(verifiedUser);
            setIsAdmin(verifiedUser.role === 'admin');
            
            // Update localStorage with latest user data
            localStorage.setItem('user', JSON.stringify(verifiedUser));
            
            // Load user's data
            const userId = verifiedUser.userId || verifiedUser.id;
            if (userId) {
              loadUserData(userId);
            }
          } else {
            // Token invalid, clear session
            clearSession();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          clearSession();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Clear session helper function
  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setIsAdmin(false);
    setCart([]);
    setMyBooks([]);
    setOrders([]);
    setMembership(null);
  };

  // Update cart count whenever cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(total);
    
    // Save cart to localStorage
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Load user-specific data
  const loadUserData = async (userId) => {
    try {
      // Load user's purchased books
      const booksResponse = await userBooksAPI.getUserBooks(userId);
      if (booksResponse.success) {
        setMyBooks(booksResponse.data);
      }

      // Load user's orders
      const ordersResponse = await ordersAPI.getUserOrders(userId);
      if (ordersResponse.success) {
        setOrders(ordersResponse.data);
      }

      // Load user's membership
      const membershipResponse = await membershipAPI.getUserMembership(userId);
      if (membershipResponse.success && membershipResponse.data.activeMembership) {
        setMembership(membershipResponse.data.activeMembership);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // User Functions
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { token, ...userData } = response.data;
        
        // Save token and user data to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
        setShowAuthModal(false);
        
        // Load user's data
        const userId = userData.userId || userData.id;
        if (userId) {
          await loadUserData(userId);
        }
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register(name, email, password);
      
      if (response.success) {
        const { token, ...userData } = response.data;
        
        // Save token and user data to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
        setShowAuthModal(false);
        
        // Load initial user data
        const userId = userData.userId || userData.id;
        if (userId) {
          await loadUserData(userId);
        }
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    // Clear all session data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    // Reset all state
    setUser(null);
    setIsAdmin(false);
    setCart([]);
    setMyBooks([]);
    setOrders([]);
    setMembership(null);
    
    // Optionally redirect to home page
    window.location.href = '/';
  };

  const updateProfile = async (updates) => {
    try {
      // Call backend API to update profile
      const response = await authAPI.updateProfile(updates);
      
      if (response.success) {
        const updatedUser = response.data;
        
        // Update state with backend response
        setUser(updatedUser);
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: response.message || 'Update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      return { success: false, error: errorMessage };
    }
  };

  // Cart Functions
  const addToCart = (book, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === book.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevCart, { ...book, quantity }];
    });
  };

  const removeFromCart = (bookId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== bookId));
  };

  const updateCartQuantity = (bookId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === bookId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Checkout Function
  const checkout = async (paymentInfo) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log('Checkout - user:', user);
      console.log('Checkout - cart:', cart);
      
      const items = cart.map(item => ({
        bookId: item.id,
        quantity: item.quantity
      }));

      console.log('Checkout - items:', items);
      console.log('Checkout - userId:', user.userId || user.id);
      
      const response = await ordersAPI.create(
        user.userId || user.id,
        items,
        paymentInfo.billingAddress || paymentInfo.address || '',
        paymentInfo.paymentMethod || 'cash'
      );

      console.log('Checkout - API response:', response);

      if (response.success) {
        const order = response.data;
        
        // Update orders list
        setOrders(prev => [order, ...prev]);
        
        // Reload user's purchased books
        await loadUserData(user.userId || user.id);
        
        // Clear cart
        clearCart();
        
        console.log('Checkout - success, cart cleared');
        
        return { success: true, order };
      } else {
        // API returned success: false
        return { success: false, error: response.message || 'Checkout failed' };
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.message || 'Checkout failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  // Auth Modal Functions
  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  // Ebook Preview Functions
  const openEbookPreview = (book) => {
    setPreviewBook(book);
    setShowEbookPreview(true);
  };

  const closeEbookPreview = () => {
    setShowEbookPreview(false);
    setPreviewBook(null);
  };

  // Membership Functions
  const subscribeMembership = async (plan) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await membershipAPI.subscribe(
        user.userId || user.id,
        plan.type,
        30
      );

      if (response.success) {
        setMembership(response.data);
        return { success: true, membership: response.data };
      } else {
        // Return error with daysRemaining if present
        return { 
          success: false, 
          error: response.message,
          daysRemaining: response.daysRemaining 
        };
      }
    } catch (error) {
      console.error('Subscription error:', error);
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || 'Subscription failed. Please try again.';
      return { 
        success: false, 
        error: errorMessage,
        daysRemaining: errorData?.daysRemaining
      };
    }
  };

  const cancelMembership = async () => {
    if (!membership) {
      return { success: false, error: 'No active membership' };
    }

    try {
      const response = await membershipAPI.cancel(membership.id);
      
      if (response.success) {
        setMembership(null);
        return { success: true };
      }
    } catch (error) {
      console.error('Cancel membership error:', error);
      const errorMessage = error.response?.data?.message || 'Cancellation failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  // Session helper functions
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    return !!(token && savedUser && user);
  };

  const getSessionToken = () => {
    return localStorage.getItem('token');
  };

  const getSessionUser = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        return null;
      }
    }
    return null;
  };

  const refreshUserData = async () => {
    if (user) {
      const userId = user.userId || user.id;
      if (userId) {
        await loadUserData(userId);
      }
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    register,
    logout,
    updateProfile,
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    checkout,
    orders,
    myBooks,
    showAuthModal,
    authMode,
    openAuthModal,
    closeAuthModal,
    showEbookPreview,
    previewBook,
    openEbookPreview,
    closeEbookPreview,
    membership,
    subscribeMembership,
    cancelMembership,
    loadUserData,
    // Session management
    isAuthenticated,
    getSessionToken,
    getSessionUser,
    refreshUserData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
