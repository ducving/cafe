import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import RequireAuth from './components/RequireAuth';
import AdminLayout from './admin/AdminLayout';

import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';
import Checkout from './pages/Checkout';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import News from './pages/News';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import AttendanceStandalone from './pages/AttendanceStandalone';

// Single place to manage routes (like your router.tsx screenshot)
export const router = createBrowserRouter([
  {
    path: '/attendance',
    element: <AttendanceStandalone />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Shop /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'news', element: <News /> },
      { path: 'profile', element: <Profile /> },
      { path: 'order-history', element: <OrderHistory /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'cart', element: <Cart /> },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        ),
      },
      { path: 'category/:id', element: <ProductsPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'order-success/:id', element: <OrderSuccess /> },
    ],
  },
  {
    path: '/admin/*',
    element: (
      <RequireAuth adminOnly>
        <AdminLayout />
      </RequireAuth>
    ),
  },
]);
