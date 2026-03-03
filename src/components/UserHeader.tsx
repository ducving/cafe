import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../user/CartContext';
import { fetchCategories, CategoryApi } from '../services/categoriesService';

type AnyObject = Record<string, any>;

function safeParseUser(raw: string | null): AnyObject | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as AnyObject; } catch { return null; }
}

const BG = '#3a2415';
const GOLD = '#c8a96e';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isLoggedIn = localStorage.getItem('token');
  const user = safeParseUser(localStorage.getItem('user'));
  const userName = user?.name || user?.username || user?.full_name || 'Khách';

  useEffect(() => {
    fetchCategories()
      .then((list) => setCategories(list))
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
    setSearchOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
      <div style={{
        backgroundColor: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        height: '80px',
        position: 'relative',
      }}>
        {/* Center group: Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', marginRight: '28px', display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '64px', height: '64px',
              backgroundImage: 'url(//bizweb.dktcdn.net/100/351/580/themes/714586/assets/logo.png?1705464185330)',
              backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
              filter: 'brightness(1.1)',
            }} />
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              if (item.hasDropdown) {
                return (
                  <div
                    key={item.path}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link
                      to={item.path}
                      style={{
                        color: isActive || dropdownOpen ? GOLD : '#fff',
                        textDecoration: 'none',
                        padding: '0 18px',
                        fontSize: '15px',
                        fontWeight: isActive ? 700 : 400,
                        lineHeight: '80px',
                        height: '80px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'color 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                      <span style={{
                        fontSize: '10px', marginLeft: '2px',
                        transition: 'transform 0.2s',
                        display: 'inline-block',
                        transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>▾</span>
                    </Link>

                    {/* Dropdown */}
                    <div style={{
                      position: 'absolute',
                      top: '80px',
                      left: '0',
                      minWidth: '220px',
                      backgroundColor: BG,
                      borderTop: `2px solid ${GOLD}`,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      borderRadius: '0 0 8px 8px',
                      padding: '8px 0',
                      opacity: dropdownOpen ? 1 : 0,
                      visibility: dropdownOpen ? 'visible' : 'hidden',
                      transform: dropdownOpen ? 'translateY(0)' : 'translateY(-8px)',
                      transition: 'opacity 0.2s, transform 0.2s, visibility 0.2s',
                      zIndex: 100,
                    }}>
                      {categories.length === 0 ? (
                        <div style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                          Đang tải...
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setDropdownOpen(false);
                              navigate(`/category/${cat.id}`);
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              padding: '10px 20px',
                              background: 'none',
                              border: 'none',
                              color: 'rgba(255,255,255,0.85)',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'background 0.15s, color 0.15s, padding-left 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(200,169,110,0.15)';
                              e.currentTarget.style.color = GOLD;
                              e.currentTarget.style.paddingLeft = '28px';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                              e.currentTarget.style.paddingLeft = '20px';
                            }}
                          >
                            {cat.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    color: isActive ? GOLD : '#fff',
                    textDecoration: 'none',
                    padding: '0 18px',
                    fontSize: '15px',
                    fontWeight: isActive ? 700 : 400,
                    lineHeight: '80px',
                    height: '80px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#fff'; }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right icons */}
        <div style={{
          position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', gap: '0',
        }}>
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
              <input
                autoFocus
                type="text"
                placeholder="Tìm kiếm ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '5px 10px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px',
                  outline: 'none', width: '160px',
                }}
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
              />
            </form>
          ) : (
            <IconBtn emoji="🔍" title="Tìm kiếm" onClick={() => setSearchOpen(true)} />
          )}

          <Separator />

          <div style={{ position: 'relative' }}>
            <IconBtn emoji="🛒" title="Giỏ hàng" onClick={() => navigate('/cart')} />
            {totalQuantity > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '-2px',
                backgroundColor: GOLD, color: BG,
                borderRadius: '50%', width: '17px', height: '17px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 800,
              }}>
                {totalQuantity > 99 ? '99' : totalQuantity}
              </span>
            )}
          </div>

          <Separator />

          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconBtn emoji="👤" title={userName} onClick={() => navigate('/profile')} />
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                  fontSize: '12px', cursor: 'pointer', padding: '4px 0',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = GOLD; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <IconBtn emoji="👤" title="Tài khoản" onClick={() => navigate('/login')} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginLeft: '2px' }}>
                <Link to="/login" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '11px', lineHeight: '16px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                >Đăng nhập</Link>
                <Link to="/register" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '11px', lineHeight: '16px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                >Đăng ký</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function IconBtn({ emoji, title, onClick }: { emoji: string; title: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        background: 'none', border: 'none', color: '#fff', fontSize: '18px',
        padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', height: '80px',
        transition: 'color 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = GOLD; e.currentTarget.style.transform = 'scale(1.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {emoji}
    </button>
  );
}

function Separator() {
  return <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />;
}
