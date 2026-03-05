import React, { useEffect, useState } from 'react';
import { Card, PageHeader, Toolbar, Input, Badge } from '../components/ui';
import { fetchAllAttendance } from '../../services/attendanceService';
import { useToast } from '../../components/ToastContext';

export default function AdminAttendance(): React.ReactElement {
  const { showToast } = useToast();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAttendance(date);
      setAttendance(data);
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải dữ liệu chấm công', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [date]);

  const totalDailyWage = attendance.reduce((sum, item) => sum + (item.daily_wage || 0), 0);

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader 
          title="Quản lý Chấm công" 
          subtitle="Theo dõi giờ làm việc và tiền lương tạm tính của toàn bộ nhân viên."
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Chọn ngày:</span>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                style={{ width: '200px' }}
              />
            </div>
          }
        />
      </div>

      <div className="adminCol12">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <Card>
            <div style={{ padding: '20px' }}>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Tổng nhân viên đi làm</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{attendance.length}</div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '20px' }}>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Tổng chi lương trong ngày</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalDailyWage)}
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <Toolbar 
            left={<div style={{ fontWeight: 900, color: '#0f172a' }}>Chi tiết chấm công ngày {new Date(date).toLocaleDateString('vi-VN')}</div>}
          />
          
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
          ) : attendance.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              Không có dữ liệu chấm công cho ngày này.
            </div>
          ) : (
            <table className="aTable">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Giờ vào</th>
                  <th>Giờ ra</th>
                  <th style={{ textAlign: 'center' }}>Số giờ</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Tiền lương tạm tính</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.full_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Mã: {item.employee_code}</div>
                    </td>
                    <td>{item.check_in ? new Date(item.check_in).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '--:--'}</td>
                    <td>{item.check_out ? new Date(item.check_out).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '--:--'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.total_hours || 0}h</td>
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
