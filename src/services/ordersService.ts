import API_BASE_URL from './config';

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface CreateOrderInput {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  note?: string;
  payment_method: string;
  items: OrderItemInput[];
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const API_BASE = `${API_BASE_URL}/orders.php`;

export const createOrder = async (orderData: CreateOrderInput): Promise<OrderResponse> => {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Lỗi khi đặt hàng');
  }

  return response.json();
};

export const fetchMyOrders = async (): Promise<OrderResponse> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Bạn cần đăng nhập để xem đơn hàng');

  const response = await fetch(API_BASE, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Lỗi khi tải danh sách đơn hàng');
  }

  return response.json();
};

export const fetchAllOrders = async (params?: { status?: string; search?: string }): Promise<OrderResponse> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Bạn cần đăng nhập với quyền Admin');

  let url = API_BASE;
  const query = new URLSearchParams();
  if (params?.status && params.status !== 'all') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);
  
  const queryString = query.toString();
  if (queryString) url += `?${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Lỗi khi tải danh sách đơn hàng Admin');
  }

  return response.json();
};

export const updateOrderStatus = async (id: string | number, status: string): Promise<OrderResponse> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Bạn cần đăng nhập với quyền Admin');

  // Đảm bảo gửi ID lên cả URL và Body để Backend dễ nhận diện
  const response = await fetch(`${API_BASE}?id=${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ id, status }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
  }

  return data;
};
