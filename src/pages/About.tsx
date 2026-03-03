import React from 'react';
import { useNavigate } from 'react-router-dom';

const GOLD = '#c8a96e';
const DARK = '#3a2415';

export default function About(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#fff', fontFamily: "'Segoe UI', Roboto, sans-serif", color: '#333' }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ 
        height: '400px', 
        position: 'relative', 
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <div>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 800 }}>Giới Thiệu</h1>
          <div style={{ width: '80px', height: '4px', backgroundColor: GOLD, margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>Hành trình mang hương vị cà phê nguyên chất đến với trái tim khách hàng</p>
        </div>
      </div>

      {/* 2. STORY SECTION */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: GOLD, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '2px' }}>Câu chuyện của chúng tôi</h2>
            <h3 style={{ fontSize: '32px', color: DARK, marginBottom: '25px', lineHeight: 1.2 }}>Khơi nguồn cảm hứng từ những hạt cà phê tinh túy nhất</h3>
            <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '20px', fontSize: '15px' }}>
              Được thành lập từ năm 2010, <strong>Coffee House</strong> không chỉ đơn thuần là một quán cà phê. Chúng tôi là nơi hội tụ của những tâm hồn đồng điệu, yêu thích sự mộc mạc và hương vị say đắm của hạt cà phê Tây Nguyên.
            </p>
            <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '20px', fontSize: '15px' }}>
              Trải qua hơn một thập kỷ, chúng tôi vẫn giữ vững lời hứa ban đầu: Chỉ sử dụng những hạt cà phê được tuyển chọn kỹ lưỡng, rang xay theo phương pháp thủ công để lưu giữ trọn vẹn hương vị đặc trưng. Mỗi tách cà phê phục vụ quý khách là cả một quá trình tâm huyết từ nông trại đến ly tách.
            </p>
            <button 
              onClick={() => navigate('/products')}
              style={{
                backgroundColor: DARK,
                color: '#fff',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginTop: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = GOLD}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DARK}
            >
              KHÁM PHÁ MENU
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <img 
              src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Coffee preparation" 
              style={{ width: '100%', borderRadius: '8px', boxShadow: '20px 20px 0px ' + GOLD }}
            />
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES SECTION */}
      <section style={{ backgroundColor: '#fcfaf7', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ color: GOLD, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>Giá trị cốt lõi</h2>
            <h3 style={{ fontSize: '32px', color: DARK }}>Điều làm nên sự khác biệt</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {[
              { title: 'Chất lượng hàng đầu', desc: '100% hạt cà phê mộc, không pha trộn tạp chất hay hương liệu hóa học.', icon: '☕' },
              { title: 'Tận tâm phục vụ', desc: 'Đội ngũ barista giàu kinh nghiệm, luôn lắng nghe và chăm chút từng khẩu vị.', icon: '🤝' },
              { title: 'Không gian ấm cúng', desc: 'Thiết kế tinh tế mang lại cảm giác thư giãn, phù hợp để làm việc và gặp gỡ.', icon: '🏠' },
              { title: 'Phát triển bền vững', desc: 'Liên kết trực tiếp với nông dân, đảm bảo giá trị công bằng và bảo vệ môi trường.', icon: '🌱' }
            ].map((item, index) => (
              <div key={index} style={{ 
                backgroundColor: '#fff', 
                padding: '40px 30px', 
                borderRadius: '8px', 
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '18px', color: DARK, marginBottom: '15px', fontWeight: 700 }}>{item.title}</h4>
                <p style={{ color: '#777', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TEAM SECTION (Optional but nice) */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'center' }}>
           <div style={{ order: 2 }}>
            <h2 style={{ color: GOLD, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '15px' }}>Nghệ nhân nếm vị</h2>
            <h3 style={{ fontSize: '32px', color: DARK, marginBottom: '25px' }}>Đam mê trong từng giọt đắng</h3>
            <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '20px' }}>
              Đội ngũ của chúng tôi không chỉ là những nhân viên pha chế, họ là những nghệ nhân. Với kiến thức chuyên sâu về đặc tính của từng loại hạt cà phê, họ biết cách để đánh thức mọi giác quan của bạn.
            </p>
            <div style={{ display: 'flex', gap: '40px', marginTop: '30px' }}>
              <div>
                <div style={{ fontSize: '30px', color: GOLD, fontWeight: 800 }}>12+</div>
                <div style={{ fontSize: '13px', color: '#999', textTransform: 'uppercase' }}>Năm kinh nghiệm</div>
              </div>
              <div>
                <div style={{ fontSize: '30px', color: GOLD, fontWeight: 800 }}>50+</div>
                <div style={{ fontSize: '13px', color: '#999', textTransform: 'uppercase' }}>Công thức độc quyền</div>
              </div>
              <div>
                <div style={{ fontSize: '30px', color: GOLD, fontWeight: 800 }}>100k+</div>
                <div style={{ fontSize: '13px', color: '#999', textTransform: 'uppercase' }}>Khách hàng tin yêu</div>
              </div>
            </div>
          </div>
          <div style={{ order: 1 }}>
            <img 
              src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Barista working" 
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section style={{ 
        backgroundColor: DARK, 
        padding: '60px 20px', 
        textAlign: 'center',
        color: '#fff'
      }}>
        <h3 style={{ fontSize: '28px', marginBottom: '15px' }}>Bạn đã sẵn sàng thưởng thức chưa?</h3>
        <p style={{ opacity: 0.8, marginBottom: '30px' }}>Ghé thăm chúng tôi ngay hôm nay để trải nghiệm không gian và hương vị tuyệt vời nhất.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/products')}
            style={{ 
              backgroundColor: GOLD, 
              color: DARK, 
              border: 'none', 
              padding: '12px 35px', 
              borderRadius: '4px', 
              fontWeight: 700, 
              cursor: 'pointer' 
            }}
          >
            ĐẶT HÀNG NGAY
          </button>
          <button 
            onClick={() => navigate('/contact')}
            style={{ 
              backgroundColor: 'transparent', 
              color: '#fff', 
              border: '1px solid #fff', 
              padding: '12px 35px', 
              borderRadius: '4px', 
              fontWeight: 700, 
              cursor: 'pointer' 
            }}
          >
            LIÊN HỆ
          </button>
        </div>
      </section>
    </div>
  );
}
