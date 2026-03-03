import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminNews from './pages/AdminNews';
import AdminBanners from './pages/AdminBanners';
import './admin.css';

export default function AdminLayout(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <div className="adminBrand" onClick={() => navigate('/admin')} role="button" tabIndex={0}>
          Cafe Admin
        </div>

        <nav className="adminNav">
          <NavLink end to="/admin" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            Danh mục
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            Sản phẩm
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            Đơn hàng
          </NavLink>
          <NavLink to="/admin/news" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            Tin tức
          </NavLink>
          <NavLink to="/admin/banners" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            Banners
          </NavLink>
        </nav>

        <div className="adminSidebarFooter">
          <button
            className="adminBtn danger"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            type="button"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="adminMain">
        <header className="adminTopbar">
          <div className="adminTopbarTitle">Trang quản trị</div>
          <button className="adminBtn" type="button" onClick={() => navigate('/')}>
            Về trang khách
          </button>
        </header>

        <div className="adminContent">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products/*" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="banners" element={<AdminBanners />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

