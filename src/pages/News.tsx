import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchNewsActive, NewsApi } from '../services/newsService';

const GOLD = '#c8a96e';

export default function News(): React.ReactElement {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<NewsApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setLoading(true);
    fetchNewsActive()
      .then((list) => {
        // Sort by newest first
        const sorted = [...list].sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setNewsList(sorted);
      })
      .catch((err) => console.error('Error fetching news:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", paddingBottom: '60px' }}>
      {/* Page Title / Breadcrumb Area */}
      <div style={{ backgroundColor: '#f5f0ea', padding: '20px 0', marginBottom: '40px', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 700, color: '#333', textTransform: 'uppercase' }}>
            Tin tức
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px' }}>
        
        {/* SIDEBAR */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ backgroundColor: '#f9f7f2', padding: '20px', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 15px', textTransform: 'uppercase', color: '#333', borderBottom: '2px solid' + GOLD, display: 'inline-block', paddingBottom: '5px' }}>
              Danh mục bài viết
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Trang chủ</Link></li>
              <li><Link to="/about" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Giới thiệu</Link></li>
              <li><Link to="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Sản phẩm</Link></li>
              <li><Link to="/news" style={{ color: GOLD, textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Tin tức</Link></li>
              <li><Link to="/contact" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Liên hệ</Link></li>
            </ul>
          </div>

          <div style={{ borderRadius: '4px', overflow: 'hidden' }}>
            <img 
              src="https://bizweb.dktcdn.net/100/351/580/themes/714586/assets/aside_banner.png?1705464185330" 
              alt="Ad Banner" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </aside>

        {/* MAIN CONTENT - NEWS LIST */}
        <main>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: GOLD, fontSize: '20px' }}>Đang tải tin tức...</div>
          ) : newsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>Chưa có tin tức nào.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {newsList.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => {
                const imageUrl = item.image 
                  ? (item.image.startsWith('http') ? item.image : `/doan/${item.image}`)
                  : 'https://via.placeholder.com/400x250?text=No+Image';
                
                const displayDate = item.created_at 
                  ? new Date(item.created_at.replace(' ', 'T')).toLocaleDateString('vi-VN') 
                  : 'Vừa xong';

                return (
                  <div key={item.id} style={{ display: 'flex', gap: '25px', paddingBottom: '40px', borderBottom: '1px dashed #eee' }}>
                    {/* Image */}
                    <div 
                      style={{ flexShrink: 0, width: '350px', height: '220px', overflow: 'hidden', cursor: 'pointer', borderRadius: '4px' }}
                      onClick={() => navigate(`/news/${item.id}`)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={item.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <h3 
                        style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 'bold', color: '#1a0f00', cursor: 'pointer', textTransform: 'uppercase' }}
                        onClick={() => navigate(`/news/${item.id}`)}
                      >
                        {item.title}
                      </h3>
                      
                      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', color: '#999', fontSize: '13px' }}>
                        <span>Nguyễn Hữu Mạnh</span>
                        <span>•</span>
                        <span>{displayDate}</span>
                        <span>•</span>
                        <span>0 bình luận</span>
                      </div>

                      <p style={{ 
                        color: '#666', 
                        fontSize: '14px', 
                        lineHeight: 1.6, 
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.content.replace(/<[^>]*>/g, '').substring(0, 250)}...
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination UI */}
          {!loading && newsList.length > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '40px' }}>
              <button
                onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0, 0); }}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 15px', borderRadius: '4px', border: '1px solid #ddd',
                  backgroundColor: '#fff', color: currentPage === 1 ? '#ccc' : '#333',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Trang trước
              </button>
              
              {Array.from({ length: Math.ceil(newsList.length / pageSize) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
                  style={{
                    width: '35px', height: '35px', borderRadius: '4px', border: '1px solid',
                    borderColor: currentPage === i + 1 ? GOLD : '#ddd',
                    backgroundColor: currentPage === i + 1 ? GOLD : '#fff',
                    color: currentPage === i + 1 ? '#fff' : '#333',
                    cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => { setCurrentPage(prev => Math.min(prev + 1, Math.ceil(newsList.length / pageSize))); window.scrollTo(0, 0); }}
                disabled={currentPage === Math.ceil(newsList.length / pageSize)}
                style={{
                  padding: '8px 15px', borderRadius: '4px', border: '1px solid #ddd',
                  backgroundColor: '#fff', color: currentPage === Math.ceil(newsList.length / pageSize) ? '#ccc' : '#333',
                  cursor: currentPage === Math.ceil(newsList.length / pageSize) ? 'not-allowed' : 'pointer'
                }}
              >
                Trang sau
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
