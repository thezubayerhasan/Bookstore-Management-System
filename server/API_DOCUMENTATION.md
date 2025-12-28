# BOI Bookstore - API Documentation

## Base URL
```
http://localhost:5000
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}, // Response data (varies by endpoint)
  "pagination": {}, // Only for paginated endpoints
  "error": "Error details" // Only on errors
}
```

## Table of Contents
1. [Authentication Routes](#authentication-routes)
2. [Book Routes](#book-routes)
3. [Order Routes](#order-routes)
4. [User Books Routes](#user-books-routes)
5. [Membership Routes](#membership-routes)
6. [Feedback Routes](#feedback-routes)
7. [Admin Routes](#admin-routes)
8. [Health Check](#health-check)

---

## Authentication Routes
Base Path: `/api/auth`

### 1. Register User
**Endpoint:** `POST /api/auth/register`  
**Access:** Public  
**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 characters)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_string"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid data
- `409` - Email already exists
- `500` - Server error

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_string"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

### 3. Verify Token
**Endpoint:** `GET /api/auth/verify`  
**Access:** Private  
**Description:** Verify JWT token validity and get user data

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - No token provided, invalid token, or token expired
- `404` - User not found
- `500` - Server error

---

## Book Routes
Base Path: `/api/books`

### 1. Get All Books (With Filtering)
**Endpoint:** `GET /api/books`  
**Access:** Public  
**Description:** Get all books with optional filters and pagination

**Query Parameters:**
- `category` (string) - Filter by category
- `author` (string) - Filter by author (partial match)
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `search` (string) - Search in title, author, or description
- `featured` (boolean) - Filter featured books (true/false)
- `bestseller` (boolean) - Filter bestseller books (true/false)
- `sortBy` (string) - Sort field (title, price, rating, created_at, publish_year)
- `order` (string) - Sort order (ASC/DESC)
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Book Title",
      "author": "Author Name",
      "category": "Fiction",
      "description": "Book description",
      "price": 19.99,
      "rating": 4.5,
      "reviews_count": 100,
      "cover_image": "image_url",
      "publish_year": 2024,
      "pages": 350,
      "language": "English",
      "publisher": "Publisher Name",
      "isbn": "1234567890123",
      "stock_quantity": 50,
      "is_featured": 0,
      "is_bestseller": 1,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

**Error Responses:**
- `500` - Server error

---

### 2. Get Single Book
**Endpoint:** `GET /api/books/:id`  
**Access:** Public  
**Description:** Get detailed information about a specific book

**URL Parameters:**
- `id` (number) - Book ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Book Title",
    "author": "Author Name",
    "category": "Fiction",
    "description": "Book description",
    "price": 19.99,
    "rating": 4.5,
    "reviews_count": 100,
    "cover_image": "image_url",
    "publish_year": 2024,
    "pages": 350,
    "language": "English",
    "publisher": "Publisher Name",
    "isbn": "1234567890123",
    "stock_quantity": 50,
    "is_featured": 0,
    "is_bestseller": 1,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Book not found
- `500` - Server error

---

### 3. Create Book
**Endpoint:** `POST /api/books`  
**Access:** Private/Admin  
**Description:** Create a new book entry (Admin only)

**Request Body:**
```json
{
  "title": "string (required)",
  "author": "string (required)",
  "category": "string (required)",
  "description": "string",
  "price": "number (required)",
  "cover_image": "string",
  "publish_year": "number",
  "pages": "number",
  "language": "string (default: English)",
  "publisher": "string",
  "isbn": "string",
  "stock_quantity": "number (default: 0)",
  "is_featured": "boolean (default: false)",
  "is_bestseller": "boolean (default: false)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    // Complete book object
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - Book with ISBN already exists
- `500` - Server error

---

### 4. Update Book
**Endpoint:** `PUT /api/books/:id`  
**Access:** Private/Admin  
**Description:** Update book details (Admin only)

**URL Parameters:**
- `id` (number) - Book ID

**Request Body:** (All fields optional)
```json
{
  "title": "string",
  "author": "string",
  "category": "string",
  "description": "string",
  "price": "number",
  "rating": "number",
  "reviews_count": "number",
  "cover_image": "string",
  "publish_year": "number",
  "pages": "number",
  "language": "string",
  "publisher": "string",
  "isbn": "string",
  "stock_quantity": "number",
  "is_featured": "boolean",
  "is_bestseller": "boolean"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    // Updated book object
  }
}
```

**Error Responses:**
- `400` - No valid fields to update
- `404` - Book not found
- `500` - Server error

---

### 5. Delete Book
**Endpoint:** `DELETE /api/books/:id`  
**Access:** Private/Admin  
**Description:** Delete a book (Admin only)

**URL Parameters:**
- `id` (number) - Book ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

**Error Responses:**
- `404` - Book not found
- `500` - Server error

---

### 6. Get Categories
**Endpoint:** `GET /api/books/categories/list`  
**Access:** Public  
**Description:** Get list of all unique book categories

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    "Fiction",
    "Non-Fiction",
    "Science",
    "History",
    "Biography"
  ]
}
```

**Error Responses:**
- `500` - Server error

---

## Order Routes
Base Path: `/api/orders`

### 1. Create Order
**Endpoint:** `POST /api/orders`  
**Access:** Private  
**Description:** Create a new order with transaction handling

**Request Body:**
```json
{
  "userId": "number (required)",
  "items": [
    {
      "bookId": "number (required)",
      "quantity": "number (required)"
    }
  ],
  "shippingAddress": "string",
  "paymentMethod": "string (default: cash)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "total_amount": 59.97,
    "status": "completed",
    "payment_method": "cash",
    "shipping_address": "123 Main St",
    "created_at": "2025-01-01T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "bookId": 1,
        "title": "Book Title",
        "author": "Author Name",
        "coverImage": "image_url",
        "quantity": 2,
        "price": 19.99
      }
    ]
  }
}
```

**Error Responses:**
- `400` - Missing required fields or insufficient stock
- `404` - Book not found
- `500` - Server error

---

### 2. Get User Orders
**Endpoint:** `GET /api/orders/user/:userId`  
**Access:** Private  
**Description:** Get all orders for a specific user

**URL Parameters:**
- `userId` (number) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "total_amount": 59.97,
      "status": "pending",
      "payment_method": "cash",
      "shipping_address": "123 Main St",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "item_count": 3
    }
  ]
}
```

**Error Responses:**
- `500` - Server error

---

### 3. Get Order Details
**Endpoint:** `GET /api/orders/:id`  
**Access:** Private  
**Description:** Get detailed information about a specific order

**URL Parameters:**
- `id` (number) - Order ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "total_amount": 59.97,
    "status": "pending",
    "payment_method": "cash",
    "shipping_address": "123 Main St",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "book_id": 1,
        "quantity": 2,
        "price": 19.99,
        "title": "Book Title",
        "author": "Author Name",
        "cover_image": "image_url"
      }
    ]
  }
}
```

**Error Responses:**
- `404` - Order not found
- `500` - Server error

---

### 4. Update Order Status
**Endpoint:** `PUT /api/orders/:id/status`  
**Access:** Private/Admin  
**Description:** Update order status (Admin only)

**URL Parameters:**
- `id` (number) - Order ID

**Request Body:**
```json
{
  "status": "string (required: pending, processing, completed, cancelled)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    // Updated order object
  }
}
```

**Error Responses:**
- `400` - Invalid status
- `404` - Order not found
- `500` - Server error

---

### 5. Cancel/Delete Order
**Endpoint:** `DELETE /api/orders/:id`  
**Access:** Private  
**Description:** Cancel an order and restore book stock

**URL Parameters:**
- `id` (number) - Order ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

**Error Responses:**
- `404` - Order not found
- `500` - Server error

---

## User Books Routes
Base Path: `/api/user-books`

### 1. Get User's Purchased Books
**Endpoint:** `GET /api/user-books/:userId`  
**Access:** Private  
**Description:** Get all purchased books for a user

**URL Parameters:**
- `userId` (number) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_book_id": 1,
      "purchased_at": "2025-01-01T00:00:00.000Z",
      "order_id": 1,
      "order_status": "completed",
      "id": 1,
      "title": "Book Title",
      "author": "Author Name",
      "category": "Fiction",
      "price": 19.99,
      "cover_image": "image_url"
      // ... all book fields
    }
  ]
}
```

**Error Responses:**
- `500` - Server error

---

### 2. Check Book Ownership
**Endpoint:** `GET /api/user-books/:userId/check/:bookId`  
**Access:** Private  
**Description:** Check if user owns a specific book

**URL Parameters:**
- `userId` (number) - User ID
- `bookId` (number) - Book ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "owns": true,
    "details": {
      "id": 1,
      "user_id": 1,
      "book_id": 1,
      "order_id": 1,
      "purchased_at": "2025-01-01T00:00:00.000Z",
      "order_status": "completed"
    }
  }
}
```

