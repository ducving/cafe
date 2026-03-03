import React, { useMemo } from 'react';
import { Badge, Button, Card, PageHeader } from '../components/ui';

type OrderStatus = 'pending' | 'done' | 'cancelled';

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function Kpi({
  title,
  value,
  delta,
  tone = 'gray',
}: {
  title: React.ReactNode;
  value: React.ReactNode;
  delta: React.ReactNode;
  tone?: 'gray' | 'green' | 'yellow' | 'red';
}): React.ReactElement {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div
            style={{
              color: '#64748b',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: 11,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, fontWeight: 950, color: '#0f172a', marginTop: 6 }}>{value}</div>
        </div>
        <div>
          <Badge tone={tone}>{delta}</Badge>
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard(): React.ReactElement {
  const recentOrders = useMemo(
    () =>
      [
        { id: 'DH0012', customer: 'Nguyễn Văn A', total: 185000, status: 'pending' as const },
        { id: 'DH0011', customer: 'Trần Thị B', total: 320000, status: 'done' as const },
        { id: 'DH0010', customer: 'Lê Văn C', total: 95000, status: 'cancelled' as const },
      ] satisfies Array<{ id: string; customer: string; total: number; status: OrderStatus }>,
    []
  );

  const status = (s: OrderStatus) => {
    if (s === 'done') return <Badge tone="green">Hoàn tất</Badge>;
    if (s === 'cancelled') return <Badge tone="red">Hủy</Badge>;
    return <Badge tone="yellow">Chờ xử lý</Badge>;
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Dashboard"
          subtitle="Tổng quan nhanh về cửa hàng (dữ liệu demo, sẽ thay bằng API sau)."
          right={
            <>
              <Button variant="ghost" type="button">
                Xuất báo cáo
              </Button>
              <Button variant="primary" type="button">
                Tạo đơn mới
              </Button>
            </>
          }
        />
      </div>

      <div className="adminCol4">
        <Kpi title="Sản phẩm" value="128" delta="+6 tuần này" tone="green" />
      </div>
      <div className="adminCol4">
        <Kpi title="Đơn hàng hôm nay" value="32" delta="+12%" tone="green" />
      </div>
      <div className="adminCol4">
        <Kpi title="Doanh thu hôm nay" value={formatVnd(4250000)} delta="Ước tính" tone="gray" />
      </div>

      <div className="adminCol8">
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 950, color: '#0f172a' }}>Đơn hàng gần đây</div>
            <Button variant="ghost" size="sm" type="button">
              Xem tất cả
            </Button>
          </div>

          <table className="aTable">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 950 }}>#{o.id}</td>
                  <td style={{ color: '#334155' }}>{o.customer}</td>
                  <td style={{ fontWeight: 950 }}>{formatVnd(o.total)}</td>
                  <td>{status(o.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="adminCol4">
        <Card>
          <div style={{ fontWeight: 950, color: '#0f172a', marginBottom: 10 }}>Gợi ý vận hành</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ color: '#334155', fontWeight: 750 }}>Đơn chờ xử lý</div>
              <Badge tone="yellow">5</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ color: '#334155', fontWeight: 750 }}>Sản phẩm sắp hết</div>
              <Badge tone="red">3</Badge>
            </div>
            <div style={{ color: '#64748b', fontWeight: 650, lineHeight: 1.6 }}>
              Khi bạn gửi endpoint API, mình sẽ thay dữ liệu demo bằng fetch thật (list/add/edit/delete) và thêm
              loading/error state.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

