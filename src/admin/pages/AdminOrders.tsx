import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Input, Modal, PageHeader, Select, Toolbar } from '../components/ui';
import { fetchAllOrders, updateOrderStatus } from '../../services/ordersService';
import { useToast } from '../../components/ToastContext';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

type Order = {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function statusBadge(status: OrderStatus): React.ReactElement {
  switch (status) {
    case 'completed': return <Badge tone="green">Hoàn tất</Badge>;
    case 'cancelled': return <Badge tone="red">Đã hủy</Badge>;
    case 'processing': return <Badge tone="blue">Đang xử lý</Badge>;
    default: return <Badge tone="yellow">Chờ xử lý</Badge>;
  }
}

export default function AdminOrders(): React.ReactElement {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [confirm, setConfirm] = useState<{ open: boolean; id: string | null; next: OrderStatus | null }>({
    open: false,
    id: null,
    next: null,
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAllOrders({
        status: statusFilter,
        search: query
      });
      const orderList = response.data || (response as any).orders;
      if (response.success && Array.isArray(orderList)) {
        const mappedOrders: Order[] = orderList.map((item: any) => ({
          id: String(item.id),
          customer: item.full_name || 'Khách hàng',
          total: parseFloat(item.total_amount) || 0,
          status: item.status as OrderStatus,
          createdAt: item.created_at || item.createdAt || '',
        }));
        setOrders(mappedOrders);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [loadOrders]);

  const updateStatus = async (id: string, next: OrderStatus) => {
    try {
      const response = await updateOrderStatus(id, next);
      if (response.success) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
        showToast('Cập nhật trạng thái thành công!', 'success');
      } else {
        showToast(response.message || 'Cập nhật trạng thái thất bại', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ', 'error');
    }
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Đơn hàng"
          subtitle="Theo dõi & cập nhật trạng thái đơn hàng từ hệ thống."
          right={
            <>
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Tìm mã, tên, SĐT..." 
                style={{ width: 260 }} 
              />
              <Select style={{ width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Đã hoàn tất</option>
                <option value="cancelled">Đã hủy</option>
              </Select>
            </>
          }
        />
      </div>

      <div className="adminCol12">
        <Card>
          <Toolbar
            left={<div style={{ fontWeight: 950, color: '#0f172a' }}>Danh sách đơn hàng</div>}
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {loading && <span style={{ fontSize: '13px', color: '#64748b' }}>Đang tải...</span>}
                <div style={{ color: '#64748b', fontWeight: 800 }}>{orders.length} đơn</div>
              </div>
            }
          />

          {error && (
            <div style={{ padding: '20px', color: '#dc2626', textAlign: 'center', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <table className="aTable">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Thời gian</th>
                <th>Tổng cộng</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác xử lý</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 950 }}>#{o.id}</td>
                  <td style={{ color: '#334155' }}>{o.customer}</td>
                  <td style={{ color: '#64748b' }}>{o.createdAt}</td>
                  <td style={{ fontWeight: 950 }}>{formatVnd(o.total)}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="aRowActions">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirm({ open: true, id: o.id, next: 'processing' })}
                        disabled={o.status !== 'pending'}
                      >
                        Xử lý
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setConfirm({ open: true, id: o.id, next: 'completed' })}
                        disabled={o.status === 'completed' || o.status === 'cancelled'}
                      >
                        Hoàn tất
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setConfirm({ open: true, id: o.id, next: 'cancelled' })}
                        disabled={o.status === 'completed' || o.status === 'cancelled'}
                      >
                        Hủy
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, color: '#64748b', fontWeight: 600, textAlign: 'center' }}>
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <Modal
        open={confirm.open}
        title="Xác nhận thay đổi"
        onClose={() => setConfirm({ open: false, id: null, next: null })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm({ open: false, id: null, next: null })}>
              Quay lại
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!confirm.id || !confirm.next) return;
                updateStatus(confirm.id, confirm.next);
                setConfirm({ open: false, id: null, next: null });
              }}
            >
              Cập nhật ngay
            </Button>
          </>
        }
      >
        Hệ thống sẽ chuyển đơn <b>#{confirm.id}</b> sang trạng thái 
        <b style={{ color: '#dc2626' }}> {confirm.next === 'processing' ? 'Đang xử lý' : confirm.next === 'completed' ? 'Hoàn tất' : 'Hủy đơn'}</b>.
        Bạn có chắc chắn?
      </Modal>
    </div>
  );
}