**Error Responses:**
- `500` - Server error

---

### 3. Get User's Book Categories
**Endpoint:** `GET /api/user-books/:userId/categories`  
**Access:** Private  
**Description:** Get categories of books owned by user

**URL Parameters:**
- `userId` (number) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "category": "Fiction",
      "book_count": 15
    },
    {
      "category": "Science",
      "book_count": 8
    }
  ]
}
```

**Error Responses:**
- `500` - Server error

---

### 4. Get User's Book Statistics
**Endpoint:** `GET /api/user-books/:userId/stats`  
**Access:** Private  
**Description:** Get user's book purchase statistics

**URL Parameters:**
- `userId` (number) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total_books": 25,
    "total_categories": 8,
    "total_authors": 20,
    "total_spent": "499.75"
  }
}
```

**Error Responses:**
- `500` - Server error

---

## Membership Routes
Base Path: `/api/memberships`

### 1. Subscribe to Membership
**Endpoint:** `POST /api/memberships/subscribe`  
**Access:** Private  
**Description:** Subscribe to a membership plan

**Request Body:**
```json
{
  "userId": "number (required)",
  "planType": "string (required: basic, premium, enterprise)",
  "duration": "number (default: 30 days)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Membership subscribed successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "plan_type": "premium",
    "status": "active",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "price": 19.99,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid plan type
- `404` - User not found
- `409` - User already has active membership
- `500` - Server error

---

### 2. Get User's Membership
**Endpoint:** `GET /api/memberships/user/:userId`  
**Access:** Private  
**Description:** Get user's membership status and history

**URL Parameters:**
- `userId` (number) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "activeMembership": {
      "id": 1,
      "user_id": 1,
      "plan_type": "premium",
      "status": "active",
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "price": 19.99,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    "history": [
      // All membership records
    ]
  }
}
```

