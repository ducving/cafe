// Use CRA proxy in dev (package.json -> "proxy": "http://localhost")
// so requests to "/doan/api" go to "http://localhost/doan/api" and avoid CORS.
const API_BASE_URL = '/doan/api';

async function safeReadJson(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return { message: text };
}

export const loginAPI = async (identifier, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Many backends expect "email", others expect "username".
        // Send both to be compatible.
        email: identifier,
        username: identifier,
        password,
      }),
    });

    const data = await safeReadJson(response);
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Đăng nhập thất bại');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi đăng nhập'
    };
  }
};

export const registerAPI = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await safeReadJson(response);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Đăng ký thất bại');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi đăng ký'
    };
  }
};

export const updateProfileAPI = async (payload) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Bạn chưa đăng nhập');

    let method = 'POST';
    let body;
    let headers = {
      'Authorization': `Bearer ${token}`
    };

    const url = `${API_BASE_URL}/users`;

    if (payload instanceof FormData) {
      body = payload;
      // Fetch will automatically set Content-Type to multipart/form-data
    } else {
      body = JSON.stringify(payload);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body,
    });

    const data = await safeReadJson(response);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Cập nhật thất bại');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi cập nhật profile'
    };
  }
};

export const fetchProfileAPI = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Bạn chưa đăng nhập');

    // Gọi API với query param id
    const response = await fetch(`${API_BASE_URL}/users?id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await safeReadJson(response);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Không thể lấy thông tin người dùng');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi tải profile'
    };
  }
};
