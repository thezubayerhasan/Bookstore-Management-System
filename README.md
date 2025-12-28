# BOI Bookstore - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MySQL database running
- Backend and frontend dependencies installed

### 1. Start the Backend Server

```bash
cd server
npm start
```

Expected output:
```
╔═══════════════════════════════════════╗
║   🚀 BOI Bookstore Server Running    ║
║   📍 Port: 5000                      ║
║   🌍 Environment: development        ║
║   🔗 Client URL: http://localhost:5173 ║
╚═══════════════════════════════════════╝

✅ Database connected successfully
```

### 2. Start the Frontend Client

Open a new terminal:

```bash
cd client
npm run dev
```

Expected output:
```
VITE v7.3.0  ready in 318 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Access the Application

Open your browser and navigate to: **http://localhost:5173**

## 🧪 Testing the Integration

### Test User Registration & Login

1. **Register a New User:**
   - Click "Login" button in header
   - Switch to "Register" tab
   - Fill in name, email, and password (min 6 characters)
   - Click "Create Account"
   - You should be automatically logged in

2. **Test Login:**
   - Logout
   - Click "Login" button
   - Enter your credentials
   - Click "Login"
   - Your cart count and user info should appear

### Test Book Browsing

1. Navigate to "Books" page
2. Try searching for a book
3. Filter by category
4. Sort by price/rating
5. Click on a book to view details

### Test Book Rating & Reviews

1. Login to your account
2. Click on any book to view details
3. Scroll to the Reviews section
4. Select a rating (1-5 stars)
5. Write a review comment (optional)
6. Click "Submit Review"
7. Your review should appear highlighted
8. View all customer reviews below

### Test Shopping Cart

1. Add books to cart (requires login)
2. Go to checkout
3. View cart items
4. Update quantities
5. Remove items
6. Proceed to payment
7. Complete order

### Test My Books

1. After completing an order
2. Go to "My Books" page
3. View your purchased books
4. They should appear with purchase dates

### Test Membership

1. Go to "Membership" page
2. View available plans
3. Click "Subscribe" on a plan
4. Confirm subscription
5. View active membership status

### Test Feedback

1. Go to "Feedback" page
2. Rate your experience (1-5 stars)
3. Write feedback message (general site feedback)
4. Submit feedback
5. View your feedback in the list with other community reviews
6. All feedback is visible to other users

### Test Admin Dashboard (Admin Only)

1. Create an admin user in database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```
2. Login as admin
3. Go to "Admin" page
4. View dashboard statistics
5. Manage users and books

## 🔍 API Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Books Endpoint
```bash
curl http://localhost:5000/api/books
```

## 🐛 Troubleshooting

### Backend Issues

**Problem:** "Database connection failed"
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
USE boi_bookstore;
SHOW TABLES;
```

**Problem:** "Port 5000 already in use"
```bash
# Change PORT in server/.env
PORT=5001

# Or kill the process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

### Frontend Issues

**Problem:** "Failed to fetch"
- Ensure backend is running on port 5000
- Check `.env` file has correct `VITE_API_URL=http://localhost:5000/api`
- Check browser console for CORS errors

**Problem:** "Module not found"
```bash
cd client
rm -rf node_modules
npm install
```

**Problem:** "Build errors"
```bash
cd client
npm run build
# Check for syntax errors in the output
```

### Authentication Issues

**Problem:** "Token expired" or "Unauthorized"
- Clear localStorage: `localStorage.clear()` in browser console
- Logout and login again
- Check JWT_SECRET matches in server/.env

**Problem:** "Cannot login"
- Check database connection
- Verify user exists in database
- Check password is correct
- View server logs for errors

## 📝 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=boi_bookstore
DB_PORT=3306
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Dependencies

### Backend
- express - Web framework
- mysql2 - MySQL client
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - Cross-origin resource sharing
- dotenv - Environment variables

### Frontend
- react - UI library
- axios - HTTP client
- lucide-react - Icons
- vite - Build tool
- tailwindcss - Styling

## 🔒 Security Notes

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Implement rate limiting** for APIs
4. **Validate all inputs** on backend
5. **Use environment variables** for sensitive data
6. **Enable CORS** only for trusted domains
7. **Implement password strength requirements**
8. **Add email verification** for new users

## 📚 Documentation

- [API Documentation](../server/API_DOCUMENTATION.md)
- [Integration Summary](./INTEGRATION_SUMMARY.md)
- [Database Schema](../server/database/schema.sql)

## 🤝 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all services are running
3. Check environment variables
4. Review API documentation
5. Check database connection

## ✨ Features Implemented

✅ User authentication (Register/Login/Logout)
✅ Browse and search books
✅ Filter and sort books
✅ Shopping cart
✅ Order processing (instant completion)
✅ View purchased books with dates
✅ Membership subscriptions
✅ **Book rating & review system** - Rate books 1-5 stars with comments
✅ **General feedback** - Site feedback not tied to specific books
✅ **Customer reviews display** - View all user reviews on book pages
✅ Admin dashboard with analytics
✅ JWT token authentication
✅ Error handling
✅ Loading states
✅ Responsive design

---

**Ready to use!** 🎉

Both backend and frontend are fully integrated and working together.