**Error Responses:**
- `500` - Server error

---

### 3. Cancel Membership
**Endpoint:** `PUT /api/memberships/:id/cancel`  
**Access:** Private  
**Description:** Cancel an active membership

**URL Parameters:**
- `id` (number) - Membership ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Membership cancelled successfully",
  "data": {
    // Updated membership object with status: "cancelled"
  }
}
```

**Error Responses:**
- `400` - Membership is not active
- `404` - Membership not found
- `500` - Server error

---

### 4. Renew Membership
**Endpoint:** `PUT /api/memberships/:id/renew`  
**Access:** Private  
**Description:** Renew an existing membership

**URL Parameters:**
- `id` (number) - Membership ID

**Request Body:**
```json
{
  "duration": "number (default: 30 days)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Membership renewed successfully",
  "data": {
    // Updated membership object with new end_date
  }
}
```

**Error Responses:**
- `404` - Membership not found
- `500` - Server error

---

### 5. Get Membership Plans
**Endpoint:** `GET /api/memberships/plans`  
**Access:** Public  
**Description:** Get all available membership plans with pricing

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "type": "basic",
      "name": "Basic Plan",
      "price": 9.99,
      "features": [
        "Access to 100+ ebooks",
        "Basic support",
        "1 device",
        "Standard quality"
      ]
    },
    {
      "type": "premium",
      "name": "Premium Plan",
      "price": 19.99,
      "features": [
        "Access to 1000+ ebooks",
        "Priority support",
        "3 devices",
        "HD quality",
        "Offline reading"
      ]
    },
    {
      "type": "enterprise",
      "name": "Enterprise Plan",
      "price": 49.99,
      "features": [
        "Unlimited ebooks access",
        "24/7 support",
        "Unlimited devices",
        "4K quality",
        "Offline reading",
        "Early access to new releases",
        "Exclusive author interviews"
      ]
    }
  ]
}
```

