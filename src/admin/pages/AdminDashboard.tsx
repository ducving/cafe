import React, { useEffect, useState, useMemo } from 'react';
import { Badge, Button, Card, PageHeader } from '../components/ui';
import { fetchAllOrders } from '../../services/ordersService';
import { fetchProducts } from '../../services/productsService';

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function Kpi({
  title,
  value,
  delta,
  isUp = true,
  tone = 'gray',
}: {
  title: string;
  value: React.ReactNode;
  delta: string;
  isUp?: boolean;
  tone?: 'gray' | 'green' | 'yellow' | 'red';
}): React.ReactElement {
  return (
    <div className="adminCard">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="adminMuted" style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </div>
        <div className="kpiValue">{value}</div>
        <div className={`kpiDelta ${isUp ? 'up' : 'down'}`}>
          {isUp ? '↑' : '↓'} {delta} <span style={{ color: '#94a3b8', fontWeight: 500, marginLeft: '4px' }}>vs tháng trước</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard(): React.ReactElement {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetchAllOrders(),
          fetchProducts()
        ]);
        
        if (ordersRes.success && Array.isArray(ordersRes.data)) {
          setOrders(ordersRes.data);
        }
        
        if (Array.isArray(productsRes)) {
          setProducts(productsRes);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
    
    const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const outOfStockCount = products.filter(p => p.status === 'inactive' || (p.stock_quantity !== undefined && p.stock_quantity <= 0)).length;
    
    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingCount,
      totalProducts: products.length,
      outOfStockCount
    };
  }, [orders, products]);

  function getStatusBadge(s: string): React.ReactElement {
    switch (s) {
      case 'completed': return <span className="aBadge green">Hoàn tất</span>;
      case 'cancelled': return <span className="aBadge red">Đã hủy</span>;
      case 'processing': return <span className="aBadge blue">Đang xử lý</span>;
      default: return <span className="aBadge yellow">Đang chờ</span>;
    }
  }

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="adminH1">Chào buổi sáng, Admin!</h1>
            <p className="adminMuted">Đây là những gì đang diễn ra với cửa hàng của bạn hôm nay.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="adminBtn ghost">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Xuất báo cáo
            </button>
            <button className="adminBtn primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Tạo đơn mới
            </button>
          </div>
        </div>
      </div>

      <div className="adminCol4">
        <Kpi title="Tổng sản phẩm" value={stats.totalProducts} delta="12%" isUp={true} tone="green" />
      </div>
      <div className="adminCol4">
        <Kpi title="Đơn hàng" value={stats.totalOrders} delta="8%" isUp={true} tone="green" />
      </div>
      <div className="adminCol4">
        <Kpi title="Doanh thu" value={formatVnd(stats.totalRevenue)} delta="3%" isUp={true} tone="green" />
      </div>

      <div className="adminCol8">
        <div className="adminCard">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Đơn hàng gần đây</h3>
            <button className="adminBtn ghost" style={{ padding: '8px 16px' }}>Xem tất cả</button>
          </div>

          <table className="aTable">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: 'var(--admin-primary)' }}>#{o.id}</td>
                  <td style={{ fontWeight: 600 }}>{o.full_name || 'Khách hàng'}</td>
                  <td style={{ fontWeight: 700 }}>{formatVnd(parseFloat(o.total_amount) || 0)}</td>
                  <td>{getStatusBadge(o.status)}</td>
                </tr>
              ))}
              {!loading && recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Chưa có đơn hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="adminCol4">
        <div className="adminCard">
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700 }}>Vận hành</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Đơn chờ xử lý</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{stats.pendingCount < 10 ? `0${stats.pendingCount}` : stats.pendingCount}</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#fef9c3', borderRadius: '10px', color: '#854d0e' }}>⏳</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Sản phẩm hết hàng</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{stats.outOfStockCount < 10 ? `0${stats.outOfStockCount}` : stats.outOfStockCount}</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#fee2e2', borderRadius: '10px', color: '#991b1b' }}>⚠️</div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>
                * Hệ thống sẽ tự động cập nhật dữ liệu thực tế sau khi kết nối với API backend của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


