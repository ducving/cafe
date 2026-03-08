import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfileAPI, fetchProfileAPI } from '../services/api';
import { fetchPaymentsHistory } from '../services/paymentsService';
import { fetchPoints, PointsData } from '../services/pointsService';
import { useToast } from '../components/ToastContext';
import { Button } from '../admin/components/ui';

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
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'points'>('profile');
  const [pointsData, setPointsData] = useState<PointsData | null>(null);

  const loadProfile = async (userId: any) => {
    try {
      const result = await fetchProfileAPI(userId);
      if (result.success) {
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
      }
    } catch (err) {
      console.error('Lỗi tải profile:', err);
    }
  };

  const loadOrderHistory = async () => {
    if (orders.length > 0) return;
    
    setLoadingOrders(true);
    try {
      const res = await fetchPaymentsHistory();
      console.log('Phản hồi từ API Payments:', res);
      
      if (res.success) {
        const data = res.data || (res as any).payments || (res as any).orders || [];
        setOrders(Array.isArray(data) ? data : []);
      } else if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch (err: any) {
      console.error('Lỗi tải lịch sử đơn hàng:', err);
      showToast('Không thể tải lịch sử đơn hàng', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed); // Dùng tạm dữ liệu cũ
      setFormData({
        name: parsed.name || parsed.full_name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        address: parsed.address || '',
        avatar: parsed.avatar || ''
      });
      loadProfile(parsed.id); // Gọi API cập nhật
      // Load điểm tích lũy
      fetchPoints().then(res => { if (res.success) setPointsData(res); }).catch(() => {});
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'processing': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn tất';
      case 'processing': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return 'Chờ xử lý';
    }
  };

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
                <span style={{ color: GOLD, fontSize: '14px', fontWeight: 700 }}>{orders.length}</span>
              </div>
            </div>
          </div>

          {/* ĐIỂM TÍCH LŨY CARD */}
          {pointsData && (
            <div style={{
              background: `linear-gradient(135deg, #3a2415 0%, #6b3e1e 100%)`,
              padding: '22px', borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(58,36,21,0.25)', color: '#fff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.85 }}>Điểm tích lũy</span>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                  fontWeight: 700, backgroundColor: pointsData.rank.color, color: '#3a2415'
                }}>
                  {pointsData.rank.name === 'Kim cương' ? '💎' :
                   pointsData.rank.name === 'Vàng' ? '🥇' :
                   pointsData.rank.name === 'Bạc' ? '🥈' : '🥉'} {pointsData.rank.name}
                </span>
              </div>
              <div style={{ fontSize: '40px', fontWeight: 900, color: GOLD, lineHeight: 1, marginBottom: '12px' }}>
                {pointsData.points.toLocaleString('vi-VN')}
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff9', marginLeft: '6px' }}>điểm</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: GOLD }}>{pointsData.total_earned}</div>
                  <div style={{ fontSize: '11px', color: '#fff8' }}>Đã kiếm</div>
                </div>
                <div style={{ width: '1px', backgroundColor: '#fff2' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fca5a5' }}>{pointsData.total_spent}</div>
                  <div style={{ fontSize: '11px', color: '#fff8' }}>Đã dùng</div>
                </div>
                <div style={{ width: '1px', backgroundColor: '#fff2' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#fff8', marginTop: '4px' }}>1 điểm</div>
                  <div style={{ fontSize: '11px', color: '#fff8' }}>= 1.000đ</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['profile', 'points'] as const).map((tab) => {
              const labels: Record<string, string> = { profile: '⚙️ Cài đặt tài khoản', points: '⭐ Điểm thưởng' };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px', border: 'none',
                    background: activeTab === tab ? '#f5f0ea' : 'none',
                    textAlign: 'left', fontSize: '14px', borderRadius: '8px', cursor: 'pointer',
                    color: activeTab === tab ? GOLD : DARK, fontWeight: activeTab === tab ? 700 : 500,
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px'
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
            <button
               onClick={() => navigate('/order-history')}
               style={{
                 padding: '12px', border: 'none', background: 'none',
                 textAlign: 'left', fontSize: '14px', borderRadius: '8px', cursor: 'pointer',
                 color: DARK, fontWeight: 500,
                 transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px'
               }}
               onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f0ea'}
               onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
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
          {activeTab === 'profile' ? (
            <>
              <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                {/* Profile Form (Existing) */}
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
            </>
          ) : activeTab === 'points' ? (
            <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '20px', color: DARK, marginBottom: '8px', fontWeight: 700 }}>Điểm thưởng & Lịch sử</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '28px' }}>10.000đ chi tiêu = 1 điểm · 1 điểm = 1.000đ giảm giá</p>

              {pointsData ? (
                <>
                  {/* Rank Progress */}
                  {(() => {
                    const ranks = [
                      { name: 'Đồng', emoji: '🥉', color: '#cd7f32', min: 0, next: 100 },
                      { name: 'Bạc', emoji: '🥈', color: '#94a3b8', min: 100, next: 500 },
                      { name: 'Vàng', emoji: '🥇', color: '#fbbf24', min: 500, next: 1000 },
                      { name: 'Kim cương', emoji: '💎', color: '#a5f3fc', min: 1000, next: null },
                    ];
                    const total = pointsData.total_earned;
                    const currentRankIdx = ranks.findIndex((r, i) => {
                      const nextRank = ranks[i + 1];
                      return total >= r.min && (!nextRank || total < nextRank.min);
                    });
                    const currentRk = ranks[Math.max(0, currentRankIdx)];
                    const nextRk = ranks[currentRankIdx + 1];
                    const progress = nextRk ? Math.min(100, ((total - currentRk.min) / (nextRk.min - currentRk.min)) * 100) : 100;
                    return (
                      <div style={{ marginBottom: '28px', padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, #3a2415, #6b3e1e)', color: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '13px', opacity: 0.75, marginBottom: '4px' }}>Hạng hiện tại</div>
                            <div style={{ fontSize: '22px', fontWeight: 900 }}>{currentRk.emoji} {currentRk.name}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', opacity: 0.75, marginBottom: '4px' }}>Tổng điểm tích lũy</div>
                            <div style={{ fontSize: '28px', fontWeight: 900, color: GOLD }}>{pointsData.total_earned.toLocaleString('vi-VN')}</div>
                          </div>
                        </div>
                        {nextRk && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.7, marginBottom: '6px' }}>
                              <span>{currentRk.name}</span>
                              <span>{nextRk.emoji} {nextRk.name} ({nextRk.min} điểm)</span>
                            </div>
                            <div style={{ height: '8px', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${progress}%`, borderRadius: '99px', background: `linear-gradient(90deg, ${GOLD}, #f5d49a)`, transition: 'width 0.8s ease' }} />
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '8px', textAlign: 'center' }}>
                              Còn {nextRk.min - total} điểm nữa để lên hạng {nextRk.name}
                            </div>
                          </>
                        )}
                        {!nextRk && (
                          <div style={{ textAlign: 'center', fontSize: '13px', color: '#a5f3fc', fontWeight: 700, marginTop: '8px' }}>🎉 Bạn đang ở hạng cao nhất!</div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                    {[
                      { label: 'Điểm hiện có', value: pointsData.points, unit: 'điểm', color: GOLD, bg: '#fffbf0' },
                      { label: 'Tổng đã kiếm', value: pointsData.total_earned, unit: 'điểm', color: '#22c55e', bg: '#f0fdf4' },
                      { label: 'Đã sử dụng', value: pointsData.total_spent, unit: 'điểm', color: '#ef4444', bg: '#fef2f2' },
                    ].map(stat => (
                      <div key={stat.label} style={{ padding: '16px', borderRadius: '12px', backgroundColor: stat.bg, textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: stat.color }}>{stat.value.toLocaleString('vi-VN')}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Transaction History */}
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: DARK, marginBottom: '16px' }}>Lịch sử giao dịch</h3>
                  {pointsData.history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>⭐</div>
                      <div style={{ fontWeight: 600 }}>Chưa có giao dịch nào</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pointsData.history.map((tx) => {
                        const isEarn = tx.type === 'earn';
                        const isRedeem = tx.type === 'redeem';
                        const txColor = isEarn ? '#22c55e' : isRedeem ? '#ef4444' : '#f59e0b';
                        const txBg = isEarn ? '#f0fdf4' : isRedeem ? '#fef2f2' : '#fffbeb';
                        const txIcon = isEarn ? '⬆️' : isRedeem ? '⬇️' : '🔄';
                        const txLabel = isEarn ? 'Cộng điểm' : isRedeem ? 'Dùng điểm' : 'Hoàn điểm';
                        return (
                          <div key={tx.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '14px 16px', borderRadius: '12px', backgroundColor: '#fafafa',
                            border: '1px solid #f0f0f0', transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f5f0'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: txBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                {txIcon}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: DARK }}>{tx.note || txLabel}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                  {new Date(tx.created_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 600, color: txColor, backgroundColor: txBg, padding: '2px 7px', borderRadius: '6px' }}>{txLabel}</span>
                                </div>
                              </div>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: txColor }}>
                              {isEarn || tx.type === 'refund' ? '+' : '-'}{Math.abs(tx.points).toLocaleString('vi-VN')} điểm
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <div className="spinner" style={{ margin: '0 auto 15px' }} />
                  <div>Đang tải dữ liệu điểm...</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '20px', color: DARK, marginBottom: '30px', fontWeight: 700, borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>Lịch sử mua hàng</h2>
              
              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                   <div className="spinner" style={{ margin: '0 auto 15px' }}></div>
                   <p style={{ fontWeight: 600 }}>Đang tải lịch sử đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>📦</div>
                  <h3 style={{ color: DARK, fontSize: '18px', marginBottom: '10px', fontWeight: 700 }}>Chưa có giao dịch nào</h3>
                  <p style={{ color: '#888', marginBottom: '25px', fontSize: '14px' }}>Hãy chọn cho mình những món đồ uống tuyệt vời nhất từ thực đơn của chúng tôi.</p>
                  <Button variant="primary" onClick={() => navigate('/shop')} style={{ fontWeight: 700, padding: '12px 30px' }}>KHÁM PHÁ MENU</Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {orders.map((order) => {
                    const priceNominal = Number(order.total_amount || 0);
                    return (
                      <div 
                        key={order.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '20px', 
                          borderRadius: '16px', 
                          backgroundColor: '#fff',
                          border: '1px solid #f0f0f0',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)';
                          e.currentTarget.style.borderColor = GOLD + '40';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#f0f0f0';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            backgroundColor: GOLD + '15', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: GOLD
                          }}>
                            <span style={{ fontSize: '20px' }}>☕</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: DARK, fontSize: '15px', marginBottom: '4px' }}>Đơn hàng #{order.id}</div>
                            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
                              {new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: GOLD }}>
                              {new Intl.NumberFormat('vi-VN').format(Number(order.total_amount || order.amount || 0))}₫
                            </div>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              textTransform: 'uppercase',
                              color: getStatusColor(order.status),
                              backgroundColor: getStatusColor(order.status) + '15',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              marginTop: '5px',
                              display: 'inline-block'
                            }}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div style={{ color: '#cbd5e1' }}>
                            <span style={{ fontSize: '18px' }}>›</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