**Error Responses:**
- `500` - Server error

---

### 6. Delete Membership
**Endpoint:** `DELETE /api/memberships/:id`  
**Access:** Private/Admin  
**Description:** Delete a membership record (Admin only)

**URL Parameters:**
- `id` (number) - Membership ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Membership deleted successfully"
}
```

**Error Responses:**
- `404` - Membership not found
- `500` - Server error

---

## Feedback Routes
Base Path: `/api/feedback`

### 1. Submit Feedback
**Endpoint:** `POST /api/feedback`  
**Access:** Private  
**Description:** Submit feedback/review for a book

**Request Body:**
```json
{
  "userId": "number (required)",
  "bookId": "number (optional, null for general feedback)",
  "rating": "number (required, 1-5)",
  "comment": "string (optional)"
}
```

**Note:** `bookId` can be `null` for general site feedback not tied to a specific book.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "book_id": 1,
    "rating": 5,
    "comment": "Great book!",
    "created_at": "2025-01-01T00:00:00.000Z",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "book_title": "Book Title",
    "book_author": "Author Name"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid rating
- `404` - User or book not found
- `500` - Server error

---

### 2. Get Book Feedback
**Endpoint:** `GET /api/feedback/book/:bookId`  
**Access:** Public  
**Description:** Get all feedback for a specific book

**URL Parameters:**
- `bookId` (number) - Book ID

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `sortBy` (string) - Sort by (rating, created_at)
- `order` (string) - Sort order (ASC/DESC)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": 1,
        "user_id": 1,
        "book_id": 1,
        "rating": 5,
        "comment": "Great book!",
        "created_at": "2025-01-01T00:00:00.000Z",
        "user_name": "John Doe"
      }
    ],
    "ratingDistribution": [
      { "rating": 5, "count": 50 },
      { "rating": 4, "count": 30 },
      { "rating": 3, "count": 15 },
      { "rating": 2, "count": 3 },
      { "rating": 1, "count": 2 }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

**Error Responses:**
- `500` - Server error

---

### 3. Get User Feedback
**Endpoint:** `GET /api/feedback/user/:userId`  
**Access:** Private  
**Description:** Get all feedback submitted by a specific user

**URL Parameters:**
- `userId` (number) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "book_id": 1,
      "rating": 5,
      "comment": "Great book!",
      "created_at": "2025-01-01T00:00:00.000Z",
      "book_title": "Book Title",
      "book_author": "Author Name",
      "book_cover": "image_url"
    }
  ]
}
```

**Error Responses:**
- `500` - Server error

---

### 4. Get Recent Feedback
**Endpoint:** `GET /api/feedback/recent`  
**Access:** Public  
**Description:** Get recent feedback across all books

