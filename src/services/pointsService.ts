import API_BASE_URL from './config';

const API_BASE = `${API_BASE_URL}/points.php`;

function getToken() {
  return localStorage.getItem('token');
}

export interface PointsData {
  success: boolean;
  points: number;
  total_earned: number;
  total_spent: number;
  rank: { name: string; color: string; min: number };
  earn_rate: number;
  redeem_rate: number;
  history: PointTransaction[];
}

export interface PointTransaction {
  id: number;
  user_id: number;
  order_id: number | null;
  type: 'earn' | 'redeem' | 'refund';
  points: number;
  note: string;
  created_at: string;
}

export interface PointsCalculation {
  success: boolean;
  current_points: number;
  use_points: number;
  discount: number;
  final_amount: number;
  will_earn: number;
}

/** Lấy điểm hiện tại + lịch sử */
export const fetchPoints = async (): Promise<PointsData> => {
  const token = getToken();
  if (!token) throw new Error('Bạn cần đăng nhập');

  const res = await fetch(API_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

/** Tính toán giảm giá khi dùng điểm */
export const calculatePoints = async (
  amount: number,
  use_points: number
): Promise<PointsCalculation> => {
  const token = getToken();
  if (!token) throw new Error('Bạn cần đăng nhập');

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'calculate', amount, use_points }),
  });
  return res.json();
};
