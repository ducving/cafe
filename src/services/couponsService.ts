import API_BASE_URL from './config';

export interface CouponApi {
  id: number;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  min_order_value: number;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'inactive';
}

async function safeReadJson(response: Response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return { message: text };
}

export const fetchCoupons = async (): Promise<CouponApi[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Không thể tải danh sách mã giảm giá');
  return data.data || data;
};

export const createCoupon = async (coupon: Omit<CouponApi, 'id'>): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(coupon),
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Thêm mã giảm giá thất bại');
  return data;
};

export const deleteCoupon = async (id: number): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/coupons?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Xóa mã giảm giá thất bại');
  return data;
};
