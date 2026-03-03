import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfileAPI, fetchProfileAPI } from '../services/api';
import { useToast } from '../components/ToastContext';

const GOLD = '#c8a96e';
const DARK = '#3a2415';

export default function Profile(): React.ReactElement {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      
      const loadProfile = async () => {
        const result = await fetchProfileAPI(parsed.id);
        if (result.success) {
          // Cấu trúc: { success: true, data: { id: 1, name: ... } }
          const freshUser = result.data.data || result.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          setFormData({
            name: freshUser.name || freshUser.full_name || '',
            email: freshUser.email || '',
            phone: freshUser.phone || '',
            address: freshUser.address || '',
            avatar: freshUser.avatar || ''
          });
        } else {
          // Nếu API lỗi, dùng dữ liệu từ localStorage
          setUser(parsed);
          setFormData({
            name: parsed.name || parsed.full_name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            address: parsed.address || '',
            avatar: parsed.avatar || ''
          });
        }
      };

      loadProfile();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra định dạng ảnh cơ bản ở phía client
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Định dạng ảnh không hỗ trợ! Vui lòng chọn ảnh .jpg, .jpeg, .png hoặc .webp');
        e.target.value = ''; // Reset input
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Sử dụng FormData để gửi ảnh và dữ liệu
    const uploadData = new FormData();
    uploadData.append('id', user.id);
    uploadData.append('name', formData.name);
    uploadData.append('email', formData.email);
    uploadData.append('phone', formData.phone);
    uploadData.append('address', formData.address);
    if (selectedFile) {
      uploadData.append('avatar', selectedFile);
    }

    const result = await updateProfileAPI(uploadData);

    if (result.success) {
      // Cập nhật lại user trong state và localStorage
      // Kiểm tra nhiều trường hợp response có thể trả về: result.data.avatar hoặc result.data.user.avatar
      const newAvatar = result.data.avatar || (result.data.user && result.data.user.avatar) || user.avatar;
      
      const updatedUser = { 
        ...user, 
        ...formData, 
        full_name: formData.name, 
        avatar: newAvatar,
        address: formData.address 
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      setPreviewImage(null);
      setSelectedFile(null);
      showToast('Cập nhật thông tin thành công!', 'success');
    } else {
      showToast(result.error || 'Có lỗi xảy ra khi cập nhật', 'error');
    }
    setLoading(false);
  };

  if (!user) return <div style={{ padding: '100px', textAlign: 'center' }}>Đang tải...</div>;

  const currentAvatarUrl = previewImage || (user.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `/doan/${user.avatar}?t=${new Date().getTime()}`)
    : 'https://cdn-icons-png.flaticon.com/512/149/149071.png');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginTop: '5px',
    fontSize: '15px',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '80px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. COVER & AVATAR HEADER */}
      <div style={{ position: 'relative', height: '300px', marginBottom: '80px' }}>
        <div style={{ 
          height: '100%', 
          background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80') center/cover no-repeat`,
          borderBottom: `4px solid ${GOLD}`
        }}></div>

        <div style={{ 
          position: 'absolute', 
          bottom: '-60px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 2
        }}>
          <div 
            style={{ 
              position: 'relative',
              width: '140px', 
              height: '140px', 
              borderRadius: '50%', 
              border: '5px solid #fff', 
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              backgroundColor: '#fff',
              overflow: 'hidden',
              margin: '0 auto 15px',
              cursor: isEditing ? 'pointer' : 'default'
            }}
            onClick={() => isEditing && fileInputRef.current?.click()}
          >
            <img 
              src={currentAvatarUrl} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            {isEditing && (
              <div style={{ 
                position: 'absolute', bottom: 0, left: 0, right: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', 
                padding: '4px 0', fontSize: '11px', fontWeight: 600 
              }}>
                Thay đổi ảnh
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
            />
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: DARK }}>{user.name || user.full_name || user.username}</h1>
          <div style={{ 
            display: 'inline-block', 
            padding: '4px 12px', 
            backgroundColor: GOLD, 
            color: '#fff', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: 700,
            textTransform: 'uppercase',
            marginTop: '8px'
          }}>
            {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
          </div>
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', color: DARK, marginBottom: '20px', fontWeight: 700 }}>Tổng quan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Trạng thái:</span>
                <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>● {user.status || 'Active'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Ngày gia nhập:</span>
                <span style={{ color: DARK, fontSize: '14px', fontWeight: 600 }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Đơn hàng đã đặt:</span>
                <span style={{ color: GOLD, fontSize: '14px', fontWeight: 700 }}>0</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
               onClick={() => showToast('Chức năng đang phát triển', 'info')}
               style={{ padding: '12px', border: 'none', background: 'none', textAlign: 'left', fontSize: '14px', borderRadius: '8px', cursor: 'pointer', color: DARK, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span>⚙️</span> Cài đặt tài khoản
            </button>
            <button 
               onClick={() => showToast('Chức năng đang phát triển', 'info')}
               style={{ padding: '12px', border: 'none', background: 'none', textAlign: 'left', fontSize: '14px', borderRadius: '8px', cursor: 'pointer', color: DARK, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span>🛍️</span> Lịch sử mua hàng
            </button>
            <button 
               onClick={handleLogout}
               style={{ padding: '12px', border: 'none', background: 'none', textAlign: 'left', fontSize: '14px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span>🚪</span> Đăng xuất
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>
              <h2 style={{ fontSize: '20px', color: DARK, margin: 0, fontWeight: 700 }}>Thông tin chi tiết</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{ backgroundColor: 'transparent', border: '1px solid ' + GOLD, color: GOLD, padding: '6px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    style={{ backgroundColor: GOLD, border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu lại'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewImage(null);
                      setSelectedFile(null);
                    }}
                    style={{ backgroundColor: '#eee', border: 'none', color: '#666', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Họ và tên</label>
                {isEditing ? (
                  <input 
                    style={inputStyle}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <div style={{ color: DARK, fontSize: '16px', fontWeight: 500 }}>{user.full_name || user.name}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Địa chỉ Email</label>
                {isEditing ? (
                  <input 
                    style={inputStyle}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                ) : (
                  <div style={{ color: DARK, fontSize: '16px', fontWeight: 500 }}>{user.email || '—'}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Số điện thoại</label>
                {isEditing ? (
                  <input 
                    style={inputStyle}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                ) : (
                  <div style={{ color: DARK, fontSize: '16px', fontWeight: 500 }}>{user.phone || '—'}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Vai trò</label>
                <div style={{ color: DARK, fontSize: '16px', fontWeight: 500, textTransform: 'capitalize' }}>{user.role || 'Người dùng'}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Địa chỉ giao hàng</label>
                {isEditing ? (
                  <input 
                    style={inputStyle}
                    value={formData.address}
                    placeholder="Nhập địa chỉ giao hàng của bạn"
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                ) : (
                  <div style={{ color: DARK, fontSize: '16px', fontWeight: 500 }}>{user.address || '—'}</div>
                )}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Lần đăng nhập cuối</label>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleString('vi-VN') : 'Mới đây'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', color: DARK, marginBottom: '15px', fontWeight: 700 }}>Giới thiệu bản thân</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              "Yêu cà phê và những trải nghiệm tuyệt vời tại Halu Cafe. Luôn tìm kiếm những hương vị mới mẻ và độc đáo."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
