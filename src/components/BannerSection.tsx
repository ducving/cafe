import React, { useEffect, useState } from 'react';
import { BannerApi, fetchBanners } from '../services/bannersService';

export default function BannerSection(): React.ReactElement {
  const [banners, setBanners] = useState<BannerApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchBanners()
      .then((data) => setBanners(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const displayBanners = banners.length > 0 ? banners : [
    {
      id: 0,
      title: 'PHONG CÁCH ĐỘC NHẤT',
      subtitle: 'Kể từ những năm 80',
      bigText: 'COFFEE ĐẶC BIỆT PHA CHẾ',
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1400&q=80',
      isDefault: true,
    },
    {
      id: 1,
      title: 'TINH TẾ TỪNG GIỌT',
      subtitle: 'Hương vị khó quên',
      bigText: 'TRÀ SỮA & NƯỚC ÉP TƯƠI',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=80',
      isDefault: true,
    },
  ];

  const getBannerImageUrl = (banner: any) => {
    if (banner.isDefault) return banner.image;
    const imagePath = banner.image;
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Nếu trong DB đã có sẵn đường dẫn 'uploads/banners/'
    if (imagePath.includes('uploads/banners/')) {
       const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
       return `/doan/${cleanPath}`;
    }
    
    // Nếu trong DB chỉ lưu tên file, tự động thêm thư mục banners
    return `/doan/uploads/banners/${imagePath}`;
  };

  if (loading) {
    return (
      <div style={{ width: '100%', height: '520px', backgroundColor: '#1a0f00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#c8a96e', fontSize: '18px' }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '520px', overflow: 'hidden', backgroundColor: '#1a0f00' }}>
      {/* Slides */}
      {displayBanners.map((banner: any, index) => (
        <div
          key={banner.id}
          style={{
           
            opacity: activeIndex === index ? 1 : 0,
            transition: 'opacity 0.9s ease-in-out',
            zIndex: activeIndex === index ? 1 : 0,
          }}
        >
          <img
            src={getBannerImageUrl(banner)}
            alt={banner.title}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,5,0,0.72) 50%, rgba(0,0,0,0.15) 100%)' }} />

          {/* Content */}
          <div style={{
            position: 'absolute', top: '50%', left: '8%',
            transform: activeIndex === index ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-30px)',
            color: '#fff', maxWidth: '520px',
            opacity: activeIndex === index ? 1 : 0,
            transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
          }}>
            <p style={{ color: '#c8a96e', fontSize: '17px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              {banner.subtitle || 'Kể từ những năm 80'}
            </p>
            <h2 style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1.15, margin: '0 0 12px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {banner.title}
            </h2>
            <h1 style={{
              fontSize: '36px', fontWeight: 900, color: '#c8a96e',
              fontStyle: 'italic', letterSpacing: '1px', margin: '0 0 28px',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}>
              {banner.bigText || 'COFFEE ĐẶC BIỆT PHA CHẾ'}
            </h1>
            <button
              style={{
                padding: '13px 32px', backgroundColor: '#c8a96e', color: '#1a0f00',
                border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 800,
                cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
                boxShadow: '0 4px 15px rgba(200,169,110,0.4)', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2be7f'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#c8a96e'; e.currentTarget.style.transform = ''; }}
            >
              Đặt Bàn Ngay
            </button>
          </div>
        </div>
      ))}

      {/* Prev/Next arrows */}
      <button
        onClick={() => setActiveIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length)}
        style={{
          position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', width: '42px', height: '42px', borderRadius: '50%',
          fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)', transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,169,110,0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
      >‹</button>
      <button
        onClick={() => setActiveIndex((prev) => (prev + 1) % displayBanners.length)}
        style={{
          position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', width: '42px', height: '42px', borderRadius: '50%',
          fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)', transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,169,110,0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
      >›</button>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
        {displayBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{
              width: activeIndex === i ? '28px' : '8px', height: '8px',
              borderRadius: '4px', border: 'none', padding: 0, cursor: 'pointer',
              backgroundColor: activeIndex === i ? '#c8a96e' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
