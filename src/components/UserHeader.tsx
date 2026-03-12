import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../user/CartContext';
import { fetchCategories, CategoryApi } from '../services/categoriesService';
import { Search, ShoppingCart, User as UserIcon, LogOut, ChevronDown, Bell } from 'lucide-react';
import './UserHeader.css';

type AnyObject = Record<string, any>;

function safeParseUser(raw: string | null): AnyObject | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as AnyObject; } catch { return null; }
}

const NAV_ITEMS = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Giới thiệu', path: '/about' },
  { label: 'Danh mục', path: '/products', hasDropdown: true },
  { label: 'Tin tức', path: '/news' },
  { label: 'Liên hệ', path: '/contact' },
];

export default function UserHeader(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalQuantity } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [updateTick, setUpdateTick] = useState(0);

  const isLoggedIn = !!localStorage.getItem('token');
  const user = safeParseUser(localStorage.getItem('user'));
  const userName = user?.name || user?.username || user?.full_name || 'Khách';
  const userInitials = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchAll = () => {
      fetchCategories()
        .then((list) => setCategories(list))
        .catch((err) => console.error(err));
    };
    
    fetchAll();

    const handleUpdate = () => {
      console.log('Header detected user data update');
      setUpdateTick(t => t + 1);
    };

    window.addEventListener('userDataUpdated', handleUpdate);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('userDataUpdated', handleUpdate);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className={`user-header ${scrolled ? 'scrolled' : ''}`}>
      <div className={`header-container ${scrolled ? 'scrolled' : ''}`}>
        
        <div className="header-left">
          <Link to="/" className="logo-link">
            <div className="logo-img" style={{ backgroundImage: 'url(//bizweb.dktcdn.net/100/351/580/themes/714586/assets/logo.png?1705464185330)' }} />
          </Link>
        </div>

        <nav className="header-center">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              
              if (item.hasDropdown) {
                return (
                  <li key={item.path} className="dropdown-wrapper">
                    <Link to={item.path} className={`nav-item-link ${isActive ? 'active' : ''}`}>
                      {item.label} <ChevronDown size={14} />
                    </Link>
                    <div className="dropdown-menu">
                      {categories.length === 0 ? (
                        <div className="dropdown-item">Đang tải...</div>
                      ) : (
                        categories.map((cat) => (
                          <button
                            key={cat.id}
                            className="dropdown-item"
                            onClick={() => navigate(`/category/${cat.id}`)}
                          >
                            {cat.name}
                          </button>
                        ))
                      )}
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <Link to={item.path} className={`nav-item-link ${isActive ? 'active' : ''}`}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header-right">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="header-search-bar">
              <Search size={18} />
              <input
                autoFocus
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
              />
            </form>
          ) : (
            <button className="action-btn" onClick={() => setSearchOpen(true)}>
              <Search size={22} />
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button className="action-btn" onClick={() => navigate('/cart')}>
              <ShoppingCart size={22} />
              {totalQuantity > 0 && <span className="cart-badge">{totalQuantity > 99 ? '99+' : totalQuantity}</span>}
            </button>
          </div>

          <div className="header-separator" style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="user-profile-btn" onClick={() => navigate('/profile')}>
                <div className="user-avatar">{userInitials}</div>
                <span className="user-name">{userName}</span>
              </button>
              <button className="action-btn" onClick={handleLogout} title="Đăng xuất">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-link">Đăng nhập</Link>
              <Link to="/register" className="register-btn">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
