
import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminNews from './pages/AdminNews';
import AdminBanners from './pages/AdminBanners';
import AdminUsers from './pages/AdminUsers';
import AdminAttendance from './pages/AdminAttendance';
import AdminEmployeeAttendance from './pages/AdminEmployeeAttendance';
import AdminSettings from './pages/AdminSettings';
import { useToast } from '../components/ToastContext';
import './admin.css';

export default function AdminLayout(): React.ReactElement {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <div className="adminBrand" onClick={() => navigate('/admin')} role="button" tabIndex={0}>
          <div style={{ padding: '8px', backgroundColor: 'var(--admin-primary)', borderRadius: '12px' }}>☕</div>
          <span>HALU ADMIN</span>
        </div>

        <nav className="adminNav">
          <NavLink end to="/admin" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span>Danh mục</span>
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
            <span>Sản phẩm</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
            <span>Đơn hàng</span>
          </NavLink>
          <NavLink to="/admin/news" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>
            <span>Tin tức</span>
          </NavLink>
          <NavLink to="/admin/banners" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>Banners</span>
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Nhân viên</span>
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'adminLink active' : 'adminLink')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Cài đặt</span>
          </NavLink>
        </nav>

        <div className="adminSidebarFooter">
          <button
            className="adminBtn danger"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              showToast('Đã đăng xuất thành công', 'info');
              navigate('/login');
            }}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="adminMain">
        <header className="adminTopbar">
          <div className="adminTopbarTitle">HỆ THỐNG QUẢN TRỊ</div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="adminBtn ghost" type="button" onClick={() => navigate('/')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span>Xem Website</span>
            </button>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
              AD
            </div>
          </div>
        </header>

        <div className="adminContent">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products/*" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="attendance/:employeeCode" element={<AdminEmployeeAttendance />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

