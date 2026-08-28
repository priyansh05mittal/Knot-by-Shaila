import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import AdminLayout from './components/layout/AdminLayout';
import { ProtectedRoute, AdminRoute, GuestRoute } from './routes/guards';

// Storefront pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CustomOrder = lazy(() => import('./pages/CustomOrder'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Terms = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.Terms })));
const PrivacyPolicy = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.PrivacyPolicy })));
const FAQ = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.FAQ })));
const ShippingReturns = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.ShippingReturns })));

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const VerifyOtp = lazy(() => import('./pages/auth/VerifyOtp'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Account pages
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const Profile = lazy(() => import('./pages/account/Profile'));
const Orders = lazy(() => import('./pages/account/Orders'));
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'));
const Addresses = lazy(() => import('./pages/account/Addresses'));
const MyCustomOrders = lazy(() => import('./pages/account/CustomOrders'));

// Admin pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminBanners = lazy(() => import('./pages/admin/Banners'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminCustomOrders = lazy(() => import('./pages/admin/CustomOrders'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));

function App() {
  return (
    <Routes>
      {/* Storefront */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/shipping-returns" element={<ShippingReturns />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-order"
          element={
            <ProtectedRoute>
              <CustomOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* Account */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="custom-orders" element={<MyCustomOrders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth (no header/footer) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="custom-orders" element={<AdminCustomOrders />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
}

export default App;
