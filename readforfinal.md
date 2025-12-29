# BOI Bookstore - Complete Technical Documentation
## Prepared for Final Project Defense

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema & SQL Queries](#database-schema--sql-queries)
4. [Server-Side (Backend)](#server-side-backend)
5. [Client-Side (Frontend)](#client-side-frontend)
6. [Routing System](#routing-system)
7. [Data Flow](#data-flow)
8. [Common Questions & Answers](#common-questions--answers)

---

## Project Overview

### What is this project?
BOI Bookstore is a full-stack web application for managing an online bookstore. Users can browse books, make purchases, subscribe to memberships, and leave feedback. Admins can manage books, orders, users, and view analytics.

### Tech Stack
- **Frontend**: React.js (with Vite), Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens) + bcrypt for password hashing
- **HTTP Client**: Axios
- **CORS**: Enabled for cross-origin requests

### Project Structure
```
CSE370_Project/
├── client/          # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main page components
│   │   ├── services/     # API integration (api.js)
│   │   ├── context/      # React Context for state management
│   │   └── App.jsx       # Main app component
│   └── package.json
├── server/          # Backend Node.js application
│   ├── src/
│   │   ├── route/        # API route handlers
│   │   ├── controllers/  # Business logic
│   │   └── models/       # Database models
│   ├── config/
│   │   └── db.js         # Database connection
│   ├── database/
│   │   └── schema.sql    # Database schema
│   └── server.js         # Main server file
└── README.md
```

---

## Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────┐
│          CLIENT (Frontend)                  │
│  - React Components                         │
│  - Pages (HomePage, BooksPage, etc.)        │
│  - API Service (axios)                      │
└──────────────┬──────────────────────────────┘
               │ HTTP Requests (REST API)
               ↓
┌─────────────────────────────────────────────┐
│          SERVER (Backend)                   │
│  - Express.js Routes                        │
│  - Controllers (Business Logic)             │
│  - Middleware (Auth, CORS, etc.)            │
└──────────────┬──────────────────────────────┘
               │ SQL Queries
               ↓
┌─────────────────────────────────────────────┐
│          DATABASE (MySQL)                   │
│  - Tables (users, books, orders, etc.)      │
│  - Relationships (Foreign Keys)             │
│  - Indexes for performance                  │
└─────────────────────────────────────────────┘
```

### How Components Communicate

1. **User Action**: User clicks a button on the frontend
2. **API Call**: Frontend sends HTTP request to backend via axios
3. **Server Processing**: Backend receives request, validates, processes
4. **Database Query**: Backend executes SQL query to database
5. **Response**: Data flows back through the chain to frontend
6. **UI Update**: React updates the component with new data

---

## Database Schema & SQL Queries

### Database Tables

#### 1. Users Table
Stores user information and authentication details.

```sql
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  password VARCHAR(255) NOT NULL,        -- Hashed with bcrypt
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY idx_email (email),
  KEY idx_role (role)
);
```

**Key Points**:
- `password` is hashed using bcrypt (never stored in plain text)
- `role` determines access level (user or admin)
- `email` has unique constraint (no duplicate emails)
- Indexes on `email` and `role` for faster queries

#### 2. Books Table
Stores all book information.

```sql
CREATE TABLE books (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT '0.00',
  reviews_count INT DEFAULT '0',
  cover_image VARCHAR(500),
  publish_year INT,
  pages INT,
  language VARCHAR(50) DEFAULT 'English',
  publisher VARCHAR(255),
  isbn VARCHAR(20),
  stock_quantity INT DEFAULT '0',
  is_featured TINYINT(1) DEFAULT '0',
  is_bestseller TINYINT(1) DEFAULT '0',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY isbn (isbn),
  KEY idx_category (category),
  KEY idx_author (author)
);
```

**Key Points**:
- `DECIMAL(10,2)` for price ensures precise currency values
- Multiple indexes for filtering (category, author, price, rating)
- `is_featured` and `is_bestseller` flags for homepage display

#### 3. Orders Table
Stores customer orders.

```sql
CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'cancelled'),
  payment_method VARCHAR(50),
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Key Points**:
- Foreign key to `users` table
- `ON DELETE CASCADE`: If user is deleted, their orders are too
- Status tracking for order lifecycle

#### 4. Order Items Table
Stores individual items in each order.

```sql
CREATE TABLE order_items (
  id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  book_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT '1',
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

**Why separate table?**:
- One order can have multiple books
- Stores price at time of purchase (historical data)
- Enables many-to-many relationship between orders and books

#### 5. User Books Table
Tracks which books each user owns/purchased.

```sql
CREATE TABLE user_books (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  order_id INT NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_book (user_id, book_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

**Key Points**:
- Prevents duplicate purchases (UNIQUE constraint)
- Links to original order for reference
- Used for "My Books" page

#### 6. Memberships Table
Stores user subscription plans.

```sql
CREATE TABLE memberships (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_type ENUM('basic', 'premium', 'enterprise') NOT NULL,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Key Points**:
- Date range tracking (start_date, end_date)
- Status management (active/cancelled/expired)
- Multiple plan types with different pricing

#### 7. Feedback Table
Stores user reviews and ratings.

```sql
CREATE TABLE feedback (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  book_id INT DEFAULT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
  CONSTRAINT feedback_chk_1 CHECK (rating BETWEEN 1 AND 5)
);
```

**Key Points**:
- Rating constraint: Must be 1-5
- `ON DELETE SET NULL`: Preserves feedback even if user/book deleted
- `book_id` can be NULL for general feedback

### Common SQL Queries Used

#### Get All Books with Filters
```sql
SELECT * FROM books 
WHERE category = ? 
  AND price >= ? 
  AND price <= ?
  AND (title LIKE ? OR author LIKE ?)
ORDER BY rating DESC
LIMIT 20 OFFSET 0;
```

#### User Registration (Insert New User)
```sql
INSERT INTO users (name, email, password, role) 
VALUES (?, ?, ?, 'user');
```

#### User Login (Find User by Email)
```sql
SELECT id, name, email, password, role 
FROM users 
WHERE email = ?;
```

#### Create Order with Items (Transaction)
```sql
-- Start transaction
START TRANSACTION;

-- Insert order
INSERT INTO orders (user_id, total_amount, status, shipping_address)
VALUES (?, ?, 'pending', ?);

-- Get order ID
SET @order_id = LAST_INSERT_ID();

-- Insert order items
INSERT INTO order_items (order_id, book_id, quantity, price)
VALUES (@order_id, ?, ?, ?);

-- Insert into user_books
INSERT INTO user_books (user_id, book_id, order_id)
VALUES (?, ?, @order_id);

-- Update book stock
UPDATE books 
SET stock_quantity = stock_quantity - ?
WHERE id = ?;

-- Commit transaction
COMMIT;
```

#### Get User's Purchased Books (JOIN Query)
```sql
SELECT b.*, ub.purchased_at 
FROM user_books ub
JOIN books b ON ub.book_id = b.id
WHERE ub.user_id = ?
ORDER BY ub.purchased_at DESC;
```

#### Admin Dashboard Statistics (Aggregation)
```sql
-- Total users
SELECT COUNT(*) as total FROM users WHERE role = 'user';

-- Total orders
SELECT COUNT(*) as total FROM orders;

-- Revenue
SELECT SUM(total_amount) as revenue FROM orders WHERE status = 'completed';

-- Recent orders with user info
SELECT o.*, u.name as user_name, u.email 
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### Database Relationships

```
users ──┬──< orders ──< order_items >── books
        │
        ├──< user_books >── books
        │
        ├──< memberships
        │
        └──< feedback >── books
```

- **One-to-Many**: One user can have many orders
- **Many-to-Many**: Users and books (through user_books)
- **Referential Integrity**: Foreign keys maintain data consistency

---

## Server-Side (Backend)

### Server Architecture

#### server.js (Main Entry Point)
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',  // Allow frontend
  credentials: true
}));
app.use(express.json());  // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
// ... more routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Key Concepts**:
- **Express**: Web framework for Node.js
- **Middleware**: Functions that process requests before routes
- **CORS**: Allows frontend (port 5173) to access backend (port 5000)
- **dotenv**: Loads environment variables from .env file

#### config/db.js (Database Connection)
```javascript
import mysql from 'mysql2';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 10  // Max 10 concurrent connections
});

// Promise-based pool for async/await
const promisePool = pool.promise();

export { pool, promisePool };
```

**Why connection pool?**:
- Reuses connections instead of creating new ones
- Better performance and resource management
- Handles multiple requests concurrently

### API Routes

#### Authentication Routes (authRoutes.js)

**1. Register User**
```javascript
POST /api/auth/register

// Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Process:
1. Validate input (email format, password length)
2. Check if email already exists
3. Hash password with bcrypt (10 salt rounds)
4. Insert user into database
5. Generate JWT token
6. Return token and user info

// Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**2. Login User**
```javascript
POST /api/auth/login

// Request Body:
{
  "email": "john@example.com",
  "password": "password123"
}

// Process:
1. Find user by email
2. Compare password with hashed password using bcrypt
3. Generate JWT token if match
4. Return token and user info

// SQL Query:
SELECT id, name, email, password, role 
FROM users 
WHERE email = ?
```

**JWT Token Structure**:
```javascript
{
  userId: 1,
  email: "john@example.com",
  role: "user",
  iat: 1234567890,  // Issued at
  exp: 1234999999   // Expires in 7 days
}
```

#### Book Routes (bookRoutes.js)

**1. Get All Books**
```javascript
GET /api/books?category=Fiction&minPrice=10&maxPrice=20&search=harry

// Query Parameters:
- category: Filter by category
- author: Filter by author
- minPrice/maxPrice: Price range
- search: Search in title, author, description
- featured: true/false
- bestseller: true/false
- sortBy: title, price, rating, created_at
- order: ASC/DESC
- page: Page number
- limit: Items per page

// Dynamic SQL Query Building:
let query = 'SELECT * FROM books WHERE 1=1';
if (category) query += ' AND category = ?';
if (minPrice) query += ' AND price >= ?';
// ... add filters dynamically

query += ' ORDER BY rating DESC LIMIT 20';

// Returns paginated results with total count
```

**2. Get Single Book**
```javascript
GET /api/books/:id

// SQL Query:
SELECT * FROM books WHERE id = ?

// Also gets average rating:
SELECT AVG(rating) as avg_rating, COUNT(*) as review_count 
FROM feedback 
WHERE book_id = ?
```

**3. Create Book (Admin Only)**
```javascript
POST /api/books

// Request Body:
{
  "title": "New Book",
  "author": "Author Name",
  "category": "Fiction",
  "price": 19.99,
  "stock_quantity": 50
}

// Process:
1. Check if user is admin (JWT token)
2. Validate required fields
3. Insert book into database
4. Return created book
```

#### Order Routes (orderRoutes.js)

**Create Order**
```javascript
POST /api/orders

// Request Body:
{
  "items": [
    { "book_id": 1, "quantity": 2, "price": 14.99 },
    { "book_id": 3, "quantity": 1, "price": 19.99 }
  ],
  "shipping_address": "123 Main St",
  "payment_method": "credit_card"
}

// Process (Database Transaction):
1. Start transaction
2. Create order record
3. Create order_items records
4. Create user_books records (for purchased books)
5. Update book stock quantities
6. Commit transaction (or rollback if error)

// Why transaction?
- Ensures all or nothing (atomic operation)
- Prevents partial orders if something fails
- Maintains data consistency
```

### Middleware

#### Authentication Middleware
```javascript
// middleware/auth.js
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token, authorization denied' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};
```

**How it works**:
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token using JWT secret
3. Adds user info to request object
4. Allows request to proceed to route handler

#### Admin Middleware
```javascript
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin only.' 
    });
  }
  next();
};

