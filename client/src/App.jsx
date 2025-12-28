import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { EbookPreviewModal } from './components/EbookPreviewModal';
import { HomePage } from './pages/HomePage';
import { BooksPage } from './pages/BooksPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyBooksPage } from './pages/MyBooksPage';
import { MembershipPage } from './pages/MembershipPage';
import { ProfilePage } from './pages/ProfilePage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState(null);

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'books':
        return <BooksPage onNavigate={handleNavigate} initialFilter={pageData} />;
      case 'bookdetail':
        return <BookDetailPage book={pageData} onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;
      case 'mybooks':
        return <MyBooksPage onNavigate={handleNavigate} />;
      case 'membership':
        return <MembershipPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'feedback':
        return <FeedbackPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <main>
          {renderPage()}
        </main>
        <AuthModal />
        <EbookPreviewModal onNavigate={handleNavigate} />
      </div>
    </AppProvider>
  );
}

export default App;
