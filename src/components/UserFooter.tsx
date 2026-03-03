import React from 'react';
import { Link } from 'react-router-dom';

const GOLD = '#e7b557';
const LIGHT_TEXT = 'rgba(255,255,255,0.8)';

export default function UserFooter(): React.ReactElement {
  return (
    <footer style={{ 
      backgroundColor: '#2c1a08', 
      backgroundImage: 'url(//bizweb.dktcdn.net/100/351/580/themes/714586/assets/bg-header.jpg?1705464185330)',
      color: '#fff',
      padding: '50px 0 0 0',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <Link to="/">
            <img src="//bizweb.dktcdn.net/thumb/small/100/351/580/themes/714586/assets/logo.png?1705464185330" alt="halucafe" height="80" />
          </Link>
        </div>
        
        {/* 4 COLUMNS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '40px', 
          borderBottom: '1px solid rgba(200,169,110,0.2)', 
          paddingBottom: '30px' 
        }}>
          
          {/* Col 1: KẾT NỐI VỚI CHÚNG TÔI */}
          <div>
            <h4 style={{ color: GOLD, fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.5px' }}>
              Kết nối với chúng tôi
            </h4>
            <p style={{ color: LIGHT_TEXT, fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
              Chúng tôi mong muốn tạo nên hương vị thức uống tuyệt vời nhất. Là điểm đến đầu tiên dành cho bạn khi muốn thưởng thức trọn vẹn của tách Coffee
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: LIGHT_TEXT, fontSize: '16px', opacity: 0.7, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}><i className="fa fa-twitter"></i></a>
              <a href="#" style={{ color: LIGHT_TEXT, fontSize: '16px', opacity: 0.7, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}><i className="fa fa-facebook"></i></a>
              <a href="#" style={{ color: LIGHT_TEXT, fontSize: '16px', opacity: 0.7, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}><i className="fa fa-pinterest"></i></a>
              <a href="#" style={{ color: LIGHT_TEXT, fontSize: '16px', opacity: 0.7, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}><i className="fa fa-instagram"></i></a>
              <a href="#" style={{ color: LIGHT_TEXT, fontSize: '16px', opacity: 0.7, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}><i className="fa fa-youtube"></i></a>
            </div>
          </div>

          {/* Col 2: HỆ THỐNG CỬA HÀNG */}
          <div>
            <h4 style={{ color: GOLD, fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.5px' }}>
              Hệ thống cửa hàng
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: LIGHT_TEXT, fontSize: '13px', lineHeight: 1.8 }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: GOLD, marginTop: '2px', fontSize: '14px' }}>📍</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Coffe Doi Can</div>
                  <div>Địa chỉ: Ladeco Building, 266 Doi Can Street, Ba Dinh District, Ha Noi</div>
                  <div style={{ marginTop: '5px' }}>Hotline: <strong style={{color: '#fff', fontSize: '14px'}}>19006750</strong></div>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: CHÍNH SÁCH */}
          <div>
            <h4 style={{ color: GOLD, fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.5px' }}>
              Chính sách
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', lineHeight: '2.4' }}>
              <li><Link to="/" style={{ color: LIGHT_TEXT, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = GOLD} onMouseLeave={e => e.currentTarget.style.color = LIGHT_TEXT}>Trang chủ</Link></li>
              <li><Link to="/about" style={{ color: LIGHT_TEXT, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = GOLD} onMouseLeave={e => e.currentTarget.style.color = LIGHT_TEXT}>Giới thiệu</Link></li>
              <li><Link to="/products" style={{ color: LIGHT_TEXT, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = GOLD} onMouseLeave={e => e.currentTarget.style.color = LIGHT_TEXT}>Sản phẩm</Link></li>
              <li><Link to="/news" style={{ color: LIGHT_TEXT, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = GOLD} onMouseLeave={e => e.currentTarget.style.color = LIGHT_TEXT}>Tin tức</Link></li>
              <li><Link to="/contact" style={{ color: LIGHT_TEXT, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = GOLD} onMouseLeave={e => e.currentTarget.style.color = LIGHT_TEXT}>Liên hệ</Link></li>
            </ul>
          </div>

          {/* Col 4: LIÊN HỆ */}
          <div>
            <h4 style={{ color: GOLD, fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.5px' }}>
              Liên hệ
            </h4>
            <p style={{ color: LIGHT_TEXT, fontSize: '13px', lineHeight: 1.8, margin: 0 }}>
              Thứ 2 - Thứ 6: 6am - 9pm <br />
              Thứ Bảy - Chủ Nhật: 6am - 10pm <br />
              Mở cửa toàn bộ các ngày trong năm( Chỉ đóng cửa vào ngày lễ).
            </p>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '12px', color: LIGHT_TEXT }}>
           © Bản quyền thuộc về <span style={{color: '#fff'}}>halucafe</span> | Cung cấp bởi <strong>Sapo</strong>
        </div>
      </div>
    </footer>
  );
}
