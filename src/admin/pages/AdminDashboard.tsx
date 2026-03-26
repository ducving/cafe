import React, { useEffect, useState, useMemo } from 'react';
import { Badge, Button, Card } from '../components/ui';
import { fetchDashboardStats } from '../../services/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

const DASHBOARD_CHART_DATA = [
  { name: 'Thứ 2', revenue: 1200000, orders: 15 },
  { name: 'Thứ 3', revenue: 1800000, orders: 22 },
  { name: 'Thứ 4', revenue: 1400000, orders: 18 },
  { name: 'Thứ 5', revenue: 2100000, orders: 28 },
  { name: 'Thứ 6', revenue: 2800000, orders: 35 },
  { name: 'Thứ 7', revenue: 4200000, orders: 52 },
  { name: 'Chủ nhật', revenue: 3800000, orders: 48 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function Kpi({
  title,
  value,
  delta,
  isUp = true,
  icon: Icon,
  color = '#3b82f6',
}: {
  title: string;
  value: React.ReactNode;
  delta: string;
  isUp?: boolean;
  icon: any;
  color?: string;
}): React.ReactElement {
  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{value}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: isUp ? '#10b981' : '#ef4444' }}>
            {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {delta}
            <span style={{ color: '#94a3b8', fontWeight: 500, marginLeft: '4px' }}>vs hôm qua</span>
          </div>
        </div>
        <div style={{ 
          padding: '12px', 
          borderRadius: '12px', 
          backgroundColor: `${color}15`, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard(): React.ReactElement {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7days');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const result = await fetchDashboardStats(period);
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [period]); // Reload when period changes


  function getStatusBadge(s: string): React.ReactElement {
    switch (s) {
      case 'completed': return <Badge tone="green">Thành công</Badge>;
      case 'cancelled': return <Badge tone="red">Đã hủy</Badge>;
      case 'processing': return <Badge tone="blue">Đang pha chế</Badge>;
      default: return <Badge tone="yellow">Chờ xác nhận</Badge>;
    }
  }

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Đang chuẩn bị dữ liệu thực tế...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adminGrid">
      {/* Header Section */}
      <div className="adminCol12">
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                Tổng quan Halu Cafe
              </h1>
              <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 500 }}>Chào mừng trở lại! Hôm nay quán đang kinh doanh khá ổn định.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="ghost" icon={<Download size={18} />}>Tải báo cáo</Button>
              <Button variant="primary" icon={<Plus size={18} />}>Đơn mới</Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="adminCol3" style={{ gridColumn: 'span 3' }}>
        <Kpi 
          title="Doanh thu tổng" 
          value={formatVnd(stats.totalRevenue)} 
          delta={`${stats.revenueDelta}%`} 
          isUp={stats.revenueDelta >= 0} 
          icon={DollarSign} 
          color="#3b82f6" 
        />
      </div>
      <div className="adminCol3" style={{ gridColumn: 'span 3' }}>
        <Kpi title="Tổng đơn hàng" value={stats.totalOrders} delta="Mới" icon={ShoppingBag} color="#10b981" />
      </div>
      <div className="adminCol3" style={{ gridColumn: 'span 3' }}>
        <Kpi title="Cần xử lý" value={stats.pendingOrders} delta="Ngay" isUp={false} icon={Clock} color="#f59e0b" />
      </div>
      <div className="adminCol3" style={{ gridColumn: 'span 3' }}>
        <Kpi title="Tổng sản phẩm" value={stats.totalProducts} delta="Menu" icon={Package} color="#8b5cf6" />
      </div>

      {/* Main Chart */}
      <div className="adminCol8">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Doanh thu {period === '7days' ? '7 ngày qua' : '30 ngày qua'}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Dữ liệu thực tế từ hệ thống</p>
            </div>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
            </select>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val: number) => [formatVnd(val), 'Doanh thu']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Product Chart */}
      <div className="adminCol4">
        <Card>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Phân bổ danh mục</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> {stats.outOfStockCount} sản phẩm hết hàng
              </span>
              <Button size="sm" variant="ghost">Quản lý</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <div className="adminCol12">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Lịch sử đơn hàng gần đây</h3>
            <Button variant="ghost" size="sm">Xem tất cả</Button>
          </div>
          <table className="aTable">
            <thead>
              <tr>
                <th style={{ borderRadius: '12px 0 0 12px' }}>Đơn hàng</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng thanh toán</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'right', borderRadius: '0 12px 12px 0' }}></th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px', 
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b'
                      }}>
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px' }}>#{o.id}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{o.payment_method || 'Tiền mặt'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{o.full_name || 'Khách vãng lai'}</td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{formatVnd(parseFloat(o.total_amount) || 0)}</td>
                  <td style={{ textAlign: 'center' }}>{getStatusBadge(o.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="aIconBtn">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}


