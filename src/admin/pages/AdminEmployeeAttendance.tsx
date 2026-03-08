import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, PageHeader, Toolbar, Button, Badge } from '../components/ui';
import { fetchEmployeeHistory } from '../../services/attendanceService';
import { useToast } from '../../components/ToastContext';

export default function AdminEmployeeAttendance(): React.ReactElement {
  const { employeeCode } = useParams<{ employeeCode: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    if (!employeeCode) return;
    setLoading(true);
    try {
      const data = await fetchEmployeeHistory(employeeCode, startDate, endDate);
      setHistory(data);
    } catch (err: any) {
      showToast('Lỗi tải lịch sử chấm công', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeCode, startDate, endDate]);

  const setThisWeek = () => {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7)); // Sunday
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  const setThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  const exportToExcel = () => {
    if (history.length === 0) {
      showToast('Không có dữ liệu để xuất', 'warning');
      return;
    }

    // Prepare CSV data
    const headers = ['Ngày', 'Giờ vào', 'Giờ ra', 'Số giờ làm', 'Trạng thái', 'Tiền lương (VNĐ)'];
    const rows = history.map(item => [
      new Date(item.date).toLocaleDateString('vi-VN'),
      item.check_in ? new Date(item.check_in).toLocaleTimeString('vi-VN') : '--:--',
      item.check_out ? new Date(item.check_out).toLocaleTimeString('vi-VN') : '--:--',
      item.total_hours + 'h',
      item.status === 'late' ? 'Đi muộn' : 'Đúng giờ',
      item.daily_wage
    ]);

    let csvContent = "\uFEFF"; // BOM for UTF-8 (essential for Excel)
    csvContent += headers.join(',') + "\n";
    rows.forEach(row => {
      csvContent += row.join(',') + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ChamCong_${employeeCode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalWage = history.reduce((sum, item) => sum + (Number(item.daily_wage) || 0), 0);
  const totalHours = history.reduce((sum, item) => sum + (Number(item.total_hours) || 0), 0);

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader 
          title={`Chi tiết công & lương: ${employeeCode}`}
          subtitle="Xem lịch sử chấm công và xuất báo cáo Excel cho nhân viên này."
          right={
            <Button variant="ghost" onClick={() => navigate('/admin/users')}>
               ← Quay lại danh sách
            </Button>
          }
        />
      </div>

      <div className="adminCol12">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <Card>
            <div style={{ padding: '20px' }}>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Tổng số giờ làm {(startDate || endDate) ? '(Theo lọc)' : '(Gần đây)'}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{totalHours.toFixed(1)}h</div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '20px' }}>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Tổng tiền lương {(startDate || endDate) ? '(Theo lọc)' : '(Gần đây)'}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalWage)}
              </div>
            </div>
          </Card>
        </div>

        <Card style={{ marginBottom: '20px' }}>
          <div style={{ padding: '15px 20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" onClick={setThisWeek} size="sm">📅 Tuần này</Button>
              <Button variant="ghost" onClick={setThisMonth} size="sm">📊 Tháng này</Button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Từ:</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Đến:</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
            </div>

            {(startDate || endDate) && (
              <Button variant="ghost" onClick={() => { setStartDate(''); setEndDate(''); }} size="sm" style={{ color: '#ef4444' }}>
                ✕ Xóa lọc
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <Toolbar 
            left={<div style={{ fontWeight: 900, color: '#0f172a' }}>Lịch sử chấm công {(startDate || endDate) ? '(Đã lọc)' : ''}</div>}
            right={
              <Button variant="primary" onClick={exportToExcel} disabled={history.length === 0}>
                📥 Xuất file Excel (CSV)
              </Button>
            }
          />

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              Chưa có dữ liệu chấm công cho nhân viên này.
            </div>
          ) : (
            <table className="aTable">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Giờ vào</th>
                  <th>Giờ ra</th>
                  <th style={{ textAlign: 'center' }}>Số giờ</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Tiền lương</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                    <td>{item.check_in ? new Date(item.check_in).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '--:--'}</td>
                    <td>{item.check_out ? new Date(item.check_out).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '--:--'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.total_hours}h</td>
                    <td>
                      <Badge tone={item.status === 'late' ? 'red' : 'green'}>
                        {item.status === 'late' ? 'Đi muộn' : 'Đúng giờ'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.daily_wage || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