**Query Parameters:**
- `limit` (number) - Number of items (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "book_id": 1,
      "rating": 5,
      "comment": "Great book!",
      "created_at": "2025-01-01T00:00:00.000Z",
      "user_name": "John Doe",
      "book_title": "Book Title",
      "book_author": "Author Name",
      "book_cover": "image_url"
    }
  ]
}
```

**Error Responses:**
- `500` - Server error

---

### 5. Update Feedback
**Endpoint:** `PUT /api/feedback/:id`  
**Access:** Private  
**Description:** Update existing feedback

**URL Parameters:**
- `id` (number) - Feedback ID

**Request Body:**
```json
{
  "rating": "number (1-5)",
  "comment": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback updated successfully",
  "data": {
    // Updated feedback object
  }
}
```

**Error Responses:**
- `400` - No fields to update or invalid rating
- `404` - Feedback not found
- `500` - Server error

---

### 6. Delete Feedback
**Endpoint:** `DELETE /api/feedback/:id`  
**Access:** Private  
**Description:** Delete feedback

**URL Parameters:**
- `id` (number) - Feedback ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

**Error Responses:**
- `404` - Feedback not found
- `500` - Server error

---

## Admin Routes
Base Path: `/api/admin`

### 1. Get Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard`  
**Access:** Private/Admin  
**Description:** Get comprehensive dashboard statistics (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1000,
      "totalBooks": 500,
      "totalOrders": 2500,
      "totalRevenue": "125000.00",
      "activeMemberships": 350,
      "totalFeedback": 1800,
      "averageRating": "4.35"
    },
    "recentOrders": [
      {
        "id": 1,
        "total_amount": 59.97,
        "status": "pending",
        "created_at": "2025-01-01T00:00:00.000Z",
        "user_name": "John Doe",
        "user_email": "john@example.com"
      }
    ],
    "topSellingBooks": [
      {
        "id": 1,
        "title": "Book Title",
        "author": "Author Name",
        "price": 19.99,
        "cover_image": "image_url",
        "total_sold": 150,
        "total_quantity": 200
      }
    ],
    "monthlySales": [
      {
        "month": "2025-01",
        "order_count": 250,
        "revenue": "12500.00"
      }
    ],
    "categoryDistribution": [
      {
        "category": "Fiction",
        "book_count": 150
      }
    ],
    "orderStatusDistribution": [
      {
        "status": "completed",
        "count": 1800
      },
      {
        "status": "pending",
        "count": 300
      }
    ]
  }
}
```

**Error Responses:**
- `500` - Server error

---

### 2. Get All Users
**Endpoint:** `GET /api/admin/users`  
**Access:** Private/Admin  
**Description:** Get all users with filters (Admin only)

**Query Parameters:**
- `search` (string) - Search by name or email
- `role` (string) - Filter by role (user/admin)
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

**Error Responses:**
- `500` - Server error

---

### 3. Get User Details
**Endpoint:** `GET /api/admin/users/:id/details`  
**Access:** Private/Admin  
**Description:** Get detailed user information (Admin only)

**URL Parameters:**
- `id` (number) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    "statistics": {
      "totalOrders": 25,
      "totalSpent": "499.75",
      "lastOrderDate": "2025-01-15T00:00:00.000Z",
      "totalBooks": 30,
      "totalFeedback": 15
    },
    "membership": {
      "id": 1,
      "plan_type": "premium",
      "status": "active",
      "end_date": "2025-02-01"
    }
  }
}
```

**Error Responses:**
- `404` - User not found
- `500` - Server error

---

### 4. Update User Role
**Endpoint:** `PUT /api/admin/users/:id/role`  
**Access:** Private/Admin  
**Description:** Update user role (Admin only)

**URL Parameters:**
- `id` (number) - User ID

**Request Body:**
```json
{
  "role": "string (required: user, admin)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid role
- `404` - User not found
- `500` - Server error

---

### 5. Get Sales Report
**Endpoint:** `GET /api/admin/sales-report`  
**Access:** Private/Admin  
**Description:** Get sales report with date range (Admin only)

**Query Parameters:**
- `startDate` (string) - Start date (YYYY-MM-DD)
- `endDate` (string) - End date (YYYY-MM-DD)
- `groupBy` (string) - Group by (day, month, year)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "salesByPeriod": [
      {
        "period": "2025-01-01",
        "order_count": 50,
        "revenue": "2500.00",
        "avg_order_value": "50.00"
      }
    ],
    "summary": {
      "totalOrders": 500,
      "totalRevenue": "25000.00",
      "averageOrderValue": "50.00"
    }
  }
}
```

