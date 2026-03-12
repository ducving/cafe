import API_BASE_URL from './config';

export interface UserVoucherData {
  id: number;
  user_id: number;
  voucher_id: number;
  is_used: number;
  used_at: string | null;
  created_at: string;
  code: string;
  discount_amount: string;
  discount_type: 'fixed' | 'percent';
  expiry_date: string;
}

export const fetchUserVouchers = async (userId: number, isUsed: number | null = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized');

    let url = `${API_BASE_URL}/user_vouchers.php?user_id=${userId}`;
    if (isUsed !== null) {
      url += `&is_used=${isUsed}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      return { success: true, data: data.data };
    }
    return { success: false, error: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
