-- BOI Bookstore Database Schema
-- Drop existing tables if they exist
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS user_books;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY idx_email (email),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Books Table
CREATE TABLE books (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT '0.00',
  reviews_count INT DEFAULT '0',
  cover_image VARCHAR(500) DEFAULT NULL,
  publish_year INT DEFAULT NULL,
  pages INT DEFAULT NULL,
  language VARCHAR(50) DEFAULT 'English',
  publisher VARCHAR(255) DEFAULT NULL,
  isbn VARCHAR(20) DEFAULT NULL,
  stock_quantity INT DEFAULT '0',
  is_featured TINYINT(1) DEFAULT '0',
  is_bestseller TINYINT(1) DEFAULT '0',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY isbn (isbn),
  KEY idx_category (category),
  KEY idx_author (author),
  KEY idx_price (price),
  KEY idx_rating (rating),
  KEY idx_featured (is_featured),
  KEY idx_bestseller (is_bestseller)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT NULL,
  shipping_address TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_status (status),
  KEY idx_created_at (created_at),
  CONSTRAINT orders_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE order_items (
  id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  book_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT '1',
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_id (order_id),
  KEY idx_book_id (book_id),
  CONSTRAINT order_items_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_ibfk_2 FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Books Table (Purchased/Owned Books)
CREATE TABLE user_books (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  order_id INT NOT NULL,
  purchased_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_book (user_id, book_id),
  KEY order_id (order_id),
  KEY idx_user_id (user_id),
  KEY idx_book_id (book_id),
  CONSTRAINT user_books_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_books_ibfk_2 FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT user_books_ibfk_3 FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Memberships Table
CREATE TABLE memberships (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_type ENUM('basic', 'premium', 'enterprise') NOT NULL,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_status (status),
  KEY idx_end_date (end_date),
  CONSTRAINT memberships_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feedback Table
-- Note: book_id is nullable to allow general feedback not tied to a specific book
CREATE TABLE feedback (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  book_id INT DEFAULT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_book_id (book_id),
  KEY idx_rating (rating),
  KEY idx_created_at (created_at),
  CONSTRAINT feedback_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT feedback_ibfk_2 FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
  CONSTRAINT feedback_chk_1 CHECK ((rating BETWEEN 1 AND 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data: Admin User (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@boi.com', '$2b$10$XQQ3TZq5Z5Z5Z5Z5Z5Z5ZuK1.K1.K1.K1.K1.K1.K1.K1.K1.K1.K', 'admin');

-- Seed Data: 20 Books
INSERT INTO books (title, author, category, description, price, rating, reviews_count, cover_image, publish_year, pages, language, publisher, isbn, stock_quantity, is_featured, is_bestseller) VALUES
('The Midnight Library', 'Matt Haig', 'Fiction', 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.', 14.99, 4.5, 1250, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', 2020, 304, 'English', 'Viking', '9780525559474', 50, TRUE, TRUE),

('Atomic Habits', 'James Clear', 'Self-Help', 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Tiny changes, remarkable results.', 16.99, 4.8, 2340, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 2018, 320, 'English', 'Avery', '9780735211292', 75, TRUE, TRUE),

('Project Hail Mary', 'Andy Weir', 'Science Fiction', 'A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the author of The Martian.', 15.99, 4.7, 980, 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?w=400', 2021, 476, 'English', 'Ballantine Books', '9780593135204', 45, TRUE, FALSE),

('The Psychology of Money', 'Morgan Housel', 'Business', 'Timeless lessons on wealth, greed, and happiness. Doing well with money isnt necessarily about what you know.', 13.99, 4.6, 1567, 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400', 2020, 256, 'English', 'Harriman House', '9780857197689', 60, TRUE, TRUE),

('The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'Romance', 'A legendary film actress reflects on her relentless rise to the top and the risks she took, the loves she lost, and the long-held secrets.', 12.99, 4.6, 2100, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 2017, 400, 'English', 'Atria Books', '9781501161933', 40, FALSE, TRUE),

('Educated', 'Tara Westover', 'Biography', 'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.', 14.49, 4.7, 1890, 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400', 2018, 334, 'English', 'Random House', '9780399590504', 55, TRUE, FALSE),

('The Silent Patient', 'Alex Michaelides', 'Mystery', 'A womans act of violence against her husband-and of the therapist obsessed with uncovering her motive.', 13.49, 4.4, 1420, 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400', 2019, 336, 'English', 'Celadon Books', '9781250301697', 65, FALSE, TRUE),

('Sapiens', 'Yuval Noah Harari', 'History', 'A Brief History of Humankind. How did our species succeed in the battle for dominance?', 17.99, 4.8, 3200, 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400', 2015, 443, 'English', 'Harper', '9780062316097', 80, TRUE, TRUE),

('Where the Crawdads Sing', 'Delia Owens', 'Fiction', 'A powerful and moving story of a young woman who raises herself in the marshes of the Deep South.', 14.99, 4.5, 2890, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 2018, 384, 'English', 'Putnam', '9780735219090', 70, TRUE, TRUE),

('The Alchemist', 'Paulo Coelho', 'Fiction', 'A magical tale about following your dreams and listening to your heart.', 11.99, 4.6, 4500, 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400', 1988, 208, 'English', 'HarperOne', '9780062315007', 90, TRUE, TRUE),

('Think Like a Monk', 'Jay Shetty', 'Self-Help', 'Train Your Mind for Peace and Purpose Every Day. Ancient wisdom meets modern life.', 15.49, 4.5, 1120, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 2020, 352, 'English', 'Simon & Schuster', '9781982134488', 50, FALSE, FALSE),

('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'A great modern classic and the prelude to The Lord of the Rings. Bilbo Baggins is whisked away on an unexpected journey.', 12.49, 4.7, 5200, 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400', 1937, 310, 'English', 'Mariner Books', '9780547928227', 100, TRUE, TRUE),

('1984', 'George Orwell', 'Science Fiction', 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.', 10.99, 4.6, 3800, 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400', 1949, 328, 'English', 'Signet Classic', '9780451524935', 85, TRUE, TRUE),

('The Art of War', 'Sun Tzu', 'Philosophy', 'An ancient Chinese military treatise dating from the 5th century BC. Strategies can be applied to business and life.', 9.99, 4.4, 2100, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400', -500, 273, 'English', 'Shambhala', '9781590302255', 120, FALSE, FALSE),

('Deep Work', 'Cal Newport', 'Business', 'Rules for Focused Success in a Distracted World. Learn to focus without distraction on cognitively demanding tasks.', 15.99, 4.6, 1890, 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=400', 2016, 296, 'English', 'Grand Central Publishing', '9781455586691', 55, FALSE, TRUE),

('The Book Thief', 'Markus Zusak', 'Historical Fiction', 'A story about the ability of books to feed the soul set in Nazi Germany.', 13.99, 4.7, 2650, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 2005, 552, 'English', 'Knopf Books', '9780375842207', 60, TRUE, FALSE),

('Becoming', 'Michelle Obama', 'Biography', 'An intimate, powerful, and inspiring memoir by the former First Lady of the United States.', 18.99, 4.8, 4200, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 2018, 448, 'English', 'Crown', '9781524763138', 95, TRUE, TRUE),

('Harry Potter and the Sorcerers Stone', 'J.K. Rowling', 'Fantasy', 'The first novel in the Harry Potter series. Harry Potter discovers he is a wizard on his eleventh birthday.', 14.99, 4.9, 8500, 'https://moviesanywhere.com/movie/harry-potter-and-the-sorcerers-stone', 1997, 309, 'English', 'Scholastic', '9780590353427', 150, TRUE, TRUE),

('The Lean Startup', 'Eric Ries', 'Business', 'How Todays Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses.', 16.49, 4.5, 1567, 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=400', 2011, 336, 'English', 'Crown Business', '9780307887894', 45, FALSE, FALSE),

('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', 'A portrait of the Jazz Age in all of its decadence and excess. The mysterious millionaire Jay Gatsby.', 10.99, 4.5, 3900, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 1925, 180, 'English', 'Scribner', '9780743273565', 110, TRUE, TRUE);

-- Sample test user (password: test123)
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john@example.com', '$2b$10$XQQ3TZq5Z5Z5Z5Z5Z5Z5ZuK1.K1.K1.K1.K1.K1.K1.K1.K1.K1.K', 'user');