**Error Responses:**
- `500` - Server error

---

### 6. Delete User
**Endpoint:** `DELETE /api/admin/users/:id`  
**Access:** Private/Admin  
**Description:** Delete a user (Admin only, cannot delete admin users)

**URL Parameters:**
- `id` (number) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `403` - Cannot delete admin users
- `404` - User not found
- `500` - Server error

---

## Health Check

### Health Check Endpoint
**Endpoint:** `GET /health`  
**Access:** Public  
**Description:** Check API health status

**Success Response (200):**
```json
{
  "status": "ok",
  "message": "BOI Bookstore API is running",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Access Control Summary

### Public Endpoints (No Authentication Required)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/books` (all book listing endpoints)
- `GET /api/books/:id`
- `GET /api/books/categories/list`
- `GET /api/feedback/book/:bookId`
- `GET /api/feedback/recent`
- `GET /api/memberships/plans`
- `GET /health`

### Private Endpoints (Authentication Required)
- `GET /api/auth/verify`
- `POST /api/orders`
- `GET /api/orders/user/:userId`
- `GET /api/orders/:id`
- `DELETE /api/orders/:id`
- `GET /api/user-books/:userId` (all user-books endpoints)
- `POST /api/memberships/subscribe`
- `GET /api/memberships/user/:userId`
- `PUT /api/memberships/:id/cancel`
- `PUT /api/memberships/:id/renew`
- `POST /api/feedback`
- `GET /api/feedback/user/:userId`
- `PUT /api/feedback/:id`
- `DELETE /api/feedback/:id`

### Admin Only Endpoints (Admin Role Required)
- `POST /api/books` (Create book)
- `PUT /api/books/:id` (Update book)
- `DELETE /api/books/:id` (Delete book)
- `PUT /api/orders/:id/status` (Update order status)
- `DELETE /api/memberships/:id`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/users/:id/details`
- `PUT /api/admin/users/:id/role`
- `GET /api/admin/sales-report`
- `DELETE /api/admin/users/:id`

---

## Authentication

### JWT Token Usage
Most private endpoints require JWT authentication. Include the token in the request header:

```
Authorization: Bearer {your_jwt_token}
```

The token is obtained from:
- Registration response (`/api/auth/register`)
- Login response (`/api/auth/login`)

Token payload contains:
```json
{
  "userId": 1,
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Database Schema Overview

### Main Tables
1. **users** - User accounts
2. **books** - Book inventory
3. **orders** - Customer orders
4. **order_items** - Individual items in orders
5. **user_books** - Books purchased by users
6. **memberships** - User membership subscriptions
7. **feedback** - Book reviews and ratings

### Key Relationships
- `orders` → `users` (many-to-one)
- `order_items` → `orders` (many-to-one)
- `order_items` → `books` (many-to-one)
- `user_books` → `users` (many-to-one)
- `user_books` → `books` (many-to-one)
- `memberships` → `users` (many-to-one)
- `feedback` → `users` (many-to-one)
- `feedback` → `books` (many-to-one)

---

## Notes

1. **Transaction Handling**: Order creation and feedback submission use database transactions to ensure data consistency.

2. **Stock Management**: Book stock is automatically updated when orders are created or cancelled.

3. **Rating Calculation**: Book ratings are automatically recalculated when feedback is added, updated, or deleted.

4. **Pagination**: Most list endpoints support pagination with `page` and `limit` query parameters.

5. **CORS**: The API is configured to accept requests from `http://localhost:5173` (configurable via `CLIENT_URL` environment variable).

6. **Environment Variables**:
   - `PORT` - Server port (default: 5000)
   - `JWT_SECRET` - JWT signing secret
   - `JWT_EXPIRES_IN` - Token expiration (default: 7d)
   - `CLIENT_URL` - Frontend URL for CORS
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database configuration

---

## Version
API Version: 1.0  
Last Updated: December 22, 2025
