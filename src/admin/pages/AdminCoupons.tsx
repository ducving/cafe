import React, { useEffect, useState, useMemo } from 'react';
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, Toolbar } from '../components/ui';
import { fetchCoupons, createCoupon, deleteCoupon, CouponApi } from '../../services/couponsService';
import { useToast } from '../../components/ToastContext';

export default function AdminCoupons(): React.ReactElement {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<CouponApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const [form, setForm] = useState<Omit<CouponApi, 'id'>>({
    code: '',
    type: 'percent',
    value: 10,
    min_order_value: 0,
    status: 'active',
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // If fetching fails it might be because the table doesn't exist yet, but we'll show toast
      showToast(err.message || 'Lỗi tải danh sách mã giảm giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    setSaving(true);
    try {
      await createCoupon(form);
      showToast('Thêm mã giảm giá thành công', 'success');
      setIsAddOpen(false);
      setForm({ code: '', type: 'percent', value: 10, min_order_value: 0, status: 'active' });
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || 'Thêm mã giảm giá thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm.id) return;
    try {
      await deleteCoupon(confirm.id);
      showToast('Đã xóa mã giảm giá', 'success');
      setConfirm({ open: false, id: null });
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || 'Xóa mã giảm giá thất bại', 'error');
    }
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader 
          title="Mã giảm giá" 
          subtitle="Tạo các chương trình khuyến mãi và ưu đãi cho khách hàng."
          right={
            <Button variant="primary" onClick={() => setIsAddOpen(true)}>
              + Tạo mã mới
            </Button>
          }
        />
      </div>

      <div className="adminCol12">
        <Card>
          <Toolbar 
            left={<div style={{ fontWeight: 950, color: '#0f172a' }}>Danh sách Coupon</div>} 
            right={<div style={{ color: '#64748b', fontWeight: 800 }}>{coupons.length} mục</div>} 
          />

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>
          ) : coupons.length === 0 ? (
            <EmptyState 
              title="Chưa có mã giảm giá nào" 
              subtitle="Tạo mã đầu tiên để bắt đầu chiến dịch khuyến mãi."
              action={
                <Button variant="primary" onClick={() => setIsAddOpen(true)}>Tạo ngay</Button>
              }
            />
          ) : (
            <table className="aTable">
              <thead>
                <tr>
                  <th>Mã Code</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 800, color: 'var(--admin-primary)', letterSpacing: '1px' }}>{c.code}</td>
                    <td>{c.type === 'percent' ? 'Giảm %' : 'Giảm số tiền cố định'}</td>
                    <td style={{ fontWeight: 700 }}>
                      {c.type === 'percent' ? `${c.value}%` : `${new Intl.NumberFormat('vi-VN').format(c.value)}đ`}
                    </td>
                    <td>{new Intl.NumberFormat('vi-VN').format(c.min_order_value)}đ</td>
                    <td>
                      <Badge tone={c.status === 'active' ? 'green' : 'gray'}>
                        {c.status === 'active' ? 'Đang bật' : 'Đã tắt'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="aRowActions">
                        <button className="aIconBtn danger" title="Xóa" onClick={() => setConfirm({ open: true, id: c.id })}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Add Modal */}
      <Modal
        open={isAddOpen}
        title="Tạo mã giảm giá mới"
        onClose={() => setIsAddOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu mã'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: '15px' }}>
          <Field label="Mã giảm giá" hint="VD: GIAM20, PHUTHUY10 (Không dấu, không khoảng trắng)">
            <Input 
              value={form.code} 
              onChange={e => setForm({...form, code: e.target.value.toUpperCase().replace(/\s/g, '')})} 
              placeholder="VD: HALUCAFE"
            />
          </Field>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <Field label="Loại giảm">
              <Select 
                value={form.type} 
                onChange={e => setForm({...form, type: e.target.value as any})}
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </Select>
            </Field>
            <Field label="Giá trị giảm">
              <Input 
                type="number" 
                value={form.value} 
                onChange={e => setForm({...form, value: Number(e.target.value)})} 
              />
            </Field>
          </div>

          <Field label="Đơn hàng tối thiểu (đ)">
            <Input 
              type="number" 
              value={form.min_order_value} 
              onChange={e => setForm({...form, min_order_value: Number(e.target.value)})} 
            />
          </Field>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={confirm.open}
        title="Xóa mã giảm giá?"
        onClose={() => setConfirm({ open: false, id: null })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm({ open: false, id: null })}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa</Button>
          </>
        }
      >
        Hành động này không thể hoàn tác. Khách hàng sẽ không thể sử dụng mã này nữa.
      </Modal>
    </div>
  );
}
