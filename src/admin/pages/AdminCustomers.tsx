import React, { useEffect, useState, useMemo } from 'react';
import { Badge, Button, Card, EmptyState, Input, Modal, PageHeader, Toolbar } from '../components/ui';
import { fetchUsers, deleteUserApi, updateUserRole, UserApi } from '../../services/usersService';
import { useToast } from '../../components/ToastContext';

export default function AdminCustomers(): React.ReactElement {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [editModal, setEditModal] = useState<{ open: boolean; user: UserApi | null }>({ open: false, user: null });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
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
    if (!q) return users;
    return users.filter(u => 
      (u.full_name?.toLowerCase().includes(q)) || 
      (u.username?.toLowerCase().includes(q)) || 
      (u.email?.toLowerCase().includes(q)) ||
      (u.phone?.toLowerCase().includes(q)) ||
      (u.role?.toLowerCase().includes(q))
    );
  }, [users, query]);

  const getAvatarColor = (str: string) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const idx = (str.length + str.charCodeAt(0)) % colors.length;
    return colors[idx];
  };

  const handleUpdate = async () => {
    if (!editModal.user) return;
    setSaving(true);
    try {
      await updateUserRole(editModal.user.id, editModal.user.role, editModal.user.status);
      showToast('Cập nhật trạng thái khách hàng thành công', 'success');
      setEditModal({ open: false, user: null });
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
      await deleteUserApi(confirm.id);
      showToast('Đã xóa khách hàng thành công', 'success');
      setConfirm({ open: false, id: null });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Xóa thất bại', 'error');
    }
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Quản lý Người dùng"
          subtitle="Quản lý danh sách tất cả người dùng (Admin, Khách hàng, Nhân viên) trên hệ thống."
          right={
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="aSearchInput">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Tìm tên, email, SĐT, vai trò..." 
                />
              </div>
            </div>
          }
        />
      </div>

      <div className="adminCol12">
        <Card>
          <Toolbar 
            left={<div style={{ fontWeight: 950, color: '#0f172a', fontSize: '1.1rem' }}>Danh sách người dùng</div>} 
            right={<div style={{ color: '#64748b', fontWeight: 800 }}>{filtered.length} tài khoản</div>} 
          />

          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
               <div className="aSpinner" style={{ margin: '0 auto 15px' }}></div>
               <div style={{ color: '#64748b' }}>Đang tải danh sách...</div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState 
              title="Không tìm thấy người dùng" 
              subtitle="Hãy thử thay đổi từ khóa tìm kiếm hoặc kiểm tra lại kết nối." 
            />
          ) : (
            <div className="aTableWrapper">
              <table className="aTable">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th>Người dùng</th>
                    <th>Liên hệ</th>
                    <th>Vai trò</th>
                    <th>Ngày đăng ký</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const name = c.full_name || c.username || 'N/A';
                    const avatarColor = getAvatarColor(name);
                    return (
                      <tr key={c.id}>
                        <td style={{ color: '#94a3b8', fontSize: '13px' }}>#{c.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {c.avatar ? (
                              <img 
                                src={c.avatar} 
                                alt={name}
                                style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '12px', 
                                backgroundColor: `${avatarColor}15`, 
                                color: avatarColor,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: '700',
                                fontSize: '16px'
                              }}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{name}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>@{c.username}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: '#334155' }}>{c.email}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{c.phone || '---'}</div>
                        </td>
                        <td>
                           <Badge tone={c.role === 'admin' ? 'blue' : 'yellow'}>
                            {c.role === 'admin' ? 'Quản trị' : 'Khách hàng'}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', color: '#475569' }}>
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '---'}
                          </div>
                        </td>
                        <td>
                          <Badge tone={c.status === 'active' ? 'green' : 'red'}>
                            {c.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="aRowActions">
                            <button className="aIconBtn" title="Sửa" onClick={() => setEditModal({ open: true, user: { ...c } })}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button className="aIconBtn danger" title="Xóa khách hàng" onClick={() => setConfirm({ open: true, id: c.id })}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={editModal.open}
        title="Chỉnh sửa trạng thái khách hàng"
        onClose={() => setEditModal({ open: false, user: null })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal({ open: false, user: null })}>Hủy</Button>
            <Button variant="primary" onClick={handleUpdate} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </Button>
          </>
        }
      >
        {editModal.user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Khách hàng</label>
              <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', fontWeight: 500 }}>
                {editModal.user.full_name || editModal.user.username}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Trạng thái tài khoản</label>
              <select 
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '14px' 
                }}
                value={editModal.user.status}
                onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user!, status: e.target.value as any } })}
              >
                <option value="active">Hoạt động (Active)</option>
                <option value="inactive">Khóa tài khoản (Inactive)</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={confirm.open}
        title="Xóa khách hàng?"
        onClose={() => setConfirm({ open: false, id: null })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm({ open: false, id: null })}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa vĩnh viễn</Button>
          </>
        }
      >
        Bạn có chắc chắn muốn xóa khách hàng này? Mọi thông tin đơn hàng và tài khoản sẽ bị ảnh hưởng. Hành động này không thể hoàn tác.
      </Modal>
    </div>
  );
}
