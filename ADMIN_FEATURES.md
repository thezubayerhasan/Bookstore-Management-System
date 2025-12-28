# Admin Dashboard Features

## Overview
The admin dashboard now includes comprehensive analytics and book management functionality.

## 1. Dashboard Statistics

### Total Revenue
- Calculates the sum of all order amounts from the database
- Query: `SUM(o.total_amount) as totalRevenue FROM orders o`
- Displays in Overview tab as a stat card

### Total Order Items
- Calculates the sum of all quantities from order_items table
- Query: `SUM(oi.quantity) as totalOrderItems FROM order_items oi`
- Shows the total number of books ordered across all orders

### Total Users
- Shows count of all registered users (excluding admins)
- Displays active user count

### Total Books
- Shows count of all books in the database

## 2. Recent Orders

### Display
- Shows the 10 most recent orders from the database
- Each order displays:
  - Order ID
  - Customer name
  - Order date
  - Total amount
  - Order status (with color coding)
  - Book titles (comma-separated list)

### Database Query
- Uses LEFT JOIN to fetch order details with user and book information
- Groups order items to show book titles: `GROUP_CONCAT(b.title SEPARATOR ', ')`
- Ordered by creation date (newest first)

## 3. Book Management

### Add Book
- Click "Add Book" button to open the form modal
- Required fields: Title, Author, Category, Price
- Optional fields:
  - Cover Image URL
  - Description
  - Publisher, ISBN, Language
  - Publish Year, Pages
  - Stock Quantity
  - Featured/Bestseller checkboxes

### Edit Book
- Click the Edit icon (blue button) next to any book
- Opens the same form pre-filled with book data
- Update any field and save changes

### Delete Book
- Click the Delete icon (red button) next to any book
- Confirmation dialog appears
- Permanently removes book from database

## API Endpoints

### Dashboard Statistics
```
GET /api/admin/dashboard
Response: {
  success: true,
  data: {
    overview: {
      totalRevenue: 1234.56,
      totalOrderItems: 89,
      totalUsers: 45,
      totalBooks: 150
    },
    recentOrders: [...]
  }
}
```

### Add Book
```
POST /api/admin/books
Body: {
  title, author, category, price (required)
  description, coverImage, publishYear, pages,
  language, publisher, isbn, stockQuantity,
  isFeatured, isBestseller (optional)
}
```

### Edit Book
```
PUT /api/admin/books/:id
Body: Same as Add Book (all fields optional, uses COALESCE)
```

### Delete Book
```
DELETE /api/admin/books/:id
Response: { success: true, message: "Book deleted successfully" }
```

## Admin Access

### Hardcoded Admin Accounts
1. zubayer@gmail.com / 123456
2. tuli@gmail.com / 147852
3. shafin@gmail.com / 258963

These accounts:
- Can login without registration
- Don't exist in the database
- Cannot be deleted
- Have full admin privileges

## Features Summary

✅ Total Revenue from all orders
✅ Total Order Items count
✅ Recent Orders with book titles and user details
✅ Add Book functionality with comprehensive form
✅ Edit Book with pre-filled form
✅ Delete Book with confirmation
✅ Real-time data refresh after operations
✅ Responsive admin dashboard UI
✅ Book table with images, ratings, and actions

## Usage

1. Login with admin credentials
2. Navigate to Admin Dashboard
3. View statistics in Overview tab
4. Manage books in Books tab
5. View users in Users tab
6. View orders in Orders tab

All operations automatically refresh the dashboard data to show updated information.
