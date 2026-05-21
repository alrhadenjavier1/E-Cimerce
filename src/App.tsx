// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductPage } from './pages/ProductPage';
import { AuthPage } from './pages/AuthPage';
import { ConfirmAccountPage } from './pages/ConfirmAccountPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCurrencySettings } from './pages/admin/AdminCurrencySettings';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminRoute } from './components/admin/AdminRoute';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { AdminFeaturedProducts } from './pages/admin/AdminFeaturedProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AuthProvider } from './context/AuthContext';
import { CheckoutPage } from './pages/CheckoutPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CurrencyProvider>
          <CartProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/confirm" element={<ConfirmAccountPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }><Route path="videos" element={<AdminFeaturedProducts />} />
              <Route path="categories" element={<AdminCategories />} />
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="currency" element={<AdminCurrencySettings />} />
              </Route>
            </Routes>
          </CartProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;