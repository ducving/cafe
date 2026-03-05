import React, { useEffect, useState } from 'react';
import { fetchTodayAttendance, checkInApi, checkOutApi, AttendanceData } from '../services/attendanceService';
import { useToast } from '../components/ToastContext';

export default function AttendanceStandalone(): React.ReactElement {
  const [employeeCode, setEmployeeCode] = useState('');
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = async () => {
    if (!employeeCode.trim()) {
      showToast('Vui lòng nhập mã nhân viên', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchTodayAttendance(employeeCode);
      setAttendance(data);
      if (!data) {
          showToast('Không tìm thấy thông tin công hôm nay cho mã này', 'info');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!employeeCode.trim()) {
        showToast('Vui lòng nhập mã nhân viên', 'error');
        return;
    }
    try {
      const result = await checkInApi(employeeCode);
      if (result.success) {
        showToast(result.message, 'success');
        handleSearch(); // Refresh status
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCheckOut = async () => {
    if (!employeeCode.trim()) {
        showToast('Vui lòng nhập mã nhân viên', 'error');
        return;
    }
    try {
      const result = await checkOutApi(employeeCode);
      if (result.success) {
        showToast(result.message, 'success');
        handleSearch(); // Refresh status
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleBackToSite = () => {
    window.location.href = '/';
  };

  // Standalone Styles
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    margin: 0,
    padding: 0,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '32px',
    padding: '40px',
    width: '90%',
    maxWidth: '440px',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontSize: '1.2rem',
    textAlign: 'center',
    marginBottom: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const btnBase: React.CSSProperties = {
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%'
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>Chấm Công</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Coffee House Management</div>
          </div>
          <button onClick={handleBackToSite} style={{ background: 'none', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Về trang chủ</button>
        </div>

        <div style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '10px' }}>{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '30px' }}>{currentTime.toLocaleTimeString('vi-VN')}</div>

        <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '10px', fontSize: '0.9rem', textAlign: 'left' }}>Mã nhân viên</label>
            <input 
                type="text" 
                placeholder="VD: NV001" 
                style={inputStyle}
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
                onClick={handleSearch}
                style={{ ...btnBase, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.95rem', padding: '12px' }}
            >
                {loading ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}
            </button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <button 
            onClick={handleCheckIn}
            disabled={!!attendance?.check_in}
            style={{
              ...btnBase,
              backgroundColor: '#10b981',
              color: '#fff',
              opacity: attendance?.check_in ? 0.3 : 1,
              cursor: attendance?.check_in ? 'not-allowed' : 'pointer'
            }}
          >
            {attendance?.check_in ? `Đã vào lúc ${new Date(attendance.check_in).toLocaleTimeString('vi-VN')}` : 'Bắt đầu làm việc (In)'}
          </button>

          <button 
            onClick={handleCheckOut}
            disabled={!attendance?.check_in || !!attendance?.check_out}
            style={{
              ...btnBase,
              backgroundColor: '#3b82f6',
              color: '#fff',
              opacity: (!attendance?.check_in || attendance?.check_out) ? 0.3 : 1,
              cursor: (!attendance?.check_in || attendance?.check_out) ? 'not-allowed' : 'pointer'
            }}
          >
            {attendance?.check_out ? `Đã ra lúc ${new Date(attendance.check_out).toLocaleTimeString('vi-VN')}` : 'Kết thúc làm việc (Out)'}
          </button>
        </div>

        <div style={{ marginTop: '30px', fontSize: '0.8rem', color: '#64748b' }}>
            Mã nhân viên mang tính bảo mật, vui lòng không chia sẻ.
        </div>
      </div>
    </div>
  );
}
