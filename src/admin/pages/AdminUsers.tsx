import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Input, Modal, PageHeader, Select, Toolbar } from '../components/ui';
import { fetchEmployees, createEmployeeApi, updateEmployeeApi, deleteEmployeeApi, EmployeeApi } from '../../services/usersService';
import { fetchEmployeeHistory, fetchAllAttendance } from '../../services/attendanceService';
import { useToast } from '../../components/ToastContext';

export default function AdminUsers(): React.ReactElement {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeApi[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [editModal, setEditModal] = useState<{ open: boolean; employee: EmployeeApi | null }>({ open: false, employee: null });
  const [createModal, setCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<EmployeeApi>>({ 
    employee_code: '', 
    full_name: '', 
    email: '', 
    phone: '', 
    position: '', 
    department: '',
    salary: 0,
    hourly_rate: 0,
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active' 
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [empList, attList] = await Promise.all([
        fetchEmployees(),
        fetchAllAttendance(today)
      ]);
      setEmployees(Array.isArray(empList) ? empList : []);
      setAttendanceData(Array.isArray(attList) ? attList : []);
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e => 
      (e.full_name?.toLowerCase().includes(q)) || 
      (e.employee_code?.toLowerCase().includes(q)) || 
      (e.email?.toLowerCase().includes(q)) ||
      (e.position?.toLowerCase().includes(q)) ||
      (e.department?.toLowerCase().includes(q))
    );
  }, [employees, query]);

  const handleCreate = async () => {
    if (!formData.employee_code || !formData.full_name) {
      showToast('Vui lòng nhập Mã NV và Họ tên', 'warning');
      return;
    }
    setSaving(true);
    try {
      await createEmployeeApi(formData);
      showToast('Thêm nhân viên thành công', 'success');
      setCreateModal(false);
      setFormData({ employee_code: '', full_name: '', email: '', phone: '', position: '', department: '', salary: 0, hourly_rate: 0, hire_date: new Date().toISOString().split('T')[0], status: 'active' });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Thêm nhân viên thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editModal.employee) return;
    setSaving(true);
    try {
      await updateEmployeeApi(editModal.employee.id, editModal.employee);
      showToast('Cập nhật nhân viên thành công', 'success');
      setEditModal({ open: false, employee: null });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Cập nhật thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm.id) return;
    try {
      await deleteEmployeeApi(confirm.id);
      showToast('Đã xóa nhân viên', 'success');
      setConfirm({ open: false, id: null });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Xóa thất bại', 'error');
    }
  };

  const handleViewAttendance = (employee: EmployeeApi) => {
    navigate(`/admin/attendance/${employee.employee_code}`);
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Quản lý Nhân sự"
          subtitle="Quản lý danh sách nhân viên trong hệ thống (bảng employees)."
          right={
            <div style={{ display: 'flex', gap: '15px' }}>
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Tìm mã NV, tên, phòng ban..." 
                style={{ minWidth: 250 }} 
              />
              <Button variant="primary" onClick={() => setCreateModal(true)}>
                + Thêm nhân sự
              </Button>
            </div>
          }
        />
      </div>

      <div className="adminCol12">
        <Card>
          <Toolbar 
            left={<div style={{ fontWeight: 950, color: '#0f172a' }}>Danh sách nhân viên</div>} 
            right={<div style={{ color: '#64748b', fontWeight: 800 }}>{filtered.length} nhân sự</div>} 
          />

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>
          ) : filtered.length === 0 ? (
            <EmptyState 
              title="Không tìm thấy nhân viên" 
              subtitle="Hãy thử thay đổi từ khóa tìm kiếm." 
            />
          ) : (
            <table className="aTable">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Mã NV</th>
                  <th>Họ và tên</th>
                  <th>Chức vụ / Phòng ban</th>
                  <th style={{ textAlign: 'center' }}>Công hôm nay</th>
                  <th style={{ textAlign: 'right' }}>Lương hôm nay</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.employee_code}</td>
                    <td>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => handleViewAttendance(e)}
                        title="Xem chấm công hôm nay"
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                          {(e.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#3b82f6' }}>{e.full_name}</div>
                          {e.account_name && <div style={{ fontSize: '12px', color: '#64748b' }}>Account: {e.account_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{e.position || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{e.department || 'Chưa rõ'}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {(() => {
                        const att = attendanceData.find(a => a.employee_code === e.employee_code);
                        return att ? (
                          <div style={{ fontWeight: 600 }}>{att.total_hours}h</div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '13px' }}>Chưa chấm</span>
                        );
                      })()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(() => {
                        const att = attendanceData.find(a => a.employee_code === e.employee_code);
                        return att && att.daily_wage > 0 ? (
                          <div style={{ fontWeight: 700, color: '#10b981' }}>
                            {new Intl.NumberFormat('vi-VN').format(att.daily_wage)}đ
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        );
                      })()}
                    </td>
                    <td>
                      <Badge tone={e.status === 'active' ? 'green' : 'red'}>
                        {e.status === 'active' ? 'Đang làm việc' : 'Nghỉ việc'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="aRowActions">
                        <button className="aIconBtn" style={{ color: '#10b981' }} title="Xem công" onClick={() => handleViewAttendance(e)}>👁</button>
                        <button className="aIconBtn" title="Sửa" onClick={() => setEditModal({ open: true, employee: { ...e } })}>✎</button>
                        <button className="aIconBtn danger" title="Xóa" onClick={() => setConfirm({ open: true, id: e.id })}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        open={editModal.open}
        title="Chỉnh sửa nhân viên"
        onClose={() => setEditModal({ open: false, employee: null })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal({ open: false, employee: null })}>Hủy</Button>
            <Button variant="primary" onClick={handleUpdate} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </Button>
          </>
        }
      >
        {editModal.employee && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Họ và tên</label>
              <Input 
                value={editModal.employee.full_name} 
                onChange={val => setEditModal({ ...editModal, employee: { ...editModal.employee!, full_name: val.target.value } })}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Số điện thoại</label>
              <Input 
                value={editModal.employee.phone || ''} 
                onChange={val => setEditModal({ ...editModal, employee: { ...editModal.employee!, phone: val.target.value } })}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Chức vụ</label>
              <Input 
                value={editModal.employee.position || ''} 
                onChange={val => setEditModal({ ...editModal, employee: { ...editModal.employee!, position: val.target.value } })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Phòng ban</label>
              <Input 
                value={editModal.employee.department || ''} 
                onChange={val => setEditModal({ ...editModal, employee: { ...editModal.employee!, department: val.target.value } })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Trạng thái</label>
              <Select 
                value={editModal.employee.status} 
                onChange={e => setEditModal({ ...editModal, employee: { ...editModal.employee!, status: e.target.value as any } })}
              >
                <option value="active">Đang làm việc</option>
                <option value="inactive">Nghỉ việc</option>
              </Select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Lương tháng</label>
              <Input 
                type="number"
                value={editModal.employee.salary || 0} 
                onChange={val => setEditModal({ ...editModal, employee: { ...editModal.employee!, salary: Number(val.target.value) } })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Lương theo giờ</label>
              <Input 
                type="number"
                value={editModal.employee.hourly_rate || 0} 
                onChange={val => setEditModal({ ...editModal, employee: { ...editModal.employee!, hourly_rate: Number(val.target.value) } })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Ngày vào làm</label>
              <Input 
                type="date"
                value={editModal.employee.hire_date || ''} 
                onChange={val => setEditModal({ ...editModal, employee: { ...editModal.employee!, hire_date: val.target.value } })}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        open={createModal}
        title="Thêm nhân viên mới"
        onClose={() => setCreateModal(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreate} disabled={saving}>
              {saving ? 'Đang tạo...' : 'Tạo nhân viên'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Mã nhân viên <span style={{color:'red'}}>*</span></label>
            <Input 
              value={formData.employee_code} 
              onChange={e => setFormData({ ...formData, employee_code: e.target.value })} 
              placeholder="VD: NV001"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Họ và tên <span style={{color:'red'}}>*</span></label>
            <Input 
              value={formData.full_name} 
              onChange={e => setFormData({ ...formData, full_name: e.target.value })} 
              placeholder="Nhập họ tên đầy đủ"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Chức vụ</label>
            <Input 
              value={formData.position} 
              onChange={e => setFormData({ ...formData, position: e.target.value })} 
              placeholder="Kế toán, Pha chế..."
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Phòng ban</label>
            <Input 
              value={formData.department} 
              onChange={e => setFormData({ ...formData, department: e.target.value })} 
              placeholder="Hành chính, Bán hàng..."
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Số điện thoại <span style={{color:'red'}}>*</span></label>
            <Input 
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              placeholder="09xx.xxx.xxx"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Lương tháng</label>
            <Input 
              type="number"
              value={formData.salary} 
              onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })} 
              placeholder="7000000"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Lương theo giờ</label>
            <Input 
              type="number"
              value={formData.hourly_rate} 
              onChange={e => setFormData({ ...formData, hourly_rate: Number(e.target.value) })} 
              placeholder="25000"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Ngày vào làm</label>
            <Input 
              type="date"
              value={formData.hire_date} 
              onChange={val => setFormData({ ...formData, hire_date: val.target.value })} 
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={confirm.open}
        title="Xóa nhân sự?"
        onClose={() => setConfirm({ open: false, id: null })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm({ open: false, id: null })}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa vĩnh viễn</Button>
          </>
        }
      >
        Hành động này không thể hoàn tác. Mọi dữ liệu liên quan đến nhân viên này sẽ bị xóa khỏi hệ thống nhân sự.
      </Modal>
    </div>
  );
}
