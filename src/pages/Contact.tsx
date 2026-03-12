import React, { useState } from 'react';

const GOLD = '#c8a96e';
const DARK = '#3a2415';

export default function Contact(): React.ReactElement {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/doan/api/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công trực tiếp đến shop.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Có lỗi: ' + data.message);
      }
    } catch (err) {
      console.error('Lỗi khi gửi liên hệ:', err);
      alert('Không thể gửi tin nhắn lúc này. Vui lòng thử lại sau.');
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      
      {/* 1. HERO / HEADER SECTION */}
      <div style={{ 
        backgroundColor: '#f5f0ea', 
        padding: '60px 20px', 
        textAlign: 'center',
        borderBottom: '1px solid #ebebeb'
      }}>
        <h1 style={{ fontSize: '36px', color: DARK, margin: '0 0 10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Liên hệ với chúng tôi</h1>
        <div style={{ width: '60px', height: '3px', backgroundColor: GOLD, margin: '0 auto 15px' }}></div>
        <p style={{ color: '#666', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp và phản hồi từ bạn.</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '50px' }}>
          
          {/* 2. CONTACT INFO */}
          <div>
            <h2 style={{ fontSize: '24px', color: DARK, marginBottom: '30px', fontWeight: 700 }}>Thông tin cửa hàng</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '24px', color: GOLD }}>📍</div>
                <div>
                  <h4 style={{ margin: '0 0 5px', color: DARK, fontSize: '16px', fontWeight: 700 }}>Địa chỉ:</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: 1.5 }}>123 Đường Tố Hữu, Quận Nam Từ Liêm, Hà Nội, Việt Nam</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '24px', color: GOLD }}>📞</div>
                <div>
                  <h4 style={{ margin: '0 0 5px', color: DARK, fontSize: '16px', fontWeight: 700 }}>Điện thoại:</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>0123 456 789</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '24px', color: GOLD }}>✉️</div>
                <div>
                  <h4 style={{ margin: '0 0 5px', color: DARK, fontSize: '16px', fontWeight: 700 }}>Email:</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>ducvinh190204@gmail.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '24px', color: GOLD }}>⏰</div>
                <div>
                  <h4 style={{ margin: '0 0 5px', color: DARK, fontSize: '16px', fontWeight: 700 }}>Giờ mở cửa:</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Thứ 2 - Chủ Nhật: 07:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div style={{ marginTop: '40px' }}>
              <h4 style={{ marginBottom: '15px', color: DARK, fontSize: '16px', fontWeight: 700 }}>Theo dõi chúng tôi:</h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                {['FB', 'IG', 'YT', 'TT'].map(social => (
                  <div key={social} style={{ 
                    width: '35px', height: '35px', borderRadius: '50%', backgroundColor: DARK, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = GOLD}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DARK}
                  >
                    {social}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. CONTACT FORM */}
          <div style={{ backgroundColor: '#fdfcfb', padding: '40px', borderRadius: '8px', border: '1px solid #f1f1f1' }}>
            <h2 style={{ fontSize: '24px', color: DARK, marginBottom: '30px', fontWeight: 700 }}>Gửi tin nhắn cho chúng tôi</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: '#555', fontWeight: 600 }}>Họ và tên *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: '#555', fontWeight: 600 }}>Email *</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: '#555', fontWeight: 600 }}>Tiêu đề</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: '#555', fontWeight: 600 }}>Nội dung *</label>
                <textarea 
                  required
                  rows={5} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', resize: 'vertical' }} 
                />
              </div>
              <button 
                type="submit"
                style={{ 
                  backgroundColor: DARK, color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', 
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.3s', marginTop: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = GOLD}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DARK}
              >
                GỬI TIN NHẮN
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 4. GOOGLE MAPS SECTION */}
      <div style={{ height: '450px', width: '100%', marginBottom: '-5px' }}>
        <iframe 
          title="Halu Cafe Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.7300321829566!2d105.74699125004186!3d21.043485437443987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454ec65104087%3A0x7434dbb1b5b9d6e7!2zMzQgUC4gUGjDuiBLaeG7gXUsIEtp4buBdSBNYWksIELhuq9jIFThu6sgTGnDqm0sIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2sus!4v1772509121598!5m2!1svi!2sus" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={true}
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
