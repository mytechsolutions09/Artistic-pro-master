
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ProductProvider } from './contexts/ProductContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { AppearanceProvider } from './contexts/AppearanceContext';
import { useScrollRestoration } from './hooks/useScrollToTop';
import { checkEnvironmentVariables, getLocalhostConfig, isLocalhost } from './utils/envCheck';
import './utils/testEnv'; // Auto-run environment test in development
import Header from './components/Header';
import Footer from './components/Footer';
import BottomTabs from './components/BottomTabs';
import NotificationContainer from './components/Notification';
import Homepage from './pages/Homepage';
import CategoriesPage from './pages/CategoriesPage';
import BrowsePage from './pages/BrowsePage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import ProductPage from './pages/ProductPage';
import ClothingProductPage from './pages/ClothingProductPage';
import UserDashboard from './pages/UserDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import DownloadPage from './pages/DownloadPage';
import SearchResults from './pages/SearchResults';
import FavoritesPage from './pages/FavoritesPage';
import MenClothingPage from './pages/MenClothingPage';
import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import ShippingInfo from './pages/ShippingInfo';
import Returns from './pages/Returns';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import CustomerCare from './pages/admin/CustomerCare';
import EmailManagement from './pages/admin/EmailManagement';
import Analytics from './pages/admin/Analytics';
import Tasks from './pages/admin/Tasks';
import Activities from './pages/admin/Activities';
import Settings from './pages/admin/Settings';
import HomepageManagement from './pages/admin/HomepageManagement';
import Reviews from './pages/admin/Reviews';
import DatabaseManagement from './pages/admin/Database';
import Clothes from './pages/admin/Clothes';
import Shipping from './pages/admin/Shipping';
import AdminReturns from './pages/admin/Returns';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import EnvTest from './components/EnvTest';
import SkeletonTest from './pages/SkeletonTest';

function AppContent() {
  const location = useLocation();
  const hideHeaderPaths = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];
  const shouldHideHeader = hideHeaderPaths.includes(location.pathname);
  const shouldHideFooter = location.pathname.startsWith('/admin') || 
                          location.pathname === '/dashboard' || 
                          location.pathname === '/about-us' ||
                          location.pathname === '/sign-in' || 
                          location.pathname === '/sign-up' || 
                          location.pathname === '/forgot-password' || 
                          location.pathname === '/reset-password';
  
  // Default browser scroll behavior (no custom scroll handling)
  useScrollRestoration();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {!shouldHideHeader && <Header />}
      <NotificationContainer />
      <BottomTabs />
      <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Homepage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route path="/clothes" element={<MenClothingPage />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-failed" element={<PaymentFailed />} />
                  <Route path="/download/:productId" element={<DownloadPage />} />
                  <Route path="/sign-in" element={<LoginForm onLoginSuccess={() => window.location.href = '/dashboard'} />} />
                  <Route path="/sign-up" element={<SignUpForm />} />
                  <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                  <Route path="/reset-password" element={<ResetPasswordForm />} />
                  
                  {/* Support Pages */}
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/shipping-info" element={<ShippingInfo />} />
                  <Route path="/returns-and-refunds" element={<Returns />} />
                  <Route path="/terms-and-conditions" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  
                  <Route path="/env-test" element={<EnvTest />} />
                  <Route path="/skeleton-test" element={<SkeletonTest />} />
                  
                  {/* Category and Product Routes - Order matters! */}
                  {/* Clothing Product Route (must come before generic routes) */}
                  <Route path="/clothes/:productSlug" element={<ClothingProductPage />} />
                  <Route path="/:categorySlug" element={<CategoryDetailPage />} />
                  <Route path="/:categorySlug/:productSlug" element={<ProductPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/tasks" element={<AdminProtectedRoute><Tasks /></AdminProtectedRoute>} />
                  <Route path="/admin/activities" element={<AdminProtectedRoute><Activities /></AdminProtectedRoute>} />
                  <Route path="/admin" element={<AdminProtectedRoute><Dashboard /></AdminProtectedRoute>} />
                  <Route path="/admin/orders" element={<AdminProtectedRoute><Orders /></AdminProtectedRoute>} />
                  <Route path="/admin/products" element={<AdminProtectedRoute><Products /></AdminProtectedRoute>} />
                  <Route path="/admin/clothes" element={<AdminProtectedRoute><Clothes /></AdminProtectedRoute>} />
                  <Route path="/admin/shipping" element={<AdminProtectedRoute><Shipping /></AdminProtectedRoute>} />
                  <Route path="/admin/returns" element={<AdminProtectedRoute><AdminReturns /></AdminProtectedRoute>} />
                  <Route path="/admin/categories" element={<AdminProtectedRoute><Categories /></AdminProtectedRoute>} />
                  <Route path="/admin/users" element={<AdminProtectedRoute><Users /></AdminProtectedRoute>} />
                  <Route path="/admin/customer-care" element={<AdminProtectedRoute><CustomerCare /></AdminProtectedRoute>} />
                  <Route path="/admin/email" element={<AdminProtectedRoute><EmailManagement /></AdminProtectedRoute>} />
                  <Route path="/admin/analytics" element={<AdminProtectedRoute><Analytics /></AdminProtectedRoute>} />
                  <Route path="/admin/homepage" element={<AdminProtectedRoute><HomepageManagement /></AdminProtectedRoute>} />
                  <Route path="/admin/reviews" element={<AdminProtectedRoute><Reviews /></AdminProtectedRoute>} />
                  <Route path="/admin/database" element={<AdminProtectedRoute><DatabaseManagement /></AdminProtectedRoute>} />
                  <Route path="/admin/settings" element={<AdminProtectedRoute><Settings /></AdminProtectedRoute>} />
      </Routes>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

function App() {
  // Validate environment variables on app startup
  useEffect(() => {

    
    // Check environment variables
    const envValid = checkEnvironmentVariables();
    
    if (envValid) {

      
      // Log localhost configuration if in development
      if (isLocalhost()) {
        const localhostConfig = getLocalhostConfig();

      }
    } else {
      console.error('❌ Environment validation failed. Please check your .env file.');
    }
    
    // Environment info is loaded
  }, []);

  return (
    <AuthProvider>
      <CurrencyProvider>
        <ProductProvider>
          <CategoryProvider>
            <AppearanceProvider>
              <Router>
                <AppContent />
              </Router>
            </AppearanceProvider>
          </CategoryProvider>
        </ProductProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