// Usage:
router.post('/books', authMiddleware, adminMiddleware, createBook);
```

### Environment Variables (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bookstore
DB_PORT=3306
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Security Note**: Never commit .env file to GitHub!

---

## Client-Side (Frontend)

### React Application Structure

#### App.jsx (Main Component)
```javascript
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState(null);

  // Client-side routing
  const handleNavigate = (page, data) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render different pages based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={handleNavigate} />;
      case 'books': return <BooksPage onNavigate={handleNavigate} />;
      case 'checkout': return <CheckoutPage onNavigate={handleNavigate} />;
      // ... more pages
    }
  };

  return (
    <AppProvider>
      <Header onNavigate={handleNavigate} />
      {renderPage()}
      <Footer />
    </AppProvider>
  );
}
```

**Key Points**:
- Single Page Application (SPA)
- Client-side routing (no page refresh)
- State management with React Context
- Navigation through props

### Context API (AppContext.jsx)

```javascript
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setCart([]);
  };

  // Cart functions
  const addToCart = (book) => {
    setCart([...cart, book]);
    localStorage.setItem('cart', JSON.stringify([...cart, book]));
  };

  return (
    <AppContext.Provider value={{
      user, setUser, login, logout,
      cart, addToCart, clearCart,
      isAuthModalOpen, setIsAuthModalOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};
```

**Why Context API?**:
- Shares state across all components
- Avoids prop drilling
- Central place for authentication and cart logic

### API Service (services/api.js)

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - adds token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password })
};

// Books API
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (query) => api.get(`/books?search=${query}`)
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders')
};
```

**Axios Interceptors**:
- **Request Interceptor**: Automatically adds JWT token to every request
- **Response Interceptor**: Handles 401 errors (logout user if token expired)

### Key Pages

#### HomePage.jsx
```javascript
export const HomePage = ({ onNavigate }) => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    // Fetch featured books
    booksAPI.getAll({ featured: true, limit: 8 })
      .then(response => setFeaturedBooks(response.data.books));

    // Fetch bestsellers
    booksAPI.getAll({ bestseller: true, limit: 8 })
      .then(response => setBestsellers(response.data.books));
  }, []);

  return (
    <div>
      <HeroSection />
      <FeaturedBooksSection books={featuredBooks} />
      <BestsellersSection books={bestsellers} />
      <CategoriesSection onNavigate={onNavigate} />
    </div>
  );
};
```

#### BooksPage.jsx
```javascript
export const BooksPage = ({ onNavigate, initialFilter }) => {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({
    category: initialFilter?.category || '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  useEffect(() => {
    // Fetch books with filters
    booksAPI.getAll(filters)
      .then(response => setBooks(response.data.books));
  }, [filters]);

  return (
    <div className="grid grid-cols-4">
      {/* Sidebar with filters */}
      <FilterSidebar filters={filters} onChange={setFilters} />
      
      {/* Books grid */}
      <div className="col-span-3">
        {books.map(book => (
          <BookCard 
            key={book.id} 
            book={book} 
            onClick={() => onNavigate('bookdetail', book)}
          />
        ))}
      </div>
    </div>
  );
};
```

#### CheckoutPage.jsx
```javascript
export const CheckoutPage = ({ onNavigate }) => {
  const { user, cart, clearCart } = useContext(AppContext);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const handleCheckout = async () => {
    try {
      // Calculate total
      const total = cart.reduce((sum, book) => sum + book.price, 0);

      // Create order
      const orderData = {
        items: cart.map(book => ({
          book_id: book.id,
          quantity: 1,
          price: book.price
        })),
        shipping_address: address,
        payment_method: paymentMethod,
        total_amount: total
      };

      await ordersAPI.create(orderData);
      
      // Clear cart and navigate
      clearCart();
      alert('Order placed successfully!');
      onNavigate('mybooks');
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      {/* Cart items */}
      {/* Address form */}
      {/* Payment method selection */}
      <button onClick={handleCheckout}>Place Order</button>
    </div>
  );
};
```

### Component Communication Flow

```
User clicks "Add to Cart"
        ↓
Button onClick handler
        ↓
Calls addToCart() from Context
        ↓
Updates cart state
        ↓
Saves to localStorage
        ↓
All components using Context see update
        ↓
Cart icon shows new count
```

---

## Routing System

### Backend Routing (Express.js)

#### Route Structure
```
server.js
    ├── /api/auth        → authRoutes.js
    ├── /api/books       → bookRoutes.js
    ├── /api/orders      → orderRoutes.js
    ├── /api/user-books  → userBookRoutes.js
    ├── /api/memberships → membershipRoutes.js
    ├── /api/feedback    → feedbackRoutes.js
    └── /api/admin       → adminRoutes.js
```

#### Example: Book Routes
```javascript
// server.js
app.use('/api/books', bookRoutes);

// bookRoutes.js
import express from 'express';
const router = express.Router();

// GET /api/books
router.get('/', getAllBooks);

// GET /api/books/:id
router.get('/:id', getBookById);

// POST /api/books (protected, admin only)
router.post('/', authMiddleware, adminMiddleware, createBook);

// PUT /api/books/:id (protected, admin only)
router.put('/:id', authMiddleware, adminMiddleware, updateBook);

// DELETE /api/books/:id (protected, admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteBook);

export default router;
```

### Frontend Routing (React)

#### Client-Side Navigation
```javascript
// App.jsx
const [currentPage, setCurrentPage] = useState('home');

const handleNavigate = (page, data = null) => {
  setCurrentPage(page);
  setPageData(data);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Usage in components:
<button onClick={() => onNavigate('books', { category: 'Fiction' })}>
  View Books
</button>
```

**Why not React Router?**:
- Simpler for small projects
- No additional dependencies
- Full control over navigation logic
- Can easily pass data between pages

### Route Protection

#### Backend (Middleware)
```javascript
// Protected route example
router.get('/my-orders', authMiddleware, async (req, res) => {
  // req.user is available from authMiddleware
  const userId = req.user.userId;
  
  const [orders] = await promisePool.query(
    'SELECT * FROM orders WHERE user_id = ?',
    [userId]
  );
  
  res.json({ orders });
});

// Admin-only route
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);
```

#### Frontend (Conditional Rendering)
```javascript
const { user } = useContext(AppContext);

// Show login button if not logged in
{!user && (
  <button onClick={() => setIsAuthModalOpen(true)}>
    Login
  </button>
)}

// Show admin dashboard only for admins
{user?.role === 'admin' && (
  <button onClick={() => onNavigate('admin')}>
    Admin Dashboard
  </button>
)}
```

---

## Data Flow

### Complete Flow: User Purchases a Book

```
1. USER ACTION (Frontend)
   ├── User clicks "Buy Now" on book detail page
   └── onClick handler triggers

2. CART UPDATE (Frontend - Context)
   ├── addToCart(book) called
   ├── Cart state updated: [book1, book2, newBook]
   └── Saved to localStorage

3. NAVIGATION (Frontend)
   ├── onNavigate('checkout') called
   └── CheckoutPage rendered

4. CHECKOUT (Frontend)
   ├── User fills shipping address
   ├── Selects payment method
   └── Clicks "Place Order"

5. API REQUEST (Frontend → Backend)
   ├── axios.post('/api/orders', orderData)
   ├── Headers: { Authorization: 'Bearer <token>' }
   └── Body: {
         items: [{book_id: 1, quantity: 1, price: 14.99}],
         shipping_address: "123 Main St",
         payment_method: "credit_card"
       }

6. SERVER PROCESSING (Backend)
   ├── Express receives request
   ├── authMiddleware verifies JWT token
   ├── Extracts userId from token
   └── Route handler executes

7. DATABASE TRANSACTION (Backend → MySQL)
   ├── START TRANSACTION
   ├── INSERT INTO orders (user_id, total_amount, ...)
   ├── Get order_id = LAST_INSERT_ID()
   ├── INSERT INTO order_items (order_id, book_id, ...)
   ├── INSERT INTO user_books (user_id, book_id, order_id)
   ├── UPDATE books SET stock_quantity = stock_quantity - 1
   └── COMMIT TRANSACTION

8. RESPONSE (Backend → Frontend)
   ├── Success: { success: true, order: {...} }
   └── Or Error: { success: false, message: "..." }

9. UI UPDATE (Frontend)
   ├── Clear cart
   ├── Show success message
   ├── Navigate to 'mybooks' page
   └── Fetch and display purchased books

10. DISPLAY (Frontend)
    ├── Call booksAPI.getMyBooks()
    ├── Render BookCard components
    └── Show "Download" button for each book
```

### Authentication Flow

```
1. REGISTRATION
   ├── User fills form (name, email, password)
   ├── POST /api/auth/register
   ├── Backend hashes password with bcrypt
   ├── Insert into users table
   ├── Generate JWT token
   ├── Return { token, user }
   ├── Frontend stores in localStorage
   └── Update Context state

2. LOGIN
   ├── User fills form (email, password)
   ├── POST /api/auth/login
   ├── Backend finds user by email
   ├── Compare password with bcrypt.compare()
   ├── Generate JWT token
   ├── Return { token, user }
   ├── Frontend stores in localStorage
   └── Update Context state

3. AUTHENTICATED REQUEST
   ├── User requests protected resource
   ├── axios interceptor adds token to header
   ├── Backend authMiddleware verifies token
   ├── If valid, add user to req.user
   └── Route handler processes request

4. LOGOUT
   ├── User clicks logout
   ├── Clear localStorage (token, user, cart)
   ├── Reset Context state
   └── Redirect to home page
```

### Database Questions

**Q: What is the difference between CASCADE and SET NULL in foreign keys?**

A: 
- **CASCADE**: When parent is deleted, child is also deleted
  - Example: Delete user → delete all their orders
- **SET NULL**: When parent is deleted, child's foreign key becomes NULL
  - Example: Delete book → feedback remains but book_id becomes NULL

**Q: Why do we use indexes in the database?**

A: Indexes speed up SELECT queries on frequently searched columns (like email, category). Without indexes, MySQL scans entire table. With indexes, it's like a book's index - directly jumps to the data.

Trade-off: Slower INSERT/UPDATE operations because index must be updated.

**Q: What is a database transaction and why use it?**

A: A transaction groups multiple SQL queries into one atomic operation. Either ALL succeed or ALL fail (rollback). Used when data consistency is critical.

Example: Creating an order involves inserting into 3 tables. If the 2nd insert fails, we rollback the 1st insert to avoid partial data.

**Q: Explain the difference between UNIQUE KEY and PRIMARY KEY.**

A:
- **PRIMARY KEY**: Uniquely identifies each row, cannot be NULL, only one per table
- **UNIQUE KEY**: Ensures uniqueness but can be NULL, can have multiple per table

Example: `id` is PRIMARY KEY, `email` is UNIQUE KEY.

### Server Questions

**Q: What is middleware in Express.js?**

A: Middleware is a function that executes before the route handler. It has access to request and response objects.

```javascript
app.use((req, res, next) => {
  console.log('Request received');
  next(); // Pass to next middleware
});
```

Common uses: Authentication, logging, parsing JSON, CORS.

**Q: What is CORS and why do we need it?**

A: CORS (Cross-Origin Resource Sharing) allows frontend (localhost:5173) to make requests to backend (localhost:5000). Without CORS, browser blocks these requests for security.

```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**Q: How does JWT authentication work?**

A:
1. User logs in with credentials
2. Server verifies and creates JWT token (encoded with secret)
3. Token contains user info (userId, role)
4. Frontend stores token in localStorage
5. Every subsequent request includes token in header
6. Server verifies token to identify user

**Q: What is bcrypt and why use it?**

A: Bcrypt is a password hashing function. We never store plain passwords in database.

```javascript
// Hash password (registration)
const hash = await bcrypt.hash(password, 10); // 10 salt rounds

// Compare password (login)
const match = await bcrypt.compare(password, hashedPassword);
```

Even if database is compromised, passwords remain secure.

**Q: What is the difference between pool.query() and promisePool.query()?**

A:
- `pool.query()`: Callback-based (older style)
- `promisePool.query()`: Promise-based (modern, works with async/await)

```javascript
// Callback style
pool.query('SELECT * FROM users', (err, results) => {
  if (err) console.error(err);
  console.log(results);
});

// Promise style
const [results] = await promisePool.query('SELECT * FROM users');
```

### Client Questions

**Q: What is React Context API and why use it?**

A: Context API is React's built-in state management. It allows sharing state across components without prop drilling.

Use cases:
- User authentication state
- Shopping cart
- Theme (dark/light mode)

**Q: What are axios interceptors?**

A: Interceptors intercept requests/responses before they reach your code.

**Request Interceptor**: Add token to every request automatically
**Response Interceptor**: Handle errors globally (e.g., logout on 401)

**Q: What is the difference between localStorage and sessionStorage?**

A:
- **localStorage**: Data persists even after browser close
- **sessionStorage**: Data cleared when tab closes

We use localStorage for token so users stay logged in.

**Q: What is the difference between useState and useEffect?**

A:
- **useState**: Creates a state variable that triggers re-render when changed
- **useEffect**: Runs side effects (API calls, subscriptions) after render

```javascript
const [books, setBooks] = useState([]);  // State

useEffect(() => {
  // Fetch books when component mounts
  fetchBooks().then(data => setBooks(data));
}, []); // Empty array = run once on mount
```

**Q: Why do we need useContext?**

A: To access Context values in a component.

```javascript
const { user, cart, addToCart } = useContext(AppContext);
```

Without Context, you'd need to pass these as props through every component.

### Integration Questions

**Q: How does the client communicate with the server?**

A: Through HTTP requests using axios:

```javascript
// Client
const response = await axios.post('http://localhost:5000/api/orders', data);

// Server receives and processes
app.post('/api/orders', (req, res) => {
  const data = req.body;
  // Process order
  res.json({ success: true });
});
```

**Q: How do we handle authentication across client and server?**

A:
1. User logs in → Server generates JWT
2. Client stores JWT in localStorage
3. Client adds JWT to every request header
4. Server verifies JWT to identify user

**Q: What happens when a user refreshes the page?**

A:
1. React app reloads from scratch
2. Check localStorage for token and user
3. If found, restore user state
4. If not found, show login

```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    setUser(JSON.parse(user));
  }
}, []);
```

**Q: How do you prevent unauthorized access to admin routes?**

A:

**Backend**: Middleware checks role
```javascript
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
```

**Frontend**: Conditional rendering
```javascript
{user?.role === 'admin' && <AdminDashboard />}
```

### Architecture Questions

**Q: What is the difference between frontend and backend?**

A:
- **Frontend (Client)**: Runs in browser, handles UI, user interactions
  - Technologies: React, HTML, CSS, JavaScript
  
- **Backend (Server)**: Runs on server, handles business logic, database
  - Technologies: Node.js, Express, MySQL

**Q: Why separate client and server folders?**

A:
- **Separation of concerns**: Frontend and backend have different responsibilities
- **Independent deployment**: Can deploy separately
- **Different technologies**: Frontend uses React, backend uses Express
- **Team collaboration**: Different teams can work independently

**Q: What is REST API?**

A: REST (Representational State Transfer) is an architectural style for APIs.

Principles:
- **Resource-based URLs**: `/api/books`, `/api/users`
- **HTTP methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Stateless**: Each request contains all necessary info (token)
- **JSON format**: Data exchanged in JSON

Example:
```
GET /api/books        → Get all books
GET /api/books/1      → Get book with ID 1
POST /api/books       → Create new book
PUT /api/books/1      → Update book with ID 1
DELETE /api/books/1   → Delete book with ID 1
```

**Q: What is the request-response cycle?**

A:
1. **Client** sends HTTP request (GET, POST, etc.)
2. **Server** receives request
3. **Middleware** processes request (auth, parsing)
4. **Route handler** executes business logic
5. **Database** query if needed
6. **Server** sends HTTP response
7. **Client** receives and processes response
8. **UI** updates based on response

**Q: How do you handle errors?**

A:

**Backend**:
```javascript
try {
  const [books] = await promisePool.query('SELECT * FROM books');
  res.json({ books });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
}
```

**Frontend**:
```javascript
try {
  const response = await booksAPI.getAll();
  setBooks(response.data.books);
} catch (error) {
  console.error('Failed to fetch books:', error);
  alert('Failed to load books. Please try again.');
}
```

---

## Development & Deployment

### Running the Project

**1. Server (Backend)**
```bash
cd server
npm install
npm start         # Production
npm run dev       # Development (with hot reload)
```

**2. Client (Frontend)**
```bash
cd client
npm install
npm run dev       # Development server (Vite)
npm run build     # Production build
```

### Environment Setup

**Server .env file**:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bookstore
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

**Client .env file** (optional):
```
VITE_API_URL=http://localhost:5000/api
```

### Common Issues & Solutions

**Issue: Database connection failed**
- Check if MySQL is running
- Verify credentials in .env file
- Ensure database exists

**Issue: CORS error**
- Check CORS configuration in server.js
- Verify client URL matches

**Issue: Token expired**
- User will be automatically logged out
- Need to login again

**Issue: Cannot add to cart**
- Check if user is logged in
- Verify localStorage is working

---

## Key Takeaways for Faculty Questions

### Database
1. We use **MySQL** with **7 tables** (users, books, orders, order_items, user_books, memberships, feedback)
2. **Foreign keys** maintain referential integrity
3. **Indexes** improve query performance
4. **Transactions** ensure data consistency for complex operations
5. **bcrypt** hashes passwords for security

### Server
1. **Node.js with Express.js** handles API requests
2. **JWT authentication** for secure user sessions
3. **Middleware** for authentication, CORS, and request logging
4. **Connection pool** for efficient database access
5. **RESTful API** design with clear endpoint structure

### Client
1. **React** for component-based UI
2. **Context API** for state management (user, cart)
3. **axios** for API communication with interceptors
4. **localStorage** for persisting user session
5. **Client-side routing** for SPA experience

### Integration
1. **Three-tier architecture**: Client → Server → Database
2. **JWT tokens** in request headers for authentication
3. **JSON** for data exchange
4. **CORS** enabled for cross-origin requests
5. **Error handling** at each layer

---

## Final Notes

This project demonstrates:
- ✅ Full-stack web development
- ✅ Database design and SQL
- ✅ RESTful API architecture
- ✅ User authentication and authorization
- ✅ State management
- ✅ Secure password handling
- ✅ Transaction management
- ✅ Modern React patterns


