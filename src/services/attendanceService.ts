import API_BASE_URL from './config';

export interface AttendanceData {
  id?: number;
  employee_id: number;
  check_in: string | null;
  check_out: string | null;
  date: string;
  status: string;
}

async function safeReadJson(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return { message: text };
}

export const fetchTodayAttendance = async (employeeCode?: string): Promise<AttendanceData | null> => {
  const token = localStorage.getItem('token');
  let url = `${API_BASE_URL}/attendance.php`;
  if (employeeCode) url += `?employee_code=${employeeCode}`;
  
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(url, { headers });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Lỗi tải thông tin chấm công');
  return data.data;
};

export const fetchEmployeeHistory = async (employeeCode: string, startDate?: string, endDate?: string): Promise<any[]> => {
  const token = localStorage.getItem('token');
  let url = `${API_BASE_URL}/attendance.php?employee_code=${employeeCode}&type=history&limit=50`;
  
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;
  
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(url, { headers });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Lỗi tải lịch sử chấm công');
  return data.data || [];
};

export const checkInApi = async (employeeCode: string): Promise<any> => {
  const token = localStorage.getItem('token');
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE_URL}/attendance.php`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'check_in', employee_code: employeeCode })
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Check-in thất bại');
  return data;
};

export const checkOutApi = async (employeeCode: string): Promise<any> => {
  const token = localStorage.getItem('token');
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE_URL}/attendance.php`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'check_out', employee_code: employeeCode })
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Check-out thất bại');
  return data;
};

export const fetchAllAttendance = async (date: string): Promise<any[]> => {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}/attendance.php?date=${date}`;
  
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(url, { headers });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Lỗi tải danh sách chấm công');
  return data.data || [];
};
