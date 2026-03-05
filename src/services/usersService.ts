import API_BASE_URL from './config';

export interface UserApi {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  name?: string;
  role: 'admin' | 'user' | 'staff';
  status: 'active' | 'inactive';
  avatar?: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

export interface EmployeeApi {
  id: number;
  user_id?: number | null;
  employee_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  salary?: number;
  hourly_rate?: number;
  hire_date?: string;
  status: 'active' | 'inactive';
  account_name?: string; // Tên tài khoản liên kết (từ bảng users)
  created_at?: string;
}

async function safeReadJson(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return { message: text };
}

export const fetchUsers = async (): Promise<UserApi[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Không thể tải danh sách người dùng');
  // API returns { success: true, data: [...] } or just [...]
  return data.data || data;
};

export const updateUserRole = async (id: number, role: string, status: string): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST', // Assuming PUT logic or POST update based on your API pattern
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, role, status }),
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Cập nhật người dùng thất bại');
  return data;
};

export const deleteUserApi = async (id: number): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Xóa người dùng thất bại');
  return data;
};

export const createUserApi = async (userData: any): Promise<any> => {
  // Sử dụng API register.php để tạo tài khoản mới
  const response = await fetch(`${API_BASE_URL}/register.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: userData.full_name || userData.username, // Map sang 'name' cho backend
      email: userData.email,
      password: userData.password,
      role: userData.role // Gửi kèm role (staff/admin/user)
    }),
  });
  
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Thêm người dùng thất bại');
  return data;
};
// --- Employee Services ---

export const fetchEmployees = async (page = 1, limit = 10): Promise<EmployeeApi[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/employees.php?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Không thể tải danh sách nhân viên');
  return data.data || data;
};

export const createEmployeeApi = async (employeeData: Partial<EmployeeApi>): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/employees.php`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Thêm nhân viên thất bại');
  return data;
};

export const updateEmployeeApi = async (id: number, employeeData: Partial<EmployeeApi>): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/employees.php?id=${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Cập nhật nhân viên thất bại');
  return data;
};

export const deleteEmployeeApi = async (id: number): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/employees.php?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await safeReadJson(response);
  if (!response.ok) throw new Error(data.message || 'Xóa nhân viên thất bại');
  return data;
};
