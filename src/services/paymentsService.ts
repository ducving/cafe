import API_BASE_URL from './config';

export interface PaymentRecord {
  id: number | string;
  total_amount: number;
  status: string;
  created_at: string;
  // Các field khác nếu có từ API
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: PaymentRecord[];
}

const PAYMENTS_API = `${API_BASE_URL}/payments.php`;

/**
 * Lấy lịch sử đơn hàng/thanh toán của người dùng hiện tại
 */
export const fetchPaymentsHistory = async (): Promise<PaymentResponse> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Bạn cần đăng nhập để xem lịch sử đơn hàng');

  const response = await fetch(PAYMENTS_API, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Lỗi khi tải lịch sử đơn hàng');
  }

  return response.json();
};
