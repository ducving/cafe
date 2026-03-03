import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchNewsDetail, NewsApi } from '../services/newsService';

const GOLD = '#c8a96e';

export default function NewsDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchNewsDetail(Number(id))
      .then((data) => {
        setNews(data);
      })
      .catch((err) => {
        console.error('Error fetching news detail:', err);
        setError('Không tìm thấy bài viết hoặc có lỗi xảy ra.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: GOLD, fontSize: '20px' }}>Đang tải bài viết...</div>;
  }

  if (error || !news) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>{error || 'Không tìm thấy bài viết'}</div>;
  }

  const displayDate = news.created_at 
    ? new Date(news.created_at.replace(' ', 'T')).toLocaleDateString('vi-VN') 
    : 'Vừa xong';

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", paddingBottom: '60px' }}>
      {/* Page Title / Breadcrumb Area */}
      <div style={{ backgroundColor: '#f5f0ea', padding: '20px 0', marginBottom: '40px', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '8px', fontSize: '14px', color: '#666' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/news" style={{ color: '#666', textDecoration: 'none' }}>Tin tức</Link>
          <span>/</span>
          <span style={{ color: GOLD }}>{news.title}</span>
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
              <li><Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', paddingBottom: '10px', display: 'block', borderBottom: '1px dashed #ddd' }}>Trang chủ</Link></li>
              <li><Link to="/about" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', paddingBottom: '10px', display: 'block', borderBottom: '1px dashed #ddd' }}>Giới thiệu</Link></li>
              <li><Link to="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', paddingBottom: '10px', display: 'block', borderBottom: '1px dashed #ddd' }}>Sản phẩm</Link></li>
              <li><Link to="/news" style={{ color: GOLD, textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', paddingBottom: '10px', display: 'block', borderBottom: '1px dashed #ddd' }}>Tin tức</Link></li>
              <li><Link to="/contact" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Liên hệ</Link></li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#f9f7f2', padding: '20px', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 15px', textTransform: 'uppercase', color: '#333', borderBottom: '2px solid' + GOLD, display: 'inline-block', paddingBottom: '5px' }}>
              Bài viết liên quan
            </h2>
            {/* Hardcoded related news placeholders as in the image */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/news" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', paddingBottom: '10px', display: 'block', borderBottom: '1px dashed #ddd' }}>Chế biến cà phê</Link></li>
              <li><Link to="/news" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', paddingBottom: '10px', display: 'block', borderBottom: '1px dashed #ddd' }}>Tình yêu và cà phê</Link></li>
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

        {/* MAIN CONTENT - NEWS DETAIL */}
        <main>
          <style>
            {`
              .news-content img {
                max-width: 100%;
                height: auto;
                border-radius: 4px;
                margin: 15px 0;
              }
            `}
          </style>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 10px', color: '#333', textTransform: 'uppercase' }}>
            {news.title}
          </h1>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '30px', color: '#666', fontSize: '14px' }}>
            <span>Đăng bởi <strong>Nguyễn Hữu Mạnh</strong> vào lúc {displayDate}</span>
          </div>

          {/* Render HTML Content */}
          <div 
            className="news-content"
            style={{ lineHeight: 1.8, color: '#333', fontSize: '15px' }}
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </main>
      </div>
    </div>
  );
}
